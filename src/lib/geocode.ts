// Free geocoding via OpenStreetMap Nominatim — no API key required.
// Limit: ~1 req/sec; we only call it on save, for 2 cities.
export async function geocodeCity(city: string): Promise<{ lat: number; lng: number } | null> {
  if (!city?.trim()) return null;
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(city)}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    const arr = (await res.json()) as Array<{ lat: string; lon: string }>;
    if (!arr.length) return null;
    return { lat: parseFloat(arr[0].lat), lng: parseFloat(arr[0].lon) };
  } catch {
    return null;
  }
}
