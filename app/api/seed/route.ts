import { resetToSeedData } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const stations = resetToSeedData();
    return NextResponse.json({
      success: true,
      message: 'Sample EV charging stations loaded successfully',
      count: stations.length,
      data: stations,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to seed data' },
      { status: 500 }
    );
  }
}
