import React, { useEffect, useState, useRef } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { createWorker } from 'tesseract.js'
import { supabase } from '../supabaseClient'
import { Camera, CheckCircle, AlertCircle, ScanText, Loader2, RefreshCw } from 'lucide-react'

export default function Scanner() {
  const [scannedResult, setScannedResult] = useState(null)
  const [message, setMessage] = useState('')
  const [packageData, setPackageData] = useState({
    client_name: '',
    shelf_location: ''
  })
  const [loading, setLoading] = useState(false)
  const [ocrLoading, setOcrLoading] = useState(false)
  const scannerRef = useRef(null)

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', {
      qrbox: { width: 300, height: 150 },
      fps: 10,
      aspectRatio: 1.0,
    })

    scanner.render(onScanSuccess, onScanError)
    scannerRef.current = scanner

    function onScanSuccess(result) {
      setScannedResult(result)
      scanner.clear()
      checkExistingPackage(result)
    }

    function onScanError(err) {}

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(e => {})
      }
    }
  }, [])

  const checkExistingPackage = async (code) => {
    const { data } = await supabase
      .from('packages')
      .select('*')
      .eq('tracking_code', code)
      .single()
    
    if (data) {
      setPackageData({
        client_name: data.client_name || '',
        shelf_location: data.shelf_location || ''
      })
      setMessage('Pacote já cadastrado na base.')
    }
  }

  const handleOCR = async () => {
    setOcrLoading(true)
    setMessage('Analisando rótulo...')
    
    try {
      // Capture frame from video element
      const video = document.querySelector('video')
      if (!video) throw new Error('Câmera não encontrada')

      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      const worker = await createWorker('por') // Use Portuguese
      const { data: { text } } = await worker.recognize(canvas)
      await worker.terminate()

      // Simple regex to find common name patterns (uppercase sequences after keywords)
      // This is a heuristic and might need refinement
      const lines = text.split('\n').map(l => l.trim())
      let foundName = ''

      // Look for lines that might be names (usually 2-4 words, UPPERCASE)
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
        setMessage('Não consegui ler o nome claramente. Tente aproximar da etiqueta.')
      }
    } catch (error) {
      console.error(error)
      setMessage('Erro no reconhecimento de texto.')
    } finally {
      setOcrLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from('packages').upsert([
        {
          tracking_code: scannedResult,
          client_name: packageData.client_name,
          shelf_location: packageData.shelf_location,
          scanned_by: user.id,
          updated_at: new Date().toISOString()
        }
      ], { onConflict: 'tracking_code' })

      if (error) throw error
      setMessage('Pacote salvo com sucesso!')
      resetForm()
    } catch (error) {
      setMessage(`Erro: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setScannedResult(null)
    setPackageData({ client_name: '', shelf_location: '' })
    window.location.reload()
  }

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontWeight: 800 }}>Digitalização AIC</h1>
        <p style={{ color: 'var(--text-muted)' }}>Leitura de etiquetas com OCR inteligente.</p>
      </header>

      {!scannedResult ? (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div id="reader"></div>
          <div style={{ padding: '20px', textAlign: 'center', background: '#f8f9fa' }}>
            <Camera size={24} style={{ marginBottom: '8px', color: 'var(--primary-color)' }} />
            <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>Aponte para o código de barras</p>
          </div>
        </div>
      ) : (
        <div className="card" style={{ borderTop: '5px solid var(--primary-color)' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#f1f8f1', 
            padding: '1.2rem', 
            borderRadius: '10px',
            marginBottom: '1.5rem',
            color: '#1b5e20'
          }}>
             <div>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', opacity: 0.7 }}>Código de Barras</p>
              <p style={{ fontWeight: 800, fontSize: '1.1rem' }}>{scannedResult}</p>
            </div>
            <CheckCircle size={24} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ fontWeight: 700 }}>Nome do Cliente</label>
                <button 
                  type="button" 
                  onClick={handleOCR} 
                  disabled={ocrLoading}
                  style={{ 
                    background: 'none', 
                    color: 'var(--primary-color)', 
                    fontSize: '0.8rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    fontWeight: 700
                  }}
                >
                  {ocrLoading ? <Loader2 size={14} className="spin" /> : <ScanText size={14} />}
                  Auto-Preencher via OCR
                </button>
              </div>
              <input 
                type="text"
                required
                value={packageData.client_name}
                onChange={(e) => setPackageData({...packageData, client_name: e.target.value})}
                placeholder="Escaneie a etiqueta ou digite aqui"
                style={{ width: '100%', padding: '14px', border: '1px solid #ddd', borderRadius: '10px', fontSize: '1rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700 }}>Localização (Prateleira)</label>
              <input 
                type="text"
                required
                value={packageData.shelf_location}
                onChange={(e) => setPackageData({...packageData, shelf_location: e.target.value})}
                placeholder="Ex: B-12"
                style={{ width: '100%', padding: '14px', border: '1px solid #ddd', borderRadius: '10px', fontSize: '1rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
              <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 2 }}>
                {loading ? 'Salvando...' : 'Confirmar Tudo'}
              </button>
              <button type="button" onClick={resetForm} className="btn-outline" style={{ flex: 1 }}>
                <RefreshCw size={18} />
              </button>
            </div>
          </form>

          {message && (
            <div style={{ 
              marginTop: '1.5rem', 
              padding: '1rem', 
              borderRadius: '10px', 
              backgroundColor: message.includes('Erro') ? '#ffebee' : '#f0f4f0',
              color: message.includes('Erro') ? '#c62828' : '#2d5a27',
              fontSize: '0.9rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {message.includes('Erro') ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
              {message}
            </div>
          )}
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}} />
    </div>
  )
}
