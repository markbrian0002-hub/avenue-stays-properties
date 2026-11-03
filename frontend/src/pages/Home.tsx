import React, { useEffect, useState } from 'react';

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  county: string;
  location: string;
  listingType: string;
  bedrooms: number;
  bathrooms: number;
  status: string; // New: 'Available', 'Booked', 'Rented'
  mapEmbedUrl?: string;
  images: string[];
}

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter & Sort States
  const [activeTab, setActiveTab] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [selectedBedrooms, setSelectedBedrooms] = useState<string>('All');
  const [selectedBathrooms, setSelectedBathrooms] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('default');

  // UTM Tracking State
  const [utmData, setUtmData] = useState<{ source?: string; medium?: string; campaign?: string }>({});

  // Modal States
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  
  // Booking / Tour Request Form States inside Modal
  const [bookingName, setBookingName] = useState<string>('');
  const [bookingPhone, setBookingPhone] = useState<string>('');
  const [bookingDate, setBookingDate] = useState<string>('');
  const [bookingSubmitted, setBookingSubmitted] = useState<boolean>(false);

  // Favorites / Saved Drawer States
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isFavoritesDrawerOpen, setIsFavoritesDrawerOpen] = useState<boolean>(false);

  // Admin & Listing States
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [isListModalOpen, setIsListModalOpen] = useState<boolean>(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState<boolean>(false);

  // New Property Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCounty, setNewCounty] = useState('Nakuru');
  const [newLocation, setNewLocation] = useState('');
  const [newListingType, setNewListingType] = useState('Short Term');
  const [newBedrooms, setNewBedrooms] = useState('1');
  const [newBathrooms, setNewBathrooms] = useState('1');
  const [newStatus, setNewStatus] = useState('Available');
  const [newMapUrl, setNewMapUrl] = useState('');
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Edit Property State
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCounty, setEditCounty] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editListingType, setEditListingType] = useState('');
  const [editBedrooms, setEditBedrooms] = useState('');
  const [editBathrooms, setEditBathrooms] = useState('');
  const [editStatus, setEditStatus] = useState('Available');
  const [editMapUrl, setEditMapUrl] = useState('');
  const [editImagePreviews, setEditImagePreviews] = useState<string[]>([]);

  const fetchProperties = () => {
    fetch('http://localhost:5000/api/properties')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch properties from server');
        return res.json();
      })
      .then((data) => {
        setProperties(data);
        setFilteredProperties(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProperties();

    const savedFavs = localStorage.getItem('avenue_favorites');
    if (savedFavs) {
      try {
        setFavorites(JSON.parse(savedFavs));
      } catch (e) {
        console.error(e);
      }
    }

    const params = new URLSearchParams(window.location.search);
    const source = params.get('utm_source');
    const medium = params.get('utm_medium');
    const campaign = params.get('utm_campaign');

    if (source || medium || campaign) {
      const trackingInfo = { source: source || 'direct', medium: medium || 'organic', campaign: campaign || 'general' };
      setUtmData(trackingInfo);
      localStorage.setItem('avenue_utm', JSON.stringify(trackingInfo));
    } else {
      const storedUtm = localStorage.getItem('avenue_utm');
      if (storedUtm) {
        try {
          setUtmData(JSON.parse(storedUtm));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    let updated;
    if (favorites.includes(id)) {
      updated = favorites.filter(favId => favId !== id);
    } else {
      updated = [...favorites, id];
    }
    setFavorites(updated);
    localStorage.setItem('avenue_favorites', JSON.stringify(updated));
  };

  // Advanced Filtering and Sorting Logic
  useEffect(() => {
    let result = [...properties];

    if (activeTab !== 'All') {
      result = result.filter(
        (p) => p.listingType?.toLowerCase() === activeTab.toLowerCase()
      );
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.location?.toLowerCase().includes(q) ||
          p.county?.toLowerCase().includes(q)
      );
    }

    if (maxPrice.trim() !== '') {
      const limit = Number(maxPrice);
      if (!isNaN(limit) && limit > 0) {
        result = result.filter((p) => p.price <= limit);
      }
    }

    if (selectedBedrooms !== 'All') {
      const beds = Number(selectedBedrooms);
      result = result.filter((p) => p.bedrooms === beds);
    }

    if (selectedBathrooms !== 'All') {
      const baths = Number(selectedBathrooms);
      result = result.filter((p) => p.bathrooms === baths);
    }

    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'beds-desc') {
      result.sort((a, b) => b.bedrooms - a.bedrooms);
    }

    setFilteredProperties(result);
  }, [activeTab, searchQuery, maxPrice, selectedBedrooms, selectedBathrooms, sortBy, properties]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'admin123') {
      setIsAdminLoggedIn(true);
      setIsAdminModalOpen(false);
      setAdminPassword('');
      alert('Successfully logged into Admin Dashboard!');
    } else {
      alert('Invalid Admin Passcode');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setIsManageModalOpen(false);
    setIsListModalOpen(false);
    setEditingProperty(null);
    alert('Logged out of Admin session successfully.');
  };

  const handleMultipleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          newImages.push(reader.result as string);
          if (newImages.length === files.length) {
            setImagePreviews((prev) => [...prev, ...newImages]);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleEditMultipleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          newImages.push(reader.result as string);
          if (newImages.length === files.length) {
            setEditImagePreviews((prev) => [...prev, ...newImages]);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleCreateProperty = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: newTitle,
      description: newDescription,
      price: Number(newPrice),
      county: newCounty,
      location: newLocation,
      listingType: newListingType,
      bedrooms: Number(newBedrooms),
      bathrooms: Number(newBathrooms),
      status: newStatus,
      mapEmbedUrl: newMapUrl,
      images: imagePreviews.length > 0 ? imagePreviews : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800']
    };

    fetch('http://localhost:5000/api/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to create property');
        return res.json();
      })
      .then(() => {
        setIsListModalOpen(false);
        setNewTitle('');
        setNewDescription('');
        setNewPrice('');
        setNewLocation('');
        setNewMapUrl('');
        setImagePreviews([]);
        fetchProperties();
        alert('Property successfully published!');
      })
      .catch((err) => alert(err.message));
  };

  const handleDeleteProperty = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this property listing?')) return;

    fetch(`http://localhost:5000/api/properties/${id}`, {
      method: 'DELETE',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to delete property');
        fetchProperties();
      })
      .catch((err) => alert(err.message));
  };

  const startEditing = (p: Property) => {
    setEditingProperty(p);
    setEditTitle(p.title);
    setEditDescription(p.description);
    setEditPrice(p.price.toString());
    setEditCounty(p.county);
    setEditLocation(p.location);
    setEditListingType(p.listingType);
    setEditBedrooms(p.bedrooms.toString());
    setEditBathrooms(p.bathrooms.toString());
    setEditStatus(p.status || 'Available');
    setEditMapUrl(p.mapEmbedUrl || '');
    setEditImagePreviews(p.images || []);
  };

  const handleUpdateProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProperty) return;

    const payload = {
      ...editingProperty,
      title: editTitle,
      description: editDescription,
      price: Number(editPrice),
      county: editCounty,
      location: editLocation,
      listingType: editListingType,
      bedrooms: Number(editBedrooms),
      bathrooms: Number(editBathrooms),
      status: editStatus,
      mapEmbedUrl: editMapUrl,
      images: editImagePreviews.length > 0 ? editImagePreviews : editingProperty.images
    };

    fetch(`http://localhost:5000/api/properties/${editingProperty.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to update property');
        return res.json();
      })
      .then(() => {
        setEditingProperty(null);
        fetchProperties();
        alert('Property updated successfully!');
      })
      .catch((err) => alert(err.message));
  };

  const openWhatsApp = (property?: Property) => {
    const phoneNumber = "254705343780";
    const utmTag = utmData.source 
      ? `\n\n[Ad Source: ${utmData.source} | Medium: ${utmData.medium} | Campaign: ${utmData.campaign}]`
      : '';

    const message = property 
      ? encodeURIComponent(`Hello Avenue Properties Limited, I am interested in inquiring about the property: "${property.title}" located in ${property.location}, ${property.county} listed at KES ${property.price.toLocaleString()}. Please share more details.${utmTag}`)
      : encodeURIComponent(`Hello Avenue Properties Limited, I am browsing your property listings and would like assistance finding a home within my budget.${utmTag}`);
    
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  const handleBookingSubmit = (e: React.FormEvent, property: Property) => {
    e.preventDefault();
    if (!bookingName || !bookingPhone || !bookingDate) {
      alert('Please fill in all booking details.');
      return;
    }

    const bookingDetails = encodeURIComponent(
      `Hello Avenue Properties Limited, I would like to book a tour/viewing for "${property.title}" in ${property.location}.\n\nClient Name: ${bookingName}\nPhone: ${bookingPhone}\nPreferred Date: ${bookingDate}`
    );
    
    setBookingSubmitted(true);
    setTimeout(() => {
      window.open(`https://wa.me/254705343780?text=${bookingDetails}`, '_blank');
    }, 1000);
  };

  const favoritedPropertiesList = properties.filter(p => favorites.includes(p.id));

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white selection:bg-white selection:text-black">
      
      {/* Floating WhatsApp Button */}
      <button 
        onClick={() => openWhatsApp()}
        className="fixed bottom-6 left-6 z-40 bg-emerald-600 hover:bg-emerald-500 text-white p-3.5 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 border border-emerald-400/30 group"
        title="Chat with an Agent on WhatsApp"
      >
        <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        </svg>
      </button>

      {/* Hero Section */}
      <div className="relative min-h-[85vh] bg-[#0B0F17] text-white flex flex-col justify-between overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-40 mix-blend-overlay">
            <source src="/hero-bg.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F17]/90 via-[#0B0F17]/50 to-[#0B0F17] z-0 pointer-events-none" />

        {/* Top Navbar */}
        <header className="relative z-20 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded overflow-hidden flex items-center justify-center shadow-lg bg-black/40 border border-white/20">
              <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover scale-125" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-widest uppercase">Avenue Properties</h1>
              <p className="text-[10px] tracking-widest text-gray-400 uppercase">Limited</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsFavoritesDrawerOpen(true)}
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-white/10 text-white hover:bg-white hover:text-black transition rounded border border-white/20 shadow-lg flex items-center space-x-1.5"
            >
              <span>Saved</span>
              <span className="bg-white text-[#0B0F17] px-1.5 py-0.2 rounded-full text-[10px] font-bold">
                {favorites.length}
              </span>
            </button>

            {isAdminLoggedIn ? (
              <>
                <button onClick={() => setIsListModalOpen(true)} className="px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-white/10 text-white hover:bg-white hover:text-black transition rounded border border-white/20 shadow-lg">
                  + Add Property
                </button>
                <button onClick={() => setIsManageModalOpen(true)} className="px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-white/10 text-white hover:bg-white hover:text-black transition rounded border border-white/20 shadow-lg">
                  Manage Listings ({properties.length})
                </button>
                <button onClick={handleAdminLogout} className="px-3 py-2 text-xs font-semibold uppercase tracking-wider bg-red-600/80 text-white hover:bg-red-600 transition rounded shadow-lg">
                  Logout
                </button>
              </>
            ) : (
              <span className="text-xs text-gray-400 tracking-widest uppercase hidden md:inline">
                Welcome Home
              </span>
            )}
          </div>
        </header>

        {/* Hero Content */}
        <main className="relative z-20 max-w-4xl mx-auto px-6 text-center my-auto flex flex-col items-center">
          <div className="mb-6 w-28 h-28 bg-white/5 border border-white/10 backdrop-blur-lg rounded-2xl flex items-center justify-center shadow-2xl overflow-hidden p-2">
            <img src="/logo.jpeg" alt="Emblem" className="w-full h-full object-contain filter drop-shadow-md scale-110" />
          </div>

          <h2 className="text-4xl md:text-6xl font-serif font-light tracking-wide text-white mb-4">
            AVENUE PROPERTIES <span className="block font-semibold mt-1">LIMITED</span>
          </h2>
          <p className="text-sm md:text-base tracking-[0.25em] text-gray-300 uppercase mb-8 font-light">
            Homes for Every Budget — From Cozy Studios to Executive Residences
          </p>

          <div className="w-full max-w-2xl bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 flex flex-col md:flex-row items-center gap-2 shadow-2xl">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search location (e.g. Nakuru, Nairobi, Milimani)..." 
              className="w-full bg-black/30 px-4 py-3 rounded-xl text-xs md:text-sm tracking-wider text-white placeholder-gray-400 focus:outline-none border border-white/10"
            />
            <input 
              type="number" 
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Max Price (KES)..." 
              className="w-full md:w-48 bg-black/30 px-4 py-3 rounded-xl text-xs md:text-sm tracking-wider text-white placeholder-gray-400 focus:outline-none border border-white/10"
            />
            <button className="w-full md:w-auto bg-white text-[#0B0F17] px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-200 transition whitespace-nowrap">
              Filter
            </button>
          </div>
        </main>
        <div className="py-4"></div>
      </div>

      {/* Property Showcase Grid & Advanced Filters Toolbar */}
      <section className="relative z-20 max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-2">Available Properties</p>
            <h3 className="text-3xl font-serif font-light tracking-wide">Explore All Listings</h3>
          </div>

          <div className="flex items-center space-x-2 bg-[#131A26] p-1.5 rounded-lg border border-white/10">
            {['All', 'Short Term', 'Long Term'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs uppercase tracking-wider rounded-md transition ${
                  activeTab === tab ? 'bg-white text-[#0B0F17] font-bold shadow' : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Filter & Sorting Toolbar */}
        <div className="bg-[#131A26] border border-white/10 rounded-xl p-4 mb-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase tracking-widest text-gray-400">Beds:</span>
              <select 
                value={selectedBedrooms} 
                onChange={(e) => setSelectedBedrooms(e.target.value)}
                className="bg-black/40 border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="All">All Beds</option>
                <option value="1">1 Bed</option>
                <option value="2">2 Beds</option>
                <option value="3">3+ Beds</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase tracking-widest text-gray-400">Baths:</span>
              <select 
                value={selectedBathrooms} 
                onChange={(e) => setSelectedBathrooms(e.target.value)}
                className="bg-black/40 border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="All">All Baths</option>
                <option value="1">1 Bath</option>
                <option value="2">2+ Baths</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
            <span className="text-[10px] uppercase tracking-widest text-gray-400">Sort By:</span>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-black/40 border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="default">Featured / Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="beds-desc">Most Bedrooms</option>
            </select>
          </div>
        </div>

        {loading && <div className="text-center py-20 text-gray-400 tracking-wider uppercase text-xs">Loading portfolios...</div>}
        {error && <div className="text-center py-20 text-red-400 tracking-wider text-xs">Error loading properties: {error}</div>}
        {!loading && !error && filteredProperties.length === 0 && (
          <div className="text-center py-20 text-gray-400 tracking-wider text-xs uppercase">No matching properties found with these filters.</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProperties.map((property) => {
            const isFav = favorites.includes(property.id);
            const status = property.status || 'Available';
            const statusColor = 
              status === 'Available' ? 'bg-emerald-600/80 text-white border-emerald-400/30' : 
              status === 'Booked' ? 'bg-amber-600/80 text-white border-amber-400/30' : 
              'bg-red-600/80 text-white border-red-400/30';

            return (
              <div key={property.id} className="bg-[#131A26] border border-[#1E293B] rounded-xl overflow-hidden shadow-2xl hover:border-white/30 transition duration-300 flex flex-col justify-between">
                <div>
                  <div className="relative h-60 w-full overflow-hidden bg-gray-900">
                    <img 
                      src={property.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800'} 
                      alt={property.title}
                      className="w-full h-full object-cover hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] tracking-widest uppercase px-3 py-1 rounded">
                        {property.listingType}
                      </span>
                      <span className={`backdrop-blur-md border text-[10px] tracking-widest uppercase px-3 py-1 rounded font-semibold ${statusColor}`}>
                        {status}
                      </span>
                    </div>

                    <button 
                      onClick={(e) => toggleFavorite(property.id, e)}
                      className={`absolute top-4 right-4 z-10 p-2.5 rounded-full backdrop-blur-md transition-all ${
                        isFav ? 'bg-red-600 text-white' : 'bg-black/50 text-gray-300 hover:text-white'
                      }`}
                      title={isFav ? "Remove from saved homes" : "Save home"}
                    >
                      {isFav ? '❤️' : '🤍'}
                    </button>
                  </div>

                  <div className="p-6">
                    <p className="text-xs text-gray-400 tracking-widest uppercase mb-1">{property.county} — {property.location}</p>
                    <h4 className="text-lg font-serif font-medium mb-2 text-white">{property.title}</h4>
                    <p className="text-gray-400 text-xs line-clamp-2 mb-4 leading-relaxed font-light">{property.description}</p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-300 border-t border-white/10 pt-4">
                      <span>{property.bedrooms} Beds</span>
                      <span>•</span>
                      <span>{property.bathrooms} Baths</span>
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-white/5">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest block">Price</span>
                    <span className="text-base font-semibold tracking-wide text-white">KES {property.price.toLocaleString()}</span>
                  </div>
                  <div>
                    <button 
                      onClick={() => { 
                        setSelectedProperty(property); 
                        setActiveImageIndex(0); 
                        setBookingSubmitted(false);
                        setBookingName('');
                        setBookingPhone('');
                        setBookingDate('');
                      }}
                      className="px-4 py-2 bg-white/10 hover:bg-white hover:text-black transition text-xs tracking-wider uppercase rounded font-medium border border-white/20"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Client Testimonials & Success Stories Section */}
      <section className="py-20 border-t border-white/10 bg-[#070A0F]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-2">Client Trust & Reviews</p>
            <h3 className="text-3xl font-serif font-light tracking-wide">What Our Residents & Guests Say</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#131A26] border border-white/10 rounded-2xl p-8 shadow-xl flex flex-col justify-between">
              <p className="text-gray-300 text-xs leading-relaxed font-light mb-6">
                &ldquo;Avenue Properties made finding our family apartment in Nakuru completely effortless. The virtual gallery and instant WhatsApp coordination were top-tier.&rdquo;
              </p>
              <div className="flex items-center space-x-3 border-t border-white/10 pt-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-serif font-bold text-xs">KM</div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Kelvin Mutua</h4>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">Long-Term Resident</p>
                </div>
              </div>
            </div>

            <div className="bg-[#131A26] border border-white/10 rounded-2xl p-8 shadow-xl flex flex-col justify-between">
              <p className="text-gray-300 text-xs leading-relaxed font-light mb-6">
                &ldquo;Booked a short-term executive stay in Nairobi through their platform. The neighborhood map preview and responsiveness were phenomenal! Highly recommend.&rdquo;
              </p>
              <div className="flex items-center space-x-3 border-t border-white/10 pt-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-serif font-bold text-xs">SO</div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Stacey Omondi</h4>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">Short-Term Guest</p>
                </div>
              </div>
            </div>

            <div className="bg-[#131A26] border border-white/10 rounded-2xl p-8 shadow-xl flex flex-col justify-between">
              <p className="text-gray-300 text-xs leading-relaxed font-light mb-6">
                &ldquo;As an investor, listing and managing my properties through their admin portal is extremely streamlined. Their marketing attribution tracking is a game-changer.&rdquo;
              </p>
              <div className="flex items-center space-x-3 border-t border-white/10 pt-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-serif font-bold text-xs">DN</div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-white">David Njoroge</h4>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">Property Investor</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Saved Properties Drawer */}
      {isFavoritesDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm">
          <div className="bg-[#131A26] border-l border-white/20 w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-serif font-medium tracking-wide">Saved Homes ({favorites.length})</h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Compare and inquire on your favorites</p>
              </div>
              <button 
                onClick={() => setIsFavoritesDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white hover:text-black transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {favoritedPropertiesList.length === 0 ? (
                <div className="text-center py-20 text-gray-400 text-xs uppercase tracking-wider">
                  No saved homes yet.<br/>Click the heart icon on any listing to save it here.
                </div>
              ) : (
                favoritedPropertiesList.map((p) => (
                  <div key={p.id} className="bg-black/40 border border-white/10 rounded-xl p-4 flex flex-col gap-3">
                    <div className="flex items-center space-x-3">
                      <img src={p.images?.[0]} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] text-gray-400 uppercase tracking-widest block truncate">{p.county} — {p.location}</span>
                        <h4 className="text-sm font-serif font-medium text-white truncate">{p.title}</h4>
                        <span className="text-xs font-semibold text-emerald-400">KES {p.price.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2 pt-2 border-t border-white/5">
                      <button 
                        onClick={() => { setSelectedProperty(p); setActiveImageIndex(0); setIsFavoritesDrawerOpen(false); }}
                        className="flex-1 py-2 bg-white/10 hover:bg-white hover:text-black text-white text-[11px] font-semibold uppercase rounded transition border border-white/20"
                      >
                        View Details
                      </button>
                      <button 
                        onClick={() => toggleFavorite(p.id)}
                        className="px-3 py-2 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white text-[11px] font-semibold uppercase rounded transition border border-red-500/30"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {favoritedPropertiesList.length > 0 && (
              <div className="p-6 border-t border-white/10 bg-black/20">
                <button 
                  onClick={() => {
                    const titles = favoritedPropertiesList.map(p => `• ${p.title} (${p.location}) - KES ${p.price.toLocaleString()}`).join('%0A');
                    const utmTag = utmData.source ? `%0A%0A[Ad Source: ${utmData.source} | Medium: ${utmData.medium} | Campaign: ${utmData.campaign}]` : '';
                    const msg = encodeURIComponent(`Hello Avenue Properties Limited, I would like to inquire about these saved homes for comparison:%0A${titles}${utmTag}`);
                    window.open(`https://wa.me/254700000000?text=${msg}`, '_blank');
                  }}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-wider text-xs rounded transition shadow-lg flex items-center justify-center space-x-2"
                >
                  <span>Inquire All Saved via WhatsApp</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Property Details Modal (With Calendar Date Picker & Status Badge) */}
      {selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-[#131A26] border border-white/20 rounded-2xl max-w-3xl w-full h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col">
            <button onClick={() => setSelectedProperty(null)} className="sticky top-4 right-4 z-30 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-white hover:text-black transition ml-auto mr-4 mt-4">✕</button>
            
            <div className="px-8 pb-8 -mt-4 space-y-6">
              {/* Photo Section */}
              <div className="relative h-72 md:h-96 w-full bg-black rounded-xl overflow-hidden shadow-lg">
                <img 
                  src={selectedProperty.images?.[activeImageIndex] || selectedProperty.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800'} 
                  alt={selectedProperty.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 flex gap-2">
                  <span className="bg-black/70 backdrop-blur-md px-3 py-1 rounded text-xs uppercase tracking-widest">{selectedProperty.listingType}</span>
                  <span className="bg-emerald-600/90 backdrop-blur-md px-3 py-1 rounded text-xs uppercase tracking-widest font-semibold">{selectedProperty.status || 'Available'}</span>
                </div>
                <span className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md px-3 py-1 rounded text-xs uppercase tracking-widest text-gray-300">Photo {activeImageIndex + 1} of {selectedProperty.images?.length || 1}</span>
              </div>

              {selectedProperty.images && selectedProperty.images.length > 1 && (
                <div className="flex space-x-3 overflow-x-auto pb-2">
                  {selectedProperty.images.map((imgUrl, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 transition ${activeImageIndex === idx ? 'border-white scale-105 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    >
                      <img src={imgUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              <div>
                <p className="text-xs text-gray-400 tracking-widest uppercase mb-1">{selectedProperty.county} — {selectedProperty.location}</p>
                <h3 className="text-2xl font-serif font-medium mb-3">{selectedProperty.title}</h3>
                <p className="text-xl font-semibold text-white mb-6">KES {selectedProperty.price.toLocaleString()}</p>
                
                <div className="flex items-center space-x-6 text-xs text-gray-300 border-y border-white/10 py-4 mb-6">
                  <span>🛏 {selectedProperty.bedrooms} Bedrooms</span>
                  <span>🛁 {selectedProperty.bathrooms} Bathrooms</span>
                  <span>📍 {selectedProperty.location}</span>
                </div>

                <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-2">Description</h4>
                <p className="text-gray-300 text-sm leading-relaxed font-light mb-6">{selectedProperty.description}</p>
              </div>

              {/* Neighborhood Map Preview */}
              <div>
                <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-2">Neighborhood Map Location</h4>
                <div className="w-full h-48 rounded-xl overflow-hidden border border-white/10 bg-black/40">
                  {selectedProperty.mapEmbedUrl ? (
                    <iframe 
                      src={selectedProperty.mapEmbedUrl} 
                      width="100%" 
                      height="100%" 
                      style={{ border: 0 }} 
                      allowFullScreen={false} 
                      loading="lazy" 
                      title="Property Location Map"
                    />
                  ) : (
                    <iframe 
                      width="100%" 
                      height="100%" 
                      style={{ border: 0 }} 
                      loading="lazy" 
                      title="Property Location Map"
                      src={`https://www.openstreetmap.org/export/embed.html?layer=mapnik&marker=${encodeURIComponent(selectedProperty.location + ', ' + selectedProperty.county)}`}
                    />
                  )}
                </div>
                <div className="mt-2 text-right">
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedProperty.location + ' ' + selectedProperty.county)}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-[11px] text-gray-400 hover:text-white uppercase tracking-widest transition"
                  >
                    View larger map on Google Maps ↗
                  </a>
                </div>
              </div>

              {/* Client Tour / Booking Request Form with Calendar Picker */}
              <div className="bg-[#1A2333] border border-white/15 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-base">📅</span>
                  <div>
                    <h4 className="text-xs uppercase tracking-widest text-white font-bold">Schedule a Property Viewing</h4>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">Select your preferred date from the calendar</p>
                  </div>
                </div>

                {bookingSubmitted ? (
                  <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-4 text-center">
                    <p className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">Tour Request Confirmed!</p>
                    <p className="text-[11px] text-gray-300 mt-1">Opening WhatsApp to finalize your viewing appointment with an agent...</p>
                  </div>
                ) : (
                  <form onSubmit={(e) => handleBookingSubmit(e, selectedProperty)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1">Your Full Name</label>
                        <input 
                          type="text" 
                          required 
                          value={bookingName}
                          onChange={(e) => setBookingName(e.target.value)}
                          placeholder="e.g. John Doe" 
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-white/40"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1">Phone Number</label>
                        <input 
                          type="tel" 
                          required 
                          value={bookingPhone}
                          onChange={(e) => setBookingPhone(e.target.value)}
                          placeholder="e.g. 0712345678" 
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-white/40"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1">Preferred Viewing Date (Select from Calendar)</label>
                      <input 
                        type="date" 
                        required 
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white/40 cursor-pointer"
                        style={{ colorScheme: 'dark' }}
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="w-full py-3 bg-white/10 hover:bg-white hover:text-black text-white font-bold uppercase tracking-wider text-xs rounded-lg transition border border-white/20 shadow"
                    >
                      Confirm Tour Request via WhatsApp
                    </button>
                  </form>
                )}
              </div>

              <button onClick={() => openWhatsApp(selectedProperty)} className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-wider text-xs rounded-xl transition shadow-lg flex items-center justify-center space-x-2">
                <span>Chat with Agent on WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Login Modal */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#131A26] border border-white/20 rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl relative p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-serif font-medium tracking-wide uppercase">Admin Portal Login</h3>
              <button onClick={() => setIsAdminModalOpen(false)} className="w-6 h-6 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white hover:text-black transition text-xs">✕</button>
            </div>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1">Passcode</label>
                <input type="password" required value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="Enter admin passcode" className="w-full bg-black/40 border border-white/10 rounded px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-white/40" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-white text-[#0B0F17] hover:bg-gray-100 font-bold uppercase tracking-wider text-xs rounded transition shadow">Login as Admin</button>
            </form>
          </div>
        </div>
      )}

      {/* Management Dashboard Modal */}
      {isManageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#131A26] border border-white/20 rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-serif font-medium tracking-wide">Property Management Dashboard</h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Edit complete listings or remove outdated properties</p>
              </div>
              <button onClick={() => setIsManageModalOpen(false)} className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white hover:text-black transition">✕</button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {properties.length === 0 ? (
                <p className="text-center text-xs text-gray-400 uppercase py-8">No properties found in database.</p>
              ) : (
                properties.map((p) => (
                  <div key={p.id} className="bg-black/40 border border-white/10 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-4 w-full md:w-auto">
                      <img src={p.images?.[0]} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase tracking-widest block">{p.county} — {p.location} ({p.listingType}) • Status: {p.status || 'Available'}</span>
                        <h4 className="text-sm font-serif font-medium text-white">{p.title}</h4>
                        <span className="text-xs font-semibold text-emerald-400">KES {p.price.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
                      <button onClick={() => startEditing(p)} className="px-3 py-1.5 bg-white/10 hover:bg-white hover:text-black text-white text-[11px] font-semibold uppercase rounded transition border border-white/20">Edit Property</button>
                      <button onClick={() => handleDeleteProperty(p.id)} className="px-3 py-1.5 bg-red-600/80 hover:bg-red-600 text-white text-[11px] font-semibold uppercase rounded transition">Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Property Modal (With Status Selector) */}
      {editingProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="bg-[#131A26] border border-white/20 rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-lg font-serif font-medium tracking-wide">Edit Listing: {editingProperty.title}</h3>
              <button onClick={() => setEditingProperty(null)} className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white hover:text-black transition">✕</button>
            </div>

            <form onSubmit={handleUpdateProperty} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1">Property Title</label>
                <input type="text" required value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white/40" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1">Listing Type</label>
                  <select value={editListingType} onChange={(e) => setEditListingType(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white/40">
                    <option value="Short Term" className="bg-[#131A26]">Short Term</option>
                    <option value="Long Term" className="bg-[#131A26]">Long Term</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1">Property Status</label>
                  <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white/40">
                    <option value="Available" className="bg-[#131A26]">Available</option>
                    <option value="Booked" className="bg-[#131A26]">Booked</option>
                    <option value="Rented" className="bg-[#131A26]">Rented</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1">Price (KES)</label>
                  <input type="number" required value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white/40" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1">County</label>
                  <input type="text" required value={editCounty} onChange={(e) => setEditCounty(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white/40" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1">Location</label>
                  <input type="text" required value={editLocation} onChange={(e) => setEditLocation(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white/40" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1">Bedrooms</label>
                  <input type="number" required value={editBedrooms} onChange={(e) => setEditBedrooms(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white/40" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1">Bathrooms</label>
                  <input type="number" required value={editBathrooms} onChange={(e) => setEditBathrooms(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white/40" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1">Google Maps Embed URL (Optional)</label>
                <input type="text" value={editMapUrl} onChange={(e) => setEditMapUrl(e.target.value)} placeholder="e.g. https://www.google.com/maps/embed?pb=..." className="w-full bg-black/40 border border-white/10 rounded px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-white/40" />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1">Update Photos (Select Multiple)</label>
                <input type="file" multiple accept="image/png, image/jpeg" onChange={handleEditMultipleImagesChange} className="w-full bg-black/40 border border-white/10 rounded px-4 py-2 text-xs text-gray-300 file:mr-4 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-white file:text-[#0B0F17] hover:file:bg-gray-200 cursor-pointer" />
                {editImagePreviews.length > 0 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                    {editImagePreviews.map((img, i) => (
                      <div key={i} className="relative w-20 h-16 rounded-lg overflow-hidden border border-white/20 flex-shrink-0">
                        <img src={img} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1">Description</label>
                <textarea rows={3} required value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white/40" />
              </div>

              <div className="flex space-x-3 pt-2">
                <button type="button" onClick={() => setEditingProperty(null)} className="w-1/2 py-3 bg-white/10 hover:bg-white/20 text-white font-bold uppercase tracking-wider text-xs rounded transition">Cancel</button>
                <button type="submit" className="w-1/2 py-3 bg-white text-[#0B0F17] hover:bg-gray-100 font-bold uppercase tracking-wider text-xs rounded transition shadow-lg">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Property Modal */}
      {isListModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#131A26] border border-white/20 rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-lg font-serif font-medium tracking-wide">Add Property Gallery (Admin)</h3>
              <button onClick={() => setIsListModalOpen(false)} className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white hover:text-black transition">✕</button>
            </div>

            <form onSubmit={handleCreateProperty} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1">Property Title</label>
                <input type="text" required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g. Executive 3-Bedroom Apartment" className="w-full bg-black/40 border border-white/10 rounded px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-white/40" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1">Listing Type</label>
                  <select value={newListingType} onChange={(e) => setNewListingType(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white/40">
                    <option value="Short Term" className="bg-[#131A26]">Short Term</option>
                    <option value="Long Term" className="bg-[#131A26]">Long Term</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1">Property Status</label>
                  <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white/40">
                    <option value="Available" className="bg-[#131A26]">Available</option>
                    <option value="Booked" className="bg-[#131A26]">Booked</option>
                    <option value="Rented" className="bg-[#131A26]">Rented</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1">Price (KES)</label>
                  <input type="number" required value={newPrice} onChange={(e) => setNewPrice(e.target.value)} placeholder="e.g. 25000" className="w-full bg-black/40 border border-white/10 rounded px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-white/40" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1">County</label>
                  <input type="text" required value={newCounty} onChange={(e) => setNewCounty(e.target.value)} placeholder="e.g. Nakuru" className="w-full bg-black/40 border border-white/10 rounded px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-white/40" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1">Location</label>
                  <input type="text" required value={newLocation} onChange={(e) => setNewLocation(e.target.value)} placeholder="e.g. Milimani" className="w-full bg-black/40 border border-white/10 rounded px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-white/40" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1">Bedrooms</label>
                  <input type="number" required value={newBedrooms} onChange={(e) => setNewBedrooms(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white/40" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1">Bathrooms</label>
                  <input type="number" required value={newBathrooms} onChange={(e) => setNewBathrooms(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white/40" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1">Google Maps Embed URL (Optional)</label>
                <input type="text" value={newMapUrl} onChange={(e) => setNewMapUrl(e.target.value)} placeholder="e.g. https://www.google.com/maps/embed?pb=..." className="w-full bg-black/40 border border-white/10 rounded px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-white/40" />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1">Upload Gallery Photos (Multiple PNG/JPEG)</label>
                <input type="file" multiple accept="image/png, image/jpeg" onChange={handleMultipleImagesChange} className="w-full bg-black/40 border border-white/10 rounded px-4 py-2 text-xs text-gray-300 file:mr-4 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-white file:text-[#0B0F17] hover:file:bg-gray-200 cursor-pointer" />
                {imagePreviews.length > 0 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                    {imagePreviews.map((img, i) => (
                      <div key={i} className="relative w-20 h-16 rounded-lg overflow-hidden border border-white/20 flex-shrink-0">
                        <img src={img} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1">Description</label>
                <textarea rows={3} required value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Describe property amenities..." className="w-full bg-black/40 border border-white/10 rounded px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-white/40" />
              </div>

              <button type="submit" className="w-full py-3 bg-white text-[#0B0F17] hover:bg-gray-100 font-bold uppercase tracking-wider text-xs rounded transition shadow-lg mt-4">Publish Gallery Listing</button>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-[11px] tracking-widest text-gray-400 uppercase gap-4">
        <p>© 2026 Avenue Properties Limited | All Rights Reserved</p>
        <button onClick={() => setIsAdminModalOpen(true)} className="text-gray-500 hover:text-white transition tracking-widest">
          {isAdminLoggedIn ? 'Admin Active (Logged In)' : 'Admin Portal Login'}
        </button>
      </footer>

    </div>
  );
}