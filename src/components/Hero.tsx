"use client";
import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

const Hero: React.FC = () => {
  return (
    <section className="relative py-24 md:py-32 container-narrow text-center">
      <div className="hero-heading-wrap mb-6">
        <h1 className="text-mega font-extrabold tracking-tight gradient-text relative z-10">The Future of Content Generation is Here</h1>
        <span className="hero-glow" aria-hidden="true" />
      </div>
      <h2 className="text-xl md:text-2xl font-medium text-fg-muted mb-4">Harnessing Advanced AI for Human-Like Writing</h2>
      <p className="text-lead mx-auto mb-8 max-w-2xl">Kalam AI blends multilingual large language modeling with adaptive style personas, 5D linguistic analysis, and human-grade text naturalization—delivering content that resonates like it was crafted by a real author.</p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link href="#demo" className="ki-btn gradient text-base px-6 py-3">
          Try the Demo <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href="#features" className="ki-btn outline text-base px-6 py-3">
          View Features
        </Link>
      </div>
      <div className="mt-10 flex flex-wrap justify-center gap-2 text-xs text-fg-subtle">
        <div className="badge"><Sparkles className="h-3 w-3"/> Persona Intelligence</div>
        <div className="badge">Academic Alignment</div>
        <div className="badge">Humanization Engine</div>
        <div className="badge">Multilingual Core</div>
      </div>
    </section>
  );
};

export default Hero;
