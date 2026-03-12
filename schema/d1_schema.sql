-- =============================================
-- LE MENTOR BÉNINOIS - CLOUDFLARE D1 SCHEMA
-- Système de suivi des élèves et de leurs notes
-- =============================================

-- Table des élèves
CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,                    -- UUID généré côté client
    name TEXT NOT NULL,                     -- Nom complet de l'élève
    school TEXT,                            -- Nom de l'école
    city TEXT,                              -- Ville de l'élève
    target_level TEXT NOT NULL,             -- CEP, BEPC, ou BAC
    created_at TEXT DEFAULT (datetime('now')),
    last_seen_at TEXT DEFAULT (datetime('now'))
);

-- Table des tentatives d'exercices
CREATE TABLE IF NOT EXISTS exercise_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,               -- Référence vers students.id
    exercise_id TEXT NOT NULL,              -- ID de l'exercice (ex: cep-math-1)
    level TEXT NOT NULL,                    -- CEP, BEPC, ou BAC
    subject TEXT NOT NULL,                  -- Matière (Mathématiques, Français, etc.)
    score REAL NOT NULL,                    -- Note sur 20
    hints_used INTEGER DEFAULT 0,           -- Nombre d'indices utilisés
    student_answer TEXT,                    -- Réponse de l'élève
    ai_feedback TEXT,                       -- Feedback de l'IA
    attempted_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (student_id) REFERENCES students(id)
);

-- Table des sessions élèves
CREATE TABLE IF NOT EXISTS student_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,               -- Référence vers students.id
    started_at TEXT DEFAULT (datetime('now')),
    device_hint TEXT,                       -- User-Agent ou info device
    FOREIGN KEY (student_id) REFERENCES students(id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_exercise_attempts_student ON exercise_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_exercise_attempts_level ON exercise_attempts(level);
CREATE INDEX IF NOT EXISTS idx_student_sessions_student ON student_sessions(student_id);
