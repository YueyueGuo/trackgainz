import React from 'react'
import { cn } from '../../lib/utils'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea: React.FC<TextareaProps> = ({ className, ...props }) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-lg border-2 border-brand-700 bg-brand-950/80 px-3 py-2 text-sm text-amber-50 placeholder:text-amber-200/60 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none",
        className
      )}
      {...props}
    />
  )
}