import { deleteStation, getStationById, updateStation } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const station = await getStationById(id);

    if (!station) {
      return NextResponse.json(
        { success: false, error: 'Station not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: station });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch station' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const updated = await updateStation(id, body);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Station not found or update failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update station' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const deleted = await deleteStation(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Station not found or delete failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Station deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to delete station' },
      { status: 500 }
    );
  }
}
