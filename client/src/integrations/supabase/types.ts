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
      agents: {
        Row: {
          address: string | null
          agent_code: string
          commission_rate: number | null
          created_at: string
          email: string | null
          first_name: string
          hire_date: string
          id: string
          last_name: string
          phone: string
          status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          agent_code: string
          commission_rate?: number | null
          created_at?: string
          email?: string | null
          first_name: string
          hire_date?: string
          id?: string
          last_name: string
          phone: string
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          agent_code?: string
          commission_rate?: number | null
          created_at?: string
          email?: string | null
          first_name?: string
          hire_date?: string
          id?: string
          last_name?: string
          phone?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      bills: {
        Row: {
          amount: number
          bill_date: string
          bill_number: string
          billing_period_end: string
          billing_period_start: string
          created_at: string
          customer_id: string
          due_date: string
          id: string
          status: string
          subscription_id: string
          tax_amount: number | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          amount: number
          bill_date?: string
          bill_number: string
          billing_period_end: string
          billing_period_start: string
          created_at?: string
          customer_id: string
          due_date: string
          id?: string
          status?: string
          subscription_id: string
          tax_amount?: number | null
          total_amount: number
          updated_at?: string
        }
        Update: {
          amount?: number
          bill_date?: string
          bill_number?: string
          billing_period_end?: string
          billing_period_start?: string
          created_at?: string
          customer_id?: string
          due_date?: string
          id?: string
          status?: string
          subscription_id?: string
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bills_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bills_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          agent_id: string | null
          complaint_number: string
          created_at: string
          customer_id: string
          description: string
          id: string
          priority: string
          resolution: string | null
          resolved_at: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          agent_id?: string | null
          complaint_number: string
          created_at?: string
          customer_id: string
          description: string
          id?: string
          priority?: string
          resolution?: string | null
          resolved_at?: string | null
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          agent_id?: string | null
          complaint_number?: string
          created_at?: string
          customer_id?: string
          description?: string
          id?: string
          priority?: string
          resolution?: string | null
          resolved_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaints_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string
          city: string
          connection_date: string
          created_at: string
          customer_code: string
          email: string | null
          first_name: string
          id: string
          last_name: string
          phone: string
          pincode: string
          state: string
          status: string
          updated_at: string
        }
        Insert: {
          address: string
          city: string
          connection_date?: string
          created_at?: string
          customer_code: string
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          phone: string
          pincode: string
          state: string
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string
          city?: string
          connection_date?: string
          created_at?: string
          customer_code?: string
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          phone?: string
          pincode?: string
          state?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string
          expense_date: string
          expense_number: string
          id: string
          notes: string | null
          payment_method: string
          receipt_number: string | null
          updated_at: string
          vendor_name: string | null
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          description: string
          expense_date?: string
          expense_number: string
          id?: string
          notes?: string | null
          payment_method: string
          receipt_number?: string | null
          updated_at?: string
          vendor_name?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string
          expense_date?: string
          expense_number?: string
          id?: string
          notes?: string | null
          payment_method?: string
          receipt_number?: string | null
          updated_at?: string
          vendor_name?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          bill_id: string
          created_at: string
          customer_id: string
          id: string
          notes: string | null
          payment_date: string
          payment_method: string
          payment_number: string
          transaction_reference: string | null
        }
        Insert: {
          amount: number
          bill_id: string
          created_at?: string
          customer_id: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method: string
          payment_number: string
          transaction_reference?: string | null
        }
        Update: {
          amount?: number
          bill_id?: string
          created_at?: string
          customer_id?: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string
          payment_number?: string
          transaction_reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "bills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          installation_fee: number | null
          is_active: boolean
          monthly_price: number
          name: string
          product_code: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          installation_fee?: number | null
          is_active?: boolean
          monthly_price: number
          name: string
          product_code: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          installation_fee?: number | null
          is_active?: boolean
          monthly_price?: number
          name?: string
          product_code?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          agent_id: string | null
          created_at: string
          customer_id: string
          end_date: string | null
          id: string
          monthly_rate: number
          product_id: string
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          agent_id?: string | null
          created_at?: string
          customer_id: string
          end_date?: string | null
          id?: string
          monthly_rate: number
          product_id: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Update: {
          agent_id?: string | null
          created_at?: string
          customer_id?: string
          end_date?: string | null
          id?: string
          monthly_rate?: number
          product_id?: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
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
