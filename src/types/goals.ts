
export type GoalCategory = 
  | "spiritual" 
  | "physical_health" 
  | "mental_health" 
  | "financial" 
  | "philanthropy" 
  | "knowledge_culture" 
  | "friends_family" 
  | "work";

export interface Goal {
  id: string;
  user_id: string;
  category: GoalCategory;
  description: string;
  isCompleted: boolean;
  quarter: number; // 1-4
  year: number;
  created_at: string;
  updated_at: string;
}

export const goalCategoryLabels: Record<GoalCategory, string> = {
  spiritual: "Spiritual",
  physical_health: "Physical Health",
  mental_health: "Mental Health",
  financial: "Financial",
  philanthropy: "Philanthropy",
  knowledge_culture: "Knowledge & Culture",
  friends_family: "Friends & Family",
  work: "Work"
};
