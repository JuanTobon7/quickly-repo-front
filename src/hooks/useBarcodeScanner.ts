import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'

export function useCameraScanner(onScan: (code: string) => void, active: boolean) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)
  const controlsRef = useRef<any>(null)
  const [status, setStatus] = useState('Esperando cámara...')

  useEffect(() => {
    if (!active) {
      // Si no está activo, detener cualquier cámara previa
      controlsRef.current?.stop()
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach(t => t.stop())
        videoRef.current.srcObject = null
      }
      setStatus('Cámara detenida')
      return
    }

    let isMounted = true

    const startScanner = async () => {
      try {
        setStatus('🔍 Solicitando permiso de cámara...')
        await navigator.mediaDevices.getUserMedia({ video: true })

        readerRef.current = new BrowserMultiFormatReader()
        const devices = await BrowserMultiFormatReader.listVideoInputDevices()

        if (devices.length === 0) {
          setStatus('❌ No se encontraron cámaras')
          return
        }

        const backCamera = devices.find(d => /back|rear|environment/i.test(d.label))
        const deviceId = backCamera?.deviceId || devices[0].deviceId

        setStatus(`📷 Usando: ${backCamera?.label || devices[0].label || 'Cámara predeterminada'}`)

        controlsRef.current = await readerRef.current.decodeFromVideoDevice(
          deviceId,
          videoRef.current!,
          (result, err) => {
            if (!isMounted) return
            if (result) {
              const text = result.getText()
              setStatus(`✅ Código detectado: ${text}`)
              onScan(text)
            } else if (err && err.name !== 'NotFoundException') {
              setStatus('Buscando código...')
            }
          }
        )
      } catch (err: any) {
        console.error('Error iniciando scanner:', err)
        setStatus(`❌ Error: ${err.message || err}`)
      }
    }

    startScanner()

    return () => {
      isMounted = false
      controlsRef.current?.stop()
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach(t => t.stop())
      }
      setStatus('Cámara detenida')
    }
  }, [active]) // 👈 solo se ejecuta cuando active cambia

  return { videoRef, status }
}
