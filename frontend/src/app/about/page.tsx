'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
 FaRocket, FaUsers, FaStore, FaTools, FaShieldAlt,
 FaComments, FaStar, FaHeart, FaArrowRight, FaCheckCircle,
 FaGithub, FaLinkedin, FaCode
} from 'react-icons/fa'

const fadeUp = {
 hidden: { opacity: 0, y: 32 },
 show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay: i * 0.08 } }),
}

const stats = [
 { value: '10K+', label: 'Active Users' },
 { value: '5K+', label: 'Products Listed' },
 { value: '3K+', label: 'Services Offered' },
 { value: '99%', label: 'Satisfaction Rate' },
]

const features = [
 { icon: <FaStore />, color: 'from-[#14B8A6] to-[#60a5fa]', title: 'Product Marketplace', desc: 'Buy and sell quality products within your community. Upload photos, set prices, and connect with buyers instantly.' },
 { icon: <FaTools />, color: 'from-[#14B8A6] to-[#a78bfa]', title: 'Service Marketplace', desc: 'Find professional services or offer your skills — from web development to photography and everything in between.' },
 { icon: <FaComments />, color: 'from-[#0891b2] to-[#22d3ee]', title: 'Real-Time Messaging', desc: 'Chat instantly with buyers, sellers, and service providers. Typing indicators, read receipts, and more.' },
 { icon: <FaShieldAlt />, color: 'from-[#16a34a] to-[#4ade80]', title: 'Secure Bookings', desc: 'Request, track, and manage service bookings with full status visibility and cancellation support.' },
 { icon: <FaStar />, color: 'from-[#d97706] to-[#fbbf24]', title: 'Reviews & Ratings', desc: 'Build trust with verified reviews. Rate service providers and read honest feedback from the community.' },
 { icon: <FaRocket />, color: 'from-[#e11d48] to-[#fb7185]', title: 'Smart Notifications', desc: 'Stay updated with real-time notifications for bookings, messages, reviews, and listing activity.' },
]

const techStack = [
 { label: 'Next.js 14', icon: '▲', color: '#fff' },
 { label: 'TypeScript', icon: 'TS', color: '#3178c6' },
 { label: 'Node.js', icon: '⬡', color: '#68a063' },
 { label: 'Express', icon: 'Ex', color: '#94a3b8' },
 { label: 'Prisma', icon: '◈', color: '#14B8A6' },
 { label: 'SQLite', icon: '🗄️', color: '#60a5fa' },
 { label: 'Socket.io', icon: '⚡', color: '#22c55e' },
 { label: 'Tailwind CSS', icon: '🎨', color: '#38bdf8' },
]

const values = [
 'Transparent, community-driven platform',
 'Privacy-first approach — your data stays yours',
 'Continuous improvement based on user feedback',
 'Zero commission on peer-to-peer transactions',
 'Open and modular architecture',
 'Secure authentication and role-based access',
]

export default function AboutPage() {
 return (
 <main className="min-h-screen">

 {/* ─── Hero ─────────────────────────────────────────── */}
 <section className="relative py-32 px-4 overflow-hidden">
 <div className="absolute inset-0 pointer-events-none">
 <div className="absolute -top-40 left-1/4 w-96 h-96 rounded-full bg-[#14B8A6]/6 blur-3xl" />
 <div className="absolute top-20 right-1/4 w-80 h-80 rounded-full bg-[#14B8A6]/6 blur-3xl" />
 </div>
 <div className="container-custom relative text-center">
 <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
 <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#14B8A6]/10 border border-[#14B8A6]/20 text-[#60a5fa] text-sm font-medium mb-6">
 <FaHeart className="text-xs text-red-400" />
 Built with passion for communities
 </div>
 </motion.div>
 <motion.h1 variants={fadeUp} initial="hidden" animate="show" custom={1}
 className="text-5xl md:text-7xl font-bold leading-tight mb-6"
 >
 <span className="gradient-text">About</span>
 <br />
 <span className="text-white">SmartCommunity</span>
 </motion.h1>
 <motion.p variants={fadeUp} initial="hidden" animate="show" custom={2}
 className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed"
 >
 A production-grade full-stack marketplace platform that connects community members to buy, sell,
 book services, and communicate — all in one beautifully designed, secure ecosystem.
 </motion.p>
 <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3}
 className="flex flex-wrap justify-center gap-4"
 >
 <Link href="/register" className="btn-primary text-base px-8 py-3">
 Join the Community <FaArrowRight className="text-sm" />
 </Link>
 <Link href="/services" className="btn-secondary text-base px-8 py-3">
 Explore Services
 </Link>
 </motion.div>
 </div>
 </section>

 {/* ─── Stats ────────────────────────────────────────── */}
 <section className="py-16 border-y border-gray-200">
 <div className="container-custom">
 <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
 {stats.map((s, i) => (
 <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i}
 className="text-center"
 >
 <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">{s.value}</div>
 <div className="text-gray-600 text-sm">{s.label}</div>
 </motion.div>
 ))}
 </div>
 </div>
 </section>

 {/* ─── Mission ──────────────────────────────────────── */}
 <section className="py-20 px-4">
 <div className="container-custom">
 <div className="grid md:grid-cols-2 gap-12 items-center">
 <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#14B8A6]/10 border border-[#14B8A6]/20 text-[#a78bfa] text-sm mb-4">
 Our Mission
 </div>
 <h2 className="text-3xl md:text-4xl font-bold text-white mb-5 leading-tight">
 Empowering communities through
 <span className="gradient-text"> trusted connections</span>
 </h2>
 <p className="text-gray-600 leading-relaxed mb-5">
 SmartCommunity was built to solve a real problem — finding trusted local service providers and quality products was fragmented, unreliable, and time-consuming. We set out to build a platform that brings your entire community marketplace into one seamless experience.
 </p>
 <p className="text-gray-600 leading-relaxed">
 From the first keystroke, our goal was to build something production-ready: secure authentication, real-time messaging, role-based dashboards, booking management, and a review system that builds genuine trust.
 </p>
 </motion.div>
 <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={1}>
 <div className="glass rounded-2xl p-8 space-y-4">
 <h3 className="text-lg font-semibold text-white mb-5">Our Values</h3>
 {values.map((v, i) => (
 <div key={i} className="flex items-start gap-3">
 <FaCheckCircle className="text-[#4ade80] text-sm mt-0.5 flex-shrink-0" />
 <span className="text-gray-600 text-sm leading-relaxed">{v}</span>
 </div>
 ))}
 </div>
 </motion.div>
 </div>
 </div>
 </section>

 {/* ─── Features ─────────────────────────────────────── */}
 <section className="py-20 px-4 bg-white">
 <div className="container-custom">
 <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-14">
 <h2 className="text-3xl md:text-5xl font-bold gradient-text mb-4">Platform Features</h2>
 <p className="text-gray-600 text-lg max-w-2xl mx-auto">Everything you need to connect, transact, and grow in your community</p>
 </motion.div>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
 {features.map((f, i) => (
 <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i % 3}
 className="glass rounded-2xl p-6 group hover:-translate-y-1 transition-all duration-300"
 >
 <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white text-xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
 {f.icon}
 </div>
 <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
 <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
 </motion.div>
 ))}
 </div>
 </div>
 </section>

 {/* ─── Tech Stack ───────────────────────────────────── */}
 <section className="py-20 px-4">
 <div className="container-custom">
 <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-12">
 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-600 text-sm mb-4">
 <FaCode className="text-xs text-[#14B8A6]" />
 Technology Stack
 </div>
 <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Built with Modern Tech</h2>
 <p className="text-gray-600 max-w-xl mx-auto">Production-grade tools chosen for performance, scalability, and developer experience</p>
 </motion.div>
 <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
 className="flex flex-wrap justify-center gap-3"
 >
 {techStack.map((t, i) => (
 <div key={i} className="glass rounded-xl px-5 py-3 flex items-center gap-2.5 hover:bg-gray-100 transition-all duration-200 hover:-translate-y-0.5">
 <span className="text-base font-mono" style={{ color: t.color }}>{t.icon}</span>
 <span className="text-sm font-medium text-white">{t.label}</span>
 </div>
 ))}
 </motion.div>
 </div>
 </section>

 {/* ─── CTA ──────────────────────────────────────────── */}
 <section className="py-20 px-4">
 <div className="container-custom">
 <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
 className="glass rounded-3xl p-12 md:p-20 text-center relative overflow-hidden"
 >
 <div className="absolute inset-0 bg-gradient-to-r from-[#14B8A6]/8 via-[#14B8A6]/8 to-[#ec4899]/8" />
 <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#14B8A6]/10 blur-3xl" />
 <div className="relative">
 <h2 className="text-3xl md:text-5xl font-bold text-white mb-5">Ready to get started?</h2>
 <p className="text-gray-600 text-lg max-w-xl mx-auto mb-8">
 Join thousands of community members already using SmartCommunity to connect, transact, and grow.
 </p>
 <div className="flex flex-wrap justify-center gap-4">
 <Link href="/register" className="btn-primary text-base px-8 py-3">
 Create Free Account <FaArrowRight className="text-sm" />
 </Link>
 <Link href="/products" className="btn-secondary text-base px-8 py-3">
 Browse Products
 </Link>
 </div>
 </div>
 </motion.div>
 </div>
 </section>

 {/* ─── Footer ───────────────────────────────────────── */}
 <footer className="py-10 border-t border-gray-200">
 <div className="container-custom">
 <div className="flex flex-col md:flex-row justify-between items-center gap-6">
 <div>
 <div className="text-xl font-bold gradient-text mb-1">SmartCommunity</div>
 <p className="text-xs text-[#4b5e7a]">© 2026 Smart Community Platform. All rights reserved.</p>
 </div>
 <div className="flex gap-6 text-sm text-gray-600">
 <Link href="/products" className="hover:text-white transition-colors">Products</Link>
 <Link href="/services" className="hover:text-white transition-colors">Services</Link>
 <Link href="/about" className="hover:text-white transition-colors">About</Link>
 <Link href="/login" className="hover:text-white transition-colors">Login</Link>
 </div>
 </div>
 </div>
 </footer>
 </main>
 )
}
