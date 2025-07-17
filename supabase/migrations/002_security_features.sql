-- Security Features Migration
-- Adds tables and functions for Super Admin security system

-- Super Admin Setup Token
CREATE TABLE IF NOT EXISTS super_admin_setup (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setup_token TEXT UNIQUE NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  used_by UUID REFERENCES auth.users(id)
);

-- Two-Factor Authentication
CREATE TABLE IF NOT EXISTS user_2fa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  secret TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT FALSE,
  backup_codes TEXT[], -- Array of encrypted backup codes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  last_used TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id)
);

-- Super Admin Invitations
CREATE TABLE IF NOT EXISTS super_admin_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  invitation_token TEXT UNIQUE NOT NULL,
  invited_by UUID REFERENCES auth.users(id) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Audit Trail
CREATE TABLE IF NOT EXISTS audit_logs (
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Login Attempts Tracking
CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  ip_address INET NOT NULL,
  success BOOLEAN NOT NULL,
  failure_reason TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Security Sessions
CREATE TABLE IF NOT EXISTS security_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  ip_address INET NOT NULL,
  user_agent TEXT,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Emergency Recovery Tokens
CREATE TABLE IF NOT EXISTS emergency_recovery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recovery_token TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  is_used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP WITH TIME ZONE,
  used_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_login_attempts_created_at ON login_attempts(created_at);
CREATE INDEX IF NOT EXISTS idx_security_sessions_user_id ON security_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_security_sessions_active ON security_sessions(is_active);

-- RLS Policies
ALTER TABLE super_admin_setup ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_2fa ENABLE ROW LEVEL SECURITY;
ALTER TABLE super_admin_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_recovery ENABLE ROW LEVEL SECURITY;

-- Super Admin Setup Policies
CREATE POLICY "Super admin setup is public for initial setup" ON super_admin_setup
  FOR SELECT USING (TRUE);

CREATE POLICY "Only unused tokens can be used" ON super_admin_setup
  FOR UPDATE USING (NOT is_used);

-- 2FA Policies
CREATE POLICY "Users can manage their own 2FA" ON user_2fa
  FOR ALL USING (auth.uid() = user_id);

-- Super Admin Invitation Policies
CREATE POLICY "Super admins can create invitations" ON super_admin_invitations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can view invitations" ON super_admin_invitations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- Audit Log Policies
CREATE POLICY "Super admins can view audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- Security Session Policies
CREATE POLICY "Users can view their own sessions" ON security_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all sessions" ON security_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- Login Attempts Policies (Super Admin only)
CREATE POLICY "Super admins can view login attempts" ON login_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- Emergency Recovery Policies
CREATE POLICY "Super admins can create recovery tokens" ON emergency_recovery
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can view recovery tokens" ON emergency_recovery
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- Functions for audit logging
CREATE OR REPLACE FUNCTION log_audit_event(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id TEXT DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  audit_id UUID;
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    old_values,
    new_values,
    ip_address,
    user_agent
  ) VALUES (
    auth.uid(),
    p_action,
    p_resource_type,
    p_resource_id,
    p_old_values,
    p_new_values,
    inet_client_addr(),
    current_setting('request.headers')::json->>'user-agent'
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = user_uuid 
    AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  UPDATE security_sessions 
  SET is_active = FALSE 
  WHERE expires_at < NOW() AND is_active = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean expired invitations
CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS void AS $$
BEGIN
  DELETE FROM super_admin_invitations 
  WHERE expires_at < NOW() AND NOT is_used;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert initial setup token (will be overridden by environment variable)
INSERT INTO super_admin_setup (setup_token) 
VALUES ('INITIAL_SETUP_TOKEN_CHANGE_ME')
ON CONFLICT DO NOTHING;