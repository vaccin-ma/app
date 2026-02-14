import { useState, useEffect, useCallback } from 'react'
import { getChildren, createChild, type Child, type CreateChildPayload } from '../api/children'

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

  return { children, loading, error, refetch: fetchChildren, addChild }
}
