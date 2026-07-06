'use client'

import { useState, useEffect } from 'react'
import api from '@/services/api/api'

export function usePushNotifications() {
 const [isSupported, setIsSupported] = useState(false)
 const [subscription, setSubscription] = useState<PushSubscription | null>(null)
 const [error, setError] = useState<Error | null>(null)

 useEffect(() => {
 if ('serviceWorker' in navigator && 'PushManager' in window) {
 setIsSupported(true)
 registerServiceWorker()
 }
 }, [])

 const registerServiceWorker = async () => {
 try {
 const registration = await navigator.serviceWorker.register('/sw.js')
 const sub = await registration.pushManager.getSubscription()
 setSubscription(sub)
 } catch (err) {
 console.error('SW registration failed:', err)
 setError(err as Error)
 }
 }

 const subscribe = async () => {
 if (!isSupported) return
 try {
 const registration = await navigator.serviceWorker.ready
 // Note: In a real app, you need a VAPID public key from backend
 // const vapidPublicKey = 'YOUR_VAPID_PUBLIC_KEY'
 // const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey)
 
 // For demo purposes, we will just simulate subscription if no keys
 const sub = await registration.pushManager.subscribe({
 userVisibleOnly: true,
 // applicationServerKey: convertedVapidKey
 }).catch(() => null) // Catch error if VAPID not provided

 if (sub) {
 setSubscription(sub)
 await api.post('/notifications/subscribe', sub)
 } else {
 // Mock subscription for demo
 await api.post('/notifications/subscribe', { endpoint: 'mock-endpoint' })
 }
 } catch (err) {
 setError(err as Error)
 }
 }

 return { isSupported, subscription, subscribe, error }
}
