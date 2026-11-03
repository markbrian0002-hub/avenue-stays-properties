import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing records
  await prisma.property.deleteMany({});
  console.log('🧹 Cleared existing properties.');

  const nakuruProperties = [
    {
      title: 'Nakuru Milimani Getaway Suite',
      description: 'A modern, cozy studio apartment located in the quiet, upscale neighborhood of Milimani. Perfect for business travelers or weekend getaways with great views and high-speed Wi-Fi.',
      listingType: 'SHORT_TERM', // Matches your ListingType enum
      county: 'Nakuru',
      location: 'Milimani',
      price: 4500,
      bedrooms: 1,
      bathrooms: 1,
      maxGuests: 2,
      amenities: ['Wi-Fi', 'Hot Shower', 'Netflix', 'Ample Parking', '24/7 Security'],
      images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800'],
      isFeatured: true,
    },
    {
      title: 'Section 5 Executive 2-Bedroom',
      description: 'A spacious and secure 2-bedroom apartment situated close to Nakuru CBD. Features modern finishes, ample natural light, and a reliable water supply.',
      listingType: 'LONG_TERM', // Matches your ListingType enum
      county: 'Nakuru',
      location: 'Section 5',
      price: 35000,
      bedrooms: 2,
      bathrooms: 1,
      maxGuests: 4,
      amenities: ['Balcony', 'Backup Water Tanks', 'Perimeter Wall', 'Cabro Parking'],
      images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=800'],
      isFeatured: false,
    },
    {
      title: 'Green Valley Lakeview Villa',
      description: 'A gorgeous 3-bedroom townhouse overlooking the serene landscapes near Lake Nakuru. Ideal for family vacations looking for peace, space, and comfort.',
      listingType: 'SHORT_TERM', // Matches your ListingType enum
      county: 'Nakuru',
      location: 'Lakeview',
      price: 12000,
      bedrooms: 3,
      bathrooms: 2,
      maxGuests: 6,
      amenities: ['Scenic Views', 'Private Garden', 'Wi-Fi', 'Fully Equipped Kitchen', 'Smart TV'],
      images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800'],
      isFeatured: true,
    },
  ];

  for (const property of nakuruProperties) {
    const created = await prisma.property.create({ data: property });
    console.log(`✅ Created property: ${created.title}`);
  }

  console.log('🎉 Nakuru properties seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed with error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });