import React from 'react'
import { useAuth } from '../../contexts/AuthContext'

interface HeaderProps {
  currentView: 'workouts' | 'progress'
  onViewChange: (view: 'workouts' | 'progress') => void
}

export const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {
  const { signOut, user } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          TRACK GAINZ
        </div>
        
        <nav className="nav">
          <button
            className={`nav-link ${currentView === 'workouts' ? 'active' : ''}`}
            onClick={() => onViewChange('workouts')}
          >
            WORKOUTS
          </button>
          <button
            className={`nav-link ${currentView === 'progress' ? 'active' : ''}`}
            onClick={() => onViewChange('progress')}
          >
            PROGRESS
          </button>
          <span className="user-email">{user?.email}</span>
          <button onClick={handleSignOut} className="logout-btn">
            LOGOUT
          </button>
        </nav>
      </div>
    </header>
  )
}