import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Package, ArrowRight, Save } from 'lucide-react'

export default function Inventory() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      const { data, error } = await supabase
        .from('reuse_inventory')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setItems(data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <header style={{ marginBottom: '2rem' }}>
        <h1>Reuso Circular</h1>
        <p style={{ color: 'var(--text-muted)' }}>Produtos criados a partir do material reciclado.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="card">
          <h3>Novas Embalagens Prontas</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Itens fabricados na oficina AIC para venda de miudezas.</p>
          
          {loading ? <p>Carregando...</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {items.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', background: '#f8f9fa', borderRadius: '8px' }}>
                  <Package size={32} color="#ccc" style={{ marginBottom: '0.5rem' }} />
                  <p>Nenhum item em estoque ainda.</p>
                </div>
              ) : items.map(item => (
                <div key={item.id} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '1rem',
                  border: '1px solid #eee',
                  borderRadius: '8px'
                }}>
                  <div>
                    <p style={{ fontWeight: 600 }}>{item.item_name}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Material: Papelão Reutilizado</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>{item.quantity_available} un</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Em estoque</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card" style={{ background: 'var(--primary-color)', color: 'white' }}>
          <h3 style={{ color: 'white' }}>Fluxo de Produção</h3>
          <p style={{ opacity: 0.8, marginBottom: '2rem' }}>Entenda como o descarte vira economia.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <ProcessStep icon={<Package size={20} />} text="Coleta de caixas descartadas na loja" />
            <ArrowRight size={24} style={{ marginLeft: '10px', opacity: 0.5 }} />
            <ProcessStep icon={<Save size={20} />} text="Corte e modelagem para novos tamanhos" />
            <ArrowRight size={24} style={{ marginLeft: '10px', opacity: 0.5 }} />
            <ProcessStep icon={<Package size={20} />} text="Embalagem de parafusos e conexões" />
          </div>
        </div>
      </div>
    </div>
  )
}

function ProcessStep({ icon, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
      <div style={{ 
        width: '40px', 
        height: '40px', 
        borderRadius: '50%', 
        background: 'rgba(255,255,255,0.2)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        {icon}
      </div>
      <p style={{ fontWeight: 500 }}>{text}</p>
    </div>
  )
}
