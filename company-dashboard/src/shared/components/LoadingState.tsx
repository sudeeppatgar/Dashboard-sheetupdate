type LoadingStateProps = {
  message?: string
}

function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <div
      className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-sm"
      role="status"
      aria-live="polite"
    >
      <span
        className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-500"
        aria-hidden="true"
      />
      <span>{message}</span>
    </div>
  )
}

export default LoadingState
