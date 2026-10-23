import React from 'react'

/**
 * Footer – site-wide footer with branding, navigation links, and copyright.
 *
 * Props:
 *   setCurrentPage {Function} – allows footer links to navigate
 */

const QUICK_LINKS = [
  { label: 'Carbon Calculator',  page: 'calculator'  },
  { label: 'Dashboard',          page: 'dashboard'   },
  { label: 'Waste Tracker',      page: 'waste'       },
  { label: 'AI Assistant',       page: 'ai-chat'     },
  { label: 'My SDG Impact',      page: 'sdg'         },
]

export default function Footer({ setCurrentPage }) {
  /** Navigate and scroll to top */
  function navigate(page) {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer-content">

          {/* ── Brand ── */}
          <div className="footer-brand">
            <div className="nav-logo" onClick={() => navigate('home')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0" aria-hidden="true">
                <path d="M16 28C16 28 7 22 7 13C7 8.02944 11.0294 4 16 4C20.9706 4 25 8.02944 25 13C25 22 16 28 16 28Z" fill="#FAF9F6" />
                <path d="M16 7C16 7 19.5 10.5 19.5 15C19.5 19.5 16 23.5 16 23.5" stroke="#A4C52A" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M16 13.5C13.5 15 12 17 12 19" stroke="#F2CDC4" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <span style={{ fontWeight: 800, color: '#FAF9F6', fontSize: '1.25rem', letterSpacing: '-0.02em' }}>
                EcoTrack
              </span>
            </div>
            <p className="footer-tagline">
              An environmental intelligence platform grounding individual action in climate science, circular resource stewardship, and sustainable development benchmarks.
            </p>
          </div>

          {/* ── Quick Links ── */}
          <div className="footer-links-group">
            <h4>Explore</h4>
            <ul>
              {QUICK_LINKS.map(({ label, page }) => (
                <li
                  key={page + label}
                  onClick={() => navigate(page)}
                  role="link"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(page)}
                >
                  {label}
                </li>
              ))}
            </ul>
          </div>

          {/* ── Contact / Info ── */}
          <div className="footer-links-group">
            <h4>About</h4>
            <ul>
              <li onClick={() => navigate('about')} role="link" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && navigate('about')}>
                About EcoTrack
              </li>
              <li>Open Source Project</li>
              <li>Privacy Policy</li>
              <li>Contact Us</li>
            </ul>
          </div>

        </div>

        {/* ── Methodology Disclaimer & Bottom bar ── */}
        <div className="footer-bottom">
          <p className="text-xs text-[#FAF9F6]/65 leading-relaxed max-w-4xl mx-auto mb-6 text-center">
            EcoTrack calculations are based on standardized educational emission factors compiled from the IPCC, US EPA, and UK DEFRA databases. Values are estimations designed to foster environmental literacy and habit formation. For corporate compliance or certified offset credits, consult an accredited ISO 14064 greenhouse gas auditor.
          </p>
          <p>
            © {new Date().getFullYear()} <strong>EcoTrack</strong>. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
