import Navigation from '../components/Navigation'
import Hero from '../components/Hero'
import Features from '../components/Features'
import HowItWorks from '../components/HowItWorks'
import Testimonials from '../components/Testimonials'
import Footer from '../components/Footer'

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
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
