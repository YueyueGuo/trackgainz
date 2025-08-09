import React from 'react'
import { PencilLine, Dumbbell, BarChart3, UserRound } from 'lucide-react'
import { cn } from '../../lib/utils'

interface BottomNavProps {
  currentView: 'record' | 'workouts' | 'progress' | 'profile';
  onViewChange: (view: 'record' | 'workouts' | 'progress' | 'profile') => void;
}

const tabs = [
  { key: 'record' as const, label: "Record", icon: PencilLine },
  { key: 'workouts' as const, label: "Workouts", icon: Dumbbell },
  { key: 'progress' as const, label: "Progress", icon: BarChart3 },
  { key: 'profile' as const, label: "Profile", icon: UserRound },
]

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onViewChange }) => {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-lg px-4 pb-4">
      <div className="flex items-center justify-around rounded-2xl border border-zinc-800/60 bg-zinc-950/80 px-2 py-2 shadow-brand backdrop-blur-md">
        {tabs.map(({ key, label, icon: Icon }) => {
          const active = currentView === key
          return (
            <button
              key={key}
              onClick={() => onViewChange(key)}
              className={cn(
                "group relative flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold",
                active ? "text-brand-300" : "text-zinc-300 hover:text-zinc-100"
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl border transition-all",
                  active
                    ? "border-brand-400/40 bg-brand-500/15 shadow-[0_10px_30px_-10px_rgba(255,153,0,0.6)]"
                    : "border-zinc-700/70 bg-zinc-900/60 group-hover:border-zinc-600"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span>{label}</span>
              {active && (
                <span
                  aria-hidden="true"
                  className="absolute -bottom-1 h-1 w-8 rounded-full bg-gradient-to-r from-brand-300 via-amber-300 to-brand-500"
                />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
} 