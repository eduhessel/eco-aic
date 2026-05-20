import React, { useEffect, useState, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { supabase } from '../supabaseClient'
import { 
  CheckCircle, 
  RefreshCw, 
  Camera,
  AlertTriangle,
  RotateCcw
} from 'lucide-react'

export default function Scanner() {
  const [scannedResult, setScannedResult] = useState(null)
  const [message, setMessage] = useState('')
  const [packageData, setPackageData] = useState({ client_name: '', shelf_location: '' })
  const [loading, setLoading] = useState(false)
  const [cameras, setCameras] = useState([])
  const [currentCameraId, setCurrentCameraId] = useState(null)
  const [isScannerInitialised, setIsScannerInitialised] = useState(false)
  const [error, setError] = useState(null)
  
  const scannerRef = useRef(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true;
    getCameras();
    return () => {
      mountedRef.current = false;
      stopScanner();
    }
  }, [])

  const getCameras = async () => {
    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        setCameras(devices);
        // Prefer back camera
        const backCamera = devices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('traseira') ||
          device.label.toLowerCase().includes('0')
        );
        setCurrentCameraId(backCamera ? backCamera.id : devices[0].id);
      } else {
        setError('Nenhuma câmera encontrada. Verifique as permissões.');
      }
    } catch (err) {
      console.error('Error getting cameras', err);
      setError('Erro ao acessar câmeras: ' + err.message);
    }
  }

  const startScanner = async (cameraId) => {
    if (scannerRef.current) {
      await stopScanner();
    }

    const html5QrCode = new Html5Qrcode("reader");
    scannerRef.current = html5QrCode;

    try {
      setError(null);
      await html5QrCode.start(
        cameraId,
        {
          fps: 15,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.0
        },
        (decodedText) => {
          setScannedResult(decodedText);
          stopScanner();
          checkExistingPackage(decodedText);
        },
        (errorMessage) => {
          // ignore constant scan errors
        }
      );
      if (mountedRef.current) setIsScannerInitialised(true);
    } catch (err) {
      console.error('Scanner start error:', err);
      if (mountedRef.current) {
        setError(`Falha ao iniciar: ${err.message}`);
        setIsScannerInitialised(false);
      }
    }
  }

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        if (mountedRef.current) setIsScannerInitialised(false);
      } catch (err) {
        console.error('Stop error', err);
      }
    }
  }

  const switchCamera = () => {
    if (cameras.length < 2) return;
    const currentIndex = cameras.findIndex(c => c.id === currentCameraId);
    const nextIndex = (currentIndex + 1) % cameras.length;
    const nextCameraId = cameras[nextIndex].id;
    setCurrentCameraId(nextCameraId);
    if (isScannerInitialised) {
      startScanner(nextCameraId);
    }
  }

  useEffect(() => {
    if (!scannedResult && !isScannerInitialised && currentCameraId && !error) {
      startScanner(currentCameraId);
    }
  }, [scannedResult, isScannerInitialised, currentCameraId, error])

  const checkExistingPackage = async (code) => {
    const { data } = await supabase.from('packages').select('*').eq('tracking_code', code).single();
    if (data) {
      setPackageData({ client_name: data.client_name || '', shelf_location: data.shelf_location || '' });
      setMessage('Volume já existe no sistema.');
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error: upsertError } = await supabase.from('packages').upsert([{
        tracking_code: scannedResult,
        client_name: packageData.client_name.toUpperCase(),
        shelf_location: packageData.shelf_location.toUpperCase(),
        scanned_by: user.id,
        updated_at: new Date().toISOString()
      }], { onConflict: 'tracking_code' });
      
      if (upsertError) throw upsertError;
      setMessage('CADASTRADO COM SUCESSO!');
      setTimeout(() => resetForm(), 1500);
    } catch (err) {
      setMessage(`Erro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  const resetForm = () => {
    setScannedResult(null);
    setPackageData({ client_name: '', shelf_location: '' });
    setMessage('');
    setError(null);
    setIsScannerInitialised(false);
  }

  return (
    <div className="container fade-in" style={{ maxWidth: '600px' }}>
      <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ color: 'var(--primary-color)', fontWeight: 900 }}>Entrada Digital</h1>
        <p style={{ color: 'var(--text-muted)' }}>Módulo de Triagem AIC</p>
      </header>

      {!scannedResult ? (
        <div className="card" style={{ padding: '0', borderRadius: '24px', overflow: 'hidden', position: 'relative', background: '#000', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
           <div id="reader" style={{ width: '100%', flex: 1 }}></div>
           
           {error && (
             <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', color: 'white', background: 'rgba(0,0,0,0.8)', zIndex: 10 }}>
               <AlertTriangle size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />
               <p style={{ fontWeight: 600 }}>{error}</p>
               <button onClick={() => { setError(null); getCameras(); }} style={{ marginTop: '1rem', background: '#fff', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 800 }}>TENTAR NOVAMENTE</button>
             </div>
           )}

           <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              {cameras.length > 1 && (
                <button onClick={switchCamera} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#3b82f6', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '14px', fontWeight: 800, fontSize: '0.8rem' }}>
                  <Camera size={18} /> ALTERNAR CÂMERA ({cameras.length})
                </button>
              )}
           </div>
        </div>
      ) : (
        <div className="card fade-in" style={{ borderTop: '8px solid var(--primary-color)', padding: '2rem' }}>
          <div style={{ background: '#eff6ff', padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div>
               <p style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--primary-color)' }}>CÓDIGO LIDO</p>
               <h2 style={{ margin: 0, fontFamily: 'monospace', letterSpacing: '1px' }}>{scannedResult}</h2>
             </div>
             <CheckCircle size={32} color="var(--primary-color)" />
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginLeft: '4px' }}>NOME DO CLIENTE</label>
              <input type="text" required value={packageData.client_name} onChange={e => setPackageData({...packageData, client_name: e.target.value})} placeholder="DIGITE O NOME" style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '4px', fontWeight: 600 }} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginLeft: '4px' }}>LOCALIZAÇÃO NO ESTOQUE</label>
              <input type="text" required value={packageData.shelf_location} onChange={e => setPackageData({...packageData, shelf_location: e.target.value})} placeholder="EX: B-10" style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '4px', fontWeight: 600 }} />
            </div>
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '1rem' }}>
               <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1, padding: '20px', borderRadius: '16px', fontSize: '1rem' }}>
                 {loading ? 'SALVANDO...' : 'CONFIRMAR ENTRADA'}
               </button>
               <button type="button" onClick={resetForm} className="btn-outline" style={{ padding: '20px', borderRadius: '16px' }}>
                 <RotateCcw size={24} />
               </button>
            </div>
          </form>
        </div>
      )}

      {message && (
        <div className="fade-in" style={{ marginTop: '2rem', padding: '1.2rem', borderRadius: '16px', background: message.includes('Erro') ? '#FEF2F2' : '#F0FDF4', color: message.includes('Erro') ? '#991B1B' : '#166534', textAlign: 'center', fontWeight: 800, border: '1px solid currentColor', opacity: 0.9 }}>
          {message}
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        #reader {
          border: none !important;
          background: #000 !important;
        }
        #reader video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
        }
      `}} />
    </div>
  )
}
