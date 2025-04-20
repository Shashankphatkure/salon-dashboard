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
      appointment_services: {
        Row: {
          appointment_id: string
          created_at: string | null
          discount_percentage: number | null
          id: string
          price: number
          service_id: string
          staff_id: string | null
        }
        Insert: {
          appointment_id: string
          created_at?: string | null
          discount_percentage?: number | null
          id?: string
          price: number
          service_id: string
          staff_id?: string | null
        }
        Update: {
          appointment_id?: string
          created_at?: string | null
          discount_percentage?: number | null
          id?: string
          price?: number
          service_id?: string
          staff_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_appointment"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointment_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_appointment"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_service"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_staff"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "appointment_details"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "fk_staff"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          created_at: string | null
          customer_id: string | null
          date: string
          end_time: string | null
          id: string
          notes: string | null
          staff_id: string | null
          start_time: string
          status: Database["public"]["Enums"]["appointment_status"] | null
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          date: string
          end_time?: string | null
          id?: string
          notes?: string | null
          staff_id?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["appointment_status"] | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          date?: string
          end_time?: string | null
          id?: string
          notes?: string | null
          staff_id?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["appointment_status"] | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_customer"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "appointment_details"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "fk_customer"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_staff"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "appointment_details"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "fk_staff"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          birthdate: string | null
          created_at: string | null
          email: string | null
          gender: string | null
          id: string
          join_date: string
          last_visit: string
          membership_type: string | null
          name: string
          phone: string
          total_spent: number | null
          updated_at: string | null
          visits: number | null
        }
        Insert: {
          address?: string | null
          birthdate?: string | null
          created_at?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          join_date?: string
          last_visit?: string
          membership_type?: string | null
          name: string
          phone: string
          total_spent?: number | null
          updated_at?: string | null
          visits?: number | null
        }
        Update: {
          address?: string | null
          birthdate?: string | null
          created_at?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          join_date?: string
          last_visit?: string
          membership_type?: string | null
          name?: string
          phone?: string
          total_spent?: number | null
          updated_at?: string | null
          visits?: number | null
        }
        Relationships: []
      }
      membership_plans: {
        Row: {
          active_count: number | null
          created_at: string | null
          description: string | null
          discount_percentage: number
          duration_months: number
          id: string
          is_active: boolean
          name: string
          points: number
          price: number
          tier: Database["public"]["Enums"]["membership_tier"]
          total_count: number | null
          updated_at: string | null
        }
        Insert: {
          active_count?: number | null
          created_at?: string | null
          description?: string | null
          discount_percentage?: number
          duration_months?: number
          id?: string
          is_active?: boolean
          name: string
          points?: number
          price: number
          tier: Database["public"]["Enums"]["membership_tier"]
          total_count?: number | null
          updated_at?: string | null
        }
        Update: {
          active_count?: number | null
          created_at?: string | null
          description?: string | null
          discount_percentage?: number
          duration_months?: number
          id?: string
          is_active?: boolean
          name?: string
          points?: number
          price?: number
          tier?: Database["public"]["Enums"]["membership_tier"]
          total_count?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      memberships: {
        Row: {
          active: boolean | null
          created_at: string | null
          customer_id: string | null
          end_date: string | null
          id: string
          membership_type: string
          plan_id: string | null
          points_balance: number | null
          start_date: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          customer_id?: string | null
          end_date?: string | null
          id?: string
          membership_type: string
          plan_id?: string | null
          points_balance?: number | null
          start_date?: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          customer_id?: string | null
          end_date?: string | null
          id?: string
          membership_type?: string
          plan_id?: string | null
          points_balance?: number | null
          start_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "memberships_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "appointment_details"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "memberships_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "membership_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          price: number
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price: number
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      staff: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          email: string | null
          id: string
          joining_date: string | null
          name: string
          phone: string | null
          profile_image: string | null
          specialties: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          joining_date?: string | null
          name: string
          phone?: string | null
          profile_image?: string | null
          specialties?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          joining_date?: string | null
          name?: string
          phone?: string | null
          profile_image?: string | null
          specialties?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      staff_availability: {
        Row: {
          created_at: string | null
          date: string
          end_time: string
          id: string
          is_available: boolean | null
          staff_id: string | null
          start_time: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          end_time: string
          id?: string
          is_available?: boolean | null
          staff_id?: string | null
          start_time: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          end_time?: string
          id?: string
          is_available?: boolean | null
          staff_id?: string | null
          start_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_availability_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "appointment_details"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "staff_availability_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_services: {
        Row: {
          created_at: string | null
          id: string
          service_id: string
          staff_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          service_id: string
          staff_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          service_id?: string
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_services_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "appointment_details"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "staff_services_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          credit_used: number | null
          customer_id: string | null
          date: string
          id: string
          invoice_id: string | null
          service_name: string
          updated_at: string | null
        }
        Insert: {
          amount?: number
          created_at?: string | null
          credit_used?: number | null
          customer_id?: string | null
          date?: string
          id?: string
          invoice_id?: string | null
          service_name: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          credit_used?: number | null
          customer_id?: string | null
          date?: string
          id?: string
          invoice_id?: string | null
          service_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "appointment_details"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      appointment_details: {
        Row: {
          created_at: string | null
          customer_email: string | null
          customer_id: string | null
          customer_name: string | null
          customer_phone: string | null
          date: string | null
          end_time: string | null
          id: string | null
          notes: string | null
          service_count: number | null
          services_total: number | null
          staff_email: string | null
          staff_id: string | null
          staff_name: string | null
          start_time: string | null
          status: Database["public"]["Enums"]["appointment_status"] | null
          total_amount: number | null
          updated_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_appointment_services: {
        Args: { p_appointment_id: string }
        Returns: {
          id: string
          appointment_id: string
          service_id: string
          service_name: string
          price: number
          discount_percentage: number
          staff_id: string
          staff_name: string
        }[]
      }
      get_filtered_appointments: {
        Args: {
          p_date_from?: string
          p_date_to?: string
          p_status?: Database["public"]["Enums"]["appointment_status"]
          p_customer_id?: string
          p_staff_id?: string
          p_limit?: number
          p_offset?: number
        }
        Returns: {
          id: string
          date: string
          start_time: string
          end_time: string
          status: Database["public"]["Enums"]["appointment_status"]
          notes: string
          total_amount: number
          created_at: string
          updated_at: string
          customer_id: string
          customer_name: string
          customer_phone: string
          customer_email: string
          staff_id: string
          staff_name: string
          staff_email: string
          service_count: number
          services_total: number
        }[]
      }
      get_membership_plans: {
        Args: Record<PropertyKey, never>
        Returns: {
          active_count: number | null
          created_at: string | null
          description: string | null
          discount_percentage: number
          duration_months: number
          id: string
          is_active: boolean
          name: string
          points: number
          price: number
          tier: Database["public"]["Enums"]["membership_tier"]
          total_count: number | null
          updated_at: string | null
        }[]
      }
      get_user_membership: {
        Args: { p_user_id: string }
        Returns: {
          id: string
          customer_id: string
          membership_type: string
          start_date: string
          end_date: string
          points_balance: number
          active: boolean
          created_at: string
          updated_at: string
          plan_id: string
          plan_name: string
          tier: Database["public"]["Enums"]["membership_tier"]
          discount_percentage: number
          points: number
        }[]
      }
      upgrade_membership: {
        Args: {
          p_user_id: string
          p_new_plan_id: string
          p_old_plan_id?: string
        }
        Returns: boolean
      }
      use_membership_points: {
        Args: { p_user_id: string; p_points_to_use: number }
        Returns: boolean
      }
    }
    Enums: {
      appointment_status:
        | "pending"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "no_show"
      membership_tier: "Non-Membership" | "Silver" | "Silver Plus" | "Gold"
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
    Enums: {
      appointment_status: [
        "pending",
        "in_progress",
        "completed",
        "cancelled",
        "no_show",
      ],
      membership_tier: ["Non-Membership", "Silver", "Silver Plus", "Gold"],
    },
  },
} as const
