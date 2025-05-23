/*
  # Initial Schema Setup for Agri-All-Round

  1. New Tables
    - `users` (extends Supabase auth.users)
      - `id` (uuid, primary key, references auth.users)
      - `name` (text)
      - `phone` (text, optional)
      - `role` (text, default: 'farmer')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `crops`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `name` (text)
      - `type` (text)
      - `planting_date` (date)
      - `expected_harvest` (date)
      - `soil_type` (text)
      - `growth_stage` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `weather_records`
      - `id` (uuid, primary key)
      - `crop_id` (uuid, references crops)
      - `temperature` (numeric)
      - `humidity` (numeric)
      - `rainfall` (numeric)
      - `wind_speed` (numeric)
      - `weather_date` (timestamp)
      - `is_favorable` (boolean)
      - `created_at` (timestamp)

    - `queries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `query_text` (text)
      - `query_type` (text)
      - `response_text` (text)
      - `submitted_at` (timestamp)

    - `diagnoses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `image_path` (text)
      - `disease_detected` (text)
      - `solution` (text)
      - `confidence` (numeric)
      - `diagnosis_date` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create users table to extend auth.users
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users,
  name text NOT NULL,
  phone text,
  role text NOT NULL DEFAULT 'farmer',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create crops table
CREATE TABLE IF NOT EXISTS crops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users NOT NULL,
  name text NOT NULL,
  type text NOT NULL,
  planting_date date NOT NULL,
  expected_harvest date NOT NULL,
  soil_type text NOT NULL,
  growth_stage text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create weather_records table
CREATE TABLE IF NOT EXISTS weather_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_id uuid REFERENCES crops NOT NULL,
  temperature numeric NOT NULL,
  humidity numeric NOT NULL,
  rainfall numeric NOT NULL,
  wind_speed numeric NOT NULL,
  weather_date timestamptz NOT NULL,
  is_favorable boolean NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create queries table
CREATE TABLE IF NOT EXISTS queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users NOT NULL,
  query_text text NOT NULL,
  query_type text NOT NULL,
  response_text text NOT NULL,
  submitted_at timestamptz DEFAULT now()
);

-- Create diagnoses table
CREATE TABLE IF NOT EXISTS diagnoses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users NOT NULL,
  image_path text NOT NULL,
  disease_detected text NOT NULL,
  solution text NOT NULL,
  confidence numeric NOT NULL,
  diagnosis_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create policies for crops table
CREATE POLICY "Users can read own crops"
  ON crops
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own crops"
  ON crops
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own crops"
  ON crops
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own crops"
  ON crops
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for weather_records table
CREATE POLICY "Users can read weather records for their crops"
  ON weather_records
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM crops
    WHERE crops.id = weather_records.crop_id
    AND crops.user_id = auth.uid()
  ));

-- Create policies for queries table
CREATE POLICY "Users can read own queries"
  ON queries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own queries"
  ON queries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policies for diagnoses table
CREATE POLICY "Users can read own diagnoses"
  ON diagnoses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diagnoses"
  ON diagnoses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crops_updated_at
  BEFORE UPDATE ON crops
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();