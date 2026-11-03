// @ts-ignore -- Express type declarations are missing from this project.
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// ==================== PROPERTY ROUTES ====================

// 1. GET all properties (with optional search/filtering)
router.get('/properties', async (req: any, res: any) => {
  try {
    const { search, listingType } = req.query;
    
    const filter: any = {};
    if (listingType) {
      filter.listingType = String(listingType);
    }
    if (search) {
      filter.OR = [
        { title: { contains: String(search), mode: 'insensitive' } },
        { location: { contains: String(search), mode: 'insensitive' } },
        { county: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const properties = await prisma.property.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' },
    });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// 2. GET single property by ID
router.get('/properties/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const property = await prisma.property.findUnique({
      where: { id },
    });
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.json(property);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch property details' });
  }
});

// 3. CREATE a new property (Admin Dashboard)
router.post('/properties', async (req: any, res: any) => {
  try {
    const property = await prisma.property.create({
      data: req.body,
    });
    res.status(201).json(property);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create property', details: error });
  }
});

// 4. UPDATE a property (Admin Dashboard)
router.put('/properties/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const property = await prisma.property.update({
      where: { id },
      data: req.body,
    });
    res.json(property);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update property', details: error });
  }
});

// 5. DELETE a property (Admin Dashboard)
router.delete('/properties/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    await prisma.property.delete({
      where: { id },
    });
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete property' });
  }
});


// ==================== BOOKING ROUTES ====================

// 6. CREATE a new booking from the Booking Modal
router.post('/bookings', async (req: any, res: any) => {
  try {
    const { propertyId, fullName, phone, checkIn, checkOut, totalAmount } = req.body;
    
    // The generated Prisma client currently lacks the Booking model type.
    const booking = await (prisma as any).booking.create({
      data: {
        propertyId,
        fullName,
        phone,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        totalAmount: Number(totalAmount),
      },
    });
    
    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create booking', details: error });
  }
});

// SEED ROUTE (Visit http://localhost:5000/api/seed in your browser to populate properties)
router.get('/seed', async (_req: any, res: any) => {
  try {
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
        location: 'Section 5',
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

    for (const property of nakuruProperties) {
      await prisma.property.create({ data: property });
    }

    res.json({ message: 'Nakuru properties seeded successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Seeding failed', details: error });
  }
});

export default router;