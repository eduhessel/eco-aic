import React, { useEffect, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { supabase } from '../supabaseClient'
import { 
  CheckCircle, 
  RefreshCw, 
  Search,
  ChevronLeft
} from 'lucide-react'

export default function Scanner() {
  const [scannedResult, setScannedResult] = useState(null)
  const [message, setMessage] = useState('')
  const [packageData, setPackageData] = useState({ client_name: '', shelf_location: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Only initialize if we don't have a result yet
    if (!scannedResult) {
      const scanner = new Html5QrcodeScanner('reader', {
        fps: 20,
        qrbox: { width: 250, height: 150 },
        rememberLastUsedCamera: true,
        supportedScanTypes: [0] // Camera only
      });

      scanner.render((decodedText) => {
        setScannedResult(decodedText);
        scanner.clear();
        checkExistingPackage(decodedText);
      }, (error) => {
        // quiet error
      });

      return () => {
        scanner.clear().catch(e => console.error(e));
      }
    }
  }, [scannedResult])

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
      const { error } = await supabase.from('packages').upsert([{
        tracking_code: scannedResult,
        client_name: packageData.client_name.toUpperCase(),
        shelf_location: packageData.shelf_location.toUpperCase(),
        scanned_by: user.id,
        updated_at: new Date().toISOString()
      }], { onConflict: 'tracking_code' });
      
      if (error) throw error;
      setMessage('CADASTRADO COM SUCESSO!');
      setTimeout(() => resetForm(), 1500);
    } catch (error) {
      setMessage(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  const resetForm = () => {
    setScannedResult(null);
    setPackageData({ client_name: '', shelf_location: '' });
    setMessage('');
  }

  return (
    <div className="container fade-in" style={{ maxWidth: '600px' }}>
      <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ color: 'var(--primary-color)', fontWeight: 900 }}>Entrada Digital</h1>
        <p style={{ color: 'var(--text-muted)' }}>Módulo de Triagem AIC</p>
      </header>

      {!scannedResult ? (
        <div className="card" style={{ padding: '1rem', borderRadius: '20px', minHeight: '400px' }}>
           <div id="reader"></div>
           {/* <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Use o botão da própria biblioteca para Iniciar/Parar a câmera.
           </div> */}
        </div>
      ) : (
        <div className="card fade-in" style={{ borderTop: '8px solid var(--primary-color)', padding: '2rem' }}>
          <div style={{ background: '#eff6ff', padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between' }}>
             <div>
               <p style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--primary-color)' }}>CÓDIGO LIDO</p>
               <h2 style={{ margin: 0, fontFamily: 'monospace' }}>{scannedResult}</h2>
             </div>
             <CheckCircle size={32} color="var(--primary-color)" />
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <input type="text" required value={packageData.client_name} onChange={e => setPackageData({...packageData, client_name: e.target.value})} placeholder="NOME DO CLIENTE" style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
            <input type="text" required value={packageData.shelf_location} onChange={e => setPackageData({...packageData, shelf_location: e.target.value})} placeholder="LOCALIZAÇÃO (EX: B-10)" style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
            <div style={{ display: 'flex', gap: '12px' }}>
               <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1, padding: '18px' }}>{loading ? 'SALVANDO...' : 'CONFIRMAR'}</button>
               <button type="button" onClick={resetForm} className="btn-outline" style={{ padding: '18px' }}><RefreshCw size={24} /></button>
            </div>
          </form>
        </div>
      )}

      {message && (
        <div style={{ marginTop: '2rem', padding: '1rem', borderRadius: '12px', background: '#F0FDF4', color: '#166534', textAlign: 'center', fontWeight: 800 }}>
          {message}
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        #reader {
          border: none !important;
          background: #000 !important;
        }
        #reader__dashboard_section_csr button {
          width: 100% !important;
          background: var(--primary-color) !important;
          color: white !important;
          border: none !important;
          padding: 16px !important;
          border-radius: 14px !important;
          font-weight: 900 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.5px !important;
          margin: 10px 0 !important;
          box-shadow: 0 4px 12px rgba(30, 64, 175, 0.2) !important;
          transition: transform 0.2s !important;
        }
        #reader__dashboard_section_csr button:active {
          transform: scale(0.98) !important;
        }
        #reader__camera_selection {
          width: 100% !important;
          padding: 12px !important;
          border-radius: 12px !important;
          border: 1px solid #e2e8f0 !important;
          font-weight: 700 !important;
          margin-bottom: 10px !important;
        }
        /* Hiding labels/text to keep it clean */
        #reader__dashboard_section_csr > div > span,
        #reader__dashboard_section_csr > span,
        #reader img {
          display: none !important;
        }
        #reader__status_span {
           display: none !important;
        }
        /* Hiding specific file input if any */
        #reader__filescan_input {
          display: none !important;
        }
      `}} />
    </div>
  )
}
