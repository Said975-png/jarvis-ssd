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
      text: 'Привет! Меня зовут Джарвис, и я ваша ИИ-помощница. Я очень рада нашему знакомству! Расскажите, чем могу помочь с вашим проектом?',
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()

      // Озвучиваем приветствие при первом открытии
      if (ttsSupported && messages.length === 1) {
        setTimeout(async () => {
          await speakText(messages[0].text)
        }, 1000)
      }
    }
  }, [isOpen, ttsSupported])

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
          
          // Запускаем таймер на секу��ду молчания
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
        
        // Обрабатываем специфичные ошибки
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

    // Инициализация Web Speech API TTS (приоритет согласно промпту)
    const initTTS = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        setTtsSupported(true)
        speechSynthesisRef.current = window.speechSynthesis
        console.log('Web Speech API TTS is supported')

        // Инициализируем голоса
        const initVoices = () => {
          const voices = speechSynthesisRef.current?.getVoices() || []
          console.log('Available voices:', voices.length)

          // Логируем доступные русские голоса
          const russianVoices = voices.filter(v => v.lang.startsWith('ru'))
          console.log('Russian voices available:', russianVoices.map(v => `${v.name} (${v.lang})`).join(', '))

          // Логируем женские голоса
          const femaleVoices = voices.filter(v =>
            v.name.toLowerCase().includes('female') ||
            v.name.toLowerCase().includes('woman') ||
            v.name.toLowerCase().includes('женский')
          )
          console.log('Female voices available:', femaleVoices.map(v => `${v.name} (${v.lang})`).join(', '))
        }

        initVoices()
        speechSynthesisRef.current.addEventListener('voiceschanged', initVoices)
      } else {
        setTtsSupported(false)
        console.log('Web Speech API TTS not supported')
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
      // Останавливаем речь при размонтировании
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

  const speakWithWebSpeech = (text: string) => {
    if (!ttsSupported || !speechSynthesisRef.current) {
      console.log('TTS not supported')
      return
    }

    // Останавливаем предыдущее воспроизведение
    if (speechSynthesisRef.current.speaking) {
      speechSynthesisRef.current.cancel()
    }

    // Очищаем текст от технических элементов
    const cleanText = cleanTextForSpeech(text)

    // Разбиваем на короткие предложения для плавной озвучки
    const sentences = splitIntoSentences(cleanText)

    setIsSpeaking(true)
    speakSentences(sentences, 0)
  }

  const cleanTextForSpeech = (text: string): string => {
    return text
      // Убираем URL
      .replace(/https?:\/\/[^\s]+/g, 'ссылка')
      // Убираем технические коды в скобках
      .replace(/\([A-Z0-9_]+\)/g, '')
      // Убираем хештеги и специальные символы
      .replace(/#\w+/g, '')
      // Убираем множественные пробелы
      .replace(/\s+/g, ' ')
      .trim()
  }

  const splitIntoSentences = (text: string): string[] => {
    // Разбиваем на предложения по знакам препинания
    return text
      .split(/[.!?]+/)
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 0)
      .map(sentence => {
        // Ограничиваем длину предложений для плавности
        if (sentence.length > 100) {
          const parts = sentence.split(/[,;:]/).map(part => part.trim()).filter(part => part.length > 0)
          return parts.length > 1 ? parts : [sentence.substring(0, 100) + '...']
        }
        return [sentence]
      })
      .flat()
  }

  const speakSentences = (sentences: string[], index: number) => {
    if (index >= sentences.length) {
      setIsSpeaking(false)
      console.log('Finished speaking all sentences')
      return
    }

    const sentence = sentences[index]
    if (!sentence) {
      speakSentences(sentences, index + 1)
      return
    }

    const synth = window.speechSynthesis
    const voices = synth.getVoices()

    // Ищем женский русский голос согласно промпту
    let voice = voices.find(v =>
      v.lang.startsWith("ru") && (
        v.name.toLowerCase().includes("female") ||
        v.name.toLowerCase().includes("женский") ||
        v.name.toLowerCase().includes("google") ||
        v.name.toLowerCase().includes("алина") ||
        v.name.toLowerCase().includes("катя")
      )
    ) || voices.find(v => v.lang.startsWith("ru"))

    // Если русского нет, берем женский английский
    if (!voice) {
      voice = voices.find(v =>
        v.lang.startsWith("en") && (
          v.name.toLowerCase().includes("female") ||
          v.name.toLowerCase().includes("woman")
        )
      )
    }

    const utterance = new SpeechSynthesisUtterance(sentence)

    if (voice) {
      utterance.voice = voice
      console.log('Selected voice:', voice.name)
    }

    // Настройки для дружелюбного женского голоса
    utterance.rate = 1 // нормальная скорость
    utterance.pitch = 1.1 // немного выше, чтобы звучало женственнее
    utterance.volume = 0.9

    utterance.onstart = () => {
      console.log('Speaking sentence:', sentence)
    }

    utterance.onend = () => {
      // Переходим к следующему предложению с небольшой паузой
      setTimeout(() => {
        speakSentences(sentences, index + 1)
      }, 200)
    }

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error)
      setIsSpeaking(false)
    }

    synth.speak(utterance)
  }

  const speakText = async (text: string) => {
    // Приоритет Web Speech API согласно промпту пользователя
    console.log('Using Web Speech API for:', text)
    speakWithWebSpeech(text)
  }

  // Оставляем функцию для совместимости, но теперь она не используется
  const fallbackToWebSpeech = (text: string) => {
    console.log('Fallback method deprecated, using main Web Speech API')
    speakWithWebSpeech(text)
  }

  const stopSpeaking = () => {
    // Останавливаем любое воспроизведение
    setIsSpeaking(false)

    // Останавливаем Web Speech API
    if (speechSynthesisRef.current && speechSynthesisRef.current.speaking) {
      speechSynthesisRef.current.cancel()
    }

    console.log('All speech stopped')
  }

  const sendMessage = (message: string) => {
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

    console.log('Sending message to chat:', userMessage.text)
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    // Имитация ответа Джарвиса
    setTimeout(() => {
      const jarvisResponses = [
        'Прекрасно! Я очень рада нашему общению. Расскажите, какой проект вас интересует? Я помогу найти идеальное решение.',
        'Замечательный вопрос! Знаете, я специализируюсь на создании умных решений для бизнеса. Что вы хотели бы обсудить?',
        'Как и��тересно! Давайте поговорим о ваших потребностях. Я уверена, мы найдём отличное решение вместе.',
        'Отлично! Мне очень нравится помогать с такими вопросами. Наши ИИ-решения действительно увеличивают продажи. Хотите узнать подробнее?',
        'Прекрасно, что вы обратились! У нас есть готовые решения для любого бизнеса. Расскажите о своих целях, и я подберу что-то идеальное.',
        'Как здорово, что мы можем пообщаться! Я всегда рада помочь с проектами. Что именно вас интересует?',
        'Замечательно! Знаете, я обожаю работать над интересными задачами. Поделитесь своими идеями, и мы их воплотим.'
      ]
      
      const randomResponse = jarvisResponses[Math.floor(Math.random() * jarvisResponses.length)]
      
      const jarvisMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        sender: 'jarvis',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, jarvisMessage])
      setIsTyping(false)

      // Озвучиваем ответ Джарвиса
      if (ttsSupported) {
        setTimeout(async () => {
          await speakText(randomResponse)
        }, 500) // Небольшая задержка перед озвучиванием
      }
    }, 1500)
  }

  const handleSendMessage = async () => {
    sendMessage(inputMessage)
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
                    ИИ-асс��стент • {isSpeaking ? 'Говорит...' : 'Онлайн'}
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

            {/* Сооб��ения */}
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
                  placeholder={isRecording ? "Говорите..." : "Напишите сообщение..."}
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
