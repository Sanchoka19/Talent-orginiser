export interface HotelVenue {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  roomOrBallroom?: string;
  notes?: string;
  photoUrl?: string;
  travelTimeMinutes?: number;
  createdAt: string;
}
