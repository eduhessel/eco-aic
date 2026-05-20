import React, { useState } from 'react'
import { supabase } from '../supabaseClient'
import { Plus, Table, Trash2, CheckCircle } from 'lucide-react'

export default function Disposal() {
  const [type, setType] = useState('papelão')
  const [quantity, setQuantity] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from('disposals').insert([
        { 
          type, 
          quantity: parseFloat(quantity), 
          user_id: user.id,
          store_location: 'AIC Materiais Matriz'
        }
      ])

      if (error) throw error
      setMessage('Registro salvo com sucesso!')
      setQuantity('')
    } catch (error) {
      console.error(error)
      setMessage('Erro ao salvar registro. Verifique a conexão.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1>Ponto de Coleta</h1>
        <p style={{ color: 'var(--text-muted)' }}>Registre novos descartes para a estação Eco-AIC.</p>
      </header>

      <div className="card">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Tipo de Material</label>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                outline: 'none'
              }}
            >
              <option value="papelão">Papelão (Caixas)</option>
              <option value="plástico">Plástico (Sacas/Envelopes)</option>
              <option value="papel">Papel Mixto</option>
              <option value="outro">Outro</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Quantidade (kg)</label>
            <input 
              type="number" 
              step="0.1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Ex: 2.5"
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                outline: 'none'
              }}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {loading ? 'Salvando...' : <><Plus size={18} /> Registrar Coleta</>}
          </button>

          {message && (
            <div style={{ 
              padding: '1rem', 
              borderRadius: '8px', 
              backgroundColor: message.includes('Erro') ? '#ffebee' : '#e8f5e9',
              color: message.includes('Erro') ? '#c62828' : '#2e7d32',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {message.includes('Erro') ? <Trash2 size={18} /> : <CheckCircle size={18} />}
              {message}
            </div>
          )}
        </form>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h3>Impacto Imediato</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Cada kg de papelão reutilizado economiza aproximadamente 0.5kg de CO2.
        </p>
      </div>
    </div>
  )
}
