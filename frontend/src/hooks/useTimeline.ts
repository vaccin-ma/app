import { useState, useEffect, useCallback } from 'react'
import { getTimeline, completeVaccination, type TimelineItem } from '../api/children'

export function useTimeline(childId: number | null) {
  const [items, setItems] = useState<TimelineItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTimeline = useCallback(async () => {
    if (childId == null) {
      setItems([])
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await getTimeline(childId)
      setItems(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل تحميل الجدول')
    } finally {
      setLoading(false)
    }
  }, [childId])

  useEffect(() => {
    fetchTimeline()
  }, [fetchTimeline])

  const markComplete = useCallback(async (vaccinationId: number) => {
    await completeVaccination(vaccinationId)
    setItems((prev) =>
      prev.map((v) =>
        v.id === vaccinationId
          ? { ...v, completed: true, completed_at: new Date().toISOString(), status: 'completed' as const }
          : v
      )
    )
  }, [])

  return { items, loading, error, refetch: fetchTimeline, markComplete }
}
