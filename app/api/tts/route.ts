import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get('text');
    const rate = searchParams.get('rate') || '0.4'; // По умолчанию максимально медленная скорость

    if (!text) {
      return NextResponse.json({ error: 'Text parameter is required' }, { status: 400 });
    }

    // Динамический импорт @travisvn/edge-tts
    const { EdgeTTS } = await import('@travisvn/edge-tts');

    const voice = "ru-RU-SvetlanaNeural";

    // Создаем SSML с регулировкой скорости для максимально спокойной и медленной речи
    const ssmlText = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="ru-RU">
      <prosody rate="${rate}" pitch="+2%" volume="80%">
        <break time="500ms"/>
        ${text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\./g, '.<break time="800ms"/>').replace(/,/g, ',<break time="400ms"/>').replace(/;/g, ';<break time="600ms"/>')}
        <break time="700ms"/>
      </prosody>
    </speak>`;

    console.log(`Synthesizing text: "${text}" with voice: ${voice}, rate: ${rate}`);

    // Создаем объект для синтеза с SSML
    const tts = new EdgeTTS(ssmlText, voice);

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
    const { text, rate = '0.4' } = body; // По умолчанию максимально медленная скорость

    if (!text) {
      return NextResponse.json({ error: 'Text parameter is required' }, { status: 400 });
    }

    // Динамический импорт @travisvn/edge-tts
    const { EdgeTTS } = await import('@travisvn/edge-tts');

    const voice = "ru-RU-SvetlanaNeural";

    // Создаем SSML с регулировкой скорости для максимально спокойной и медленной речи
    const ssmlText = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="ru-RU">
      <voice name="${voice}">
        <prosody rate="${rate}" pitch="+2%" volume="80%">
          <break time="500ms"/>
          ${text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\./g, '.<break time="800ms"/>').replace(/,/g, ',<break time="400ms"/>').replace(/;/g, ';<break time="600ms"/>')}
          <break time="700ms"/>
        </prosody>
      </voice>
    </speak>`;

    console.log(`Synthesizing text: "${text}" with voice: ${voice}, rate: ${rate}`);

    // Создаем объект для синтеза с SSML
    const tts = new EdgeTTS(ssmlText, voice);

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
