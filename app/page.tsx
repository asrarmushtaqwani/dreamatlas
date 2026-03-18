'use client'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Canvas, useFrame } from '@react-three/fiber'
import { MeshTransmissionMaterial, Float, Environment, ContactShadows } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'

// ──── 3D GLASS HERO ORB ────────────────────────────────────────────────────────
function GlassHeroMesh() {
  const mesh = useRef<THREE.Mesh>(null)
  
  useFrame((state, delta) => {
    if (mesh.current) {
      mesh.current.rotation.x += delta * 0.15
      mesh.current.rotation.y += delta * 0.2
    }
  })

  return (
    <group position={[0, 0, 0]}>
      <Float floatIntensity={4} rotationIntensity={2} speed={3}>
        <mesh ref={mesh} scale={2.5}>
          <icosahedronGeometry args={[1, 1]} />
          <MeshTransmissionMaterial 
            backside={false}
            samples={4}
            thickness={1.5}
            roughness={0.1}
            clearcoat={1}
            clearcoatRoughness={0.1}
            transmission={0.95}
            ior={1.2}
            chromaticAberration={0.08}
            anisotropy={0.1}
            color="#ffffff"
            attenuationDistance={0.5}
            attenuationColor="#ffffff"
          />
        </mesh>
      </Float>
      {/* Subtle light specifically for the glass object */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} color="#8ab4f8" />
      <directionalLight position={[-10, -10, -5]} intensity={1} color="#c58af9" />
    </group>
  )
}

// ──── ANIMATION VARIANTS ───────────────────────────────────────────────────────
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as any } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 }
  }
}

// ──── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const yHeroText = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacityHeroText = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div style={{ position: 'relative', width: '100%', overflowX: 'hidden' }}>

      {/* ── NAVIGATION ────────────────────────────────────────────────────────── */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" as any }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 5vw',
        }}
        className="glass-nav"
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em',
            display: 'flex', alignItems: 'center', gap: 10
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'linear-gradient(135deg, #ffffff 0%, #888888 100%)',
              boxShadow: '0 0 20px rgba(255,255,255,0.4)',
            }} />
            DreamAtlas
          </div>
        </Link>

        {/* Links (Desktop) */}
        <div style={{ display: 'flex', gap: 32 }} className="hide-mobile">
          {['Atlas', 'How it works', 'Worlds'].map(item => (
            <Link key={item} href="#" style={{
              color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500,
              textDecoration: 'none', transition: 'color 0.3s'
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              {item}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/auth/login" className="hide-mobile" style={{ textDecoration: 'none' }}>
            <button className="btn-glass">Sign In</button>
          </Link>
          <Link href="/auth/signup" style={{ textDecoration: 'none' }}>
            <button className="btn-premium">Start dreaming</button>
          </Link>
        </div>
      </motion.nav>


      {/* ── HERO SECTION ──────────────────────────────────────────────────────── */}
      <section style={{ 
        position: 'relative', height: '100vh', width: '100%', 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        paddingTop: 80 
      }}>
        
        {/* 3D Background Canvas Layer */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
          <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
            <Environment preset="city" />
            <GlassHeroMesh />
            <ContactShadows resolution={1024} scale={20} blur={2} opacity={0.5} far={10} color="#000000" />
          </Canvas>
        </div>

        {/* Hero Content */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          style={{ 
            position: 'relative', zIndex: 10, textAlign: 'center', 
            y: yHeroText, opacity: opacityHeroText,
            maxWidth: 1000, padding: '0 24px'
          }}
        >
          <motion.div variants={fadeInUp} style={{
            display: 'inline-flex', padding: '8px 20px', borderRadius: 999,
            background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            marginBottom: 40, alignItems: 'center', gap: 10
          }}>
            <span style={{ width: 8, height: 8, background: '#fff', borderRadius: '50%', boxShadow: '0 0 10px #fff' }} />
            <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: '0.04em' }}>Open Source Intelligence</span>
          </motion.div>

          <motion.h1 
            variants={fadeInUp}
            style={{ 
              fontFamily: 'var(--font-display)', fontWeight: 600,
              fontSize: 'clamp(56px, 9vw, 110px)', lineHeight: 0.95, letterSpacing: '-0.03em',
              marginBottom: 32
            }}
          >
            Map your unconscious.<br />
            In absolute seconds.
          </motion.h1>

          <motion.p 
            variants={fadeInUp}
            style={{
              fontSize: 'clamp(16px, 2vw, 20px)', color: 'var(--text-secondary)',
              maxWidth: 580, margin: '0 auto 50px', lineHeight: 1.6, fontWeight: 400
            }}
          >
            Log your dreams. Connect with the global collective. Built for dreamers who want deep Jungian analysis at the speed of thought.
          </motion.p>

          <motion.div variants={fadeInUp} style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth/signup" style={{ textDecoration: 'none' }}>
              <button className="btn-premium" style={{ padding: '20px 48px', fontSize: 17 }}>Begin your atlas</button>
            </Link>
            <Link href="/map" style={{ textDecoration: 'none' }}>
              <button className="btn-glass" style={{ padding: '20px 48px', fontSize: 17 }}>Explore the map →</button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── FEATURES GRID ─────────────────────────────────────────────────────── */}
      <section style={{ 
        position: 'relative', zIndex: 10, padding: '120px 5vw',
        background: 'linear-gradient(180deg, transparent, rgba(5,5,8,0.8) 20%)'
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: 100 }}>
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            style={{ 
              fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 64px)', 
              letterSpacing: '-0.02em', marginBottom: 24
            }}
          >
            Deep psychoanalysis.<br />Instant cartography.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.1 }}
            style={{ color: 'var(--text-secondary)', fontSize: 18, maxWidth: 600, margin: '0 auto' }}
          >
            Advanced analytics, 3D cartography, and social resonance designed to map out the depths of human sleep.
          </motion.p>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24,
          maxWidth: 1400, margin: '0 auto'
        }}>
          {[
            { tag: 'AI Engine', title: 'Deep Archetype Analysis', desc: 'Gemini reads your dream and surfaces archetypes, symbols, and a Jungian essence — in absolute milliseconds.' },
            { tag: 'Visualization', title: 'The Collective Atlas', desc: "Every dream becomes a glowing point on a shared 3D global map. Watch humanity's unconscious rendered in real time WebGL." },
            { tag: 'Social', title: 'Dream Twins', desc: 'AI compares your archetype fingerprint against every dreamer on earth to find your unconscious doppelgänger.' },
            { tag: 'Insights', title: 'Dream Wrapped', desc: 'Every month, Gemini writes a bespoke literary portrait of your sleep: archetypes, symbols, and your unique fingerprint.' },
            { tag: 'Territories', title: 'Dreamworlds', desc: 'Nine canonical Jungian territories. Your dreams automatically populate the worlds they rhythmically inhabit.' },
            { tag: 'Algorithm', title: 'Resonance Scoring', desc: 'AI scores the symbolic overlap between your deepest dreams and others, discovering shared unconscious pathways.' },
          ].map((feature, i) => (
            <motion.div 
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="glass-card"
              style={{ padding: '40px 32px', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ 
                fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', 
                color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 20 
              }}>
                {feature.tag}
              </div>
              <h3 style={{ 
                fontFamily: 'var(--font-display)', fontSize: 24, 
                marginBottom: 16, letterSpacing: '-0.01em' 
              }}>
                {feature.title}
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 15 }}>
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── METRICS / SOCIAL PROOF ────────────────────────────────────────────── */}
      <section style={{ padding: '120px 5vw', display: 'flex', justifyContent: 'center' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="glass-card"
          style={{
            maxWidth: 1000, width: '100%', padding: '80px 40px', textAlign: 'center',
            display: 'flex', flexDirection: 'column', gap: 60
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8vw' }}>
            {[
              { val: '2,847', label: 'Dreams Mapped' },
              { val: '9',     label: 'Jungian Worlds' },
              { val: '48',    label: 'Countries' },
            ].map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
              >
                <div style={{ 
                  fontFamily: 'var(--font-display)', fontSize: 'clamp(48px, 6vw, 72px)', 
                  fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1 
                }}>
                  {stat.val}
                </div>
                <div style={{ 
                  fontSize: 13, fontWeight: 500, letterSpacing: '0.1em', 
                  color: 'var(--text-tertiary)', textTransform: 'uppercase', marginTop: 12 
                }}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────────── */}
      <footer style={{ 
        padding: '40px 5vw', borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 24,
        background: 'rgba(3,3,5,0.8)', backdropFilter: 'blur(20px)'
      }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600 }}>
          DreamAtlas
        </div>
        <div style={{ display: 'flex', gap: 32, fontSize: 14, color: 'var(--text-secondary)' }}>
          <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>AGPL-3.0 License</a>
          <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>GitHub</a>
          <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy</a>
        </div>
      </footer>

      {/* Mobile Bottom Navigation (Visible only on mobile) */}
      <div className="hide-desktop" style={{
        position: 'fixed', bottom: 20, left: 20, right: 20, zIndex: 100,
        background: 'rgba(20, 20, 25, 0.75)', backdropFilter: 'blur(30px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24,
        padding: '16px 24px', display: 'flex', justifyContent: 'space-around',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
      }}>
        <Link href="/map" style={{ color: '#fff', textDecoration: 'none', fontSize: 12, fontWeight: 600 }}>Map</Link>
        <Link href="/log" style={{ color: '#fff', textDecoration: 'none', fontSize: 12, fontWeight: 600 }}>Log</Link>
        <Link href="/journal" style={{ color: '#fff', textDecoration: 'none', fontSize: 12, fontWeight: 600 }}>Journal</Link>
      </div>

    </div>
  )
}