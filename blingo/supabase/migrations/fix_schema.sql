-- =============================================
-- RUN THIS SQL IN YOUR SUPABASE SQL EDITOR
-- Dashboard -> SQL Editor -> New Query -> Paste & Run
-- =============================================

-- 1. First, ensure the UUID extension is enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Fix the users table - add default for id if missing
DO $$
BEGIN
    -- Check if users table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        -- Try to alter the id column to have a default
        BEGIN
            ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid();
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not alter users.id default: %', SQLERRM;
        END;
    ELSE
        -- Create the users table if it doesn't exist
        CREATE TABLE users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            google_id TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            name TEXT,
            image TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;
END $$;

-- 3. Fix the api_keys table - add user_id column if missing
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'api_keys') THEN
        -- Check if user_id column exists
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'api_keys' AND column_name = 'user_id'
        ) THEN
            -- Add user_id column
            ALTER TABLE api_keys ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added user_id column to api_keys table';
        END IF;
        
        -- Ensure id has a default
        BEGIN
            ALTER TABLE api_keys ALTER COLUMN id SET DEFAULT gen_random_uuid();
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not alter api_keys.id default: %', SQLERRM;
        END;
    ELSE
        -- Create the api_keys table if it doesn't exist
        CREATE TABLE api_keys (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            key TEXT UNIQUE NOT NULL,
            usage INTEGER DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;
END $$;

-- 4. Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(key);

-- 5. Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- 6. Create permissive policies (for development)
DROP POLICY IF EXISTS "Allow all on users" ON users;
CREATE POLICY "Allow all on users" ON users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on api_keys" ON api_keys;
CREATE POLICY "Allow all on api_keys" ON api_keys FOR ALL USING (true) WITH CHECK (true);

-- 7. Create the update_updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create atomic increment function for API key usage
CREATE OR REPLACE FUNCTION increment_api_key_usage(key_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE api_keys
    SET usage = usage + 1,
        updated_at = NOW()
    WHERE id = key_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Done!
SELECT 'Schema fix complete!' as status;

