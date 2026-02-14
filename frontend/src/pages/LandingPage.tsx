import { useLanguage } from '../contexts/LanguageContext'
import Navigation from '../components/Navigation'
import Hero from '../components/Hero'
import Features from '../components/Features'
import HowItWorks from '../components/HowItWorks'
import Testimonials from '../components/Testimonials'
import Footer from '../components/Footer'

const LandingPage = () => {
  const { dir } = useLanguage()
  return (
    <div className="min-h-screen bg-white" dir={dir}>
      <Navigation />
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Footer />
    </div>
  )
}

export default LandingPage
