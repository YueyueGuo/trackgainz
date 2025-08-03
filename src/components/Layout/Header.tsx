import React from 'react'
import { useAuth } from '../../contexts/AuthContext'

export const Header: React.FC = () => {
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
        
        <div className="user-section">
          <span className="user-email">{user?.email}</span>
          <button onClick={handleSignOut} className="logout-btn">
            LOGOUT
          </button>
        </div>
      </div>
    </header>
  )
}