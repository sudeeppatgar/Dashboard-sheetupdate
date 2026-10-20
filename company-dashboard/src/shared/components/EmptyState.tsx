type EmptyStateProps = {
  title: string
  message?: string
}

function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <div className="px-4 py-8 text-center">
      <p className="font-medium text-slate-700">{title}</p>
      {message ? <p className="mt-1 text-sm text-slate-500">{message}</p> : null}
    </div>
  )
}

export default EmptyState
