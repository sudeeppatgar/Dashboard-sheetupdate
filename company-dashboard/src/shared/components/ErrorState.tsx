type ErrorStateProps = {
  message: string
  onRetry?: () => void | Promise<void>
}

function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-12 text-center shadow-sm"
      role="alert"
    >
      <p className="font-semibold text-rose-800">We couldn&apos;t load the dashboard</p>
      <p className="mx-auto mt-2 max-w-xl text-sm text-rose-700">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={() => void onRetry()}
          className="mt-5 inline-flex items-center justify-center rounded-2xl bg-rose-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2"
        >
          Try again
        </button>
      ) : null}
    </div>
  )
}

export default ErrorState
