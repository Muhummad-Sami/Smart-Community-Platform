'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FaMapMarkerAlt, FaSearch, FaStar, FaSpinner } from 'react-icons/fa'
import Link from 'next/link'
import api from '@/services/api/api'

// Define the interface for Google Maps window object
declare global {
 interface Window {
 google: any
 initMap: () => void
 }
}

export default function MapPage() {
 const [services, setServices] = useState<any[]>([])
 const [loading, setLoading] = useState(true)
 const [mapError, setMapError] = useState(false)
 const [userLocation, setUserLocation] = useState({ lat: 40.7128, lng: -74.0060 }) // Default to NYC

 useEffect(() => {
 // 1. Get user location
 if (navigator.geolocation) {
 navigator.geolocation.getCurrentPosition(
 (position) => {
 setUserLocation({
 lat: position.coords.latitude,
 lng: position.coords.longitude
 })
 },
 () => {
 console.warn('Geolocation denied or failed, using default')
 }
 )
 }

 // 2. Fetch services with coordinates
 fetchServices()

 // 3. Load Google Maps script
 const loadGoogleMaps = () => {
 const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
 
 if (!apiKey || apiKey.includes('placeholder')) {
 setMapError(true)
 setLoading(false)
 return
 }

 window.initMap = initMap
 const script = document.createElement('script')
 script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`
 script.async = true
 script.defer = true
 script.onerror = () => {
 setMapError(true)
 setLoading(false)
 }
 document.head.appendChild(script)
 }

 loadGoogleMaps()

 return () => {
 window.initMap = () => {}
 }
 }, [])

 const fetchServices = async () => {
 try {
 const res = await api.get('/services')
 // For demo, if services don't have lat/lng, we assign them near default location
 const mappedServices = res.data.data.map((s: any) => ({
 ...s,
 lat: s.latitude || userLocation.lat + (Math.random() - 0.5) * 0.1,
 lng: s.longitude || userLocation.lng + (Math.random() - 0.5) * 0.1,
 }))
 setServices(mappedServices)
 } catch (err) {
 console.error(err)
 }
 }

 const initMap = () => {
 setLoading(false)
 if (!window.google) return

 const map = new window.google.maps.Map(document.getElementById('map'), {
 center: userLocation,
 zoom: 12,
 styles: [
 { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
 { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
 { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
 {
 featureType: "administrative.locality",
 elementType: "labels.text.fill",
 stylers: [{ color: "#d59563" }],
 },
 {
 featureType: "poi",
 elementType: "labels.text.fill",
 stylers: [{ color: "#d59563" }],
 },
 {
 featureType: "poi.park",
 elementType: "geometry",
 stylers: [{ color: "#263c3f" }],
 },
 {
 featureType: "poi.park",
 elementType: "labels.text.fill",
 stylers: [{ color: "#6b9a76" }],
 },
 {
 featureType: "road",
 elementType: "geometry",
 stylers: [{ color: "#38414e" }],
 },
 {
 featureType: "road",
 elementType: "geometry.stroke",
 stylers: [{ color: "#212a37" }],
 },
 {
 featureType: "road",
 elementType: "labels.text.fill",
 stylers: [{ color: "#9ca5b3" }],
 },
 {
 featureType: "road.highway",
 elementType: "geometry",
 stylers: [{ color: "#746855" }],
 },
 {
 featureType: "road.highway",
 elementType: "geometry.stroke",
 stylers: [{ color: "#1f2835" }],
 },
 {
 featureType: "road.highway",
 elementType: "labels.text.fill",
 stylers: [{ color: "#f3d19c" }],
 },
 {
 featureType: "water",
 elementType: "geometry",
 stylers: [{ color: "#17263c" }],
 },
 {
 featureType: "water",
 elementType: "labels.text.fill",
 stylers: [{ color: "#515c6d" }],
 },
 {
 featureType: "water",
 elementType: "labels.text.stroke",
 stylers: [{ color: "#17263c" }],
 },
 ],
 })

 // User Location Marker
 new window.google.maps.Marker({
 position: userLocation,
 map,
 icon: {
 path: window.google.maps.SymbolPath.CIRCLE,
 scale: 10,
 fillColor: '#14B8A6',
 fillOpacity: 1,
 strokeColor: '#ffffff',
 strokeWeight: 2,
 },
 title: 'You are here'
 })

 // Service Markers
 services.forEach(service => {
 const marker = new window.google.maps.Marker({
 position: { lat: service.lat, lng: service.lng },
 map,
 title: service.title,
 icon: {
 path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
 scale: 6,
 fillColor: '#14B8A6',
 fillOpacity: 1,
 strokeColor: '#ffffff',
 strokeWeight: 2,
 },
 })

 const infoWindow = new window.google.maps.InfoWindow({
 content: `
 <div style="padding: 8px; color: #0d1117;">
 <h3 style="font-weight: bold; margin-bottom: 4px;">${service.title}</h3>
 <p style="margin-bottom: 8px; color: #475569;">$${service.price}</p>
 <a href="/services/${service.id}" style="color: #14B8A6; text-decoration: none; font-weight: 500;">View Details →</a>
 </div>
 `
 })

 marker.addListener('click', () => {
 infoWindow.open(map, marker)
 })
 })
 }

 return (
 <div className="min-h-screen py-20 px-4">
 <div className="container-custom">
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
 <div>
 <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
 <FaMapMarkerAlt className="text-[#14B8A6]" /> Nearby Services
 </h1>
 <p className="text-gray-600">Find professional services in your local area</p>
 </div>
 
 <Link href="/services" className="btn-secondary">
 Switch to List View
 </Link>
 </div>

 <div className="card overflow-hidden relative" style={{ height: '70vh' }}>
 {loading && (
 <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-primary-900 ">
 <FaSpinner className="text-4xl text-[#14B8A6] animate-spin mb-4" />
 <p className="text-white font-medium">Loading Map...</p>
 </div>
 )}

 {mapError && !loading && (
 <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-primary-900 p-8 text-center">
 <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mb-4">
 <FaMapMarkerAlt className="text-3xl text-amber-500" />
 </div>
 <h3 className="text-xl font-bold text-white mb-2">Google Maps Key Required</h3>
 <p className="text-gray-600 max-w-md mx-auto mb-6">
 To view the interactive map, you need to configure the <code className="text-white bg-gray-100 px-1 py-0.5 rounded">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> environment variable.
 </p>
 <div className="flex gap-4">
 <Link href="/services" className="btn-primary">Browse Services Instead</Link>
 </div>
 </div>
 )}

 <div id="map" className="w-full h-full bg-[#111827]" />
 </div>
 </div>
 </div>
 )
}
