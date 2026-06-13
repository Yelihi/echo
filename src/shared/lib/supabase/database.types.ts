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
      accepted_recordings: {
        Row: {
          accepted_at: string;
          bucket_id: string;
          created_at: string;
          duration_ms: number | null;
          id: string;
          memorization_sentence_id: string | null;
          memorization_session_id: string | null;
          mime_type: string;
          object_path: string;
          roleplay_line_id: string | null;
          roleplay_session_id: string | null;
          size_bytes: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          accepted_at?: string;
          bucket_id: string;
          created_at?: string;
          duration_ms?: number | null;
          id?: string;
          memorization_sentence_id?: string | null;
          memorization_session_id?: string | null;
          mime_type: string;
          object_path: string;
          roleplay_line_id?: string | null;
          roleplay_session_id?: string | null;
          size_bytes: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          accepted_at?: string;
          bucket_id?: string;
          created_at?: string;
          duration_ms?: number | null;
          id?: string;
          memorization_sentence_id?: string | null;
          memorization_session_id?: string | null;
          mime_type?: string;
          object_path?: string;
          roleplay_line_id?: string | null;
          roleplay_session_id?: string | null;
          size_bytes?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "accepted_recordings_memorization_sentence_id_memorization__fkey";
            columns: ["memorization_sentence_id", "memorization_session_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "memorization_session_sentences";
            referencedColumns: ["id", "session_id", "user_id"];
          },
          {
            foreignKeyName: "accepted_recordings_roleplay_line_id_roleplay_session_id_u_fkey";
            columns: ["roleplay_line_id", "roleplay_session_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "roleplay_session_lines";
            referencedColumns: ["id", "session_id", "user_id"];
          },
        ];
      };
      analysis_jobs: {
        Row: {
          completed_at: string | null;
          created_at: string;
          error_message: string | null;
          failed_at: string | null;
          id: string;
          memorization_session_id: string | null;
          provider: string;
          queued_at: string;
          roleplay_session_id: string | null;
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
          memorization_session_id?: string | null;
          provider?: string;
          queued_at?: string;
          roleplay_session_id?: string | null;
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
          memorization_session_id?: string | null;
          provider?: string;
          queued_at?: string;
          roleplay_session_id?: string | null;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["analysis_job_status"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "analysis_jobs_memorization_session_id_user_id_fkey";
            columns: ["memorization_session_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "memorization_sessions";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "analysis_jobs_roleplay_session_id_user_id_fkey";
            columns: ["roleplay_session_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "roleplay_sessions";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      cleanup_failure_logs: {
        Row: {
          attempted_at: string;
          bucket_id: string;
          created_at: string;
          duration_ms: number | null;
          error_message: string;
          id: string;
          mime_type: string;
          object_path: string;
          size_bytes: number;
          source: Database["public"]["Enums"]["cleanup_failure_source"];
          user_id: string;
        };
        Insert: {
          attempted_at?: string;
          bucket_id: string;
          created_at?: string;
          duration_ms?: number | null;
          error_message: string;
          id?: string;
          mime_type: string;
          object_path: string;
          size_bytes: number;
          source: Database["public"]["Enums"]["cleanup_failure_source"];
          user_id: string;
        };
        Update: {
          attempted_at?: string;
          bucket_id?: string;
          created_at?: string;
          duration_ms?: number | null;
          error_message?: string;
          id?: string;
          mime_type?: string;
          object_path?: string;
          size_bytes?: number;
          source?: Database["public"]["Enums"]["cleanup_failure_source"];
          user_id?: string;
        };
        Relationships: [];
      };
      draft_recordings: {
        Row: {
          bucket_id: string;
          created_at: string;
          duration_ms: number | null;
          id: string;
          memorization_sentence_id: string | null;
          memorization_session_id: string | null;
          mime_type: string;
          object_path: string;
          roleplay_line_id: string | null;
          roleplay_session_id: string | null;
          size_bytes: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          bucket_id: string;
          created_at?: string;
          duration_ms?: number | null;
          id?: string;
          memorization_sentence_id?: string | null;
          memorization_session_id?: string | null;
          mime_type: string;
          object_path: string;
          roleplay_line_id?: string | null;
          roleplay_session_id?: string | null;
          size_bytes: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          bucket_id?: string;
          created_at?: string;
          duration_ms?: number | null;
          id?: string;
          memorization_sentence_id?: string | null;
          memorization_session_id?: string | null;
          mime_type?: string;
          object_path?: string;
          roleplay_line_id?: string | null;
          roleplay_session_id?: string | null;
          size_bytes?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "draft_recordings_memorization_sentence_id_memorization_ses_fkey";
            columns: ["memorization_sentence_id", "memorization_session_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "memorization_session_sentences";
            referencedColumns: ["id", "session_id", "user_id"];
          },
          {
            foreignKeyName: "draft_recordings_roleplay_line_id_roleplay_session_id_user_fkey";
            columns: ["roleplay_line_id", "roleplay_session_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "roleplay_session_lines";
            referencedColumns: ["id", "session_id", "user_id"];
          },
        ];
      };
      memorization_material_paragraphs: {
        Row: {
          created_at: string;
          id: string;
          material_id: string;
          paragraph_order: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          material_id: string;
          paragraph_order: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          material_id?: string;
          paragraph_order?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "memorization_material_paragraphs_material_id_user_id_fkey";
            columns: ["material_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "memorization_materials";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      memorization_material_sentences: {
        Row: {
          created_at: string;
          id: string;
          material_id: string;
          paragraph_id: string;
          sentence_order: number;
          text: string;
          translation: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          material_id: string;
          paragraph_id: string;
          sentence_order: number;
          text: string;
          translation?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          material_id?: string;
          paragraph_id?: string;
          sentence_order?: number;
          text?: string;
          translation?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "memorization_material_sentenc_paragraph_id_material_id_use_fkey";
            columns: ["paragraph_id", "material_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "memorization_material_paragraphs";
            referencedColumns: ["id", "material_id", "user_id"];
          },
        ];
      };
      memorization_material_tags: {
        Row: {
          created_at: string;
          display_name: string;
          material_id: string;
          normalized_name: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          display_name: string;
          material_id: string;
          normalized_name: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          display_name?: string;
          material_id?: string;
          normalized_name?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "memorization_material_tags_material_id_user_id_fkey";
            columns: ["material_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "memorization_materials";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      memorization_materials: {
        Row: {
          created_at: string;
          deleted_at: string | null;
          id: string;
          status: Database["public"]["Enums"]["material_status"];
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          status?: Database["public"]["Enums"]["material_status"];
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          status?: Database["public"]["Enums"]["material_status"];
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      memorization_session_paragraphs: {
        Row: {
          created_at: string;
          id: string;
          paragraph_order: number;
          session_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          paragraph_order: number;
          session_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          paragraph_order?: number;
          session_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "memorization_session_paragraphs_session_id_user_id_fkey";
            columns: ["session_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "memorization_sessions";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      memorization_session_sentences: {
        Row: {
          created_at: string;
          id: string;
          paragraph_id: string;
          sentence_order: number;
          session_id: string;
          text_snapshot: string;
          translation_snapshot: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          paragraph_id: string;
          sentence_order: number;
          session_id: string;
          text_snapshot: string;
          translation_snapshot?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          paragraph_id?: string;
          sentence_order?: number;
          session_id?: string;
          text_snapshot?: string;
          translation_snapshot?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "memorization_session_sentence_paragraph_id_session_id_user_fkey";
            columns: ["paragraph_id", "session_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "memorization_session_paragraphs";
            referencedColumns: ["id", "session_id", "user_id"];
          },
        ];
      };
      memorization_session_tags: {
        Row: {
          created_at: string;
          display_name: string;
          normalized_name: string;
          session_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          display_name: string;
          normalized_name: string;
          session_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          display_name?: string;
          normalized_name?: string;
          session_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "memorization_session_tags_session_id_user_id_fkey";
            columns: ["session_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "memorization_sessions";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      memorization_sessions: {
        Row: {
          completed_at: string | null;
          created_at: string;
          current_paragraph_order: number;
          current_sentence_order: number;
          deleted_at: string | null;
          id: string;
          material_id: string | null;
          material_title_snapshot: string;
          started_at: string | null;
          status: Database["public"]["Enums"]["practice_session_status"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string;
          current_paragraph_order?: number;
          current_sentence_order?: number;
          deleted_at?: string | null;
          id?: string;
          material_id?: string | null;
          material_title_snapshot: string;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["practice_session_status"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string;
          current_paragraph_order?: number;
          current_sentence_order?: number;
          deleted_at?: string | null;
          id?: string;
          material_id?: string | null;
          material_title_snapshot?: string;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["practice_session_status"];
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
      practice_target_analysis_results: {
        Row: {
          analysis_job_id: string;
          created_at: string;
          feedback: Json;
          id: string;
          memorization_sentence_id: string | null;
          memorization_session_id: string | null;
          roleplay_line_id: string | null;
          roleplay_session_id: string | null;
          score: number | null;
          transcript: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          analysis_job_id: string;
          created_at?: string;
          feedback: Json;
          id?: string;
          memorization_sentence_id?: string | null;
          memorization_session_id?: string | null;
          roleplay_line_id?: string | null;
          roleplay_session_id?: string | null;
          score?: number | null;
          transcript: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          analysis_job_id?: string;
          created_at?: string;
          feedback?: Json;
          id?: string;
          memorization_sentence_id?: string | null;
          memorization_session_id?: string | null;
          roleplay_line_id?: string | null;
          roleplay_session_id?: string | null;
          score?: number | null;
          transcript?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "practice_target_analysis_resu_analysis_job_id_user_id_memo_fkey";
            columns: ["analysis_job_id", "user_id", "memorization_session_id"];
            isOneToOne: false;
            referencedRelation: "analysis_jobs";
            referencedColumns: ["id", "user_id", "memorization_session_id"];
          },
          {
            foreignKeyName: "practice_target_analysis_resu_analysis_job_id_user_id_role_fkey";
            columns: ["analysis_job_id", "user_id", "roleplay_session_id"];
            isOneToOne: false;
            referencedRelation: "analysis_jobs";
            referencedColumns: ["id", "user_id", "roleplay_session_id"];
          },
          {
            foreignKeyName: "practice_target_analysis_resu_memorization_sentence_id_mem_fkey";
            columns: ["memorization_sentence_id", "memorization_session_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "memorization_session_sentences";
            referencedColumns: ["id", "session_id", "user_id"];
          },
          {
            foreignKeyName: "practice_target_analysis_resu_roleplay_line_id_roleplay_se_fkey";
            columns: ["roleplay_line_id", "roleplay_session_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "roleplay_session_lines";
            referencedColumns: ["id", "session_id", "user_id"];
          },
          {
            foreignKeyName: "practice_target_analysis_results_analysis_job_id_user_id_fkey";
            columns: ["analysis_job_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "analysis_jobs";
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
          speaker_order: number;
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
          speaker_order: number;
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
          speaker_order?: number;
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
      roleplay_material_tags: {
        Row: {
          created_at: string;
          display_name: string;
          material_id: string;
          normalized_name: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          display_name: string;
          material_id: string;
          normalized_name: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          display_name?: string;
          material_id?: string;
          normalized_name?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "roleplay_material_tags_material_id_user_id_fkey";
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
          speaker_one_name: string;
          speaker_two_name: string;
          status: Database["public"]["Enums"]["material_status"];
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          situation: string;
          speaker_one_name: string;
          speaker_two_name: string;
          status?: Database["public"]["Enums"]["material_status"];
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          situation?: string;
          speaker_one_name?: string;
          speaker_two_name?: string;
          status?: Database["public"]["Enums"]["material_status"];
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
          speaker_order: number;
          text_snapshot: string;
          translation_snapshot: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          line_order: number;
          session_id: string;
          speaker_order: number;
          text_snapshot: string;
          translation_snapshot?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          line_order?: number;
          session_id?: string;
          speaker_order?: number;
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
      roleplay_session_tags: {
        Row: {
          created_at: string;
          display_name: string;
          normalized_name: string;
          session_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          display_name: string;
          normalized_name: string;
          session_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          display_name?: string;
          normalized_name?: string;
          session_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "roleplay_session_tags_session_id_user_id_fkey";
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
          current_line_order: number;
          deleted_at: string | null;
          id: string;
          material_id: string | null;
          material_title_snapshot: string;
          selected_learner_speaker_order: number;
          situation_snapshot: string;
          speaker_one_name_snapshot: string;
          speaker_two_name_snapshot: string;
          started_at: string | null;
          status: Database["public"]["Enums"]["practice_session_status"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string;
          current_line_order?: number;
          deleted_at?: string | null;
          id?: string;
          material_id?: string | null;
          material_title_snapshot: string;
          selected_learner_speaker_order: number;
          situation_snapshot: string;
          speaker_one_name_snapshot: string;
          speaker_two_name_snapshot: string;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["practice_session_status"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string;
          current_line_order?: number;
          deleted_at?: string | null;
          id?: string;
          material_id?: string | null;
          material_title_snapshot?: string;
          selected_learner_speaker_order?: number;
          situation_snapshot?: string;
          speaker_one_name_snapshot?: string;
          speaker_two_name_snapshot?: string;
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
      session_analysis_summaries: {
        Row: {
          analysis_job_id: string;
          created_at: string;
          id: string;
          memorization_session_id: string | null;
          roleplay_session_id: string | null;
          score: number | null;
          summary: Json;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          analysis_job_id: string;
          created_at?: string;
          id?: string;
          memorization_session_id?: string | null;
          roleplay_session_id?: string | null;
          score?: number | null;
          summary: Json;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          analysis_job_id?: string;
          created_at?: string;
          id?: string;
          memorization_session_id?: string | null;
          roleplay_session_id?: string | null;
          score?: number | null;
          summary?: Json;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "session_analysis_summaries_analysis_job_id_user_id_fkey";
            columns: ["analysis_job_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "analysis_jobs";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "session_analysis_summaries_analysis_job_id_user_id_memoriz_fkey";
            columns: ["analysis_job_id", "user_id", "memorization_session_id"];
            isOneToOne: false;
            referencedRelation: "analysis_jobs";
            referencedColumns: ["id", "user_id", "memorization_session_id"];
          },
          {
            foreignKeyName: "session_analysis_summaries_analysis_job_id_user_id_rolepla_fkey";
            columns: ["analysis_job_id", "user_id", "roleplay_session_id"];
            isOneToOne: false;
            referencedRelation: "analysis_jobs";
            referencedColumns: ["id", "user_id", "roleplay_session_id"];
          },
          {
            foreignKeyName: "session_analysis_summaries_memorization_session_id_user_id_fkey";
            columns: ["memorization_session_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "memorization_sessions";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "session_analysis_summaries_roleplay_session_id_user_id_fkey";
            columns: ["roleplay_session_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "roleplay_sessions";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      user_profiles: {
        Row: {
          created_at: string;
          display_name: string | null;
          id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          display_name?: string | null;
          id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          display_name?: string | null;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
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
      cleanup_failure_source: "draft_recording" | "accepted_recording" | "session_delete";
      material_status: "active" | "deleted";
      practice_session_status: "ready" | "in_progress" | "completed" | "deleted";
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
      cleanup_failure_source: ["draft_recording", "accepted_recording", "session_delete"],
      material_status: ["active", "deleted"],
      practice_session_status: ["ready", "in_progress", "completed", "deleted"],
    },
  },
} as const;
