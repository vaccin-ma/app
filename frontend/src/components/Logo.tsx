import { Link } from 'react-router-dom'

interface LogoProps {
  /** CSS class for the image (e.g. h-8, h-10, h-12) */
  className?: string
  /** Wrap in Link to home (default true) */
  linkToHome?: boolean
}

export function Logo({ className = 'h-16 w-auto object-contain', linkToHome = true }: LogoProps) {
  const img = (
    <>
      <img
        src="/logo.png"
        alt="jelba.ma"
        className={className}
        onError={e => {
          e.currentTarget.style.display = 'none'
          const fallback = e.currentTarget.nextElementSibling as HTMLElement
          if (fallback) fallback.style.display = 'inline'
        }}
      />
      <span className="hidden font-bold text-teal-600 text-xl">jelba.ma</span>
    </>
  )
  if (linkToHome) {
    return <Link to="/" className="flex items-center flex-shrink-0">{img}</Link>
  }
  return <span className="flex items-center flex-shrink-0">{img}</span>
}
