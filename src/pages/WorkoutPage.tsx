import React, { useState } from 'react'
import { JSONBWorkoutList } from '../components/Workout/JSONBWorkoutList'

export const WorkoutPage: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  return (
    <div className="main-content">
      <div className="workout-history-header">
        <h2>WORKOUT HISTORY</h2>
        <p>View and manage your past workout sessions</p>
      </div>
      
      <JSONBWorkoutList 
        refreshTrigger={refreshTrigger} 
      />
    </div>
  )
}