import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Building, Calendar } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

interface Booking {
  id: string;
  fullName: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  property?: {
    title: string;
    location: string;
  };
  createdAt: string;
}

interface AdminDashboardProps {
  properties: Property[];
  onRefresh: () => void;
  onClose: () => void;
}

interface Property {
  id: string;
  title: string;
  imageUrl: string;
  location: string;
  county: string;
  listingType: string;
  pricePerNight?: number;
  pricePerMonth?: number;
}

export function AdminDashboard({ properties, onRefresh, onClose }: AdminDashboardProps) {
  const [activeSubTab, setActiveSubTab] = useState<'PROPERTIES' | 'BOOKINGS'>('PROPERTIES');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    county: 'Nairobi',
    pricePerNight: 5000,
    pricePerMonth: 80000,
    listingType: 'SHORT_TERM',
    bedrooms: 1,
    bathrooms: 1,
    imageUrl: '',
    amenities: 'Wi-Fi, Smart TV, Hot Shower, Parking',
  });

  useEffect(() => {
    if (activeSubTab === 'BOOKINGS') {
      axios.get(`${API_BASE_URL}/bookings`)
        .then(res => setBookings(res.data))
        .catch(err => console.error('Failed to fetch bookings', err));
    }
  }, [activeSubTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formattedData = {
        ...formData,
        amenities: formData.amenities.split(',').map((a) => a.trim()),
        pricePerNight: Number(formData.pricePerNight),
        pricePerMonth: Number(formData.pricePerMonth),
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
      };

      await axios.post(`${API_BASE_URL}/properties`, formattedData);
      setIsAdding(false);
      onRefresh();
    } catch (err) {
      console.error('Failed to create property', err);
      alert('Error creating property.');
    }
  };

  const handleDeleteProperty = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await axios.delete(`${API_BASE_URL}/properties/${id}`);
        onRefresh();
      } catch (err) {
        console.error('Failed to delete property', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col border border-gray-100">
        
        {/* Header & Sub-Tab Switcher */}
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center sticky top-0 bg-white/90 backdrop-blur-md z-10 gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 text-white p-3 rounded-2xl shadow-lg shadow-blue-500/20">
              <Building size={22} />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Admin Control Center</h3>
              <p className="text-xs font-medium text-gray-500">Manage listings and client reservations</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex bg-gray-100/80 p-1.5 rounded-xl">
              <button
                onClick={() => setActiveSubTab('PROPERTIES')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeSubTab === 'PROPERTIES' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Properties
              </button>
              <button
                onClick={() => setActiveSubTab('BOOKINGS')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeSubTab === 'BOOKINGS' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Bookings
              </button>
            </div>

            {activeSubTab === 'PROPERTIES' && (
              <button 
                onClick={() => setIsAdding(!isAdding)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md shadow-blue-500/20"
              >
                <Plus size={16} />
                <span>{isAdding ? 'Cancel' : 'Add Property'}</span>
              </button>
            )}

            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2.5 rounded-xl hover:bg-gray-100 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {activeSubTab === 'PROPERTIES' ? (
            <div>
              {isAdding && (
                <form onSubmit={handleSubmit} className="bg-gray-50/80 p-6 rounded-2xl border border-gray-200/80 mb-8 space-y-4 shadow-sm animate-in fade-in duration-200">
                  <h4 className="text-base font-extrabold text-gray-900 mb-2">Create New Listing</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                      type="text" placeholder="Property Title" required
                      value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                      className="p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                    <input 
                      type="text" placeholder="Location (e.g. Westlands)" required
                      value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}
                      className="p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                    <select 
                      value={formData.listingType} onChange={e => setFormData({...formData, listingType: e.target.value})}
                      className="p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    >
                      <option value="SHORT_TERM">Short Term (Per Night)</option>
                      <option value="LONG_TERM">Long Term (Per Month)</option>
                    </select>
                    <input 
                      type="text" placeholder="County (e.g. Nairobi)" required
                      value={formData.county} onChange={e => setFormData({...formData, county: e.target.value})}
                      className="p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                    <input 
                      type="number" placeholder="Price Per Night (KES)" 
                      value={formData.pricePerNight} onChange={e => setFormData({...formData, pricePerNight: Number(e.target.value)})}
                      className="p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                    <input 
                      type="number" placeholder="Price Per Month (KES)" 
                      value={formData.pricePerMonth} onChange={e => setFormData({...formData, pricePerMonth: Number(e.target.value)})}
                      className="p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                    <input 
                      type="number" placeholder="Bedrooms" 
                      value={formData.bedrooms} onChange={e => setFormData({...formData, bedrooms: Number(e.target.value)})}
                      className="p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                    <input 
                      type="number" placeholder="Bathrooms" 
                      value={formData.bathrooms} onChange={e => setFormData({...formData, bathrooms: Number(e.target.value)})}
                      className="p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                    <input 
                      type="text" placeholder="Image URL (Unsplash link)" required
                      value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                      className="p-3 bg-white border border-gray-200 rounded-xl text-sm md:col-span-2 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                    <input 
                      type="text" placeholder="Amenities (comma separated: Wi-Fi, Pool, Gym)" 
                      value={formData.amenities} onChange={e => setFormData({...formData, amenities: e.target.value})}
                      className="p-3 bg-white border border-gray-200 rounded-xl text-sm md:col-span-2 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                    <textarea 
                      placeholder="Property Description" required rows={3}
                      value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                      className="p-3 bg-white border border-gray-200 rounded-xl text-sm md:col-span-2 outline-none focus:ring-2 focus:ring-blue-500 font-medium resize-none"
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-2">
                    <button type="button" onClick={() => setIsAdding(false)} className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-300 transition-colors">Cancel</button>
                    <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20">Save Property</button>
                  </div>
                </form>
              )}

              {/* Property Table */}
              <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
                <table className="w-full text-left border-collapse bg-white">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 text-xs uppercase tracking-wider">
                      <th className="py-3.5 px-4 font-bold">Property</th>
                      <th className="py-3.5 px-4 font-bold">Location</th>
                      <th className="py-3.5 px-4 font-bold">Type</th>
                      <th className="py-3.5 px-4 font-bold">Price</th>
                      <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {properties.map(property => (
                      <tr key={property.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="py-4 px-4 font-semibold text-gray-800 flex items-center space-x-3">
                          <img src={property.imageUrl} alt="" className="w-11 h-11 rounded-xl object-cover bg-gray-100 shadow-sm" />
                          <span className="truncate max-w-xs">{property.title}</span>
                        </td>
                        <td className="py-4 px-4 text-gray-600 font-medium">{property.location}, {property.county}</td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${property.listingType === 'SHORT_TERM' ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'}`}>
                            {property.listingType === 'SHORT_TERM' ? 'Short Term' : 'Long Term'}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-black text-gray-900">
                          KES {property.listingType === 'SHORT_TERM' ? property.pricePerNight?.toLocaleString() + ' /night' : property.pricePerMonth?.toLocaleString() + ' /mo'}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button 
                            onClick={() => handleDeleteProperty(property.id)}
                            className="text-red-500 hover:text-white p-2.5 rounded-xl hover:bg-red-600 transition-all shadow-sm"
                            title="Delete Property"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div>
              <h4 className="text-lg font-extrabold text-gray-900 mb-4">Client Reservations</h4>
              {bookings.length === 0 ? (
                <div className="text-center py-16 bg-gray-50/80 rounded-2xl border border-gray-100 shadow-sm">
                  <Calendar className="mx-auto text-gray-300 mb-3" size={40} />
                  <p className="text-sm font-bold text-gray-700">No bookings recorded yet.</p>
                  <p className="text-xs text-gray-400 mt-1">Reservations made through the frontend will appear here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
                  <table className="w-full text-left border-collapse bg-white">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 text-xs uppercase tracking-wider">
                        <th className="py-3.5 px-4 font-bold">Client</th>
                        <th className="py-3.5 px-4 font-bold">Phone</th>
                        <th className="py-3.5 px-4 font-bold">Property</th>
                        <th className="py-3.5 px-4 font-bold">Dates</th>
                        <th className="py-3.5 px-4 font-bold text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {bookings.map(booking => (
                        <tr key={booking.id} className="hover:bg-blue-50/30 transition-colors">
                          <td className="py-4 px-4 font-bold text-gray-900">{booking.fullName}</td>
                          <td className="py-4 px-4 text-gray-600 font-medium">{booking.phone}</td>
                          <td className="py-4 px-4 font-bold text-blue-600">{booking.property?.title || 'Property'}</td>
                          <td className="py-4 px-4 text-xs font-semibold text-gray-500">
                            {new Date(booking.checkIn).toLocaleDateString()} &rarr; {new Date(booking.checkOut).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4 text-right font-black text-gray-900">
                            KES {booking.totalAmount?.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}