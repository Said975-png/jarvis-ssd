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
      text: 'Привет! Я Джарвис, ваш ИИ-ассистент. Как могу помочь с вашим проектом?',
      sender: 'jarvis',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isRecordingRef = useRef(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Инициализация Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'ru-RU'
      
      recognition.onstart = () => {
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
          setInputMessage(finalTranscript.trim())
          
          // Запускаем таймер на секунду молчания
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current)
          }
          
          silenceTimerRef.current = setTimeout(() => {
            if (finalTranscript.trim()) {
              stopRecording()
              // Отправляем сообщение
              setTimeout(() => {
                const messageToSend = finalTranscript.trim()
                if (messageToSend) {
                  sendMessage(messageToSend)
                }
              }, 100)
            }
          }, 1000)
        } else if (interimTranscript) {
          setInputMessage(interimTranscript.trim())
        }
      }
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsRecording(false)
        setIsListening(false)
      }
      
      recognition.onend = () => {
        setIsListening(false)
        // Перезапускаем только если запись действительно активна
        // и не была остановлена пользователем
        if (isRecordingRef.current) {
          try {
            recognition.start()
          } catch (error) {
            console.log('Failed to restart recognition:', error)
            setIsRecording(false)
            isRecordingRef.current = false
          }
        }
      }
      
      recognitionRef.current = recognition
    }
    
    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current)
      }
    }
  }, [isRecording])

  const startRecording = () => {
    if (recognitionRef.current && !isRecording) {
      setIsRecording(true)
      isRecordingRef.current = true
      setInputMessage('')
      recognitionRef.current.start()
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      setIsRecording(false)
      isRecordingRef.current = false
      setIsListening(false)
      try {
        recognitionRef.current.stop()
      } catch (error) {
        console.log('Recognition already stopped')
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current)
      }
    }
  }

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const sendMessage = (message: string) => {
    if (!message.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    // Имитация ответа Джарвиса
    setTimeout(() => {
      const jarvisResponses = [
        'Отличный вопрос! Наша команда специализируется на создании современных ИИ-решений для e-commerce.',
        'Я помогу вам создать умный интернет-магазин с персонализированными рекомендациями.',
        'Давайте обсудим ваши потребности. Какой тип проекта вас интересует?',
        'Наши ИИ-ассистенты увеличивают конверсию на 40%. Расскажу подробнее?',
        'У нас есть готовые решения для любого масштаба бизнеса. Что именно вам нужно?'
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
          {/* Эффект ч��стиц при открытии */}
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
                  <p className="chat-status">ИИ-ассис��ент • Онлайн</p>
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
                  placeholder={isRecording ? "Говорите..." : "Напишите сообщение..."}
                  className="chat-input"
                  disabled={isRecording}
                />
                <button
                  onClick={toggleRecording}
                  className={`chat-mic-button ${isRecording ? 'recording' : ''}`}
                  aria-label={isRecording ? "Остановить запись" : "Начать голосовую запись"}
                >
                  {isRecording ? <MicOff className="chat-mic-icon" /> : <Mic className="chat-mic-icon" />}
                  {isListening && <div className="mic-pulse"></div>}
                </button>
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
