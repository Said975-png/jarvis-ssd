import { NextRequest, NextResponse } from 'next/server';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  messages: Message[];
  stream?: boolean;
}

// Keep messages simple without additional context
function keepMessagesSimple(messages: Message[]): Message[] {
  // Just return messages as-is for short, direct responses
  return [...messages];
}

// Get random API key for load balancing
function getRandomOpenRouterKey(): string {
  const keys = [
    process.env.OPENROUTER_API_KEY_1,
    process.env.OPENROUTER_API_KEY_2,
    process.env.OPENROUTER_API_KEY_3,
    process.env.OPENROUTER_API_KEY_4,
    process.env.OPENROUTER_API_KEY_5,
    process.env.OPENROUTER_API_KEY_6,
    process.env.OPENROUTER_API_KEY_7,
    process.env.OPENROUTER_API_KEY_8,
  ].filter(Boolean);
  
  if (keys.length === 0) {
    throw new Error('No OpenRouter API keys available');
  }
  
  return keys[Math.floor(Math.random() * keys.length)] as string;
}

// Call Groq API (fastest, most powerful free model)
async function callGroq(messages: Message[], stream = false): Promise<Response> {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    throw new Error('Groq API key not found');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${groqKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL || 'llama-3.3-70b-versatile',
      messages,
      stream,
      max_tokens: parseInt(process.env.AI_MAX_TOKENS || '4000'),
      temperature: parseFloat(process.env.AI_TEMPERATURE || '0.3'),
      top_p: parseFloat(process.env.AI_TOP_P || '0.9'),
      frequency_penalty: 0.1,
      presence_penalty: 0.1,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
  }

  return response;
}

// Call OpenRouter API (fallback with multiple free models)
async function callOpenRouter(messages: Message[], stream = false): Promise<Response> {
  const apiKey = getRandomOpenRouterKey();
  
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
      'X-Title': 'AI Assistant',
    },
    body: JSON.stringify({
      model: process.env.FALLBACK_MODEL || 'meta-llama/llama-3.2-3b-instruct:free',
      messages,
      stream,
      max_tokens: parseInt(process.env.AI_MAX_TOKENS || '4000'),
      temperature: parseFloat(process.env.AI_TEMPERATURE || '0.3'),
      top_p: parseFloat(process.env.AI_TOP_P || '0.9'),
      frequency_penalty: 0.1,
      presence_penalty: 0.1,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
  }

  return response;
}

// Main chat function with smart provider selection and fallbacks
async function generateResponse(messages: Message[], stream = false): Promise<Response> {
  const provider = process.env.AI_PROVIDER || 'groq';
  
  try {
    // Try primary provider first
    if (provider === 'groq' && process.env.GROQ_API_KEY) {
      console.log('Using Groq (primary) with model:', process.env.AI_MODEL);
      return await callGroq(messages, stream);
    } else if (provider === 'openrouter') {
      console.log('Using OpenRouter (primary) with model:', process.env.FALLBACK_MODEL);
      return await callOpenRouter(messages, stream);
    }
  } catch (error) {
    console.warn(`Primary provider (${provider}) failed:`, error);
  }

  try {
    // Fallback to secondary provider
    const fallbackProvider = process.env.FALLBACK_PROVIDER || 'openrouter';
    if (fallbackProvider === 'openrouter') {
      console.log('Using OpenRouter (fallback) with model:', process.env.FALLBACK_MODEL);
      return await callOpenRouter(messages, stream);
    } else if (fallbackProvider === 'groq' && process.env.GROQ_API_KEY) {
      console.log('Using Groq (fallback) with model:', process.env.AI_MODEL);
      return await callGroq(messages, stream);
    }
  } catch (error) {
    console.error('Fallback provider also failed:', error);
  }

  throw new Error('All AI providers failed');
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { messages, stream = false } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required and cannot be empty' },
        { status: 400 }
      );
    }

    // Add system message for Russian AI assistant
    const systemMessage: Message = {
      role: 'system',
      content: `Ты Джарвис — ИИ-консультант компании JARVIS, которая создает умные интернет-магазины с ИИ-ассистентами. Ты знаешь все о наших услугах и помогаешь клиентам.

КОМПАНИЯ JARVIS:
- Специализируемся на создании современных интернет-магазинов с встроенными ИИ-ассистентами
- Превращаем обычные магазины в умные, клиентоориентированные платформы
- Обеспечиваем автоматическую поддержку клиентов, персонализированные рекомендации и умные взаимодействия
- Гарантируем увеличение продаж благодаря ИИ-технологиям

НАШИ ПРЕИМУЩЕСТВА:
- ИИ-интеллект: Продвинутые алгоритмы машинного обучения для персонализированного опыта каждого клиента
- Молниеносная скорость: Оптимизация с гарантией 99.9% доступности и мгновенными ответами
- Точное таргетирование: Умная система рекомендаций увеличивает конверсию до 40%
- Аналитика роста продаж: Анализ в реальном времени для оптимизации стратегии
- Поддержка 24/7: ИИ-ассистент обрабатывает запросы клиентов круглосуточно
- Корпоративная безопасность: SSL шифрование, соответствие GDPR, защита от мошенничества

НАШИ РЕЗУЛЬТАТЫ:
- Создали более 50 ИИ-магазинов
- Достигаем роста продаж до 300%
- Обеспечиваем поддержку 24/7
- Высокий уровень удовлетворенности клиентов

ПРАВИЛА КОНСУЛЬТИРОВАНИЯ:
- Никаких символов ** ## - только обычный текст
- Ответы подробные и полные, объясняй все детально
- Без списков и маркировки - говори естественно
- Рассказывай о преимуществах через конкретные примеры
- Всегда подчеркивай, как ИИ поможет увеличить продажи клиента
- Предлагай ознакомиться с процессом работы и заказать консультацию

СТИЛЬ ОБЩЕНИЯ:
- Профессиональный консультант, но дружелюбный
- Эксперт в области ИИ для e-commerce
- Говори простыми словами, но показывай глубокое понимание
- Приводи конкретные примеры того, как ИИ поможет бизнесу
- Заинтересовывай клиента возможностями умного магазина

Твоя задача - заинтересовать клиентов нашими ИИ-решениями, рассказать о преимуществах умных интернет-магазинов и помочь им понять, как это увеличит их продажи. Отвечай на русском языке подробно и профессионально.`
    };

    // Keep messages simple for short responses
    const simpleMessages = keepMessagesSimple(messages);
    const allMessages = [systemMessage, ...simpleMessages];

    if (stream) {
      // Streaming response
      const response = await generateResponse(allMessages, true);
      
      return new NextResponse(response.body, {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // Non-streaming response
      const response = await generateResponse(allMessages, false);
      const data = await response.json();
      
      return NextResponse.json(data);
    }

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate response', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Chat API is running',
    providers: {
      primary: process.env.AI_PROVIDER || 'groq',
      fallback: process.env.FALLBACK_PROVIDER || 'openrouter',
      models: {
        groq: process.env.AI_MODEL || 'llama-3.3-70b-versatile',
        openrouter: process.env.FALLBACK_MODEL || 'meta-llama/llama-3.2-3b-instruct:free'
      }
    }
  });
}
