import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/stt
 * Accepts audio (webm/wav) and returns a transcript via OpenAI Whisper.
 *
 * Body: FormData with an "audio" file field
 * Returns: { text: string }
 */

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenAI API key not configured" },
      { status: 500 }
    );
  }

  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio");

    if (!audioFile || !(audioFile instanceof Blob)) {
      return NextResponse.json(
        { error: "Missing 'audio' file in form data" },
        { status: 400 }
      );
    }

    // Forward to OpenAI Whisper
    const whisperForm = new FormData();
    whisperForm.append("file", audioFile, "audio.webm");
    whisperForm.append("model", "whisper-1");
    whisperForm.append("language", "en");

    const whisperRes = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: whisperForm,
      }
    );

    if (!whisperRes.ok) {
      const errText = await whisperRes.text();
      console.error("Whisper error:", whisperRes.status, errText);
      return NextResponse.json(
        { error: "Whisper API error", detail: errText },
        { status: whisperRes.status }
      );
    }

    const result = await whisperRes.json();
    return NextResponse.json({ text: result.text });
  } catch (err) {
    console.error("STT proxy error:", err);
    return NextResponse.json(
      { error: "Failed to transcribe audio" },
      { status: 500 }
    );
  }
}
