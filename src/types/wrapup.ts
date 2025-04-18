import { Task } from './tasks';
import { JournalEntry } from './journal';

export interface WrapUpData {
  completed_tasks: Task[];
  journal_entries: JournalEntry[];
}
