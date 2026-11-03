import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const nakuruProperties = [
  {
    title: 'Nakuru Milimani Getaway Suite',
    description: 'A modern, cozy studio apartment located in the quiet, upscale neighborhood of Milimani. Perfect for business travelers or weekend getaways with great views and high-speed Wi-Fi.',
    location: 'Milimani',
    county: 'Nakuru',
    price: 4500,
    pricePerNight: 4500,
    pricePerMonth: null,
    listingType: 'SHORT_TERM' as const,
    bedrooms: 1,
    bathrooms: 1,
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800',
    amenities: ['Wi-Fi', 'Hot Shower', 'Netflix', 'Ample Parking', '24/7 Security'],
  },
  {
    title: 'Section 5 Executive 2-Bedroom',
    description: 'A spacious and secure 2-bedroom apartment situated close to Nakuru CBD. Features modern finishes, ample natural light, and a reliable water supply.',
    location: 'Section 58',
    county: 'Nakuru',
    price: 35000,
    pricePerNight: null,
    pricePerMonth: 35000,
    listingType: 'LONG_TERM' as const,
    bedrooms: 2,
    bathrooms: 1,
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=800',
    amenities: ['Balcony', 'Backup Water Tanks', 'Perimeter Wall', 'Cabro Parking'],
  },
  {
    title: 'Green Valley Lakeview Villa',
    description: 'A gorgeous 3-bedroom townhouse overlooking the serene landscapes near Lake Nakuru. Ideal for family vacations looking for peace, space, and comfort.',
    location: 'Lakeview',
    county: 'Nakuru',
    price: 12000,
    pricePerNight: 12000,
    pricePerMonth: null,
    listingType: 'SHORT_TERM' as const,
    bedrooms: 3,
    bathrooms: 2,
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
    amenities: ['Scenic Views', 'Private Garden', 'Wi-Fi', 'Fully Equipped Kitchen', 'Smart TV'],
  },
];

async function main() {
  console.log('Seeding Nakuru properties...');
  for (const property of nakuruProperties) {
    await prisma.property.create({
      data: property,
    });
  }
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });