// Add these types and functions to your existing api.ts file
import axios from "axios";

const API_BASE_URL = (import.meta as ImportMeta & {
  env: { VITE_API_BASE_URL?: string };
}).env.VITE_API_BASE_URL ?? "";

export interface Property {
  [key: string]: unknown;
}

export interface BookingPayload {
  propertyId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn?: string;
  checkOut?: string;
  totalPrice: number;
}

export const fetchPropertyById = async (id: string) => {
  const response = await axios.get<Property>(`${API_BASE_URL}/properties/${id}`);
  return response.data;
};

export const createBooking = async (payload: BookingPayload) => {
  const response = await axios.post(`${API_BASE_URL}/bookings`, payload);
  return response.data;
};