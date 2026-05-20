import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { LayoutDashboard, Camera, Search, LogOut, Info, Package, CheckCircle, BarChart3, TrendingUp, Users } from 'lucide-react'
import Scanner from './Scanner'
import PackageList from './PackageList'

export default function Dashboard({ session }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="dashboard-layout" style={{ 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row',
      minHeight: '100vh' 
    }}>
      {/* Sidebar - Desktop Only */}
      {!isMobile && (
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
            <h1 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 800 }}>AIC Digital</h1>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <NavLink to="/dashboard" icon={<LayoutDashboard size={20} />} label="Visão Geral" active={location.pathname === '/dashboard' || location.pathname === '/dashboard/'} isMobile={false} />
            <NavLink to="/dashboard/scan" icon={<Camera size={20} />} label="Ecanear Pacote" active={location.pathname === '/dashboard/scan'} isMobile={false} />
            <NavLink to="/dashboard/list" icon={<Search size={20} />} label="Localizar Pacote" active={location.pathname === '/dashboard/list'} isMobile={false} />
            <NavLink to="/dashboard/about" icon={<Info size={20} />} label="Como Funciona" active={location.pathname === '/dashboard/about'} isMobile={false} />
          </nav>

          <div style={{ marginTop: 'auto' }}>
            <div style={{ padding: '1.2rem', background: '#f8fcf9', borderRadius: '12px', marginBottom: '1rem', border: '1px solid #e0eadd' }}>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '5px', fontWeight: 700 }}>OPERADOR</p>
              <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>{session.user.email.split('@')[0]}</p>
            </div>
            <button onClick={handleLogout} className="btn-outline" style={{ width: '100%' }}>
              <LogOut size={16} /> Sair
            </button>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main style={{ 
        flex: 1, 
        padding: isMobile ? '1.5rem 1rem 100px 1rem' : '2.5rem', 
        backgroundColor: '#f9fbfa' 
      }}>
        {isMobile && (
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-color)' }}>
              <Package size={20} />
              <span style={{ fontWeight: 800 }}>AIC Digital</span>
            </div>
            <button onClick={handleLogout} style={{ background: 'none', padding: '5px', color: 'var(--text-muted)' }}>
              <LogOut size={20} />
            </button>
          </header>
        )}
        <Routes>
          <Route index element={<Home isMobile={isMobile} />} />
          <Route path="scan" element={<Scanner />} />
          <Route path="list" element={<PackageList />} />
          <Route path="about" element={<About />} />
        </Routes>
      </main>

      {/* Bottom Nav - Mobile Only */}
      {isMobile && (
        <nav style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'white',
          borderTop: '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-around',
          padding: '12px 0 24px 0',
          zIndex: 100,
          boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
        }}>
          <NavLink to="/dashboard" icon={<LayoutDashboard size={22} />} label="Início" active={location.pathname === '/dashboard' || location.pathname === '/dashboard/'} isMobile={true} />
          <NavLink to="/dashboard/scan" icon={<Camera size={22} />} label="Ecanear" active={location.pathname === '/dashboard/scan'} isMobile={true} />
          <NavLink to="/dashboard/list" icon={<Search size={22} />} label="Buscar" active={location.pathname === '/dashboard/list'} isMobile={true} />
          <NavLink to="/dashboard/about" icon={<Info size={22} />} label="Ajuda" active={location.pathname === '/dashboard/about'} isMobile={true} />
        </nav>
      )}

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
          font-weight: 600;
        }
        .nav-link.mobile {
          flex-direction: column;
          gap: 4px;
          padding: 8px;
          font-size: 0.7rem;
          color: #888;
        }
        .nav-link.mobile.active {
          color: var(--primary-color);
          background: none;
          box-shadow: none;
        }
        .nav-link.desktop.active {
          background-color: var(--primary-color);
          color: white;
          box-shadow: 0 4px 12px rgba(45, 90, 39, 0.2);
        }
      `}} />
    </div>
  )
}

function NavLink({ to, icon, label, active, isMobile }) {
  return (
    <Link to={to} className={`nav-link ${isMobile ? 'mobile' : 'desktop'} ${active ? 'active' : ''}`}>
      {icon}
      <span>{label}</span>
    </Link>
  )
}

function Home({ isMobile }) {
  const [stats, setStats] = useState({ pending: 0, today: 0, efficiency: '40%' })
  const [recentPackages, setRecentPackages] = useState([])

  useEffect(() => {
    fetchStats()
    fetchRecent()
  }, [])

  const fetchStats = async () => {
    const { count: pending } = await supabase.from('packages').select('*', { count: 'exact', head: true }).neq('status', 'entregue')
    const startOfDay = new Date(); startOfDay.setHours(0,0,0,0)
    const { count: today } = await supabase.from('packages').select('*', { count: 'exact', head: true }).eq('status', 'entregue').gte('delivery_date', startOfDay.toISOString())
    setStats({ pending: pending || 0, today: today || 0, efficiency: '40%' })
  }

  const fetchRecent = async () => {
    const { data } = await supabase.from('packages').select('*').order('arrival_date', { ascending: false }).limit(isMobile ? 3 : 5)
    if (data) setRecentPackages(data)
  }

  return (
    <div className="container" style={{ maxWidth: '1100px' }}>
      <header style={{ marginBottom: isMobile ? '1.5rem' : '2.5rem' }}>
        <h1 style={{ fontSize: isMobile ? '1.6rem' : '2.2rem', fontWeight: 800 }}>Olá, AIC Materiais</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: isMobile ? '0.9rem' : '1.1rem' }}>Operação digital em tempo real.</p>
      </header>
      
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        <StatCard title="Em Loja" value={stats.pending} subtitle="Volumes pendentes" color="var(--primary-color)" icon={<Package size={24} />} isMobile={isMobile} />
        {!isMobile && <StatCard title="Economia" value={stats.efficiency} subtitle="Vs manual" color="var(--accent-color)" icon={<TrendingUp size={24} />} isMobile={isMobile} />}
        <StatCard title="Entregues Hoje" value={stats.today} subtitle="Saídas do dia" color="#2e7d32" icon={<CheckCircle size={24} />} isMobile={isMobile} />
      </div>

      <div style={{ marginTop: isMobile ? '1.5rem' : '3rem', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr', gap: '1.5rem' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Atividade Recente</h3>
            <Link to="/dashboard/list" style={{ fontSize: '0.8rem', color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 700 }}>Ver todos</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {recentPackages.map(pkg => (
              <div key={pkg.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem', border: '1px solid #f0f0f0', borderRadius: '10px' }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.85rem' }}>{pkg.client_name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{pkg.tracking_code}</p>
                </div>
                <span style={{ fontSize: '0.65rem', padding: '4px 8px', borderRadius: '20px', background: pkg.status === 'entregue' ? '#e8f5e9' : '#fff8e1', color: pkg.status === 'entregue' ? '#2e7d32' : '#f57f17', fontWeight: 800 }}>{pkg.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary-color) 0%, #1a3a14 100%)', color: 'white' }}>
          <h3>Acesso Rápido</h3>
          <p style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '1.5rem' }}>Use o scanner para agilizar.</p>
          <Link to="/dashboard/scan" className="btn-primary" style={{ background: 'white', color: 'var(--primary-color)', textDecoration: 'none', width: '100%' }}>Abrir Scanner</Link>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, subtitle, color, icon, isMobile }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '15px' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${color}10`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, margin: 0, textTransform: 'uppercase' }}>{title}</p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <p style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>{value}</p>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>{subtitle}</p>
        </div>
      </div>
    </div>
  )
}

function About() { return (
  <div className="container" style={{ maxWidth: '800px' }}>
    <header style={{ marginBottom: '1.5rem' }}>
       <h1>Como Funciona</h1>
    </header>
    <div className="card">
      <p style={{ marginBottom: '1rem' }}>Sistema digital AIC para gestão de volumes e entregas.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
         <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '10px' }}>
            <h4 style={{ marginBottom: '5px' }}>1. Recebimento</h4>
            <p style={{ fontSize: '0.85rem', color: '#666' }}>Escaneie o código e guarde na prateleira indicada.</p>
         </div>
         <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '10px' }}>
            <h4 style={{ marginBottom: '5px' }}>2. Retirada</h4>
            <p style={{ fontSize: '0.85rem', color: '#666' }}>Busque pelo nome do cliente e localize o volume.</p>
         </div>
         <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '10px' }}>
            <h4 style={{ marginBottom: '5px' }}>3. Baixa</h4>
            <p style={{ fontSize: '0.85rem', color: '#666' }}>Clique em "Entregar" para registrar a saída no sistema.</p>
         </div>
      </div>
    </div>
  </div>
) }
