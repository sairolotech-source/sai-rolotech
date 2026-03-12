export interface PlatformRating {
  platform: string;
  rating: number;
  reviewCount: string;
  profileUrl: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  placeId?: string;
}

export const GOOGLE_PLACE_ID = (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_GOOGLE_PLACE_ID) || "ChIJxxxxxxxxxxxxxxxx";

export const PLATFORM_RATINGS: Record<string, PlatformRating> = {
  indiamart: {
    platform: "IndiaMART",
    rating: 4.5,
    reviewCount: "85+ Reviews",
    profileUrl: "https://www.indiamart.com/sai-rolotech/",
    color: "#1A73E8",
    gradientFrom: "#1565C0",
    gradientTo: "#1E88E5",
  },
  tradeindia: {
    platform: "TradeIndia",
    rating: 4.3,
    reviewCount: "40+ Reviews",
    profileUrl: "https://www.tradeindia.com/sai-rolotech/",
    color: "#E65100",
    gradientFrom: "#E65100",
    gradientTo: "#FF8F00",
  },
  google: {
    platform: "Google My Business",
    rating: 4.6,
    reviewCount: "60+ Reviews",
    profileUrl: "https://www.google.com/maps/place/Sai+Rolotech/",
    color: "#4285F4",
    gradientFrom: "#4285F4",
    gradientTo: "#34A853",
    placeId: GOOGLE_PLACE_ID,
  },
};
