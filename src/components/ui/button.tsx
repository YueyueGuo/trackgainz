import React from 'react'
import { cn } from '../../lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({ 
  className, 
  variant = 'default', 
  size = 'default', 
  children, 
  ...props 
}) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-60 disabled:cursor-not-allowed",
        // Variants
        variant === 'default' && "bg-brand-500 text-white hover:bg-brand-600",
        variant === 'outline' && "border border-zinc-700/50 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800/50",
        variant === 'ghost' && "text-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-100",
        // Sizes
        size === 'sm' && "px-3 py-2 text-sm",
        size === 'default' && "px-4 py-2 text-sm",
        size === 'lg' && "px-6 py-3 text-base",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}