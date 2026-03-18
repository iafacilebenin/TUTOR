-- ================================================================
--  Le Mentor Béninois — Cloudflare D1 Schema
--  Apply with: wrangler d1 execute mentor-beninois-db --file=src/db/schema.sql
-- ================================================================

-- ── Students ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
  device_id    TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  school       TEXT,
  city         TEXT,
  target_level TEXT,
  last_seen_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── Grades ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS grades (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id   TEXT    NOT NULL,
  exercise_id TEXT    NOT NULL,
  score       REAL    NOT NULL,
  subject     TEXT    NOT NULL,
  level       TEXT    NOT NULL,
  feedback    TEXT,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
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
  data       TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_gen_topic_level ON generated_exercises(topic, level, created_at);
