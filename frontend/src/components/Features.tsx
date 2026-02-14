import React from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Calendar, Phone, Users, ArrowRight } from 'lucide-react'

const features = [
  {
    icon: Calendar,
    title: 'Smart Tracking',
    description: 'Automated schedule based on the PNI (National Program). Never manually calculate vaccine dates again.',
    gradient: 'from-teal-500 to-emerald-500',
    bg: 'bg-teal-50',
    iconColor: 'text-teal-600'
  },
  {
    icon: Phone,
    title: 'Voice Reminders',
    description: 'Powered by ElevenLabs to call you when a dose is due. Get personalized reminders that fit your schedule.',
    gradient: 'from-blue-500 to-indigo-500',
    bg: 'bg-blue-50',
    iconColor: 'text-blue-600'
  },
  {
    icon: Users,
    title: 'Multi-Child Management',
    description: 'One account for the whole family. Track all your children\'s vaccination records in one secure place.',
    gradient: 'from-purple-500 to-pink-500',
    bg: 'bg-purple-50',
    iconColor: 'text-purple-600'
  }
]

const Features: React.FC = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

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
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-5">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
              Stay on Track
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive tools designed for busy parents who care about their children's health
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
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-5 text-sm">
                  {feature.description}
                </p>

                {/* Learn More */}
                <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${feature.iconColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                  Learn more
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
