import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Bell, ExternalLink, Play, Pause, Trash2 } from 'lucide-react'
import { API_BASE } from '../../api/auth'
import { getNotifications, deleteNotification, type NotificationItem } from '../../api/notifications'
import { getSchedulePeriodLabel } from '../../utils/schedulePeriodLabel'

interface NotificationBellProps {
  onViewTimeline?: (childId: number) => void
}

export function NotificationBell({ onViewTimeline }: NotificationBellProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [playingId, setPlayingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const fetchNotifications = async (showLoading = false) => {
    if (showLoading) setLoading(true)
    setError(null)
    try {
      const list = await getNotifications()
      setItems(list)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
      setItems([])
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  // Load notifications on mount and poll so the badge count shows and updates automatically
  const POLL_INTERVAL_MS = 20_000 // 20 seconds
  useEffect(() => {
    fetchNotifications(false)
    const interval = setInterval(() => fetchNotifications(false), POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  // Refetch when tab becomes visible (e.g. user returns to the app)
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') fetchNotifications(false)
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  // Refetch when app asks (e.g. after adding a child so we pick up new voice reminders)
  useEffect(() => {
    const onRefresh = () => fetchNotifications(false)
    window.addEventListener('notifications-refresh', onRefresh)
    return () => window.removeEventListener('notifications-refresh', onRefresh)
  }, [])

  // Refetch when opening the dropdown so the list is fresh
  useEffect(() => {
    if (open) fetchNotifications(true)
  }, [open])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const count = items.length

  const handlePlay = (item: NotificationItem) => {
    const audio = audioRef.current
    if (!audio) return
    const url = `${API_BASE}${item.audio_url}`
    if (playingId === item.id) {
      audio.pause()
      setPlayingId(null)
      return
    }
    audio.src = url
    audio.play().then(() => setPlayingId(item.id)).catch(() => setPlayingId(null))
  }

  const handleDelete = async (item: NotificationItem) => {
    setDeletingId(item.id)
    try {
      await deleteNotification(item.id)
      if (playingId === item.id) {
        audioRef.current?.pause()
        setPlayingId(null)
      }
      setItems((prev) => prev.filter((i) => i.id !== item.id))
    } catch {
      setDeletingId(null)
    } finally {
      setDeletingId(null)
    }
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onEnded = () => setPlayingId(null)
    audio.addEventListener('ended', onEnded)
    return () => audio.removeEventListener('ended', onEnded)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-colors"
        aria-label={t('notifications.title')}
      >
        <Bell className="w-5 h-5" />
        {count > 0 && (
          <span className="absolute -top-0.5 -end-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-teal-500 text-white text-xs font-medium px-1">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      <audio ref={audioRef} className="hidden" />
      {open && (
        <div className="absolute end-0 top-full mt-2 w-[min(90vw,360px)] rounded-xl border border-gray-200 bg-white shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/80">
            <h3 className="font-semibold text-gray-900">{t('notifications.title')}</h3>
            <span className="text-sm text-gray-500">{t('notifications.voiceReminders')}</span>
          </div>
          <div className="max-h-[70vh] overflow-y-auto">
            {loading && (
              <div className="p-6 text-center text-gray-500 text-sm">{t('notifications.loading')}</div>
            )}
            {error && (
              <div className="p-4 text-center text-red-600 text-sm">{error}</div>
            )}
            {!loading && !error && items.length === 0 && (
              <div className="p-6 text-center text-gray-500 text-sm">{t('notifications.empty')}</div>
            )}
            {!loading && !error && items.length > 0 && (
              <ul className="divide-y divide-gray-100">
                {items.map((item) => (
                  <li key={item.id} className="p-3 hover:bg-teal-50/50 transition-colors">
                    <div className="flex items-start gap-2">
                      <button
                        type="button"
                        onClick={() => handlePlay(item)}
                        className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-500 hover:bg-teal-600 text-white flex items-center justify-center shadow-md transition-colors"
                        aria-label={playingId === item.id ? t('notifications.pause') : t('notifications.play')}
                      >
                        {playingId === item.id ? (
                          <Pause className="w-5 h-5" fill="currentColor" />
                        ) : (
                          <Play className="w-5 h-5 ms-0.5" fill="currentColor" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {item.child_name} · {item.vaccine_name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{getSchedulePeriodLabel(item.period_label, t)}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {onViewTimeline && (
                            <button
                              type="button"
                              onClick={() => {
                                onViewTimeline(item.child_id)
                                setOpen(false)
                              }}
                              className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-teal-600"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              {t('notifications.viewInTimeline')}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            disabled={deletingId === item.id}
                            className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                            aria-label={t('notifications.delete')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            {t('notifications.delete')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
