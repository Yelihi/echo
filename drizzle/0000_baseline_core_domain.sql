CREATE TYPE "public"."analysis_job_status" AS ENUM('queued', 'processing', 'completed', 'failed', 'canceled');--> statement-breakpoint
CREATE TYPE "public"."cleanup_failure_source" AS ENUM('draft_recording', 'accepted_recording', 'session_delete');--> statement-breakpoint
CREATE TYPE "public"."material_status" AS ENUM('active', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."practice_session_status" AS ENUM('ready', 'in_progress', 'completed', 'deleted');--> statement-breakpoint
CREATE TABLE "accepted_recordings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"roleplay_session_id" uuid,
	"roleplay_line_id" uuid,
	"memorization_session_id" uuid,
	"memorization_sentence_id" uuid,
	"bucket_id" text NOT NULL,
	"object_path" text NOT NULL,
	"mime_type" text NOT NULL,
	"size_bytes" bigint NOT NULL,
	"duration_ms" integer,
	"accepted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "accepted_recordings_bucket_id_object_path_unique" UNIQUE("bucket_id","object_path"),
	CONSTRAINT "accepted_recordings_id_user_id_unique" UNIQUE("id","user_id"),
	CONSTRAINT "accepted_recordings_single_target_check" CHECK ((
        "accepted_recordings"."roleplay_session_id" is not null
        and "accepted_recordings"."roleplay_line_id" is not null
        and "accepted_recordings"."memorization_session_id" is null
        and "accepted_recordings"."memorization_sentence_id" is null
      ) or (
        "accepted_recordings"."roleplay_session_id" is null
        and "accepted_recordings"."roleplay_line_id" is null
        and "accepted_recordings"."memorization_session_id" is not null
        and "accepted_recordings"."memorization_sentence_id" is not null
      )),
	CONSTRAINT "bucket_id_length_check" CHECK (char_length(trim("accepted_recordings"."bucket_id")) between 1 and 120),
	CONSTRAINT "object_path_length_check" CHECK (char_length(trim("accepted_recordings"."object_path")) between 1 and 1024),
	CONSTRAINT "mime_type_audio_check" CHECK ("accepted_recordings"."mime_type" like 'audio/%'),
	CONSTRAINT "size_bytes_positive_check" CHECK ("accepted_recordings"."size_bytes" > 0),
	CONSTRAINT "duration_ms_positive_or_null_check" CHECK ("accepted_recordings"."duration_ms" is null or "accepted_recordings"."duration_ms" > 0)
);
--> statement-breakpoint
CREATE TABLE "analysis_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"roleplay_session_id" uuid,
	"memorization_session_id" uuid,
	"status" "analysis_job_status" DEFAULT 'queued' NOT NULL,
	"provider" text DEFAULT 'openai' NOT NULL,
	"queued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"failed_at" timestamp with time zone,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "analysis_jobs_id_user_id_unique" UNIQUE("id","user_id"),
	CONSTRAINT "analysis_jobs_single_session_check" CHECK (("analysis_jobs"."roleplay_session_id" is not null)::integer + ("analysis_jobs"."memorization_session_id" is not null)::integer = 1),
	CONSTRAINT "analysis_jobs_provider_length_check" CHECK (char_length(trim("analysis_jobs"."provider")) between 1 and 80),
	CONSTRAINT "analysis_jobs_started_after_queued_check" CHECK ("analysis_jobs"."started_at" is null or "analysis_jobs"."started_at" >= "analysis_jobs"."queued_at"),
	CONSTRAINT "analysis_jobs_completed_after_queued_check" CHECK ("analysis_jobs"."completed_at" is null or "analysis_jobs"."completed_at" >= "analysis_jobs"."queued_at"),
	CONSTRAINT "analysis_jobs_completed_after_started_check" CHECK ("analysis_jobs"."completed_at" is null or "analysis_jobs"."started_at" is null or "analysis_jobs"."completed_at" >= "analysis_jobs"."started_at"),
	CONSTRAINT "analysis_jobs_failed_after_queued_check" CHECK ("analysis_jobs"."failed_at" is null or "analysis_jobs"."failed_at" >= "analysis_jobs"."queued_at"),
	CONSTRAINT "analysis_jobs_failed_after_started_check" CHECK ("analysis_jobs"."failed_at" is null or "analysis_jobs"."started_at" is null or "analysis_jobs"."failed_at" >= "analysis_jobs"."started_at")
);
--> statement-breakpoint
CREATE TABLE "cleanup_failure_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"source" "cleanup_failure_source" NOT NULL,
	"bucket_id" text NOT NULL,
	"object_path" text NOT NULL,
	"mime_type" text NOT NULL,
	"size_bytes" bigint NOT NULL,
	"duration_ms" integer,
	"error_message" text NOT NULL,
	"attempted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cleanup_failure_logs_error_message_length_check" CHECK (char_length(trim("cleanup_failure_logs"."error_message")) > 0),
	CONSTRAINT "bucket_id_length_check" CHECK (char_length(trim("cleanup_failure_logs"."bucket_id")) between 1 and 120),
	CONSTRAINT "object_path_length_check" CHECK (char_length(trim("cleanup_failure_logs"."object_path")) between 1 and 1024),
	CONSTRAINT "mime_type_audio_check" CHECK ("cleanup_failure_logs"."mime_type" like 'audio/%'),
	CONSTRAINT "size_bytes_positive_check" CHECK ("cleanup_failure_logs"."size_bytes" > 0),
	CONSTRAINT "duration_ms_positive_or_null_check" CHECK ("cleanup_failure_logs"."duration_ms" is null or "cleanup_failure_logs"."duration_ms" > 0)
);
--> statement-breakpoint
CREATE TABLE "draft_recordings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"roleplay_session_id" uuid,
	"roleplay_line_id" uuid,
	"memorization_session_id" uuid,
	"memorization_sentence_id" uuid,
	"bucket_id" text NOT NULL,
	"object_path" text NOT NULL,
	"mime_type" text NOT NULL,
	"size_bytes" bigint NOT NULL,
	"duration_ms" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "draft_recordings_bucket_id_object_path_unique" UNIQUE("bucket_id","object_path"),
	CONSTRAINT "draft_recordings_id_user_id_unique" UNIQUE("id","user_id"),
	CONSTRAINT "draft_recordings_single_target_check" CHECK ((
        "draft_recordings"."roleplay_session_id" is not null
        and "draft_recordings"."roleplay_line_id" is not null
        and "draft_recordings"."memorization_session_id" is null
        and "draft_recordings"."memorization_sentence_id" is null
      ) or (
        "draft_recordings"."roleplay_session_id" is null
        and "draft_recordings"."roleplay_line_id" is null
        and "draft_recordings"."memorization_session_id" is not null
        and "draft_recordings"."memorization_sentence_id" is not null
      )),
	CONSTRAINT "bucket_id_length_check" CHECK (char_length(trim("draft_recordings"."bucket_id")) between 1 and 120),
	CONSTRAINT "object_path_length_check" CHECK (char_length(trim("draft_recordings"."object_path")) between 1 and 1024),
	CONSTRAINT "mime_type_audio_check" CHECK ("draft_recordings"."mime_type" like 'audio/%'),
	CONSTRAINT "size_bytes_positive_check" CHECK ("draft_recordings"."size_bytes" > 0),
	CONSTRAINT "duration_ms_positive_or_null_check" CHECK ("draft_recordings"."duration_ms" is null or "draft_recordings"."duration_ms" > 0)
);
--> statement-breakpoint
CREATE TABLE "memorization_material_paragraphs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"material_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"paragraph_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "memorization_material_paragraphs_id_material_id_user_id_unique" UNIQUE("id","material_id","user_id"),
	CONSTRAINT "memorization_material_paragraphs_material_id_paragraph_order_unique" UNIQUE("material_id","paragraph_order"),
	CONSTRAINT "memorization_material_paragraphs_paragraph_order_check" CHECK ("memorization_material_paragraphs"."paragraph_order" >= 0)
);
--> statement-breakpoint
CREATE TABLE "memorization_material_sentences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"paragraph_id" uuid NOT NULL,
	"material_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"sentence_order" integer NOT NULL,
	"text" text NOT NULL,
	"translation" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "memorization_material_sentences_paragraph_id_sentence_order_unique" UNIQUE("paragraph_id","sentence_order"),
	CONSTRAINT "memorization_material_sentences_sentence_order_check" CHECK ("memorization_material_sentences"."sentence_order" >= 0),
	CONSTRAINT "memorization_material_sentences_text_length_check" CHECK (char_length(trim("memorization_material_sentences"."text")) between 1 and 2000)
);
--> statement-breakpoint
CREATE TABLE "memorization_material_tags" (
	"material_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"display_name" text NOT NULL,
	"normalized_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "memorization_material_tags_material_id_normalized_name_pk" PRIMARY KEY("material_id","normalized_name"),
	CONSTRAINT "memorization_material_tags_display_name_length_check" CHECK (char_length(trim("memorization_material_tags"."display_name")) between 1 and 80),
	CONSTRAINT "memorization_material_tags_normalized_name_length_check" CHECK (char_length(trim("memorization_material_tags"."normalized_name")) between 1 and 80)
);
--> statement-breakpoint
CREATE TABLE "memorization_materials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"status" "material_status" DEFAULT 'active' NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "memorization_materials_id_user_id_unique" UNIQUE("id","user_id"),
	CONSTRAINT "memorization_materials_title_length_check" CHECK (char_length(trim("memorization_materials"."title")) between 1 and 120),
	CONSTRAINT "memorization_materials_status_deleted_at_check" CHECK (("memorization_materials"."status" = 'deleted' and "memorization_materials"."deleted_at" is not null) or ("memorization_materials"."status" = 'active' and "memorization_materials"."deleted_at" is null))
);
--> statement-breakpoint
CREATE TABLE "memorization_session_paragraphs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"paragraph_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "memorization_session_paragraphs_id_session_id_user_id_unique" UNIQUE("id","session_id","user_id"),
	CONSTRAINT "memorization_session_paragraphs_session_id_paragraph_order_unique" UNIQUE("session_id","paragraph_order"),
	CONSTRAINT "memorization_session_paragraphs_paragraph_order_check" CHECK ("memorization_session_paragraphs"."paragraph_order" >= 0)
);
--> statement-breakpoint
CREATE TABLE "memorization_session_sentences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"paragraph_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"sentence_order" integer NOT NULL,
	"text_snapshot" text NOT NULL,
	"translation_snapshot" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "memorization_session_sentences_id_session_id_user_id_unique" UNIQUE("id","session_id","user_id"),
	CONSTRAINT "memorization_session_sentences_id_user_id_unique" UNIQUE("id","user_id"),
	CONSTRAINT "memorization_session_sentences_paragraph_id_sentence_order_unique" UNIQUE("paragraph_id","sentence_order"),
	CONSTRAINT "memorization_session_sentences_sentence_order_check" CHECK ("memorization_session_sentences"."sentence_order" >= 0),
	CONSTRAINT "memorization_session_sentences_text_snapshot_length_check" CHECK (char_length(trim("memorization_session_sentences"."text_snapshot")) between 1 and 2000)
);
--> statement-breakpoint
CREATE TABLE "memorization_session_tags" (
	"session_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"display_name" text NOT NULL,
	"normalized_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "memorization_session_tags_session_id_normalized_name_pk" PRIMARY KEY("session_id","normalized_name"),
	CONSTRAINT "memorization_session_tags_display_name_length_check" CHECK (char_length(trim("memorization_session_tags"."display_name")) between 1 and 80),
	CONSTRAINT "memorization_session_tags_normalized_name_length_check" CHECK (char_length(trim("memorization_session_tags"."normalized_name")) between 1 and 80)
);
--> statement-breakpoint
CREATE TABLE "memorization_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"material_id" uuid,
	"material_title_snapshot" text NOT NULL,
	"current_paragraph_order" integer DEFAULT 0 NOT NULL,
	"current_sentence_order" integer DEFAULT 0 NOT NULL,
	"status" "practice_session_status" DEFAULT 'ready' NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "memorization_sessions_id_user_id_unique" UNIQUE("id","user_id"),
	CONSTRAINT "memorization_sessions_material_title_snapshot_length_check" CHECK (char_length(trim("memorization_sessions"."material_title_snapshot")) between 1 and 120),
	CONSTRAINT "memorization_sessions_current_paragraph_order_check" CHECK ("memorization_sessions"."current_paragraph_order" >= 0),
	CONSTRAINT "memorization_sessions_current_sentence_order_check" CHECK ("memorization_sessions"."current_sentence_order" >= 0),
	CONSTRAINT "memorization_sessions_completed_after_started_check" CHECK ("memorization_sessions"."completed_at" is null or "memorization_sessions"."started_at" is null or "memorization_sessions"."completed_at" >= "memorization_sessions"."started_at"),
	CONSTRAINT "memorization_sessions_status_deleted_at_check" CHECK (("memorization_sessions"."status" = 'deleted' and "memorization_sessions"."deleted_at" is not null) or ("memorization_sessions"."status" <> 'deleted' and "memorization_sessions"."deleted_at" is null))
);
--> statement-breakpoint
CREATE TABLE "practice_target_analysis_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"analysis_job_id" uuid NOT NULL,
	"roleplay_line_id" uuid,
	"memorization_sentence_id" uuid,
	"transcript" text NOT NULL,
	"feedback" jsonb NOT NULL,
	"score" numeric(5, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "practice_target_analysis_results_id_user_id_unique" UNIQUE("id","user_id"),
	CONSTRAINT "practice_target_analysis_results_analysis_job_id_roleplay_line_id_unique" UNIQUE("analysis_job_id","roleplay_line_id"),
	CONSTRAINT "practice_target_analysis_results_analysis_job_id_memorization_sentence_id_unique" UNIQUE("analysis_job_id","memorization_sentence_id"),
	CONSTRAINT "practice_target_analysis_results_single_target_check" CHECK (("practice_target_analysis_results"."roleplay_line_id" is not null)::integer + ("practice_target_analysis_results"."memorization_sentence_id" is not null)::integer = 1),
	CONSTRAINT "practice_target_analysis_results_transcript_length_check" CHECK (char_length(trim("practice_target_analysis_results"."transcript")) > 0),
	CONSTRAINT "practice_target_analysis_results_feedback_object_check" CHECK (jsonb_typeof("practice_target_analysis_results"."feedback") = 'object'),
	CONSTRAINT "practice_target_analysis_results_score_range_check" CHECK ("practice_target_analysis_results"."score" is null or ("practice_target_analysis_results"."score" >= 0 and "practice_target_analysis_results"."score" <= 100))
);
--> statement-breakpoint
CREATE TABLE "roleplay_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"material_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"line_order" integer NOT NULL,
	"speaker_order" smallint NOT NULL,
	"text" text NOT NULL,
	"translation" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "roleplay_lines_id_material_id_user_id_unique" UNIQUE("id","material_id","user_id"),
	CONSTRAINT "roleplay_lines_material_id_line_order_unique" UNIQUE("material_id","line_order"),
	CONSTRAINT "roleplay_lines_line_order_check" CHECK ("roleplay_lines"."line_order" >= 0),
	CONSTRAINT "roleplay_lines_speaker_order_check" CHECK ("roleplay_lines"."speaker_order" in (1, 2)),
	CONSTRAINT "roleplay_lines_text_length_check" CHECK (char_length(trim("roleplay_lines"."text")) between 1 and 2000)
);
--> statement-breakpoint
CREATE TABLE "roleplay_material_tags" (
	"material_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"display_name" text NOT NULL,
	"normalized_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "roleplay_material_tags_material_id_normalized_name_pk" PRIMARY KEY("material_id","normalized_name"),
	CONSTRAINT "roleplay_material_tags_display_name_length_check" CHECK (char_length(trim("roleplay_material_tags"."display_name")) between 1 and 80),
	CONSTRAINT "roleplay_material_tags_normalized_name_length_check" CHECK (char_length(trim("roleplay_material_tags"."normalized_name")) between 1 and 80)
);
--> statement-breakpoint
CREATE TABLE "roleplay_materials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"situation" text NOT NULL,
	"speaker_one_name" text NOT NULL,
	"speaker_two_name" text NOT NULL,
	"status" "material_status" DEFAULT 'active' NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "roleplay_materials_id_user_id_unique" UNIQUE("id","user_id"),
	CONSTRAINT "roleplay_materials_title_length_check" CHECK (char_length(trim("roleplay_materials"."title")) between 1 and 120),
	CONSTRAINT "roleplay_materials_situation_length_check" CHECK (char_length(trim("roleplay_materials"."situation")) between 1 and 2000),
	CONSTRAINT "roleplay_materials_speaker_one_name_length_check" CHECK (char_length(trim("roleplay_materials"."speaker_one_name")) between 1 and 80),
	CONSTRAINT "roleplay_materials_speaker_two_name_length_check" CHECK (char_length(trim("roleplay_materials"."speaker_two_name")) between 1 and 80),
	CONSTRAINT "roleplay_materials_speakers_distinct_check" CHECK ("roleplay_materials"."speaker_one_name" <> "roleplay_materials"."speaker_two_name"),
	CONSTRAINT "roleplay_materials_status_deleted_at_check" CHECK (("roleplay_materials"."status" = 'deleted' and "roleplay_materials"."deleted_at" is not null) or ("roleplay_materials"."status" = 'active' and "roleplay_materials"."deleted_at" is null))
);
--> statement-breakpoint
CREATE TABLE "roleplay_session_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"line_order" integer NOT NULL,
	"speaker_order" smallint NOT NULL,
	"text_snapshot" text NOT NULL,
	"translation_snapshot" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "roleplay_session_lines_id_session_id_user_id_unique" UNIQUE("id","session_id","user_id"),
	CONSTRAINT "roleplay_session_lines_id_user_id_unique" UNIQUE("id","user_id"),
	CONSTRAINT "roleplay_session_lines_session_id_line_order_unique" UNIQUE("session_id","line_order"),
	CONSTRAINT "roleplay_session_lines_line_order_check" CHECK ("roleplay_session_lines"."line_order" >= 0),
	CONSTRAINT "roleplay_session_lines_speaker_order_check" CHECK ("roleplay_session_lines"."speaker_order" in (1, 2)),
	CONSTRAINT "roleplay_session_lines_text_snapshot_length_check" CHECK (char_length(trim("roleplay_session_lines"."text_snapshot")) between 1 and 2000)
);
--> statement-breakpoint
CREATE TABLE "roleplay_session_tags" (
	"session_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"display_name" text NOT NULL,
	"normalized_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "roleplay_session_tags_session_id_normalized_name_pk" PRIMARY KEY("session_id","normalized_name"),
	CONSTRAINT "roleplay_session_tags_display_name_length_check" CHECK (char_length(trim("roleplay_session_tags"."display_name")) between 1 and 80),
	CONSTRAINT "roleplay_session_tags_normalized_name_length_check" CHECK (char_length(trim("roleplay_session_tags"."normalized_name")) between 1 and 80)
);
--> statement-breakpoint
CREATE TABLE "roleplay_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"material_id" uuid,
	"material_title_snapshot" text NOT NULL,
	"situation_snapshot" text NOT NULL,
	"speaker_one_name_snapshot" text NOT NULL,
	"speaker_two_name_snapshot" text NOT NULL,
	"selected_learner_speaker_order" smallint NOT NULL,
	"current_line_order" integer DEFAULT 0 NOT NULL,
	"status" "practice_session_status" DEFAULT 'ready' NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "roleplay_sessions_id_user_id_unique" UNIQUE("id","user_id"),
	CONSTRAINT "roleplay_sessions_material_title_snapshot_length_check" CHECK (char_length(trim("roleplay_sessions"."material_title_snapshot")) between 1 and 120),
	CONSTRAINT "roleplay_sessions_situation_snapshot_length_check" CHECK (char_length(trim("roleplay_sessions"."situation_snapshot")) between 1 and 2000),
	CONSTRAINT "roleplay_sessions_speaker_one_name_snapshot_length_check" CHECK (char_length(trim("roleplay_sessions"."speaker_one_name_snapshot")) between 1 and 80),
	CONSTRAINT "roleplay_sessions_speaker_two_name_snapshot_length_check" CHECK (char_length(trim("roleplay_sessions"."speaker_two_name_snapshot")) between 1 and 80),
	CONSTRAINT "roleplay_sessions_selected_learner_speaker_order_check" CHECK ("roleplay_sessions"."selected_learner_speaker_order" in (1, 2)),
	CONSTRAINT "roleplay_sessions_current_line_order_check" CHECK ("roleplay_sessions"."current_line_order" >= 0),
	CONSTRAINT "roleplay_sessions_speaker_snapshots_distinct_check" CHECK ("roleplay_sessions"."speaker_one_name_snapshot" <> "roleplay_sessions"."speaker_two_name_snapshot"),
	CONSTRAINT "roleplay_sessions_completed_after_started_check" CHECK ("roleplay_sessions"."completed_at" is null or "roleplay_sessions"."started_at" is null or "roleplay_sessions"."completed_at" >= "roleplay_sessions"."started_at"),
	CONSTRAINT "roleplay_sessions_status_deleted_at_check" CHECK (("roleplay_sessions"."status" = 'deleted' and "roleplay_sessions"."deleted_at" is not null) or ("roleplay_sessions"."status" <> 'deleted' and "roleplay_sessions"."deleted_at" is null))
);
--> statement-breakpoint
CREATE TABLE "session_analysis_summaries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"analysis_job_id" uuid NOT NULL,
	"roleplay_session_id" uuid,
	"memorization_session_id" uuid,
	"summary" jsonb NOT NULL,
	"score" numeric(5, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "session_analysis_summaries_id_user_id_unique" UNIQUE("id","user_id"),
	CONSTRAINT "session_analysis_summaries_analysis_job_id_unique" UNIQUE("analysis_job_id"),
	CONSTRAINT "session_analysis_summaries_single_session_check" CHECK (("session_analysis_summaries"."roleplay_session_id" is not null)::integer + ("session_analysis_summaries"."memorization_session_id" is not null)::integer = 1),
	CONSTRAINT "session_analysis_summaries_summary_object_check" CHECK (jsonb_typeof("session_analysis_summaries"."summary") = 'object'),
	CONSTRAINT "session_analysis_summaries_score_range_check" CHECK ("session_analysis_summaries"."score" is null or ("session_analysis_summaries"."score" >= 0 and "session_analysis_summaries"."score" <= 100))
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"display_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_profiles_display_name_length_check" CHECK ("user_profiles"."display_name" is null or char_length(trim("user_profiles"."display_name")) between 1 and 80)
);
--> statement-breakpoint
ALTER TABLE "accepted_recordings" ADD CONSTRAINT "accepted_recordings_roleplay_line_id_roleplay_session_id_user_id_roleplay_session_lines_id_session_id_user_id_fk" FOREIGN KEY ("roleplay_line_id","roleplay_session_id","user_id") REFERENCES "public"."roleplay_session_lines"("id","session_id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accepted_recordings" ADD CONSTRAINT "accepted_recordings_memorization_sentence_id_memorization_session_id_user_id_memorization_session_sentences_id_session_id_user_id_fk" FOREIGN KEY ("memorization_sentence_id","memorization_session_id","user_id") REFERENCES "public"."memorization_session_sentences"("id","session_id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analysis_jobs" ADD CONSTRAINT "analysis_jobs_roleplay_session_id_user_id_roleplay_sessions_id_user_id_fk" FOREIGN KEY ("roleplay_session_id","user_id") REFERENCES "public"."roleplay_sessions"("id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analysis_jobs" ADD CONSTRAINT "analysis_jobs_memorization_session_id_user_id_memorization_sessions_id_user_id_fk" FOREIGN KEY ("memorization_session_id","user_id") REFERENCES "public"."memorization_sessions"("id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "draft_recordings" ADD CONSTRAINT "draft_recordings_roleplay_line_id_roleplay_session_id_user_id_roleplay_session_lines_id_session_id_user_id_fk" FOREIGN KEY ("roleplay_line_id","roleplay_session_id","user_id") REFERENCES "public"."roleplay_session_lines"("id","session_id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "draft_recordings" ADD CONSTRAINT "draft_recordings_memorization_sentence_id_memorization_session_id_user_id_memorization_session_sentences_id_session_id_user_id_fk" FOREIGN KEY ("memorization_sentence_id","memorization_session_id","user_id") REFERENCES "public"."memorization_session_sentences"("id","session_id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memorization_material_paragraphs" ADD CONSTRAINT "memorization_material_paragraphs_material_id_user_id_memorization_materials_id_user_id_fk" FOREIGN KEY ("material_id","user_id") REFERENCES "public"."memorization_materials"("id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memorization_material_sentences" ADD CONSTRAINT "memorization_material_sentences_paragraph_id_material_id_user_id_memorization_material_paragraphs_id_material_id_user_id_fk" FOREIGN KEY ("paragraph_id","material_id","user_id") REFERENCES "public"."memorization_material_paragraphs"("id","material_id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memorization_material_tags" ADD CONSTRAINT "memorization_material_tags_material_id_user_id_memorization_materials_id_user_id_fk" FOREIGN KEY ("material_id","user_id") REFERENCES "public"."memorization_materials"("id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memorization_session_paragraphs" ADD CONSTRAINT "memorization_session_paragraphs_session_id_user_id_memorization_sessions_id_user_id_fk" FOREIGN KEY ("session_id","user_id") REFERENCES "public"."memorization_sessions"("id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memorization_session_sentences" ADD CONSTRAINT "memorization_session_sentences_paragraph_id_session_id_user_id_memorization_session_paragraphs_id_session_id_user_id_fk" FOREIGN KEY ("paragraph_id","session_id","user_id") REFERENCES "public"."memorization_session_paragraphs"("id","session_id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memorization_session_tags" ADD CONSTRAINT "memorization_session_tags_session_id_user_id_memorization_sessions_id_user_id_fk" FOREIGN KEY ("session_id","user_id") REFERENCES "public"."memorization_sessions"("id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memorization_sessions" ADD CONSTRAINT "memorization_sessions_material_id_user_id_memorization_materials_id_user_id_fk" FOREIGN KEY ("material_id","user_id") REFERENCES "public"."memorization_materials"("id","user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_target_analysis_results" ADD CONSTRAINT "practice_target_analysis_results_analysis_job_id_user_id_analysis_jobs_id_user_id_fk" FOREIGN KEY ("analysis_job_id","user_id") REFERENCES "public"."analysis_jobs"("id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_target_analysis_results" ADD CONSTRAINT "practice_target_analysis_results_roleplay_line_id_user_id_roleplay_session_lines_id_user_id_fk" FOREIGN KEY ("roleplay_line_id","user_id") REFERENCES "public"."roleplay_session_lines"("id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_target_analysis_results" ADD CONSTRAINT "practice_target_analysis_results_memorization_sentence_id_user_id_memorization_session_sentences_id_user_id_fk" FOREIGN KEY ("memorization_sentence_id","user_id") REFERENCES "public"."memorization_session_sentences"("id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roleplay_lines" ADD CONSTRAINT "roleplay_lines_material_id_user_id_roleplay_materials_id_user_id_fk" FOREIGN KEY ("material_id","user_id") REFERENCES "public"."roleplay_materials"("id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roleplay_material_tags" ADD CONSTRAINT "roleplay_material_tags_material_id_user_id_roleplay_materials_id_user_id_fk" FOREIGN KEY ("material_id","user_id") REFERENCES "public"."roleplay_materials"("id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roleplay_session_lines" ADD CONSTRAINT "roleplay_session_lines_session_id_user_id_roleplay_sessions_id_user_id_fk" FOREIGN KEY ("session_id","user_id") REFERENCES "public"."roleplay_sessions"("id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roleplay_session_tags" ADD CONSTRAINT "roleplay_session_tags_session_id_user_id_roleplay_sessions_id_user_id_fk" FOREIGN KEY ("session_id","user_id") REFERENCES "public"."roleplay_sessions"("id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roleplay_sessions" ADD CONSTRAINT "roleplay_sessions_material_id_user_id_roleplay_materials_id_user_id_fk" FOREIGN KEY ("material_id","user_id") REFERENCES "public"."roleplay_materials"("id","user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_analysis_summaries" ADD CONSTRAINT "session_analysis_summaries_analysis_job_id_user_id_analysis_jobs_id_user_id_fk" FOREIGN KEY ("analysis_job_id","user_id") REFERENCES "public"."analysis_jobs"("id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_analysis_summaries" ADD CONSTRAINT "session_analysis_summaries_roleplay_session_id_user_id_roleplay_sessions_id_user_id_fk" FOREIGN KEY ("roleplay_session_id","user_id") REFERENCES "public"."roleplay_sessions"("id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_analysis_summaries" ADD CONSTRAINT "session_analysis_summaries_memorization_session_id_user_id_memorization_sessions_id_user_id_fk" FOREIGN KEY ("memorization_session_id","user_id") REFERENCES "public"."memorization_sessions"("id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "accepted_recordings_one_roleplay_target_idx" ON "accepted_recordings" USING btree ("roleplay_line_id") WHERE "accepted_recordings"."roleplay_line_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "accepted_recordings_one_memorization_target_idx" ON "accepted_recordings" USING btree ("memorization_sentence_id") WHERE "accepted_recordings"."memorization_sentence_id" is not null;--> statement-breakpoint
CREATE INDEX "accepted_recordings_user_accepted_idx" ON "accepted_recordings" USING btree ("user_id","accepted_at" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "analysis_jobs_one_roleplay_session_idx" ON "analysis_jobs" USING btree ("roleplay_session_id") WHERE "analysis_jobs"."roleplay_session_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "analysis_jobs_one_memorization_session_idx" ON "analysis_jobs" USING btree ("memorization_session_id") WHERE "analysis_jobs"."memorization_session_id" is not null;--> statement-breakpoint
CREATE INDEX "analysis_jobs_user_status_queued_idx" ON "analysis_jobs" USING btree ("user_id","status","queued_at");--> statement-breakpoint
CREATE INDEX "cleanup_failure_logs_user_attempted_idx" ON "cleanup_failure_logs" USING btree ("user_id","attempted_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "cleanup_failure_logs_source_attempted_idx" ON "cleanup_failure_logs" USING btree ("source","attempted_at" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "draft_recordings_one_roleplay_target_idx" ON "draft_recordings" USING btree ("roleplay_line_id") WHERE "draft_recordings"."roleplay_line_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "draft_recordings_one_memorization_target_idx" ON "draft_recordings" USING btree ("memorization_sentence_id") WHERE "draft_recordings"."memorization_sentence_id" is not null;--> statement-breakpoint
CREATE INDEX "draft_recordings_user_created_idx" ON "draft_recordings" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "memorization_material_paragraphs_user_order_idx" ON "memorization_material_paragraphs" USING btree ("user_id","material_id","paragraph_order");--> statement-breakpoint
CREATE INDEX "memorization_material_sentences_user_order_idx" ON "memorization_material_sentences" USING btree ("user_id","paragraph_id","sentence_order");--> statement-breakpoint
CREATE INDEX "memorization_material_tags_user_normalized_idx" ON "memorization_material_tags" USING btree ("user_id","normalized_name");--> statement-breakpoint
CREATE INDEX "memorization_materials_user_status_updated_idx" ON "memorization_materials" USING btree ("user_id","status","updated_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "memorization_session_paragraphs_user_order_idx" ON "memorization_session_paragraphs" USING btree ("user_id","session_id","paragraph_order");--> statement-breakpoint
CREATE INDEX "memorization_session_sentences_user_order_idx" ON "memorization_session_sentences" USING btree ("user_id","paragraph_id","sentence_order");--> statement-breakpoint
CREATE INDEX "memorization_session_tags_user_normalized_idx" ON "memorization_session_tags" USING btree ("user_id","normalized_name");--> statement-breakpoint
CREATE INDEX "memorization_sessions_user_status_created_idx" ON "memorization_sessions" USING btree ("user_id","status","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "memorization_sessions_material_idx" ON "memorization_sessions" USING btree ("material_id");--> statement-breakpoint
CREATE INDEX "practice_target_analysis_results_user_job_idx" ON "practice_target_analysis_results" USING btree ("user_id","analysis_job_id");--> statement-breakpoint
CREATE INDEX "roleplay_lines_user_material_order_idx" ON "roleplay_lines" USING btree ("user_id","material_id","line_order");--> statement-breakpoint
CREATE INDEX "roleplay_material_tags_user_normalized_idx" ON "roleplay_material_tags" USING btree ("user_id","normalized_name");--> statement-breakpoint
CREATE INDEX "roleplay_materials_user_status_updated_idx" ON "roleplay_materials" USING btree ("user_id","status","updated_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "roleplay_session_lines_user_session_order_idx" ON "roleplay_session_lines" USING btree ("user_id","session_id","line_order");--> statement-breakpoint
CREATE INDEX "roleplay_session_tags_user_normalized_idx" ON "roleplay_session_tags" USING btree ("user_id","normalized_name");--> statement-breakpoint
CREATE INDEX "roleplay_sessions_user_status_created_idx" ON "roleplay_sessions" USING btree ("user_id","status","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "roleplay_sessions_material_idx" ON "roleplay_sessions" USING btree ("material_id");--> statement-breakpoint
CREATE INDEX "session_analysis_summaries_user_created_idx" ON "session_analysis_summaries" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "user_profiles_updated_idx" ON "user_profiles" USING btree ("updated_at" DESC NULLS LAST);