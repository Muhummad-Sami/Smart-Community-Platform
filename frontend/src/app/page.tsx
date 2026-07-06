'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { FaArrowRight, FaBox, FaTools, FaShieldAlt, FaComments, FaStar, FaStore } from 'react-icons/fa'

const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.4, 0, 1] } }),
}

const features = [
    { icon: <FaStore />, title: 'Local Marketplace', desc: 'Buy and sell quality products with people in your community.', color: 'from-primary-500 to-primary-400' },
    { icon: <FaTools />, title: 'Professional Services', desc: 'Book skilled local professionals for any job, big or small.', color: 'from-primary-500 to-primary-600' },
    { icon: <FaComments />, title: 'Real-time Chat', desc: 'Communicate instantly with buyers, sellers, and service providers.', color: 'from-primary-400 to-primary-500' },
]

export default function HomePage() {
    return (
        <main className="min-h-screen bg-background">
            {/* ─── Hero Section ─────────────────────────────────────────── */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-4 overflow-hidden bg-gradient-to-br from-primary-900 to-primary-800 text-[#FBF5DD]">
                {/* Background elements */}
                <div className="absolute inset-0 bg-primary-900/80 mix-blend-multiply" />
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary-500/20 blur-[100px] pointer-events-none" />
                <div className="absolute bottom-[0%] -right-[10%] w-[40%] h-[40%] rounded-full bg-primary-700/40 blur-[100px] pointer-events-none" />

                <div className="container-custom relative z-10 text-center">
                    <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-medium mb-8 backdrop-blur-sm cursor-default text-[#FBF5DD]">
                            <span className="w-2 h-2 rounded-full bg-accent-500 animate-pulse-dot" />
                            The Next Generation Community Platform
                        </div>
                    </motion.div>

                    <motion.h1 variants={fadeUp} initial="hidden" animate="show" custom={1} className="text-5xl md:text-7xl lg:text-8xl font-black leading-[1.1] tracking-tight mb-6 text-[#FBF5DD]">
                        Connect. Trade.<br />
                        <span className="text-accent-400">Thrive Together.</span>
                    </motion.h1>

                    <motion.p variants={fadeUp} initial="hidden" animate="show" custom={2} className="text-lg md:text-xl text-[#E7E1B1] max-w-2xl mx-auto mb-10 leading-relaxed">
                        Your all-in-one platform for local commerce and professional services. Join thousands of community members building a stronger local economy.
                    </motion.p>

                    <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/register" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-accent-500 hover:bg-accent-600 text-[#FBF5DD] hover:text-[#FBF5DD] font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                            Get Started <FaArrowRight className="text-sm" />
                        </Link>
                        <Link href="/services" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-[#FBF5DD] hover:text-[#FBF5DD] font-bold text-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1">
                            Explore Services
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* ─── Features Section ─────────────────────────────────────── */}
            <section className="py-24 px-4 bg-background">
                <div className="container-custom">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4 text-primary-900">Everything you need in <span className="text-primary-500">one place</span></h2>
                        <p className="text-primary-800 text-lg max-w-2xl mx-auto">A unified ecosystem designed for trust, speed, and reliability.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {features.map((f, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="card group hover:-translate-y-2 transition-all duration-300 relative overflow-hidden bg-surface p-6"
                            >
                                <div className={`absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br ${f.color} rounded-full blur-[60px] opacity-20 group-hover:opacity-30 transition-opacity`} />
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-[#FBF5DD] text-2xl mb-6 shadow-md`}>
                                    {f.icon}
                                </div>
                                <h3 className="text-xl font-bold text-primary-900 mb-3">{f.title}</h3>
                                <p className="text-primary-800 leading-relaxed">{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── CTA Section ────────────────────────────────────────── */}
            <section className="py-32 px-4 relative overflow-hidden bg-primary-900 text-[#FBF5DD]">
                <div className="container-custom">
                    <div className="rounded-[2.5rem] p-10 md:p-20 text-center relative overflow-hidden bg-primary-800 border border-primary-700 shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent" />
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-2xl bg-gradient-to-b from-primary-500/20 to-transparent blur-3xl rounded-full pointer-events-none" />

                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-6xl font-bold text-[#FBF5DD] mb-6">Ready to join your community?</h2>
                            <p className="text-[#E7E1B1] text-lg md:text-xl max-w-2xl mx-auto mb-10">
                                Create your free account today and start connecting with local buyers, sellers, and service providers.
                            </p>
                            <Link href="/register" className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-xl bg-accent-500 hover:bg-accent-600 text-[#FBF5DD] hover:text-[#FBF5DD] font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                Create Free Account
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Footer ───────────────────────────────────────── */}
            <footer className="py-12 border-t border-primary-800 bg-primary-900 text-[#FBF5DD]">
                <div className="container-custom">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                            <div className="text-xl font-bold text-accent-400 mb-2">SmartCommunity</div>
                            <p className="text-sm text-[#E7E1B1]">© 2026 Smart Community Platform. All rights reserved.</p>
                        </div>
                        <div className="flex gap-8 text-sm font-medium text-[#E7E1B1]">
                            <Link href="/products" className="hover:text-accent-400 transition-colors">Products</Link>
                            <Link href="/services" className="hover:text-accent-400 transition-colors">Services</Link>
                            <Link href="/about" className="hover:text-accent-400 transition-colors">About</Link>
                            <Link href="/login" className="hover:text-accent-400 transition-colors">Login</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </main>
    )
}