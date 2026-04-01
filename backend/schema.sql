CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS games (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  computer_grid JSONB         NOT NULL,
  computer_ships JSONB        NOT NULL,
  player_attacks JSONB        NOT NULL DEFAULT '[]'::jsonb,\
  player_grid   JSONB         NOT NULL,
  player_ships  JSONB         NOT NULL,
  computer_attacks JSONB      NOT NULL DEFAULT '[]'::jsonb,
  turn          TEXT          NOT NULL DEFAULT 'player',
  status        TEXT          NOT NULL DEFAULT 'active',
  hunt_memory   JSONB         NOT NULL DEFAULT '[]'::jsonb,

  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
