import React, { useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AuthPage } from './components/Auth/AuthPage'
import { Header } from './components/Layout/Header'
import { WorkoutPage } from './pages/WorkoutPage'
import { ProgressPage } from './pages/ProgressPage'
import './App.css'

const AppContent: React.FC = () => {
  const { user, loading } = useAuth()
  const [currentView, setCurrentView] = useState<'workouts' | 'progress'>('workouts')

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

  return (
    <div className="app-container">
      <Header currentView={currentView} onViewChange={setCurrentView} />
      {currentView === 'workouts' ? <WorkoutPage /> : <ProgressPage />}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App