import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('?? Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@smartcommunity.com' },
    update: {},
    create: {
      email: 'admin@smartcommunity.com',
      password: adminPassword,
      fullName: 'Admin User',
      username: 'admin',
      role: 'ADMIN',
      isVerified: true,
    },
  })
  console.log(`? Created admin: ${admin.email}`)

  // Create sample users
  const userPassword = await bcrypt.hash('password123', 10)
  
  const john = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      email: 'john@example.com',
      password: userPassword,
      fullName: 'John Doe',
      username: 'johndoe',
      bio: 'Full-stack developer and designer',
      location: 'New York, USA',
      role: 'PROVIDER',
      isVerified: true,
    },
  })
  console.log(`? Created user: ${john.email}`)

  const jane = await prisma.user.upsert({
    where: { email: 'jane@example.com' },
    update: {},
    create: {
      email: 'jane@example.com',
      password: userPassword,
      fullName: 'Jane Smith',
      username: 'janesmith',
      bio: 'Photographer and content creator',
      location: 'Los Angeles, USA',
      role: 'PROVIDER',
      isVerified: true,
    },
  })
  console.log(`? Created user: ${jane.email}`)

  const mike = await prisma.user.upsert({
    where: { email: 'mike@example.com' },
    update: {},
    create: {
      email: 'mike@example.com',
      password: userPassword,
      fullName: 'Mike Johnson',
      username: 'mikejohnson',
      bio: 'Digital marketing expert',
      location: 'Chicago, USA',
      role: 'PROVIDER',
      isVerified: true,
    },
  })
  console.log(`? Created user: ${mike.email}`)

  // Create sample products with images as JSON string
  await prisma.product.create({
    data: {
      title: 'iPhone 15 Pro Max',
      description: 'Brand new iPhone 15 Pro Max, 256GB, Space Black.',
      price: 1199.99,
      category: 'Electronics',
      condition: 'New',
      images: JSON.stringify(['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400']),
      location: 'New York, USA',
      userId: john.id,
    },
  })
  console.log('? Created product: iPhone 15 Pro Max')

  await prisma.product.create({
    data: {
      title: 'MacBook Pro 14"',
      description: 'MacBook Pro 14-inch with M2 Pro chip, 16GB RAM, 512GB SSD.',
      price: 1999.99,
      category: 'Electronics',
      condition: 'Like New',
      images: JSON.stringify(['https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400']),
      location: 'New York, USA',
      userId: john.id,
    },
  })
  console.log('? Created product: MacBook Pro')

  await prisma.product.create({
    data: {
      title: 'Vintage Camera',
      description: 'Classic vintage film camera, fully functional.',
      price: 299.99,
      category: 'Photography',
      condition: 'Good',
      images: JSON.stringify(['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400']),
      location: 'Los Angeles, USA',
      userId: jane.id,
    },
  })
  console.log('? Created product: Vintage Camera')

  // Create sample services
  await prisma.service.create({
    data: {
      title: 'Web Development Services',
      description: 'Full-stack web development using React, Node.js, and modern technologies.',
      price: 150.00,
      category: 'Web Development',
      deliveryTime: '2-4 weeks',
      availability: true,
      portfolioImages: JSON.stringify(['https://images.unsplash.com/photo-1547658719-da2b51169166?w=400']),
      userId: john.id,
    },
  })
  console.log('? Created service: Web Development')

  await prisma.service.create({
    data: {
      title: 'Professional Photography',
      description: 'Professional photography services for events, portraits, and products.',
      price: 200.00,
      category: 'Photography',
      deliveryTime: '1-2 weeks',
      availability: true,
      portfolioImages: JSON.stringify(['https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=400']),
      userId: jane.id,
    },
  })
  console.log('? Created service: Professional Photography')

  await prisma.service.create({
    data: {
      title: 'Digital Marketing & SEO',
      description: 'Comprehensive digital marketing including SEO, social media, and content strategy.',
      price: 300.00,
      category: 'Digital Marketing',
      deliveryTime: '1-3 months',
      availability: true,
      portfolioImages: JSON.stringify(['https://images.unsplash.com/photo-1432889821006-c7c2c1e00a1e?w=400']),
      userId: mike.id,
    },
  })
  console.log('? Created service: Digital Marketing')

  console.log('? Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('? Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
