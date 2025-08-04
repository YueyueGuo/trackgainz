import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { profileService } from '../lib/profileService';
import { Profile, ExperienceLevel, PrimaryGoal, UnitSystem } from '../types/workout';
import './ProfilePage.css';

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
          setHeight(profileData.height || '');
          setWeight(profileData.weight || '');
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
    <div className="profile-page">
      <h2>User Profile</h2>
      <form onSubmit={handleUpdate} className="profile-form">
        <div className="form-group">
          <label>Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Birthday</label>
          <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Gender</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">Select...</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="form-group">
          <label>Experience Level</label>
          <select value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div className="form-group">
          <label>Primary Goal</label>
          <select value={primaryGoal} onChange={(e) => setPrimaryGoal(e.target.value as PrimaryGoal)}>
            <option value="strength">Strength</option>
            <option value="hypertrophy">Hypertrophy</option>
            <option value="endurance">Endurance</option>
            <option value="general_fitness">General Fitness</option>
          </select>
        </div>
        <div className="form-group">
          <label>Unit System</label>
          <select value={unitSystem} onChange={(e) => setUnitSystem(e.target.value as UnitSystem)}>
            <option value="imperial">Imperial (lbs, inches)</option>
            <option value="metric">Metric (kg, cm)</option>
          </select>
        </div>
        <div className="form-group">
          <label>{getHeightLabel()}</label>
          <input type="number" value={height} onChange={(e) => setHeight(e.target.value === '' ? '' : parseInt(e.target.value))} />
        </div>
        <div className="form-group">
          <label>{getWeightLabel()}</label>
          <input type="number" value={weight} onChange={(e) => setWeight(e.target.value === '' ? '' : parseInt(e.target.value))} />
        </div>
        <button type="submit" className="update-btn">Update Profile</button>
      </form>
    </div>
  );
}; 