import type { FC } from 'react'
import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Volume2, Syringe, ChevronRight, Shield, Info } from 'lucide-react'
import clsx from 'clsx'

/* ── vaccine families ────────────────────────────────────────────── */
interface VaccineFamily {
  name: string
  slug: string
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
    slug: 'hepatite_b',
    doses: ['HB1'],
    color: 'from-blue-500 to-blue-600',
    gradient: 'bg-blue-50 border-blue-200',
    icon: '🛡️',
    description_fr: "L'Hépatite B est une infection silencieuse du foie qui peut devenir chronique et causer un cancer à l'âge adulte. Ce vaccin, administré dès la naissance (24h), est la première ligne de défense vitale pour protéger le foie de votre nouveau-né contre une contamination accidentelle.",
    description_en: "Hepatitis B is a silent liver infection that can become chronic and cause cancer in adulthood. This vaccine, given at birth (within 24h), is the vital first line of defense to protect your newborn's liver against accidental contamination.",
    description_ar: "التهاب الكبد 'ب' (بوصفير) هو عدوى صامتة تصيب الكبد وقد تسبب أمراضاً مزمنة أو سرطاناً عند الكبر. هذا اللقاح، الذي يُعطى عند الولادة (خلال 24 ساعة)، هو أول خط دفاع لحماية كبد طفلك من أي عدوى محتملة وضمان مستقبل صحي له.",
  },
  {
    name: 'BCG (Tuberculose)',
    slug: 'bcg',
    doses: ['BCG'],
    color: 'from-amber-500 to-amber-600',
    gradient: 'bg-amber-50 border-amber-200',
    icon: '🫁',
    description_fr: "Le BCG est le bouclier contre la Tuberculose, une bactérie qui attaque les poumons mais peut aussi toucher le cerveau des bébés (méningite). Il est normal qu'une petite boule ou croûte apparaisse sur le bras quelques semaines après : c'est le signe que le vaccin fonctionne.",
    description_en: "BCG is the shield against Tuberculosis, a bacteria that attacks the lungs but can also affect babies' brains (meningitis). It is normal for a small bump or scab to appear on the arm a few weeks later: this is a sign that the vaccine is working.",
    description_ar: "لقاح BCG هو الدرع الواقي ضد مرض السل، الذي يهاجم الرئتين ويمكن أن يصيب دماغ الرضع (التهاب السحايا). من الطبيعي أن تظهر حبة صغيرة أو قشرة في مكان الحقنة بعد بضعة أسابيع: هذه علامة جيدة تدل على أن اللقاح يعمل بفعالية.",
  },
  {
    name: 'Poliomyélite Orale (VPO)',
    slug: 'polio_orale',
    doses: ['VPO-0', 'VPO-1', 'VPO-2', 'VPO-3', 'VPO-4', 'VPO-5'],
    color: 'from-violet-500 to-violet-600',
    gradient: 'bg-violet-50 border-violet-200',
    icon: '💧',
    description_fr: "La Poliomyélite est une maladie virale terrible qui peut paralyser un enfant à vie. Ce vaccin 'VPO' se donne facilement par deux gouttes dans la bouche. Il renforce l'immunité de l'intestin pour empêcher le virus de passer dans le sang.",
    description_en: "Polio is a terrible viral disease that can paralyze a child for life. This 'OPV' vaccine is easily given as two drops in the mouth. It strengthens intestinal immunity to stop the virus from entering the bloodstream.",
    description_ar: "شلل الأطفال مرض فيروسي خطير يمكن أن يسبب إعاقة دائمة للطفل. يُعطى هذا اللقاح (VPO) بسهولة عبر قطرتين في الفم. إنه يعمل على تقوية مناعة الأمعاء لمنع الفيروس من الوصول إلى الدم والتسبب في الشلل.",
  },
  {
    name: 'Pentavalent (DTC-Hib-HB)',
    slug: 'pentavalent',
    doses: ['Penta-1', 'Penta-2', 'Penta-3'],
    color: 'from-rose-500 to-rose-600',
    gradient: 'bg-rose-50 border-rose-200',
    icon: '🔬',
    description_fr: "C'est un 'Super-Vaccin' 5-en-1. Il protège contre la Diphtérie (étouffement), le Tétanos (infection des plaies), la Coqueluche (toux convulsive), l'Hépatite B et l'Haemophilus (méningite). Il peut donner un peu de fièvre le soir, ce qui est une réaction normale du corps qui bâtit ses défenses.",
    description_en: "This is a 5-in-1 'Super-Vaccine'. It protects against Diphtheria (choking), Tetanus (wound infection), Pertussis (whooping cough), Hepatitis B, and Haemophilus (meningitis). It may cause a mild fever in the evening, which is a normal reaction as the body builds defenses.",
    description_ar: "إنه 'لقاح شامل' 5 في 1. يحمي من الدفتيريا (الخناق)، الكزاز (تسمم الجروح)، السعال الديكي (الكحبة)، التهاب الكبد 'ب'، والمستدمية النزلية (التهاب السحايا). قد يسبب قليلاً من السخونة في المساء، وهذا رد فعل طبيعي يدل على أن الجسم يبني مناعته.",
  },
  {
    name: 'Pneumocoque (PCV)',
    slug: 'pneumocoque',
    doses: ['PCV-1', 'PCV-2', 'PCV-3', 'PCV-4'],
    color: 'from-cyan-500 to-cyan-600',
    gradient: 'bg-cyan-50 border-cyan-200',
    icon: '🧬',
    description_fr: "Les pneumocoques sont des bactéries responsables de pneumonies sévères, de méningites et d'otites (infections des oreilles) douloureuses. Ce vaccin est essentiel pour éviter des infections respiratoires graves qui nécessitent souvent une hospitalisation.",
    description_en: "Pneumococci are bacteria responsible for severe pneumonia, meningitis, and painful otitis (ear infections). This vaccine is essential to prevent serious respiratory infections that often require hospitalization.",
    description_ar: "المكورات الرئوية هي بكتيريا تسبب التهابات رئوية حادة، التهاب السحايا، والتهابات الأذن المؤلمة. هذا اللقاح ضروري جداً لتجنيب طفلك عدوى تنفسية خطيرة قد تضطره لدخول المستشفى.",
  },
  {
    name: 'Rotavirus',
    slug: 'rotavirus',
    doses: ['Rota-1', 'Rota-2', 'Rota-3'],
    color: 'from-orange-500 to-orange-600',
    gradient: 'bg-orange-50 border-orange-200',
    icon: '🦠',
    description_fr: "Le Rotavirus est la cause n°1 des diarrhées sévères chez les bébés, menant à une déshydratation rapide. Ce vaccin oral (buvable) protège l'estomac de votre enfant et lui évite les urgences. Il est très doux et sans piqûre.",
    description_en: "Rotavirus is the #1 cause of severe diarrhea in babies, leading to rapid dehydration. This oral (drinkable) vaccine protects your child's stomach and keeps them out of the emergency room. It is very gentle and needle-free.",
    description_ar: "فيروس الروتا هو السبب الأول للإسهال الحاد عند الرضع، مما يؤدي للجفاف السريع. هذا اللقاح الفموي (يُشرب) يحمي معدة طفلك ويجنبه مخاطر الجفاف ودخول المستعجلات. إنه لقاح لطيف جداً وبدون إبرة.",
  },
  {
    name: 'Poliomyélite Injectable (VPI)',
    slug: 'polio_injectable',
    doses: ['VPI-1', 'VPI-2'],
    color: 'from-indigo-500 to-indigo-600',
    gradient: 'bg-indigo-50 border-indigo-200',
    icon: '💉',
    description_fr: "Le VPI (Polio Injectable) vient compléter les gouttes. Il garantit une protection à 100% dans le sang. C'est la sécurité ultime pour s'assurer que votre enfant ne pourra jamais développer la maladie, même s'il voyage dans des zones à risque.",
    description_en: "IPV (Injectable Polio) complements the drops. It guarantees 100% protection in the blood. It is the ultimate security to ensure your child can never develop the disease, even if traveling to high-risk areas.",
    description_ar: "لقاح شلل الأطفال بالحقن (VPI) يكمل مفعول القطرات. إنه يضمن حماية 100% في الدم. يعتبر هذا اللقاح صمام الأمان الأخير للتأكد من أن طفلك لن يصاب أبداً بالمرض، حتى لو سافر إلى مناطق موبوءة.",
  },
  {
    name: 'Rougeole-Rubéole (RR)',
    slug: 'rougeole_rubeole',
    doses: ['RR-1', 'RR-2'],
    color: 'from-pink-500 to-pink-600',
    gradient: 'bg-pink-50 border-pink-200',
    icon: '🌡️',
    description_fr: "La Rougeole (Bouhamroun) est extrêmement contagieuse et peut attaquer les poumons ou le cerveau. La Rubéole est dangereuse pour les futures mamans. Ce vaccin combiné est obligatoire pour stopper les épidémies et protéger la communauté.",
    description_en: "Measles is extremely contagious and can attack the lungs or brain. Rubella is dangerous for future mothers. This combined vaccine is mandatory to stop epidemics and protect the community.",
    description_ar: "الحصبة (بوحمرون) مرض معدٍ جداً ويمكن أن يهاجم الرئتين أو الدماغ. الحصبة الألمانية خطيرة على النساء الحوامل. هذا اللقاح المركب ضروري جداً لوقف الأوبئة وحماية المجتمع من عودة هذه الأمراض الفتاكة.",
  },
  {
    name: 'DTC (Rappel)',
    slug: 'dtc_rappel',
    doses: ['DTC-1', 'DTC-2'],
    color: 'from-emerald-500 to-emerald-600',
    gradient: 'bg-emerald-50 border-emerald-200',
    icon: '🔄',
    description_fr: "L'immunité des premiers vaccins diminue avec le temps. Ce rappel à 18 mois est comme une 'mise à jour' du système immunitaire. Il est crucial pour protéger votre enfant au moment où il commence à marcher, jouer dehors et se mélanger aux autres enfants.",
    description_en: "Immunity from early vaccines fades over time. This booster at 18 months is like a 'system update' for the immune system. It is crucial to protect your child as they start walking, playing outside, and mixing with other kids.",
    description_ar: "مناعة اللقاحات الأولى تنخفض مع مرور الوقت. هذه الجرعة التذكيرية في 18 شهراً هي بمثابة 'تحديث' لجهاز المناعة. إنها حاسمة لحماية طفلك في الوقت الذي يبدأ فيه بالمشي واللعب في الخارج والاختلاط بالأطفال الآخرين.",
  },
  {
    name: 'Papillomavirus (HPV)',
    slug: 'hpv',
    doses: ['HPV'],
    color: 'from-fuchsia-500 to-fuchsia-600',
    gradient: 'bg-fuchsia-50 border-fuchsia-200',
    icon: '🎗️',
    description_fr: "Le Papillomavirus est un virus très commun qui peut causer le cancer du col de l'utérus des années plus tard. Vacciner votre fille dès 11 ans, c'est lui offrir une protection à vie contre ce cancer avant qu'elle ne soit exposée au risque.",
    description_en: "Papillomavirus is a very common virus that can cause cervical cancer years later. Vaccinating your daughter at age 11 offers her lifelong protection against this cancer before she is ever exposed to the risk.",
    description_ar: "فيروس الورم الحليمي هو فيروس شائع جداً قد يسبب سرطان عنق الرحم بعد سنوات. تلقيح ابنتك في سن 11 عاماً هو بمثابة هدية لحمايتها مدى الحياة من هذا السرطان قبل أن تتعرض لأي خطر.",
  },
]

export const VaccineFamilyChart: FC = () => {
  const { t, i18n } = useTranslation()
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)
  const [playingIdx, setPlayingIdx] = useState<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const lang = i18n.language // 'fr' | 'en' | 'ar'

  const getDescription = (f: VaccineFamily) => {
    if (lang === 'ar') return f.description_ar
    if (lang === 'en') return f.description_en
    return f.description_fr
  }

  const handlePlayAudio = useCallback((idx: number) => {
    // Stop current audio if playing
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }

    // Toggle off if same card clicked
    if (playingIdx === idx) {
      setPlayingIdx(null)
      return
    }

    // Play pre-generated ElevenLabs MP3
    const family = FAMILIES[idx]
    const audioUrl = `/audio/${family.slug}_${lang}.mp3`
    const audio = new Audio(audioUrl)

    audio.onended = () => {
      setPlayingIdx(null)
      audioRef.current = null
    }
    audio.onerror = () => {
      setPlayingIdx(null)
      audioRef.current = null
    }

    audioRef.current = audio
    setPlayingIdx(idx)
    audio.play()
  }, [playingIdx, lang])

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
