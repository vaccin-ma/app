import { useTranslation } from 'react-i18next'
import { Heart, Mail, Phone, MapPin } from 'lucide-react'
import { Logo } from './Logo'

const Footer = () => {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()
  const quickLinks = [t('footer.about'), t('footer.howItWorks'), t('footer.features'), t('footer.pricing'), t('footer.faq')]

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <Logo className="h-12 w-auto object-contain [filter:brightness(0)_invert(1)]" />
            </div>
            <p className="text-gray-400 text-lg mb-6 max-w-md leading-relaxed">
              {t('footer.tagline')}
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-800/50 rounded-lg px-4 py-3 inline-flex">
              <Heart size={16} className="text-red-400" />
              <span>{t('footer.voiceBy')}</span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6 text-white">{t('footer.quickLinks')}</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors duration-300 flex items-center gap-2 group">
                    <span className="w-0 group-hover:w-2 h-0.5 bg-teal-400 transition-all duration-300" />
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6 text-white">{t('footer.contact')}</h4>
            <ul className="space-y-4">
              <li>
                <a href="mailto:support@jelba.ma" className="flex items-start gap-3 text-gray-400 hover:text-teal-400 transition-colors duration-300 group">
                  <Mail size={20} className="text-teal-400 mt-0.5 flex-shrink-0" />
                  <span className="group-hover:underline">support@jelba.ma</span>
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
                <span>{t('footer.location')}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>{t('footer.copyright', { year: currentYear })}</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-teal-400 transition-colors duration-300">{t('footer.privacy')}</a>
              <a href="#" className="hover:text-teal-400 transition-colors duration-300">{t('footer.terms')}</a>
              <a href="#" className="hover:text-teal-400 transition-colors duration-300">{t('footer.cookies')}</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
