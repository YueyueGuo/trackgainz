import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Login } from './Login'
import { Register } from './Register'
import ShimmerHeading from '../ShimmerHeading'

export const AuthPage: React.FC = () => {
  const [isLoginMode, setIsLoginMode] = useState(true)

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode)
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-transparent">
      {/* Modern gradient background with animated blobs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {/* Animated blobs */}
        <div className="animate-blob absolute -top-24 -left-16 h-64 w-64 rounded-full bg-brand-500/14 blur-3xl will-change-transform" />
        <div
          className="animate-blob absolute -bottom-24 -right-10 h-72 w-72 rounded-full bg-amber-400/14 blur-3xl will-change-transform"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <section className="relative z-10 mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-8 flex items-center justify-center"
        >
          <ShimmerHeading text="Track Gainz" className="text-4xl sm:text-5xl md:text-6xl" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="w-full"
        >
          {isLoginMode ? (
            <Login onToggleMode={toggleMode} />
          ) : (
            <Register onToggleMode={toggleMode} />
          )}
        </motion.div>
      </section>
    </main>
  )
}