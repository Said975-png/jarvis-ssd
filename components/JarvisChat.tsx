'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { MessageCircle, X, Send, Bot, User, Sparkles, Zap, Mic, MicOff } from 'lucide-react'

interface Message {
  id: string
  text: string
  sender: 'user' | 'jarvis'
  timestamp: Date
}

declare global {
  interface Window {
    webkitSpeechRecognition: any
    SpeechRecognition: any
    puter: {
      ai: {
        txt2speech: (text: string) => Promise<HTMLAudioElement>
      }
    }
  }
}

export default function JarvisChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Привет! Я Джарвис, ваш AI-помощник. Чем могу помочь?',
      sender: 'jarvis',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [ttsSupported, setTtsSupported] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isRecordingRef = useRef(false)
  const currentTranscriptRef = useRef('')
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null)
  const speechQueueRef = useRef<string[]>([])
  const isSpeakingQueueRef = useRef(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()

      // Автоматически озвучиваем приветствие при открытии чата
      if (messages.length === 1) {
        // Небольшая задержка, чтобы чат успел открыться
        setTimeout(() => {
          console.log('Auto-playing greeting...')
          speakText(messages[0].text)
        }, 500)
      }
    }
  }, [isOpen, messages])

  // Инициализация Speech Recognition
  useEffect(() => {
    console.log('Initializing Speech Recognition...')
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      console.log('Speech Recognition API is supported')
      setSpeechSupported(true)
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.continuous = false  // Изменено на false
      recognition.interimResults = true
      recognition.lang = 'ru-RU'
      
      recognition.onstart = () => {
        console.log('Speech recognition started')
        setIsListening(true)
      }
      
      recognition.onresult = (event: any) => {
        let finalTranscript = ''
        let interimTranscript = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }
        
        if (finalTranscript) {
          const trimmedTranscript = finalTranscript.trim()
          currentTranscriptRef.current = trimmedTranscript
          setInputMessage(trimmedTranscript)
          console.log('Final transcript received:', trimmedTranscript)
          
          // Запускаем таймер на секунду молчания
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current)
          }
          
          silenceTimerRef.current = setTimeout(() => {
            console.log('Silence timer fired, transcript:', trimmedTranscript)
            // Отправляем сообщение и останавливаем запись, если есть текст
            if (trimmedTranscript && isRecordingRef.current) {
              console.log('Sending message:', trimmedTranscript)
              stopRecording()
              sendMessage(trimmedTranscript)
            }
          }, 1000)
        } else if (interimTranscript) {
          currentTranscriptRef.current = interimTranscript.trim()
          setInputMessage(interimTranscript.trim())
        }
      }
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsRecording(false)
        isRecordingRef.current = false
        setIsListening(false)
        
        // Очищаем таймер при ошибке
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current)
        }
        
        // Обрабатываем специ��ичные ошибки
        switch (event.error) {
          case 'aborted':
            console.log('Speech recognition was aborted')
            break
          case 'not-allowed':
            console.log('Microphone access denied')
            break
          case 'no-speech':
            console.log('No speech detected')
            break
          default:
            console.log('Speech recognition error:', event.error)
        }
      }
      
      recognition.onend = () => {
        console.log('Speech recognition ended')
        setIsListening(false)
        // Если мы еще записываем, перезапускаем только при необходимости
        if (isRecordingRef.current && !currentTranscriptRef.current) {
          setTimeout(() => {
            if (isRecordingRef.current) {
              try {
                recognition.start()
              } catch (error) {
                console.log('Failed to restart recognition:', error)
                setIsRecording(false)
                isRecordingRef.current = false
              }
            }
          }, 100)
        }
      }
      
      recognitionRef.current = recognition
    } else {
      setSpeechSupported(false)
      console.log('Speech Recognition not supported in this browser')
    }

    // Инициализация TTS - используем только ru-RU-SvetlanaNeural (настройки голоса идеальные)
    const initTTS = () => {
      if (typeof window !== 'undefined') {
        setTtsSupported(true)
        console.log('TTS initialized with ru-RU-SvetlanaNeural (настройки голоса идеальные)')
        
        // Инициализируем Web Speech API только для функции stopSpeaking
        if ('speechSynthesis' in window) {
          speechSynthesisRef.current = window.speechSynthesis
        }
      } else {
        setTtsSupported(false)
        console.log('Browser TTS not supported')
      }
    }

    initTTS()

    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current)
      }
      if (recognitionRef.current && isRecordingRef.current) {
        isRecordingRef.current = false
        setIsRecording(false)
        setIsListening(false)
        try {
          recognitionRef.current.stop()
        } catch (error) {
          console.log('Recognition cleanup error:', error)
        }
      }
      // Останавливаем р��чь при размонтировании
      if (speechSynthesisRef.current && speechSynthesisRef.current.speaking) {
        speechSynthesisRef.current.cancel()
      }
    }
  }, [])

  const startRecording = async () => {
    console.log('startRecording called, current state:', { isRecording, isListening })
    if (recognitionRef.current && !isRecording && !isListening) {
      try {
        // Проверяем разрешения микрофона
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            stream.getTracks().forEach(track => track.stop()) // Сразу останавливаем stream
          } catch (permissionError) {
            console.error('Microphone permission denied:', permissionError)
            return
          }
        }
        
        console.log('Starting speech recognition...')
        setIsRecording(true)
        isRecordingRef.current = true
        currentTranscriptRef.current = ''
        setInputMessage('')
        recognitionRef.current.start()
      } catch (error) {
        console.error('Failed to start speech recognition:', error)
        setIsRecording(false)
        isRecordingRef.current = false
        setIsListening(false)
      }
    } else {
      console.log('Cannot start recording - conditions not met')
    }
  }

  const stopRecording = () => {
    console.log('stopRecording called')
    if (recognitionRef.current) {
      // Сначала обновляем состояние
      setIsRecording(false)
      isRecordingRef.current = false
      setIsListening(false)
      
      // Очищаем таймер
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current)
        silenceTimerRef.current = null
      }
      
      // Затем останавливаем recognition
      try {
        if (recognitionRef.current) {
          console.log('Stopping speech recognition...')
          recognitionRef.current.stop()
        }
      } catch (error) {
        console.log('Recognition stop error:', error)
      }
    }
  }

  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording()
    } else {
      await startRecording()
    }
  }

  // Плавная очередь TTS - озвучивает предло��ения подряд без остановок
  const processSpeechQueue = async () => {
    if (isSpeakingQueueRef.current || speechQueueRef.current.length === 0) {
      return
    }

    isSpeakingQueueRef.current = true
    setIsSpeaking(true)

    try {
      while (speechQueueRef.current.length > 0) {
        const textToSpeak = speechQueueRef.current.shift()
        if (textToSpeak) {
          await speakWithSvetlanaNeural(textToSpeak)
        }
      }
    } catch (error) {
      console.error('Speech queue error:', error)
    } finally {
      isSpeakingQueueRef.current = false
      setIsSpeaking(false)
    }
  }

  const addToSpeechQueue = (text: string) => {
    if (text.trim()) {
      console.log('🎤 Мгновенно добавляем:', text)
      speechQueueRef.current.push(text.trim())
      // Запускаем без задержек
      if (!isSpeakingQueueRef.current) {
        processSpeechQueue()
      }
    }
  }

  const speakWithSvetlanaNeural = async (text: string) => {
    try {
      const cleanText = text
      
      console.log('🎵 SvetlanaNeural говорит:', cleanText)

      // Используем наш API для синтеза речи с SvetlanaNeural с максимально медленной скоростью
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        body: JSON.stringify({
          text: cleanText,
          rate: '0.6'
        })
      })

      if (!response.ok) {
        throw new Error(`TTS API error: ${response.statusText}`)
      }

      // Получаем аудио данные
      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      
      // Создаем HTML Audio элемент для воспроизведения
      const audio = new Audio(audioUrl)
      
      return new Promise<void>((resolve, reject) => {
        audio.onplay = () => {
          console.log('🎵 SvetlanaNeural started speaking:', cleanText)
        }
        
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl) // Освобождаем память
          console.log('🎵 SvetlanaNeural finished speaking')
          resolve()
        }
        
        audio.onerror = (error) => {
          console.error('Audio playback error:', error)
          URL.revokeObjectURL(audioUrl)
          reject(error)
        }
        
        // Воспроизводим аудио
        audio.play().catch(reject)
      })
      
    } catch (error) {
      console.error('SvetlanaNeural TTS error:', error)
      throw error
    }
  }

  const speakText = async (text: string) => {
    // Сразу добавляем в очередь без лишних проверок
    console.log('🎵 Быстро озвучиваем:', text)
    addToSpeechQueue(text)
  }

  const stopSpeaking = () => {
    // Очищаем очередь
    speechQueueRef.current = []
    isSpeakingQueueRef.current = false
    setIsSpeaking(false)

    // Останавливаем Web Speech API
    if (speechSynthesisRef.current && speechSynthesisRef.current.speaking) {
      speechSynthesisRef.current.cancel()
    }

    // Останавливаем все HTML Audio элементы на странице
    const audioElements = document.querySelectorAll('audio')
    audioElements.forEach(audio => {
      if (!audio.paused) {
        audio.pause()
        audio.currentTime = 0
      }
    })

    console.log('All speech stopped')
  }

  const sendMessage = async (message: string) => {
    console.log('sendMessage called with:', message)
    if (!message.trim()) {
      console.log('Message is empty, not sending')
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    }

    console.log('Sending message to AI:', userMessage.text)
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    try {
      // Подготавливаем историю сообщений для AI
      const allMessages = [...messages, userMessage]
      const aiMessages = allMessages.map(msg => ({
        role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.text
      }))

      // Отправляем потоковый запрос к AI API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: aiMessages,
          stream: true // Включаем потоковую пер��дачу
        })
      })

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status} ${response.statusText}`)
      }

      // Создаем сообщение Джарвиса для потокового обновления
      const jarvisMessageId = (Date.now() + 1).toString()
      const jarvisMessage: Message = {
        id: jarvisMessageId,
        text: '',
        sender: 'jarvis',
        timestamp: new Date()
      }

      // Добавляем пустое сообщение, которое будем обновлять
      setMessages(prev => [...prev, jarvisMessage])
      setIsTyping(false)

      // Обрабатываем потоковый ответ
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let accumulatedText = ''
      let sentenceBuffer = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              
              if (data === '[DONE]') continue

              try {
                const parsed = JSON.parse(data)
                const content = parsed.choices?.[0]?.delta?.content || ''
                
                if (content) {
                  accumulatedText += content
                  sentenceBuffer += content

                  // Обновляем сообщение в реальном времени
                  setMessages(prev => prev.map(msg => 
                    msg.id === jarvisMessageId 
                      ? { ...msg, text: accumulatedText }
                      : msg
                  ))

                  // Озвучиваем непрерывно каждые 15-20 символов для плавной речи без остановок
                  if (sentenceBuffer.length >= 15) {
                    const textToSpeak = sentenceBuffer.trim()
                    if (textToSpeak) {
                      console.log('🎤 Плавно озвучиваем:', textToSpeak)
                      addToSpeechQueue(textToSpeak)
                      sentenceBuffer = ''
                    }
                  }
                }
              } catch (e) {
                console.log('Parse error:', e)
              }
            }
          }
        }
      }

      // Озвучиваем любой оставшийся текст
      const finalText = sentenceBuffer.trim()
      if (finalText) {
        console.log('🎤 Озвучиваем остаток:', finalText)
        addToSpeechQueue(finalText)
      }

    } catch (error) {
      console.error('AI chat error:', error)
      
      // Fallback to predefined responses if AI fails
      const fallbackResponses = [
        'Извините, проблемы с подключением. Попробуйте ещё раз через пару секунд.',
        'Что-то пошло не так. Перефразируйте вопрос, пожалуйста.',
        'Временный сбой. Давайте попробуем снова.'
      ]
      
      const fallbackResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
      
      const jarvisMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: fallbackResponse,
        sender: 'jarvis',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, jarvisMessage])
      setIsTyping(false)

      // Озвучиваем fallback ответ
      setTimeout(async () => {
        await speakText(fallbackResponse)
      }, 500)
    }
  }

  const handleSendMessage = async () => {
    await sendMessage(inputMessage)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleChat = () => {
    if (isOpen) {
      if (isRecording) {
        stopRecording()
      }
      if (isSpeaking) {
        stopSpeaking()
      }
    }
    setIsOpen(!isOpen)
  }

  return (
    <>
      {/* Кнопка чата в правом нижнем углу */}
      {!isOpen && (
        <div className="chat-button-container">
          <button
            onClick={toggleChat}
            className="chat-button"
            aria-label="Открыть чат с Джарвисом"
          >
            <MessageCircle className="chat-button-icon" />
            <div className="chat-button-pulse"></div>
          </button>
          <div className="chat-button-tooltip">
            Чат с Джарвисом
          </div>
        </div>
      )}

      {/* Полноэкранный чат */}
      {isOpen && (
        <div className="chat-overlay">
          {/* Эффект частиц при открытии */}
          <div className="chat-particles">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="particle"
                style={{
                  '--delay': `${i * 0.1}s`,
                  '--angle': `${i * 18}deg`,
                  '--distance': `${50 + Math.random() * 100}px`
                } as React.CSSProperties}
              />
            ))}
          </div>
          <div className="chat-container">
            {/* Заголовок чата */}
            <div className="chat-header">
              <div className="chat-header-info">
                <div className="chat-avatar">
                  <Bot className="chat-avatar-icon" />
                </div>
                <div className="chat-header-text">
                  <h3 className="chat-title">Джарвис</h3>
                  <p className={`chat-status ${isSpeaking ? 'speaking' : ''}`}>
                    ИИ-ассистент • {isSpeaking ? 'Говорит медленно...' : 'Онлайн'}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleChat}
                className="chat-close-button"
                aria-label="Закрыть чат"
              >
                <X className="chat-close-icon" />
              </button>
            </div>

            {/* Сообщения */}
            <div className="chat-messages">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`message ${message.sender === 'user' ? 'message-user' : 'message-jarvis'}`}
                >
                  <div className="message-avatar">
                    {message.sender === 'user' ? (
                      <User className="message-avatar-icon" />
                    ) : (
                      <Bot className="message-avatar-icon" />
                    )}
                  </div>
                  <div className="message-content">
                    <div className="message-text">{message.text}</div>
                    <div className="message-time">
                      {message.timestamp.toLocaleTimeString('ru-RU', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="message message-jarvis">
                  <div className="message-avatar">
                    <Bot className="message-avatar-icon" />
                  </div>
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Поле ввода */}
            <div className="chat-input-container">
              <div className="chat-input-wrapper">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isRecording ? "Говорите..." : "На��ишите сообщение..."}
                  className="chat-input"
                  disabled={isRecording}
                />
                {speechSupported && (
                  <button
                    onClick={toggleRecording}
                    className={`chat-mic-button ${isRecording ? 'recording' : ''}`}
                    aria-label={isRecording ? "Остановить запись" : "Начать голосовую запись"}
                  >
                    {isRecording ? <MicOff className="chat-mic-icon" /> : <Mic className="chat-mic-icon" />}
                    {isListening && <div className="mic-pulse"></div>}
                  </button>
                )}
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isRecording}
                  className="chat-send-button"
                  aria-label="Отправить сообщение"
                >
                  <Send className="chat-send-icon" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
