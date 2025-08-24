"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import heroImg from "./kalam-hero.png";
import { Send, Loader2, MessageSquare, Languages, Upload, Settings } from "lucide-react";
import WritingStyleUpload from "@/components/WritingStyleUpload";
import AcademicPaperSearch from "@/components/AcademicPaperSearch";
import StylePersonasDashboard from "@/components/StylePersonasDashboard";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Page() {
  // Workspace state (from previous full-feature page)
  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [useWritingStyle, setUseWritingStyle] = useState(true);
  const [selectedPersona, setSelectedPersona] = useState<string>("default");
  const [availablePersonas, setAvailablePersonas] = useState<Array<{ id: string; name: string; status: string }>>([]);
  const [processingPersonas, setProcessingPersonas] = useState<Array<{ id: string; name: string; status: string }>>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"generate" | "academic" | "personas" | "upload">("generate");
  const [scrollProgress, setScrollProgress] = useState(0);
  const { data: session } = useSession();

  // Derived quick stats
  const personaCount = availablePersonas.length;
  const processingCount = processingPersonas.length;
  const promptLength = prompt.trim().length;
  const responseLength = response.trim().length;

  const fetchPersonas = async () => {
    try {
      const res = await fetch("/api/personas");
      const data = await res.json();
      if (res.ok) {
        const all = data.personas || [];
        const ready = all.filter((p: { status: string }) => p.status === "ready");
        const processing = all.filter((p: { status: string }) => p.status === "processing");
        setAvailablePersonas(ready);
        setProcessingPersonas(processing);
      }
    } catch (e) {
      console.error("Error fetching personas:", e);
    }
  };

  useEffect(() => { fetchPersonas(); }, []);
  useEffect(() => { if (activeTab === "generate") fetchPersonas(); }, [activeTab]);

  // Scroll progress var (optional visual hooks)
  const onScroll = useCallback(() => {
    const scrolled = window.scrollY;
    const height = document.documentElement.scrollHeight - window.innerHeight;
    const progress = height > 0 ? scrolled / height : 0;
    setScrollProgress(progress);
    document.documentElement.style.setProperty("--scroll-progress", `${Math.min(100, Math.max(0, progress * 100))}%`);
  }, []);
  useEffect(() => {
    document.documentElement.style.setProperty("--mounted", "1");
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  const generateText = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }
    setIsLoading(true);
    setError("");
    setResponse("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          language: language || "English",
          useWritingStyle,
          selectedPersona,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate text");
      setResponse(data.response || data.text || data.result || data.output || data.message || data.content || "");
    } catch (err: any) {
      setError(err?.message || "An error occurred while generating text");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      generateText();
    }
  };

  return (
    <div className="page">
      <header className="header">
        <div className="container header-inner">
          <a href="#" className="brand" aria-label="Kalam AI Home">
            <img src="/kalam-ai-logo.svg" alt="Kalam AI" className="brand-logo" />
            <span className="brand-name">Kalam AI</span>
          </a>
          <nav className="nav" aria-label="Primary">
            <a href="#features" className="nav-link">Features</a>
            <a href="#demo" className="nav-link">AI Workspace</a>
            <a href="#demo" className="nav-link" onClick={(e) => { e.preventDefault(); setActiveTab('upload'); }}>Upload Style</a>
            <a href="#testimonials" className="nav-link">Testimonials</a>
            <a href="#contact" className="nav-link">Contact</a>
            {session ? (
              <button className="btn small btn-ghost" onClick={() => signOut()}>{session.user?.name ? `Sign out (${session.user.name.split(' ')[0]})` : 'Sign out'}</button>
            ) : (
              <a href="/login" className="btn small btn-primary">Sign in</a>
            )}
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="section hero" aria-labelledby="hero-heading">
          <div className="container hero-inner">
            <div className="hero-copy">
              <h1 id="hero-heading" className="hero-title">
                Write smarter with a human touch
              </h1>
              <p className="hero-sub">Kalam AI blends creativity with precision to generate clear, engaging, and on-brand content—fast.</p>
              <div className="hero-cta">
                <a href="#demo" className="btn btn-primary">Try the live demo</a>
                <a href="#features" className="btn btn-ghost">Explore features</a>
              </div>
            </div>
            <div className="hero-art" aria-hidden="true">
              {/* Static import works with Turbopack and includes metadata */}
              <Image src={heroImg} alt="Kalam AI Hero Art" className="hero-img" priority />
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="section features" aria-labelledby="features-heading">
          <div className="container">
            <h2 id="features-heading" className="section-title">Powerful features, friendly experience</h2>
            <p className="section-sub">A modern toolkit that’s fast, intuitive, and built for real-world writing workflows.</p>
            <div className="grid features-grid">
              {[
                {
                  title: "Style Personas",
                  desc: "Capture brand voice or author style to keep every output consistent.",
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M12 3l7 4v10l-7 4-7-4V7l7-4z" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  ),
                },
                {
                  title: "Humanized Outputs",
                  desc: "Natural tone, smart structure, and subtle imperfections for authenticity.",
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M8 12h8" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  ),
                },
                {
                  title: "Multilingual",
                  desc: "Write and translate across languages while preserving voice.",
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M4 8h16M4 16h16M8 4v16M16 4v16" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  ),
                },
                {
                  title: "Fast & Lightweight",
                  desc: "Minimalistic UI, smooth animations, and instant feedback.",
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M4 12l6 6L20 6" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  ),
                },
                {
                  title: "Safe & Transparent",
                  desc: "Clear prompts, controllable tone, and visible context.",
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M12 3l8 4v6c0 4-3 7-8 8-5-1-8-4-8-8V7l8-4z" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  ),
                },
                {
                  title: "Extensible",
                  desc: "APIs and modular design to grow with your needs.",
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M12 6v12M6 12h12" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  ),
                },
              ].map((f) => (
                <div key={f.title} className="card feature">
                  <div className="icon">{f.icon}</div>
                  <h3 className="card-title">{f.title}</h3>
                  <p className="card-desc">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Live Workspace (replaces simple demo) */}
        <section id="demo" className="section demo" aria-labelledby="workspace-heading">
          <div className="container">
            <h2 id="workspace-heading" className="section-title">AI Workspace</h2>
            <p className="section-sub">Generate content, explore academic styles, and manage personas—all in one place.</p>

            {/* Quick Actions */}
            <div className="actions center mb-16" role="tablist" aria-label="Workspace sections">
              <button role="tab" aria-selected={activeTab === 'generate'} className={`btn ${activeTab === 'generate' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab("generate")}>
                AI Generator
              </button>
              <button role="tab" aria-selected={activeTab === 'academic'} className={`btn ${activeTab === 'academic' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab("academic")}>
                Academic Papers
              </button>
              <button role="tab" aria-selected={activeTab === 'personas'} className={`btn ${activeTab === 'personas' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab("personas")}>
                Style Personas
              </button>
              <button role="tab" aria-selected={activeTab === 'upload'} className={`btn ${activeTab === 'upload' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab("upload")}>
                Upload Style
              </button>
            </div>

            {/* Stats strip */}
            <div className="grid stats-grid">
              <div className="card text-center">
                <div className="card-title">Personas Ready</div>
                <div className="card-desc metric">{personaCount || 0}</div>
              </div>
              <div className="card text-center">
                <div className="card-title">Processing</div>
                <div className="card-desc metric">{processingCount}</div>
              </div>
              <div className="card text-center">
                <div className="card-title">Prompt Chars</div>
                <div className="card-desc metric">{promptLength}</div>
              </div>
              <div className="card text-center">
                <div className="card-title">Response Chars</div>
                <div className="card-desc metric">{responseLength}</div>
              </div>
            </div>

            {/* removed standalone upload section in favor of a dedicated tab */}

            {/* Tabs content */}
            {activeTab === "generate" && (
              <div className="demo-grid">
                {/* Input */}
                <div className="demo-input card">
                  <label htmlFor="language" className="label">Language (optional)</label>
                  <input
                    id="language"
                    type="text"
                    className="textarea"
                    placeholder="e.g., English, Spanish, French, Arabic..."
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    spellCheck={false}
                  />

                  <label htmlFor="prompt" className="label mt-12">Your prompt</label>
                  <textarea
                    id="prompt"
                    className="textarea"
                    placeholder="e.g., Write a friendly product announcement for our new feature..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyPress={handleKeyPress}
                    rows={7}
                    spellCheck={false}
                  />

                  <label htmlFor="persona" className="label mt-12">Writing Style</label>
                  <select id="persona" className="textarea" value={selectedPersona} onChange={(e) => setSelectedPersona(e.target.value)}>
                    <option value="default">Default AI Style</option>
                    <option value="human-writer">🖋️ Human Writer (Natural & Conversational)</option>
                    <option value="personal">Your Personal Style</option>
                    {availablePersonas.length > 0 && (
                      <optgroup label="— Learned Academic Personas —">
                        {availablePersonas.map((p) => (
                          <option key={p.id} value={p.id}>📚 {p.name}</option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                  {processingPersonas.length > 0 && (
                    <p className="hint warn mt-6">
                      🔄 {processingPersonas.length} persona{processingPersonas.length > 1 ? "s" : ""} processing: {processingPersonas.map(p => p.name).join(", ")}
                    </p>
                  )}

                  <div className="mt-12">
                    <label htmlFor="useStyle" className="label inline-flex">
                      <Settings className="h-4 w-4" /> <span>Use My Writing Style</span>
                    </label>
                    <div className="mt-neg-6">
                      <input id="useStyle" type="checkbox" checked={useWritingStyle} onChange={(e) => setUseWritingStyle(e.target.checked)} />
                      <span className="hint ml-8">Match your personal writing tone</span>
                    </div>
                  </div>

                  <div className="actions mt-12">
                    <button className="btn btn-primary" onClick={generateText} disabled={isLoading || !prompt.trim()}>
                      <span className="inline-flex">
                        {isLoading ? <Loader2 className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                        <span>{isLoading ? "Generating..." : "Generate Text"}</span>
                      </span>
                    </button>
                  </div>
                  {error && <p className="hint warn mt-8" role="status">{error}</p>}
                </div>

                {/* Output */}
                <div className="demo-output card">
                  <div className="output-header">
                    <h3 className="card-title">Output</h3>
                  </div>
                  <div className="output-body" aria-live="polite">
                    {isLoading && <div className="skeleton" />}
                    {!isLoading && response && (
                      <pre className="pre">{response}</pre>
                    )}
                    {!isLoading && !response && (
                      <div className="placeholder">
                        <MessageSquare className="h-6 w-6" />
                        <div>Generated content will appear here.</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "academic" && (
              <div className="card p-0">
                <div className="pad-18">
                  <h3 className="card-title mb-6">Academic Papers</h3>
                  <p className="card-desc mb-12">Search and explore academic paper styles to refine generated output.</p>
                </div>
                <div className="border-top">
                  <AcademicPaperSearch />
                </div>
              </div>
            )}

            {activeTab === "personas" && (
              <div className="card p-0">
                <div className="pad-18 row between center-y">
                  <div>
                    <h3 className="card-title mb-6">Style Personas</h3>
                    <p className="card-desc">Create, manage, and analyze style personas for authentic outputs.</p>
                  </div>
                  <button className="btn btn-primary" onClick={() => setShowUploadModal(true)}>
                    <span className="inline-flex"><Upload className="h-4 w-4" /> Upload Your Writing Style</span>
                  </button>
                </div>
                <div className="border-top">
                  <StylePersonasDashboard />
                </div>
              </div>
            )}

            {activeTab === "upload" && (
              <div id="upload-style" className="card">
                <h3 className="card-title mb-6">Upload Your Writing Style</h3>
                <p className="card-desc mb-12">Help Kalam AI learn your voice. Upload a short sample so outputs match your tone, pacing, and vocabulary.</p>
                <div className="actions">
                  <button className="btn btn-primary" onClick={() => setShowUploadModal(true)}>
                    <span className="inline-flex"><Upload className="h-4 w-4" /> Upload Writing Sample</span>
                  </button>
                </div>
                 {/* Global modal mount so it works from any tab */}
            {showUploadModal && (
              <WritingStyleUpload onClose={() => setShowUploadModal(false)} onSave={() => fetchPersonas()} />
            )}
              </div>
              
            )}

          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="section testimonials" aria-labelledby="t-heading">
          <div className="container">
            <h2 id="t-heading" className="section-title">Trusted by thoughtful teams</h2>
            <div className="grid testimonial-grid">
              {[ 
                {
                  quote: "Kalam AI nails our brand voice—our content feels more human and consistent.",
                  name: "Priya Sharma",
                  role: "Head of Content, Aurora Labs",
                },
                {
                  quote: "A joy to use. The UI is clean, fast, and the outputs save us hours each week.",
                  name: "Michael Chen",
                  role: "Product Manager, NovaSoft",
                },
                {
                  quote: "Finally, AI that respects tone and nuance. It’s become part of our workflow.",
                  name: "Sara Alvarez",
                  role: "Marketing Lead, Lumen.io",
                },
              ].map((t) => (
                <figure key={t.name} className="card testimonial">
                  <blockquote className="quote">“{t.quote}”</blockquote>
                  <figcaption className="who">
                    <div className="who-dot" aria-hidden />
                    <div>
                      <div className="who-name">{t.name}</div>
                      <div className="who-role">{t.role}</div>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" className="footer" aria-labelledby="footer-heading">
        <div className="container footer-inner">
          <div className="brand-row">
            <img src="/kalam-ai-logo.svg" alt="Kalam AI" className="brand-logo" />
            <span className="brand-name">Kalam AI</span>
          </div>
          <div className="footer-links">
            <a href="https://github.com/Agam0795" target="_blank" rel="noreferrer noopener" className="social" aria-label="GitHub">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 .5a12 12 0 00-3.79 23.4c.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.2.08 1.83 1.24 1.83 1.24 1.07 1.83 2.8 1.3 3.48.99.11-.78.42-1.3.76-1.6-2.67-.31-5.47-1.34-5.47-5.98 0-1.32.47-2.39 1.24-3.23-.12-.3-.54-1.54.12-3.2 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 016 0c2.3-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.9.12 3.2.77.84 1.24 1.9 1.24 3.23 0 4.65-2.8 5.66-5.48 5.97.44.38.82 1.13.82 2.28v3.38c0 .32.22.69.83.57A12 12 0 0012 .5z" />
              </svg>
            </a>
            <a href="https://x.com" target="_blank" rel="noreferrer noopener" className="social" aria-label="X (Twitter)">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M20 3h-3l-4 5-4-5H6l5 7-6 8h3l4-5 4 5h3l-5-7 6-8z" />
              </svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer noopener" className="social" aria-label="LinkedIn">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM0 8h5v15H0V8zm7.5 0H12v2.1C12.7 9.4 14 8 16.4 8 21 8 21 11.3 21 15.6V23h-5v-6.3c0-1.5 0-3.3-2-3.3s-2.3 1.6-2.3 3.2V23h-4.9V8z" />
              </svg>
            </a>
          </div>
          <p className="fine">© {new Date().getFullYear()} Kalam AI. All rights reserved.</p>
        </div>
      </footer>

      <style jsx global>{`
        :root { --mounted: 0; }
        *, *::before, *::after { box-sizing: border-box; }
        html, body, #__next { height: 100%; }
        body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial, "Apple Color Emoji", "Segoe UI Emoji"; color: #0f172a; background: #f7fbff; }
        a { color: inherit; text-decoration: none; }
        .container { width: min(1160px, 92%); margin-inline: auto; }

        /* Header */
        .header { position: sticky; top: 0; z-index: 30; backdrop-filter: saturate(1.2) blur(8px); background: color-mix(in oklab, white 80%, transparent); border-bottom: 1px solid #e6eef7; }
        .header-inner { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; }
        .brand { display: inline-flex; align-items: center; gap: 10px; }
        .brand-logo { width: 28px; height: 28px; filter: drop-shadow(0 2px 4px rgba(2, 74, 122, 0.15)); }
        .brand-name { font-weight: 700; letter-spacing: 0.2px; color: #0a2e57; }
        .nav { display: flex; gap: 18px; align-items: center; }
        .nav-link { padding: 8px 12px; border-radius: 10px; color: #355a7e; transition: 200ms ease; }
        .nav-link:hover { background: #eaf4ff; color: #0a2e57; }
  .btn-ghost.active { border-color: #0f6eea; color: #0f6eea; }

        /* Hero */
        .section { padding: 72px 0; }
        .hero { position: relative; overflow: clip; background: linear-gradient(180deg, #f7fbff 0%, #eef6ff 100%); }
        .hero-inner { display: grid; grid-template-columns: 1.1fr 0.9fr; align-items: center; gap: 32px; min-height: 62vh; }
        .hero-title { font-size: clamp(32px, 4vw, 52px); line-height: 1.08; margin: 0 0 14px; color: #0a2e57; letter-spacing: -0.3px; }
        .hero-sub { margin: 0 0 22px; font-size: clamp(16px, 2vw, 18px); color: #3a5e83; }
        .hero-cta { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
        .btn { appearance: none; border: 1px solid transparent; background: #f2f6fb; color: #0a2e57; padding: 10px 16px; border-radius: 12px; font-weight: 600; cursor: pointer; transition: transform 120ms ease, background 180ms ease, border-color 180ms ease, color 180ms ease, box-shadow 180ms ease; }
        .btn:hover { transform: translateY(-1px); }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .btn-primary { background: linear-gradient(180deg, #2b8efb, #0f6eea); color: white; border-color: #0f6eea; box-shadow: 0 10px 24px rgba(15, 110, 234, 0.22); }
        .btn-primary:hover { box-shadow: 0 14px 28px rgba(15, 110, 234, 0.28); }
        .btn-ghost { background: transparent; border-color: #bcd3ea; color: #0a2e57; }
        .btn.small { padding: 6px 10px; font-weight: 600; }
  .inline-flex { display: inline-flex; align-items: center; gap: 8px; }
  .text-center { text-align: center; }
  .mb-6 { margin-bottom: 6px; }
  .mb-8 { margin-bottom: 8px; }
  .mb-12 { margin-bottom: 12px; }
  .mb-16 { margin-bottom: 16px; }
  .mt-6 { margin-top: 6px; }
  .mt-8 { margin-top: 8px; }
  .mt-12 { margin-top: 12px; }
  .mt-neg-6 { margin-top: -6px; }
  .ml-8 { margin-left: 8px; }
  .p-0 { padding: 0; }
  .pad-18 { padding: 18px; }
  .row { display: flex; gap: 12px; }
  .between { justify-content: space-between; }
  .center-y { align-items: center; }
  .border-top { border-top: 1px solid #e2edf9; }
  .center { justify-content: center; }
  .stats-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 18px; }
  .metric { font-size: 18px; font-weight: 700; }

  .hero-art { position: relative; min-height: 360px; display: grid; }
  .hero-img { width: 100%; height: 100%; object-fit: cover; border-radius: 18px; border: 1px solid #d7e7fa; box-shadow: 0 14px 40px rgba(12, 68, 140, 0.12); background: #e9f2ff; }

        /* Sections shared */
        .section-title { font-size: clamp(24px, 3vw, 34px); margin: 0 0 8px; color: #0a2e57; letter-spacing: -0.2px; text-align: center; }
        .section-sub { margin: 0 auto 28px; color: #3a5e83; text-align: center; max-width: 720px; }
        .grid { display: grid; gap: 18px; }
        .card { background: white; border: 1px solid #e2edf9; border-radius: 16px; box-shadow: 0 10px 28px rgba(11, 63, 130, 0.08); padding: 18px; }
        .card-title { margin: 0 0 6px; color: #0a2e57; font-size: 18px; }
        .card-desc { margin: 0; color: #3a5e83; font-size: 14px; }

        /* Features grid */
        .features { background: linear-gradient(180deg, #eef6ff 0%, #f9fbff 100%); }
        .features-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .feature { transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease; }
        .feature:hover { transform: translateY(-3px); box-shadow: 0 16px 36px rgba(11,63,130,0.12); border-color: #d1e6ff; }
        .icon { width: 40px; height: 40px; display: grid; place-items: center; color: #0f6eea; background: #e9f2ff; border-radius: 12px; margin-bottom: 10px; }

        /* Demo */
        .demo { background: #f9fbff; }
        .demo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; align-items: start; }
        .label { display: block; font-weight: 600; color: #0a2e57; margin-bottom: 10px; }
        .textarea { width: 100%; border: 1px solid #cfe1f4; background: #fbfdff; border-radius: 12px; padding: 12px 14px; font-size: 14px; resize: vertical; outline: none; color: #0a2e57; transition: border-color 160ms ease, box-shadow 160ms ease; }
        .textarea:focus { border-color: #0f6eea; box-shadow: 0 0 0 4px rgba(15,110,234,0.1); }
        .actions { display: flex; gap: 10px; margin-top: 12px; }
        .hint { margin: 10px 0 0; font-size: 12px; color: #557aa1; }
        .hint.warn { color: #a8562a; }
        .output-header { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 8px; }
        .output-actions { display: flex; gap: 8px; }
  .output-body { min-height: 220px; border: 1px solid #e2edf9; background: #ffffff; border-radius: 12px; padding: 18px; position: relative; }
  .pre { white-space: pre-wrap; margin: 0; color: #0f172a; font-family: inherit; font-size: 15px; line-height: 1.7; background: transparent; word-break: break-word; }
        .placeholder { color: #7a9abf; }
        .spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.6); border-top-color: white; border-radius: 50%; display: inline-block; animation: spin 900ms linear infinite; vertical-align: -3px; }
        @keyframes spin { to { transform: rotate(1turn); } }
        .skeleton { position: absolute; inset: 10px; border-radius: 10px; background: linear-gradient(90deg, #f2f7fd 25%, #e7f0fb 37%, #f2f7fd 63%); background-size: 400% 100%; animation: shimmer 1400ms ease infinite; }
        @keyframes shimmer { 0% { background-position: 100% 0; } 100% { background-position: 0 0; } }

        /* Testimonials */
        .testimonial-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .quote { margin: 0 0 12px; color: #173e68; line-height: 1.55; }
        .who { display: flex; align-items: center; gap: 10px; }
        .who-dot { width: 26px; height: 26px; border-radius: 24px; background: radial-gradient(100% 100% at 50% 50%, #9fd0ff 0%, #4aa4ff 100%); box-shadow: 0 4px 12px rgba(11,63,130,0.22); }
        .who-name { font-weight: 700; color: #0a2e57; }
        .who-role { color: #557aa1; font-size: 13px; }

        /* Footer */
        .footer { border-top: 1px solid #e6eef7; background: #ffffff; }
        .footer-inner { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 16px; padding: 24px 0; }
        .brand-row { display: flex; align-items: center; gap: 10px; }
        .footer-links { display: flex; gap: 12px; }
        .social { color: #355a7e; padding: 8px; border-radius: 8px; transition: background 160ms ease, color 160ms ease; }
        .social:hover { background: #eaf4ff; color: #0a2e57; }
        .fine { grid-column: 1 / -1; color: #6a8db0; font-size: 12px; }

        /* Responsive */
        @media (max-width: 980px) {
          .hero-inner { grid-template-columns: 1fr; }
          .hero-art { order: -1; min-height: 260px; }
          .features-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .testimonial-grid { grid-template-columns: 1fr 1fr; }
          .demo-grid { grid-template-columns: 1fr; }
          .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 640px) {
          .nav { display: none; }
          .section { padding: 58px 0; }
          .features-grid, .testimonial-grid { grid-template-columns: 1fr; }
          .stats-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
