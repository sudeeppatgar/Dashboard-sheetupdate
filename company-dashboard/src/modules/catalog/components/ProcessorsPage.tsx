import { useState } from 'react'
import { useApp } from '../../../shared/context/useApp'
import PageShell from '../../../shared/components/PageShell'
import { useCrudResource } from '../../../shared/hooks/useCrudResource'
import { getErrorMessage } from '../../../shared/utils/getErrorMessage'
import NameResourceSection from './NameResourceSection'
import { createProcessor, deleteProcessor, getProcessors, updateProcessor } from '../api'
import { emptyNameForm } from '../constants'
import type { CatalogItem } from '../types'
import type { Processor } from '../types'

function ProcessorsPage() {
  const { canManage, setNotice } = useApp()
  const [form, setForm] = useState(emptyNameForm)
  const [editingId, setEditingId] = useState<string | null>(null)

  const resource = useCrudResource<Processor, string, string>({
    list: getProcessors,
    create: createProcessor,
    update: updateProcessor,
    remove: deleteProcessor,
  })

  const handleSubmit = async () => {
    const name = form.name.trim()
    if (!name) return

    try {
      if (editingId) {
        await resource.update(editingId, name)
        setEditingId(null)
      } else {
        await resource.create(name)
      }
      setForm(emptyNameForm)
      setNotice({ type: 'success', message: 'Processor saved.' })
    } catch (error) {
      setNotice({
        type: 'error',
        message: getErrorMessage(error, 'Failed to save processor.'),
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this record?')) return

    try {
      await resource.remove(id)
      setNotice({ type: 'success', message: 'Processor deleted.' })
    } catch (error) {
      setNotice({
        type: 'error',
        message: getErrorMessage(error, 'Delete failed.'),
      })
    }
  }

  const handleEdit = (item: CatalogItem) => {
    setEditingId(item._id)
    setForm({ name: item.name })
  }

  const handleReset = () => {
    setEditingId(null)
    setForm(emptyNameForm)
  }

  return (
    <PageShell>
      <NameResourceSection
        title="Processors"
        description="Processor records appear in the asset table as linked values."
        items={resource.items}
        form={form}
        setForm={setForm}
        editingId={editingId}
        onSubmit={handleSubmit}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onReset={handleReset}
        submitting={resource.submitting}
        canManage={canManage}
      />
    </PageShell>
  )
}

export default ProcessorsPage
