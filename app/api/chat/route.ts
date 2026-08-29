import { NextRequest, NextResponse } from 'next/server';
import { processChatQuery, ChatMessage } from '@/lib/ai/chatEngine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, currentLocation } = body as {
      messages: ChatMessage[];
      currentLocation?: { lat: number; lng: number };
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing messages array' },
        { status: 400 }
      );
    }

    const response = await processChatQuery({
      messages,
      currentLocation,
    });

    return NextResponse.json({
      success: true,
      message: response.reply,
      stations: response.stations,
      suggestedActions: response.suggestedActions,
      modelUsed: response.modelUsed,
    });
  } catch (error) {
    console.error('API /api/chat error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process chat query',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
