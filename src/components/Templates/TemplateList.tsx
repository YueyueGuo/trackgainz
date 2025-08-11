import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, Search, MoreHorizontal, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { WorkoutTemplate } from '../../types/workout'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

interface TemplateListProps {
  onSelectTemplate: (template: WorkoutTemplate) => void
  onCreateTemplate: () => void
  onBack: () => void
  refreshTrigger: number
}

export const TemplateList: React.FC<TemplateListProps> = ({ 
  onSelectTemplate, 
  onCreateTemplate, 
  onBack,
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
          <Button variant="ghost" size="sm" className="!text-slate-900" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="text-center">
            <h1 className="bg-gradient-to-r from-brand-300 via-amber-300 to-brand-500 bg-clip-text text-xl font-black uppercase tracking-tight text-transparent">
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
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-2 border-slate-300 bg-slate-50 pl-10 text-slate-900 placeholder:text-slate-500 focus-visible:ring-slate-400 focus-visible:border-slate-400"
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
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.1 * index, duration: 0.5, ease: "easeOut" }}
                className="group relative overflow-hidden rounded-2xl border border-[#5a3714]/70 bg-[linear-gradient(135deg,#2f1808_0%,#1a0f06_100%)] p-4 shadow-[0_20px_60px_-20px_rgba(255,153,0,0.5)] transition-all hover:shadow-[0_25px_80px_-20px_rgba(255,153,0,0.6)] cursor-pointer"
                onClick={() => onSelectTemplate(template)}
              >
                <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-[#ffb547]/10" />

                {/* Hover glow effect */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                >
                  <span className="absolute -inset-1 bg-[radial-gradient(600px_200px_at_50%_0%,rgba(255,200,120,0.08),transparent_60%)]" />
                </span>

                <div className="relative">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold uppercase tracking-wide text-amber-50">
                      {template.name}
                    </h3>
                    {template.description && (
                      <p className="text-sm text-amber-100/70">
                        {template.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={(e) => deleteTemplate(template.id, template.name, e)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-500/20 rounded-lg"
                    title="Delete template"
                  >
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </button>
                </div>

                <div className="mb-4 flex items-center gap-4 text-sm text-amber-100/70">
                  <span className="flex items-center gap-1">
                    <span className="font-semibold text-brand-400">
                      {template.exercises?.exercises?.length || 0}
                    </span>
                    exercises
                  </span>
                  <span>Created {formatDate(template.created_at)}</span>
                </div>

                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {template.exercises?.exercises?.slice(0, 3).map((exercise, idx) => (
                      <span key={idx} className="rounded-full bg-brand-500/20 px-2 py-1 text-xs font-medium text-brand-300">
                        {exercise.name}
                      </span>
                    ))}
                    {template.exercises?.exercises?.length > 3 && (
                      <span className="rounded-full bg-amber-500/20 px-2 py-1 text-xs font-medium text-amber-300">
                        +{template.exercises.exercises.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => onSelectTemplate(template)}
                    className="group/button relative flex-1 overflow-hidden bg-brand-500 font-bold tracking-wide text-white shadow-[0_10px_30px_-10px_rgba(255,153,0,0.7)] transition-colors hover:bg-brand-600"
                  >
                    <span className="relative z-10">Use Template</span>
                    <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.28),transparent)] transition-transform duration-1000 group-hover/button:translate-x-full" />
                  </Button>
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