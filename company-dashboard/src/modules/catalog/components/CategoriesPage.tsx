import { useState } from 'react'
import { useApp } from '../../../shared/context/useApp'
import PageShell from '../../../shared/components/PageShell'
import { useCrudResource } from '../../../shared/hooks/useCrudResource'
import { getErrorMessage } from '../../../shared/utils/getErrorMessage'
import NameResourceSection from './NameResourceSection'
import { createCategory, deleteCategory, getCategories, updateCategory } from '../api'
import { emptyNameForm } from '../constants'
import type { Category } from '../types'
import { domainConfig } from '../../../shared/config/domain'

function CategoriesPage() {
  const { canManage, setNotice } = useApp()
  const [form, setForm] = useState(emptyNameForm)
  const [editingId, setEditingId] = useState<string | null>(null)

  const resource = useCrudResource<Category, string, string>({
    list: getCategories,
    create: createCategory,
    update: updateCategory,
    remove: deleteCategory,
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
       setNotice({ type: 'success', message: `${domainConfig.categorySingular} saved.` })
    } catch (error) {
      setNotice({
        type: 'error',
         message: getErrorMessage(error, `Failed to save ${domainConfig.categorySingular.toLowerCase()}.`),
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this record?')) return

    try {
      await resource.remove(id)
       setNotice({ type: 'success', message: `${domainConfig.categorySingular} deleted.` })
    } catch (error) {
      setNotice({
        type: 'error',
         message: getErrorMessage(error, `Failed to delete ${domainConfig.categorySingular.toLowerCase()}.`),
      })
    }
  }

  const handleEdit = (item: Category) => {
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
           title={domainConfig.categoryPlural}
           description={`${domainConfig.categoryPlural} are shared across ${domainConfig.recordPlural.toLowerCase()}.`}
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

export default CategoriesPage
