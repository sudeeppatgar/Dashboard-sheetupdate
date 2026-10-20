import { useEffect } from 'react'
import { assetStatusOptions } from '../constants'
import type { Asset } from '../types'
import { formatDate, formatTimestamp } from '../../../shared/utils/formatDate'

type AssetDetailPanelProps = {
  asset: Asset
  onClose: () => void
}

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
    <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</dt>
    <dd className="mt-1 text-sm font-medium text-slate-900">{value}</dd>
  </div>
)

function AssetDetailPanel({ asset, onClose }: AssetDetailPanelProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const status = asset.status ?? 'available'
  const statusLabel =
    assetStatusOptions.find((option) => option.value === status)?.label ?? 'Available'

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-4 sm:items-center"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        className="max-h-[min(720px,calc(100vh-2rem))] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-7"
        role="dialog"
        aria-modal="true"
        aria-labelledby="asset-detail-title"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
              Asset details
            </p>
            <h2 id="asset-detail-title" className="mt-1 text-2xl font-semibold tracking-tight">
              {asset.fullName}
            </h2>
            <p className="mt-1 text-sm text-slate-500">Review linked values and asset history.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            aria-label="Close asset details"
            autoFocus
          >
            Close
          </button>
        </div>

        <dl className="mt-6 grid gap-3 sm:grid-cols-2">
          <DetailItem label="Category" value={asset.categoryId?.name ?? 'Not linked'} />
          <DetailItem label="Make model" value={asset.makeModelId?.name ?? 'Not linked'} />
          <DetailItem label="Processor" value={asset.processorId?.name ?? 'Not linked'} />
          <DetailItem label="Serial number" value={asset.serialNumber || 'Not provided'} />
          <DetailItem label="Purchase / transaction date" value={formatDate(asset.transactionDate)} />
          <DetailItem label="Status" value={statusLabel} />
          <DetailItem label="Created" value={formatTimestamp(asset.createdAt)} />
          <DetailItem label="Last updated" value={formatTimestamp(asset.updatedAt)} />
        </dl>
      </section>
    </div>
  )
}

export default AssetDetailPanel
