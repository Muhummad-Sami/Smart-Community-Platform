// frontend/src/hooks/useSocket.ts

'use client'

import { useEffect, useState } from 'react'
import io, { Socket } from 'socket.io-client'

export const useSocket = () => {
 const [socket, setSocket] = useState<Socket | null>(null)
 const [isConnected, setIsConnected] = useState(false)

 useEffect(() => {
 const token = localStorage.getItem('token')
 
 if (!token) {
 console.log('No token found, skipping socket connection')
 return
 }

 const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
 auth: {
 token
 },
 transports: ['websocket'],
 reconnection: true,
 reconnectionAttempts: 5,
 reconnectionDelay: 1000,
 })

 socketInstance.on('connect', () => {
 console.log('Socket connected successfully')
 setIsConnected(true)
 })

 socketInstance.on('disconnect', () => {
 console.log('Socket disconnected')
 setIsConnected(false)
 })

 socketInstance.on('connect_error', (error) => {
 console.error('Socket connection error:', error)
 setIsConnected(false)
 })

 setSocket(socketInstance)

 return () => {
 socketInstance.disconnect()
 setIsConnected(false)
 }
 }, [])

 return { socket, isConnected }
}