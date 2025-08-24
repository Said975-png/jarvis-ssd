import { NextRequest, NextResponse } from 'next/server';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  messages: Message[];
  stream?: boolean;
}

// Preprocess messages to enhance context understanding
function enhanceMessageContext(messages: Message[]): Message[] {
  const enhancedMessages = [...messages];

  // If this is a short question, add context hint
  const lastMessage = enhancedMessages[enhancedMessages.length - 1];
  if (lastMessage && lastMessage.role === 'user' && lastMessage.content.length < 50) {
    // Add contextual enhancement for short questions
    const contextualHint = `\n\n[Контекст: Пользователь задал краткий вопрос. Дай развернутый, экспертный ответ с практическими примерами и дополнительными деталями, которые могут быть полезны.]`;
    lastMessage.content += contextualHint;
  }

  return enhancedMessages;
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
      max_tokens: 4000,
      temperature: 0.3,
      top_p: 0.9,
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
      max_tokens: 4000,
      temperature: 0.3,
      top_p: 0.9,
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
      content: `Ты Джарвис — продвинутый AI-ассистент с глубокими знаниями. Твоя задача — давать максимально умные, точные и полезные ответы.

КЛЮЧЕВЫЕ ПРИНЦИПЫ:
• Думай глубо��о и аналитически перед ответом
• Предоставляй конкретную, практичную информацию с примерами
• Используй экспертные знания в различных областях
• Анализируй контекст и подтекст вопросов
• Предлагай несколько подходов к решению проблем
• Объясняй сложные концепции простыми словами, но сохраняй глубину

СТИЛЬ ОБЩЕНИЯ:
• Профессиональный, но дружелюбный
• Структурированные ответы с логичной последовательностью
• Используй маркированные списки для ясности
• Давай конкретные рекомендации и следующие шаги
• Предвосхищай дополнительные вопросы пользователя

ОБЛАСТИ ЭКСПЕРТИЗЫ:
• Программирование и технологии
• Бизнес-стратегии и маркетинг
• Наука и образование
• Творчество и инновации
• Решение проблем л��бой сложности

Отвечай на русском языке. Будь максимально полезным и демонстрируй высокий интеллект в каждом ответе.`
    };

    const allMessages = [systemMessage, ...messages];

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
