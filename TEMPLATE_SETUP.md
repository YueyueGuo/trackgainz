# Workout Templates Setup

## Database Setup

To enable workout templates functionality, you need to create the `workout_templates` table in your Supabase database.

### SQL Commands

Run the SQL commands from `create_templates_table.sql` in your Supabase SQL editor:

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `create_templates_table.sql`
4. Run the query

This will:
- Create the `workout_templates` table
- Set up Row Level Security (RLS) policies
- Create the necessary triggers for `updated_at` timestamp

### Table Structure

The `workout_templates` table includes:
- `id`: UUID primary key
- `user_id`: Foreign key to auth.users
- `name`: Template name (e.g., "Leg Day", "Push Workout")
- `description`: Optional description
- `exercises`: JSONB column storing exercise data
- `created_at`: Timestamp of creation
- `updated_at`: Timestamp of last update

### Features Enabled

Once the table is created, users can:
- Create workout templates with custom exercises and sets
- Start workouts from saved templates
- Repeat previous workouts as new sessions
- Save current workouts as templates
- Delete templates they no longer need

### Security

RLS policies ensure users can only access their own templates:
- Users can view, create, update, and delete only their own templates
- Templates are isolated by user_id