export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      content_release_interests: {
        Row: {
          created_at: string
          email: string
          id: string
          notified_at: string | null
          notify_email: boolean
          universe_slug: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          notified_at?: string | null
          notify_email?: boolean
          universe_slug: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          notified_at?: string | null
          notify_email?: boolean
          universe_slug?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_release_interests_universe_slug_fkey"
            columns: ["universe_slug"]
            isOneToOne: false
            referencedRelation: "practice_universes"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "content_release_interests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_answers: {
        Row: {
          body: string
          created_at: string
          id: string
          is_teacher_answer: boolean
          question_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_teacher_answer?: boolean
          question_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_teacher_answer?: boolean
          question_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "lesson_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_answers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_questions: {
        Row: {
          body: string
          created_at: string
          id: string
          is_public: boolean
          is_resolved: boolean
          product_slug: Database["public"]["Enums"]["product_slug"]
          tutorial_level: number
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_public?: boolean
          is_resolved?: boolean
          product_slug?: Database["public"]["Enums"]["product_slug"]
          tutorial_level: number
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_public?: boolean
          is_resolved?: boolean
          product_slug?: Database["public"]["Enums"]["product_slug"]
          tutorial_level?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_questions_product_slug_fkey"
            columns: ["product_slug"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "lesson_questions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_progress: {
        Row: {
          completion_count: number
          id: string
          last_completed_at: string | null
          practice_id: string
          status: Database["public"]["Enums"]["progress_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          completion_count?: number
          id?: string
          last_completed_at?: string | null
          practice_id: string
          status?: Database["public"]["Enums"]["progress_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          completion_count?: number
          id?: string
          last_completed_at?: string | null
          practice_id?: string
          status?: Database["public"]["Enums"]["progress_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "practice_progress_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practice_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_universes: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon_path: string | null
          is_published: boolean
          name: string
          product_slug: Database["public"]["Enums"]["product_slug"]
          release_status: Database["public"]["Enums"]["content_release_status"]
          slug: string
          tagline: string | null
          text_color: string | null
          unlock_level: number | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon_path?: string | null
          is_published?: boolean
          name: string
          product_slug?: Database["public"]["Enums"]["product_slug"]
          release_status?: Database["public"]["Enums"]["content_release_status"]
          slug: string
          tagline?: string | null
          text_color?: string | null
          unlock_level?: number | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon_path?: string | null
          is_published?: boolean
          name?: string
          product_slug?: Database["public"]["Enums"]["product_slug"]
          release_status?: Database["public"]["Enums"]["content_release_status"]
          slug?: string
          tagline?: string | null
          text_color?: string | null
          unlock_level?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "practice_universes_product_slug_fkey"
            columns: ["product_slug"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["slug"]
          },
        ]
      }
      practices: {
        Row: {
          body_areas: string[]
          created_at: string
          description: string | null
          duration_minutes: number | null
          goals: string[]
          id: string
          intensity: string | null
          is_paid: boolean
          is_published: boolean
          media_kind: Database["public"]["Enums"]["media_kind"]
          media_url: string | null
          pdf_url: string | null
          safety_notes: string | null
          title: string
          universe_slug: string
          updated_at: string
        }
        Insert: {
          body_areas?: string[]
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          goals?: string[]
          id?: string
          intensity?: string | null
          is_paid?: boolean
          is_published?: boolean
          media_kind: Database["public"]["Enums"]["media_kind"]
          media_url?: string | null
          pdf_url?: string | null
          safety_notes?: string | null
          title: string
          universe_slug: string
          updated_at?: string
        }
        Update: {
          body_areas?: string[]
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          goals?: string[]
          id?: string
          intensity?: string | null
          is_paid?: boolean
          is_published?: boolean
          media_kind?: Database["public"]["Enums"]["media_kind"]
          media_url?: string | null
          pdf_url?: string | null
          safety_notes?: string | null
          title?: string
          universe_slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "practices_universe_slug_fkey"
            columns: ["universe_slug"]
            isOneToOne: false
            referencedRelation: "practice_universes"
            referencedColumns: ["slug"]
          },
        ]
      }
      product_entitlements: {
        Row: {
          created_at: string
          ends_at: string | null
          id: string
          product_slug: Database["public"]["Enums"]["product_slug"]
          source: Database["public"]["Enums"]["entitlement_source"]
          source_reference: string | null
          starts_at: string
          status: Database["public"]["Enums"]["entitlement_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ends_at?: string | null
          id?: string
          product_slug: Database["public"]["Enums"]["product_slug"]
          source: Database["public"]["Enums"]["entitlement_source"]
          source_reference?: string | null
          starts_at?: string
          status?: Database["public"]["Enums"]["entitlement_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ends_at?: string | null
          id?: string
          product_slug?: Database["public"]["Enums"]["product_slug"]
          source?: Database["public"]["Enums"]["entitlement_source"]
          source_reference?: string | null
          starts_at?: string
          status?: Database["public"]["Enums"]["entitlement_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_entitlements_product_slug_fkey"
            columns: ["product_slug"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "product_entitlements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string
          description: string | null
          is_public: boolean
          name: string
          slug: Database["public"]["Enums"]["product_slug"]
        }
        Insert: {
          created_at?: string
          description?: string | null
          is_public?: boolean
          name: string
          slug: Database["public"]["Enums"]["product_slug"]
        }
        Update: {
          created_at?: string
          description?: string | null
          is_public?: boolean
          name?: string
          slug?: Database["public"]["Enums"]["product_slug"]
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          onboarding_completed_at: string | null
          onboarding_note: string | null
          primary_goal: string | null
          timezone: string | null
          updated_at: string
          welcome_completed_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          onboarding_completed_at?: string | null
          onboarding_note?: string | null
          primary_goal?: string | null
          timezone?: string | null
          updated_at?: string
          welcome_completed_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          onboarding_completed_at?: string | null
          onboarding_note?: string | null
          primary_goal?: string | null
          timezone?: string | null
          updated_at?: string
          welcome_completed_at?: string | null
        }
        Relationships: []
      }
      progress_photos: {
        Row: {
          created_at: string
          id: string
          label: string | null
          product_slug: Database["public"]["Enums"]["product_slug"]
          storage_path: string
          taken_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          label?: string | null
          product_slug?: Database["public"]["Enums"]["product_slug"]
          storage_path: string
          taken_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string | null
          product_slug?: Database["public"]["Enums"]["product_slug"]
          storage_path?: string
          taken_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_photos_product_slug_fkey"
            columns: ["product_slug"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "progress_photos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_webhook_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          processed_at: string
          provider: Database["public"]["Enums"]["entitlement_source"]
          source_reference: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id: string
          processed_at?: string
          provider: Database["public"]["Enums"]["entitlement_source"]
          source_reference?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          processed_at?: string
          provider?: Database["public"]["Enums"]["entitlement_source"]
          source_reference?: string | null
        }
        Relationships: []
      }
      purchases: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          id: string
          product_slug: Database["public"]["Enums"]["product_slug"]
          provider: Database["public"]["Enums"]["entitlement_source"]
          provider_reference: string
          purchased_at: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          id?: string
          product_slug: Database["public"]["Enums"]["product_slug"]
          provider: Database["public"]["Enums"]["entitlement_source"]
          provider_reference: string
          purchased_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          id?: string
          product_slug?: Database["public"]["Enums"]["product_slug"]
          provider?: Database["public"]["Enums"]["entitlement_source"]
          provider_reference?: string
          purchased_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_product_slug_fkey"
            columns: ["product_slug"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_applications: {
        Row: {
          created_at: string
          experience: string | null
          id: string
          motivation: string | null
          proposed_universe: string | null
          reviewed_at: string | null
          status: Database["public"]["Enums"]["teacher_application_status"]
          submitted_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          experience?: string | null
          id?: string
          motivation?: string | null
          proposed_universe?: string | null
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["teacher_application_status"]
          submitted_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          experience?: string | null
          id?: string
          motivation?: string | null
          proposed_universe?: string | null
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["teacher_application_status"]
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tutorial_progress: {
        Row: {
          completed_at: string | null
          id: string
          level_number: number
          product_slug: Database["public"]["Enums"]["product_slug"]
          started_at: string | null
          status: Database["public"]["Enums"]["progress_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          level_number: number
          product_slug?: Database["public"]["Enums"]["product_slug"]
          started_at?: string | null
          status?: Database["public"]["Enums"]["progress_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          level_number?: number
          product_slug?: Database["public"]["Enums"]["product_slug"]
          started_at?: string | null
          status?: Database["public"]["Enums"]["progress_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tutorial_progress_product_slug_fkey"
            columns: ["product_slug"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "tutorial_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notes: {
        Row: {
          body: string
          created_at: string
          id: string
          practice_id: string | null
          product_slug: Database["public"]["Enums"]["product_slug"]
          tutorial_level: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          practice_id?: string | null
          product_slug?: Database["public"]["Enums"]["product_slug"]
          tutorial_level?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          practice_id?: string | null
          product_slug?: Database["public"]["Enums"]["product_slug"]
          tutorial_level?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notes_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_notes_product_slug_fkey"
            columns: ["product_slug"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "user_notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      content_release_status: "available" | "coming_soon"
      entitlement_source:
        | "stripe"
        | "apple_iap"
        | "manual"
        | "grant"
        | "migration"
      entitlement_status: "active" | "expired" | "revoked" | "refunded"
      media_kind: "video" | "audio" | "text" | "pdf" | "image"
      product_slug:
        | "the-user-manual"
        | "yoga-with-ethan"
        | "yoga-immersion"
        | "ignorance-is-not-bliss"
        | "one-with-the-sun"
      progress_status: "not_started" | "in_progress" | "completed"
      teacher_application_status:
        | "draft"
        | "submitted"
        | "in_review"
        | "approved"
        | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      content_release_status: ["available", "coming_soon"],
      entitlement_source: [
        "stripe",
        "apple_iap",
        "manual",
        "grant",
        "migration",
      ],
      entitlement_status: ["active", "expired", "revoked", "refunded"],
      media_kind: ["video", "audio", "text", "pdf", "image"],
      product_slug: [
        "the-user-manual",
        "yoga-with-ethan",
        "yoga-immersion",
        "ignorance-is-not-bliss",
        "one-with-the-sun",
      ],
      progress_status: ["not_started", "in_progress", "completed"],
      teacher_application_status: [
        "draft",
        "submitted",
        "in_review",
        "approved",
        "rejected",
      ],
    },
  },
} as const
