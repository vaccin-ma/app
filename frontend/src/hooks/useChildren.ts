import { useState, useEffect, useCallback } from 'react'
import { getChildren, createChild, updateChild, deleteChild as deleteChildApi, type Child, type CreateChildPayload, type UpdateChildPayload } from '../api/children'

export function useChildren(options?: { enabled?: boolean }) {
  const enabled = options?.enabled !== false
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchChildren = useCallback(async () => {
    if (!enabled) return
    setLoading(true)
    setError(null)
    try {
      const data = await getChildren()
      setChildren(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل تحميل الأطفال')
    } finally {
      setLoading(false)
    }
  }, [enabled])

  useEffect(() => {
    if (enabled) fetchChildren()
    else setLoading(false)
  }, [enabled, fetchChildren])

  const addChild = useCallback(
    async (payload: CreateChildPayload) => {
      const child = await createChild(payload)
      setChildren((prev) => [...prev, child])
      return child
    },
    []
  )

  const updateChildById = useCallback(
    async (childId: number, payload: UpdateChildPayload) => {
      const updated = await updateChild(childId, payload)
      setChildren((prev) =>
        prev.map((c) => (c.id === childId ? updated : c))
      )
      return updated
    },
    []
  )

  const removeChild = useCallback(async (childId: number) => {
    await deleteChildApi(childId)
    setChildren((prev) => prev.filter((c) => c.id !== childId))
  }, [])

  return { children, loading, error, refetch: fetchChildren, addChild, updateChild: updateChildById, deleteChild: removeChild }
}
