import React from 'react';
import { MapPin, Bed, Bath, Users } from 'lucide-react';

interface Property {
  images: string[];
  title: string;
  listingType: 'SHORT_TERM' | 'LONG_TERM';
  location: string;
  county: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests?: number;
  price: number;
}

interface PropertyCardProps {
  property: Property;
  onSelect: () => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onSelect }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col">
      {/* Image container */}
      <div className="relative h-56 bg-gray-200 overflow-hidden">
        <img 
          src={property.images[0] || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914'} 
          alt={property.title} 
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
        <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide text-white ${
          property.listingType === 'SHORT_TERM' ? 'bg-amber-600' : 'bg-emerald-600'
        }`}>
          {property.listingType === 'SHORT_TERM' ? 'Short Term' : 'Long Term'}
        </span>
      </div>

      {/* Content container */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center text-gray-500 text-sm mb-1">
          <MapPin size={16} className="mr-1 text-red-500 flex-shrink-0" />
          <span className="truncate">{property.location}, {property.county}</span>
        </div>

        <h3 className="font-bold text-lg text-gray-800 mb-2 truncate">{property.title}</h3>

        <div className="flex items-center space-x-4 text-gray-600 text-sm mb-4">
          <div className="flex items-center"><Bed size={16} className="mr-1 text-gray-400" /> {property.bedrooms} Beds</div>
          <div className="flex items-center"><Bath size={16} className="mr-1 text-gray-400" /> {property.bathrooms} Baths</div>
          {property.maxGuests && (
            <div className="flex items-center"><Users size={16} className="mr-1 text-gray-400" /> {property.maxGuests} Guests</div>
          )}
        </div>

        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-2xl font-black text-gray-900">KES {property.price.toLocaleString()}</span>
            <span className="text-xs text-gray-500 block">{property.listingType === 'SHORT_TERM' ? 'per night' : 'per month'}</span>
          </div>
          <button 
            onClick={onSelect}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};