
import { useEffect, useState } from "react";
import { JournalEntryForm } from "@/components/JournalEntryForm";
import { JournalEntryCard } from "@/components/JournalEntryCard";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, subMonths } from "date-fns";
import { mapDatabaseEntryToJournalEntry } from "@/types/journal";
import { Button } from "@/components/ui/button";
import { RefreshCw, Calendar, Search, Flame, Trophy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { UserStreak, calculateStreakAndXP } from "@/types/streaks";

const Journal = () => {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const userId = session?.user.id;
  const today = format(new Date(), "yyyy-MM-dd");
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<Date | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    document.title = "Journal | Daily Driver";
  }, []);

  // Fetch today's entry for the form
  const { data: todayEntry, isLoading: isTodayLoading, refetch: refetchToday } = useQuery({
    queryKey: ["journal-entry", today],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", userId)
        .eq("date", today)
        .maybeSingle();
      
      if (error && error.code !== "PGRST116") {
        console.error("Error fetching journal entry:", error);
        throw error;
      }
      
      return data ? mapDatabaseEntryToJournalEntry(data) : null;
    },
    enabled: !!userId,
  });

  // Fetch all journal entries
  const { data: allEntries, isLoading: isEntriesLoading, refetch: refetchAll } = useQuery({
    queryKey: ["journal-entries", userId, searchTerm, dateRange, page],
    queryFn: async () => {
      if (!userId) return { entries: [], count: 0 };
      
      let query = supabase
        .from("journal_entries")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .order("date", { ascending: false });
      
      // Apply search term filter
      if (searchTerm) {
        query = query.or(
          `intentions.ilike.%${searchTerm}%,reflection.ilike.%${searchTerm}%,challenges.ilike.%${searchTerm}%,gratitude.ilike.%${searchTerm}%`
        );
      }
      
      // Apply date filter
      if (dateRange) {
        const formattedDate = format(dateRange, "yyyy-MM-dd");
        query = query.eq("date", formattedDate);
      }
      
      // Apply pagination
      query = query.range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);
      
      const { data, error, count } = await query;
      
      if (error) {
        console.error("Error fetching journal entries:", error);
        throw error;
      }
      
      return { 
        entries: data.map(mapDatabaseEntryToJournalEntry),
        count: count || 0
      };
    },
    enabled: !!userId,
  });

  // Fetch user streak data
  const { data: streakData } = useQuery({
    queryKey: ["journal-streaks", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from("journal_entries")
        .select("date")
        .eq("user_id", userId)
        .order("date", { ascending: false });
      
      if (error) {
        console.error("Error fetching streak data:", error);
        throw error;
      }
      
      return calculateStreakAndXP(data || []);
    },
    enabled: !!userId,
  });

  const handleRefresh = async () => {
    await Promise.all([refetchToday(), refetchAll()]);
  };

  const handleEditEntry = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Refresh the data to ensure we have the latest version
    queryClient.invalidateQueries({ queryKey: ["journal-entry", today] });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset pagination when search changes
  };

  const handleDateSelect = (date: Date | undefined) => {
    setDateRange(date);
    setPage(1); // Reset pagination when date filter changes
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  useEffect(() => {
    // Check if we have more pages to load
    if (allEntries) {
      setHasMore(allEntries.count > page * ITEMS_PER_PAGE);
    }
  }, [allEntries, page]);

  const renderStreakInfo = () => {
    if (!streakData) return null;
    
    return (
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Flame className="h-4 w-4 text-orange-500 mr-2" />
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">{streakData.current_streak}</span>
              <span className="ml-2 text-muted-foreground">days</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Trophy className="h-4 w-4 text-yellow-500 mr-2" />
              Longest Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">{streakData.longest_streak}</span>
              <span className="ml-2 text-muted-foreground">days</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <svg className="h-4 w-4 text-purple-500 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
              </svg>
              Experience Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">{streakData.xp_points}</span>
              <span className="ml-2 text-muted-foreground">XP</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="container py-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-blue-700 mb-2">Daily Journal</h1>
          <p className="text-muted-foreground">
            Reflect on your day, capture your thoughts, and track your progress.
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {renderStreakInfo()}

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search journal entries..."
            className="pl-9"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {dateRange ? format(dateRange, "PPP") : "Filter by date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <CalendarComponent
              mode="single"
              selected={dateRange}
              onSelect={handleDateSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        
        {dateRange && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setDateRange(undefined)}
          >
            Clear filter
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          {isTodayLoading ? (
            <Card>
              <CardHeader>
                <CardTitle>Today's Journal</CardTitle>
              </CardHeader>
              <CardContent className="h-64 animate-pulse bg-gray-200 rounded-md"></CardContent>
            </Card>
          ) : isEditing && todayEntry ? (
            <JournalEntryForm 
              existingEntry={todayEntry} 
              onCancel={handleCancelEdit} 
            />
          ) : todayEntry ? (
            <JournalEntryCard 
              entry={todayEntry} 
              onEdit={handleEditEntry} 
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Today's Journal</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  You haven't created a journal entry for today yet.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div>
          {!isEditing && !todayEntry && <JournalEntryForm />}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-6">Journal History</h2>
        
        {isEntriesLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="h-32 mt-6 animate-pulse bg-gray-200 rounded-md"></CardContent>
              </Card>
            ))}
          </div>
        ) : allEntries?.entries.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No journal entries found.</p>
              {(searchTerm || dateRange) && (
                <Button 
                  variant="link" 
                  onClick={() => {
                    setSearchTerm("");
                    setDateRange(undefined);
                  }}
                >
                  Clear filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {allEntries?.entries.map(entry => (
              <JournalEntryCard 
                key={entry.id} 
                entry={entry} 
                onEdit={entry.date === today ? handleEditEntry : undefined} 
              />
            ))}
            
            {hasMore && (
              <div className="flex justify-center mt-6">
                <Button onClick={handleLoadMore} variant="outline">
                  Load More
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Journal;
