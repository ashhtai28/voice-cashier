import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/tts
 * Proxies text-to-speech requests to ElevenLabs.
 * Keeps the API key server-side and streams audio back as audio/mpeg.
 *
 * Body: { text: string }
 * Returns: audio/mpeg binary stream
 */

// Use a warm, friendly voice — "Rachel" is a popular default.
// You can browse voices at https://elevenlabs.io/voice-library
const VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel
const MODEL_ID = "eleven_turbo_v2"; // low-latency model

export async function POST(req: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ElevenLabs API key not configured" },
      { status: 500 }
    );
  }

  let text: string;
  try {
    const body = await req.json();
    text = body.text;
    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Missing 'text' in request body" },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  // Cap text length to prevent abuse / huge bills
  if (text.length > 1000) {
    text = text.slice(0, 1000);
  }

  try {
    const elevenRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: MODEL_ID,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.3,
          },
        }),
      }
    );

    if (!elevenRes.ok) {
      const errText = await elevenRes.text();
      console.error("ElevenLabs error:", elevenRes.status, errText);
      return NextResponse.json(
        { error: "ElevenLabs API error", detail: errText },
        { status: elevenRes.status }
      );
    }

    // Stream the audio back to the client
    const headers = new Headers({
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-cache",
    });

    return new NextResponse(elevenRes.body, { status: 200, headers });
  } catch (err) {
    console.error("TTS proxy error:", err);
    return NextResponse.json(
      { error: "Failed to reach ElevenLabs" },
      { status: 502 }
    );
  }
}
