import React, { useState } from 'react'

/**
 * Navbar – sticky top navigation bar.
 *
 * Props:
 *   currentPage   {string}   – the currently active page key
 *   setCurrentPage {Function} – setter to navigate to a page
 */

// Navigation link definitions
const NAV_LINKS = [
  { label: 'Home',          page: 'home'       },
  { label: 'Dashboard',     page: 'dashboard'   },
  { label: 'Waste Tracker', page: 'waste'       },
  { label: 'AI Assistant',  page: 'ai-chat'     },
  { label: 'My SDG Impact', page: 'sdg'         },
  { label: 'About',         page: 'about'       },
]

export default function Navbar({ currentPage, setCurrentPage }) {
  // Controls the mobile hamburger menu open/close state
  const [mobileOpen, setMobileOpen] = useState(false)

  /** Navigate to a page and close the mobile menu */
  function navigate(page) {
    setCurrentPage(page)
    setMobileOpen(false)
    // Scroll to top on page change
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="container">
        <div className="navbar-inner">

          {/* ── Logo ── */}
          <span
            className="nav-logo"
            onClick={() => navigate('home')}
            role="link"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate('home')}
            aria-label="EcoTrack home"
          >
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0" aria-hidden="true">
              <path d="M16 28C16 28 7 22 7 13C7 8.02944 11.0294 4 16 4C20.9706 4 25 8.02944 25 13C25 22 16 28 16 28Z" fill="#294B39" />
              <path d="M16 7C16 7 19.5 10.5 19.5 15C19.5 19.5 16 23.5 16 23.5" stroke="#A4C52A" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M16 13.5C13.5 15 12 17 12 19" stroke="#F2CDC4" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <span style={{ fontWeight: 800, letterSpacing: '-0.02em', color: '#294B39', fontSize: '1.25rem' }}>
              EcoTrack
            </span>
          </span>

          {/* ── Desktop nav links ── */}
          <div className="hidden md:flex items-center gap-6">
            <ul className="nav-links" aria-label="Desktop navigation">
              {NAV_LINKS.map(({ label, page }) => (
                <li key={page}>
                  <span
                    className={`nav-link${currentPage === page ? ' active' : ''}`}
                    onClick={() => navigate(page)}
                    role="link"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && navigate(page)}
                    aria-current={currentPage === page ? 'page' : undefined}
                  >
                    {label}
                  </span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => navigate('calculator')}
              className="px-4 py-2 rounded-md font-bold text-xs uppercase tracking-wider transition-colors"
              style={{
                backgroundColor: '#294B39',
                color: '#FAF9F6',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Calculate
            </button>
          </div>

          {/* ── Hamburger (mobile only) ── */}
          <button
            className="nav-hamburger"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
          >
            {/* Three animated lines */}
            <span
              style={mobileOpen ? { transform: 'rotate(45deg) translate(5px, 5px)' } : {}}
            />
            <span
              style={mobileOpen ? { opacity: 0 } : {}}
            />
            <span
              style={mobileOpen ? { transform: 'rotate(-45deg) translate(5px, -5px)' } : {}}
            />
          </button>
        </div>
      </div>

      {/* ── Mobile dropdown menu ── */}
      <div
        className={`nav-mobile${mobileOpen ? ' open' : ''}`}
        aria-label="Mobile navigation"
      >
        {NAV_LINKS.map(({ label, page }) => (
          <span
            key={page}
            className={`nav-link${currentPage === page ? ' active' : ''}`}
            onClick={() => navigate(page)}
            role="link"
            tabIndex={mobileOpen ? 0 : -1}
            onKeyDown={(e) => e.key === 'Enter' && navigate(page)}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {label}
          </span>
        ))}
      </div>
    </nav>
  )
}
