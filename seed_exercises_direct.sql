-- Direct SQL to seed exercises table
-- This bypasses RLS for initial seed data

-- First, temporarily disable RLS
ALTER TABLE exercises DISABLE ROW LEVEL SECURITY;

-- Insert seed exercises
INSERT INTO exercises (name, muscle_groups, category, equipment, difficulty, description, is_verified, created_by, usage_count, last_used) VALUES
-- Chest Exercises
('Bench Press', ARRAY['chest', 'triceps', 'shoulders'], 'compound', ARRAY['barbell', 'bench'], 'intermediate', 'Classic compound movement for chest development', true, null, 0, null),
('Incline Bench Press', ARRAY['chest', 'triceps', 'shoulders'], 'compound', ARRAY['barbell', 'bench'], 'intermediate', 'Upper chest focused bench press variation', true, null, 0, null),
('Dumbbell Bench Press', ARRAY['chest', 'triceps', 'shoulders'], 'compound', ARRAY['dumbbells', 'bench'], 'intermediate', 'Dumbbell variation of bench press', true, null, 0, null),
('Push-ups', ARRAY['chest', 'triceps', 'shoulders'], 'bodyweight', ARRAY[]::text[], 'beginner', 'Classic bodyweight chest exercise', true, null, 0, null),
('Dips', ARRAY['chest', 'triceps', 'shoulders'], 'bodyweight', ARRAY['dip bars'], 'intermediate', 'Bodyweight exercise targeting chest and triceps', true, null, 0, null),
('Chest Flyes', ARRAY['chest'], 'isolation', ARRAY['dumbbells', 'bench'], 'beginner', 'Isolation exercise for chest muscles', true, null, 0, null),

-- Back Exercises
('Pull-ups', ARRAY['back', 'biceps'], 'bodyweight', ARRAY['pull-up bar'], 'intermediate', 'Upper body pulling exercise', true, null, 0, null),
('Barbell Rows', ARRAY['back', 'biceps'], 'compound', ARRAY['barbell'], 'intermediate', 'Compound back exercise', true, null, 0, null),
('Dumbbell Rows', ARRAY['back', 'biceps'], 'compound', ARRAY['dumbbells', 'bench'], 'beginner', 'Single-arm rowing exercise', true, null, 0, null),
('Lat Pulldowns', ARRAY['back', 'biceps'], 'compound', ARRAY['cable machine'], 'beginner', 'Machine-based back exercise', true, null, 0, null),

-- Shoulder Exercises
('Overhead Press', ARRAY['shoulders', 'triceps'], 'compound', ARRAY['barbell'], 'intermediate', 'Compound shoulder press', true, null, 0, null),
('Dumbbell Press', ARRAY['shoulders', 'triceps'], 'compound', ARRAY['dumbbells'], 'intermediate', 'Dumbbell shoulder press', true, null, 0, null),
('Lateral Raises', ARRAY['shoulders'], 'isolation', ARRAY['dumbbells'], 'beginner', 'Isolation exercise for lateral deltoids', true, null, 0, null),

-- Bicep Exercises
('Barbell Curls', ARRAY['biceps'], 'isolation', ARRAY['barbell'], 'beginner', 'Classic bicep curl', true, null, 0, null),
('Dumbbell Curls', ARRAY['biceps'], 'isolation', ARRAY['dumbbells'], 'beginner', 'Dumbbell bicep curl', true, null, 0, null),
('Hammer Curls', ARRAY['biceps', 'forearms'], 'isolation', ARRAY['dumbbells'], 'beginner', 'Bicep curl with neutral grip', true, null, 0, null),

-- Tricep Exercises
('Tricep Dips', ARRAY['triceps'], 'bodyweight', ARRAY['dip bars'], 'intermediate', 'Bodyweight tricep exercise', true, null, 0, null),
('Skull Crushers', ARRAY['triceps'], 'isolation', ARRAY['barbell', 'bench'], 'intermediate', 'Lying tricep extension', true, null, 0, null),

-- Leg Exercises
('Squats', ARRAY['quads', 'glutes', 'hamstrings'], 'compound', ARRAY['barbell'], 'intermediate', 'King of leg exercises', true, null, 0, null),
('Deadlift', ARRAY['back', 'glutes', 'hamstrings'], 'compound', ARRAY['barbell'], 'advanced', 'Full body compound movement', true, null, 0, null),
('Lunges', ARRAY['quads', 'glutes', 'hamstrings'], 'compound', ARRAY['dumbbells'], 'beginner', 'Unilateral leg exercise', true, null, 0, null),
('Calf Raises', ARRAY['calves'], 'isolation', ARRAY['calf raise machine'], 'beginner', 'Isolation exercise for calves', true, null, 0, null),

-- Core Exercises
('Planks', ARRAY['abs'], 'bodyweight', ARRAY[]::text[], 'beginner', 'Isometric core exercise', true, null, 0, null),
('Crunches', ARRAY['abs'], 'bodyweight', ARRAY[]::text[], 'beginner', 'Basic abdominal exercise', true, null, 0, null);

-- Re-enable RLS
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY; 