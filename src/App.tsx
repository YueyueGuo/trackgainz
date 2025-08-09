import React, { useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { UnitProvider } from './contexts/UnitContext'
import { AuthPage } from './components/Auth/AuthPage'
import { Header } from './components/Layout/Header'
import { BottomNav } from './components/Layout/BottomNav'
import { RecordPage } from './pages/RecordPage'
import { WorkoutPage } from './pages/WorkoutPage'
import { ProgressPage } from './pages/ProgressPage'
import { ProfilePage } from './pages/ProfilePage';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth()
  const [currentView, setCurrentView] = useState<'record' | 'workouts' | 'progress' | 'profile'>('record')

  if (loading) {
    return (
      <div className="loading">
        LOADING...
      </div>
    )
  }

  if (!user) {
    return <AuthPage />
  }

  const renderCurrentPage = () => {
    switch (currentView) {
      case 'record':
        return <RecordPage />
      case 'workouts':
        return <WorkoutPage />
      case 'progress':
        return <ProgressPage />
      case 'profile':
        return <ProfilePage />;
      default:
        return <RecordPage />
    }
  }

  return (
    <UnitProvider>
      <div className="app">
        {renderCurrentPage()}
        <BottomNav currentView={currentView} onViewChange={setCurrentView} />
      </div>
    </UnitProvider>
  )
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App