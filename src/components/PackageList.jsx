import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'
import { Html5Qrcode } from 'html5-qrcode'
import { 
  Search, 
  MapPin, 
  CheckCircle, 
  Clock, 
  Package, 
  Camera, 
  X,
  Play,
  RotateCcw
} from 'lucide-react'

export default function PackageList() {
  const [packages, setPackages] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [showScanner, setShowScanner] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const html5QrCode = useRef(null)

  useEffect(() => {
    fetchPackages()
    return () => {
      if (html5QrCode.current && isScanning) {
        stopScanner()
      }
    }
  }, [])

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

  const handleDelivery = async (id) => {
    const { error } = await supabase
      .from('packages')
      .update({ status: 'entregue', delivery_date: new Date().toISOString() })
      .eq('id', id)
    
    if (!error) fetchPackages()
  }

  const startScanner = async () => {
    html5QrCode.current = new Html5Qrcode('list-reader')
    setIsScanning(true)
    try {
      await html5QrCode.current.start(
        { facingMode: "environment" },
        {
          fps: 20,
          qrbox: { width: 250, height: 120 },
          aspectRatio: 1.0
        },
        (decodedText) => {
          setSearchTerm(decodedText)
          stopScanner()
          setShowScanner(false)
        },
        (errorMessage) => {}
      )
    } catch (err) {
      console.error(err)
      setIsScanning(false)
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

  const filteredPackages = packages.filter(pkg => 
    pkg.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.tracking_code?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container fade-in" style={{ maxWidth: '800px' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontWeight: 900, fontSize: '2rem', color: 'var(--primary-color)' }}>Gestão de Estoque</h1>
        <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Localização e baixa de volumes em tempo real.</p>
      </header>

      <div style={{ position: 'relative', marginBottom: '2rem' }}>
        <div className="search-box" style={{ flex: 1 }}>
          <Search size={22} className="search-icon" style={{ color: 'var(--primary-color)' }} />
          <input 
            type="text" 
            placeholder="Nome, código ou prateleira..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ fontWeight: 600, border: '1px solid #e2e8f0', padding: '18px 100px 18px 56px' }}
          />
          <div style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '8px' }}>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                style={{ background: '#f1f5f9', color: '#64748b', padding: '10px', borderRadius: '10px' }}
              >
                <RotateCcw size={18} />
              </button>
            )}
            <button 
              onClick={() => {
                if (showScanner) {
                  stopScanner()
                  setShowScanner(false)
                } else {
                  setShowScanner(true)
                }
              }}
              style={{ 
                background: showScanner ? '#fee2e2' : 'var(--primary-color)', 
                color: showScanner ? '#991b1b' : 'white', 
                padding: '10px 16px', 
                borderRadius: '10px',
                boxShadow: showScanner ? 'none' : '0 4px 10px rgba(30, 64, 175, 0.2)'
              }}
            >
              {showScanner ? <X size={20} /> : <Camera size={20} />}
            </button>
          </div>
        </div>
      </div>

      {showScanner && (
        <div className="card fade-in" style={{ padding: '0', overflow: 'hidden', marginBottom: '2rem', border: '5px solid var(--primary-color)' }}>
          <div id="list-reader" style={{ minHeight: '200px', background: '#000' }}>
            {!isScanning && (
              <div style={{ padding: '2rem', textAlign: 'center', background: '#0f172a', color: 'white' }}>
                 <p style={{ fontWeight: 800, marginBottom: '15px' }}>PRONTO PARA BUSCAR POR CÓDIGO</p>
                 <button onClick={startScanner} className="btn-primary" style={{ margin: '0 auto', background: 'white', color: '#0f172a' }}>
                    <Play size={18} /> ATIVAR LEITURA
                 </button>
              </div>
            )}
          </div>
          <div style={{ padding: '10px', textAlign: 'center', background: '#eff6ff', color: 'var(--primary-color)', fontSize: '0.8rem', fontWeight: 800 }}>
             ESCANEIE O CÓDIGO PARA FILTRAR A LISTA INSTANTANEAMENTE
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {loading ? <div className="loading">Sincronizando banco de dados...</div> : (
          filteredPackages.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', background: '#f8fafc', border: '2px dashed #e2e8f0' }}>
              <Package size={60} color="#cbd5e1" style={{ marginBottom: '1.5rem' }} />
              <p style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '1.1rem' }}>Ops! Nenhum item encontrado.</p>
              <button onClick={() => setSearchTerm('')} style={{ margin: '15px auto 0 auto', background: 'none', color: 'var(--primary-color)', fontWeight: 800 }}>LIMPAR FILTROS</button>
            </div>
          ) : filteredPackages.map(pkg => (
            <div key={pkg.id} className="card fade-in" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1.5rem',
              padding: '1.75rem',
              borderLeft: '8px solid var(--primary-color)',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>{pkg.client_name.toUpperCase()}</h3>
                  <code style={{ fontSize: '0.8rem', color: 'var(--primary-color)', background: '#eff6ff', padding: '4px 10px', borderRadius: '6px', fontWeight: 700, letterSpacing: '0.5px' }}>
                    {pkg.tracking_code}
                  </code>
                </div>
                <div style={{ 
                  background: '#f59e0b', 
                  color: 'white', 
                  padding: '6px 14px', 
                  borderRadius: '10px', 
                  fontSize: '0.75rem', 
                  fontWeight: 900,
                  boxShadow: '0 4px 6px rgba(245, 158, 11, 0.2)'
                }}>
                  {pkg.shelf_location}
                </div>
              </div>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                paddingTop: '1.25rem',
                borderTop: '1px solid #f1f5f9'
              }}>
                <div style={{ display: 'flex', gap: '15px' }}>
                   <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                    <Clock size={18} color="var(--primary-color)" /> {new Date(pkg.arrival_date).toLocaleDateString()}
                  </span>
                </div>
                
                <button 
                  onClick={() => handleDelivery(pkg.id)}
                  className="btn-primary"
                  style={{ 
                    padding: '12px 24px',
                    fontSize: '0.85rem',
                    fontWeight: 900,
                    letterSpacing: '0.5px'
                  }}
                >
                  <CheckCircle size={18} /> CONFIRMAR SAÍDA
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .search-box { position: relative; }
        .search-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
        .search-box input { 
          width: 100%; 
          padding: 16px 16px 16px 52px; 
          border: 1px solid #ddd; 
          border-radius: 16px; 
          outline: none; 
          font-size: 1rem;
          transition: var(--transition);
        }
        .search-box input:focus { 
          border-color: var(--primary-color); 
          box-shadow: 0 4px 15px rgba(30, 64, 175, 0.1); 
        }
      `}} />
    </div>
  )
}
