import React, { useState } from 'react'
import './index.css'

// ── Component imports ──────────────────────────────────────
import Navbar  from './components/Navbar.jsx'
import Footer  from './components/Footer.jsx'
import ChatBot from './components/ChatBot.jsx'

// ── Page imports (lazy-ish: each page lives in its own file) ──
import HomePage        from './pages/HomePage.jsx'
import CalculatorPage  from './pages/CalculatorPage.jsx'
import DashboardPage   from './pages/DashboardPage.jsx'
import WasteTrackerPage from './pages/WasteTrackerPage.jsx'
import AIChatPage      from './pages/AIChatPage.jsx'
import SDGPage         from './pages/SDGPage.jsx'
import AboutPage       from './pages/AboutPage.jsx'

/**
 * App – root component.
 *
 * State:
 *   currentPage     – controls which page is rendered
 *   footprintResult – the carbon-footprint calculation result shared
 *                     between CalculatorPage and DashboardPage
 */
export default function App() {
  const [currentPage,      setCurrentPage]      = useState('home')
  const [footprintResult,  setFootprintResult]  = useState(null)

  /** Render the active page component */
  function renderPage() {
    // Common props passed to every page
    const pageProps = {
      setCurrentPage,
      footprintResult,
      setFootprintResult,
    }

    switch (currentPage) {
      case 'home':
        return <HomePage        {...pageProps} />
      case 'calculator':
        return <CalculatorPage  {...pageProps} />
      case 'dashboard':
        return <DashboardPage   {...pageProps} />
      case 'waste':
        return <WasteTrackerPage {...pageProps} />
      case 'ai-chat':
        return <AIChatPage      {...pageProps} />
      case 'sdg':
        return <SDGPage         {...pageProps} />
      case 'about':
        return <AboutPage       {...pageProps} />
      default:
        return <HomePage        {...pageProps} />
    }
  }

  return (
    <div className="app">
      {/* ── Sticky navigation ── */}
      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      {/* ── Active page ── */}
      <main className="page">
        {renderPage()}
      </main>

      {/* ── Site footer ── */}
      <Footer setCurrentPage={setCurrentPage} />

      {/* ── Floating AI chatbot (visible on all pages) ── */}
      <ChatBot footprintResult={footprintResult} />
    </div>
  )
}
