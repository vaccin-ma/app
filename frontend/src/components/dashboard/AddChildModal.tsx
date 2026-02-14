import { useState, useEffect, type FC, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Trash2 } from 'lucide-react'
import type { Child, CreateChildPayload } from '../../api/children'

interface AddChildModalProps {
  onClose: () => void
  onSubmit: (payload: CreateChildPayload) => Promise<unknown>
  /** When set, modal is in edit mode: prefilled with child data and submit updates instead of create. */
  initialChild?: Child | null
  /** Called when user confirms delete in edit mode. */
  onDelete?: (child: Child) => Promise<unknown>
}

export const AddChildModal: FC<AddChildModalProps> = ({ onClose, onSubmit, initialChild, onDelete }) => {
  const { t } = useTranslation()
  const isEdit = !!initialChild
  const [name, setName] = useState('')
  const [birthdate, setBirthdate] = useState('')
  const [gender, setGender] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (initialChild) {
      setName(initialChild.name)
      setBirthdate(initialChild.birthdate ? initialChild.birthdate.slice(0, 10) : '')
      setGender(initialChild.gender ?? '')
    } else {
      setName('')
      setBirthdate('')
      setGender('')
    }
  }, [initialChild])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await onSubmit({ name, birthdate, gender: gender || null })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : t(isEdit ? 'addChildModal.errorUpdate' : 'addChildModal.errorDefault'))
    } finally {
      setLoading(false)
    }
  }

  const genderOptions = [t('addChildModal.male'), t('addChildModal.female')]

  const handleDelete = async () => {
    if (!initialChild || !onDelete) return
    if (!window.confirm(t('addChildModal.deleteConfirm'))) return
    setError('')
    setDeleting(true)
    try {
      await onDelete(initialChild)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('addChildModal.errorDelete'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {isEdit ? t('addChildModal.updateTitle') : t('addChildModal.title')}
          </h2>
          <button type="button" onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('addChildModal.name')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder={t('addChildModal.namePlaceholder')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('addChildModal.dateOfBirth')}</label>
            <input
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              required={!isEdit}
              max={new Date().toISOString().split('T')[0]}
              readOnly={isEdit}
              className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent ${isEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              title={isEdit ? t('addChildModal.birthdateLocked') : undefined}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('addChildModal.gender')}</label>
            <div className="flex gap-2">
              {genderOptions.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`flex-1 py-2 rounded-xl border-2 text-sm font-medium ${
                    gender === g
                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50"
            >
              {t('addChildModal.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading || !name || (!isEdit && !birthdate)}
              className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 disabled:opacity-50"
            >
              {loading
                ? (isEdit ? t('addChildModal.saving') : t('addChildModal.adding'))
                : (isEdit ? t('addChildModal.save') : t('addChildModal.add'))}
            </button>
          </div>
          {isEdit && onDelete && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading || deleting}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-red-600 hover:bg-red-50 rounded-xl font-medium disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? t('addChildModal.deleting') : t('addChildModal.deleteChild')}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
