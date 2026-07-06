'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextType {
 theme: Theme
 toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
 const [theme, setTheme] = useState<Theme>('dark')

 useEffect(() => {
 // Force dark theme as the UI components are heavily optimized for dark mode
 setTheme('dark')
 document.documentElement.classList.remove('light-theme')
 localStorage.setItem('theme', 'dark')
 }, [])

 const toggleTheme = () => {
 // Disabled light theme toggle to preserve UI contrast
 }

 return (
 <ThemeContext.Provider value={{ theme, toggleTheme }}>
 {children}
 </ThemeContext.Provider>
 )
}

export function useTheme() {
 const context = useContext(ThemeContext)
 if (context === undefined) {
 throw new Error('useTheme must be used within a ThemeProvider')
 }
 return context
}
