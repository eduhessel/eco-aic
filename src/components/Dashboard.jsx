import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { 
  LayoutDashboard, 
  Camera, 
  Search, 
  LogOut, 
  Info, 
  Package, 
  CheckCircle, 
  BarChart3, 
  TrendingUp, 
  Users,
  Box,
  ClipboardList,
  ShieldCheck,
  Bell
} from 'lucide-react'
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
      minHeight: '100vh',
      backgroundColor: 'var(--bg-color)'
    }}>
      {/* Sidebar - Desktop Only */}
      {!isMobile && (
        <aside style={{
          width: '280px',
          background: 'white',
          borderRight: '1px solid #e2e8f0',
          padding: '2.5rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '2.5rem',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, var(--primary-color) 0%, #1e3a8a 100%)', 
              color: 'white', 
              padding: '10px', 
              borderRadius: '12px',
              boxShadow: '0 4px 10px rgba(30, 64, 175, 0.2)'
            }}>
              <Box size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 900, color: 'var(--primary-color)', lineHeight: 1 }}>AIC</h1>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase' }}>Digital System</span>
            </div>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <NavLink to="/dashboard" icon={<LayoutDashboard size={20} />} label="Painel de Controle" active={location.pathname === '/dashboard' || location.pathname === '/dashboard/'} isMobile={false} />
            <NavLink to="/dashboard/scan" icon={<Camera size={20} />} label="Catalogar Entrada" active={location.pathname === '/dashboard/scan'} isMobile={false} />
            <NavLink to="/dashboard/list" icon={<Search size={20} />} label="Gestão de Estoque" active={location.pathname === '/dashboard/list'} isMobile={false} />
            <NavLink to="/dashboard/about" icon={<Info size={20} />} label="Suporte Operacional" active={location.pathname === '/dashboard/about'} isMobile={false} />
          </nav>

          <div style={{ marginTop: 'auto' }}>
            <div style={{ 
              padding: '1.25rem', 
              background: '#f1f5f9', 
              borderRadius: '14px', 
              marginBottom: '1rem', 
              border: '1px solid #e2e8f0' 
            }}>
              <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 800, letterSpacing: '1px' }}>OPERADOR ATIVO</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></div>
                 <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>{session.user.email.split('@')[0].toUpperCase()}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="btn-outline" style={{ width: '100%', padding: '12px' }}>
              <LogOut size={16} /> Encerrar Sessão
            </button>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main style={{ 
        flex: 1, 
        padding: isMobile ? '1.5rem 1.25rem 100px 1.25rem' : '3rem', 
        backgroundColor: 'var(--bg-color)' 
      }}>
        {isMobile && (
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: 'var(--primary-color)', color: 'white', padding: '6px', borderRadius: '8px' }}>
                <Box size={18} />
              </div>
              <span style={{ fontWeight: 900, fontSize: '1.1rem', color: 'var(--primary-color)' }}>AIC DIGITAL</span>
            </div>
            <div style={{ display: 'flex', gap: '15px' }}>
               <Bell size={20} color="var(--text-muted)" />
               <button onClick={handleLogout} style={{ background: 'none', padding: '0', color: 'var(--secondary-color)' }}>
                <LogOut size={20} />
              </button>
            </div>
          </header>
        )}
        <div className="fade-in">
          <Routes>
            <Route index element={<Home isMobile={isMobile} />} />
            <Route path="scan" element={<Scanner />} />
            <Route path="list" element={<PackageList />} />
            <Route path="about" element={<About />} />
          </Routes>
        </div>
      </main>

      {/* Bottom Nav - Mobile Only */}
      {isMobile && (
        <nav style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-around',
          padding: '12px 0 28px 0',
          zIndex: 100,
          boxShadow: '0 -4px 15px rgba(0,0,0,0.05)'
        }}>
          <NavLink to="/dashboard" icon={<LayoutDashboard size={22} />} label="Início" active={location.pathname === '/dashboard' || location.pathname === '/dashboard/'} isMobile={true} />
          <NavLink to="/dashboard/scan" icon={<Camera size={22} />} label="Entrada" active={location.pathname === '/dashboard/scan'} isMobile={true} />
          <NavLink to="/dashboard/list" icon={<Search size={22} />} label="Buscar" active={location.pathname === '/dashboard/list'} isMobile={true} />
          <NavLink to="/dashboard/about" icon={<Info size={22} />} label="Ajuda" active={location.pathname === '/dashboard/about'} isMobile={true} />
        </nav>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          text-decoration: none;
          color: var(--text-muted);
          border-radius: 12px;
          transition: var(--transition);
          font-weight: 700;
          font-size: 0.9rem;
        }
        .nav-link:hover {
          background-color: #f1f5f9;
          color: var(--primary-color);
        }
        .nav-link.active.desktop {
          background-color: var(--primary-color);
          color: white;
          box-shadow: 0 4px 12px rgba(30, 64, 175, 0.25);
        }
        .nav-link.mobile {
          flex-direction: column;
          gap: 6px;
          padding: 6px;
          font-size: 0.7rem;
          background: none;
          min-width: 70px;
        }
        .nav-link.mobile.active {
          color: var(--primary-color);
          transform: translateY(-2px);
        }
        .nav-link.mobile.active span {
          font-weight: 800;
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
  const [stats, setStats] = useState({ pending: 0, today: 0, total_all_time: 0 })
  const [recentPackages, setRecentPackages] = useState([])

  useEffect(() => {
    fetchStats()
    fetchRecent()
  }, [])

  const fetchStats = async () => {
    const { count: pending } = await supabase.from('packages').select('*', { count: 'exact', head: true }).neq('status', 'entregue')
    const startOfDay = new Date(); startOfDay.setHours(0,0,0,0)
    const { count: today } = await supabase.from('packages').select('*', { count: 'exact', head: true }).eq('status', 'entregue').gte('delivery_date', startOfDay.toISOString())
    const { count: total } = await supabase.from('packages').select('*', { count: 'exact', head: true })
    
    setStats({ pending: pending || 0, today: today || 0, total_all_time: total || 0 })
  }

  const fetchRecent = async () => {
    const { data } = await supabase.from('packages').select('*').order('arrival_date', { ascending: false }).limit(isMobile ? 3 : 5)
    if (data) setRecentPackages(data)
  }

  return (
    <div className="container" style={{ maxWidth: '1100px' }}>
      <header style={{ marginBottom: isMobile ? '2rem' : '3.5rem' }}>
        <h1 style={{ fontSize: isMobile ? '1.8rem' : '2.5rem', marginBottom: '0.5rem' }}>Painel Executivo</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: isMobile ? '0.95rem' : '1.1rem', fontWeight: 500 }}>Monitoramento e logística digital AIC Materiais.</p>
      </header>
      
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <StatCard title="Estoque em Loja" value={stats.pending} subtitle="Volumes pendentes" color="var(--primary-color)" icon={<Box size={24} />} isMobile={isMobile} />
        <StatCard title="Entregas (Hoje)" value={stats.today} subtitle="Saídas registradas" color="#10b981" icon={<CheckCircle size={24} />} isMobile={isMobile} />
        {!isMobile && <StatCard title="Monitoramento" value="100%" subtitle="Digitalizado" color="var(--accent-color)" icon={<ShieldCheck size={24} />} isMobile={isMobile} />}
      </div>

      <div style={{ marginTop: isMobile ? '2rem' : '4rem', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.6fr 1fr', gap: '2rem' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem' }}>Atividade do Sistema</h3>
            <Link to="/dashboard/list" style={{ fontSize: '0.8rem', color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 800 }}>GERENCIAR TUDO</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentPackages.length === 0 ? <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Sem registros recentes.</p> : recentPackages.map(pkg => (
              <div key={pkg.id} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '1rem', 
                background: '#f8fafc', 
                border: '1px solid #f1f5f9', 
                borderRadius: '12px',
                transition: 'transform 0.2s'
              }}>
                <div>
                  <p style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1e293b' }}>{pkg.client_name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{pkg.tracking_code}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                   <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-color)', marginBottom: '4px' }}>{pkg.shelf_location}</p>
                   <span style={{ fontSize: '0.6rem', padding: '3px 8px', borderRadius: '6px', background: pkg.status === 'entregue' ? '#dcfce7' : '#fef9c3', color: pkg.status === 'entregue' ? '#166534' : '#854d0e', fontWeight: 900, textTransform: 'uppercase' }}>{pkg.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ 
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h3 style={{ color: 'white', marginBottom: '1rem' }}>Entrada Ágil</h3>
            <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '2.5rem' }}>Catalogação profissional via QR/Barcode e OCR de alta precisão.</p>
            <Link to="/dashboard/scan" className="btn-primary" style={{ background: 'white', color: '#0f172a', textDecoration: 'none', width: '100%', padding: '16px' }}>
              <Camera size={20} /> INICIAR SCAN
            </Link>
          </div>
          <Box size={140} style={{ position: 'absolute', right: '-30px', bottom: '-30px', opacity: 0.05, transform: 'rotate(-20deg)' }} />
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, subtitle, color, icon, isMobile }) {
  return (
    <div className="card" style={{ 
      display: 'flex', 
      flexDirection: 'row', 
      alignItems: 'center', 
      gap: '20px',
      borderLeft: `6px solid ${color}`
    }}>
      <div style={{ 
        width: '56px', 
        height: '56px', 
        borderRadius: '16px', 
        background: `${color}10`, 
        color: color, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        flexShrink: 0 
      }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <p style={{ fontSize: '1.75rem', fontWeight: 900, margin: 0, color: '#0f172a' }}>{value}</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, fontWeight: 600 }}>{subtitle}</p>
        </div>
      </div>
    </div>
  )
}

function About() { return (
  <div className="container" style={{ maxWidth: '800px' }}>
    <header style={{ marginBottom: '2.5rem' }}>
       <h1 style={{ fontSize: '2rem' }}>Suporte Técnico</h1>
       <p style={{ color: 'var(--text-muted)' }}>Guia de operações do AIC Digital System.</p>
    </header>
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <section>
        <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}><ClipboardList size={20} color="var(--primary-color)" /> Protocolo de Registro</h4>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>Utilize o scanner para capturar o código de barras. O sistema verificará duplicatas e solicitará a localização física (prateleira) para rastreabilidade total.</p>
      </section>
      
      <div style={{ height: '1px', background: '#f1f5f9' }}></div>

      <section>
        <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}><ShieldCheck size={20} color="var(--primary-color)" /> Segurança de Dados</h4>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>Todas as operações são vinculadas ao seu usuário. Certifique-se de realizar o logout ao final do turno para garantir a integridade dos protocolos.</p>
      </section>

      <div style={{ padding: '1.5rem', background: 'var(--bg-color)', borderRadius: '12px', textAlign: 'center' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>AIC DIGITAL SYSTEM v2.0.0 | CORPORATE EDITION</p>
      </div>
    </div>
  </div>
) }
