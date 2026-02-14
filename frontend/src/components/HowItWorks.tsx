import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { UserPlus, Bell, CheckCircle, Shield } from 'lucide-react'

const HowItWorks = () => {
  const { t } = useTranslation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const steps = [
    { number: '01', icon: UserPlus, titleKey: 'howItWorks.step0Title', descKey: 'howItWorks.step0Desc' },
    { number: '02', icon: Bell, titleKey: 'howItWorks.step1Title', descKey: 'howItWorks.step1Desc' },
    { number: '03', icon: CheckCircle, titleKey: 'howItWorks.step2Title', descKey: 'howItWorks.step2Desc' },
    { number: '04', icon: Shield, titleKey: 'howItWorks.step3Title', descKey: 'howItWorks.step3Desc' },
  ]

  return (
    <section ref={ref} id="how-it-works" className="py-24 sm:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 sm:mb-20"
        >
          <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold tracking-widest uppercase mb-5">
            {t('howItWorks.badge')}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-5">
            {t('howItWorks.title')}{' '}
            <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
              {t('howItWorks.titleHighlight')}
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('howItWorks.subtitle')}
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                {/* Number Circle */}
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-teal-500/20">
                  <span className="text-white font-bold text-xl">{step.number}</span>
                </div>

                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <Icon className="w-8 h-8 text-gray-400" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {t(step.titleKey)}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {t(step.descKey)}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
