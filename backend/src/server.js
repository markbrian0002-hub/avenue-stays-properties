import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' })); // High limit to support multiple base64 PNG/JPEG photo uploads

const DATA_FILE = path.join(__dirname, 'properties.json');

// Helper to read properties from local JSON store
const getProperties = () => {
  if (!fs.existsSync(DATA_FILE)) {
    const initial = [
      {
        id: '1',
        title: 'Green Valley Lakeview Villa',
        description: 'A gorgeous 3-bedroom townhouse overlooking the serene landscapes near Lake Nakuru. Ideal for family vacations looking for peace, space, and comfort.',
        price: 150000,
        county: 'Nakuru',
        location: 'Milimani',
        listingType: 'Short Term',
        bedrooms: 3,
        bathrooms: 2,
        images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800']
      }
    ];
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  const data = fs.readFileSync(DATA_FILE, 'utf8');
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

// Helper to save properties to local JSON store
const saveProperties = (props) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(props, null, 2));
};

// 1. GET: Fetch all property listings
app.get('/api/properties', (req, res) => {
  const properties = getProperties();
  res.json(properties);
});

// 2. POST: Create a new property listing with multi-image gallery support
app.post('/api/properties', (req, res) => {
  const properties = getProperties();
  const newProperty = {
    id: Date.now().toString(),
    ...req.body,
    images: req.body.images && req.body.images.length > 0 
      ? req.body.images 
      : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800']
  };
  properties.unshift(newProperty);
  saveProperties(properties);
  res.status(201).json(newProperty);
});

// 3. PUT: Update an existing property including multi-image gallery changes
app.put('/api/properties/:id', (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  let properties = getProperties();

  const index = properties.findIndex((p) => p.id === id || p.id == id);

  if (index !== -1) {
    properties[index] = { 
      ...properties[index], 
      ...updatedData,
      images: updatedData.images && updatedData.images.length > 0 
        ? updatedData.images 
        : properties[index].images 
    };
    saveProperties(properties);
    res.json({ success: true, property: properties[index] });
  } else {
    res.status(404).json({ error: 'Property not found' });
  }
});

// 4. DELETE: Remove a property listing
app.delete('/api/properties/:id', (req, res) => {
  const { id } = req.params;
  let properties = getProperties();
  
  const filtered = properties.filter((p) => p.id !== id && p.id != id);

  if (filtered.length !== properties.length) {
    saveProperties(filtered);
    res.json({ success: true, message: 'Property deleted successfully' });
  } else {
    res.status(404).json({ error: 'Property not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Avenue Properties backend server running on http://localhost:${PORT}`);
});