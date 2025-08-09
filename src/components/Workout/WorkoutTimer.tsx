import React from 'react'
import { motion } from 'framer-motion'
import { Play, Pause } from 'lucide-react'
import { Button } from '../ui/button'

interface WorkoutTimerProps {
  seconds: number
  isActive: boolean
  onToggle: () => void
}

export const WorkoutTimer: React.FC<WorkoutTimerProps> = ({ 
  seconds, 
  isActive, 
  onToggle 
}) => {
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-brand-800/70 bg-gradient-to-b from-brand-950 to-brand-900 p-4 shadow-brand"
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-brand-400/10" />
      
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl font-black text-amber-50">
            {formatTime(seconds)}
          </div>
          <div className={`rounded-full px-2 py-1 text-xs font-bold uppercase tracking-wide ${
            isActive 
              ? 'bg-green-500/20 text-green-300' 
              : 'bg-amber-500/20 text-amber-300'
          }`}>
            {isActive ? 'Active' : 'Paused'}
          </div>
        </div>
        
        <Button
          size="sm"
          variant="outline"
          onClick={onToggle}
          className="border-brand-400/30 bg-brand-500/10 text-brand-300 hover:bg-brand-500/20"
        >
          {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
      </div>
    </motion.div>
  )
}