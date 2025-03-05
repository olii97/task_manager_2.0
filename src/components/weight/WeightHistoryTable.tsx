
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { WeightEntry } from "@/types/weight";
import { format, parseISO } from "date-fns";
import { Trash2 } from "lucide-react";

interface WeightHistoryTableProps {
  entries: WeightEntry[];
  onDelete: (id: string) => void;
}

export function WeightHistoryTable({ entries, onDelete }: WeightHistoryTableProps) {
  // Clone and sort entries by date (newest first)
  const sortedEntries = React.useMemo(() => {
    return [...entries].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [entries]);

  // Calculate weight changes
  const entriesWithChanges = React.useMemo(() => {
    return sortedEntries.map((entry, index) => {
      const prevEntry = sortedEntries[index + 1];
      const change = prevEntry ? entry.weight - prevEntry.weight : null;
      return {
        ...entry,
        change
      };
    });
  }, [sortedEntries]);

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weight History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-6 text-muted-foreground">No weight entries yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weight History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead>Change</TableHead>
              <TableHead>Body Feeling</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entriesWithChanges.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{format(parseISO(entry.created_at), 'MMM dd, yyyy')}</TableCell>
                <TableCell>{entry.weight} kg</TableCell>
                <TableCell>
                  {entry.change !== null ? (
                    <span className={entry.change > 0 ? "text-red-500" : entry.change < 0 ? "text-green-500" : ""}>
                      {entry.change > 0 ? "+" : ""}
                      {entry.change.toFixed(1)} kg
                    </span>
                  ) : "-"}
                </TableCell>
                <TableCell>
                  {entry.body_feeling || "-"}
                </TableCell>
                <TableCell className="text-right">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete this weight entry.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => onDelete(entry.id)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
