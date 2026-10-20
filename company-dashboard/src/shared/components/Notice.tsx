import type { Notice as NoticeValue } from '../types'

type NoticeProps = {
  notice: NoticeValue
  className?: string
}

function Notice({ notice, className = '' }: NoticeProps) {
  return (
    <div
      className={`${className} rounded-2xl border px-4 py-3 text-sm ${
        notice.type === 'success'
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-rose-200 bg-rose-50 text-rose-700'
      }`.trim()}
    >
      {notice.message}
    </div>
  )
}

export default Notice
