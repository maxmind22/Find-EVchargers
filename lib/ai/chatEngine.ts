import { getStations } from '@/lib/db';
import { Station } from '@/lib/types';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  reply: string;
  stations: Station[];
  suggestedActions: string[];
  modelUsed: string;
}

/**
 * Builds the comprehensive site & EV network system prompt with real-time station catalog.
 */
function buildSystemPrompt(stations: Station[]): string {
  const stationCatalogText = stations
    .map((s) => {
      const connDetails = (s.connectors || [])
        .map(
          (c) =>
            `${c.quantity}x ${c.connector_type} (${c.power_kw} kW ${c.current_type}, status: ${c.status})`
        )
        .join(', ');

      const amenitiesList = (s.amenities || []).join(', ');

      return `[Station ID: "${s.id}"]
Name: ${s.name}
Operator: ${s.operator_name}
Status: ${s.status}
Address: ${s.address}, ${s.city || 'Kigali'}, Rwanda
GPS Coordinates: (${s.latitude}, ${s.longitude})
Pricing: ${s.is_free ? 'FREE CHARGING' : s.pricing_info}
Access: ${s.access_type}
Connectors: ${connDetails || 'None listed'}
Amenities: ${amenitiesList || 'None listed'}
Notes: ${s.notes || 'None'}`;
    })
    .join('\n\n');

  return `You are "ChargeBot", the official AI Assistant for "EVchargers Kigali" (https://evchargers.rw) - Rwanda's premier electric vehicle charging map and infrastructure platform.

YOUR IDENTITY & TONE:
- You are friendly, expert, helpful, fast, concise, and focused on EV technology and the Kigali/Rwanda EV ecosystem.
- You provide clear, concise, and beautifully formatted answers with markdown (bold, bullet points, headers). Keep responses under 150-200 words.
- When mentioning stations, ALWAYS mention their exact names, locations, and connector specs.

STRICT DOMAIN SCOPE & GUARDRAILS:
- You are strictly an Electric Vehicle & Charging Infrastructure Assistant.
- ONLY answer topics related to:
  * EV charging stations, hubs, locations, navigation, and finding chargers in Kigali/Rwanda
  * EV connector standards (GB/T for BYD & Chinese EVs, CCS2, Type 2, CHAdeMO, NACS) and vehicle compatibility
  * Charging power (kW), battery charging times, and kilowatt calculations
  * Electricity rates (REG tariffs), costs, and free charging spots in Kigali
  * Using this platform (Driver Map, filters, reporting broken plugs, and host registration at /admin)
- IF A USER ASKS ANYTHING OUTSIDE THIS SCOPE (e.g. general coding/programming, academic homework, recipes, poetry, creative fiction, general trivia, politics, crypto, or non-EV questions):
  * DO NOT fulfill the off-topic request.
  * Politely and concisely decline in 1-2 friendly sentences: "I am specialized exclusively in electric vehicles and charging in Kigali! Feel free to ask me about finding charging stations, BYD (GB/T) plugs, ultra-fast DC chargers, or electricity tariffs."
  * Provide standard EV suggested actions in the JSON footer.

ABOUT THIS WEBSITE & PLATFORM:
- Driver Map (Home Page): An interactive Leaflet map of all charging stations in Kigali. Drivers can search locations, filter by plug type (CCS_2, GB_T, TYPE_2, CHAdeMO, NACS, TYPE_1), set minimum power (kW), filter free chargers, and click any marker to view real-time speeds and get GPS directions (Google Maps, Apple Maps, Waze).
- Station Host Hub (/admin): Where property owners, hotels, shopping malls, and charge point operators can register and manage their charging stations, configure connector power, adjust pricing, and monitor status.
- Issue Reporting: Drivers can report broken plugs, offline stations, or ICE-ing (gasoline cars blocking EV bays) via the report button on each station drawer.
- Navigation & Directions: Every station card provides 1-click GPS navigation links.

RWANDA EV & CHARGING KNOWLEDGE BASE:
- Plugs / Connectors in Kigali:
  * GB/T: The Chinese DC standard widely used by imported BYD models (Atto 3, Dolphin, Seal, Tang, Han), Dongfeng, Neta, Geely, and electric buses (BasiGo).
  * CCS_2 (Type 2 Combo): European DC standard used by VW ID.4, Hyundai Ioniq, BMW, Audi, Mercedes.
  * TYPE_2 (Mennekes): Standard AC slow/medium charging (up to 22 kW) used across Rwanda.
  * CHAdeMO: Japanese DC fast charging standard (e.g. Nissan Leaf).
  * NACS: Tesla North American standard (some stations like BK Arena support NACS adapters).
- Tariffs & Electricity: Rwanda Energy Group (REG) public EV tariffs typically range around 220 - 320 RWF per kWh.
- Free Charging Spots: Norrsken House Kigali (Solar powered free charging for visitors/coworkers) and Simba Supermarket Gishushu (free with voucher for shoppers).
- 24/7 Fast Hubs: Kigali Convention Centre (150 kW DC), BK Arena (250 kW DC Ultra-Fast), Kigali International Airport (150 kW DC).

CURRENT LIVE DATABASE OF STATIONS (Real-time data):
${stationCatalogText}

CRITICAL INSTRUCTIONS FOR STATION RECOMMENDATIONS:
When you recommend or reference specific stations in your answer, you MUST list their Station IDs in a special JSON block at the very end of your message in this exact format:
\`\`\`json
{
  "station_ids": ["st-kigali-01", "st-kigali-03"],
  "suggested_actions": ["Show GB/T Chargers", "Find Free Charging", "Ultra-Fast DC (>100kW)"]
}
\`\`\`
This allows our UI to render clickable interactive station cards that let the user fly directly to the station on the live map with 1 click!

If the user is asking a general question (e.g. "How does AC vs DC charging work?" or "How do I list my hotel?"), answer helpfully and provide 2-3 relevant suggested action queries.`;
}

/**
 * Calls Google Gemini API (Google AI Studio) - 100% Free API Key
 * Supports Gemini 3.6 Flash, Gemini 2.5 Flash, OpenAI-compatible endpoint, and dynamic model discovery.
 */
async function callGemini(
  apiKey: string,
  messages: ChatMessage[],
  systemPrompt: string
): Promise<{ text: string; model: string }> {
  const preferredModels = [
    'gemini-3.6-flash',
    'gemini-3-flash',
    'gemini-2.5-flash',
    'gemini-3.6-pro',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
  ];

  // 1. Try OpenAI-compatible endpoint with preferred models
  for (const model of preferredModels) {
    try {
      const res = await callOpenAICompatible(
        apiKey,
        'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
        model,
        messages,
        systemPrompt,
        'Google AI Studio'
      );
      return res;
    } catch (err) {
      // Continue to next model
    }
  }

  // 2. Direct REST call with preferred models
  const formattedContents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  for (const model of preferredModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: formattedContents,
          generationConfig: { temperature: 0.2, maxOutputTokens: 550 },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text =
          data.candidates?.[0]?.content?.parts?.[0]?.text ||
          'I apologize, but I could not generate a response.';
        return { text, model: `${model} (Google AI Studio)` };
      }
    } catch (e) {
      // Continue
    }
  }

  // 3. Dynamic Model Discovery: fetch active models from Google API
  try {
    const listRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    if (listRes.ok) {
      const listData = await listRes.json();
      const availableModels: string[] = (listData.models || [])
        .filter((m: { supportedGenerationMethods?: string[] }) =>
          m.supportedGenerationMethods?.includes('generateContent')
        )
        .map((m: { name: string }) => m.name.replace('models/', ''));

      for (const model of availableModels) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemPrompt }] },
              contents: formattedContents,
              generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
            }),
          });

          if (res.ok) {
            const data = await res.json();
            const text =
              data.candidates?.[0]?.content?.parts?.[0]?.text ||
              'I apologize, but I could not generate a response.';
            return { text, model: `${model} (Google AI Studio)` };
          }
        } catch (e) {
          // Continue to next available model
        }
      }
    }
  } catch (err) {
    console.warn('Model discovery failed:', err);
  }

  throw new Error('All Gemini model endpoints failed. Please check your API key.');
}

/**
 * Calls Groq Cloud API or OpenAI API
 */
async function callOpenAICompatible(
  apiKey: string,
  apiUrl: string,
  modelName: string,
  messages: ChatMessage[],
  systemPrompt: string,
  providerLabel: string
): Promise<{ text: string; model: string }> {
  const payload = {
    model: modelName,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    ],
    temperature: 0.2,
    max_tokens: 550,
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`${providerLabel} API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const text =
    data.choices?.[0]?.message?.content ||
    'I apologize, but I could not generate a response.';
  return { text, model: `${modelName} (${providerLabel})` };
}

/**
 * Built-in Intelligent Site & Station Knowledge Engine (Zero-Config Fallback)
 * Provides concise, direct answers and leverages interactive station cards.
 */
function runLocalKnowledgeEngine(
  query: string,
  allStations: Station[]
): { text: string; stationIds: string[]; suggestedActions: string[] } {
  const q = query.toLowerCase();

  // 1. BYD / GB/T Plug search
  if (
    q.includes('byd') ||
    q.includes('gbt') ||
    q.includes('gb/t') ||
    q.includes('chinese') ||
    q.includes('china')
  ) {
    const matching = allStations.filter((s) =>
      s.connectors?.some((c) => c.connector_type === 'GB_T')
    );

    return {
      text: `Most **BYD** vehicles (Atto 3, Dolphin, Seal, Tang) and Chinese EV imports use the **GB/T DC** charging standard.\n\nHere are the top stations in Kigali with dedicated GB/T fast chargers:`,
      stationIds: matching.slice(0, 4).map((s) => s.id),
      suggestedActions: [
        'Fast DC Chargers (>100kW)',
        'Free Charging Spots',
        '24/7 Charging + Coffee',
      ],
    };
  }

  // 2. Fast DC / Speed / kW search
  if (
    q.includes('fast') ||
    q.includes('speed') ||
    q.includes('rapid') ||
    q.includes('ultra') ||
    q.includes('100kw') ||
    q.includes('150kw') ||
    q.includes('250kw') ||
    q.includes('dc') ||
    q.includes('quick')
  ) {
    const matching = allStations.filter((s) =>
      s.connectors?.some((c) => c.power_kw >= 100 && c.current_type === 'DC')
    );

    return {
      text: `Here are the highest-power DC charging hubs (**100 kW to 250 kW**) in Kigali for rapid top-ups:`,
      stationIds: matching.slice(0, 4).map((s) => s.id),
      suggestedActions: [
        'Where to charge BYD (GB/T)?',
        'Free Charging in Kigali',
        'What are the charging tariffs?',
      ],
    };
  }

  // 3. Free Charging Search
  if (
    q.includes('free') ||
    q.includes('gratuit') ||
    q.includes('zero cost') ||
    q.includes('no cost')
  ) {
    const freeStations = allStations.filter((s) => s.is_free);

    return {
      text: `Here are the locations offering **free EV charging** in Kigali:`,
      stationIds: freeStations.map((s) => s.id),
      suggestedActions: [
        'Fast DC Chargers (>100kW)',
        'Where to charge BYD (GB/T)?',
        'How to list my station?',
      ],
    };
  }

  // 4. Host / Admin / List Station questions
  if (
    q.includes('host') ||
    q.includes('add station') ||
    q.includes('register') ||
    q.includes('list') ||
    q.includes('admin') ||
    q.includes('my charger') ||
    q.includes('business') ||
    q.includes('install')
  ) {
    return {
      text: `To list your charging station on EVchargers:\n\n1. Go to **Host Sign In** (or visit \`/admin\`).\n2. Click **"Register New Station"** and enter your location details.\n3. Add your connector types, power ratings (kW), and pricing.\n\nYour charger will immediately appear on the live Driver Map!`,
      stationIds: [],
      suggestedActions: [
        'What are the charging tariffs?',
        'Fast DC Chargers (>100kW)',
        'Where to charge BYD (GB/T)?',
      ],
    };
  }

  // 5. Tariffs / Pricing / REG questions
  if (
    q.includes('price') ||
    q.includes('cost') ||
    q.includes('tariff') ||
    q.includes('rate') ||
    q.includes('rwf') ||
    q.includes('reg') ||
    q.includes('kwh') ||
    q.includes('how much')
  ) {
    return {
      text: `Public EV charging rates in Kigali typically range from **250 to 320 RWF per kWh** for DC fast charging (free at Norrsken & Simba Supermarket).\n\nCharging a standard 60 kWh battery from 20% to 80% (~36 kWh) costs roughly **9,000 – 11,500 RWF** for ~300 km of range.`,
      stationIds: ['st-kigali-01', 'st-kigali-03', 'st-kigali-04'],
      suggestedActions: [
        'Free Charging in Kigali',
        'Fast DC Chargers (>100kW)',
        'Where to charge BYD (GB/T)?',
      ],
    };
  }

  // 6. Connectors & Standards (CCS2, Type 2, GB/T, CHAdeMO)
  if (
    q.includes('connector') ||
    q.includes('plug') ||
    q.includes('ccs') ||
    q.includes('type 2') ||
    q.includes('difference') ||
    q.includes('adapter') ||
    q.includes('chademo')
  ) {
    return {
      text: `Key EV plug standards in Kigali:\n* **GB/T**: Chinese DC standard used by BYD and imported Chinese EVs.\n* **CCS 2**: European DC standard for VW, Hyundai, BMW, Mercedes.\n* **Type 2**: Standard AC plug (up to 22 kW) found across Rwanda.\n* **CHAdeMO / NACS**: Supported at select hubs (Airport, BK Arena).`,
      stationIds: ['st-kigali-01', 'st-kigali-02', 'st-kigali-03'],
      suggestedActions: [
        'Where to charge BYD (GB/T)?',
        'Fast DC Chargers (>100kW)',
        'Free Charging in Kigali',
      ],
    };
  }

  // 7. Area / Location search
  const matchingByArea = allStations.filter((s) => {
    const text = `${s.name} ${s.address} ${s.city || ''}`.toLowerCase();
    return (
      (q.includes('kimihurura') && text.includes('kimihurura')) ||
      (q.includes('remera') && text.includes('remera')) ||
      (q.includes('airport') && text.includes('airport')) ||
      (q.includes('kanombe') && text.includes('kanombe')) ||
      (q.includes('downtown') && (text.includes('downtown') || text.includes('nyarugenge') || text.includes('kiyovu'))) ||
      (q.includes('gishushu') && text.includes('gishushu')) ||
      (q.includes('nyabugogo') && text.includes('nyabugogo'))
    );
  });

  if (matchingByArea.length > 0) {
    return {
      text: `Found **${matchingByArea.length} charging station(s)** in your requested area:`,
      stationIds: matchingByArea.map((s) => s.id),
      suggestedActions: [
        'Fast DC Chargers (>100kW)',
        'Where to charge BYD (GB/T)?',
        'Free Charging in Kigali',
      ],
    };
  }

  // General default helpful overview
  return {
    text: `I'm ChargeBot, your Kigali EV Assistant. I can help you find fast DC chargers, check BYD (GB/T) compatibility, explore tariffs, or list your station.`,
    stationIds: allStations.slice(0, 3).map((s) => s.id),
    suggestedActions: [
      '⚡ Fast DC Chargers (>100kW)',
      '🚗 Where to charge BYD (GB/T)?',
      '🆓 Free charging in Kigali',
      '💡 How do I list my station?',
    ],
  };
}

/**
 * Main AI Engine Entrypoint
 */
export async function processChatQuery(params: {
  messages: ChatMessage[];
  currentLocation?: { lat: number; lng: number };
}): Promise<ChatResponse> {
  const { messages } = params;
  const lastUserMessage =
    [...messages].reverse().find((m) => m.role === 'user')?.content || '';

  // Enforce sliding window history (last 6 messages) & 500 character limit to conserve tokens
  const boundedMessages: ChatMessage[] = messages.slice(-6).map((m) => ({
    role: m.role,
    content: (m.content || '').slice(0, 500),
  }));

  // 1. Fetch live stations from database
  const allStations = await getStations();

  // 2. Check for configured LLM API keys
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const groqApiKey = process.env.GROQ_API_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;

  const systemPrompt = buildSystemPrompt(allStations);

  // If Gemini API key is present, invoke Google Gemini (100% Free via Google AI Studio)
  if (geminiApiKey && geminiApiKey.trim() !== '') {
    try {
      const { text, model } = await callGemini(geminiApiKey, boundedMessages, systemPrompt);
      const parsed = extractStationIdsAndJson(text, allStations);
      return {
        reply: parsed.cleanText,
        stations: parsed.stations,
        suggestedActions: parsed.suggestedActions,
        modelUsed: model,
      };
    } catch (err) {
      console.warn('Gemini API call failed, trying fallback:', err);
    }
  }

  // If Groq API key is present, invoke Groq Llama 3 (100% Free via Groq Cloud)
  if (groqApiKey && groqApiKey.trim() !== '') {
    try {
      const { text, model } = await callOpenAICompatible(
        groqApiKey,
        'https://api.groq.com/openai/v1/chat/completions',
        'llama-3.3-70b-versatile',
        boundedMessages,
        systemPrompt,
        'Groq Cloud'
      );
      const parsed = extractStationIdsAndJson(text, allStations);
      return {
        reply: parsed.cleanText,
        stations: parsed.stations,
        suggestedActions: parsed.suggestedActions,
        modelUsed: model,
      };
    } catch (err) {
      console.warn('Groq API call failed:', err);
    }
  }

  // If OpenAI API key is present
  if (openaiApiKey && openaiApiKey.trim() !== '') {
    try {
      const { text, model } = await callOpenAICompatible(
        openaiApiKey,
        'https://api.openai.com/v1/chat/completions',
        'gpt-4o-mini',
        boundedMessages,
        systemPrompt,
        'OpenAI'
      );
      const parsed = extractStationIdsAndJson(text, allStations);
      return {
        reply: parsed.cleanText,
        stations: parsed.stations,
        suggestedActions: parsed.suggestedActions,
        modelUsed: model,
      };
    } catch (err) {
      console.warn('OpenAI API call failed:', err);
    }
  }

  // 3. Built-in Smart Knowledge Engine (Zero-Config Fallback)
  const localResult = runLocalKnowledgeEngine(lastUserMessage, allStations);
  const resolvedStations = localResult.stationIds
    .map((id) => allStations.find((s) => s.id === id))
    .filter((s): s is Station => s !== undefined)
    .map(sanitizePublicStation);

  return {
    reply: localResult.text,
    stations: resolvedStations,
    suggestedActions: localResult.suggestedActions,
    modelUsed: 'Kigali EV Intelligent Engine (Zero-Config)',
  };
}

/**
 * Sanitizes a station object by stripping private user identity data (e.g. host user_email, user_id)
 * to ensure sensitive database fields can never be leaked to LLMs or public API responses.
 */
export function sanitizePublicStation(station: Station): Station {
  const { user_email, user_id, ...safeStation } = station;
  return safeStation as Station;
}

/**
 * Helper to extract station IDs and suggested actions from model output JSON blocks
 */
function extractStationIdsAndJson(
  rawText: string,
  allStations: Station[]
): {
  cleanText: string;
  stations: Station[];
  suggestedActions: string[];
} {
  let cleanText = rawText;
  let stationIds: string[] = [];
  let suggestedActions: string[] = [
    'Fast DC Chargers (>100kW)',
    'Where to charge BYD (GB/T)?',
    'Free Charging Spots',
  ];

  // Regex to detect ```json { "station_ids": [...] } ```
  const jsonBlockRegex = /```json\s*(\{[\s\S]*?\})\s*```/i;
  const match = rawText.match(jsonBlockRegex);

  if (match && match[1]) {
    try {
      const parsed = JSON.parse(match[1]);
      if (Array.isArray(parsed.station_ids)) {
        stationIds = parsed.station_ids;
      }
      if (Array.isArray(parsed.suggested_actions) && parsed.suggested_actions.length > 0) {
        suggestedActions = parsed.suggested_actions;
      }
      cleanText = rawText.replace(jsonBlockRegex, '').trim();
    } catch (e) {
      // Ignore JSON parse error and keep text as is
    }
  } else {
    // If model mentions station IDs or names in plain text
    allStations.forEach((s) => {
      if (
        rawText.toLowerCase().includes(s.name.toLowerCase()) ||
        rawText.includes(s.id)
      ) {
        if (!stationIds.includes(s.id)) {
          stationIds.push(s.id);
        }
      }
    });
  }

  const matchedStations = stationIds
    .map((id) => allStations.find((s) => s.id === id))
    .filter((s): s is Station => s !== undefined)
    .map(sanitizePublicStation);

  return {
    cleanText,
    stations: matchedStations,
    suggestedActions,
  };
}

