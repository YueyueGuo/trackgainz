import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { profileService } from '../lib/profileService';
import { UnitSystem } from '../types/workout';

export const useUnitSystem = () => {
  const { user } = useAuth();
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('imperial');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUnitSystem = async () => {
      if (user) {
        setLoading(true);
        try {
          const profile = await profileService.getProfile(user.id);
          if (profile && profile.unit_system) {
            setUnitSystem(profile.unit_system);
          }
        } catch (error) {
          console.error('Error fetching unit system:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUnitSystem();
  }, [user]);

  return { unitSystem, loading };
}; 