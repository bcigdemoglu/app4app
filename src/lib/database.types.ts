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
      calculator_widget: {
        Row: {
          created_at: string
          id: number
          inputs: Json | null
          metadata: Json | null
        }
        Insert: {
          created_at?: string
          id?: number
          inputs?: Json | null
          metadata?: Json | null
        }
        Update: {
          created_at?: string
          id?: number
          inputs?: Json | null
          metadata?: Json | null
        }
        Relationships: []
      }
      exported_outputs: {
        Row: {
          course_id: string
          created_at: string
          full_name: string
          id: string
          is_public: boolean
          lesson_id: string
          modified_at: string
          output: string
          user_id: string
          view_count: number
        }
        Insert: {
          course_id: string
          created_at?: string
          full_name: string
          id?: string
          is_public?: boolean
          lesson_id: string
          modified_at?: string
          output: string
          user_id?: string
          view_count?: number
        }
        Update: {
          course_id?: string
          created_at?: string
          full_name?: string
          id?: string
          is_public?: boolean
          lesson_id?: string
          modified_at?: string
          output?: string
          user_id?: string
          view_count?: number
        }
        Relationships: []
      }
      guest_exported_outputs: {
        Row: {
          course_id: string
          created_at: string
          full_name: string
          id: string
          is_public: boolean
          lesson_id: string
          modified_at: string
          output: string
          user_id: string
          view_count: number
        }
        Insert: {
          course_id: string
          created_at?: string
          full_name: string
          id?: string
          is_public?: boolean
          lesson_id: string
          modified_at?: string
          output: string
          user_id?: string
          view_count?: number
        }
        Update: {
          course_id?: string
          created_at?: string
          full_name?: string
          id?: string
          is_public?: boolean
          lesson_id?: string
          modified_at?: string
          output?: string
          user_id?: string
          view_count?: number
        }
        Relationships: []
      }
      guest_mode: {
        Row: {
          created_at: string
          guest_id: string
          id: number
          ip: string | null
          metadata: Json
        }
        Insert: {
          created_at?: string
          guest_id: string
          id?: number
          ip?: string | null
          metadata: Json
        }
        Update: {
          created_at?: string
          guest_id?: string
          id?: number
          ip?: string | null
          metadata?: Json
        }
        Relationships: []
      }
      guest_user_progress: {
        Row: {
          course_id: string
          created_at: string
          id: string
          inputs_json: Json | null
          lesson_id: string
          modified_at: string | null
          outputs_json: Json | null
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          inputs_json?: Json | null
          lesson_id: string
          modified_at?: string | null
          outputs_json?: Json | null
          user_id?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          inputs_json?: Json | null
          lesson_id?: string
          modified_at?: string | null
          outputs_json?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          plan: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          plan?: string
          updated_at: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          plan?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          course_id: string
          created_at: string
          id: string
          inputs_json: Json | null
          lesson_id: string
          modified_at: string | null
          outputs_json: Json | null
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          inputs_json?: Json | null
          lesson_id: string
          modified_at?: string | null
          outputs_json?: Json | null
          user_id?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          inputs_json?: Json | null
          lesson_id?: string
          modified_at?: string | null
          outputs_json?: Json | null
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
