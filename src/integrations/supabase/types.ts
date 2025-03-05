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
          energy_level: string | null
          id: string
          is_completed: boolean
          is_scheduled_today: boolean
          priority: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completion_date?: string | null
          created_at?: string
          description?: string | null
          energy_level?: string | null
          id?: string
          is_completed?: boolean
          is_scheduled_today?: boolean
          priority?: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completion_date?: string | null
          created_at?: string
          description?: string | null
          energy_level?: string | null
          id?: string
          is_completed?: boolean
          is_scheduled_today?: boolean
          priority?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
