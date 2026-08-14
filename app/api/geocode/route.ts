import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  const headers = {
    'User-Agent': 'EVchargersPlatform/1.0 (contact: admin@evchargers.app)',
    'Accept-Language': 'en',
  };

  try {
    // Reverse Geocoding (Coordinates -> Address)
    if (lat && lng) {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
      const res = await fetch(url, { headers });
      if (!res.ok) {
        throw new Error(`Nominatim error: ${res.statusText}`);
      }
      const data = await res.json();
      return NextResponse.json({
        success: true,
        data: {
          display_name: data.display_name,
          address: data.display_name,
          city: data.address?.city || data.address?.town || data.address?.village || data.address?.state || 'Kigali',
          country: data.address?.country || 'Rwanda',
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
        },
      });
    }

    // Forward Geocoding (Address/Query -> Coordinates)
    if (q && q.trim().length > 0) {
      // Prioritize Rwanda / Kigali
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        q
      )}&limit=6&addressdetails=1&countrycodes=rw,ke,ug,tz`;
      const res = await fetch(url, { headers });
      if (!res.ok) {
        throw new Error(`Nominatim error: ${res.statusText}`);
      }
      const items = await res.json();
      const results = items.map((item: any) => ({
        display_name: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        city: item.address?.city || item.address?.town || item.address?.village || 'Kigali',
        country: item.address?.country || 'Rwanda',
      }));

      return NextResponse.json({
        success: true,
        data: results,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Provide either "q" or both "lat" and "lng"' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Geocoding failed' },
      { status: 500 }
    );
  }
}
