
export interface UserStreak {
  current_streak: number;
  longest_streak: number;
  last_entry_date: string | null;
  xp_points: number;
}

export const XP_PER_ENTRY = 10;
export const XP_STREAK_BONUS = {
  7: 50,  // 7-day streak: +50 XP
  14: 100, // 14-day streak: +100 XP
  30: 250, // 30-day streak: +250 XP
};

export const calculateStreakAndXP = (
  journalEntries: { date: string }[],
  currentStreak: number = 0,
  lastEntryDate: string | null = null,
  xpPoints: number = 0
): UserStreak => {
  if (!journalEntries.length) {
    return {
      current_streak: currentStreak,
      longest_streak: currentStreak,
      last_entry_date: lastEntryDate,
      xp_points: xpPoints
    };
  }

  // Sort entries by date (newest first)
  const sortedEntries = [...journalEntries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const latestEntryDate = new Date(sortedEntries[0].date);
  latestEntryDate.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Initialize tracking variables
  let streak = 0;
  let longestStreak = 0;
  let currentXp = 0;
  
  // Calculate base XP (entries * XP_PER_ENTRY)
  currentXp = journalEntries.length * XP_PER_ENTRY;
  
  // Check if the latest entry is from today or yesterday to maintain streak
  const isActiveStreak = 
    latestEntryDate.getTime() === today.getTime() || 
    latestEntryDate.getTime() === yesterday.getTime();
  
  if (isActiveStreak) {
    // Count days backwards from the latest entry
    let currentDate = new Date(latestEntryDate);
    let previousDate = new Date(currentDate);
    previousDate.setDate(previousDate.getDate() - 1);
    
    // Initialize with 1 for today's entry
    streak = 1;
    
    // Create a set of entry dates for faster lookup
    const entryDates = new Set(
      journalEntries.map(entry => {
        const date = new Date(entry.date);
        date.setHours(0, 0, 0, 0);
        return date.toISOString().split('T')[0];
      })
    );
    
    // Count backwards until we find a break in the streak
    while (true) {
      previousDate.setDate(previousDate.getDate() - 1);
      const dateStr = previousDate.toISOString().split('T')[0];
      
      if (entryDates.has(dateStr)) {
        streak++;
      } else {
        break;
      }
    }
    
    // Add streak bonuses to XP
    Object.entries(XP_STREAK_BONUS).forEach(([days, bonus]) => {
      if (streak >= parseInt(days)) {
        currentXp += bonus;
      }
    });
  }
  
  longestStreak = Math.max(streak, longestStreak);
  
  return {
    current_streak: streak,
    longest_streak: longestStreak,
    last_entry_date: sortedEntries[0].date,
    xp_points: currentXp
  };
};
