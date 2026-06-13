import { sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  bigint,
  check,
  foreignKey,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const createdAt = timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();
const deletedAt = timestamp("deleted_at", { withTimezone: true });

export const materialStatus = pgEnum("material_status", ["active", "deleted"]);
export const practiceSessionStatus = pgEnum("practice_session_status", [
  "ready",
  "in_progress",
  "completed",
  "deleted",
]);
export const analysisJobStatus = pgEnum("analysis_job_status", [
  "queued",
  "processing",
  "completed",
  "failed",
  "canceled",
]);
export const cleanupFailureSource = pgEnum("cleanup_failure_source", [
  "draft_recording",
  "accepted_recording",
  "session_delete",
]);

export const userProfiles = pgTable(
  "user_profiles",
  {
    id: uuid("id").primaryKey(),
    displayName: text("display_name"),
    createdAt,
    updatedAt,
  },
  (table) => [
    check(
      "user_profiles_display_name_length_check",
      sql`${table.displayName} is null or char_length(trim(${table.displayName})) between 1 and 80`,
    ),
    index("user_profiles_updated_idx").on(table.updatedAt.desc()),
  ],
);

export const roleplayMaterials = pgTable(
  "roleplay_materials",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    title: text("title").notNull(),
    situation: text("situation").notNull(),
    speakerOneName: text("speaker_one_name").notNull(),
    speakerTwoName: text("speaker_two_name").notNull(),
    status: materialStatus("status").notNull().default("active"),
    deletedAt,
    createdAt,
    updatedAt,
  },
  (table) => [
    unique("roleplay_materials_id_user_id_unique").on(table.id, table.userId),
    check(
      "roleplay_materials_title_length_check",
      sql`char_length(trim(${table.title})) between 1 and 120`,
    ),
    check(
      "roleplay_materials_situation_length_check",
      sql`char_length(trim(${table.situation})) between 1 and 2000`,
    ),
    check(
      "roleplay_materials_speaker_one_name_length_check",
      sql`char_length(trim(${table.speakerOneName})) between 1 and 80`,
    ),
    check(
      "roleplay_materials_speaker_two_name_length_check",
      sql`char_length(trim(${table.speakerTwoName})) between 1 and 80`,
    ),
    check(
      "roleplay_materials_speakers_distinct_check",
      sql`${table.speakerOneName} <> ${table.speakerTwoName}`,
    ),
    check(
      "roleplay_materials_status_deleted_at_check",
      sql`(${table.status} = 'deleted' and ${table.deletedAt} is not null) or (${table.status} = 'active' and ${table.deletedAt} is null)`,
    ),
    index("roleplay_materials_user_status_updated_idx").on(
      table.userId,
      table.status,
      table.updatedAt.desc(),
    ),
  ],
);

export const roleplayMaterialTags = pgTable(
  "roleplay_material_tags",
  {
    materialId: uuid("material_id").notNull(),
    userId: uuid("user_id").notNull(),
    displayName: text("display_name").notNull(),
    normalizedName: text("normalized_name").notNull(),
    createdAt,
  },
  (table) => [
    primaryKey({ columns: [table.materialId, table.normalizedName] }),
    foreignKey({
      columns: [table.materialId, table.userId],
      foreignColumns: [roleplayMaterials.id, roleplayMaterials.userId],
    }).onDelete("cascade"),
    check(
      "roleplay_material_tags_display_name_length_check",
      sql`char_length(trim(${table.displayName})) between 1 and 80`,
    ),
    check(
      "roleplay_material_tags_normalized_name_length_check",
      sql`char_length(trim(${table.normalizedName})) between 1 and 80`,
    ),
    index("roleplay_material_tags_user_normalized_idx").on(table.userId, table.normalizedName),
  ],
);

export const roleplayLines = pgTable(
  "roleplay_lines",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    materialId: uuid("material_id").notNull(),
    userId: uuid("user_id").notNull(),
    lineOrder: integer("line_order").notNull(),
    speakerOrder: smallint("speaker_order").notNull(),
    text: text("text").notNull(),
    translation: text("translation"),
    createdAt,
    updatedAt,
  },
  (table) => [
    unique("roleplay_lines_id_material_id_user_id_unique").on(
      table.id,
      table.materialId,
      table.userId,
    ),
    unique("roleplay_lines_material_id_line_order_unique").on(table.materialId, table.lineOrder),
    foreignKey({
      columns: [table.materialId, table.userId],
      foreignColumns: [roleplayMaterials.id, roleplayMaterials.userId],
    }).onDelete("cascade"),
    check("roleplay_lines_line_order_check", sql`${table.lineOrder} >= 0`),
    check("roleplay_lines_speaker_order_check", sql`${table.speakerOrder} in (1, 2)`),
    check(
      "roleplay_lines_text_length_check",
      sql`char_length(trim(${table.text})) between 1 and 2000`,
    ),
    index("roleplay_lines_user_material_order_idx").on(
      table.userId,
      table.materialId,
      table.lineOrder,
    ),
  ],
);

export const memorizationMaterials = pgTable(
  "memorization_materials",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    title: text("title").notNull(),
    status: materialStatus("status").notNull().default("active"),
    deletedAt,
    createdAt,
    updatedAt,
  },
  (table) => [
    unique("memorization_materials_id_user_id_unique").on(table.id, table.userId),
    check(
      "memorization_materials_title_length_check",
      sql`char_length(trim(${table.title})) between 1 and 120`,
    ),
    check(
      "memorization_materials_status_deleted_at_check",
      sql`(${table.status} = 'deleted' and ${table.deletedAt} is not null) or (${table.status} = 'active' and ${table.deletedAt} is null)`,
    ),
    index("memorization_materials_user_status_updated_idx").on(
      table.userId,
      table.status,
      table.updatedAt.desc(),
    ),
  ],
);

export const memorizationMaterialTags = pgTable(
  "memorization_material_tags",
  {
    materialId: uuid("material_id").notNull(),
    userId: uuid("user_id").notNull(),
    displayName: text("display_name").notNull(),
    normalizedName: text("normalized_name").notNull(),
    createdAt,
  },
  (table) => [
    primaryKey({ columns: [table.materialId, table.normalizedName] }),
    foreignKey({
      columns: [table.materialId, table.userId],
      foreignColumns: [memorizationMaterials.id, memorizationMaterials.userId],
    }).onDelete("cascade"),
    check(
      "memorization_material_tags_display_name_length_check",
      sql`char_length(trim(${table.displayName})) between 1 and 80`,
    ),
    check(
      "memorization_material_tags_normalized_name_length_check",
      sql`char_length(trim(${table.normalizedName})) between 1 and 80`,
    ),
    index("memorization_material_tags_user_normalized_idx").on(table.userId, table.normalizedName),
  ],
);

export const memorizationMaterialParagraphs = pgTable(
  "memorization_material_paragraphs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    materialId: uuid("material_id").notNull(),
    userId: uuid("user_id").notNull(),
    paragraphOrder: integer("paragraph_order").notNull(),
    createdAt,
    updatedAt,
  },
  (table) => [
    unique("memorization_material_paragraphs_id_material_id_user_id_unique").on(
      table.id,
      table.materialId,
      table.userId,
    ),
    unique("memorization_material_paragraphs_material_id_paragraph_order_unique").on(
      table.materialId,
      table.paragraphOrder,
    ),
    foreignKey({
      columns: [table.materialId, table.userId],
      foreignColumns: [memorizationMaterials.id, memorizationMaterials.userId],
    }).onDelete("cascade"),
    check(
      "memorization_material_paragraphs_paragraph_order_check",
      sql`${table.paragraphOrder} >= 0`,
    ),
    index("memorization_material_paragraphs_user_order_idx").on(
      table.userId,
      table.materialId,
      table.paragraphOrder,
    ),
  ],
);

export const memorizationMaterialSentences = pgTable(
  "memorization_material_sentences",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    paragraphId: uuid("paragraph_id").notNull(),
    materialId: uuid("material_id").notNull(),
    userId: uuid("user_id").notNull(),
    sentenceOrder: integer("sentence_order").notNull(),
    text: text("text").notNull(),
    translation: text("translation"),
    createdAt,
    updatedAt,
  },
  (table) => [
    unique("memorization_material_sentences_paragraph_id_sentence_order_unique").on(
      table.paragraphId,
      table.sentenceOrder,
    ),
    foreignKey({
      columns: [table.paragraphId, table.materialId, table.userId],
      foreignColumns: [
        memorizationMaterialParagraphs.id,
        memorizationMaterialParagraphs.materialId,
        memorizationMaterialParagraphs.userId,
      ],
    }).onDelete("cascade"),
    check("memorization_material_sentences_sentence_order_check", sql`${table.sentenceOrder} >= 0`),
    check(
      "memorization_material_sentences_text_length_check",
      sql`char_length(trim(${table.text})) between 1 and 2000`,
    ),
    index("memorization_material_sentences_user_order_idx").on(
      table.userId,
      table.paragraphId,
      table.sentenceOrder,
    ),
  ],
);

export const roleplaySessions = pgTable(
  "roleplay_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    materialId: uuid("material_id"),
    materialTitleSnapshot: text("material_title_snapshot").notNull(),
    situationSnapshot: text("situation_snapshot").notNull(),
    speakerOneNameSnapshot: text("speaker_one_name_snapshot").notNull(),
    speakerTwoNameSnapshot: text("speaker_two_name_snapshot").notNull(),
    selectedLearnerSpeakerOrder: smallint("selected_learner_speaker_order").notNull(),
    currentLineOrder: integer("current_line_order").notNull().default(0),
    status: practiceSessionStatus("status").notNull().default("ready"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    deletedAt,
    createdAt,
    updatedAt,
  },
  (table) => [
    unique("roleplay_sessions_id_user_id_unique").on(table.id, table.userId),
    foreignKey({
      columns: [table.materialId, table.userId],
      foreignColumns: [roleplayMaterials.id, roleplayMaterials.userId],
    }).onDelete("set null"),
    check(
      "roleplay_sessions_material_title_snapshot_length_check",
      sql`char_length(trim(${table.materialTitleSnapshot})) between 1 and 120`,
    ),
    check(
      "roleplay_sessions_situation_snapshot_length_check",
      sql`char_length(trim(${table.situationSnapshot})) between 1 and 2000`,
    ),
    check(
      "roleplay_sessions_speaker_one_name_snapshot_length_check",
      sql`char_length(trim(${table.speakerOneNameSnapshot})) between 1 and 80`,
    ),
    check(
      "roleplay_sessions_speaker_two_name_snapshot_length_check",
      sql`char_length(trim(${table.speakerTwoNameSnapshot})) between 1 and 80`,
    ),
    check(
      "roleplay_sessions_selected_learner_speaker_order_check",
      sql`${table.selectedLearnerSpeakerOrder} in (1, 2)`,
    ),
    check("roleplay_sessions_current_line_order_check", sql`${table.currentLineOrder} >= 0`),
    check(
      "roleplay_sessions_speaker_snapshots_distinct_check",
      sql`${table.speakerOneNameSnapshot} <> ${table.speakerTwoNameSnapshot}`,
    ),
    check(
      "roleplay_sessions_completed_after_started_check",
      sql`${table.completedAt} is null or ${table.startedAt} is null or ${table.completedAt} >= ${table.startedAt}`,
    ),
    check(
      "roleplay_sessions_status_deleted_at_check",
      sql`(${table.status} = 'deleted' and ${table.deletedAt} is not null) or (${table.status} <> 'deleted' and ${table.deletedAt} is null)`,
    ),
    index("roleplay_sessions_user_status_created_idx").on(
      table.userId,
      table.status,
      table.createdAt.desc(),
    ),
    index("roleplay_sessions_material_idx").on(table.materialId),
  ],
);

export const roleplaySessionTags = pgTable(
  "roleplay_session_tags",
  {
    sessionId: uuid("session_id").notNull(),
    userId: uuid("user_id").notNull(),
    displayName: text("display_name").notNull(),
    normalizedName: text("normalized_name").notNull(),
    createdAt,
  },
  (table) => [
    primaryKey({ columns: [table.sessionId, table.normalizedName] }),
    foreignKey({
      columns: [table.sessionId, table.userId],
      foreignColumns: [roleplaySessions.id, roleplaySessions.userId],
    }).onDelete("cascade"),
    check(
      "roleplay_session_tags_display_name_length_check",
      sql`char_length(trim(${table.displayName})) between 1 and 80`,
    ),
    check(
      "roleplay_session_tags_normalized_name_length_check",
      sql`char_length(trim(${table.normalizedName})) between 1 and 80`,
    ),
    index("roleplay_session_tags_user_normalized_idx").on(table.userId, table.normalizedName),
  ],
);

export const roleplaySessionLines = pgTable(
  "roleplay_session_lines",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id").notNull(),
    userId: uuid("user_id").notNull(),
    lineOrder: integer("line_order").notNull(),
    speakerOrder: smallint("speaker_order").notNull(),
    textSnapshot: text("text_snapshot").notNull(),
    translationSnapshot: text("translation_snapshot"),
    createdAt,
  },
  (table) => [
    unique("roleplay_session_lines_id_session_id_user_id_unique").on(
      table.id,
      table.sessionId,
      table.userId,
    ),
    unique("roleplay_session_lines_id_user_id_unique").on(table.id, table.userId),
    unique("roleplay_session_lines_session_id_line_order_unique").on(
      table.sessionId,
      table.lineOrder,
    ),
    foreignKey({
      columns: [table.sessionId, table.userId],
      foreignColumns: [roleplaySessions.id, roleplaySessions.userId],
    }).onDelete("cascade"),
    check("roleplay_session_lines_line_order_check", sql`${table.lineOrder} >= 0`),
    check("roleplay_session_lines_speaker_order_check", sql`${table.speakerOrder} in (1, 2)`),
    check(
      "roleplay_session_lines_text_snapshot_length_check",
      sql`char_length(trim(${table.textSnapshot})) between 1 and 2000`,
    ),
    index("roleplay_session_lines_user_session_order_idx").on(
      table.userId,
      table.sessionId,
      table.lineOrder,
    ),
  ],
);

export const memorizationSessions = pgTable(
  "memorization_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    materialId: uuid("material_id"),
    materialTitleSnapshot: text("material_title_snapshot").notNull(),
    currentParagraphOrder: integer("current_paragraph_order").notNull().default(0),
    currentSentenceOrder: integer("current_sentence_order").notNull().default(0),
    status: practiceSessionStatus("status").notNull().default("ready"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    deletedAt,
    createdAt,
    updatedAt,
  },
  (table) => [
    unique("memorization_sessions_id_user_id_unique").on(table.id, table.userId),
    foreignKey({
      columns: [table.materialId, table.userId],
      foreignColumns: [memorizationMaterials.id, memorizationMaterials.userId],
    }).onDelete("set null"),
    check(
      "memorization_sessions_material_title_snapshot_length_check",
      sql`char_length(trim(${table.materialTitleSnapshot})) between 1 and 120`,
    ),
    check(
      "memorization_sessions_current_paragraph_order_check",
      sql`${table.currentParagraphOrder} >= 0`,
    ),
    check(
      "memorization_sessions_current_sentence_order_check",
      sql`${table.currentSentenceOrder} >= 0`,
    ),
    check(
      "memorization_sessions_completed_after_started_check",
      sql`${table.completedAt} is null or ${table.startedAt} is null or ${table.completedAt} >= ${table.startedAt}`,
    ),
    check(
      "memorization_sessions_status_deleted_at_check",
      sql`(${table.status} = 'deleted' and ${table.deletedAt} is not null) or (${table.status} <> 'deleted' and ${table.deletedAt} is null)`,
    ),
    index("memorization_sessions_user_status_created_idx").on(
      table.userId,
      table.status,
      table.createdAt.desc(),
    ),
    index("memorization_sessions_material_idx").on(table.materialId),
  ],
);

export const memorizationSessionTags = pgTable(
  "memorization_session_tags",
  {
    sessionId: uuid("session_id").notNull(),
    userId: uuid("user_id").notNull(),
    displayName: text("display_name").notNull(),
    normalizedName: text("normalized_name").notNull(),
    createdAt,
  },
  (table) => [
    primaryKey({ columns: [table.sessionId, table.normalizedName] }),
    foreignKey({
      columns: [table.sessionId, table.userId],
      foreignColumns: [memorizationSessions.id, memorizationSessions.userId],
    }).onDelete("cascade"),
    check(
      "memorization_session_tags_display_name_length_check",
      sql`char_length(trim(${table.displayName})) between 1 and 80`,
    ),
    check(
      "memorization_session_tags_normalized_name_length_check",
      sql`char_length(trim(${table.normalizedName})) between 1 and 80`,
    ),
    index("memorization_session_tags_user_normalized_idx").on(table.userId, table.normalizedName),
  ],
);

export const memorizationSessionParagraphs = pgTable(
  "memorization_session_paragraphs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id").notNull(),
    userId: uuid("user_id").notNull(),
    paragraphOrder: integer("paragraph_order").notNull(),
    createdAt,
  },
  (table) => [
    unique("memorization_session_paragraphs_id_session_id_user_id_unique").on(
      table.id,
      table.sessionId,
      table.userId,
    ),
    unique("memorization_session_paragraphs_session_id_paragraph_order_unique").on(
      table.sessionId,
      table.paragraphOrder,
    ),
    foreignKey({
      columns: [table.sessionId, table.userId],
      foreignColumns: [memorizationSessions.id, memorizationSessions.userId],
    }).onDelete("cascade"),
    check(
      "memorization_session_paragraphs_paragraph_order_check",
      sql`${table.paragraphOrder} >= 0`,
    ),
    index("memorization_session_paragraphs_user_order_idx").on(
      table.userId,
      table.sessionId,
      table.paragraphOrder,
    ),
  ],
);

export const memorizationSessionSentences = pgTable(
  "memorization_session_sentences",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    paragraphId: uuid("paragraph_id").notNull(),
    sessionId: uuid("session_id").notNull(),
    userId: uuid("user_id").notNull(),
    sentenceOrder: integer("sentence_order").notNull(),
    textSnapshot: text("text_snapshot").notNull(),
    translationSnapshot: text("translation_snapshot"),
    createdAt,
  },
  (table) => [
    unique("memorization_session_sentences_id_session_id_user_id_unique").on(
      table.id,
      table.sessionId,
      table.userId,
    ),
    unique("memorization_session_sentences_id_user_id_unique").on(table.id, table.userId),
    unique("memorization_session_sentences_paragraph_id_sentence_order_unique").on(
      table.paragraphId,
      table.sentenceOrder,
    ),
    foreignKey({
      columns: [table.paragraphId, table.sessionId, table.userId],
      foreignColumns: [
        memorizationSessionParagraphs.id,
        memorizationSessionParagraphs.sessionId,
        memorizationSessionParagraphs.userId,
      ],
    }).onDelete("cascade"),
    check("memorization_session_sentences_sentence_order_check", sql`${table.sentenceOrder} >= 0`),
    check(
      "memorization_session_sentences_text_snapshot_length_check",
      sql`char_length(trim(${table.textSnapshot})) between 1 and 2000`,
    ),
    index("memorization_session_sentences_user_order_idx").on(
      table.userId,
      table.paragraphId,
      table.sentenceOrder,
    ),
  ],
);

const recordingColumns = {
  bucketId: text("bucket_id").notNull(),
  objectPath: text("object_path").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
  durationMs: integer("duration_ms"),
};

type RecordingColumns = {
  bucketId: AnyPgColumn;
  objectPath: AnyPgColumn;
  mimeType: AnyPgColumn;
  sizeBytes: AnyPgColumn;
  durationMs: AnyPgColumn;
};

const recordingChecks = <T extends RecordingColumns>(table: T) => [
  check("bucket_id_length_check", sql`char_length(trim(${table.bucketId})) between 1 and 120`),
  check("object_path_length_check", sql`char_length(trim(${table.objectPath})) between 1 and 1024`),
  check("mime_type_audio_check", sql`${table.mimeType} like 'audio/%'`),
  check("size_bytes_positive_check", sql`${table.sizeBytes} > 0`),
  check(
    "duration_ms_positive_or_null_check",
    sql`${table.durationMs} is null or ${table.durationMs} > 0`,
  ),
];

export const draftRecordings = pgTable(
  "draft_recordings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    roleplaySessionId: uuid("roleplay_session_id"),
    roleplayLineId: uuid("roleplay_line_id"),
    memorizationSessionId: uuid("memorization_session_id"),
    memorizationSentenceId: uuid("memorization_sentence_id"),
    ...recordingColumns,
    createdAt,
    updatedAt,
  },
  (table) => [
    unique("draft_recordings_bucket_id_object_path_unique").on(table.bucketId, table.objectPath),
    unique("draft_recordings_id_user_id_unique").on(table.id, table.userId),
    uniqueIndex("draft_recordings_one_roleplay_target_idx")
      .on(table.roleplayLineId)
      .where(sql`${table.roleplayLineId} is not null`),
    uniqueIndex("draft_recordings_one_memorization_target_idx")
      .on(table.memorizationSentenceId)
      .where(sql`${table.memorizationSentenceId} is not null`),
    foreignKey({
      columns: [table.roleplayLineId, table.roleplaySessionId, table.userId],
      foreignColumns: [
        roleplaySessionLines.id,
        roleplaySessionLines.sessionId,
        roleplaySessionLines.userId,
      ],
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.memorizationSentenceId, table.memorizationSessionId, table.userId],
      foreignColumns: [
        memorizationSessionSentences.id,
        memorizationSessionSentences.sessionId,
        memorizationSessionSentences.userId,
      ],
    }).onDelete("cascade"),
    check(
      "draft_recordings_single_target_check",
      sql`(
        ${table.roleplaySessionId} is not null
        and ${table.roleplayLineId} is not null
        and ${table.memorizationSessionId} is null
        and ${table.memorizationSentenceId} is null
      ) or (
        ${table.roleplaySessionId} is null
        and ${table.roleplayLineId} is null
        and ${table.memorizationSessionId} is not null
        and ${table.memorizationSentenceId} is not null
      )`,
    ),
    ...recordingChecks(table),
    index("draft_recordings_user_created_idx").on(table.userId, table.createdAt.desc()),
  ],
);

export const acceptedRecordings = pgTable(
  "accepted_recordings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    roleplaySessionId: uuid("roleplay_session_id"),
    roleplayLineId: uuid("roleplay_line_id"),
    memorizationSessionId: uuid("memorization_session_id"),
    memorizationSentenceId: uuid("memorization_sentence_id"),
    ...recordingColumns,
    acceptedAt: timestamp("accepted_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt,
    updatedAt,
  },
  (table) => [
    unique("accepted_recordings_bucket_id_object_path_unique").on(table.bucketId, table.objectPath),
    unique("accepted_recordings_id_user_id_unique").on(table.id, table.userId),
    uniqueIndex("accepted_recordings_one_roleplay_target_idx")
      .on(table.roleplayLineId)
      .where(sql`${table.roleplayLineId} is not null`),
    uniqueIndex("accepted_recordings_one_memorization_target_idx")
      .on(table.memorizationSentenceId)
      .where(sql`${table.memorizationSentenceId} is not null`),
    foreignKey({
      columns: [table.roleplayLineId, table.roleplaySessionId, table.userId],
      foreignColumns: [
        roleplaySessionLines.id,
        roleplaySessionLines.sessionId,
        roleplaySessionLines.userId,
      ],
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.memorizationSentenceId, table.memorizationSessionId, table.userId],
      foreignColumns: [
        memorizationSessionSentences.id,
        memorizationSessionSentences.sessionId,
        memorizationSessionSentences.userId,
      ],
    }).onDelete("cascade"),
    check(
      "accepted_recordings_single_target_check",
      sql`(
        ${table.roleplaySessionId} is not null
        and ${table.roleplayLineId} is not null
        and ${table.memorizationSessionId} is null
        and ${table.memorizationSentenceId} is null
      ) or (
        ${table.roleplaySessionId} is null
        and ${table.roleplayLineId} is null
        and ${table.memorizationSessionId} is not null
        and ${table.memorizationSentenceId} is not null
      )`,
    ),
    ...recordingChecks(table),
    index("accepted_recordings_user_accepted_idx").on(table.userId, table.acceptedAt.desc()),
  ],
);

export const analysisJobs = pgTable(
  "analysis_jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    roleplaySessionId: uuid("roleplay_session_id"),
    memorizationSessionId: uuid("memorization_session_id"),
    status: analysisJobStatus("status").notNull().default("queued"),
    provider: text("provider").notNull().default("openai"),
    queuedAt: timestamp("queued_at", { withTimezone: true }).notNull().defaultNow(),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    failedAt: timestamp("failed_at", { withTimezone: true }),
    errorMessage: text("error_message"),
    createdAt,
    updatedAt,
  },
  (table) => [
    unique("analysis_jobs_id_user_id_unique").on(table.id, table.userId),
    uniqueIndex("analysis_jobs_one_roleplay_session_idx")
      .on(table.roleplaySessionId)
      .where(sql`${table.roleplaySessionId} is not null`),
    uniqueIndex("analysis_jobs_one_memorization_session_idx")
      .on(table.memorizationSessionId)
      .where(sql`${table.memorizationSessionId} is not null`),
    foreignKey({
      columns: [table.roleplaySessionId, table.userId],
      foreignColumns: [roleplaySessions.id, roleplaySessions.userId],
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.memorizationSessionId, table.userId],
      foreignColumns: [memorizationSessions.id, memorizationSessions.userId],
    }).onDelete("cascade"),
    check(
      "analysis_jobs_single_session_check",
      sql`(${table.roleplaySessionId} is not null)::integer + (${table.memorizationSessionId} is not null)::integer = 1`,
    ),
    check(
      "analysis_jobs_provider_length_check",
      sql`char_length(trim(${table.provider})) between 1 and 80`,
    ),
    check(
      "analysis_jobs_started_after_queued_check",
      sql`${table.startedAt} is null or ${table.startedAt} >= ${table.queuedAt}`,
    ),
    check(
      "analysis_jobs_completed_after_queued_check",
      sql`${table.completedAt} is null or ${table.completedAt} >= ${table.queuedAt}`,
    ),
    check(
      "analysis_jobs_completed_after_started_check",
      sql`${table.completedAt} is null or ${table.startedAt} is null or ${table.completedAt} >= ${table.startedAt}`,
    ),
    check(
      "analysis_jobs_failed_after_queued_check",
      sql`${table.failedAt} is null or ${table.failedAt} >= ${table.queuedAt}`,
    ),
    check(
      "analysis_jobs_failed_after_started_check",
      sql`${table.failedAt} is null or ${table.startedAt} is null or ${table.failedAt} >= ${table.startedAt}`,
    ),
    index("analysis_jobs_user_status_queued_idx").on(
      table.userId,
      table.status,
      table.queuedAt.asc(),
    ),
  ],
);

export const practiceTargetAnalysisResults = pgTable(
  "practice_target_analysis_results",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    analysisJobId: uuid("analysis_job_id").notNull(),
    roleplayLineId: uuid("roleplay_line_id"),
    memorizationSentenceId: uuid("memorization_sentence_id"),
    transcript: text("transcript").notNull(),
    feedback: jsonb("feedback").notNull(),
    score: numeric("score", { precision: 5, scale: 2, mode: "number" }),
    createdAt,
    updatedAt,
  },
  (table) => [
    unique("practice_target_analysis_results_id_user_id_unique").on(table.id, table.userId),
    unique("practice_target_analysis_results_analysis_job_id_roleplay_line_id_unique").on(
      table.analysisJobId,
      table.roleplayLineId,
    ),
    unique("practice_target_analysis_results_analysis_job_id_memorization_sentence_id_unique").on(
      table.analysisJobId,
      table.memorizationSentenceId,
    ),
    foreignKey({
      columns: [table.analysisJobId, table.userId],
      foreignColumns: [analysisJobs.id, analysisJobs.userId],
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.roleplayLineId, table.userId],
      foreignColumns: [roleplaySessionLines.id, roleplaySessionLines.userId],
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.memorizationSentenceId, table.userId],
      foreignColumns: [memorizationSessionSentences.id, memorizationSessionSentences.userId],
    }).onDelete("cascade"),
    check(
      "practice_target_analysis_results_single_target_check",
      sql`(${table.roleplayLineId} is not null)::integer + (${table.memorizationSentenceId} is not null)::integer = 1`,
    ),
    check(
      "practice_target_analysis_results_transcript_length_check",
      sql`char_length(trim(${table.transcript})) > 0`,
    ),
    check(
      "practice_target_analysis_results_feedback_object_check",
      sql`jsonb_typeof(${table.feedback}) = 'object'`,
    ),
    check(
      "practice_target_analysis_results_score_range_check",
      sql`${table.score} is null or (${table.score} >= 0 and ${table.score} <= 100)`,
    ),
    index("practice_target_analysis_results_user_job_idx").on(table.userId, table.analysisJobId),
  ],
);

export const sessionAnalysisSummaries = pgTable(
  "session_analysis_summaries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    analysisJobId: uuid("analysis_job_id").notNull(),
    roleplaySessionId: uuid("roleplay_session_id"),
    memorizationSessionId: uuid("memorization_session_id"),
    summary: jsonb("summary").notNull(),
    score: numeric("score", { precision: 5, scale: 2, mode: "number" }),
    createdAt,
    updatedAt,
  },
  (table) => [
    unique("session_analysis_summaries_id_user_id_unique").on(table.id, table.userId),
    unique("session_analysis_summaries_analysis_job_id_unique").on(table.analysisJobId),
    foreignKey({
      columns: [table.analysisJobId, table.userId],
      foreignColumns: [analysisJobs.id, analysisJobs.userId],
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.roleplaySessionId, table.userId],
      foreignColumns: [roleplaySessions.id, roleplaySessions.userId],
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.memorizationSessionId, table.userId],
      foreignColumns: [memorizationSessions.id, memorizationSessions.userId],
    }).onDelete("cascade"),
    check(
      "session_analysis_summaries_single_session_check",
      sql`(${table.roleplaySessionId} is not null)::integer + (${table.memorizationSessionId} is not null)::integer = 1`,
    ),
    check(
      "session_analysis_summaries_summary_object_check",
      sql`jsonb_typeof(${table.summary}) = 'object'`,
    ),
    check(
      "session_analysis_summaries_score_range_check",
      sql`${table.score} is null or (${table.score} >= 0 and ${table.score} <= 100)`,
    ),
    index("session_analysis_summaries_user_created_idx").on(table.userId, table.createdAt.desc()),
  ],
);

export const cleanupFailureLogs = pgTable(
  "cleanup_failure_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    source: cleanupFailureSource("source").notNull(),
    ...recordingColumns,
    errorMessage: text("error_message").notNull(),
    attemptedAt: timestamp("attempted_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt,
  },
  (table) => [
    check(
      "cleanup_failure_logs_error_message_length_check",
      sql`char_length(trim(${table.errorMessage})) > 0`,
    ),
    ...recordingChecks(table),
    index("cleanup_failure_logs_user_attempted_idx").on(table.userId, table.attemptedAt.desc()),
    index("cleanup_failure_logs_source_attempted_idx").on(table.source, table.attemptedAt.desc()),
  ],
);
