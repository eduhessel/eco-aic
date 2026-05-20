import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { 
  Search, 
  MapPin, 
  CheckCircle, 
  Clock, 
  Package, 
  Camera, 
  X,
  RotateCcw,
  Loader2
} from 'lucide-react'

export default function PackageList() {
  const [packages, setPackages] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [showScanner, setShowScanner] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    fetchPackages()
  }, [])

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  useEffect(() => {
    if (showScanner) {
      const scanner = new Html5QrcodeScanner('list-reader', {
        fps: 20,
        qrbox: { width: 250, height: 125 },
        supportedScanTypes: [0]
      });

      scanner.render((decodedText) => {
        setSearchTerm(decodedText);
        scanner.clear();
        setShowScanner(false);
      }, (err) => {});

      return () => {
        scanner.clear().catch(e => {});
      }
    }
  }, [showScanner])

  const fetchPackages = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('packages')
      .select('*')
      .neq('status', 'entregue')
      .order('arrival_date', { ascending: false })
    
    if (data) setPackages(data)
    setLoading(false)
  }

  const handleDelivery = async (id, name) => {
    const { error } = await supabase
      .from('packages')
      .update({ status: 'entregue', delivery_date: new Date().toISOString() })
      .eq('id', id)
    
    if (!error) {
      setToast(`Baixa realizada: ${name}`)
      fetchPackages()
    }
  }

  const filteredPackages = packages.filter(pkg => 
    pkg.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.tracking_code?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container fade-in" style={{ maxWidth: '800px', paddingBottom: '100px' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontWeight: 900, color: 'var(--primary-color)', fontSize: '2rem' }}>Gestão de Estoque</h1>
        <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Controle de saída e localização de volumes.</p>
      </header>

      <div style={{ position: 'relative', marginBottom: '2rem' }}>
        <div className="search-box" style={{ display: 'flex', gap: '10px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary-color)' }} />
            <input 
              type="text" 
              placeholder="Nome ou código do pacote..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '16px', border: '1px solid #e2e8f0', fontWeight: 600, fontSize: '1rem', outline: 'none' }}
            />
          </div>
          <button 
            onClick={() => setShowScanner(!showScanner)}
            style={{ 
              background: showScanner ? '#fee2e2' : 'var(--primary-color)', 
              color: showScanner ? '#991b1b' : 'white', 
              padding: '0 20px', 
              borderRadius: '16px',
              border: 'none',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {showScanner ? <X size={20} /> : <Camera size={20} />}
            <span className="hide-mobile">{showScanner ? 'Fechar' : 'Escanear'}</span>
          </button>
        </div>
      </div>

      {showScanner && (
        <div className="card fade-in" style={{ padding: '0', overflow: 'hidden', marginBottom: '2rem', borderRadius: '24px', border: '2px solid var(--primary-color)' }}>
          <div id="list-reader"></div>
          <div style={{ padding: '10px', textAlign: 'center', background: '#eff6ff', color: 'var(--primary-color)', fontSize: '0.8rem', fontWeight: 800 }}>
             ALINHE O CÓDIGO PARA FILTRAR A LISTA
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <Loader2 className="spin" size={40} color="var(--primary-color)" style={{ margin: '0 auto' }} />
            <p style={{ marginTop: '1rem', fontWeight: 700, color: 'var(--text-muted)' }}>Sincronizando estoque...</p>
          </div>
        ) : (
          filteredPackages.length === 0 ? (
            <div className="card fade-in" style={{ textAlign: 'center', padding: '4rem 2rem', background: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: '24px' }}>
              <Package size={60} color="#cbd5e1" style={{ marginBottom: '1.5rem' }} />
              <h3 style={{ color: '#64748b', fontWeight: 900 }}>Nenhum pacote disponível</h3>
              <p style={{ color: '#94a3b8', fontWeight: 600 }}>Tente mudar o termo de busca ou resetar os filtros.</p>
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} style={{ marginTop: '1.5rem', background: 'none', color: 'var(--primary-color)', fontWeight: 800, border: 'none' }}>
                   LIMPAR BUSCA
                </button>
              )}
            </div>
          ) : filteredPackages.map(pkg => (
            <div key={pkg.id} className="card fade-in card-hover" style={{ 
              padding: '1.5rem', 
              borderLeft: '8px solid var(--primary-color)', 
              borderRadius: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>{pkg.client_name.toUpperCase()}</h3>
                  <code style={{ fontSize: '0.8rem', color: 'var(--primary-color)', background: '#eff6ff', padding: '4px 8px', borderRadius: '6px', fontWeight: 700 }}>
                    {pkg.tracking_code}
                  </code>
                </div>
                <div style={{ background: '#f59e0b', color: 'white', padding: '6px 12px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 900 }}>
                  {pkg.shelf_location}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                   <Clock size={16} /> {new Date(pkg.arrival_date).toLocaleDateString()}
                </div>
                <button 
                  onClick={() => handleDelivery(pkg.id, pkg.client_name)} 
                  className="btn-primary" 
                  style={{ padding: '10px 20px', fontSize: '0.85rem', fontWeight: 900 }}
                >
                  <CheckCircle size={18} /> CONFIRMAR BAIXA
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {toast && (
        <div className="fade-in" style={{ 
          position: 'fixed', 
          bottom: '100px', 
          left: '50%', 
          transform: 'translateX(-50%)', 
          background: '#0f172a', 
          color: 'white', 
          padding: '12px 24px', 
          borderRadius: '30px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          zIndex: 1000,
          fontWeight: 700,
          fontSize: '0.9rem'
        }}>
          <CheckCircle size={20} color="#22c55e" />
          {toast}
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        #list-reader { border: none !important; }
        #list-reader__dashboard_section_csr button {
          width: 100% !important;
          background: var(--primary-color) !important;
          color: white !important;
          border: none !important;
          padding: 14px !important;
          border-radius: 12px !important;
          font-weight: 800 !important;
          margin-bottom: 10px !important;
        }
        #list-reader__camera_selection {
          width: 100% !important;
          padding: 10px !important;
          border-radius: 10px !important;
          border: 1px solid #ddd !important;
          margin-bottom: 10px !important;
        }
        #list-reader__dashboard_section_csr span, 
        #list-reader__dashboard_section_csr div > span {
          display: none !important;
        }
      `}} />
    </div>
  )
}
