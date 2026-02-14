import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Star, Quote } from 'lucide-react'

const Testimonials = () => {
  const { t } = useTranslation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const testimonials = [
    { nameKey: 'testimonials.name0', roleKey: 'testimonials.role0', textKey: 'testimonials.text0', rating: 5, initials: 'FE' },
    { nameKey: 'testimonials.name1', roleKey: 'testimonials.role1', textKey: 'testimonials.text1', rating: 5, initials: 'YB' },
    { nameKey: 'testimonials.name2', roleKey: 'testimonials.role2', textKey: 'testimonials.text2', rating: 5, initials: 'SA' },
  ]
  const stats = [
    { value: '10,000+', labelKey: 'testimonials.stat0Label' },
    { value: '50,000+', labelKey: 'testimonials.stat1Label' },
    { value: '98%', labelKey: 'testimonials.stat2Label' },
    { value: '4.9/5', labelKey: 'testimonials.stat3Label' },
  ]

  return (
    <section ref={ref} className="py-24 sm:py-32 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 sm:mb-20"
        >
          <span className="inline-block px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-bold tracking-widest uppercase mb-5">
            {t('testimonials.badge')}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-5">
            {t('testimonials.title')}{' '}
            <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
              {t('testimonials.titleHighlight')}
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('testimonials.subtitle')}
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {testimonials.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-xl transition-all duration-300 relative"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-gray-100" />

              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {[...Array(item.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-700 leading-relaxed mb-6 text-sm">
                "{t(item.textKey)}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-5 border-t border-gray-100">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xs">{item.initials}</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t(item.nameKey)}</p>
                  <p className="text-xs text-gray-500">{t(item.roleKey)}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 text-center border border-gray-200">
              <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{t(stat.labelKey)}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default Testimonials
