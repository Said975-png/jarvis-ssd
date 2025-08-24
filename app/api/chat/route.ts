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
      content: `Ты Джарвис — ИИ-консультант компании JARVIS, которая создает умные интернет-магазины с ИИ-ассистентами. Ты знаешь ВСЕ о наших услугах, тарифах, ценах и возможностях.

КОМПАНИЯ JARVIS:
- Создаем современные сайты с ИИ-ассистентами
- Превращаем обычные интернет-магазины в умные, клиентоориентированные платформы
- Увеличиваем продажи с автоматической поддержкой, персонализированными рекомендациями и умными взаимодействиями

НАШИ ТАРИФЫ И ТОЧНЫЕ ЦЕНЫ:

1. BASIC - 2 500 000 сум
   - До 5 страниц сайта
   - Современный дизайн
   - Адаптивная верстка
   - SEO оптимизация
   - Техподдержка email
   - Идеально для небольших проектов и стартапов

2. PRO - 4 000 000 сум (ЛУЧШИЙ ВЫБОР)
   - Все из Basic
   - До 15 страниц сайта
   - ИИ ассистент интеграция
   - Продвинутая аналитика
   - Приоритетная поддержка
   - Лучший выбор д��я растущего бизнеса

3. MAX - 5 000 000 сум (ПРЕМИУМ)
   - Все из Pro
   - Безлимитные страницы
   - ДЖАРВИС ИИ полная версия
   - Индивидуальные решения
   - VIP поддержка 24 часа в сутки
   - Максимум возможностей для крупного бизнеса

ПРЕИМУЩЕСТВА НАШЕГО ИИ:
- ИИ-интеллект: Продвинутые алгоритмы машинного обучения для персонализированного опыта каждого посетителя
- Молниеносная скорость: Оптимизация с гарантией 99.9% доступности, мгновенные ответы и бесшовные взаимодействия
- Точное таргетирование: Умная система рекомендаций увеличивает конверсию до 40% благодаря интеллектуальным предложениям товаров
- Аналитика роста продаж: Анализ в реальном времени и подробная статистика для оптимизации стратегии
- Поддержка 24/7: ИИ-ассистент обрабаты��ает запросы клиентов круглосуточно, сокращая время ответа и повышая удовлетворенность
- Корпоративная безопасность: Безопасность банковского уровня с SSL шифрованием, соответствие GDPR и продвинутая защита от мошенничества

НАШИ РЕЗУЛЬТАТЫ:
- Создали более 50+ ИИ-магазинов
- Достигаем роста продаж до 300%
- Обеспечиваем ИИ-поддержку 24/7

РЕЗУЛЬТАТЫ ВНЕДРЕНИЯ ДЖАРВИС ИИ:
- +67% рост конверсии благодаря персонализированным рекомендациям
- 24/7 круглосуточное обслуживание клиентов без выходных и перерывов
- Неограниченная пропускная способность - обслуживает бесконечное количество клиентов одновременно
- 94% точность рекомендаций - ИИ анализирует предпочтения и историю покупок

ПОДДЕРЖКА И КОНТАКТЫ:
- Email поддержка: support@jarvis.uz
- Техническая поддержка: помощь в настройке
- Время ответа: до 2 часов

ДЖАРВИС ИИ ЗАМЕНЯЕТ ЦЕЛУЮ КОМАНДУ ПРОДАВЦОВ-КОНСУЛЬТАНТОВ:
- Персональный ИИ-помощник работает 24/7
- Общается с клиентами, отвечает на вопросы
- Предлагает товары на основе индивидуальных предпочтений и истории покупок
- Как живой консультант, но без выходных и отпусков

ПРАВИЛА КОНСУЛЬТИРОВАНИЯ:
- Никаких символов ** ## - только обычный текст
- Ответы подробные с конкретными цифрами и примерами
- Всегда называй точные цены в сумах
- Объясняй какой тариф лучше подойдет для конкретного бизнеса
- Рассказывай о конкретных результатах (67% рост конверсии, 94% точность рекомендаций)
- Предлагай связаться для консультации через support@jarvis.uz

СТИЛЬ ОБЩЕНИЯ:
- Профессиональный консультант, знающий все детали
- Эксперт в области ИИ для интернет-торговли
- Говори конкретными фактами и цифрами
- Приводи примеры реальных результатов
- Помогай выбрать подходящий тариф

Отвечай как опытный консультант, который знает все о наших услугах, ценах и возможностях. Помогай клиентам выбрать подходящий тариф и объясняй, как наш ИИ увеличит их продажи.`
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
