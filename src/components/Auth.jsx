import React, { useState } from 'react'
import { supabase } from '../supabaseClient'
import { Leaf, Mail, Lock, User } from 'lucide-react'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      if (isRegistering) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        })
        if (error) throw error
        alert('Confirme seu email para completar o cadastro!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      }
    } catch (error) {
      alert(error.error_description || error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper" style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '20px',
      background: 'linear-gradient(135deg, #2d5a27 0%, #1e3a1a 100%)'
    }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Leaf size={48} color="var(--primary-color)" style={{ marginBottom: '1rem' }} />
          <h2>Eco-AIC Station</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            {isRegistering ? 'Crie sua conta sustentável' : 'Bem-vindo de volta'}
          </p>
        </div>

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {isRegistering && (
            <div className="input-group">
              <User size={18} className="icon" />
              <input 
                type="text" 
                placeholder="Nome Completo" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required 
              />
            </div>
          )}
          <div className="input-group">
            <Mail size={18} className="icon" />
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="input-group">
            <Lock size={18} className="icon" />
            <input 
              type="password" 
              placeholder="Senha" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Processando...' : (isRegistering ? 'Cadastrar' : 'Entrar')}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>
            {isRegistering ? 'Já tem uma conta?' : 'Ainda não tem conta?'}
          </span>
          <button 
            onClick={() => setIsRegistering(!isRegistering)}
            style={{ background: 'none', color: 'var(--primary-color)', marginLeft: '5px', padding: '0' }}
          >
            {isRegistering ? 'Entre aqui' : 'Cadastre-se'}
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .input-group {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-group .icon {
          position: absolute;
          left: 12px;
          color: var(--text-muted);
        }
        .input-group input {
          width: 100%;
          padding: 12px 12px 12px 40px;
          border: 1px solid #ddd;
          border-radius: var(--border-radius);
          outline: none;
          transition: var(--transition);
        }
        .input-group input:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 2px rgba(45, 90, 39, 0.1);
        }
      `}} />
    </div>
  )
}
