import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'

interface LoginProps {
  onToggleMode: () => void
}

export const Login: React.FC<LoginProps> = ({ onToggleMode }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await signIn(email, password)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      {/* Hybrid brutalist-modern card */}
      <div className="relative w-full overflow-hidden rounded-2xl border-2 border-brand-800/70 bg-gradient-to-b from-brand-950 to-brand-900 text-amber-50 shadow-brand backdrop-blur-sm">
        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-brand-400/10" />
        
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-amber-50 mb-3 tracking-wide">Sign In</h2>
            <p className="text-amber-100/80 font-bold text-sm">Welcome back, warrior!</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-danger border-2 border-black text-white p-4 shadow-brutalist font-bold text-sm rounded animate-shake"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="block font-bold text-xs text-amber-100 tracking-wide" htmlFor="email">
                Email
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
              <label className="block font-bold text-xs text-amber-100 tracking-wide" htmlFor="password">
                Password
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
              />
            </div>

            <div className="pt-2">
              <motion.div whileHover={{ y: -1 }} whileTap={{ y: 0 }}>
                <button 
                  type="submit" 
                  className="group relative flex h-12 w-full items-center justify-center overflow-hidden rounded-lg bg-brand-500 border-2 border-brand-600 font-black tracking-wide text-white shadow-brutalist transition-all duration-200 hover:bg-brand-600 hover:shadow-brutalist-lg focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  <span className="relative z-10">
                    {loading ? 'Signing In...' : 'Sign In'}
                  </span>
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                </button>
              </motion.div>
            </div>
          </form>

          <div className="text-center mt-6">
            <p className="text-amber-100/85 font-bold text-sm">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onToggleMode}
                className="text-brand-300 hover:text-brand-200 underline-offset-4 hover:underline font-bold transition-colors duration-200"
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}