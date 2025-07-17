# 🗄️ Database Setup & Schema Documentation

## Supabase Production Setup

### 1. **Supabase Projekt Konfiguration**

**URL**: `https://supabase.bamboy.de`

#### **Erforderliche Konfiguration:**
```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### 2. **Database Schema Migrationen**

#### **Migration 001: Basis-Schema**
```sql
-- Execute: supabase/migrations/001_initial_schema.sql
```

#### **Migration 002: Sicherheitsfeatures**
```sql
-- Execute: supabase/migrations/002_security_features.sql
```

### 3. **Produktions-Setup Schritte**

#### **Schritt 1: Datenbank initialisieren**
```bash
# Mit Supabase CLI
supabase db push --password [your-password]

# Oder manuell über Supabase Dashboard:
# 1. SQL Editor öffnen
# 2. Beide Migrationsdateien ausführen
```

#### **Schritt 2: Environment Variables setzen**
```bash
# In Coolify oder Supabase Dashboard
REACT_APP_SUPABASE_URL=https://supabase.bamboy.de
REACT_APP_SUPABASE_ANON_KEY=[your-anon-key]
```

#### **Schritt 3: RLS (Row Level Security) aktivieren**
```sql
-- Automatisch durch Migrationen aktiviert
-- Überprüfung im Supabase Dashboard unter "Authentication" > "Policies"
```

## 📊 Database Schema Overview

### **Core Tables**

#### **users** (via Supabase Auth)
```sql
-- Automatically managed by Supabase Auth
-- Contains: id, email, encrypted_password, email_confirmed_at, etc.
```

#### **user_roles**
```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contest_id UUID REFERENCES contests(id) ON DELETE CASCADE,
  role user_role_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **contests**
```sql
CREATE TABLE contests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  date DATE NOT NULL,
  format contest_format NOT NULL,
  run_type run_type NOT NULL,
  skaters_per_jam INTEGER,
  enable_head_judge BOOLEAN DEFAULT FALSE,
  status contest_status DEFAULT 'draft',
  current_phase contest_phase,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **contest_categories**
```sql
CREATE TABLE contest_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id UUID REFERENCES contests(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  entry_fee DECIMAL(10,2) DEFAULT 0,
  max_participants INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Security Tables**

#### **super_admin_setup**
```sql
CREATE TABLE super_admin_setup (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setup_token TEXT UNIQUE NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used_at TIMESTAMP WITH TIME ZONE,
  used_by UUID REFERENCES auth.users(id)
);
```

#### **user_2fa**
```sql
CREATE TABLE user_2fa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  secret TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT FALSE,
  backup_codes TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id)
);
```

#### **audit_logs**
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Contest Management Tables**

#### **registrations**
```sql
CREATE TABLE registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contest_id UUID REFERENCES contests(id) ON DELETE CASCADE,
  category_id UUID REFERENCES contest_categories(id) ON DELETE CASCADE,
  payment_status payment_status DEFAULT 'pending',
  payment_id TEXT,
  total_fee DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **heats**
```sql
CREATE TABLE heats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id UUID REFERENCES contests(id) ON DELETE CASCADE,
  category_id UUID REFERENCES contest_categories(id) ON DELETE CASCADE,
  phase contest_phase NOT NULL,
  heat_number INTEGER NOT NULL,
  participants UUID[] NOT NULL,
  runs_per_skater INTEGER DEFAULT 2,
  time_per_run INTEGER DEFAULT 45,
  status heat_status DEFAULT 'pending',
  current_skater_index INTEGER,
  current_run INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **scores**
```sql
CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  heat_id UUID REFERENCES heats(id) ON DELETE CASCADE,
  skater_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  judge_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  run_number INTEGER NOT NULL,
  score DECIMAL(3,1) NOT NULL CHECK (score >= 0 AND score <= 10),
  notes TEXT,
  is_final BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔒 Row Level Security (RLS) Policies

### **Wichtige RLS-Policies:**

#### **contests** - Sichtbarkeit
```sql
-- Public contests are visible to everyone
CREATE POLICY "Public contests are viewable by everyone" ON contests
  FOR SELECT USING (status = 'active' OR status = 'finished');

-- Contest creators can manage their contests
CREATE POLICY "Contest creators can manage their contests" ON contests
  FOR ALL USING (created_by = auth.uid());
```

#### **user_roles** - Rollenverwaltung
```sql
-- Users can view their own roles
CREATE POLICY "Users can view their own roles" ON user_roles
  FOR SELECT USING (user_id = auth.uid());

-- Super admins can manage all roles
CREATE POLICY "Super admins can manage all roles" ON user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin'
    )
  );
```

#### **audit_logs** - Audit-Zugriff
```sql
-- Only super admins can view audit logs
CREATE POLICY "Super admins can view audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin'
    )
  );
```

## 🚀 Deployment-spezifische Einstellungen

### **Supabase Production Checklist:**

#### ✅ **Sicherheit**
- [ ] RLS für alle Tabellen aktiviert
- [ ] Anonyme Registrierung deaktiviert
- [ ] E-Mail-Bestätigung aktiviert
- [ ] Rate Limiting konfiguriert

#### ✅ **Performance**
- [ ] Indexes auf häufig abgefragte Spalten
- [ ] Connection Pooling aktiviert
- [ ] Backup-Strategy konfiguriert

#### ✅ **Monitoring**
- [ ] Logs-Retention gesetzt
- [ ] Alert-Regeln konfiguriert
- [ ] Performance-Monitoring aktiviert

### **Connection String für Coolify:**
```bash
# Automatisch aus Environment Variables
DATABASE_URL="postgresql://postgres:[password]@[host]:5432/postgres"
SUPABASE_URL="https://supabase.bamboy.de"
SUPABASE_ANON_KEY="[your-anon-key]"
```

## 🔄 Backup & Recovery

### **Automatische Backups:**
```sql
-- Supabase bietet automatische Point-in-Time Recovery
-- Retention: 7 Tage (Pro Plan) oder 30 Tage (Enterprise)
```

### **Manueller Export:**
```bash
# Via Supabase CLI
supabase db dump --password [password] > backup.sql

# Restore
psql -h [host] -U postgres -d postgres < backup.sql
```

## 📈 Performance Optimierung

### **Wichtige Indexes:**
```sql
-- Contest queries
CREATE INDEX idx_contests_status ON contests(status);
CREATE INDEX idx_contests_date ON contests(date);

-- Score queries
CREATE INDEX idx_scores_heat_id ON scores(heat_id);
CREATE INDEX idx_scores_skater_judge ON scores(skater_id, judge_id);

-- Audit logs
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_user_action ON audit_logs(user_id, action);
```

### **Query Optimierung:**
```sql
-- Materialized Views für häufige Aggregationen
CREATE MATERIALIZED VIEW contest_rankings AS
SELECT 
  contest_id,
  category_id,
  skater_id,
  AVG(score) as average_score,
  MAX(score) as best_score,
  COUNT(*) as run_count
FROM scores s
JOIN heats h ON s.heat_id = h.id
WHERE s.is_final = true
GROUP BY contest_id, category_id, skater_id;

-- Refresh-Trigger
CREATE OR REPLACE FUNCTION refresh_contest_rankings()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW contest_rankings;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

## 🛠️ Troubleshooting

### **Häufige Probleme:**

#### **1. RLS Blockiert Queries**
```sql
-- Temporäre Deaktivierung für Debug
ALTER TABLE [table_name] DISABLE ROW LEVEL SECURITY;
-- Nach Debug wieder aktivieren!
ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;
```

#### **2. Performance-Probleme**
```sql
-- Query-Plan analysieren
EXPLAIN ANALYZE SELECT * FROM contests WHERE status = 'active';

-- Slow Query Log überprüfen
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
ORDER BY total_time DESC LIMIT 10;
```

#### **3. Verbindungsprobleme**
```bash
# Connection Test
pg_isready -h [host] -p 5432 -U postgres

# SSL-Verbindung testen
psql "postgresql://postgres:[password]@[host]:5432/postgres?sslmode=require"
```