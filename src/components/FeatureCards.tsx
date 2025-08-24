"use client";
import React from 'react';
import { GraduationCap, Languages, Sparkles, ArrowRight } from 'lucide-react';

const FEATURES = [
  {
    icon: GraduationCap,
    title: 'Academic Style Learning',
    body: 'Ingest exemplar papers to build reusable scholarly personas that guide tone, structure, lexical density, and discourse moves.'
  },
  {
    icon: Languages,
    title: '5D Linguistic Analysis',
    body: 'Semantic depth, discourse cohesion, syntactic rhythm, stylistic fingerprinting, pragmatic clarity—unified for precision output.'
  },
  {
    icon: Sparkles,
    title: 'AI Text Humanizer',
    body: 'Transforms raw model completions into natural, nuanced prose while preserving intent, facts, and stylistic fidelity.'
  }
] as const;

const FeatureCards: React.FC = () => {
  return (
    <section id="features" className="layout-container py-16 section-animate">
      <header className="mb-10 max-w-2xl">
        <div className="heading-pattern mb-4">Core Capabilities</div>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 gradient-text">What Powers Kalam AI</h2>
        <p className="text-lead">A modular stack that fuses academic persona modeling, deep linguistic diagnostics, and naturalization layers to produce authentic multi-domain prose.</p>
      </header>
      <div className="feature-grid">
        {FEATURES.map((f, i) => {
          const Icon = f.icon;
          return (
            <article
              key={f.title}
              tabIndex={0}
              className="feature-item hover-lift focus-ring-shadow group relative overflow-hidden">
              <div className="feature-accent-bar" aria-hidden="true" />
              <div className="icon-wrap mb-4">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="feature-title mb-2">{f.title}</h3>
              <p className="feature-body">{f.body}</p>
              <button className="feature-more ki-btn ghost !px-2 mt-5 inline-flex items-center gap-1 text-xs font-medium">
                Learn More <ArrowRight className="h-3 w-3" />
              </button>
              <span className="feature-index" aria-hidden="true">0{i+1}</span>
            </article>
          );
        })}
      </div>
      <div className="mt-12">
        <button className="ki-btn gradient px-6 py-3 text-base">Explore Full Feature Set</button>
      </div>
    </section>
  );
};

export default FeatureCards;
