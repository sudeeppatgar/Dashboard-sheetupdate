import { useState } from 'react'
import { useApp } from '../../../shared/context/useApp'
import PageShell from '../../../shared/components/PageShell'
import { useCrudResource } from '../../../shared/hooks/useCrudResource'
import { getErrorMessage } from '../../../shared/utils/getErrorMessage'
import NameResourceSection from './NameResourceSection'
import { createMakeModel, deleteMakeModel, getMakeModels, updateMakeModel } from '../api'
import { emptyNameForm } from '../constants'
import type { CatalogItem } from '../types'
import type { MakeModel } from '../types'

function MakeModelsPage() {
  const { canManage, setNotice } = useApp()
  const [form, setForm] = useState(emptyNameForm)
  const [editingId, setEditingId] = useState<string | null>(null)

  const resource = useCrudResource<MakeModel, string, string>({
    list: getMakeModels,
    create: createMakeModel,
    update: updateMakeModel,
    remove: deleteMakeModel,
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
      setNotice({ type: 'success', message: 'Make model saved.' })
    } catch (error) {
      setNotice({
        type: 'error',
        message: getErrorMessage(error, 'Failed to save make model.'),
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this record?')) return

    try {
      await resource.remove(id)
      setNotice({ type: 'success', message: 'Make model deleted.' })
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
        title="Make models"
        description="Keep make-model names simple and searchable."
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

export default MakeModelsPage
