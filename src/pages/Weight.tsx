import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { fetchWeightEntries, addWeightEntry, updateWeightEntry, deleteWeightEntry } from "@/services/weight";
import { WeightEntry } from "@/types/weight";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";

const Weight = () => {
  const { session } = useAuth();
  const userId = session?.user.id;
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState("30days");
  const [newWeight, setNewWeight] = useState("");
  const [bodyFeeling, setBodyFeeling] = useState("");
  const [feelingNote, setFeelingNote] = useState("");

  // Fetch weight entries
  const { data: entries = [], refetch } = useQuery({
    queryKey: ["weight-entries", userId],
    queryFn: () => fetchWeightEntries(userId!),
    enabled: !!userId,
  });

  // Sort entries by date
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  // Calculate stats
  const calculateStats = (entries: WeightEntry[]) => {
    if (entries.length === 0) {
      return { currentWeight: 0, weightLost: 0, averageWeeklyLoss: 0 };
    }
    
    const currentWeight = entries[entries.length - 1].weight;
    let weightLost = 0;
    
    if (entries.length > 1) {
      const firstWeight = entries[0].weight;
      weightLost = Math.max(0, firstWeight - currentWeight);
    }

    // Calculate average weekly loss if we have enough data
    let averageWeeklyLoss = 0;
    if (entries.length > 2) {
      const firstDate = new Date(entries[0].created_at);
      const lastDate = new Date(entries[entries.length - 1].created_at);
      const weeksDiff = Math.max(1, Math.round((lastDate.getTime() - firstDate.getTime()) / (7 * 24 * 60 * 60 * 1000)));
      averageWeeklyLoss = weightLost / weeksDiff;
    }
    
    return { currentWeight, weightLost, averageWeeklyLoss };
  };

  const stats = calculateStats(sortedEntries);

  // Filter entries based on selected time range
  const filterEntries = (entries: WeightEntry[], range: string) => {
    const now = new Date();
    const msInDay = 24 * 60 * 60 * 1000;
    
    switch(range) {
      case "7days":
        return entries.filter(entry => 
          new Date(entry.created_at).getTime() > now.getTime() - (7 * msInDay));
      case "30days":
        return entries.filter(entry => 
          new Date(entry.created_at).getTime() > now.getTime() - (30 * msInDay));
      case "90days":
        return entries.filter(entry => 
          new Date(entry.created_at).getTime() > now.getTime() - (90 * msInDay));
      case "all":
      default:
        return entries;
    }
  };

  // Format data for chart
  const chartData = filterEntries(sortedEntries, timeRange).map(entry => ({
    date: format(new Date(entry.created_at), 'MMM dd'),
    weight: entry.weight,
  }));

  // Handle adding new weight entry
  const handleAddWeight = async () => {
    if (!userId || !newWeight) return;

    const weight = parseFloat(newWeight);
    if (isNaN(weight)) {
      toast({
        title: "Invalid weight",
        description: "Please enter a valid number",
        variant: "destructive",
      });
      return;
    }

    try {
      await addWeightEntry(userId, { 
        weight,
        body_feeling: bodyFeeling || null,
        feeling_note: feelingNote || null
      });
      setNewWeight("");
      setBodyFeeling("");
      setFeelingNote("");
      toast({
        title: "Weight added",
        description: "Your weight has been recorded successfully",
      });
      refetch();
    } catch (error) {
      console.error("Error adding weight entry:", error);
      toast({
        title: "Error",
        description: "Failed to add weight entry",
        variant: "destructive",
      });
    }
  };

  // Handle deleting a weight entry
  const handleDeleteEntry = async (entryId: string) => {
    try {
      await deleteWeightEntry(entryId);
      toast({
        title: "Entry deleted",
        description: "Weight entry has been deleted successfully",
      });
      refetch();
    } catch (error) {
      console.error("Error deleting weight entry:", error);
      toast({
        title: "Error",
        description: "Failed to delete weight entry",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Weight Tracker</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Stats Cards */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Current Weight</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats.currentWeight.toFixed(1)} kg</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Weight Lost</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-600">
              {stats.weightLost > 0 ? `-${stats.weightLost.toFixed(1)} kg` : '0 kg'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Weekly Average Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-blue-600">
              {stats.averageWeeklyLoss > 0 ? `${stats.averageWeeklyLoss.toFixed(1)} kg` : '0 kg'}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Weight Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Weight History</CardTitle>
          <div className="flex justify-end">
            <Tabs defaultValue={timeRange}>
              <TabsList>
                <TabsTrigger 
                  value="7days" 
                  onClick={() => setTimeRange("7days")}
                >
                  7 Days
                </TabsTrigger>
                <TabsTrigger 
                  value="30days" 
                  onClick={() => setTimeRange("30days")}
                >
                  30 Days
                </TabsTrigger>
                <TabsTrigger 
                  value="90days" 
                  onClick={() => setTimeRange("90days")}
                >
                  90 Days
                </TabsTrigger>
                <TabsTrigger 
                  value="all" 
                  onClick={() => setTimeRange("all")}
                >
                  All Time
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={['auto', 'auto']} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">No weight data for the selected time period</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Add Weight Form */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Add New Weight</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Weight (kg)</label>
                <Input
                  type="number"
                  placeholder="Enter weight"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  step="0.1"
                  className="mt-1"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">How do you feel?</label>
                <Input
                  placeholder="e.g., Energetic, Tired, etc."
                  value={bodyFeeling}
                  onChange={(e) => setBodyFeeling(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  placeholder="Any notes about today's weight"
                  value={feelingNote}
                  onChange={(e) => setFeelingNote(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <Button onClick={handleAddWeight} className="w-full">
                Add Weight Entry
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Weight History Table */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Weight History</CardTitle>
          </CardHeader>
          <CardContent>
            {sortedEntries.length > 0 ? (
              <div className="max-h-[400px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Weight</TableHead>
                      <TableHead>Feeling</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...sortedEntries].reverse().map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{format(new Date(entry.created_at), 'MMM dd, yyyy')}</TableCell>
                        <TableCell><strong>{entry.weight.toFixed(1)} kg</strong></TableCell>
                        <TableCell>{entry.body_feeling || '-'}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{entry.feeling_note || '-'}</TableCell>
                        <TableCell>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteEntry(entry.id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-10">No weight entries yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Weight; 