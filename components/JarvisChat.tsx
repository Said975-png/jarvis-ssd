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
        setTimeout(() => {
          speakText(messages[0].text)
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

    // Инициализация Text-to-Speech
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setTtsSupported(true)
      speechSynthesisRef.current = window.speechSynthesis
      console.log('Text-to-Speech API is supported')

      // Инициализируем голоса (они могут загружаться асинхронно)
      const initVoices = () => {
        const voices = speechSynthesisRef.current?.getVoices() || []
        console.log('Available voices:', voices.length)
        if (voices.length > 0) {
          console.log('Voices loaded:', voices.map(v => v.name))
        }
      }

      // Вызываем сразу и при событии voiceschanged
      initVoices()
      speechSynthesisRef.current.addEventListener('voiceschanged', initVoices)
    } else {
      setTtsSupported(false)
      console.log('Text-to-Speech not supported in this browser')
    }

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

  const speakText = (text: string) => {
    if (!ttsSupported || !speechSynthesisRef.current) {
      console.log('TTS not supported')
      return
    }

    // Останавливаем предыдущее воспроизведение если есть
    if (speechSynthesisRef.current.speaking) {
      speechSynthesisRef.current.cancel()
    }

    const utterance = new SpeechSynthesisUtterance(text)

    // Настройки для естественного женского ИИ-голоса
    utterance.rate = 0.9  // Немного медленнее для более естественного звучания
    utterance.pitch = 1.1  // Чуть выше для женского голоса
    utterance.volume = 0.8  // Комфортная громкость

    // Пытаемся найти подходящий женский голос
    const voices = speechSynthesisRef.current.getVoices()

    // Ищем русский женский голос
    let selectedVoice = voices.find(voice =>
      voice.lang.includes('ru') &&
      (voice.name.toLowerCase().includes('female') ||
       voice.name.toLowerCase().includes('woman') ||
       voice.name.toLowerCase().includes('алина') ||
       voice.name.toLowerCase().includes('катя') ||
       voice.name.toLowerCase().includes('женский'))
    )

    // Если не нашли специфичный, ищем любой русский
    if (!selectedVoice) {
      selectedVoice = voices.find(voice => voice.lang.includes('ru'))
    }

    // Если и русского нет, ищем английский женский
    if (!selectedVoice) {
      selectedVoice = voices.find(voice =>
        voice.lang.includes('en') &&
        (voice.name.toLowerCase().includes('female') ||
         voice.name.toLowerCase().includes('woman') ||
         voice.name.toLowerCase().includes('zira') ||
         voice.name.toLowerCase().includes('eva'))
      )
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice
      console.log('Selected voice:', selectedVoice.name)
    }

    utterance.onstart = () => {
      setIsSpeaking(true)
      console.log('Started speaking:', text)
    }

    utterance.onend = () => {
      setIsSpeaking(false)
      console.log('Finished speaking')
    }

    utterance.onerror = (event) => {
      setIsSpeaking(false)
      console.error('Speech synthesis error:', event.error)
    }

    speechSynthesisRef.current.speak(utterance)
  }

  const stopSpeaking = () => {
    if (speechSynthesisRef.current && speechSynthesisRef.current.speaking) {
      speechSynthesisRef.current.cancel()
      setIsSpeaking(false)
      console.log('Speech stopped')
    }
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
        'Прекра��но! Я очень рада нашему общению. Расскажите, какой проект вас интересует? Я помогу найти идеальное решение.',
        '��амечательный вопрос! Знаете, я специализируюсь на создании умных решений для бизнеса. Что вы хотели бы обсудить?',
        'Как интересно! Давайте поговорим о ваших потребностях. Я уверена, мы найдём отличное решение вместе.',
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
        setTimeout(() => {
          speakText(randomResponse)
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
                  <p className="chat-status">
                    ИИ-ассистент • {isSpeaking ? 'Говорит...' : 'Онлайн'}
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
