export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      analysis_jobs: {
        Row: {
          completed_at: string | null;
          created_at: string;
          error_message: string | null;
          failed_at: string | null;
          id: string;
          provider: string;
          queued_at: string;
          recording_file_id: string;
          started_at: string | null;
          status: Database["public"]["Enums"]["analysis_job_status"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string;
          error_message?: string | null;
          failed_at?: string | null;
          id?: string;
          provider?: string;
          queued_at?: string;
          recording_file_id: string;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["analysis_job_status"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string;
          error_message?: string | null;
          failed_at?: string | null;
          id?: string;
          provider?: string;
          queued_at?: string;
          recording_file_id?: string;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["analysis_job_status"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "analysis_jobs_recording_file_id_user_id_fkey";
            columns: ["recording_file_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "recording_files";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      analysis_results: {
        Row: {
          analysis_job_id: string;
          created_at: string;
          deleted_at: string | null;
          feedback: Json;
          id: string;
          recording_file_id: string;
          score: number | null;
          status: Database["public"]["Enums"]["analysis_result_status"];
          transcript: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          analysis_job_id: string;
          created_at?: string;
          deleted_at?: string | null;
          feedback: Json;
          id?: string;
          recording_file_id: string;
          score?: number | null;
          status?: Database["public"]["Enums"]["analysis_result_status"];
          transcript: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          analysis_job_id?: string;
          created_at?: string;
          deleted_at?: string | null;
          feedback?: Json;
          id?: string;
          recording_file_id?: string;
          score?: number | null;
          status?: Database["public"]["Enums"]["analysis_result_status"];
          transcript?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "analysis_results_analysis_job_id_user_id_recording_file_id_fkey";
            columns: ["analysis_job_id", "user_id", "recording_file_id"];
            isOneToOne: false;
            referencedRelation: "analysis_jobs";
            referencedColumns: ["id", "user_id", "recording_file_id"];
          },
          {
            foreignKeyName: "analysis_results_recording_file_id_user_id_fkey";
            columns: ["recording_file_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "recording_files";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      file_cleanup_logs: {
        Row: {
          attempted_at: string;
          bucket_id: string;
          completed_at: string | null;
          created_at: string;
          error_message: string | null;
          id: string;
          object_path: string;
          recording_file_id: string | null;
          status: Database["public"]["Enums"]["cleanup_status"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          attempted_at?: string;
          bucket_id: string;
          completed_at?: string | null;
          created_at?: string;
          error_message?: string | null;
          id?: string;
          object_path: string;
          recording_file_id?: string | null;
          status?: Database["public"]["Enums"]["cleanup_status"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          attempted_at?: string;
          bucket_id?: string;
          completed_at?: string | null;
          created_at?: string;
          error_message?: string | null;
          id?: string;
          object_path?: string;
          recording_file_id?: string | null;
          status?: Database["public"]["Enums"]["cleanup_status"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "file_cleanup_logs_recording_file_id_user_id_fkey";
            columns: ["recording_file_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "recording_files";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      memorization_materials: {
        Row: {
          created_at: string;
          deleted_at: string | null;
          id: string;
          paragraphs: Json;
          status: Database["public"]["Enums"]["material_status"];
          tags: string[];
          title: string;
          translation: Json | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          paragraphs: Json;
          status?: Database["public"]["Enums"]["material_status"];
          tags?: string[];
          title: string;
          translation?: Json | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          paragraphs?: Json;
          status?: Database["public"]["Enums"]["material_status"];
          tags?: string[];
          title?: string;
          translation?: Json | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      memorization_sessions: {
        Row: {
          completed_at: string | null;
          created_at: string;
          deleted_at: string | null;
          id: string;
          material_id: string | null;
          material_title_snapshot: string;
          paragraphs_snapshot: Json;
          started_at: string | null;
          status: Database["public"]["Enums"]["practice_session_status"];
          translation_snapshot: Json | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          material_id?: string | null;
          material_title_snapshot: string;
          paragraphs_snapshot: Json;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["practice_session_status"];
          translation_snapshot?: Json | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          material_id?: string | null;
          material_title_snapshot?: string;
          paragraphs_snapshot?: Json;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["practice_session_status"];
          translation_snapshot?: Json | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "memorization_sessions_material_id_user_id_fkey";
            columns: ["material_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "memorization_materials";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      recording_files: {
        Row: {
          bucket_id: string;
          created_at: string;
          deleted_at: string | null;
          duration_ms: number | null;
          id: string;
          memorization_session_id: string | null;
          mime_type: string;
          object_path: string;
          roleplay_session_id: string | null;
          size_bytes: number;
          status: Database["public"]["Enums"]["recording_file_status"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          bucket_id: string;
          created_at?: string;
          deleted_at?: string | null;
          duration_ms?: number | null;
          id?: string;
          memorization_session_id?: string | null;
          mime_type: string;
          object_path: string;
          roleplay_session_id?: string | null;
          size_bytes: number;
          status?: Database["public"]["Enums"]["recording_file_status"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          bucket_id?: string;
          created_at?: string;
          deleted_at?: string | null;
          duration_ms?: number | null;
          id?: string;
          memorization_session_id?: string | null;
          mime_type?: string;
          object_path?: string;
          roleplay_session_id?: string | null;
          size_bytes?: number;
          status?: Database["public"]["Enums"]["recording_file_status"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recording_files_memorization_session_id_user_id_fkey";
            columns: ["memorization_session_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "memorization_sessions";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "recording_files_roleplay_session_id_user_id_fkey";
            columns: ["roleplay_session_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "roleplay_sessions";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      roleplay_lines: {
        Row: {
          created_at: string;
          id: string;
          line_order: number;
          material_id: string;
          speaker: string;
          text: string;
          translation: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          line_order: number;
          material_id: string;
          speaker: string;
          text: string;
          translation?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          line_order?: number;
          material_id?: string;
          speaker?: string;
          text?: string;
          translation?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "roleplay_lines_material_id_user_id_fkey";
            columns: ["material_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "roleplay_materials";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      roleplay_materials: {
        Row: {
          created_at: string;
          deleted_at: string | null;
          id: string;
          situation: string;
          status: Database["public"]["Enums"]["material_status"];
          tags: string[];
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          situation: string;
          status?: Database["public"]["Enums"]["material_status"];
          tags?: string[];
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          situation?: string;
          status?: Database["public"]["Enums"]["material_status"];
          tags?: string[];
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      roleplay_session_lines: {
        Row: {
          created_at: string;
          id: string;
          line_order: number;
          session_id: string;
          speaker_snapshot: string;
          text_snapshot: string;
          translation_snapshot: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          line_order: number;
          session_id: string;
          speaker_snapshot: string;
          text_snapshot: string;
          translation_snapshot?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          line_order?: number;
          session_id?: string;
          speaker_snapshot?: string;
          text_snapshot?: string;
          translation_snapshot?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "roleplay_session_lines_session_id_user_id_fkey";
            columns: ["session_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "roleplay_sessions";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      roleplay_sessions: {
        Row: {
          completed_at: string | null;
          created_at: string;
          deleted_at: string | null;
          id: string;
          material_id: string | null;
          material_title_snapshot: string;
          situation_snapshot: string;
          started_at: string | null;
          status: Database["public"]["Enums"]["practice_session_status"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          material_id?: string | null;
          material_title_snapshot: string;
          situation_snapshot: string;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["practice_session_status"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          material_id?: string | null;
          material_title_snapshot?: string;
          situation_snapshot?: string;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["practice_session_status"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "roleplay_sessions_material_id_user_id_fkey";
            columns: ["material_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "roleplay_materials";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      analysis_job_status: "queued" | "processing" | "completed" | "failed" | "canceled";
      analysis_result_status: "available" | "deleted";
      cleanup_status: "pending" | "completed" | "failed";
      material_status: "active" | "deleted";
      practice_session_status: "ready" | "practicing" | "completed" | "abandoned" | "deleted";
      recording_file_status: "stored" | "cleanup_pending" | "deleted";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      analysis_job_status: ["queued", "processing", "completed", "failed", "canceled"],
      analysis_result_status: ["available", "deleted"],
      cleanup_status: ["pending", "completed", "failed"],
      material_status: ["active", "deleted"],
      practice_session_status: ["ready", "practicing", "completed", "abandoned", "deleted"],
      recording_file_status: ["stored", "cleanup_pending", "deleted"],
    },
  },
} as const;
