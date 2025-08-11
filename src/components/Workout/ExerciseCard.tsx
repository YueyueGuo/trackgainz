import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronUp, ChevronDown, MessageSquare, Trash2, Plus, Check, X } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { WorkoutSet, SetType } from '../../types/workout'

interface ExerciseCardProps {
  id?: string // Optional for backwards compatibility
  name: string
  sets: WorkoutSet[]
  note?: string
  loading?: boolean
  onReorder?: (direction: 'up' | 'down') => void
  onRemove?: () => void
  onUpdateSet?: (setId: string, updates: any) => void
  onAddSet?: () => void
  onAddNote?: (note: string) => void
  onUpdateName?: (name: string) => void
  onOpenExerciseSelector?: () => void
  onRemoveSet?: (setId: string) => void
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  id,
  name,
  sets,
  note,
  loading = false,
  onReorder,
  onRemove,
  onUpdateSet,
  onAddSet,
  onAddNote,
  onUpdateName,
  onOpenExerciseSelector,
  onRemoveSet,
}) => {
  const [showNoteInput, setShowNoteInput] = useState(false)
  const [noteText, setNoteText] = useState(note || '')

  // Generate IDs for backwards compatibility with old data
  const exerciseId = id || `ex-${Date.now()}`
  const setsWithIds = sets.map((set, index) => ({
    ...set,
    id: set.id || `${exerciseId}-${index}`
  }))

  const handleSetComplete = (setId: string) => {
    onUpdateSet?.(setId, { completed: !setsWithIds.find(s => s.id === setId)?.completed })
  }

  const handleSaveNote = () => {
    onAddNote?.(noteText)
    setShowNoteInput(false)
  }

  const handleClearNote = () => {
    setNoteText('')
    onAddNote?.('')
    setShowNoteInput(false)
  }

  const handleCancelNote = () => {
    setNoteText(note || '')
    setShowNoteInput(false)
  }

  const handleNameChange = (newName: string) => {
    const upperName = newName.toUpperCase()
    onUpdateName?.(upperName)
  }

  const handleWeightChange = (setId: string, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value)
    onUpdateSet?.(setId, { weight: numValue })

    // Propagate to sets below
    const currentIndex = setsWithIds.findIndex(s => s.id === setId)
    for (let i = currentIndex + 1; i < setsWithIds.length; i++) {
      onUpdateSet?.(setsWithIds[i].id!, { weight: numValue })
    }
  }

  const handleRepsChange = (setId: string, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value)
    onUpdateSet?.(setId, { reps: numValue })

    // Propagate to sets below
    const currentIndex = setsWithIds.findIndex(s => s.id === setId)
    for (let i = currentIndex + 1; i < setsWithIds.length; i++) {
      onUpdateSet?.(setsWithIds[i].id!, { reps: numValue })
    }
  }

  const handleTypeChange = (setId: string, value: string) => {
    onUpdateSet?.(setId, { type: value })

    // Propagate to sets below
    const currentIndex = setsWithIds.findIndex(s => s.id === setId)
    for (let i = currentIndex + 1; i < setsWithIds.length; i++) {
      onUpdateSet?.(setsWithIds[i].id!, { type: value })
    }
  }

  // Update noteText when note prop changes (for consistency)
  React.useEffect(() => {
    setNoteText(note || '')
  }, [note])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="relative overflow-hidden rounded-2xl border border-[#5a3714]/70 bg-[linear-gradient(135deg,#2f1808_0%,#1a0f06_100%)] shadow-[0_20px_60px_-20px_rgba(255,153,0,0.5)]"
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-[#ffb547]/10" />

      {/* Exercise Header */}
      <div className="relative border-b border-[#5a3714]/50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => onReorder?.('up')}
              className="text-amber-100/60 hover:text-amber-100 disabled:opacity-30"
              disabled={loading}
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onReorder?.('down')}
              className="text-amber-100/60 hover:text-amber-100 disabled:opacity-30"
              disabled={loading}
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          <Input
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            onClick={onOpenExerciseSelector}
            placeholder="Exercise name (e.g., Bench Press)"
            className="flex-1 border-2 border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-500 focus-visible:ring-slate-400 focus-visible:border-slate-400 cursor-pointer"
            disabled={loading}
            readOnly={!name} // Make it read-only when empty to encourage using the selector
          />

          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setShowNoteInput(!showNoteInput)}
              className="relative text-amber-100/60 hover:bg-[#241307] hover:text-amber-100"
              disabled={loading}
            >
              <MessageSquare className="h-4 w-4" />
              {note && note.trim().length > 0 && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-brand-400 ring-1 ring-[#2f1808]" />
              )}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={onRemove}
              className="text-red-400/60 hover:bg-red-500/10 hover:text-red-400"
              disabled={loading}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Note Input */}
        {showNoteInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3"
          >
            <Textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add a note about this exercise..."
              className="border-[#6b3a0e] bg-[#241307] text-amber-50 placeholder:text-amber-200/60"
              rows={2}
            />
            <div className="mt-2 flex gap-2">
              <Button 
                type="button"
                size="sm" 
                onClick={handleSaveNote}
                className="bg-brand-500 hover:bg-brand-600"
              >
                Save Note
              </Button>
              {note && note.trim().length > 0 && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleClearNote}
                  className="border-red-400/30 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                >
                  Clear Note
                </Button>
              )}
              <Button 
                type="button"
                size="sm" 
                variant="ghost" 
                onClick={handleCancelNote}
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Sets Header */}
      <div className="relative border-b border-[#5a3714]/30 px-4 py-2">
        <div className="grid grid-cols-12 gap-1 text-xs font-bold uppercase tracking-wide text-amber-100/80">
          <div className="col-span-1 flex items-center justify-center">Set</div>
          <div className="col-span-3 flex items-center justify-center">Weight</div>
          <div className="col-span-2 flex items-center justify-center">Reps</div>
          <div className="col-span-3 flex items-center justify-center">Type</div>
          <div className="col-span-2 flex items-center justify-center">✓</div>
          <div className="col-span-1"></div> {/* Remove column - no header */}
        </div>
      </div>

      {/* Sets List */}
      <div className="relative p-4 pt-2">
        {setsWithIds.map((set, setIndex) => (
          <motion.div
            key={set.id}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`mb-1 grid grid-cols-12 gap-1 rounded-lg p-2 transition-colors ${
              set.completed ? 'bg-green-500/10 ring-1 ring-green-500/20' : 'bg-[#241307]/50'
            }`}
          >
            <div className="col-span-1 flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2b1508] text-sm font-bold text-amber-100">
                {setIndex + 1}
              </div>
            </div>

            <div className="col-span-3">
              <Input
                type="number"
                value={set.weight || ''}
                onChange={(e) => handleWeightChange(set.id!, e.target.value)}
                onFocus={(e) => e.target.select()}
                className="h-8 border-[#6b3a0e] bg-[#241307] text-amber-50"
                placeholder="0"
                disabled={loading}
              />
            </div>

            <div className="col-span-2">
              <Input
                type="number"
                value={set.reps || ''}
                onChange={(e) => handleRepsChange(set.id!, e.target.value)}
                onFocus={(e) => e.target.select()}
                className="h-8 border-[#6b3a0e] bg-[#241307] text-amber-50"
                placeholder="0"
                disabled={loading}
              />
            </div>

            <div className="col-span-3">
              <select
                value={set.type}
                onChange={(e) => handleTypeChange(set.id!, e.target.value)}
                className="h-8 w-full rounded border border-[#6b3a0e] bg-[#241307] text-xs text-amber-50"
                disabled={loading}
              >
                <option value="working"></option>
                <option value="warmup">Warm-up</option>
                <option value="failure">Failure</option>
              </select>
            </div>

            <div className="col-span-2 flex items-center justify-center">
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleSetComplete(set.id!)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                  set.completed
                    ? 'bg-green-500 text-white'
                    : 'border border-amber-400/30 bg-transparent text-amber-400 hover:bg-amber-400/10'
                }`}
                disabled={loading}
              >
                {set.completed ? <Check className="h-4 w-4" /> : null}
              </motion.button>
            </div>

            <div className="col-span-1 flex items-center justify-center">
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onRemoveSet?.(set.id!)}
                className="flex h-6 w-6 items-center justify-center rounded-full border border-red-400/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                disabled={loading}
              >
                <X className="h-3 w-3" />
              </motion.button>
            </div>
          </motion.div>
        ))}

        {/* Add Set Button */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            type="button"
            onClick={onAddSet}
            variant="outline"
            className="mt-2 w-full border-brand-400/30 bg-brand-500/10 text-brand-300 hover:bg-brand-500/20"
            disabled={loading}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Set
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}