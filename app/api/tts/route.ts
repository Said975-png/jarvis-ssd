import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get('text');
    const rate = searchParams.get('rate') || '0.95'; // Оптимальная скорость для плавной речи

    if (!text) {
      return NextResponse.json({ error: 'Text parameter is required' }, { status: 400 });
    }

    // Динамический импорт @travisvn/edge-tts
    const { EdgeTTS } = await import('@travisvn/edge-tts');

    const voice = "ru-RU-SvetlanaNeural";

    console.log(`Synthesizing text: "${text}" with voice: ${voice}, rate: ${rate}`);

    // Создаем объект для синтеза с чистым текстом (без SSML)
    const tts = new EdgeTTS(text, voice);

    // Синтезируем речь
    const result = await tts.synthesize();

    // Конвертируем аудио в Buffer
    const audioBuffer = Buffer.from(await result.audio.arrayBuffer());

    // Возвращаем аудио данные
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'inline; filename="speech.mp3"',
        'Cache-Control': 'public, max-age=3600', // Кэшируем на час
      },
    });

  } catch (error) {
    console.error('TTS synthesis error:', error);
    return NextResponse.json(
      { error: 'Failed to synthesize speech', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, rate = '0.95' } = body; // Оптимальная скорость для плавной речи

    if (!text) {
      return NextResponse.json({ error: 'Text parameter is required' }, { status: 400 });
    }

    // Динамический импорт @travisvn/edge-tts
    const { EdgeTTS } = await import('@travisvn/edge-tts');

    const voice = "ru-RU-SvetlanaNeural";

    console.log(`Synthesizing text: "${text}" with voice: ${voice}, rate: ${rate}`);

    // Создаем объект для синтеза с чистым текстом (без SSML)
    const tts = new EdgeTTS(text, voice);

    // Синтезируем речь
    const result = await tts.synthesize();

    // Конвертируем аудио в Buffer
    const audioBuffer = Buffer.from(await result.audio.arrayBuffer());

    // Возвращаем аудио данные
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'inline; filename="speech.mp3"',
        'Cache-Control': 'public, max-age=3600', // Кэшируем на час
      },
    });

  } catch (error) {
    console.error('TTS synthesis error:', error);
    return NextResponse.json(
      { error: 'Failed to synthesize speech', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
