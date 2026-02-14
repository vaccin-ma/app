import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Shield, CheckCircle } from 'lucide-react'

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white pt-24 pb-32 overflow-hidden">
      {/* Subtle background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative w-full max-w-4xl mx-auto px-6 sm:px-8 lg:px-10 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-50 border border-teal-200 text-teal-700 rounded-full">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">Trusted by 10,000+ Moroccan Families</span>
          </div>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-8 leading-tight tracking-tight"
        >
          Protect Their Future,
          <br />
          <span className="bg-gradient-to-r from-teal-600 via-teal-500 to-blue-500 bg-clip-text text-transparent">
            One Dose at a Time
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg sm:text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          Track your child's journey through the Moroccan National Immunization Program. 
          Get automated voice reminders and never miss a milestone.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-14"
        >
          <Link to="/signup" className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white text-lg font-semibold rounded-xl shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2">
            Get Started Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/signin" className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 text-lg font-semibold rounded-xl border-2 border-gray-200 hover:border-teal-400 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-300 text-center">
            Sign In
          </Link>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap justify-center items-center gap-x-8 gap-y-3 text-sm text-gray-500"
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-teal-600" />
            <span>100% Free</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-teal-600" />
            <span>GDPR Compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-teal-600" />
            <span>PNI Certified</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Hero
