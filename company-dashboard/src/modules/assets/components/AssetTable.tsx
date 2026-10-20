import { assetStatusOptions } from '../constants'
import type { Asset } from '../types'

type AssetTableProps = {
  assets: Asset[]
  totalCount: number
  canManage: boolean
  submitting: boolean
  onEdit: (asset: Asset) => void
  onDelete: (id: string) => void
}

function AssetTable({ assets, totalCount, canManage, submitting, onEdit, onDelete }: AssetTableProps) {
  return (
    <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
      <table className="min-w-[1040px] w-full border-collapse text-left text-sm">
        <thead className="bg-slate-100 text-slate-600">
          <tr>
            <th className="px-4 py-3 font-medium">Asset</th>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium">Make model</th>
            <th className="px-4 py-3 font-medium">Processor</th>
            <th className="px-4 py-3 font-medium">Serial</th>
            <th className="px-4 py-3 font-medium">Status</th>
            {canManage ? <th className="px-4 py-3 font-medium">Actions</th> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {assets.length === 0 ? (
            <tr>
              <td className="px-4 py-8 text-center text-slate-500" colSpan={canManage ? 7 : 6}>
                {totalCount === 0 ? 'No assets found.' : 'No assets match the selected filters.'}
              </td>
            </tr>
          ) : (
            assets.map((asset) => (
              <tr key={asset._id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{asset.fullName}</td>
                <td className="px-4 py-3 text-slate-600">{asset.categoryId?.name ?? '—'}</td>
                <td className="px-4 py-3 text-slate-600">{asset.makeModelId?.name ?? '—'}</td>
                <td className="px-4 py-3 text-slate-600">{asset.processorId?.name ?? '—'}</td>
                <td className="px-4 py-3 text-slate-600">{asset.serialNumber ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {assetStatusOptions.find(
                      (option) => option.value === (asset.status ?? 'available'),
                    )?.label ?? 'Available'}
                  </span>
                </td>
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
