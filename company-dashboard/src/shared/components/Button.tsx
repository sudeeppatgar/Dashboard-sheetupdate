import type { ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'hero'
  size?: 'md' | 'sm'
}

const variantClasses = {
  primary: 'border border-slate-950 bg-slate-950 text-white hover:bg-slate-800',
  secondary: 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50',
  accent: 'border border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100',
  danger: 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100',
  hero: 'border border-white/20 bg-white/10 text-white hover:bg-white/20',
} as const

const sizeClasses = {
  md: 'rounded-2xl px-4 py-3 text-sm',
  sm: 'rounded-xl px-3 py-2 text-xs',
} as const

export default function Button({ variant = 'secondary', size = 'md', className = '', children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  )
}
