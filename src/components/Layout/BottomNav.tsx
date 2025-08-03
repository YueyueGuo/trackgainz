import React from 'react'

interface BottomNavProps {
  currentView: 'workouts' | 'progress'
  onViewChange: (view: 'workouts' | 'progress') => void
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onViewChange }) => {
  return (
    <nav className="bottom-nav">
      <button
        className={`bottom-nav-item ${currentView === 'workouts' ? 'active' : ''}`}
        onClick={() => onViewChange('workouts')}
      >
        <div className="nav-icon">💪</div>
        <span className="nav-label">WORKOUTS</span>
      </button>
      
      <button
        className={`bottom-nav-item ${currentView === 'progress' ? 'active' : ''}`}
        onClick={() => onViewChange('progress')}
      >
        <div className="nav-icon">📊</div>
        <span className="nav-label">PROGRESS</span>
      </button>
    </nav>
  )
} 