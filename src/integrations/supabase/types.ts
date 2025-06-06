export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      calendar_entries: {
        Row: {
          created_at: string | null
          date: string
          description: string | null
          entry_type: string
          has_reminder: boolean | null
          id: string
          is_recurring: boolean | null
          recurrence_pattern: string | null
          reminder_days_before: number | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          description?: string | null
          entry_type: string
          has_reminder?: boolean | null
          id?: string
          is_recurring?: boolean | null
          recurrence_pattern?: string | null
          reminder_days_before?: number | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          description?: string | null
          entry_type?: string
          has_reminder?: boolean | null
          id?: string
          is_recurring?: boolean | null
          recurrence_pattern?: string | null
          reminder_days_before?: number | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      chat_sessions: {
        Row: {
          assistant_id: string
          assistant_model: string | null
          assistant_name: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          thread_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assistant_id: string
          assistant_model?: string | null
          assistant_name?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          thread_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assistant_id?: string
          assistant_model?: string | null
          assistant_name?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          thread_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      gym_workouts: {
        Row: {
          created_at: string | null
          date: string | null
          exercises: Json[] | null
          id: string
          notes: string | null
          total_duration: number | null
          updated_at: string | null
          user_id: string | null
          workout_name: string
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          exercises?: Json[] | null
          id?: string
          notes?: string | null
          total_duration?: number | null
          updated_at?: string | null
          user_id?: string | null
          workout_name: string
        }
        Update: {
          created_at?: string | null
          date?: string | null
          exercises?: Json[] | null
          id?: string
          notes?: string | null
          total_duration?: number | null
          updated_at?: string | null
          user_id?: string | null
          workout_name?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          challenges: string | null
          created_at: string
          date: string
          energy: number
          gratitude: string | null
          id: string
          intentions: string | null
          mood: number
          nutrition: Json | null
          reflection: string | null
          reflections: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          challenges?: string | null
          created_at?: string
          date?: string
          energy: number
          gratitude?: string | null
          id?: string
          intentions?: string | null
          mood: number
          nutrition?: Json | null
          reflection?: string | null
          reflections?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          challenges?: string | null
          created_at?: string
          date?: string
          energy?: number
          gratitude?: string | null
          id?: string
          intentions?: string | null
          mood?: number
          nutrition?: Json | null
          reflection?: string | null
          reflections?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_entries: {
        Row: {
          created_at: string | null
          id: string
          meal_date: string | null
          meal_description: string
          total_calories: number | null
          total_carbs: number | null
          total_fat: number | null
          total_fiber: number | null
          total_protein: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          meal_date?: string | null
          meal_description: string
          total_calories?: number | null
          total_carbs?: number | null
          total_fat?: number | null
          total_fiber?: number | null
          total_protein?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          meal_date?: string | null
          meal_description?: string
          total_calories?: number | null
          total_carbs?: number | null
          total_fat?: number | null
          total_fiber?: number | null
          total_protein?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      morning_rituals: {
        Row: {
          created_at: string | null
          date: string
          gratitude_items: string[]
          id: string
          intentions: string[]
          journal_entry: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          gratitude_items?: string[]
          id?: string
          intentions?: string[]
          journal_entry?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          gratitude_items?: string[]
          id?: string
          intentions?: string[]
          journal_entry?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      nutrition_items: {
        Row: {
          calories: number | null
          carbs: number | null
          created_at: string | null
          fat: number | null
          fiber: number | null
          food_item: string
          id: string
          meal_entry_id: string | null
          protein: number | null
        }
        Insert: {
          calories?: number | null
          carbs?: number | null
          created_at?: string | null
          fat?: number | null
          fiber?: number | null
          food_item: string
          id?: string
          meal_entry_id?: string | null
          protein?: number | null
        }
        Update: {
          calories?: number | null
          carbs?: number | null
          created_at?: string | null
          fat?: number | null
          fiber?: number | null
          food_item?: string
          id?: string
          meal_entry_id?: string | null
          protein?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_items_meal_entry_id_fkey"
            columns: ["meal_entry_id"]
            isOneToOne: false
            referencedRelation: "meal_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      pomodoro_distractions: {
        Row: {
          created_at: string
          description: string
          id: string
          session_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          session_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pomodoro_distractions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "pomodoro_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      pomodoro_sessions: {
        Row: {
          completed: boolean
          created_at: string
          duration_minutes: number
          end_time: string | null
          id: string
          start_time: string
          task_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          duration_minutes?: number
          end_time?: string | null
          id?: string
          start_time?: string
          task_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          duration_minutes?: number
          end_time?: string | null
          id?: string
          start_time?: string
          task_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pomodoro_sessions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          color: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      quarterly_goals: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          is_completed: boolean
          quarter: number
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          is_completed?: boolean
          quarter: number
          updated_at?: string
          user_id: string
          year: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          is_completed?: boolean
          quarter?: number
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      strava_activities: {
        Row: {
          average_cadence: number | null
          average_heartrate: number | null
          average_speed: number | null
          average_watts: number | null
          calories: number | null
          created_at: string
          device_name: string | null
          distance: number
          elapsed_time: number
          elevation_high: number | null
          elevation_low: number | null
          end_latlng: Json | null
          gear_id: string | null
          id: number
          kilojoules: number | null
          laps: Json | null
          map_data: Json | null
          max_cadence: number | null
          max_heartrate: number | null
          max_speed: number | null
          max_watts: number | null
          moving_time: number
          name: string
          pr_count: number | null
          segment_efforts: Json | null
          splits_metric: Json | null
          splits_standard: Json | null
          start_date: string
          start_latlng: Json | null
          summary_polyline: string | null
          temperature: number | null
          total_elevation_gain: number | null
          type: string
          updated_at: string
          user_id: string
          weighted_average_watts: number | null
        }
        Insert: {
          average_cadence?: number | null
          average_heartrate?: number | null
          average_speed?: number | null
          average_watts?: number | null
          calories?: number | null
          created_at?: string
          device_name?: string | null
          distance: number
          elapsed_time: number
          elevation_high?: number | null
          elevation_low?: number | null
          end_latlng?: Json | null
          gear_id?: string | null
          id: number
          kilojoules?: number | null
          laps?: Json | null
          map_data?: Json | null
          max_cadence?: number | null
          max_heartrate?: number | null
          max_speed?: number | null
          max_watts?: number | null
          moving_time: number
          name: string
          pr_count?: number | null
          segment_efforts?: Json | null
          splits_metric?: Json | null
          splits_standard?: Json | null
          start_date: string
          start_latlng?: Json | null
          summary_polyline?: string | null
          temperature?: number | null
          total_elevation_gain?: number | null
          type: string
          updated_at?: string
          user_id: string
          weighted_average_watts?: number | null
        }
        Update: {
          average_cadence?: number | null
          average_heartrate?: number | null
          average_speed?: number | null
          average_watts?: number | null
          calories?: number | null
          created_at?: string
          device_name?: string | null
          distance?: number
          elapsed_time?: number
          elevation_high?: number | null
          elevation_low?: number | null
          end_latlng?: Json | null
          gear_id?: string | null
          id?: number
          kilojoules?: number | null
          laps?: Json | null
          map_data?: Json | null
          max_cadence?: number | null
          max_heartrate?: number | null
          max_speed?: number | null
          max_watts?: number | null
          moving_time?: number
          name?: string
          pr_count?: number | null
          segment_efforts?: Json | null
          splits_metric?: Json | null
          splits_standard?: Json | null
          start_date?: string
          start_latlng?: Json | null
          summary_polyline?: string | null
          temperature?: number | null
          total_elevation_gain?: number | null
          type?: string
          updated_at?: string
          user_id?: string
          weighted_average_watts?: number | null
        }
        Relationships: []
      }
      strava_tokens: {
        Row: {
          access_token: string
          created_at: string | null
          expires_at: number
          id: string
          refresh_token: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string | null
          expires_at: number
          id?: string
          refresh_token: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string | null
          expires_at?: number
          id?: string
          refresh_token?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          completion_date: string | null
          created_at: string
          description: string | null
          due_date: string | null
          energy_level: string | null
          id: string
          is_completed: boolean
          is_scheduled_today: boolean
          priority: number
          project_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completion_date?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          energy_level?: string | null
          id?: string
          is_completed?: boolean
          is_scheduled_today?: boolean
          priority?: number
          project_id?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completion_date?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          energy_level?: string | null
          id?: string
          is_completed?: boolean
          is_scheduled_today?: boolean
          priority?: number
          project_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_xp: {
        Row: {
          created_at: string
          id: string
          reason: string | null
          user_id: string
          xp_amount: number
        }
        Insert: {
          created_at?: string
          id?: string
          reason?: string | null
          user_id: string
          xp_amount?: number
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string | null
          user_id?: string
          xp_amount?: number
        }
        Relationships: []
      }
      weekly_intentions: {
        Row: {
          created_at: string
          id: string
          intention_1: string | null
          intention_2: string | null
          intention_3: string | null
          reflection_1: string | null
          reflection_2: string | null
          reflection_3: string | null
          status: string
          updated_at: string
          user_id: string
          week_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          intention_1?: string | null
          intention_2?: string | null
          intention_3?: string | null
          reflection_1?: string | null
          reflection_2?: string | null
          reflection_3?: string | null
          status?: string
          updated_at?: string
          user_id: string
          week_start: string
        }
        Update: {
          created_at?: string
          id?: string
          intention_1?: string | null
          intention_2?: string | null
          intention_3?: string | null
          reflection_1?: string | null
          reflection_2?: string | null
          reflection_3?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          week_start?: string
        }
        Relationships: []
      }
      weight_entries: {
        Row: {
          body_feeling: string | null
          created_at: string
          feeling_note: string | null
          id: string
          updated_at: string
          user_id: string
          weight: number
        }
        Insert: {
          body_feeling?: string | null
          created_at?: string
          feeling_note?: string | null
          id?: string
          updated_at?: string
          user_id: string
          weight: number
        }
        Update: {
          body_feeling?: string | null
          created_at?: string
          feeling_note?: string | null
          id?: string
          updated_at?: string
          user_id?: string
          weight?: number
        }
        Relationships: []
      }
      weight_goals: {
        Row: {
          created_at: string
          start_date: string
          start_weight: number
          target_date: string | null
          target_weight: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          start_date: string
          start_weight: number
          target_date?: string | null
          target_weight: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          start_date?: string
          start_weight?: number
          target_date?: string | null
          target_weight?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
