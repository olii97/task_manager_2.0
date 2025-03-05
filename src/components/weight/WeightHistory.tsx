
import { useState } from "react";
import { WeightEntry, BodyFeeling, bodyFeelingEmoji } from "@/types/weight";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, TrendingDown, TrendingUp } from "lucide-react";

interface WeightHistoryProps {
  entries: WeightEntry[];
  onDeleteEntry: (entryId: string) => void;
}

export const WeightHistory = ({ entries, onDeleteEntry }: WeightHistoryProps) => {
  // Calculate weight changes between entries
  const entriesWithChanges = entries.map((entry, index) => {
    let change = null;
    if (index < entries.length - 1) {
      change = entry.weight - entries[index + 1].weight;
    }
    return { ...entry, change };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weight History</CardTitle>
      </CardHeader>
      <CardContent>
        {entriesWithChanges.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Change</TableHead>
                <TableHead>Feeling</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entriesWithChanges.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    {format(parseISO(entry.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="font-medium">
                    {entry.weight} kg
                  </TableCell>
                  <TableCell>
                    {entry.change !== null ? (
                      <span className={`flex items-center ${entry.change > 0 ? 'text-destructive' : entry.change < 0 ? 'text-strava-primary' : ''}`}>
                        {entry.change > 0 ? (
                          <TrendingUp className="h-4 w-4 mr-1" />
                        ) : entry.change < 0 ? (
                          <TrendingDown className="h-4 w-4 mr-1" />
                        ) : null}
                        {entry.change > 0 ? '+' : ''}
                        {entry.change !== 0 ? entry.change.toFixed(1) : '0'} kg
                      </span>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>
                    {entry.body_feeling ? (
                      <span className="flex items-center gap-1">
                        <span className="text-xl" title={entry.body_feeling}>
                          {bodyFeelingEmoji[entry.body_feeling as BodyFeeling] || '🤔'}
                        </span>
                        <span className="text-sm">{entry.body_feeling}</span>
                      </span>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => onDeleteEntry(entry.id)}
                          className="text-destructive"
                        >
                          Delete entry
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            No weight entries found. Log your weight to start tracking.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
