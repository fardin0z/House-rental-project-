export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

export const DHAKA_CENTER: { lat: number; lng: number } = {
  lat: 23.8103,
  lng: 90.4125,
};

export const BANGLADESH_BBOX: [number, number, number, number] = [
  88.0844, 20.5908, 92.6727, 26.6315,
];

export const MAP_STYLE = "mapbox://styles/mapbox/streets-v12";

export function hasMapboxToken(): boolean {
  return MAPBOX_TOKEN.startsWith("pk.");
}
