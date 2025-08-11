import React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'
import { Button } from '../ui/button'

interface DiscardWorkoutModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export const DiscardWorkoutModal: React.FC<DiscardWorkoutModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm 
}) => {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-brand-800/70 bg-gradient-to-b from-brand-950 to-brand-900 shadow-brand">
          <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-brand-400/20" />

          {/* Header */}
          <div className="relative border-b border-brand-800/50 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20 text-red-400">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold text-amber-50">Discard Workout?</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-amber-100/60 hover:text-amber-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="relative p-6">
            <p className="mb-6 text-sm text-amber-100/80">
              Are you sure you want to discard this workout? All your progress and data will be lost and cannot be
              recovered.
            </p>

            <div className="flex gap-3">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1 border-brand-700/50 bg-brand-950/50 text-amber-100/60 hover:bg-brand-950/80"
              >
                Keep Workout
              </Button>
              <Button onClick={onConfirm} className="flex-1 bg-red-500 font-bold text-white hover:bg-red-600">
                Discard Workout
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}