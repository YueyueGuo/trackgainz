import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Target, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { profileService } from '../lib/profileService';
import { Profile, ExperienceLevel, PrimaryGoal, UnitSystem } from '../types/workout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { BottomNav } from '../components/Layout/BottomNav';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [gender, setGender] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('beginner');
  const [primaryGoal, setPrimaryGoal] = useState<PrimaryGoal>('general_fitness');
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('imperial');
  const [height, setHeight] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');
  const [bio, setBio] = useState('');
  const [workoutFrequency, setWorkoutFrequency] = useState('');
  const [preferredTime, setPreferredTime] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        setLoading(true);
        const profileData = await profileService.getProfile(user.id);
        setProfile(profileData);
        if (profileData) {
          setName(profileData.name || '');
          setBirthday(profileData.birthday || '');
          setGender(profileData.gender || '');
          setExperienceLevel(profileData.experience_level || 'beginner');
          setPrimaryGoal(profileData.primary_goal || 'general_fitness');
          setUnitSystem(profileData.unit_system || 'imperial');
          
          // Handle legacy height/weight fields - migrate to new unit-aware fields
          const currentUnitSystem = profileData.unit_system || 'imperial';
          if (profileData.height) {
            setHeight(profileData.height);
          } else if (profileData.height_cm) {
            // Migrate from legacy height_cm field
            if (currentUnitSystem === 'metric') {
              setHeight(profileData.height_cm);
            } else {
              // Convert cm to inches
              setHeight(Math.round(profileData.height_cm / 2.54));
            }
          } else {
            setHeight('');
          }
          
          if (profileData.weight) {
            setWeight(profileData.weight);
          } else if (profileData.weight_kg) {
            // Migrate from legacy weight_kg field
            if (currentUnitSystem === 'metric') {
              setWeight(profileData.weight_kg);
            } else {
              // Convert kg to lbs
              setWeight(Math.round(profileData.weight_kg * 2.205));
            }
          } else {
            setWeight('');
          }
          
          setBio(profileData.bio || '');
          setWorkoutFrequency(profileData.workout_frequency || '');
          setPreferredTime(profileData.preferred_time || '');
        }
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user && profile) {
      const updates: Partial<Profile> = {
        name,
        birthday,
        gender,
        experience_level: experienceLevel,
        primary_goal: primaryGoal,
        unit_system: unitSystem,
        height: height === '' ? undefined : height,
        weight: weight === '' ? undefined : weight,
        bio,
        workout_frequency: workoutFrequency,
        preferred_time: preferredTime,
      };
      const updatedProfile = await profileService.updateProfile(user.id, updates);
      if (updatedProfile) {
        setProfile(updatedProfile);
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile.');
      }
    }
  };

  // Helper functions for unit labels
  const getHeightLabel = () => {
    return unitSystem === 'metric' ? 'Height (cm)' : 'Height (inches)';
  };

  const getWeightLabel = () => {
    return unitSystem === 'metric' ? 'Weight (kg)' : 'Weight (lbs)';
  };

  if (loading) {
    return <div>Loading profile...</div>;
  }

  if (!profile) {
    return <div>Could not load profile.</div>;
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-background">
      {/* Background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 block dark:hidden bg-[radial-gradient(1000px_500px_at_-10%_-10%,theme(colors.brand.200/.25),transparent_60%),radial-gradient(800px_400px_at_110%_10%,theme(colors.brand.300/.18),transparent_60%),linear-gradient(180deg,theme(colors.white),theme(colors.slate.50))]" />
        <div className="absolute inset-0 hidden dark:block bg-[radial-gradient(1000px_500px_at_-10%_-10%,theme(colors.brand.400/.25),transparent_60%),radial-gradient(800px_400px_at_110%_10%,theme(colors.brand.600/.18),transparent_60%),linear-gradient(180deg,theme(colors.slate.950),theme(colors.slate.900))]" />
        <div className="animate-blob absolute -top-24 -left-16 h-64 w-64 rounded-full bg-brand-500/14 blur-3xl will-change-transform" />
        <div
          className="animate-blob absolute -bottom-24 -right-10 h-72 w-72 rounded-full bg-amber-400/14 blur-3xl will-change-transform"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <section className="relative z-10 mx-auto max-w-lg px-4 pt-6 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mb-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#6b3a0e]/80 bg-[#2b1508] shadow-[0_10px_30px_-10px_rgba(255,153,0,0.4)]">
              <User className="h-5 w-5 text-amber-100" />
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-brand-300 via-amber-300 to-brand-500 bg-clip-text text-2xl font-black uppercase tracking-tight text-transparent">
                Profile
              </h1>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Your fitness journey</p>
            </div>
          </div>
        </motion.div>

        {/* Profile Photo Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
          className="mb-6 rounded-2xl border border-[#5a3714]/70 bg-[linear-gradient(135deg,#2f1808_0%,#1a0f06_100%)] p-6 shadow-[0_20px_60px_-20px_rgba(255,153,0,0.5)]"
        >
          <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-[#ffb547]/10" />

          <div className="relative flex flex-col items-center">
            <div className="relative mb-4">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 p-1">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-[#2b1508] text-2xl font-bold text-amber-100">
                  {name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                </div>
              </div>
            </div>
            <h2 className="text-xl font-bold text-amber-50">{name || 'User'}</h2>
            <p className="text-sm text-amber-100/70">{user?.email}</p>
          </div>
        </motion.div>

        <form onSubmit={handleUpdate} className="space-y-6">
          {/* Basic Info Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
            className="rounded-2xl border border-[#5a3714]/70 bg-[linear-gradient(135deg,#2f1808_0%,#1a0f06_100%)] p-6 shadow-[0_20px_60px_-20px_rgba(255,153,0,0.5)]"
          >
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-[#ffb547]/10" />

            <div className="relative">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold uppercase tracking-wide text-amber-50">
                <User className="h-5 w-5 text-brand-400" />
                Basic Info
              </h3>

              <div className="space-y-4">
                <div>
                  <Label className="text-amber-100 uppercase text-xs font-semibold tracking-wide">Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 border-[#6b3a0e] bg-[#241307] text-amber-50 focus-visible:ring-brand-500"
                  />
                </div>

                <div>
                  <Label className="text-amber-100 uppercase text-xs font-semibold tracking-wide">Email</Label>
                  <Input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="mt-1 border-[#6b3a0e] bg-[#241307] text-amber-50 opacity-60"
                  />
                </div>

                <div>
                  <Label className="text-amber-100 uppercase text-xs font-semibold tracking-wide">Birthday</Label>
                  <Input
                    type="date"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    className="mt-1 border-[#6b3a0e] bg-[#241307] text-amber-50 focus-visible:ring-brand-500"
                  />
                </div>

                <div>
                  <Label className="text-amber-100 uppercase text-xs font-semibold tracking-wide">Gender</Label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#6b3a0e] bg-[#241307] p-3 text-amber-50 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="">Select...</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <Label className="text-amber-100 uppercase text-xs font-semibold tracking-wide">Bio</Label>
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about your fitness journey..."
                    className="mt-1 border-[#6b3a0e] bg-[#241307] text-amber-50 placeholder:text-amber-200/60 focus-visible:ring-brand-500"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Fitness Info Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
            className="rounded-2xl border border-[#5a3714]/70 bg-[linear-gradient(135deg,#2f1808_0%,#1a0f06_100%)] p-6 shadow-[0_20px_60px_-20px_rgba(255,153,0,0.5)]"
          >
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-[#ffb547]/10" />

            <div className="relative">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold uppercase tracking-wide text-amber-50">
                <Target className="h-5 w-5 text-brand-400" />
                Fitness Profile
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-amber-100 uppercase text-xs font-semibold tracking-wide">
                      {getHeightLabel()}
                    </Label>
                    <Input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value === '' ? '' : parseInt(e.target.value))}
                      className="mt-1 border-[#6b3a0e] bg-[#241307] text-amber-50 focus-visible:ring-brand-500"
                    />
                  </div>
                  <div>
                    <Label className="text-amber-100 uppercase text-xs font-semibold tracking-wide">{getWeightLabel()}</Label>
                    <Input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value === '' ? '' : parseInt(e.target.value))}
                      className="mt-1 border-[#6b3a0e] bg-[#241307] text-amber-50 focus-visible:ring-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-amber-100 uppercase text-xs font-semibold tracking-wide">
                    Experience Level
                  </Label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                    className="mt-1 w-full rounded-lg border border-[#6b3a0e] bg-[#241307] p-3 text-amber-50 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="beginner">Beginner (0-6 months)</option>
                    <option value="intermediate">Intermediate (6 months - 2 years)</option>
                    <option value="advanced">Advanced (2+ years)</option>
                  </select>
                </div>

                <div>
                  <Label className="text-amber-100 uppercase text-xs font-semibold tracking-wide">Primary Goal</Label>
                  <select
                    value={primaryGoal}
                    onChange={(e) => setPrimaryGoal(e.target.value as PrimaryGoal)}
                    className="mt-1 w-full rounded-lg border border-[#6b3a0e] bg-[#241307] p-3 text-amber-50 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="strength">Build Strength</option>
                    <option value="hypertrophy">Build Muscle</option>
                    <option value="endurance">Improve Endurance</option>
                    <option value="general_fitness">General Fitness</option>
                  </select>
                </div>

                <div>
                  <Label className="text-amber-100 uppercase text-xs font-semibold tracking-wide">Unit System</Label>
                  <select
                    value={unitSystem}
                    onChange={(e) => setUnitSystem(e.target.value as UnitSystem)}
                    className="mt-1 w-full rounded-lg border border-[#6b3a0e] bg-[#241307] p-3 text-amber-50 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="imperial">Imperial (lbs, inches)</option>
                    <option value="metric">Metric (kg, cm)</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Preferences Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
            className="rounded-2xl border border-[#5a3714]/70 bg-[linear-gradient(135deg,#2f1808_0%,#1a0f06_100%)] p-6 shadow-[0_20px_60px_-20px_rgba(255,153,0,0.5)]"
          >
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-[#ffb547]/10" />

            <div className="relative">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold uppercase tracking-wide text-amber-50">
                <Clock className="h-5 w-5 text-brand-400" />
                Preferences
              </h3>

              <div className="space-y-4">
                <div>
                  <Label className="text-amber-100 uppercase text-xs font-semibold tracking-wide">
                    Workout Frequency Goal
                  </Label>
                  <select
                    value={workoutFrequency}
                    onChange={(e) => setWorkoutFrequency(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#6b3a0e] bg-[#241307] p-3 text-amber-50 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="">Select frequency...</option>
                    <option value="1-2x">1-2x per week</option>
                    <option value="3x">3x per week</option>
                    <option value="4-5x">4-5x per week</option>
                    <option value="daily">Daily</option>
                    <option value="2x-daily">2x daily</option>
                  </select>
                </div>

                <div>
                  <Label className="text-amber-100 uppercase text-xs font-semibold tracking-wide">
                    Preferred Workout Time
                  </Label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#6b3a0e] bg-[#241307] p-3 text-amber-50 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="">Select time...</option>
                    <option value="early-morning">Early Morning (5-7 AM)</option>
                    <option value="morning">Morning (7-10 AM)</option>
                    <option value="midday">Midday (10 AM-2 PM)</option>
                    <option value="afternoon">Afternoon (2-6 PM)</option>
                    <option value="evening">Evening (6-9 PM)</option>
                    <option value="night">Night (9+ PM)</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
            className="pt-4"
          >
            <motion.div whileHover={{ y: -1 }} whileTap={{ y: 0 }}>
              <Button
                type="submit"
                size="lg"
                className="group relative flex h-12 w-full items-center justify-center overflow-hidden rounded-lg bg-brand-500 font-bold tracking-wide text-white shadow-[0_20px_40px_-20px_rgba(255,153,0,0.8)] transition-colors hover:bg-brand-600 focus-visible:ring-brand-500"
              >
                <span className="relative z-10">Update Profile</span>
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.28),transparent)] transition-transform duration-1000 group-hover:translate-x-full" />
              </Button>
            </motion.div>
          </motion.div>
        </form>
      </section>

      <BottomNav currentView="profile" onViewChange={() => {}} />
    </main>
  );
}; 