
import { Heart, Mail, Phone, MapPin } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-400 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">V</span>
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
                VacciTrack
              </span>
            </div>
            <p className="text-gray-400 text-lg mb-6 max-w-md leading-relaxed">
              Protecting Morocco's children, one vaccination at a time. Your trusted partner in managing your family's immunization journey.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-800/50 rounded-lg px-4 py-3 inline-flex">
              <Heart size={16} className="text-red-400" />
              <span>Powered by ElevenLabs for voice reminders</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-white">Quick Links</h4>
            <ul className="space-y-3">
              {['About Us', 'How It Works', 'Features', 'Pricing', 'FAQ'].map((link) => (
                <li key={link}>
                  <a 
                    href="#" 
                    className="text-gray-400 hover:text-teal-400 transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-teal-400 transition-all duration-300" />
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-white">Contact Us</h4>
            <ul className="space-y-4">
              <li>
                <a href="mailto:support@vaccitrack.ma" className="flex items-start gap-3 text-gray-400 hover:text-teal-400 transition-colors duration-300 group">
                  <Mail size={20} className="text-teal-400 mt-0.5 flex-shrink-0" />
                  <span className="group-hover:underline">support@vaccitrack.ma</span>
                </a>
              </li>
              <li>
                <a href="tel:+2125XXXXXXXX" className="flex items-start gap-3 text-gray-400 hover:text-teal-400 transition-colors duration-300 group">
                  <Phone size={20} className="text-teal-400 mt-0.5 flex-shrink-0" />
                  <span className="group-hover:underline">+212 5XX-XXXXXX</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-gray-400">
                <MapPin size={20} className="text-teal-400 mt-0.5 flex-shrink-0" />
                <span>Casablanca, Morocco</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>© {currentYear} VacciTrack Morocco. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-teal-400 transition-colors duration-300">Privacy Policy</a>
              <a href="#" className="hover:text-teal-400 transition-colors duration-300">Terms of Service</a>
              <a href="#" className="hover:text-teal-400 transition-colors duration-300">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
