import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { WorkoutTemplate } from '../../types/workout'

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

  const fetchTemplates = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('workout_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true })

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

  const deleteTemplate = async (templateId: string) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="template-list">
        <div className="loading">LOADING TEMPLATES...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="template-list">
        <div className="error-message">{error}</div>
      </div>
    )
  }

  return (
    <div className="template-list">
      <div className="template-list-header">
        <h3>WORKOUT TEMPLATES</h3>
        <button 
          onClick={onCreateTemplate}
          className="create-template-btn"
        >
          + CREATE TEMPLATE
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="empty-templates-state">
          <p>No templates yet. Create your first template!</p>
        </div>
      ) : (
        <div className="templates-grid">
          {templates.map((template) => (
            <div key={template.id} className="template-card">
              <div className="template-header">
                <h4>{template.name}</h4>
                {template.description && (
                  <p className="template-description">{template.description}</p>
                )}
              </div>
              
              <div className="template-info">
                <span className="exercise-count">
                  {template.exercises?.exercises?.length || 0} exercises
                </span>
                <span className="template-date">
                  Created {formatDate(template.created_at)}
                </span>
              </div>

              <div className="template-exercises-preview">
                {template.exercises?.exercises?.slice(0, 3).map((exercise, index) => (
                  <div key={index} className="exercise-preview">
                    {exercise.name}
                  </div>
                ))}
                {template.exercises?.exercises?.length > 3 && (
                  <div className="exercise-preview more">
                    +{template.exercises.exercises.length - 3} more
                  </div>
                )}
              </div>

              <div className="template-actions">
                <button
                  onClick={() => onSelectTemplate(template)}
                  className="use-template-btn"
                >
                  START WORKOUT
                </button>
                <button
                  onClick={() => deleteTemplate(template.id)}
                  className="delete-template-btn"
                >
                  DELETE
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}