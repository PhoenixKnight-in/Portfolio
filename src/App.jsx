import './App.css'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useMemo, useRef, useState, useEffect, useLayoutEffect } from 'react'

/** Gmail web compose — works when `mailto:` has no app registered. */
const CONTACT_EMAIL = 'parthiban.m2024@vitstudent.ac.in'

const LINKEDIN_URL = 'https://www.linkedin.com/in/parthibanmathan/'

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light'
  const stored = localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function gmailComposeHref({ subject = '', body = '' } = {}) {
  const u = new URL('https://mail.google.com/mail/')
  u.searchParams.set('view', 'cm')
  u.searchParams.set('fs', '1')
  u.searchParams.set('to', CONTACT_EMAIL)
  if (subject) u.searchParams.set('su', subject)
  if (body) u.searchParams.set('body', body)
  return u.toString()
}

function openGmailCompose({ subject = '', body = '' } = {}) {
  window.open(gmailComposeHref({ subject, body }), '_blank', 'noopener,noreferrer')
}

// ─── 3-D Globe ────────────────────────────────────────────────────────────────
function WireGlobe({ color = '#2563eb' }) {
  const group = useRef(null)
  const globe = useRef(null)
  const ringA = useRef(null)
  const ringB = useRef(null)
  const geo = useMemo(() => new THREE.SphereGeometry(1.5, 48, 32), [])
  const ringGeo = useMemo(() => new THREE.TorusGeometry(2.1, 0.01, 8, 256), [])
  useFrame((state, dt) => {
    if (!group.current) return
    group.current.rotation.y += dt * 0.22
    group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.06
    if (globe.current) globe.current.rotation.z -= dt * 0.06
    if (ringA.current) ringA.current.rotation.z += dt * 0.22
    if (ringB.current) ringB.current.rotation.z -= dt * 0.18
  })
  return (
    <group ref={group} position={[0, 0, 0]}>
      <mesh ref={globe} geometry={geo}>
        <meshBasicMaterial color={color} wireframe transparent opacity={0.62} />
      </mesh>
      <mesh ref={ringA} geometry={ringGeo} rotation={[Math.PI / 2.7, 0, 0]}>
        <meshBasicMaterial color={color} transparent opacity={0.7} />
      </mesh>
      <mesh ref={ringB} geometry={ringGeo} rotation={[Math.PI / 3.8, 0, Math.PI / 4]}>
        <meshBasicMaterial color={color} transparent opacity={0.55} />
      </mesh>
      <pointLight color={color} intensity={1.1} distance={10} position={[2.8, 1.6, 3.4]} />
      <pointLight color={'#ffffff'} intensity={0.35} distance={10} position={[-3.2, -1.2, -2.2]} />
    </group>
  )
}

function Particles({ count = 700, color = '#93b4ff' }) {
  const points = useRef(null)
  const { positions, sizes } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const sz = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const r = 4.2 + Math.random() * 3.2
      const t = Math.random() * Math.PI * 2
      const p = (Math.random() - 0.5) * Math.PI
      pos[i * 3 + 0] = Math.cos(t) * Math.cos(p) * r
      pos[i * 3 + 1] = Math.sin(p) * r * 0.6
      pos[i * 3 + 2] = Math.sin(t) * Math.cos(p) * r
      sz[i] = 0.6 + Math.random() * 1.2
    }
    return { positions: pos, sizes: sz }
  }, [count])
  useFrame((state) => {
    if (!points.current) return
    points.current.rotation.y = state.clock.elapsedTime * 0.05
  })
  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-size" array={sizes} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial size={0.02} color={color} transparent opacity={0.55} sizeAttenuation />
    </points>
  )
}

function GlobeCanvas({ theme = 'light' }) {
  const isDark = theme === 'dark'
  const bg = isDark ? '#0b0f14' : '#f8f9fa'
  const wire = isDark ? '#60a5fa' : '#2563eb'
  const particles = isDark ? '#93c5fd' : '#93b4ff'
  const overlay = isDark
    ? 'linear-gradient(180deg, rgba(11,15,20,0.45) 0%, rgba(11,15,20,0.82) 45%, rgba(11,15,20,0.94) 100%)'
    : 'linear-gradient(180deg, rgba(248,249,250,0.55) 0%, rgba(248,249,250,0.88) 45%, rgba(248,249,250,0.95) 100%)'

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 0,
      pointerEvents: 'none', overflow: 'hidden',
    }}>
      <Canvas
        key={theme}
        style={{ width: '100%', height: '100%' }}
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 6.4], fov: 45, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={[bg]} />
        <fog attach="fog" args={[bg, 10, 22]} />
        <ambientLight intensity={isDark ? 0.45 : 0.55} />
        <WireGlobe color={wire} />
        <Particles color={particles} />
      </Canvas>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: overlay,
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}

// ─── Hero profile (oval) ─────────────────────────────────────────────────────
function HeroPhoto() {
  const [failed, setFailed] = useState(false)
  return (
    <div className="hero-photo-frame">
      {!failed && (
        <img
          className="hero-photo"
          src="/profile.png"
          alt="Parthiban M"
          loading="eager"
          decoding="async"
          onError={() => setFailed(true)}
        />
      )}
      {failed && (
        <div className="hero-photo-fallback" aria-hidden="true">
          PM
        </div>
      )}
    </div>
  )
}

// ─── Nav Link ─────────────────────────────────────────────────────────────────
function NavLink({ href, children, active }) {
  return (
    <a href={href} className={`nav-link ${active ? 'nav-link--active' : ''}`}>
      {children}
    </a>
  )
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHead({ label, title, sub }) {
  return (
    <div className="section-head">
      <span className="section-label">{label}</span>
      <h2>{title}</h2>
      {sub && <p className="section-sub">{sub}</p>}
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [activeNav, setActiveNav] = useState('home')
  const [theme, setTheme] = useState(getInitialTheme)

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme === 'dark' ? 'dark' : 'light'
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveNav(e.target.id)
        })
      },
      { threshold: 0.4 }
    )
    document.querySelectorAll('section[id]').forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>

      {/* ── Header ── */}
      <header className="site-header">
        <div className="container header-inner">
          <a className="brand" href="#top" aria-label="Go to top">
            <span className="brand-avatar" aria-hidden="true">PM</span>
            <span className="brand-stack">
              <span className="brand-title">Parthiban M</span>
              <span className="brand-tagline">Cyber Security Expert</span>
            </span>
          </a>

          <div className="header-right">
            <nav className="nav" aria-label="Primary">
              <NavLink href="#top" active={activeNav === 'top'}>Home</NavLink>
              <NavLink href="#about" active={activeNav === 'about'}>About</NavLink>
              <NavLink href="#skills" active={activeNav === 'skills'}>Skills</NavLink>
              <NavLink href="#projects" active={activeNav === 'projects'}>Projects</NavLink>
              <NavLink href="#contact" active={activeNav === 'contact'}>Contact</NavLink>
            </nav>
            <button
              type="button"
              className="theme-toggle"
              onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Fixed Globe Background (whole page) ── */}
      <GlobeCanvas theme={theme} />

      <main id="main">
        {/* ── Hero ── */}
        <section id="top" className="hero">
          <p className="hero-watermark" aria-hidden="true">
            SENTINEL
          </p>
          <div className="container hero-grid">
            <div className="hero-copy">
              <h1 className="hero-title">
                <span className="hero-name">Parthiban M</span>
              </h1>
              <p className="hero-role">Cyber Security Expert</p>
              <p className="hero-desc">
                Cybersecurity-focused developer building secure backends, scalable APIs, and intelligent applications. I
                specialize in finding weaknesses, strengthening systems, and delivering reliable software for real-world use.
              </p>

              <div className="cta-row">
                <a className="btn btn-primary" href="#contact">
                  Get in Touch
                </a>
                <a className="btn btn-ghost" href="#about">
                  Learn More
                </a>
              </div>

              <div className="hero-social" aria-label="Social links">
                <a
                  className="social-link"
                  href={gmailComposeHref()}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Email (opens Gmail)"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M4 6h16v12H4V6zm2 0l6 5 6-5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
                <a
                  className="social-link"
                  href="https://github.com/PhoenixKnight-in"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0022 12c0-5.523-4.477-10-10-10z" />
                  </svg>
                </a>
                <a
                  className="social-link"
                  href={LINKEDIN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>

            <div className="hero-photo-col">
              <HeroPhoto />
            </div>
          </div>
        </section>

        {/* ── About ── */}
        <section id="about" className="section">
          <div className="container">
            <SectionHead label="About" title="About Me" sub="CSE Cyber Security @ VIT Vellore (2024–Present). I enjoy building apps that ship fast—and securing them like they'll be attacked tomorrow." />
            <div className="cards two-col">
              <article className="card">
                <div className="card-label">Background</div>
                <p>
                  I'm a developer turned security-focused builder—comfortable across Flutter, Python, and backend systems. I
                  like working where software meets real-world threat models.
                </p>
              </article>
              <article className="card">
                <div className="card-label">What I'm Aiming For</div>
                <p>
                  Internships and research opportunities in cybersecurity, backend engineering, and applied AI/ML. Long-term:
                  build products that are both useful and resilient.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* ── Skills ── */}
        <section id="skills" className="section">
          <div className="container">
            <SectionHead label="Skills" title="Skills" sub="What I use to build, test, and ship." />
            <div className="skill-grid">
              <div className="card">
                <div className="card-label">Languages</div>
                <div className="pill-row">
                  {['Python', 'C', 'C++', 'Java', 'JavaScript', 'Dart'].map((s) => (
                    <span key={s} className="pill">{s}</span>
                  ))}
                </div>
              </div>
              <div className="card">
                <div className="card-label">Frameworks</div>
                <div className="pill-row">
                  {['FastAPI', 'Flutter'].map((s) => <span key={s} className="pill">{s}</span>)}
                </div>
              </div>
              <div className="card">
                <div className="card-label">Tools</div>
                <div className="pill-row">
                  {['MongoDB', 'Git', 'GitHub', 'Docker', 'REST APIs', 'Render'].map((s) => (
                    <span key={s} className="pill">{s}</span>
                  ))}
                </div>
              </div>
              <div className="card">
                <div className="card-label">Domains</div>
                <div className="pill-row">
                  {['Cybersecurity', 'Network Analysis', 'Backend', 'AI/ML', 'Threat Modeling'].map((s) => (
                    <span key={s} className="pill">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Projects ── */}
        <section id="projects" className="section">
          <div className="container">
            <SectionHead label="Projects" title="Projects" sub="Strong builds with clear problems, solutions, and impact." />
            <div className="project-grid">
              <ProjectCard
                title="AI-Interview Coach — Talk2Hire"
                badge="Multimodal Feedback"
                desc="A multimodal interview coaching system combining facial, audio, and text analysis to give actionable feedback."
                role="Built FastAPI backend (Whisper speech pipeline + ML inference) and integrated Flutter frontend authentication + API flows."
                tech="Flutter, FastAPI, Whisper, MongoDB, Multimodal ML"
                github="https://github.com/PhoenixKnight-in/AI-Interview-Coach-Talk2Hire"
              />
              <ProjectCard
                title="NewsByte_AI"
                badge="NLP + Summarization"
                desc="Fetches YouTube news videos, extracts transcripts, and generates concise summaries with category-based browsing."
                role="Developed FastAPI backend for retrieval + transcript processing + NLP summarization; integrated Flutter UI flows."
                tech="Flutter, FastAPI, MongoDB, NLP"
                github="https://github.com/PhoenixKnight-in/NewsByte_AI"
              />
              <ProjectCard
                title="PentestLite — Vulnerability Scanner"
                badge="Security Tooling"
                desc="Simulates a penetration-testing workflow with port scanning, enumeration, basic web vulnerability checks, and report generation."
                role="Implemented async port scanning (1000+ ports), subdomain/directory enumeration, SQLi/XSS checks, severity scoring, and HTML reporting."
                tech="Python, FastAPI, Socket Programming, Requests, Metasploit"
                github="https://github.com/PhoenixKnight-in/Pentestlite"
              />
              <ProjectCard
                title="Rare Attack Detection in IDS"
                badge="Research"
                desc="Research-in-progress on detecting rare attacks in highly imbalanced intrusion datasets using hybrid data-level + algorithm-level strategies."
                role="Proposed approach; evaluated anomaly detection vs supervised learning under extreme imbalance; optimized PR-AUC."
                tech="ML, Cost-sensitive XGBoost, Feature Selection"
                github="https://github.com/PhoenixKnight-in/IDS_NDL_Data_set"
              />
            </div>
          </div>
        </section>

        {/* ── Resume ── */}
        <section id="resume" className="section">
          <div className="container">
            <SectionHead label="Resume" title="Resume" sub="One page, clean, downloadable PDF." />
            <div className="cards two-col">
              <div className="card">
                <div className="card-label">Download</div>
                <p className="muted">Click Here to Download my Resume</p>
                <div className="row">
                  <a className="btn btn-neon" href="/resume.pdf" download>Download PDF</a>
                  <a className="btn btn-ghost" href="/resume.pdf" target="_blank" rel="noreferrer">View Online</a>
                </div>
              </div>
              <div className="card">
                <div className="card-label">Quick Details</div>
                <ul className="bullets">
                  <li><strong>Education:</strong> VIT Vellore — B.Tech CSE (Cyber Security), 2024–Present</li>
                  <li><strong>Coursework:</strong> DSA, OOP, Computer Networks, Ethical Hacking, Flutter App Development</li>
                  <li><strong>Extracurricular:</strong> Tech Mentor (Board Member), TAM Club — VIT Vellore</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── Achievements ── */}
        <section id="achievements" className="section">
          <div className="container">
            <SectionHead
              label="Achievements"
              title="Achievements & Certifications"
              sub="Credentials, programs, and highlights that back up the work."
            />

            <div className="certs-grid">
              <article className="card cert-card">
                <a
                  className="cert-thumb"
                  href="/certificates/deloitte-cyber-simulation.png"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="View Deloitte Cyber Job Simulation certificate (full size)"
                >
                  <img
                    src="/certificates/deloitte-cyber-simulation.png"
                    alt="Certificate of Completion: Deloitte Cyber Job Simulation on Forage for Parthiban Mathan"
                    loading="lazy"
                    decoding="async"
                  />
                </a>
                <div className="cert-body">
                  <h3 className="cert-title">Cyber Job Simulation</h3>
                  <p className="cert-org">Deloitte · Forage</p>
                  <p className="cert-date">Completed March 28, 2026</p>
                  <p className="cert-desc muted">
                    Practical tasks across cybersecurity in a professional job simulation format.
                  </p>
                </div>
              </article>

              <article className="card cert-card">
                <a
                  className="cert-thumb"
                  href="/certificates/udemy-python-ethical-hacking.png"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="View Udemy certificate (full size)"
                >
                  <img
                    src="/certificates/udemy-python-ethical-hacking.png"
                    alt="Udemy Certificate: Learn Python & Ethical Hacking From Scratch for Parthiban"
                    loading="lazy"
                    decoding="async"
                  />
                </a>
                <div className="cert-body">
                  <h3 className="cert-title">Learn Python & Ethical Hacking From Scratch</h3>
                  <p className="cert-org">Udemy · Zaid Sabih, z Security</p>
                  <p className="cert-date">Completed Jan 20, 2026 · 25 hours</p>
                  <p className="cert-desc muted">Certificate of completion for the full course.</p>
                  <a
                    className="cert-verify"
                    href="https://ude.my/UC-c155a491-241e-438a-94b6-44e900416c80"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Verify on Udemy
                  </a>
                </div>
              </article>
            </div>

            <div className="card achievements-extra">
              <div className="card-label">Also</div>
              <ul className="bullets">
                <li>
                  <strong>LeetCode:</strong> Solved 40+ problems
                </li>
                <li>
                  <strong>Mentorship:</strong> Mentored students in app dev, backend systems, and cybersecurity
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ── Blog ── */}
        <section id="blog" className="section">
          <div className="container">
            <SectionHead label="Blog" title="Blog" sub="Writeups that show how you think: security notes, project breakdowns, learning logs." />
            <div className="cards three-col">
              <article className="card">
                <div className="card-label">Security Writeups</div>
                <p className="muted">Add CTF notes, threat models, and analysis posts.</p>
              </article>
              <article className="card">
                <div className="card-label">Project Breakdowns</div>
                <p className="muted">Document architecture, trade-offs, and lessons learned.</p>
              </article>
              <article className="card">
                <div className="card-label">Learning Notes</div>
                <p className="muted">Short notes on topics like DNS, HTTP, Linux, and tooling.</p>
              </article>
            </div>
          </div>
        </section>

        {/* ── Contact ── */}
        <section id="contact" className="section">
          <div className="container">
            <SectionHead label="Contact" title="Contact" sub="If you want to collaborate or have an opportunity, I'm easy to reach." />
            <div className="cards two-col">
              <div className="card">
                <div className="card-label">Reach Me Directly</div>
                <ul className="bullets">
                  <li>
                    <strong>Email:</strong>{' '}
                    <a href={gmailComposeHref()} target="_blank" rel="noopener noreferrer">
                      parthiban.m2024@vitstudent.ac.in
                    </a>
                  </li>
                  <li><strong>Phone:</strong> +91 8925154951</li>
                  <li><strong>GitHub:</strong> <a href="https://github.com/PhoenixKnight-in" target="_blank" rel="noreferrer">PhoenixKnight-in</a></li>
                  <li>
                    <strong>LinkedIn:</strong>{' '}
                    <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">
                      parthibanmathan
                    </a>
                  </li>
                </ul>
              </div>

              <div className="card form-card">
                <div className="card-label">Send a Message</div>
                <ContactForm />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="site-footer">
        <div className="container footer-inner">
          <div className="footer-left">
            <span className="brand-title footer-brand">Parthiban M</span>
            <p className="muted footer-sub">Cybersecurity • Backend • Flutter</p>
          </div>
          <div className="footer-links" aria-label="Social links">
            <a href="https://github.com/PhoenixKnight-in" target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              LinkedIn
            </a>
            <a href="#" aria-label="LeetCode">
              LeetCode
            </a>
            <a href="#" aria-label="Codeforces">
              Codeforces
            </a>
          </div>
        </div>
      </footer>
    </>
  )
}

// ─── Project Card ─────────────────────────────────────────────────────────────
function ProjectCard({ title, badge, desc, role, tech, github }) {
  return (
    <article className="card project">
      <div className="project-top">
        <div className="card-label">Project</div>
        <span className="badge">{badge}</span>
      </div>
      <h3 className="project-title">{title}</h3>
      <p className="muted">{desc}</p>
      <ul className="bullets">
        <li><strong>Role:</strong> {role}</li>
        <li><strong>Tech:</strong> {tech}</li>
      </ul>
      <div className="project-actions">
        <a className="btn btn-ghost" href={github} target="_blank" rel="noreferrer">GitHub →</a>
        <button className="btn btn-dim" type="button" disabled>Live Demo (add link)</button>
      </div>
    </article>
  )
}

// ─── Contact Form ─────────────────────────────────────────────────────────────
function ContactForm() {
  const handleSubmit = (e) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const name = String(form.get('name') || '').trim()
    const email = String(form.get('email') || '').trim()
    const message = String(form.get('message') || '').trim()
    openGmailCompose({
      subject: `Portfolio contact from ${name || 'someone'}`,
      body: `From: ${name}\nEmail: ${email}\n\n${message}`,
    })
  }
  return (
    <form className="form" onSubmit={handleSubmit}>
      <label className="field">
        <span>Name</span>
        <input name="name" type="text" placeholder="Your name" required />
      </label>
      <label className="field">
        <span>Email</span>
        <input name="email" type="email" placeholder="you@example.com" required />
      </label>
      <label className="field">
        <span>Message</span>
        <textarea name="message" rows={4} placeholder="What would you like to talk about?" required />
      </label>
      <button className="btn btn-neon" type="submit">Send Message</button>
      <p className="fineprint muted">Opens your email client. No backend needed.</p>
    </form>
  )
}