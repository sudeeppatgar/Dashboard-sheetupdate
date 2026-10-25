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
import { domainConfig } from '../../../shared/config/domain'

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
       setNotice({ type: 'success', message: `${domainConfig.modelSingular} saved.` })
    } catch (error) {
      setNotice({
        type: 'error',
         message: getErrorMessage(error, `Failed to save ${domainConfig.modelSingular.toLowerCase()}.`),
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this record?')) return

    try {
      await resource.remove(id)
       setNotice({ type: 'success', message: `${domainConfig.modelSingular} deleted.` })
    } catch (error) {
      setNotice({
        type: 'error',
         message: getErrorMessage(error, `Failed to delete ${domainConfig.modelSingular.toLowerCase()}.`),
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
           title={domainConfig.modelPlural}
           description={`Keep ${domainConfig.modelPlural.toLowerCase()} simple and searchable.`}
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
