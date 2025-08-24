"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

interface MainLayoutProps { children: React.ReactNode; active?: string }

export const MainLayout: React.FC<MainLayoutProps> = ({ children, active }) => {
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [active]);
  return (
    <div className="min-h-screen flex flex-col bg-app">
      <nav className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-background/70 border-b border-default">
        <div className="layout-container flex items-center h-16">
          <Link href="/" className="flex items-center gap-2 font-semibold text-sm tracking-tight">
            <Image src="/kalam-ai-logo.svg" alt="Kalam AI" width={34} height={34} className="h-9 w-auto" />
            <span className="gradient-text text-lg">Kalam AI</span>
          </Link>
          <div className="hidden md:flex flex-1 justify-center">
            <ul className="nav-list">
              {NAV.map(n => (
                <li key={n.href}>
                  <Link href={n.href} className={active === n.key ? 'active' : undefined} aria-current={active===n.key}> {n.label} </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Link href="/signup" className="ki-btn gradient text-sm">Sign Up</Link>
            <button className="md:hidden ki-btn ghost !px-2" aria-label="Menu" onClick={() => setOpen(o=>!o)}>
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {/* Mobile drawer */}
        {open && (
          <div className="md:hidden border-t border-default bg-surface animate-fade-in">
            <ul className="flex flex-col p-3 gap-1">
              {NAV.map(n => (
                <li key={n.href}>
                  <Link href={n.href} className={`ki-btn ghost w-full justify-start ${active===n.key? 'gradient-text !font-semibold':''}`}>{n.label}</Link>
                </li>
              ))}
              <li><Link href="/signup" className="ki-btn gradient w-full justify-center">Sign Up</Link></li>
            </ul>
          </div>
        )}
      </nav>
      <main className="flex-1 pt-20">{children}</main>
    </div>
  );
};

const NAV = [
  { key: 'generate', label: 'AI Generator', href: '/#generator' },
  { key: 'academic', label: 'Academic Papers', href: '/#academic' },
  { key: 'personas', label: 'Style Personas', href: '/#personas' },
  { key: 'demo', label: 'Demo', href: '/#demo' },
];

export default MainLayout;
