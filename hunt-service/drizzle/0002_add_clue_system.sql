-- Add clues table
CREATE TABLE IF NOT EXISTS clues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create junction table for many-to-many relationship between clues and tasks
CREATE TABLE IF NOT EXISTS clue_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clue_id UUID NOT NULL REFERENCES clues(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(clue_id, task_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clue_tasks_clue_id ON clue_tasks(clue_id);
CREATE INDEX IF NOT EXISTS idx_clue_tasks_task_id ON clue_tasks(task_id);

-- Add trigger for updated_at on clues table
CREATE OR REPLACE FUNCTION update_modified_column() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW; 
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clues_updated_at
BEFORE UPDATE ON clues
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
