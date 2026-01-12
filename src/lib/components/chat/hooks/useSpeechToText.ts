/// <reference types="../types/speech" />
import { useCallback, useRef, useState } from 'react';

export const useSpeechToText = ({ lang = 'en-us' } = {}) => {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [text, setText] = useState('');
  const [listening, setListening] = useState(false);

  const isSupported =
    typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const start = useCallback(() => {
    if (!isSupported || listening) return;

    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const result = e.results[0][0].transcript;
      setText(result);
      setListening(false);
    };

    recognition.onerror = () => {
      recognition.stop();
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSupported, listening, lang]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  return { start, stop, text, listening, isSupported };
};
