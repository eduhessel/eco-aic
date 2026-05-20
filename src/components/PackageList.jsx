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
        <h1>Localizar Pacote</h1>
        <p style={{ color: 'var(--text-muted)' }}>Busca rápida por nome, código ou localização.</p>
      </header>

      <div className="input-group" style={{ marginBottom: '2rem' }}>
        <Search size={20} className="icon" style={{ left: '15px' }} />
        <input 
          type="text" 
          placeholder="Buscar cliente ou código de rastreio..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '15px 15px 15px 50px', fontSize: '1rem' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {loading ? <p>Carregando...</p> : (
          filteredPackages.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: 'var(--text-muted)' }}>Nenhum pacote pendente encontrado.</p>
            </div>
          ) : filteredPackages.map(pkg => (
            <div key={pkg.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0 }}>{pkg.client_name}</h3>
                <code style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{pkg.tracking_code}</code>
                <div style={{ display: 'flex', gap: '15px', marginTop: '10px', fontSize: '0.85rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <MapPin size={14} color="var(--accent-color)" /> {pkg.shelf_location}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)' }}>
                    <Clock size={14} /> {new Date(pkg.arrival_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <button 
                onClick={() => handleDelivery(pkg.id)}
                className="btn-outline" 
                style={{ borderColor: '#2e7d32', color: '#2e7d32', padding: '8px 16px' }}
              >
                <CheckCircle size={18} style={{ marginRight: '5px' }} /> Entregar
              </button>
            </div>
          ))
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .input-group { position: relative; display: flex; align-items: center; }
        .input-group .icon { position: absolute; color: var(--text-muted); }
        .input-group input { border: 1px solid #ddd; borderRadius: 12px; outline: none; transition: var(--transition); }
        .input-group input:focus { border-color: var(--primary-color); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
      `}} />
    </div>
  )
}
