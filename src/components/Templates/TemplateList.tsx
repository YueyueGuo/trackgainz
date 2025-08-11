import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, MoreHorizontal, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { WorkoutTemplate } from '../../types/workout'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

interface TemplateListProps {
  onSelectTemplate: (template: WorkoutTemplate) => void
  onCreateTemplate: () => void
  refreshTrigger: number
}

export const TemplateList: React.FC<TemplateListProps> = ({ 
  onSelectTemplate, 
  onCreateTemplate, 
  refreshTrigger 
}) => {
  const { user } = useAuth()
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchTemplates = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('workout_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setTemplates(data || [])
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [user, refreshTrigger])

  const deleteTemplate = async (templateId: string, templateName: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent template selection when clicking delete
    if (!window.confirm(`Are you sure you want to delete "${templateName}"?`)) return

    try {
      const { error } = await supabase
        .from('workout_templates')
        .delete()
        .eq('id', templateId)

      if (error) throw error

      setTemplates(templates.filter(t => t.id !== templateId))
    } catch (error: any) {
      setError(error.message)
    }
  }

  const filteredTemplates = templates.filter(template => 
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (template.description && template.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <main className="relative min-h-dvh overflow-hidden bg-background">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 block dark:hidden bg-[radial-gradient(1000px_500px_at_-10%_-10%,theme(colors.brand.200/.25),transparent_60%),radial-gradient(800px_400px_at_110%_10%,theme(colors.brand.300/.18),transparent_60%),linear-gradient(180deg,theme(colors.white),theme(colors.slate.50))]" />
          <div className="absolute inset-0 hidden dark:block bg-[radial-gradient(1000px_500px_at_-10%_-10%,theme(colors.brand.400/.25),transparent_60%),radial-gradient(800px_400px_at_110%_10%,theme(colors.brand.600/.18),transparent_60%),linear-gradient(180deg,theme(colors.slate.950),theme(colors.slate.900))]" />
        </div>
        <section className="relative z-10 mx-auto max-w-lg px-4 pt-6 pb-24">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⏳</div>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">Loading templates...</p>
          </div>
        </section>
      </main>
    )
  }

  if (error) {
    return (
      <main className="relative min-h-dvh overflow-hidden bg-background">
        <section className="relative z-10 mx-auto max-w-lg px-4 pt-6 pb-24">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="mb-2 text-xl font-bold text-red-600">Error Loading Templates</h3>
            <p className="text-sm text-slate-700 dark:text-slate-300">{error}</p>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-background">
      {/* Background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 block dark:hidden bg-[radial-gradient(1000px_500px_at_-10%_-10%,theme(colors.brand.200/.25),transparent_60%),radial-gradient(800px_400px_at_110%_10%,theme(colors.brand.300/.18),transparent_60%),linear-gradient(180deg,theme(colors.white),theme(colors.slate.50))]" />
        <div className="absolute inset-0 hidden dark:block bg-[radial-gradient(1000px_500px_at_-10%_-10%,theme(colors.brand.400/.25),transparent_60%),radial-gradient(800px_400px_at_110%_10%,theme(colors.brand.600/.18),transparent_60%),linear-gradient(180deg,theme(colors.slate.950),theme(colors.slate.900))]" />
        <div className="animate-blob absolute -top-24 -left-16 h-64 w-64 rounded-full bg-brand-500/14 blur-3xl will-change-transform" />
        <div
          className="animate-blob absolute -bottom-24 -right-10 h-72 w-72 rounded-full bg-amber-400/14 blur-3xl will-change-transform"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <section className="relative z-10 mx-auto max-w-lg px-4 pt-6 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mb-6 flex items-center justify-between"
        >
          <div>
            <h1 className="bg-gradient-to-r from-brand-300 via-amber-300 to-brand-500 bg-clip-text text-2xl font-black uppercase tracking-tight text-transparent">
              Templates
            </h1>
            <p className="text-xs text-slate-700 dark:text-slate-300">Your saved workout routines</p>
          </div>
          <Button 
            onClick={onCreateTemplate}
            size="sm" 
            className="bg-brand-500 hover:bg-brand-600"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create
          </Button>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
          className="mb-6"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-900" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-2 border-amber-400 bg-amber-300 pl-10 text-amber-900 placeholder:text-amber-700 focus-visible:ring-amber-500"
            />
          </div>
        </motion.div>

        {/* Templates List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-4"
        >
          {filteredTemplates.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-center py-12"
            >
              <div className="mb-4 text-6xl">📋</div>
              <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-slate-100">
                {templates.length === 0 ? "No Templates Yet" : "No Matching Templates"}
              </h3>
              <p className="mb-6 text-sm text-slate-700 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
                {templates.length === 0 
                  ? "Create your first workout template to save time on future sessions. Templates let you quickly start workouts with your favorite exercises and rep schemes."
                  : "No templates match your search. Try a different search term or create a new template."
                }
              </p>
              {templates.length === 0 && (
                <Button 
                  onClick={onCreateTemplate}
                  className="bg-brand-500 hover:bg-brand-600 text-white font-semibold"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Template
                </Button>
              )}
            </motion.div>
          ) : (
            filteredTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.4 }}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
                onClick={() => onSelectTemplate(template)}
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
                      {template.name}
                    </h3>
                    {template.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {template.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={(e) => deleteTemplate(template.id, template.name, e)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    title="Delete template"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </div>

                <div className="mb-4 flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="font-semibold text-brand-600">
                      {template.exercises?.exercises?.length || 0}
                    </span>
                    exercises
                  </span>
                  <span>Created {formatDate(template.created_at)}</span>
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
                  {template.exercises?.exercises?.slice(0, 3).map((exercise, idx) => (
                    <div key={idx} className="rounded-full bg-slate-100 dark:bg-slate-700 px-3 py-1 text-xs text-slate-700 dark:text-slate-300">
                      {exercise.name}
                    </div>
                  ))}
                  {template.exercises?.exercises?.length > 3 && (
                    <div className="rounded-full bg-slate-100 dark:bg-slate-700 px-3 py-1 text-xs text-slate-500 dark:text-slate-400">
                      +{template.exercises.exercises.length - 3} more
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <Button 
                    onClick={() => onSelectTemplate(template)}
                    size="sm"
                    className="bg-brand-500 hover:bg-brand-600 text-white"
                  >
                    Start Workout
                  </Button>
                  <div className="text-xs text-slate-400">
                    Tap anywhere to use
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </section>
    </main>
  )
}