import { useEffect, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition as useReactSpeechRecognition } from 'react-speech-recognition';

interface UseSpeechRecognitionProps {
  onResult?: (transcript: string) => void;
  language?: string;
  continuous?: boolean;
}

// Verificar si el navegador soporta reconocimiento de voz
const checkSpeechRecognitionSupport = (): boolean => {
  const SpeechRecognitionAPI = 
    (window as any).SpeechRecognition || 
    (window as any).webkitSpeechRecognition ||
    (window as any).mozSpeechRecognition ||
    (window as any).msSpeechRecognition;
  
  return !!SpeechRecognitionAPI;
};

export const useSpeechRecognition = ({ 
  onResult, 
  language = 'es-ES',
  continuous = false 
}: UseSpeechRecognitionProps = {}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useReactSpeechRecognition();

  const isBrowserSupported = checkSpeechRecognitionSupport() && browserSupportsSpeechRecognition;

  useEffect(() => {
    if (transcript && onResult) {
      onResult(transcript);
    }
  }, [transcript, onResult]);

  const startListening = async () => {
    try {
      if (!isBrowserSupported) {
        throw new Error('Tu navegador no soporta reconocimiento de voz. Usa Chrome, Edge o Safari.');
      }

      // Primero solicitar permiso del micrófono (igual que useBarcodeScanner)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Detener el stream inmediatamente, solo necesitamos el permiso
      stream.getTracks().forEach(track => track.stop());
      
      setHasPermission(true);
      setIsInitialized(true);
      
      // Pequeño delay para asegurar que el permiso se procesó
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Luego iniciar el reconocimiento de voz
      await SpeechRecognition.startListening({ 
        language,
        continuous 
      });
    } catch (error: any) {
      console.error('Error al solicitar permiso del micrófono:', error);
      setHasPermission(false);
      
      if (error.name === 'NotAllowedError') {
        throw new Error('Permiso de micrófono denegado. Por favor, permite el acceso al micrófono.');
      } else if (error.name === 'NotFoundError') {
        throw new Error('No se encontró ningún micrófono. Conecta un micrófono e intenta de nuevo.');
      } else {
        throw new Error(error.message || 'No se pudo acceder al micrófono');
      }
    }
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
  };

  const toggleListening = async () => {
    if (listening) {
      stopListening();
    } else {
      await startListening();
    }
  };

  return {
    transcript,
    listening,
    resetTranscript,
    startListening,
    stopListening,
    toggleListening,
    browserSupportsSpeechRecognition: isBrowserSupported,
    hasPermission,
    isInitialized,
    isSupported: isBrowserSupported
  };
};
