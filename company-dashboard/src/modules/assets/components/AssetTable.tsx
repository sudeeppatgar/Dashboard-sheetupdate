import { assetStatusOptions } from '../constants'
import EmptyState from '../../../shared/components/EmptyState'
import { formatDate } from '../../../shared/utils/formatDate'
import type { Asset } from '../types'

type AssetTableProps = {
  assets: Asset[]
  totalCount: number
  canManage: boolean
  submitting: boolean
  onViewDetails: (asset: Asset) => void
  onEdit: (asset: Asset) => void
  onDelete: (id: string) => void
  onAssign: (asset: Asset) => void
  onReturn: (asset: Asset) => void
}

function AssetTable({
  assets,
  totalCount,
  canManage,
  submitting,
  onViewDetails,
  onEdit,
  onDelete,
  onAssign,
  onReturn,
}: AssetTableProps) {
  return (
    <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
      <table className="min-w-[1180px] w-full border-collapse text-left text-sm">
        <thead className="bg-slate-100 text-slate-600">
          <tr>
            <th className="px-4 py-3 font-medium">Asset</th>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium">Make model</th>
            <th className="px-4 py-3 font-medium">Processor</th>
            <th className="px-4 py-3 font-medium">Serial</th>
            <th className="px-4 py-3 font-medium">Purchase / transaction</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Added by</th>
            {canManage ? <th className="px-4 py-3 font-medium">Actions</th> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {assets.length === 0 ? (
            <tr>
              <td className="px-4 py-8 text-center text-slate-500" colSpan={canManage ? 9 : 8}>
                <EmptyState
                  title={totalCount === 0 ? 'No assets yet' : 'No matching assets'}
                  message={
                    totalCount === 0
                      ? canManage
                        ? 'Add an asset to start tracking company equipment.'
                        : 'No assets are currently available to view.'
                      : 'Try changing or clearing the selected filters.'
                  }
                />
              </td>
            </tr>
          ) : (
            assets.map((asset) => (
              <tr key={asset._id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => onViewDetails(asset)}
                    className="group text-left focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2"
                    aria-label={`View details for ${asset.fullName}`}
                  >
                    <span className="block font-medium text-slate-900 group-hover:text-cyan-700">
                      {asset.fullName}
                    </span>
                    <span className="mt-0.5 block text-xs text-cyan-700">View details</span>
                  </button>
                </td>
                <td className="px-4 py-3 text-slate-600">{asset.categoryId?.name ?? '—'}</td>
                <td className="px-4 py-3 text-slate-600">{asset.makeModelId?.name ?? '—'}</td>
                <td className="px-4 py-3 text-slate-600">{asset.processorId?.name ?? '—'}</td>
                <td className="px-4 py-3 text-slate-600">{asset.serialNumber || '—'}</td>
                <td className="px-4 py-3 text-slate-600">{formatDate(asset.transactionDate)}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      {assetStatusOptions.find(
                        (option) => option.value === (asset.status ?? 'available'),
                      )?.label ?? 'Available'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{asset.createdBy?.name ?? '—'}</td>
                {canManage ? (
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(asset)}
                        className="rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-medium text-cyan-700 transition hover:bg-cyan-100"
                      >
                        Edit
                      </button>
                      {(asset.status ?? 'available') === 'available' ? (
                        <button
                          type="button"
                          onClick={() => onAssign(asset)}
                          disabled={submitting}
                          className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Assign
                        </button>
                      ) : null}
                      {(asset.status ?? 'available') === 'assigned' ? (
                        <button
                          type="button"
                          onClick={() => onReturn(asset)}
                          disabled={submitting}
                          className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Return
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => onDelete(asset._id)}
                        disabled={submitting}
                        className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                ) : null}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default AssetTable
