import { useCallback, useEffect, useState } from 'react'

export type UseCrudResourceReturn<T, TCreate, TUpdate> = {
  items: T[]
  loading: boolean
  submitting: boolean
  error: string | null
  refresh: () => Promise<void>
  create: (payload: TCreate) => Promise<T | undefined>
  update: (id: string, payload: TUpdate) => Promise<T | undefined>
  remove: (id: string) => Promise<void>
}

type UseCrudResourceOptions<T, TCreate, TUpdate> = {
  list: () => Promise<T[]>
  create: (payload: TCreate) => Promise<T>
  update: (id: string, payload: TUpdate) => Promise<T>
  remove: (id: string) => Promise<void>
}

export function useCrudResource<T, TCreate = Partial<T>, TUpdate = Partial<T>>({
  list,
  create,
  update,
  remove,
}: UseCrudResourceOptions<T, TCreate, TUpdate>): UseCrudResourceReturn<T, TCreate, TUpdate> {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await list()
      setItems(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data.')
    } finally {
      setLoading(false)
    }
  }, [list])

  useEffect(() => {
    const init = async () => {
      await refresh()
    }

    void init()
  }, [refresh])

  const createResource = useCallback(
    async (payload: TCreate) => {
      setSubmitting(true)
      setError(null)

      try {
        const created = await create(payload)
        await refresh()
        return created
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create.')
        return undefined
      } finally {
        setSubmitting(false)
      }
    },
    [create, refresh]
  )

  const updateResource = useCallback(
    async (id: string, payload: TUpdate) => {
      setSubmitting(true)
      setError(null)

      try {
        const updated = await update(id, payload)
        await refresh()
        return updated
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update.')
        return undefined
      } finally {
        setSubmitting(false)
      }
    },
    [update, refresh]
  )

  const removeResource = useCallback(
    async (id: string) => {
      setSubmitting(true)
      setError(null)

      try {
        await remove(id)
        await refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete.')
      } finally {
        setSubmitting(false)
      }
    },
    [remove, refresh]
  )

  return {
    items,
    loading,
    submitting,
    error,
    refresh,
    create: createResource,
    update: updateResource,
    remove: removeResource,
  }
}
