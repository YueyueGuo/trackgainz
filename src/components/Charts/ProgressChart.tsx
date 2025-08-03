import React, { useState, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    borderColor: string
    backgroundColor: string
    tension: number
  }[]
}

export const ProgressChart: React.FC = () => {
  const { user } = useAuth()
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [selectedExercise, setSelectedExercise] = useState<string>('')
  const [exercises, setExercises] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchExercises()
  }, [user])

  useEffect(() => {
    if (selectedExercise) {
      fetchProgressData()
    }
  }, [selectedExercise])

  const fetchExercises = async () => {
    if (!user) return

    try {
      // Get workouts with JSONB exercises data
      const { data: workouts, error: workoutError } = await supabase
        .from('workouts')
        .select('exercises')
        .eq('user_id', user.id)

      if (workoutError) throw workoutError

      // Extract unique exercise names from JSONB data
      const exerciseNames = new Set<string>()
      
      workouts.forEach(workout => {
        if (workout.exercises?.exercises) {
          workout.exercises.exercises.forEach((exercise: any) => {
            if (exercise.name && exercise.name.trim()) {
              exerciseNames.add(exercise.name.trim())
            }
          })
        }
      })

      const uniqueExercises = Array.from(exerciseNames)
      setExercises(uniqueExercises)
      
      if (uniqueExercises.length > 0 && !selectedExercise) {
        setSelectedExercise(uniqueExercises[0])
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchProgressData = async () => {
    if (!user || !selectedExercise) return

    try {
      const { data: workouts, error: workoutError } = await supabase
        .from('workouts')
        .select('date, exercises')
        .eq('user_id', user.id)
        .order('date', { ascending: true })

      if (workoutError) throw workoutError

      const progressData = workouts
        .map(workout => {
          if (!workout.exercises?.exercises) return null

          // Find the selected exercise in this workout
          const exerciseData = workout.exercises.exercises.find((ex: any) => 
            ex.name && ex.name.trim() === selectedExercise
          )

          if (!exerciseData || !exerciseData.sets || exerciseData.sets.length === 0) return null

          // Calculate max weight and total volume from sets
          const weights = exerciseData.sets
            .filter((set: any) => set.weight > 0 && set.reps > 0)
            .map((set: any) => set.weight)
          
          if (weights.length === 0) return null

          const maxWeight = Math.max(...weights)
          const totalVolume = exerciseData.sets.reduce((sum: number, set: any) => 
            sum + (set.weight * set.reps), 0
          )

          return {
            date: workout.date,
            maxWeight,
            totalVolume
          }
        })
        .filter(Boolean)

      const labels = progressData.map(item => 
        new Date(item!.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      )

      setChartData({
        labels,
        datasets: [
          {
            label: 'Max Weight (lbs)',
            data: progressData.map(item => item!.maxWeight),
            borderColor: '#FF8C00',
            backgroundColor: '#FF8C00',
            tension: 0.1
          },
          {
            label: 'Total Volume (lbs)',
            data: progressData.map(item => item!.totalVolume),
            borderColor: '#8B4513',
            backgroundColor: '#8B4513',
            tension: 0.1
          }
        ]
      })
    } catch (error: any) {
      setError(error.message)
    }
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            family: 'monospace',
            weight: 'bold'
          },
          color: '#2D1B0F'
        }
      },
      title: {
        display: true,
        text: `${selectedExercise.toUpperCase()} PROGRESS`,
        font: {
          family: 'monospace',
          size: 16,
          weight: 'bold'
        },
        color: '#000'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#ddd'
        },
        ticks: {
          font: {
            family: 'monospace'
          },
          color: '#2D1B0F'
        }
      },
      x: {
        grid: {
          color: '#ddd'
        },
        ticks: {
          font: {
            family: 'monospace'
          },
          color: '#2D1B0F'
        }
      }
    }
  }

  if (loading) {
    return <div className="loading">LOADING PROGRESS...</div>
  }

  if (error) {
    return <div className="error-message">{error}</div>
  }

  if (exercises.length === 0) {
    return (
      <div className="empty-state">
        <h3>NO EXERCISE DATA</h3>
        <p>Log some workouts to see your progress!</p>
      </div>
    )
  }

  return (
    <div className="progress-chart">
      <div className="chart-header">
        <h2>PROGRESS TRACKING</h2>
        <select
          value={selectedExercise}
          onChange={(e) => setSelectedExercise(e.target.value)}
          className="exercise-select"
        >
          {exercises.map(exercise => (
            <option key={exercise} value={exercise}>
              {exercise.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <div className="chart-container">
        {chartData && (
          <Line data={chartData} options={options} />
        )}
      </div>
    </div>
  )
}