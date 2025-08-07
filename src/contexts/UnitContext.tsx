import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { profileService } from '../lib/profileService'
import { UnitSystem } from '../types/workout'

interface UnitContextType {
  unitSystem: UnitSystem
  weightUnit: string
  heightUnit: string
  loading: boolean
  refreshUnits: () => void
}

const UnitContext = createContext<UnitContextType | undefined>(undefined)

export const UnitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('imperial')
  const [loading, setLoading] = useState(true)

  const fetchUnitPreferences = async () => {
    if (!user) {
      setUnitSystem('imperial') // Default fallback
      setLoading(false)
      return
    }

    try {
      const profile = await profileService.getProfile(user.id)
      if (profile?.unit_system) {
        setUnitSystem(profile.unit_system)
      } else {
        setUnitSystem('imperial') // Default fallback
      }
    } catch (error) {
      console.error('Error fetching unit preferences:', error)
      setUnitSystem('imperial') // Default fallback
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUnitPreferences()
  }, [user])

  const refreshUnits = () => {
    fetchUnitPreferences()
  }

  const weightUnit = unitSystem === 'metric' ? 'kg' : 'lbs'
  const heightUnit = unitSystem === 'metric' ? 'cm' : 'inches'

  return (
    <UnitContext.Provider value={{
      unitSystem,
      weightUnit,
      heightUnit,
      loading,
      refreshUnits
    }}>
      {children}
    </UnitContext.Provider>
  )
}

export const useUnits = () => {
  const context = useContext(UnitContext)
  if (context === undefined) {
    throw new Error('useUnits must be used within a UnitProvider')
  }
  return context
} 