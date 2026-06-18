import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  // Initialize state based on historical explicit selection
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem('shopease_theme')
    if (stored) return stored === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // 1. Core Effects Layer: Handle Theme Switching updates on DOM
  useEffect(() => {
    const root = document.documentElement
    
    if (dark) {
      root.classList.add('dark')
      // Instructs the browser engine to render built-in UI components with dark variants
      root.style.colorScheme = 'dark' 
      localStorage.setItem('shopease_theme', 'dark')
    } else {
      root.classList.remove('dark')
      root.style.colorScheme = 'light'
      localStorage.setItem('shopease_theme', 'light')
    }
  }, [dark])

  // 2. Real-time OS Sync Layer: Listen to operating system setting shifts dynamically
  useEffect(() => {
    // Only bind global system listener if the user has NOT explicitly chosen a preference yet
    if (localStorage.getItem('shopease_theme')) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleSystemThemeChange = (e) => {
      setDark(e.matches)
    }

    // Modern cross-browser event listener subscription syntax
    mediaQuery.addEventListener('change', handleSystemThemeChange)
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange)
  }, [])

  const toggle = () => setDark(prev => !prev)

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be consumed inside a valid wrapped <ThemeProvider> layer tree.')
  }
  return context
}