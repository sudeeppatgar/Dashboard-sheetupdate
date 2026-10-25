import { useEffect, useState } from 'react'
import { getMyAssets } from '../../../lib/api'
import PageShell from '../../../shared/components/PageShell'
import EmptyState from '../../../shared/components/EmptyState'
import { formatDate } from '../../../shared/utils/formatDate'

function MyAssetsPage() {
  const [assets, setAssets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMyAssets()
        setAssets(Array.isArray(data) ? data : [])
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  return (
    <PageShell>
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">My Assets</h2>
            <p className="mt-1 text-sm text-slate-500">Assets assigned to you.</p>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-[900px] w-full border-collapse text-left text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Asset</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Make model</th>
                <th className="px-4 py-3 font-medium">Processor</th>
                <th className="px-4 py-3 font-medium">Serial</th>
                <th className="px-4 py-3 font-medium">Assigned</th>
                <th className="px-4 py-3 font-medium">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td className="px-4 py-8 text-center text-slate-500" colSpan={7}>
                    Loading...
                  </td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-slate-500" colSpan={7}>
                    <EmptyState title="No assets assigned" message="You have no assets assigned to you." />
                  </td>
                </tr>
              ) : (
                assets.map((assignment: any) => {
                  const asset = assignment.assetId || assignment
                  return (
                    <tr key={assignment._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{asset.fullName}</td>
                      <td className="px-4 py-3 text-slate-600">{asset.categoryId?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-600">{asset.makeModelId?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-600">{asset.processorId?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-600">{asset.serialNumber || '—'}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(assignment.assignedAt)}</td>
                      <td className="px-4 py-3 text-slate-600">{asset.location || '—'}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </PageShell>
  )
}

export default MyAssetsPage
