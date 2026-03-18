-- ================================================================
--  Le Mentor Béninois — Cloudflare D1 Schema
--  Apply with: wrangler d1 execute mentor-beninois-db --file=src/db/schema.sql
-- ================================================================

-- ── Students ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id  TEXT    NOT NULL UNIQUE,
  name       TEXT    NOT NULL,
  created_at TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_students_device_id ON students(device_id);

-- ── Grades (every attempt stored) ────────────────────────────
CREATE TABLE IF NOT EXISTS grades (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id     TEXT    NOT NULL,
  exercise_id   TEXT    NOT NULL,
  level         TEXT    NOT NULL,
  subject       TEXT    NOT NULL,
  title         TEXT    NOT NULL,
  score         REAL    NOT NULL,   -- scaled /20
  raw_score     REAL    NOT NULL,   -- raw score from rubric
  rubric_total  INTEGER NOT NULL,
  mode          TEXT    NOT NULL DEFAULT 'learning',
  hints_used    INTEGER NOT NULL DEFAULT 0,
  answer        TEXT,
  ai_feedback   TEXT,              -- full JSON feedback blob
  attempt_date  TEXT    NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (device_id) REFERENCES students(device_id)
);

CREATE INDEX IF NOT EXISTS idx_grades_device_id   ON grades(device_id);
CREATE INDEX IF NOT EXISTS idx_grades_exercise_id ON grades(exercise_id);

-- ── AI-Generated Exercises Cache ──────────────────────────────
CREATE TABLE IF NOT EXISTS generated_exercises (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  topic      TEXT NOT NULL,
  level      TEXT NOT NULL,
  device_id  TEXT NOT NULL,
  data       TEXT NOT NULL,         -- full exercise JSON blob
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_gen_topic_level ON generated_exercises(topic, level, created_at);
