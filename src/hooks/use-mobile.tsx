
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // Initial check
    checkMobile()

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // Modern browsers
    if (mql.addEventListener) {
      mql.addEventListener("change", checkMobile)
      return () => mql.removeEventListener("change", checkMobile)
    }
    
    // Fallback for older browsers
    if (mql.addListener) {
      mql.addListener(checkMobile)
      return () => mql.removeListener(checkMobile)
    }

    // Fallback with window resize
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return !!isMobile
}
