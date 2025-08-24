import { useState } from 'react';
import { Send, Copy, Download } from 'lucide-react';

interface AiGeneratorProps {
  onGenerate?: (prompt: string, options: { persona: string; temperature: number }) => Promise<string> | string;
  personas?: Array<{ id: string; name: string; status?: string }>;
}

export default function AiGenerator({ onGenerate, personas = [] }: AiGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [persona, setPersona] = useState('default');
  const [temperature, setTemperature] = useState(0.7);
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setCopied(false);
    try {
      let result: string = '';
      if (onGenerate) {
        const r = await onGenerate(prompt, { persona, temperature });
        result = typeof r === 'string' ? r : '';
      } else {
        // Fallback mock
        result = 'Generated content based on your prompt: ' + prompt;
      }
      setOutput(result);
    } catch (e) {
      setOutput('Error generating content.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kalam-output.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="max-w-[1200px] mx-auto px-6 py-14">
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Left Controls */}
        <div className="lg:w-1/3 space-y-6">
          <div>
            <label className="block text-sm font-medium text-fg-muted mb-2">Prompt</label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Enter your topic here..."
              rows={10}
              className="w-full rounded-xl bg-[rgb(var(--color-bg-alt))] border border-border focus:ring-2 focus:ring-accent/60 focus:border-accent outline-none resize-none p-4 text-sm leading-relaxed shadow-sm transition"
            />
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-fg-muted mb-2">Style Persona</label>
              <select
                value={persona}
                onChange={e => setPersona(e.target.value)}
                className="w-full rounded-lg bg-[rgb(var(--color-bg-alt))] border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition"
                aria-label="Select style persona"
              >
                <option value="default">Default</option>
                {personas.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-fg-muted mb-2 flex justify-between"><span>Creativity Level</span><span className="text-xs text-fg-subtle">{temperature.toFixed(2)}</span></label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={temperature}
                onChange={e => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-[rgb(var(--accent-rgb))]"
                aria-label="Creativity level"
              />
            </div>
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || loading}
              className="w-full inline-flex items-center justify-center gap-2 font-medium rounded-lg bg-accent text-white py-3 text-sm shadow-md hover:shadow-lg hover:brightness-110 active:scale-[.98] disabled:opacity-50 transition"
            >
              <Send className="h-4 w-4" /> {loading ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </div>
        {/* Right Output */}
        <div className="lg:w-2/3">
          <div className="relative rounded-2xl border border-border/70 bg-[rgb(var(--color-bg-alt))] p-5 min-h-[480px] shadow-sm flex flex-col">
            <div className="absolute top-3 right-3 flex gap-2">
              <button onClick={handleCopy} disabled={!output} className="h-9 w-9 inline-flex items-center justify-center rounded-md bg-bg-subtle border border-border text-fg-muted hover:text-fg hover:bg-bg transition disabled:opacity-40" title="Copy Text">
                <Copy className="h-4 w-4" />
              </button>
              <button onClick={handleExport} disabled={!output} className="h-9 w-9 inline-flex items-center justify-center rounded-md bg-bg-subtle border border-border text-fg-muted hover:text-fg hover:bg-bg transition disabled:opacity-40" title="Export">
                <Download className="h-4 w-4" />
              </button>
            </div>
            <div className="prose-kalam max-w-none mt-2 text-sm leading-relaxed whitespace-pre-wrap">
              {output ? (
                output
              ) : (
                <div className="h-full flex items-center justify-center text-fg-subtle text-sm italic opacity-70 select-none">Your generated content will appear here.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
