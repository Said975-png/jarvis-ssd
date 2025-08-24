'use client'

import { useState } from 'react'

export default function TestTTSPage() {
  const [text, setText] = useState('Привет! Меня зовут Светлана. Я готова помочь вам с вашими вопросами.')
  const [rate, setRate] = useState('0.4') // Максимально медленная скорость по умолчанию
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const testTTS = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      console.log('Testing TTS with text:', text)
      
      const response = await fetch(`/api/tts?text=${encodeURIComponent(text)}&rate=${rate}`, {
        method: 'GET',
        headers: {
          'Accept': 'audio/mpeg'
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(`API Error: ${response.status} - ${errorData.error || response.statusText}`)
      }

      const audioBlob = await response.blob()
      console.log('Received audio blob:', audioBlob.size, 'bytes')
      
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      
      audio.onplay = () => {
        console.log('Playing SvetlanaNeural TTS audio')
      }
      
      audio.onended = () => {
        console.log('TTS playback finished')
        URL.revokeObjectURL(audioUrl)
      }
      
      audio.onerror = (err) => {
        console.error('Audio playback error:', err)
        setError('Ошибка воспроизведения аудио')
        URL.revokeObjectURL(audioUrl)
      }
      
      await audio.play()
      
    } catch (err) {
      console.error('TTS test error:', err)
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Тест ru-RU-SvetlanaNeural TTS</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="text-input" style={{ display: 'block', marginBottom: '8px' }}>
          Текст для озвучивания:
        </label>
        <textarea
          id="text-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="rate-select" style={{ display: 'block', marginBottom: '8px' }}>
          Скорость речи:
        </label>
        <select
          id="rate-select"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          style={{
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        >
          <option value="0.4">Максимально медленно (0.4x) - Рекомендуется</option>
          <option value="0.6">Очень медленно (0.6x)</option>
          <option value="0.8">Медленно (0.8x)</option>
          <option value="1.0">Нормально (1.0x)</option>
          <option value="1.2">Быстро (1.2x)</option>
          <option value="1.5">Очень быстро (1.5x)</option>
        </select>
      </div>
      
      <button
        onClick={testTTS}
        disabled={isLoading || !text.trim()}
        style={{
          padding: '10px 20px',
          backgroundColor: isLoading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          fontSize: '16px'
        }}
      >
        {isLoading ? 'Синтезирую речь...' : 'Озвучить текст'}
      </button>
      
      {error && (
        <div style={{
          marginTop: '20px',
          padding: '10px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '4px'
        }}>
          <strong>Ошибка:</strong> {error}
        </div>
      )}
      
      <div style={{ marginTop: '30px', fontSize: '14px', color: '#666' }}>
        <h3>Информация о голосе:</h3>
        <ul>
          <li><strong>Голос:</strong> ru-RU-SvetlanaNeural</li>
          <li><strong>Язык:</strong> Русский (Россия)</li>
          <li><strong>Тип:</strong> Женский нейронный голос Microsoft</li>
          <li><strong>Характеристики:</strong> Серьёзный, глубокий и уверенный с лёгким металлическим оттенком</li>
          <li><strong>Скорость по умолчанию:</strong> 0.4x (максимально медленная для спокойного восприятия)</li>
          <li><strong>Дополнительные настройки:</strong> Спокойная интонация (+2%), тихая громкость (80%), длинные паузы между фразами</li>
        </ul>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <a 
          href="/" 
          style={{ 
            color: '#007bff', 
            textDecoration: 'none',
            padding: '8px 16px',
            border: '1px solid #007bff',
            borderRadius: '4px'
          }}
        >
          ← Вернуться на главную
        </a>
      </div>
    </div>
  )
}
