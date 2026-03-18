-- ================================================================
--  Le Mentor Béninois — Cloudflare D1 Schema
--  Apply with: wrangler d1 execute mentor-beninois-db --file=src/db/schema.sql
-- ================================================================

-- ── Students ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
  id           TEXT    PRIMARY KEY,           -- device/user identifier from client
  name         TEXT    NOT NULL,
  school       TEXT,
  city         TEXT,
  target_level TEXT,
  last_seen_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ── Grades (every attempt stored) ────────────────────────────
CREATE TABLE IF NOT EXISTS grades (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id  TEXT    NOT NULL,
  exercise_id TEXT    NOT NULL,
  score       REAL    NOT NULL,
  subject     TEXT    NOT NULL,
  level       TEXT    NOT NULL,
  feedback    TEXT,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE INDEX IF NOT EXISTS idx_grades_student_id   ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_exercise_id  ON grades(exercise_id);

-- ── AI-Generated Exercises Cache ──────────────────────────────
CREATE TABLE IF NOT EXISTS generated_exercises (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  topic      TEXT NOT NULL,
  level      TEXT NOT NULL,
  student_id TEXT NOT NULL,
  data       TEXT NOT NULL,         -- full exercise JSON blob
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_gen_topic_level ON generated_exercises(topic, level, created_at);
