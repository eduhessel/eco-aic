import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Search, MapPin, CheckCircle, Clock } from 'lucide-react'

export default function PackageList() {
  const [packages, setPackages] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    setLoading(true)
    const { data, error } = await supabase
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
    <div className="container" style={{ maxWidth: '800px' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontWeight: 800 }}>Localizar Pacote</h1>
        <p style={{ color: 'var(--text-muted)' }}>Busca instantânea para entrega rápida.</p>
      </header>

      <div className="search-box" style={{ marginBottom: '2rem' }}>
        <Search size={22} className="search-icon" />
        <input 
          type="text" 
          placeholder="Nome do cliente ou código..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {loading ? <div className="loading">Carregando pacotes...</div> : (
          filteredPackages.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <Package size={48} color="#ddd" style={{ marginBottom: '1rem' }} />
              <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Nenhum pacote pendente.</p>
            </div>
          ) : filteredPackages.map(pkg => (
            <div key={pkg.id} className="card" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1.2rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{pkg.client_name}</h3>
                  <code style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>
                    {pkg.tracking_code}
                  </code>
                </div>
                <div style={{ 
                  background: '#fff3e0', 
                  color: '#e65100', 
                  padding: '4px 10px', 
                  borderRadius: '20px', 
                  fontSize: '0.7rem', 
                  fontWeight: 800,
                  textTransform: 'uppercase'
                }}>
                  {pkg.shelf_location}
                </div>
              </div>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                paddingTop: '1rem',
                borderTop: '1px solid #f0f0f0'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <Clock size={16} /> {new Date(pkg.arrival_date).toLocaleDateString()}
                </span>
                
                <button 
                  onClick={() => handleDelivery(pkg.id)}
                  style={{ 
                    backgroundColor: '#e8f5e9', 
                    color: '#2e7d32', 
                    padding: '10px 20px',
                    borderRadius: '12px',
                    fontSize: '0.9rem',
                    fontWeight: 800
                  }}
                >
                  <CheckCircle size={18} /> Entregar
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
          border-radius: 14px; 
          outline: none; 
          font-size: 1rem;
          transition: var(--transition);
        }
        .search-box input:focus { 
          border-color: var(--primary-color); 
          box-shadow: 0 4px 15px rgba(0,0,0,0.05); 
        }
      `}} />
    </div>
  )
}
