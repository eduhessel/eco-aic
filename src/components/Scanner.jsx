import React, { useEffect, useState, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { createWorker } from 'tesseract.js'
import { supabase } from '../supabaseClient'
import { 
  Camera, 
  CheckCircle, 
  AlertCircle, 
  ScanText, 
  Loader2, 
  RefreshCw, 
  Zap, 
  SwitchCamera,
  Upload,
  XCircle,
  Play
} from 'lucide-react'

export default function Scanner() {
  const [scannedResult, setScannedResult] = useState(null)
  const [message, setMessage] = useState('')
  const [packageData, setPackageData] = useState({ client_name: '', shelf_location: '' })
  const [loading, setLoading] = useState(false)
  const [ocrLoading, setOcrLoading] = useState(false)
  const [cameras, setCameras] = useState([])
  const [selectedCamera, setSelectedCamera] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  
  const html5QrCode = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    // Get available cameras
    Html5Qrcode.getCameras().then((devices) => {
      if (devices && devices.length) {
        setCameras(devices)
        setSelectedCamera(devices[devices.length - 1].id) // Default to back camera
      }
    }).catch(err => {
      setMessage('Erro ao acessar câmeras. Verifique as permissões.')
    })

    return () => {
      if (html5QrCode.current && isScanning) {
        stopScanner()
      }
    }
  }, [])

  const startScanner = async () => {
    if (!selectedCamera) return
    
    html5QrCode.current = new Html5Qrcode('reader')
    setIsScanning(true)
    setMessage('')

    try {
      await html5QrCode.current.start(
        selectedCamera,
        {
          fps: 20,
          qrbox: { width: 280, height: 150 },
          aspectRatio: 1.0
        },
        (decodedText) => {
          onScanSuccess(decodedText)
        },
        (errorMessage) => {}
      )
    } catch (err) {
      console.error(err)
      setIsScanning(false)
      setMessage('Erro ao iniciar câmera.')
    }
  }

  const stopScanner = async () => {
    if (html5QrCode.current && isScanning) {
      try {
        await html5QrCode.current.stop()
        setIsScanning(false)
      } catch (err) {
        console.error(err)
      }
    }
  }

  const onScanSuccess = (result) => {
    setScannedResult(result)
    stopScanner()
    checkExistingPackage(result)
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const localHtml5QrCode = new Html5Qrcode('reader')
    localHtml5QrCode.scanFile(file, true)
      .then(decodedText => {
        onScanSuccess(decodedText)
      })
      .catch(err => {
        setMessage('Não conseguimos ler o código desta imagem.')
      })
  }

  const checkExistingPackage = async (code) => {
    const { data } = await supabase.from('packages').select('*').eq('tracking_code', code).single()
    if (data) {
      setPackageData({ client_name: data.client_name || '', shelf_location: data.shelf_location || '' })
      setMessage('Registro encontrado no sistema.')
    }
  }

  const handleOCR = async () => {
    setOcrLoading(true)
    setMessage('Analisando rótulo...')
    try {
      const video = document.querySelector('video')
      // If not scanning, we can't capture from video easily unless it's running
      if (!video && !isScanning) throw new Error('Inicie a câmera para usar o OCR')

      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      const worker = await createWorker('por')
      const { data: { text } } = await worker.recognize(canvas)
      await worker.terminate()

      const lines = text.split('\n').map(l => l.trim())
      let foundName = ''
      for (let line of lines) {
        if (line.length > 5 && line === line.toUpperCase() && !line.includes(':') && !/\d/.test(line)) {
          foundName = line
          break
        }
      }

      if (foundName) {
        setPackageData(prev => ({ ...prev, client_name: foundName }))
        setMessage(`Nome detectado: ${foundName}`)
      } else {
        setMessage('Não identifiquei o nome. Tente alinhar melhor a etiqueta.')
      }
    } catch (error) {
      setMessage(`OCR: ${error.message}`)
    } finally {
      setOcrLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from('packages').upsert([{
        tracking_code: scannedResult,
        client_name: packageData.client_name,
        shelf_location: packageData.shelf_location,
        scanned_by: user.id,
        updated_at: new Date().toISOString()
      }], { onConflict: 'tracking_code' })
      if (error) throw error
      setMessage('Catalogação concluída com sucesso.')
      setTimeout(() => resetForm(), 1500)
    } catch (error) {
      setMessage(`Erro: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setScannedResult(null)
    setPackageData({ client_name: '', shelf_location: '' })
    setIsScanning(false)
    setMessage('')
  }

  return (
    <div className="container fade-in" style={{ maxWidth: '600px' }}>
      <header style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <h1 style={{ color: 'var(--primary-color)', fontSize: '1.8rem', fontWeight: 900 }}>Entrada de Volumes</h1>
        <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Scanner corporativo AIC Materiais.</p>
      </header>

      {!scannedResult ? (
        <div className="card" style={{ padding: '0', overflow: 'hidden', border: 'none', background: '#000' }}>
          <div id="reader" style={{ minHeight: '350px', background: '#000' }}>
            {!isScanning && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '350px', background: '#0f172a', color: 'white' }}>
                <Camera size={64} style={{ marginBottom: '20px', opacity: 0.2 }} />
                <button onClick={startScanner} className="btn-primary" style={{ padding: '15px 40px' }}>
                  <Play size={20} /> INICIAR CÂMERA
                </button>
              </div>
            )}
          </div>
          
          <div style={{ padding: '1.5rem', background: 'white' }}>
             <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
                <div style={{ flex: 1 }}>
                   <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>SELECIONAR CÂMERA</label>
                   <select 
                    value={selectedCamera} 
                    onChange={(e) => setSelectedCamera(e.target.value)}
                    disabled={isScanning}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', fontWeight: 700 }}
                   >
                     {cameras.map(cam => <option key={cam.id} value={cam.id}>{cam.label || `Câmera ${cameras.indexOf(cam) + 1}`}</option>)}
                   </select>
                </div>
                {isScanning && (
                  <button onClick={stopScanner} style={{ background: '#fee2e2', color: '#991b1b', alignSelf: 'flex-end', height: '42px', padding: '0 15px' }}>
                     <XCircle size={20} /> PARAR
                  </button>
                )}
             </div>

             <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem', textAlign: 'center' }}>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                />
                <button 
                  onClick={() => fileInputRef.current.click()}
                  style={{ background: 'none', color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: 800, margin: '0 auto' }}
                >
                  <Upload size={18} /> OU CARREGAR ARQUIVO DE IMAGEM
                </button>
             </div>
          </div>
        </div>
      ) : (
        <div className="card fade-in" style={{ borderTop: '8px solid var(--primary-color)', padding: '2rem' }}>
          <div style={{ 
            background: '#eff6ff', 
            padding: '1.5rem', 
            borderRadius: '16px',
            marginBottom: '2rem',
            border: '1px solid #dbeafe',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
             <div>
              <p style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--primary-color)', opacity: 0.7, letterSpacing: '1px' }}>CÓDIGO VALIDADO</p>
              <p style={{ fontWeight: 900, fontSize: '1.4rem', fontFamily: 'monospace' }}>{scannedResult}</p>
            </div>
            <CheckCircle size={32} color="var(--primary-color)" />
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <label style={{ fontWeight: 800, fontSize: '0.85rem' }}>DESTINATÁRIO</label>
                <button 
                  type="button" 
                  onClick={handleOCR} 
                  disabled={ocrLoading || !isScanning}
                  style={{ 
                    background: 'var(--primary-color)', 
                    color: 'white', 
                    fontSize: '0.7rem', 
                    padding: '8px 15px',
                    borderRadius: '30px',
                    fontWeight: 800,
                    opacity: (!isScanning && !ocrLoading) ? 0.5 : 1
                  }}
                >
                  {ocrLoading ? <Loader2 size={14} className="spin" /> : <ScanText size={14} />}
                  LER ETIQUETA (OCR)
                </button>
              </div>
              <input 
                type="text"
                required
                value={packageData.client_name}
                onChange={(e) => setPackageData({...packageData, client_name: e.target.value})}
                placeholder="Nome completo do cliente"
                style={{ width: '100%', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '1rem', fontWeight: 600 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 800, fontSize: '0.85rem' }}>PRATELEIRA / SETOR</label>
              <input 
                type="text"
                required
                value={packageData.shelf_location}
                onChange={(e) => setPackageData({...packageData, shelf_location: e.target.value})}
                placeholder="Ex: SETOR B - 12"
                style={{ width: '100%', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '1rem', fontWeight: 600 }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '1rem' }}>
              <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1, padding: '18px' }}>
                {loading ? 'PROCESSANDO...' : 'CONFIRMAR PROTOCOLO'}
              </button>
              <button type="button" onClick={resetForm} className="btn-outline" style={{ width: '70px' }}>
                <RefreshCw size={24} />
              </button>
            </div>
          </form>
        </div>
      )}

      {message && (
        <div className="fade-in" style={{ 
          marginTop: '2rem', 
          padding: '1.25rem', 
          borderRadius: '12px', 
          backgroundColor: message.includes('Erro') ? '#fef2f2' : '#f0fdf4',
          color: message.includes('Erro') ? '#991b1b' : '#166534',
          fontSize: '0.9rem',
          fontWeight: 700,
          textAlign: 'center',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          border: `1px solid ${message.includes('Erro') ? '#fee2e2' : '#dcfce7'}`
        }}>
          {message}
        </div>
      )}
    </div>
  )
}
