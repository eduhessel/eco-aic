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
  RotateCcw
} from 'lucide-react'

export default function PackageList() {
  const [packages, setPackages] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [showScanner, setShowScanner] = useState(false)

  useEffect(() => {
    fetchPackages()
  }, [])

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

  const handleDelivery = async (id) => {
    const { error } = await supabase
      .from('packages')
      .update({ status: 'entregue', delivery_date: new Date().toISOString() })
      .eq('id', id)
    
    if (!error) fetchPackages()
  }

  const filteredPackages = packages.filter(pkg => 
    pkg.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.tracking_code?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container fade-in" style={{ maxWidth: '800px' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontWeight: 900, color: 'var(--primary-color)' }}>Gestão de Estoque</h1>
      </header>

      <div style={{ position: 'relative', marginBottom: '2rem' }}>
        <div className="search-box" style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            placeholder="Buscar..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontWeight: 600 }}
          />
          <button 
            onClick={() => setShowScanner(!showScanner)}
            style={{ 
              background: showScanner ? '#fee2e2' : 'var(--primary-color)', 
              color: showScanner ? '#991b1b' : 'white', 
              padding: '0 20px', 
              borderRadius: '12px',
              border: 'none',
              fontWeight: 800
            }}
          >
            {showScanner ? <X size={20} /> : <Camera size={20} />}
          </button>
        </div>
      </div>

      {showScanner && (
        <div className="card fade-in" style={{ padding: '1rem', marginBottom: '2rem', borderRadius: '24px' }}>
          <div id="list-reader"></div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {loading ? <div>Carregando...</div> : (
          filteredPackages.map(pkg => (
            <div key={pkg.id} className="card fade-in" style={{ padding: '1.5rem', borderLeft: '8px solid var(--primary-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0 }}>{pkg.client_name.toUpperCase()}</h3>
                  <code style={{ fontSize: '0.8rem', color: 'var(--primary-color)' }}>{pkg.tracking_code}</code>
                </div>
                <button onClick={() => handleDelivery(pkg.id)} className="btn-primary" style={{ padding: '10px 20px' }}>BAIXA</button>
              </div>
            </div>
          ))
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        #list-reader button {
          background: var(--primary-color) !important;
          color: white !important;
          border: none !important;
          padding: 10px 20px !important;
          border-radius: 10px !important;
          font-weight: 800 !important;
          margin: 10px !important;
        }
      `}} />
    </div>
  )
}
