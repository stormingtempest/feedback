import { NextRequest } from 'next/server';
import { writeFile, unlink, mkdir } from 'fs/promises';
import path from 'path';
import { ok, badRequest, handle, getAuthUser } from '@/lib/api';

export const POST = (req: NextRequest) =>
  handle(async () => {
    await getAuthUser(req);
    const apiKey = process.env.OPENAI_WHISPER_API_KEY;
    if (!apiKey) throw new Error('Server configuration error: Missing API Key');

    const formData = await req.formData();
    const audio = formData.get('audio') as File | null;
    if (!audio) badRequest('No audio file provided');

    const tmpDir = path.join(process.cwd(), 'tmp');
    await mkdir(tmpDir, { recursive: true });
    const tmpPath = path.join(tmpDir, `audio-${Date.now()}.webm`);
    await writeFile(tmpPath, Buffer.from(await audio!.arrayBuffer()));

    const whisperForm = new FormData();
    whisperForm.append('file', new Blob([await audio!.arrayBuffer()], { type: audio!.type }), 'audio.webm');
    whisperForm.append('model', 'whisper-1');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: whisperForm,
    });

    await unlink(tmpPath).catch(() => {});
    const data = await response.json();
    return ok({ text: data.text });
  });
