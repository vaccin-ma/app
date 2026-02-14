import type { FC } from 'react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Volume2, ChevronRight, Shield, Info } from 'lucide-react'
import clsx from 'clsx'

/* ── vaccine families ────────────────────────────────────────────── */
interface VaccineFamily {
  name: string
  doses: string[]
  color: string
  gradient: string
  icon: string    // emoji
  description_fr: string
  description_en: string
  description_ar: string
}

const FAMILIES: VaccineFamily[] = [
  {
    name: 'Hépatite B (HB)',
    doses: ['HB1'],
    color: 'from-blue-500 to-blue-600',
    gradient: 'bg-blue-50 border-blue-200',
    icon: '🛡️',
    description_fr: "L'Hépatite B est une infection virale du foie. Le vaccin HB protège votre enfant dès la naissance contre cette maladie potentiellement grave.",
    description_en: "Hepatitis B is a viral liver infection. The HB vaccine protects your child from birth against this potentially serious disease.",
    description_ar: "التهاب الكبد ب عدوى فيروسية تصيب الكبد. يحمي لقاح HB طفلك منذ الولادة من هذا المرض الخطير.",
  },
  {
    name: 'BCG (Tuberculose)',
    doses: ['BCG'],
    color: 'from-amber-500 to-amber-600',
    gradient: 'bg-amber-50 border-amber-200',
    icon: '🫁',
    description_fr: "Le BCG protège contre la tuberculose, une infection bactérienne qui touche principalement les poumons. Il est administré dans les premières semaines de vie.",
    description_en: "BCG protects against tuberculosis, a bacterial infection that mainly affects the lungs. It is given in the first weeks of life.",
    description_ar: "يحمي لقاح BCG من السل، وهو عدوى بكتيرية تصيب الرئتين بشكل رئيسي. يُعطى في الأسابيع الأولى من الحياة.",
  },
  {
    name: 'Poliomyélite Orale (VPO)',
    doses: ['VPO-0', 'VPO-1', 'VPO-2', 'VPO-3', 'VPO-4', 'VPO-5'],
    color: 'from-violet-500 to-violet-600',
    gradient: 'bg-violet-50 border-violet-200',
    icon: '💧',
    description_fr: "Le vaccin oral contre la poliomyélite protège contre le virus de la polio qui peut causer une paralysie irréversible. Plusieurs doses sont nécessaires.",
    description_en: "The oral polio vaccine protects against the polio virus that can cause irreversible paralysis. Several doses are required.",
    description_ar: "يحمي لقاح شلل الأطفال الفموي من فيروس شلل الأطفال الذي قد يسبب شللاً دائماً. يتطلب عدة جرعات.",
  },
  {
    name: 'Pentavalent (DTC-Hib-HB)',
    doses: ['Penta-1', 'Penta-2', 'Penta-3'],
    color: 'from-rose-500 to-rose-600',
    gradient: 'bg-rose-50 border-rose-200',
    icon: '🔬',
    description_fr: "Le vaccin pentavalent protège contre cinq maladies: la diphtérie, le tétanos, la coqueluche, l'Haemophilus influenzae type b et l'hépatite B.",
    description_en: "The pentavalent vaccine protects against five diseases: diphtheria, tetanus, whooping cough, Haemophilus influenzae type b, and hepatitis B.",
    description_ar: "يحمي اللقاح الخماسي من خمسة أمراض: الدفتيريا، الكزاز، السعال الديكي، المستدمية النزلية ب، والتهاب الكبد ب.",
  },
  {
    name: 'Pneumocoque (PCV)',
    doses: ['PCV-1', 'PCV-2', 'PCV-3', 'PCV-4'],
    color: 'from-cyan-500 to-cyan-600',
    gradient: 'bg-cyan-50 border-cyan-200',
    icon: '🧬',
    description_fr: "Le vaccin pneumococcique protège contre les infections à pneumocoque qui peuvent causer des pneumonies, des méningites et des otites.",
    description_en: "The pneumococcal vaccine protects against pneumococcal infections that can cause pneumonia, meningitis, and ear infections.",
    description_ar: "يحمي لقاح المكورات الرئوية من العدوى التي يمكن أن تسبب التهاب الرئة والتهاب السحايا والتهاب الأذن.",
  },
  {
    name: 'Rotavirus',
    doses: ['Rota-1', 'Rota-2', 'Rota-3'],
    color: 'from-orange-500 to-orange-600',
    gradient: 'bg-orange-50 border-orange-200',
    icon: '🦠',
    description_fr: "Le vaccin contre le rotavirus protège contre la cause la plus fréquente de gastro-entérite sévère chez les nourrissons et les jeunes enfants.",
    description_en: "The rotavirus vaccine protects against the most common cause of severe gastroenteritis in infants and young children.",
    description_ar: "يحمي لقاح الفيروس العجلي من أكثر أسباب التهاب المعدة والأمعاء الحاد شيوعاً عند الرضع والأطفال.",
  },
  {
    name: 'Poliomyélite Injectable (VPI)',
    doses: ['VPI-1', 'VPI-2'],
    color: 'from-indigo-500 to-indigo-600',
    gradient: 'bg-indigo-50 border-indigo-200',
    icon: '💉',
    description_fr: "Le vaccin injectable contre la poliomyélite renforce la protection contre le virus de la polio. Il complète la protection du vaccin oral.",
    description_en: "The injectable polio vaccine strengthens protection against the polio virus. It complements the oral vaccine protection.",
    description_ar: "يُعزز لقاح شلل الأطفال القابل للحقن الحماية من فيروس شلل الأطفال. يكمّل حماية اللقاح الفموي.",
  },
  {
    name: 'Rougeole-Rubéole (RR)',
    doses: ['RR-1', 'RR-2'],
    color: 'from-pink-500 to-pink-600',
    gradient: 'bg-pink-50 border-pink-200',
    icon: '🌡️',
    description_fr: "Le vaccin RR protège contre la rougeole et la rubéole, deux maladies virales très contagieuses qui peuvent avoir des complications graves.",
    description_en: "The RR vaccine protects against measles and rubella, two highly contagious viral diseases that can have serious complications.",
    description_ar: "يحمي لقاح الحصبة والحصبة الألمانية من مرضين فيروسيين شديدي العدوى يمكن أن يكون لهما مضاعفات خطيرة.",
  },
  {
    name: 'DTC (Rappel)',
    doses: ['DTC-1', 'DTC-2'],
    color: 'from-emerald-500 to-emerald-600',
    gradient: 'bg-emerald-50 border-emerald-200',
    icon: '🔄',
    description_fr: "Le rappel DTC renforce l'immunité contre la diphtérie, le tétanos et la coqueluche acquise lors de la primovaccination.",
    description_en: "The DTC booster strengthens immunity against diphtheria, tetanus, and whooping cough acquired during primary vaccination.",
    description_ar: "تُعزز الجرعة التنشيطية DTC المناعة ضد الدفتيريا والكزاز والسعال الديكي المكتسبة أثناء التطعيم الأولي.",
  },
  {
    name: 'Papillomavirus (HPV)',
    doses: ['HPV'],
    color: 'from-fuchsia-500 to-fuchsia-600',
    gradient: 'bg-fuchsia-50 border-fuchsia-200',
    icon: '🎗️',
    description_fr: "Le vaccin HPV protège contre les papillomavirus humains responsables de certains cancers. Il est recommandé à partir de 11 ans.",
    description_en: "The HPV vaccine protects against human papillomaviruses responsible for certain cancers. It is recommended from age 11.",
    description_ar: "يحمي لقاح HPV من فيروسات الورم الحليمي البشري المسؤولة عن بعض أنواع السرطان. يوصى به ابتداءً من سن 11 عاماً.",
  },
]

export const VaccineFamilyChart: FC = () => {
  const { t, i18n } = useTranslation()
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)
  const [playingIdx, setPlayingIdx] = useState<number | null>(null)

  const lang = i18n.language // 'fr' | 'en' | 'ar'

  const getDescription = (f: VaccineFamily) => {
    if (lang === 'ar') return f.description_ar
    if (lang === 'en') return f.description_en
    return f.description_fr
  }

  const getSpeechLang = () => {
    if (lang === 'ar') return 'ar-MA'
    if (lang === 'en') return 'en-US'
    return 'fr-FR'
  }

  const handlePlayAudio = (idx: number) => {
    if (playingIdx === idx) {
      speechSynthesis.cancel()
      setPlayingIdx(null)
      return
    }
    speechSynthesis.cancel()
    const desc = getDescription(FAMILIES[idx])
    const utterance = new SpeechSynthesisUtterance(desc)
    utterance.lang = getSpeechLang()
    utterance.rate = 0.9
    utterance.onend = () => setPlayingIdx(null)
    utterance.onerror = () => setPlayingIdx(null)
    setPlayingIdx(idx)
    speechSynthesis.speak(utterance)
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mt-10"
    >
      {/* ── Section header ───────────────────────────── */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{t('families.title')}</h2>
          <p className="text-sm text-gray-500">{t('families.subtitle')}</p>
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-5 ms-14">{t('families.tapToLearn')}</p>

      {/* ── Family cards grid ────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2">
        {FAMILIES.map((family, idx) => {
          const isExpanded = expandedIdx === idx
          const isPlaying = playingIdx === idx

          return (
            <motion.div
              key={family.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.04, duration: 0.35 }}
              className={clsx(
                'rounded-2xl border overflow-hidden transition-all duration-300 cursor-pointer',
                family.gradient,
                isExpanded ? 'shadow-lg ring-1 ring-black/5' : 'shadow-sm hover:shadow-md',
              )}
              onClick={() => setExpandedIdx(isExpanded ? null : idx)}
            >
              {/* Card header */}
              <div className="flex items-center gap-3 p-4">
                {/* Gradient icon circle */}
                <div className={clsx(
                  'w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-lg shadow-sm shrink-0',
                  family.color,
                )}>
                  <span>{family.icon}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-gray-900 truncate">{family.name}</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {family.doses.map(dose => (
                      <span
                        key={dose}
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white/70 text-gray-600"
                      >
                        {dose}
                      </span>
                    ))}
                  </div>
                </div>

                <ChevronRight
                  className={clsx(
                    'w-4 h-4 text-gray-400 transition-transform duration-300 shrink-0',
                    isExpanded && 'rotate-90',
                  )}
                />
              </div>

              {/* Expandable description + audio */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-3">
                      {/* Description text */}
                      <div className="flex gap-2 items-start">
                        <Info className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {getDescription(family)}
                        </p>
                      </div>

                      {/* Audio button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePlayAudio(idx)
                        }}
                        className={clsx(
                          'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300',
                          isPlaying
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30'
                            : 'bg-white/80 text-gray-700 hover:bg-white hover:shadow-md border border-gray-200/60',
                        )}
                      >
                        <Volume2 className={clsx('w-4 h-4', isPlaying && 'animate-pulse')} />
                        <span>{isPlaying ? t('families.playing') : t('families.listenInfo')}</span>
                        {isPlaying && (
                          <span className="flex items-end gap-0.5 h-4 ms-1">
                            {[1, 2, 3, 4].map(i => (
                              <motion.span
                                key={i}
                                className="w-0.5 bg-white rounded-full"
                                animate={{ height: ['30%', '100%', '30%'] }}
                                transition={{
                                  duration: 0.6,
                                  repeat: Infinity,
                                  delay: i * 0.12,
                                  ease: 'easeInOut',
                                }}
                              />
                            ))}
                          </span>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </motion.section>
  )
}
