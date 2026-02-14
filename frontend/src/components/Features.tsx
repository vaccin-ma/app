import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Calendar, Phone, Users, ArrowRight } from 'lucide-react'

const Features = () => {
  const { t } = useTranslation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const features = [
    { icon: Calendar, titleKey: 'features.item0Title', descKey: 'features.item0Desc', gradient: 'from-teal-500 to-emerald-500', bg: 'bg-teal-50', iconColor: 'text-teal-600' },
    { icon: Phone, titleKey: 'features.item1Title', descKey: 'features.item1Desc', gradient: 'from-blue-500 to-indigo-500', bg: 'bg-blue-50', iconColor: 'text-blue-600' },
    { icon: Users, titleKey: 'features.item2Title', descKey: 'features.item2Desc', gradient: 'from-purple-500 to-pink-500', bg: 'bg-purple-50', iconColor: 'text-purple-600' },
  ]

  return (
    <section ref={ref} id="features" className="py-24 sm:py-32 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 sm:mb-20"
        >
          <span className="inline-block px-4 py-1.5 bg-teal-100 text-teal-700 rounded-full text-xs font-bold tracking-widest uppercase mb-5">
            {t('features.badge')}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-5">
            {t('features.title')}{' '}
            <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
              {t('features.titleHighlight')}
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('features.subtitle')}
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="group bg-white rounded-2xl p-8 border border-gray-200 hover:border-teal-300 hover:shadow-xl transition-all duration-300"
              >
                {/* Icon */}
                <div className={`${feature.bg} w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-7 h-7 ${feature.iconColor}`} />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {t(feature.titleKey)}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-5 text-sm">
                  {t(feature.descKey)}
                </p>

                {/* Learn More */}
                <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${feature.iconColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                  {t('features.learnMore')}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Features
