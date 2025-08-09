import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronUp, ChevronDown, MessageSquare, Trash2, Plus, Check, X } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { WorkoutSet, SetType } from '../../types/workout'

interface ExerciseCardProps {
  exerciseIndex: number
  name: string
  sets: WorkoutSet[]
  note?: string
  loading?: boolean
  onReorder?: (direction: 'up' | 'down') => void
  onRemove?: () => void
  onUpdateSet?: (setIndex: number, field: keyof WorkoutSet, value: number | SetType | boolean) => void
  onAddSet?: () => void
  onAddNote?: (note: string) => void
  onUpdateName?: (name: string) => void
  onRemoveSet?: (setIndex: number) => void
  onCycleSetType?: (setIndex: number) => void
  onToggleSetCompletion?: (setIndex: number) => void
  onOpenExerciseSelector?: () => void
  isFirst?: boolean
  isLast?: boolean
}

const SET_TYPE_CONFIG = {
  regular: { symbol: '', label: 'Working' },
  warmup: { symbol: 'W', label: 'Warm-Up' },
  failure: { symbol: 'F', label: 'Failure' }
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exerciseIndex,
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
  onRemoveSet,
  onCycleSetType,
  onToggleSetCompletion,
  onOpenExerciseSelector,
  isFirst = false,
  isLast = false,
}) => {
  const [showNoteInput, setShowNoteInput] = useState(false)
  const [noteText, setNoteText] = useState(note || '')

  const handleSetComplete = (setIndex: number) => {
    onToggleSetCompletion?.(setIndex)
  }

  const handleSaveNote = () => {
    onAddNote?.(noteText)
    setShowNoteInput(false)
  }

  const handleNameChange = (newName: string) => {
    onUpdateName?.(newName.toUpperCase())
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="relative overflow-hidden rounded-2xl border border-brand-800/70 bg-gradient-to-b from-brand-950 to-brand-900 shadow-brand"
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-brand-400/10" />

      {/* Exercise Header */}
      <div className="relative border-b border-brand-800/50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onReorder?.('up')
              }}
              className="text-amber-100/60 hover:text-amber-100 disabled:opacity-30"
              disabled={isFirst || loading}
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onReorder?.('down')
              }}
              className="text-amber-100/60 hover:text-amber-100 disabled:opacity-30"
              disabled={isLast || loading}
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          <Input
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            onFocus={() => onOpenExerciseSelector?.()}
            placeholder="EXERCISE NAME (E.G., BENCH PRESS)"
            className="flex-1 border-brand-700 bg-brand-950/80 text-amber-50 placeholder:text-amber-200/60"
            disabled={loading}
          />

          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                setShowNoteInput(!showNoteInput)
              }}
              className="relative text-amber-100/60 hover:bg-brand-950/80 hover:text-amber-100 border-brand-700/50"
              disabled={loading}
            >
              <MessageSquare className="h-4 w-4" />
              {note && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-brand-400 ring-1 ring-brand-950" />
              )}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                onRemove?.()
              }}
              className="text-red-400/60 hover:bg-red-500/10 hover:text-red-400 border-red-500/30"
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
              className="border-brand-700 bg-brand-950/80 text-amber-50 placeholder:text-amber-200/60"
              rows={2}
            />
            <div className="mt-2 flex gap-2">
              <Button 
                size="sm" 
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleSaveNote()
                }} 
                className="bg-brand-500 hover:bg-brand-600"
              >
                Save Note
              </Button>
              <Button 
                size="sm" 
                type="button"
                variant="outline" 
                onClick={(e) => {
                  e.stopPropagation()
                  setShowNoteInput(false)
                }}
                className="border-brand-700/50 text-amber-100/60 hover:bg-brand-950/80"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Sets Header */}
      <div className="relative border-b border-brand-800/30 px-4 py-2">
        <div className="grid grid-cols-12 gap-2 text-xs font-bold uppercase tracking-wide text-amber-100/80">
          <div className="col-span-1 text-center">Set</div>
          <div className="col-span-2 text-center">Weight</div>
          <div className="col-span-2 text-center">Reps</div>
          <div className="col-span-2 text-center">Type</div>
          <div className="col-span-2 text-center">Done</div>
          <div className="col-span-1 text-center">Remove</div>
        </div>
      </div>

      {/* Sets List */}
      <div className="relative p-4 pt-2">
        {sets.map((set, setIndex) => (
          <motion.div
            key={setIndex}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`mb-2 grid grid-cols-12 gap-2 rounded-lg p-2 transition-colors ${
              set.completed ? 'bg-green-500/10 ring-1 ring-green-500/20' : 'bg-brand-950/50'
            }`}
          >
              <div className="col-span-1 flex items-center justify-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-950/80 text-sm font-bold text-amber-100">
                  {setIndex + 1}
                </div>
              </div>

              <div className="col-span-2">
                <Input
                  type="number"
                  value={set.weight || ''}
                  onChange={(e) => {
                    const rawValue = e.target.value
                    const parsedValue = rawValue === '' ? 0 : parseFloat(rawValue)
                    onUpdateSet?.(setIndex, 'weight', parsedValue)
                  }}
                  className="h-8 border-brand-700 bg-brand-950/80 text-amber-50 text-sm"
                  placeholder="0"
                  disabled={loading}
                  min="0"
                  step="0.25"
                />
              </div>

              <div className="col-span-2">
                <Input
                  type="number"
                  value={set.reps || ''}
                  onChange={(e) => {
                    const rawValue = e.target.value
                    const parsedValue = rawValue === '' ? 0 : parseInt(rawValue)
                    onUpdateSet?.(setIndex, 'reps', parsedValue)
                  }}
                  className="h-8 border-brand-700 bg-brand-950/80 text-amber-50 text-sm"
                  placeholder="0"
                  disabled={loading}
                  min="0"
                  step="1"
                />
              </div>

              <div className="col-span-2">
                <select
                  value={set.type}
                  onChange={(e) => {
                    e.stopPropagation()
                    onUpdateSet?.(setIndex, 'type', e.target.value as SetType)
                  }}
                  className="h-8 w-full rounded border border-brand-700 bg-brand-950/80 text-xs text-amber-50 hover:bg-brand-900/80 transition-colors"
                  disabled={loading}
                >
                  <option value="regular">Working</option>
                  <option value="warmup">Warm-Up</option>
                  <option value="failure">Failure</option>
                </select>
              </div>

              <div className="col-span-2 flex items-center justify-center">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSetComplete(setIndex)
                  }}
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
                {sets.length > 1 && (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemoveSet?.(setIndex)
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-400/30 bg-transparent text-red-400 hover:bg-red-400/10 transition-colors"
                    disabled={loading}
                    title="Remove Set"
                  >
                    <X className="h-3 w-3" />
                  </motion.button>
                )}
              </div>
            </motion.div>
        ))}

        {/* Add Set Button */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onAddSet?.()
            }}
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