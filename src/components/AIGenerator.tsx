"use client";
import React, { useState } from 'react';
import { Copy, Loader2, Send } from 'lucide-react';

interface AIGeneratorProps {
  onGenerate?: (data: { prompt: string; persona: string; language: string; tone: string }) => Promise<string> | string;
  personas?: Array<{ id: string; name: string }>;
}

const AIGenerator: React.FC<AIGeneratorProps> = ({ onGenerate, personas = [] }) => {
  const [prompt, setPrompt] = useState('');
  const [persona, setPersona] = useState('default');
  const [language, setLanguage] = useState('English');
  const [tone, setTone] = useState('Neutral');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) { setError('Enter a prompt'); return; }
    setLoading(true); setError(''); setOutput('');
    try {
      const result = await (onGenerate ? onGenerate({ prompt, persona, language, tone }) : mockGenerate(prompt));
      setOutput(result);
    } catch (e:any) { setError(e.message || 'Generation failed'); }
    finally { setLoading(false); }
  };

  const mockGenerate = async (p:string) => new Promise<string>(res => setTimeout(()=> res(`Generated content for: ${p}`), 800));

  const copy = () => { if(!output) return; navigator.clipboard.writeText(output).then(()=> { setCopied(true); setTimeout(()=> setCopied(false), 1500); }); };

  return (
    <section id="generator" className="layout-container py-14">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="ki-card emphasis-panel">
            <h2 className="text-xl font-semibold mb-4">Your Prompt</h2>
            <div className="mb-4">
              <textarea
                className="ki-textarea resize-none h-48 focus:ring focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe what you want to generate..."
                value={prompt}
                onChange={e=>setPrompt(e.target.value)}
              />
            </div>
            <div className="grid sm:grid-cols-3 gap-4 mb-4">
              <select aria-label="Persona" className="ki-select" value={persona} onChange={e=>setPersona(e.target.value)}>
                <option value="default">Default</option>
                {personas.map(p=> <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select aria-label="Language" className="ki-select" value={language} onChange={e=>setLanguage(e.target.value)}>
                {['English','Spanish','French','Arabic','German','Hindi'].map(l=> <option key={l}>{l}</option>)}
              </select>
              <select aria-label="Tone" className="ki-select" value={tone} onChange={e=>setTone(e.target.value)}>
                {['Neutral','Formal','Casual','Enthusiastic','Analytical'].map(t=> <option key={t}>{t}</option>)}
              </select>
            </div>
            <button onClick={handleGenerate} disabled={loading || !prompt.trim()} className="ki-btn gradient w-full justify-center py-3 text-base">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Generating...</> : <><Send className="h-4 w-4" />Generate</>}
            </button>
            {error && <div className="alert alert-danger-soft mt-4">{error}</div>}
          </div>
        </div>
        <div className="space-y-6">
          <div className="ki-card elevated min-h-[300px] relative">
            <h2 className="text-xl font-semibold mb-4">Output</h2>
            {output ? (
              <>
                <button onClick={copy} className="ki-btn ghost absolute top-3 right-3 !px-2" aria-label="Copy output">
                  <Copy className="h-4 w-4" />
                  {copied && <span className="text-xs">Copied</span>}
                </button>
                <div className="prose-kalam whitespace-pre-wrap leading-relaxed text-sm">{output}</div>
              </>
            ) : (
              <div className="flex items-center justify-center h-40 text-fg-subtle text-sm">{loading? 'Generating...' : 'Output will appear here'}</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIGenerator;
