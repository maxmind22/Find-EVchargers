import { createStation, getStations } from '@/lib/db';
import { BoundingBox, ConnectorType, StationFilter, StationStatus } from '@/lib/types';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Bounding Box
    const minLng = searchParams.get('minLng');
    const minLat = searchParams.get('minLat');
    const maxLng = searchParams.get('maxLng');
    const maxLat = searchParams.get('maxLat');

    let bounds: BoundingBox | undefined;
    if (minLng && minLat && maxLng && maxLat) {
      bounds = {
        minLng: parseFloat(minLng),
        minLat: parseFloat(minLat),
        maxLng: parseFloat(maxLng),
        maxLat: parseFloat(maxLat),
      };
    }

    // Filters
    const connectorTypesParam = searchParams.get('connectors');
    const minPowerParam = searchParams.get('minPower');
    const statusParam = searchParams.get('status');
    const isFreeParam = searchParams.get('isFree');
    const queryParam = searchParams.get('q');
    const userEmailParam = searchParams.get('userEmail');
    const userIdParam = searchParams.get('userId');

    const filters: StationFilter = {};

    if (connectorTypesParam) {
      filters.connectorTypes = connectorTypesParam.split(',') as ConnectorType[];
    }
    if (minPowerParam) {
      filters.minPowerKw = parseFloat(minPowerParam);
    }
    if (statusParam) {
      filters.status = statusParam.split(',') as StationStatus[];
    }
    if (isFreeParam === 'true') {
      filters.isFree = true;
    }
    if (queryParam) {
      filters.query = queryParam;
    }
    if (userEmailParam) {
      filters.userEmail = userEmailParam;
    }
    if (userIdParam) {
      filters.userId = userIdParam;
    }

    const stations = await getStations({ bounds, filters });

    return NextResponse.json({
      success: true,
      count: stations.length,
      data: stations,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch stations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.address || body.latitude === undefined || body.longitude === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required station fields: name, address, latitude, longitude' },
        { status: 400 }
      );
    }

    const newStation = await createStation(body);

    return NextResponse.json(
      { success: true, data: newStation },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create station' },
      { status: 500 }
    );
  }
}
