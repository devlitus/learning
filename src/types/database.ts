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
      level: {
        Row: {
          description: string | null
          feature: string | null
          icon: string | null
          id: number
          id_user: string | null
          sub_title: string | null
          title: string | null
        }
        Insert: {
          description?: string | null
          feature?: string | null
          icon?: string | null
          id?: number
          id_user?: string | null
          sub_title?: string | null
          title?: string | null
        }
        Update: {
          description?: string | null
          feature?: string | null
          icon?: string | null
          id?: number
          id_user?: string | null
          sub_title?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "title_id_user_fkey"
            columns: ["id_user"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      topic: {
        Row: {
          category_id: number
          created_at: string | null
          description: string | null
          id: number
          level_id: number | null
          name: string
          topic_id: string
          updated_at: string | null
        }
        Insert: {
          category_id: number
          created_at?: string | null
          description?: string | null
          id?: number
          level_id?: number | null
          name: string
          topic_id: string
          updated_at?: string | null
        }
        Update: {
          category_id?: number
          created_at?: string | null
          description?: string | null
          id?: number
          level_id?: number | null
          name?: string
          topic_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "topic_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "topic_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topic_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "level"
            referencedColumns: ["id"]
          },
        ]
      }
      topic_category: {
        Row: {
          category_id: string
          created_at: string | null
          description: string | null
          icon: string
          id: number
          title: string
          updated_at: string | null
        }
        Insert: {
          category_id: string
          created_at?: string | null
          description?: string | null
          icon: string
          id?: number
          title: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string
          created_at?: string | null
          description?: string | null
          icon?: string
          id?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user: {
        Row: {
          email: string | null
          id: string
          name: string
        }
        Insert: {
          email?: string | null
          id?: string
          name: string
        }
        Update: {
          email?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_topic: {
        Row: {
          id: number
          level_id: number | null
          selected_at: string | null
          topic_id: number
          user_id: string
        }
        Insert: {
          id?: number
          level_id?: number | null
          selected_at?: string | null
          topic_id: number
          user_id: string
        }
        Update: {
          id?: number
          level_id?: number | null
          selected_at?: string | null
          topic_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_topic_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "level"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_topic_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topic"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_topic_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
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

// Tipos de conveniencia para el usuario
export type User = Database['public']['Tables']['user']['Row'];
export type UserInsert = Database['public']['Tables']['user']['Insert'];
export type UserUpdate = Database['public']['Tables']['user']['Update']; 

// Tipos de conveniencia para level
export type Level = Database['public']['Tables']['level']['Row'];
export type LevelInsert = Database['public']['Tables']['level']['Insert'];
export type LevelUpdate = Database['public']['Tables']['level']['Update'];

// Tipos de conveniencia para topic_category
export type TopicCategory = Database['public']['Tables']['topic_category']['Row'];
export type TopicCategoryInsert = Database['public']['Tables']['topic_category']['Insert'];
export type TopicCategoryUpdate = Database['public']['Tables']['topic_category']['Update'];

// Tipos de conveniencia para topic
export type Topic = Database['public']['Tables']['topic']['Row'];
export type TopicInsert = Database['public']['Tables']['topic']['Insert'];
export type TopicUpdate = Database['public']['Tables']['topic']['Update'];

// Tipos de conveniencia para user_topic
export type UserTopic = Database['public']['Tables']['user_topic']['Row'];
export type UserTopicInsert = Database['public']['Tables']['user_topic']['Insert'];
export type UserTopicUpdate = Database['public']['Tables']['user_topic']['Update']; 