import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_WHISPER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ message: 'Server configuration error: Missing API Key' }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const audio = formData.get('audio') as File | null;
    if (!audio) return NextResponse.json({ message: 'No audio file provided' }, { status: 400 });

    const tmpDir = path.join(process.cwd(), 'tmp');
    await mkdir(tmpDir, { recursive: true });
    const tmpPath = path.join(tmpDir, `audio-${Date.now()}.webm`);
    await writeFile(tmpPath, Buffer.from(await audio.arrayBuffer()));

    const whisperForm = new FormData();
    whisperForm.append('file', new Blob([await audio.arrayBuffer()], { type: audio.type }), 'audio.webm');
    whisperForm.append('model', 'whisper-1');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: whisperForm,
    });

    await unlink(tmpPath).catch(() => {});
    const data = await response.json();
    return NextResponse.json({ text: data.text });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json({ message: 'Transcription failed' }, { status: 500 });
  }
}
