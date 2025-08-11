import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'

interface WorkoutStats {
  duration: string
  exercises: number
  totalSets: number
  totalVolume: number
}

interface WorkoutCelebrationProps {
  show: boolean
  onComplete: () => void
  workoutStats: WorkoutStats
}

export const WorkoutCelebration: React.FC<WorkoutCelebrationProps> = ({ 
  show, 
  onComplete, 
  workoutStats 
}) => {
  const [currentMessage, setCurrentMessage] = useState(0)
  
  const messages = [
    "BEAST MODE: ACTIVATED! 💪",
    "You just CRUSHED that workout!",
    "Another step closer to greatness!",
    "The grind never stops! 🔥"
  ]

  useEffect(() => {
    if (show) {
      // Trigger confetti
      const duration = 3000
      const end = Date.now() + duration

      const colors = ['#FF9900', '#FFB547', '#FFC34A', '#FFD788']
      
      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors
        })
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors
        })

        if (Date.now() < end) {
          requestAnimationFrame(frame)
        }
      }
      frame()

      // Cycle through messages
      const messageInterval = setInterval(() => {
        setCurrentMessage(prev => (prev + 1) % messages.length)
      }, 800)

      // Auto-complete after 4 seconds
      const timeout = setTimeout(onComplete, 4000)

      return () => {
        clearInterval(messageInterval)
        clearTimeout(timeout)
      }
    }
  }, [show, onComplete])

  if (!show) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="mx-4 max-w-md rounded-3xl border border-brand-800/70 bg-gradient-to-b from-brand-950 to-brand-900 p-8 text-center shadow-brand"
          >
            <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-brand-400/20" />
            
            <motion.div
              key={currentMessage}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="mb-6"
            >
              <h1 className="bg-gradient-to-r from-brand-300 via-amber-300 to-brand-500 bg-clip-text text-2xl font-black uppercase tracking-tight text-transparent">
                {messages[currentMessage]}
              </h1>
            </motion.div>

            <div className="mb-6 grid grid-cols-2 gap-4 text-amber-50">
              <div className="rounded-xl bg-brand-950/80 p-3">
                <div className="text-2xl font-bold text-brand-400">{workoutStats.duration}</div>
                <div className="text-xs uppercase tracking-wide text-amber-100/60">Duration</div>
              </div>
              <div className="rounded-xl bg-brand-950/80 p-3">
                <div className="text-2xl font-bold text-brand-400">{workoutStats.exercises}</div>
                <div className="text-xs uppercase tracking-wide text-amber-100/60">Exercises</div>
              </div>
              <div className="rounded-xl bg-brand-950/80 p-3">
                <div className="text-2xl font-bold text-brand-400">{workoutStats.totalSets}</div>
                <div className="text-xs uppercase tracking-wide text-amber-100/60">Total Sets</div>
              </div>
              <div className="rounded-xl bg-brand-950/80 p-3">
                <div className="text-2xl font-bold text-brand-400">{workoutStats.totalVolume}k</div>
                <div className="text-xs uppercase tracking-wide text-amber-100/60">Volume (lbs)</div>
              </div>
            </div>

            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-4xl"
            >
              🏆
            </motion.div>
          </motion.div>
        </motion.div>
  )
}