import { Request, Response } from 'express'
import prisma from '../config/database'

// AI service using Gemini API (graceful fallback if no key)
const generateWithGemini = async (prompt: string): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey || apiKey.includes('placeholder')) {
    // Return a helpful mock response when no API key is configured
    return null as any
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
        }),
      }
    )
    const data: any = await response.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null
  } catch (error) {
    console.error('Gemini API error:', error)
    return null as any
  }
}

// Generate a product/service description
export const generateDescription = async (req: Request, res: Response) => {
  try {
    const { title, category, price, keywords } = req.body

    if (!title) return res.status(400).json({ success: false, error: 'Title is required' })

    const prompt = `Write a compelling, professional service listing description for a local community marketplace.

Service Title: ${title}
Category: ${category || 'General'}
Price: $${price || 'varies'}
${keywords ? `Keywords: ${keywords}` : ''}

Requirements:
- 2-3 paragraphs, engaging and persuasive
- Highlight key benefits for the customer
- Professional but friendly tone
- End with a call to action
- Do NOT include the title in the description

Write only the description text, no headings or markdown.`

    const aiDescription = await generateWithGemini(prompt)

    if (!aiDescription) {
      // Fallback mock descriptions when no API key
      const mockDescriptions: Record<string, string> = {
        'Home Repair': `Our expert ${title} service brings years of hands-on experience directly to your doorstep. We specialize in delivering high-quality workmanship that stands the test of time, using only premium materials and proven techniques.\n\nWhether it's a small fix or a complete overhaul, our team handles every job with the same level of dedication and attention to detail. We pride ourselves on transparent pricing, punctual service, and leaving your home cleaner than we found it.\n\nDon't let maintenance issues pile up — book your appointment today and experience the difference that professional service makes!`,
        'Cleaning': `Transform your space with our professional ${title} service, trusted by hundreds of satisfied customers across the community. We use eco-friendly, high-grade cleaning products that are tough on grime but gentle on surfaces and your family.\n\nOur trained team follows a comprehensive cleaning checklist to ensure every corner, nook, and surface receives the attention it deserves. Flexible scheduling means we work around your busy life.\n\nReady for a spotless home? Book now and enjoy peace of mind knowing your space is in expert hands!`,
        default: `Welcome to our professional ${title} service, where quality meets reliability. With a commitment to excellence and customer satisfaction, we bring top-tier expertise right to your community.\n\nWe understand that your time is valuable, which is why we offer flexible scheduling, transparent pricing, and a satisfaction guarantee on every job. Our experienced team is dedicated to delivering results that exceed your expectations.\n\nJoin hundreds of happy customers who trust us for their ${category || 'service'} needs. Book today and discover the difference professionalism makes!`,
      }
      const description = mockDescriptions[category] || mockDescriptions.default
      return res.status(200).json({
        success: true,
        data: { description, isMock: true, message: 'Demo mode - Configure GEMINI_API_KEY for real AI generation' },
      })
    }

    return res.status(200).json({ success: true, data: { description: aiDescription } })
  } catch (error) {
    console.error('Generate description error:', error)
    return res.status(500).json({ success: false, error: 'Failed to generate description' })
  }
}

// Get AI-based service recommendations
export const getRecommendations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId

    // Get user's booking history to understand preferences
    const bookingHistory = await prisma.booking.findMany({
      where: { clientId: userId },
      include: { service: { select: { category: true, title: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    const bookedCategories = [...new Set(bookingHistory.map(b => b.service.category))]

    // Get all available services
    const allServices = await prisma.service.findMany({
      where: { availability: true },
      include: {
        user: { select: { id: true, fullName: true, profilePicture: true } },
        bookings: { select: { id: true } },
        favorites: { select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    // Score services based on user preferences
    const scored = allServices.map(service => {
      let score = 0
      // Boost services in previously booked categories
      if (bookedCategories.includes(service.category)) score += 30
      // Boost services with more bookings (popularity)
      score += Math.min(service.bookings.length * 2, 20)
      // Boost services with more favorites
      score += Math.min(service.favorites.length * 3, 15)
      // Small random factor for variety
      score += Math.random() * 10
      return { ...service, recommendationScore: score }
    })

    // Sort by score and return top 6
    const recommended = scored
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 6)

    const prompt = bookedCategories.length > 0
      ? `Based on a user who frequently books ${bookedCategories.join(', ')} services, write a 1-sentence personalized recommendation message (e.g., "Based on your interest in home services, you might love..."). Keep it friendly and under 20 words.`
      : null

    let personalizedMessage = 'Discover top-rated services popular in your community'
    if (prompt) {
      const aiMessage = await generateWithGemini(prompt)
      if (aiMessage) personalizedMessage = aiMessage
    }

    return res.status(200).json({
      success: true,
      data: {
        services: recommended,
        message: personalizedMessage,
        basedOn: bookedCategories,
      },
    })
  } catch (error) {
    console.error('Get recommendations error:', error)
    return res.status(500).json({ success: false, error: 'Failed to get recommendations' })
  }
}
