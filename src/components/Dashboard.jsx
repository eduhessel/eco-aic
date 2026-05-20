import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { LayoutDashboard, Camera, Search, LogOut, Info, Package, CheckCircle, BarChart3, TrendingUp, Users } from 'lucide-react'
import Scanner from './Scanner'
import PackageList from './PackageList'

export default function Dashboard({ session }) {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="dashboard-layout" style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: '280px',
        background: 'white',
        borderRight: '1px solid #eee',
        padding: '2rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2.5rem',
        position: 'sticky',
        top: 0,
        height: '100vh'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--primary-color)' }}>
          <div style={{ background: 'var(--primary-color)', color: 'white', padding: '8px', borderRadius: '10px' }}>
            <Package size={24} />
          </div>
          <h1 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 800, letterSpacing: '-0.5px' }}>AIC Digital</h1>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <NavLink to="/dashboard" icon={<LayoutDashboard size={20} />} label="Visão Geral" active={location.pathname === '/dashboard' || location.pathname === '/dashboard/'} />
          <NavLink to="/dashboard/scan" icon={<Camera size={20} />} label="Ecanear QR Code" active={location.pathname === '/dashboard/scan'} />
          <NavLink to="/dashboard/list" icon={<Search size={20} />} label="Localizar Pacote" active={location.pathname === '/dashboard/list'} />
          <NavLink to="/dashboard/about" icon={<Info size={20} />} label="Como Funciona" active={location.pathname === '/dashboard/about'} />
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <div style={{ 
            padding: '1.2rem', 
            background: 'linear-gradient(135deg, #f8fcf9 0%, #f0f4f0 100%)', 
            borderRadius: '12px', 
            marginBottom: '1rem',
            border: '1px solid #e0eadd'
          }}>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '5px', fontWeight: 700, textTransform: 'uppercase' }}>Operador Ativo</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4caf50' }}></div>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-color)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {session.user.email.split('@')[0]}
              </p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="btn-outline" 
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.9rem', padding: '10px' }}
          >
            <LogOut size={16} /> Sair do Sistema
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2.5rem', backgroundColor: '#f9fbfa', overflowY: 'auto' }}>
        <Routes>
          <Route index element={<Home />} />
          <Route path="scan" element={<Scanner />} />
          <Route path="list" element={<PackageList />} />
          <Route path="about" element={<About />} />
        </Routes>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          text-decoration: none;
          color: #555;
          border-radius: 10px;
          transition: var(--transition);
          font-weight: 500;
        }
        .nav-link:hover {
          background-color: #f0f4f0;
          color: var(--primary-color);
        }
        .nav-link.active {
          background-color: var(--primary-color);
          color: white;
          box-shadow: 0 4px 12px rgba(45, 90, 39, 0.2);
        }
      `}} />
    </div>
  )
}

function NavLink({ to, icon, label, active }) {
  return (
    <Link to={to} className={`nav-link ${active ? 'active' : ''}`}>
      {icon}
      <span>{label}</span>
    </Link>
  )
}

function Home() {
  const [stats, setStats] = useState({ total: 0, pending: 0, today: 0 })
  const [recentPackages, setRecentPackages] = useState([])

  useEffect(() => {
    fetchStats()
    fetchRecent()
  }, [])

  const fetchStats = async () => {
    // 1. Total pending in store
    const { count: pending } = await supabase
      .from('packages')
      .select('*', { count: 'exact', head: true })
      .neq('status', 'entregue')

    // 2. Delivered today
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    
    const { count: today } = await supabase
      .from('packages')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'entregue')
      .gte('delivery_date', startOfDay.toISOString())

    setStats({ 
      pending: pending || 0, 
      today: today || 0,
      efficiency: '40%' 
    })
  }

  const fetchRecent = async () => {
    const { data } = await supabase
      .from('packages')
      .select('*')
      .order('arrival_date', { ascending: false })
      .limit(5)
    
    if (data) setRecentPackages(data)
  }

  return (
    <div className="container" style={{ maxWidth: '1100px' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#1a1a1a', marginBottom: '0.5rem' }}>Painel Executivo</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Visão em tempo real da operação AIC Materiais.</p>
      </header>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
        <StatCard 
          title="Em Loja Agora" 
          value={stats.pending} 
          subtitle="Volumes aguardando retirada"
          color="var(--primary-color)" 
          icon={<Package size={24} />} 
        />
        <StatCard 
          title="Economia de Tempo" 
          value={stats.efficiency} 
          subtitle="Redução vs processo manual"
          color="var(--accent-color)" 
          icon={<TrendingUp size={24} />} 
        />
        <StatCard 
          title="Entregues Hoje" 
          value={stats.today} 
          subtitle="Volume de saídas registradas"
          color="#2e7d32" 
          icon={<CheckCircle size={24} />} 
        />
      </div>

      <div style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0 }}>Atividade Recente</h3>
            <Link to="/dashboard/list" style={{ fontSize: '0.85rem', color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 600 }}>Ver todos</Link>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentPackages.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Nenhuma atividade registrada.</p>
            ) : recentPackages.map(pkg => (
              <div key={pkg.id} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '0.8rem', 
                background: '#fcfdfc', 
                border: '1px solid #f0f0f0', 
                borderRadius: '8px' 
              }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '2px' }}>{pkg.client_name}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{pkg.tracking_code}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ 
                    fontSize: '0.7rem', 
                    padding: '4px 8px', 
                    borderRadius: '20px', 
                    background: pkg.status === 'entregue' ? '#e8f5e9' : '#fff8e1',
                    color: pkg.status === 'entregue' ? '#2e7d32' : '#f57f17',
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  }}>
                    {pkg.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ 
          background: 'linear-gradient(135deg, var(--primary-color) 0%, #1a3a14 100%)', 
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h3 style={{ color: 'white' }}>Gestão Ágil</h3>
            <p style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '2rem' }}>O uso do scanner reduziu o uso de papel em 100% nesta operação.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <Feature icon={<Users size={18} />} text="Fila de espera menor" />
              <Feature icon={<CheckCircle size={18} />} text="Zero erro de entrega" />
              <Feature icon={<TrendingUp size={18} />} text="Acesso em nuvem" />
            </div>

            <Link to="/dashboard/scan" className="btn-primary" style={{ background: 'white', color: 'var(--primary-color)', textDecoration: 'none', display: 'block', textAlign: 'center', marginTop: '2rem', padding: '12px' }}>
              Novo Escaneamento
            </Link>
          </div>
          <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', opacity: 0.1 }}>
            <Package size={120} />
          </div>
        </div>
      </div>
    </div>
  )
}

function Feature({ icon, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ color: 'var(--accent-color)' }}>{icon}</div>
      <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{text}</span>
    </div>
  )
}

function StatCard({ title, value, subtitle, color, icon }) {
  return (
    <div className="card" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '15px', 
      border: '1px solid #f0f0f0',
      transition: 'transform 0.2s ease'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ 
          width: '44px', 
          height: '44px', 
          borderRadius: '12px', 
          background: `${color}10`, 
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {icon}
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, margin: 0 }}>{title}</p>
          <p style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: '#111' }}>{value}</p>
        </div>
      </div>
      <div style={{ borderTop: '1px solid #f5f5f5', paddingTop: '10px' }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{subtitle}</p>
      </div>
    </div>
  )
}

function About() { return (
  <div className="container" style={{ maxWidth: '800px' }}>
    <header style={{ marginBottom: '2rem' }}>
      <h1>Sobre a Digitalização AIC</h1>
    </header>
    <div className="card" style={{ padding: '2.5rem' }}>
      <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
        Este sistema foi projetado para transformar a experiência de retirada de encomendas na AIC Materiais.
      </p>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '12px' }}>
          <h4 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>Antes (Analógico)</h4>
          <ul style={{ paddingLeft: '1.2rem', fontSize: '0.9rem', color: '#666' }}>
            <li>Livros-caixa manuais</li>
            <li>Rascunhos de papel</li>
            <li>Busca demorada</li>
            <li>Erros de inventário</li>
          </ul>
        </div>
        <div style={{ background: '#e8f5e9', padding: '1.5rem', borderRadius: '12px' }}>
          <h4 style={{ marginBottom: '1rem', color: '#2e7d32' }}>Agora (Digital)</h4>
          <ul style={{ paddingLeft: '1.2rem', fontSize: '0.9rem', color: '#2e7d32' }}>
            <li>Catalogação via QR Code</li>
            <li>Nuvem em tempo real</li>
            <li>Localização em segundos</li>
            <li>Zero desperdício de papel</li>
          </ul>
        </div>
      </div>

      <div style={{ textAlign: 'center', opacity: 0.6, fontSize: '0.8rem' }}>
        <p>Versão 1.2.0 | AIC Materiais © 2026</p>
      </div>
    </div>
  </div>
) }
