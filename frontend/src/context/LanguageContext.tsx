'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

export type Language = 'en' | 'ur'

type Translations = Record<string, string>

// Provide default translations inline
const enTranslations: Translations = {
 'nav.home': 'Home',
 'nav.services': 'Services',
 'nav.products': 'Products',
 'nav.dashboard': 'Dashboard',
 'nav.messages': 'Messages',
 'nav.login': 'Login',
 'nav.register': 'Register',
 'hero.title': 'Smart Community Service & Local Marketplace',
 'hero.subtitle': 'Connect with local professionals, discover services, and trade products within your community safely and securely.',
 'hero.cta': 'Explore Services',
 'services.title': 'Discover Services',
 'products.title': 'Marketplace',
}

const urTranslations: Translations = {
 'nav.home': 'ہوم',
 'nav.services': 'خدمات',
 'nav.products': 'مصنوعات',
 'nav.dashboard': 'ڈیش بورڈ',
 'nav.messages': 'پیغامات',
 'nav.login': 'لاگ ان',
 'nav.register': 'رجسٹر',
 'hero.title': 'اسمارٹ کمیونٹی سروس اور لوکل مارکیٹ پلیس',
 'hero.subtitle': 'مقامی پیشہ ور افراد سے جڑیں، خدمات دریافت کریں، اور اپنی کمیونٹی میں محفوظ طریقے سے مصنوعات کی تجارت کریں۔',
 'hero.cta': 'خدمات دریافت کریں',
 'services.title': 'خدمات دریافت کریں',
 'products.title': 'مارکیٹ پلیس',
}

interface LanguageContextType {
 language: Language
 setLanguage: (lang: Language) => void
 t: (key: string) => string
 dir: 'ltr' | 'rtl'
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
 const [language, setLanguageState] = useState<Language>('en')
 
 useEffect(() => {
 const saved = localStorage.getItem('language') as Language
 if (saved && (saved === 'en' || saved === 'ur')) {
 setLanguageState(saved)
 document.documentElement.dir = saved === 'ur' ? 'rtl' : 'ltr'
 document.documentElement.lang = saved
 }
 }, [])

 const setLanguage = (lang: Language) => {
 setLanguageState(lang)
 localStorage.setItem('language', lang)
 document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr'
 document.documentElement.lang = lang
 }

 const t = (key: string): string => {
 const translations = language === 'ur' ? urTranslations : enTranslations
 return translations[key] || key
 }

 return (
 <LanguageContext.Provider value={{ language, setLanguage, t, dir: language === 'ur' ? 'rtl' : 'ltr' }}>
 {children}
 </LanguageContext.Provider>
 )
}

export function useLanguage() {
 const context = useContext(LanguageContext)
 if (context === undefined) {
 throw new Error('useLanguage must be used within a LanguageProvider')
 }
 return context
}
