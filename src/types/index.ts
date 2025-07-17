export type UserRoleType = 'skater' | 'judge' | 'head_judge' | 'admin' | 'super_admin' | 'commentator';

export type Stance = 'regular' | 'goofy';

export type RunType = 'single_run' | 'jam';

export type ContestFormat = 'street' | 'bowl' | 'park' | 'vert';

export type ContestPhase = 'qualifier' | 'semi' | 'final';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface User {
  id: string;
  email: string;
  name: string;
  address?: string;
  stance?: Stance;
  sponsors?: string;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  contest_id?: string;
  role: UserRoleType;
  created_at: string;
  updated_at: string;
}

export interface Contest {
  id: string;
  title: string;
  location: string;
  date: string;
  format: ContestFormat;
  run_type: RunType;
  skaters_per_jam?: number;
  enable_head_judge: boolean;
  categories?: ContestCategory[];
  contest_categories?: ContestCategory[];
  phases?: ContestPhase[];
  current_phase?: ContestPhase;
  status: 'draft' | 'active' | 'finished';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ContestCategory {
  id: string;
  contest_id: string;
  name: string;
  description?: string;
  entry_fee: number;
  max_participants?: number;
  created_at: string;
  updated_at: string;
}

export interface Registration {
  id: string;
  user_id: string;
  contest_id: string;
  category_id: string;
  payment_status: PaymentStatus;
  payment_id?: string;
  total_fee: number;
  created_at: string;
  updated_at: string;
}

export interface Heat {
  id: string;
  contest_id: string;
  category_id: string;
  phase: ContestPhase;
  heat_number: number;
  participants: string[];
  runs_per_skater: number;
  time_per_run: number;
  status: 'pending' | 'in_progress' | 'completed';
  current_skater_index?: number;
  current_run?: number;
  created_at: string;
  updated_at: string;
}

export interface Score {
  id: string;
  heat_id: string;
  skater_id: string;
  judge_id: string;
  run_number: number;
  score: number;
  notes?: string;
  is_final: boolean;
  created_at: string;
  updated_at: string;
}

export interface Ranking {
  id: string;
  contest_id: string;
  category_id: string;
  skater_id: string;
  skater_name?: string;
  phase: ContestPhase;
  position: number;
  total_score: number;
  best_score: number;
  average_score: number;
  created_at: string;
  updated_at: string;
}

export interface ContestSettings {
  id: string;
  contest_id: string;
  phase: ContestPhase;
  runs_per_skater: number;
  time_per_run: number;
  auto_heat_threshold: number;
  scoring_system: 'average' | 'best' | 'total';
  created_at: string;
  updated_at: string;
}