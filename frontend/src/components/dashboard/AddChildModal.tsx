import { useState, type FC, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import type { CreateChildPayload } from '../../api/children'

interface AddChildModalProps {
  onClose: () => void
  onSubmit: (payload: CreateChildPayload) => Promise<unknown>
}

export const AddChildModal: FC<AddChildModalProps> = ({ onClose, onSubmit }) => {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [birthdate, setBirthdate] = useState('')
  const [gender, setGender] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await onSubmit({ name, birthdate, gender: gender || null })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('addChildModal.errorDefault'))
    } finally {
      setLoading(false)
    }
  }

  const genderOptions = [t('addChildModal.male'), t('addChildModal.female')]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">{t('addChildModal.title')}</h2>
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
              required
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
              disabled={loading || !name || !birthdate}
              className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 disabled:opacity-50"
            >
              {loading ? t('addChildModal.adding') : t('addChildModal.add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
