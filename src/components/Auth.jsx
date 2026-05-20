import React, { useState } from 'react'
import { supabase } from '../supabaseClient'
import { Box, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage('Cadastro realizado! Verifique seu e-mail para confirmar.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (error) {
      setMessage(`Erro: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      padding: '20px'
    }}>
      <div className="card fade-in" style={{ 
        maxWidth: '400px', 
        width: '100%', 
        padding: '3rem 2rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ 
            background: 'var(--primary-color)', 
            color: 'white', 
            width: '64px', 
            height: '64px', 
            borderRadius: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 15px auto',
            boxShadow: '0 8px 16px rgba(30, 64, 175, 0.3)'
          }}>
            <Box size={32} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary-color)', marginBottom: '4px' }}>AIC DIGITAL</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.5px' }}>SISTEMA DE GESTÃO CORPORATIVA</p>
        </div>

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary-color)' }} />
            <input 
              type="email" 
              placeholder="Seu e-mail corporativo" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '14px 14px 14px 44px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 600 }}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary-color)' }} />
            <input 
              type="password" 
              placeholder="Senha de acesso" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '14px 14px 14px 44px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 600 }}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '0.5rem', padding: '16px' }}>
            {loading ? 'Processando...' : (isSignUp ? 'CRIAR CONTA' : 'ACESSAR SISTEMA')}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer' }}
          >
            {isSignUp ? 'JÁ POSSUO ACESSO' : 'SOLICITAR NOVO ACESSO'}
          </button>
        </div>

        {message && (
          <div style={{ 
            marginTop: '1.5rem', 
            padding: '1rem', 
            borderRadius: '10px', 
            backgroundColor: message.includes('Erro') ? '#fef2f2' : '#f0fdf4',
            color: message.includes('Erro') ? '#991b1b' : '#166534',
            fontSize: '0.85rem',
            fontWeight: 700,
            textAlign: 'center',
            border: '1px solid currentColor'
          }}>
            {message}
          </div>
        )}

        <div style={{ marginTop: '3rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-muted)' }}>
          <ShieldCheck size={16} />
          <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px' }}>AMBIENTE SEGURO E CRIPTOGRAFADO</span>
        </div>
      </div>
    </div>
  )
}
