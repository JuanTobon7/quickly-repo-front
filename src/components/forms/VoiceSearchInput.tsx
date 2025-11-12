import { useEffect, useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { UseFormRegisterReturn, UseFormSetValue } from 'react-hook-form';
import { toast } from 'sonner';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

interface VoiceSearchInputProps {
  label: string;
  register: UseFormRegisterReturn;
  setValue: UseFormSetValue<any>;
  fieldName: string;
  placeholder?: string;
}

const VoiceSearchInput = ({
  label,
  register,
  setValue,
  fieldName,
  placeholder
}: VoiceSearchInputProps) => {
  const [localValue, setLocalValue] = useState('');

  const {
    transcript,
    listening,
    resetTranscript,
    toggleListening,
    isSupported,
    hasPermission
  } = useSpeechRecognition({
    language: 'es-ES',
    continuous: false
  });

  useEffect(() => {
    if (transcript) {
      setLocalValue(transcript);
      setValue(fieldName, transcript);
    }
  }, [transcript, setValue, fieldName]);

  const handleVoiceToggle = async () => {
    if (!isSupported) {
      // Detectar nombre del navegador para mensaje personalizado
      let browserName = 'Tu navegador';
      const userAgent = navigator.userAgent;
      
      if (userAgent.includes('OPR') || userAgent.includes('Opera')) {
        browserName = 'Opera';
      } else if (userAgent.includes('Firefox')) {
        browserName = 'Firefox';
      } else if (userAgent.includes('Edg')) {
        browserName = 'Edge';
      } else if (userAgent.includes('Chrome')) {
        browserName = 'Chrome';
      } else if (userAgent.includes('Safari')) {
        browserName = 'Safari';
      }
      
      toast.error(`${browserName} no soporta reconocimiento de voz`, {
        description: 'Por favor, usa Google Chrome o Microsoft Edge para esta función.',
        duration: 4000
      });
      return;
    }

    try {
      if (listening) {
        toggleListening();
        if (transcript) {
          toast.success('Búsqueda por voz completada', {
            description: `Buscando: "${transcript}"`
          });
        }
      } else {
        resetTranscript();
        setLocalValue('');
        setValue(fieldName, '');
        
        toast.info('Solicitando permiso del micrófono...', {
          description: 'Permite el acceso al micrófono para buscar por voz',
          duration: 2000
        });
        
        await toggleListening();
        
        toast.success('¡Escuchando!', {
          description: 'Di el nombre del producto que deseas buscar',
          duration: 3000
        });
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Error desconocido';
      
      if (errorMessage.includes('no soporta')) {
        toast.error('Navegador no compatible', {
          description: 'Prueba con Google Chrome para usar búsqueda por voz.'
        });
      } else if (errorMessage.includes('denegado')) {
        toast.error('Permiso denegado', {
          description: 'Haz clic en el candado de la barra de direcciones y permite el micrófono.'
        });
      } else if (errorMessage.includes('No se encontró')) {
        toast.error('Micrófono no detectado', {
          description: 'Conecta un micrófono e intenta nuevamente.'
        });
      } else {
        toast.error('Error al activar el micrófono', {
          description: errorMessage
        });
      }
      
      console.error('Error al activar reconocimiento de voz:', error);
    }
  };

  return (
    <div className="space-y-1">
      <label className="text-xs font-medium uppercase tracking-wide text-secondary">
        {label}
      </label>
      <div className="relative">
        <input
          {...register}
          value={localValue}
          onChange={(e) => {
            setLocalValue(e.target.value);
            register.onChange(e);
          }}
          placeholder={placeholder || 'Escribe o usa el micrófono...'}
          className="w-full rounded-lg border border-border bg-white/80 px-3 py-2 pr-10 text-sm text-secondary shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="button"
          onClick={handleVoiceToggle}
          className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 transition-all ${
            listening
              ? 'text-red-500 hover:bg-red-50 animate-pulse'
              : hasPermission === false
              ? 'text-gray-400 cursor-not-allowed'
              : !isSupported
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-primary hover:bg-primary/10 cursor-pointer'
          } ${!isSupported ? 'opacity-50' : ''}`}
          disabled={!isSupported}
          title={
            !isSupported
              ? 'Reconocimiento de voz no disponible. Usa Chrome, Edge o Safari.'
              : hasPermission === false
              ? 'Permiso de micrófono denegado. Haz clic en el candado y permite el micrófono.'
              : listening
              ? 'Haz clic para detener la grabación'
              : 'Haz clic para buscar por voz (solo Chrome/Edge/Safari)'
          }
        >
          {listening ? (
            <MicOff className="h-5 w-5" strokeWidth={2} />
          ) : (
            <Mic className="h-5 w-5" strokeWidth={2} />
          )}
        </button>
      </div>
      {!isSupported && (
        <p className="text-xs text-orange-600 font-medium">
          ⚠️ Búsqueda por voz no disponible. Usa Chrome o Edge para esta función.
        </p>
      )}
      {listening && (
        <p className="text-xs text-primary animate-pulse">
          🎤 Escuchando... Di el nombre del producto
        </p>
      )}
      {transcript && !listening && (
        <p className="text-xs text-green-600">
          ✓ Reconocido: "{transcript}"
        </p>
      )}
    </div>
  );
};

export default VoiceSearchInput;
