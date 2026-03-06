export const COMMUNES_COORDS: Record<string, { lat: number; lon: number }> = {
  Gombe: { lat: -4.3076, lon: 15.3136 },
  Lingwala: { lat: -4.3167, lon: 15.2983 },
  Kinshasa: { lat: -4.325, lon: 15.3222 },
  Kalamu: { lat: -4.3417, lon: 15.3 },
  Ngaba: { lat: -4.35, lon: 15.2833 },
  Lemba: { lat: -4.3833, lon: 15.3333 },
  Ndjili: { lat: -4.3667, lon: 15.4 },
  Makala: { lat: -4.3667, lon: 15.2833 },
  Selembao: { lat: -4.3833, lon: 15.2667 },
  Bumbu: { lat: -4.4, lon: 15.2833 },
  "Ngiri-Ngiri": { lat: -4.3333, lon: 15.2833 },
  Bandalungwa: { lat: -4.3333, lon: 15.2833 },
  Kintambo: { lat: -4.3167, lon: 15.2833 },
  Barumbu: { lat: -4.3083, lon: 15.3 },
  Kasavubu: { lat: -4.3333, lon: 15.3 },
  Ngaliema: { lat: -4.3, lon: 15.2667 },
  "Mont-Ngafula": { lat: -4.4167, lon: 15.2667 },
  Kimbanseke: { lat: -4.3833, lon: 15.4167 },
  Masina: { lat: -4.3667, lon: 15.4333 },
  Lubumbashi: { lat: -11.6609, lon: 27.4794 },
  Kisangani: { lat: 0.5153, lon: 25.1963 },
  Matadi: { lat: -5.8167, lon: 13.45 },
  Bukavu: { lat: -2.5083, lon: 28.8608 },
  Goma: { lat: -1.6792, lon: 29.2285 },
};

export function distanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
