/*
  # MT5 Learning Game - Initial Schema

  1. New Tables
    - `profiles` - User game profile with XP, coins, rank, streak
    - `missions_completed` - Log of completed missions with scores
    - `badges_earned` - Badges unlocked by user
    - `daily_missions` - Daily mission tracking

  2. Security
    - RLS enabled on all tables
    - Users can only access their own data
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text DEFAULT 'Joueur',
  xp integer DEFAULT 0,
  coins integer DEFAULT 0,
  rank text DEFAULT 'Novice',
  streak integer DEFAULT 0,
  last_played_at date,
  max_streak integer DEFAULT 0,
  total_missions integer DEFAULT 0,
  total_correct integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE TABLE IF NOT EXISTS missions_completed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  mission_type text NOT NULL,
  score integer DEFAULT 0,
  stars integer DEFAULT 0,
  xp_earned integer DEFAULT 0,
  coins_earned integer DEFAULT 0,
  time_taken integer DEFAULT 0,
  completed_at timestamptz DEFAULT now()
);

ALTER TABLE missions_completed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own missions"
  ON missions_completed FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own missions"
  ON missions_completed FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS badges_earned (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  badge_id text NOT NULL,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

ALTER TABLE badges_earned ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own badges"
  ON badges_earned FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges"
  ON badges_earned FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS daily_missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  mission_date date DEFAULT CURRENT_DATE,
  missions_completed integer DEFAULT 0,
  missions_required integer DEFAULT 3,
  reward_claimed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, mission_date)
);

ALTER TABLE daily_missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily missions"
  ON daily_missions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily missions"
  ON daily_missions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily missions"
  ON daily_missions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
