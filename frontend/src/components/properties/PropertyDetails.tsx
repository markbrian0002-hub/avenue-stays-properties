import React, { useState } from 'react';
import { createBooking } from '../../services/api';
import { MapPin, Bed, Bath, Users, Wifi, ShieldCheck, Car, X, Calendar, Phone, CheckCircle } from 'lucide-react';

type PropertyDetailModel = {
  id: number | string;
  title: string;
  location: string;
  county: string;
  price: number;
  listingType: 'SHORT_TERM' | 'LONG_TERM' | string;
  bedrooms: number;
  bathrooms: number;
  maxGuests?: number;
  description: string;
  amenities: string[];
  images: string[];
};

interface PropertyDetailProps {
  property: PropertyDetailModel;
  onClose: () => void;
}

export const PropertyDetail: React.FC<PropertyDetailProps> = ({ property, onClose }) => {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Calculate total price if short term and dates provided
  let calculatedTotal = property.price;
  if (property.listingType === 'SHORT_TERM' && checkIn && checkOut) {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 0) calculatedTotal = property.price * diffDays;
  }

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await createBooking({
        propertyId: String(property.id),
        guestName: name,
        guestEmail: email,
        guestPhone: phone,
        checkIn: checkIn || undefined,
        checkOut: checkOut || undefined,
        totalPrice: calculatedTotal
      });
      setSuccessMsg('Booking request submitted successfully! The host will contact you shortly.');
    } catch (err) {
      console.error('Failed to submit booking', err);
      alert('Failed to submit booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // WhatsApp Direct Link Generator (Kenya format +254)
  const whatsappNumber = "254700000000"; // Replace with your management WhatsApp number
  const whatsappMessage = encodeURIComponent(
    `Hello Avenue Stays, I am interested in inquiring about "${property.title}" located in ${property.location}, ${property.county} priced at KES ${property.price.toLocaleString()} (${property.listingType === 'SHORT_TERM' ? 'Per Night' : 'Per Month'}). Is it available?`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/80 hover:bg-white text-gray-700 p-2 rounded-full shadow-md transition-all z-10"
        >
          <X size={20} />
        </button>

        {/* Image Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-4 bg-gray-100">
          <div className="h-72 md:h-96 rounded-2xl overflow-hidden bg-gray-200">
            <img 
              src={property.images[0] || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914'} 
              alt={property.title} 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 h-72 md:h-96">
            <div className="rounded-2xl overflow-hidden bg-gray-200 h-full">
              <img src={property.images[1] || property.images[0]} alt="Property view 2" className="w-full h-full object-cover" />
            </div>
            <div className="rounded-2xl overflow-hidden bg-gray-200 h-full">
              <img src={property.images[2] || property.images[0]} alt="Property view 3" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Details Column */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide text-white ${
                property.listingType === 'SHORT_TERM' ? 'bg-amber-600' : 'bg-emerald-600'
              }`}>
                {property.listingType === 'SHORT_TERM' ? 'Short Term Stay' : 'Long Term Rental'}
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 mt-2">{property.title}</h2>
              <p className="flex items-center text-gray-500 text-sm mt-1">
                <MapPin size={16} className="mr-1 text-red-500 flex-shrink-0" />
                {property.location}, {property.county}
              </p>
            </div>

            {/* Key specs */}
            <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-100 text-gray-700">
              <div className="flex items-center space-x-2">
                <Bed className="text-blue-600" size={20} />
                <div>
                  <span className="block text-xs text-gray-400">Bedrooms</span>
                  <span className="font-bold">{property.bedrooms} Beds</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Bath className="text-blue-600" size={20} />
                <div>
                  <span className="block text-xs text-gray-400">Bathrooms</span>
                  <span className="font-bold">{property.bathrooms} Baths</span>
                </div>
              </div>
              {property.maxGuests && (
                <div className="flex items-center space-x-2">
                  <Users className="text-blue-600" size={20} />
                  <div>
                    <span className="block text-xs text-gray-400">Max Guests</span>
                    <span className="font-bold">{property.maxGuests} Guests</span>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h4 className="font-bold text-gray-900 mb-2">About this space</h4>
              <p className="text-gray-600 leading-relaxed text-sm">{property.description}</p>
            </div>

            {/* Amenities */}
            <div>
              <h4 className="font-bold text-gray-900 mb-3">Amenities</h4>
              <div className="grid grid-cols-2 gap-3">
                {property.amenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-sm text-gray-700 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Booking / Inquiry Sidebar */}
          <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200 h-fit space-y-6">
            <div>
              <span className="text-3xl font-black text-gray-900">KES {property.price.toLocaleString()}</span>
              <span className="text-xs text-gray-500 font-medium block">{property.listingType === 'SHORT_TERM' ? 'per night' : 'per month'}</span>
            </div>

            {successMsg ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-sm font-medium">
                {successMsg}
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                {property.listingType === 'SHORT_TERM' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Check-in</label>
                      <input 
                        type="date" 
                        required 
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Check-out</label>
                      <input 
                        type="date" 
                        required 
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Enter your name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Phone Number (M-Pesa)</label>
                  <input 
                    type="tel" 
                    required 
                    placeholder="07XXXXXXXX" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    placeholder="name@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="pt-2 border-t border-gray-200 flex justify-between items-center text-sm font-bold">
                  <span>Total Estimated:</span>
                  <span className="text-blue-600 text-lg">KES {calculatedTotal.toLocaleString()}</span>
                </div>

                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-blue-600/20"
                >
                  {submitting ? 'Processing...' : 'Confirm Reservation'}
                </button>
              </form>
            )}

            {/* WhatsApp Direct Inquiry Button */}
            <div className="pt-4 border-t border-gray-200">
              <a 
                href={whatsappUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-emerald-600/20"
              >
                <Phone size={18} />
                <span>Chat with Host on WhatsApp</span>
              </a>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};