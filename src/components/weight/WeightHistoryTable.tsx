
import { WeightEntry } from "@/types/weight";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, TrendingUp, Trash2 } from "lucide-react";

interface WeightHistoryTableProps {
  entries: WeightEntry[];
  onDelete: (id: string) => void;
}

export function WeightHistoryTable({ entries, onDelete }: WeightHistoryTableProps) {
  // Sort entries by date (newest first)
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Calculate difference from previous entry
  const entriesWithDiff = sortedEntries.map((entry, index) => {
    const prevEntry = sortedEntries[index + 1];
    const diff = prevEntry ? entry.weight - prevEntry.weight : null;
    return { ...entry, diff };
  });

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Entry History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            No weight entries available.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Entry History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Change</TableHead>
                <TableHead>Feeling</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entriesWithDiff.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{format(parseISO(entry.created_at), 'MMM d, yyyy')}</TableCell>
                  <TableCell className="font-medium">{entry.weight} kg</TableCell>
                  <TableCell>
                    {entry.diff !== null ? (
                      <div className="flex items-center">
                        {entry.diff > 0 ? (
                          <>
                            <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                            <span className="text-red-500">+{entry.diff.toFixed(1)} kg</span>
                          </>
                        ) : entry.diff < 0 ? (
                          <>
                            <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                            <span className="text-green-500">{entry.diff.toFixed(1)} kg</span>
                          </>
                        ) : (
                          <span>0.0 kg</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">First entry</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {entry.body_feeling ? (
                      <span>
                        {entry.body_feeling}
                        {entry.body_feeling === 'Sore' && ' 😣'}
                        {entry.body_feeling === 'Relaxed' && ' 😌'}
                        {entry.body_feeling === 'Energized' && ' ⚡'}
                        {entry.body_feeling === 'Stressed' && ' 😰'}
                        {entry.body_feeling === 'Tired' && ' 😴'}
                        {entry.body_feeling === 'Other' && ' 🤔'}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => onDelete(entry.id)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
