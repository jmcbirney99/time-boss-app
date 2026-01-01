'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  placeholder?: string;
  className?: string;
  value?: string;
  label?: string;
}

// Type for the SpeechRecognition API (not included in standard TypeScript types)
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event & { error: string }) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    webkitSpeechRecognition: new () => SpeechRecognition;
    SpeechRecognition: new () => SpeechRecognition;
  }
}

export function VoiceInput({
  onTranscript,
  placeholder = 'Describe your progress...',
  className = '',
  value = '',
  label,
}: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localValue, setLocalValue] = useState(value);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Check for speech recognition support
  useEffect(() => {
    const supported =
      typeof window !== 'undefined' &&
      ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
    setIsSupported(supported);
  }, []);

  // Sync external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const startListening = useCallback(() => {
    if (!isSupported) return;

    setError(null);

    const SpeechRecognitionClass =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionClass();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const results = event.results;
      let transcript = '';

      for (let i = 0; i < results.length; i++) {
        transcript += results[i][0].transcript;
      }

      // Append to existing text
      const newValue = localValue ? `${localValue} ${transcript}` : transcript;
      setLocalValue(newValue);

      // Only call onTranscript for final results
      if (results[results.length - 1].isFinal) {
        onTranscript(newValue);
      }
    };

    recognition.onerror = (event: Event & { error: string }) => {
      console.error('Speech recognition error:', event.error);
      setError(getErrorMessage(event.error));
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSupported, localValue, onTranscript]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
      onTranscript(newValue);
    },
    [onTranscript]
  );

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div className="relative">
        <textarea
          value={localValue}
          onChange={handleTextChange}
          placeholder={placeholder}
          rows={3}
          className={`
            w-full px-3 py-2 pr-12
            text-sm border border-gray-300 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent
            resize-none
            ${isListening ? 'border-sage-500 ring-2 ring-sage-200' : ''}
          `}
        />

        {isSupported && (
          <button
            type="button"
            onClick={toggleListening}
            className={`
              absolute right-2 top-2
              p-2 rounded-lg transition-colors
              ${
                isListening
                  ? 'bg-coral text-white animate-pulse'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
            title={isListening ? 'Stop listening' : 'Start voice input'}
          >
            <MicrophoneIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs text-coral-500">{error}</p>
      )}

      {!isSupported && (
        <p className="text-xs text-gray-500">
          Voice input not supported in this browser. Please type your response.
        </p>
      )}

      {isListening && (
        <p className="text-xs text-sage-600 flex items-center gap-1">
          <span className="inline-block w-2 h-2 bg-coral rounded-full animate-pulse" />
          Listening...
        </p>
      )}
    </div>
  );
}

function MicrophoneIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
      />
    </svg>
  );
}

function getErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'not-allowed':
      return 'Microphone access denied. Please allow microphone access to use voice input.';
    case 'no-speech':
      return 'No speech detected. Please try again.';
    case 'audio-capture':
      return 'No microphone found. Please check your audio settings.';
    case 'network':
      return 'Network error. Please check your connection.';
    case 'aborted':
      return 'Voice input was cancelled.';
    default:
      return `Voice input error: ${errorCode}`;
  }
}
