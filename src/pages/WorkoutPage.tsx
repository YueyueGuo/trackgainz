import React, { useState } from 'react'
import { JSONBWorkoutList } from '../components/Workout/JSONBWorkoutList'

export const WorkoutPage: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  return (
    <div className="main-content">
      <JSONBWorkoutList 
        refreshTrigger={refreshTrigger} 
      />
    </div>
  )
}