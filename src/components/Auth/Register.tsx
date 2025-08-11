import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'

interface RegisterProps {
  onToggleMode: () => void
}

export const Register: React.FC<RegisterProps> = ({ onToggleMode }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const { signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      await signUp(email, password)
      setSuccess(true)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full overflow-hidden rounded-2xl border-2 border-success-light bg-gradient-to-b from-success to-success-dark text-white shadow-brand backdrop-blur-sm"
        >
          <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
          
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-white mb-3 uppercase tracking-wide">CHECK YOUR EMAIL</h2>
              <p className="text-green-100 font-bold text-sm">We sent you a confirmation link!</p>
            </div>
            <div className="text-center">
              <button
                type="button"
                onClick={onToggleMode}
                className="text-green-200 hover:text-white underline-offset-4 hover:underline font-bold transition-colors duration-200 uppercase text-sm"
              >
                BACK TO SIGN IN
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Hybrid brutalist-modern card */}
      <div className="relative w-full overflow-hidden rounded-2xl border-2 border-brand-800/70 bg-gradient-to-b from-brand-950 to-brand-900 text-amber-50 shadow-brand backdrop-blur-sm">
        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-brand-400/10" />
        
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-amber-50 mb-3 uppercase tracking-wide">CREATE ACCOUNT</h2>
            <p className="text-amber-100/80 font-bold text-sm">Join the squad. Let's build streaks and PRs.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-danger border-2 border-black text-white p-4 shadow-brutalist font-bold uppercase text-sm rounded animate-shake"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="block font-bold text-xs text-amber-100 uppercase tracking-wide" htmlFor="email">
                EMAIL
              </label>
              <input 
                className="w-full h-12 p-4 border-2 border-brand-700 bg-brand-950/80 text-amber-50 placeholder:text-amber-200/60 font-mono font-bold text-base rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:shadow-brutalist disabled:opacity-60 disabled:cursor-not-allowed"
                id="email"
                type="email"
                inputMode="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="block font-bold text-xs text-amber-100 uppercase tracking-wide" htmlFor="password">
                PASSWORD
              </label>
              <input 
                className="w-full h-12 p-4 border-2 border-brand-700 bg-brand-950/80 text-amber-50 placeholder:text-amber-200/60 font-mono font-bold text-base rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:shadow-brutalist disabled:opacity-60 disabled:cursor-not-allowed"
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
              <small className="text-amber-300/70 font-semibold text-xs">
                • At least 6 characters
              </small>
            </div>

            <div className="space-y-2">
              <label className="block font-bold text-xs text-amber-100 uppercase tracking-wide" htmlFor="confirmPassword">
                CONFIRM PASSWORD
              </label>
              <input 
                className="w-full h-12 p-4 border-2 border-brand-700 bg-brand-950/80 text-amber-50 placeholder:text-amber-200/60 font-mono font-bold text-base rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:shadow-brutalist disabled:opacity-60 disabled:cursor-not-allowed"
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            <div className="pt-2">
              <motion.div whileHover={{ y: -1 }} whileTap={{ y: 0 }}>
                <button 
                  type="submit" 
                  className="group relative flex h-12 w-full items-center justify-center overflow-hidden rounded-lg bg-brand-500 border-2 border-brand-600 font-black tracking-wide text-white shadow-brutalist transition-all duration-200 hover:bg-brand-600 hover:shadow-brutalist-lg focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-60 disabled:cursor-not-allowed uppercase"
                  disabled={loading}
                >
                  <span className="relative z-10">
                    {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
                  </span>
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                </button>
              </motion.div>
            </div>
          </form>

          <div className="text-center mt-6">
            <p className="text-amber-100/85 font-bold text-sm">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onToggleMode}
                className="text-brand-300 hover:text-brand-200 underline-offset-4 hover:underline font-bold transition-colors duration-200 uppercase"
              >
                SIGN IN
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}