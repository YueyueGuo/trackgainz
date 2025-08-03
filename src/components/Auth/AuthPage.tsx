import React, { useState } from 'react'
import { Login } from './Login'
import { Register } from './Register'

export const AuthPage: React.FC = () => {
  const [isLoginMode, setIsLoginMode] = useState(true)

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode)
  }

  return (
    <div className="auth-page">
      <h1 className="app-title">TRACK GAINZ</h1>
      {isLoginMode ? (
        <Login onToggleMode={toggleMode} />
      ) : (
        <Register onToggleMode={toggleMode} />
      )}
    </div>
  )
}