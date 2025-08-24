import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';

interface Persona {
  id: string;
  name: string;
  status: 'Ready' | 'Processing' | 'Error';
  vocabulary?: string;
  avgSentenceLength?: number;
}

interface StylePersonasProps {
  personas?: Persona[];
  onCreate?: () => void;
  onEdit?: (persona: Persona) => void;
  onDelete?: (persona: Persona) => void;
}

export default function StylePersonas({ personas: initial = [], onCreate, onEdit, onDelete }: StylePersonasProps) {
  const [personas, setPersonas] = useState<Persona[]>(initial.length ? initial : [
    { id: '1', name: 'Academic Researcher Style', status: 'Ready', vocabulary: 'Academic', avgSentenceLength: 22 },
    { id: '2', name: 'Conversational Explainer', status: 'Processing', vocabulary: 'General', avgSentenceLength: 16 },
    { id: '3', name: 'Technical Whitepaper Tone', status: 'Ready', vocabulary: 'Technical', avgSentenceLength: 28 },
  ]);

  const badgeColor = (status: Persona['status']) => {
    switch (status) {
      case 'Ready': return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40';
      case 'Processing': return 'bg-amber-400/15 text-amber-400 border border-amber-400/40';
      case 'Error': return 'bg-rose-500/15 text-rose-400 border border-rose-500/40';
    }
  };

  return (
    <section className="max-w-[1200px] mx-auto px-6 py-14">
      <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
        <h2 className="text-2xl font-semibold tracking-tight">Your Style Personas</h2>
        <button
          onClick={() => onCreate ? onCreate() : setPersonas(p => [...p, { id: Date.now()+'' , name: 'New Persona', status: 'Processing', vocabulary: 'Pending', avgSentenceLength: 0 }])}
          className="inline-flex items-center gap-2 rounded-lg bg-accent text-white px-5 py-3 text-sm font-medium shadow-md hover:shadow-lg hover:brightness-110 active:scale-[.98] transition"
        >
          <Plus className="h-4 w-4" /> Create New Persona
        </button>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {personas.map(p => (
          <div key={p.id} className="group relative rounded-2xl border border-border bg-[rgb(var(--color-bg-alt))] p-5 shadow-sm hover:border-accent/60 transition overflow-hidden">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-br from-accent/5 to-transparent pointer-events-none" />
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-base font-semibold leading-snug pr-8">{p.name}</h3>
              <span className={`text-[10px] px-2 py-1 rounded-full font-semibold tracking-wide uppercase ${badgeColor(p.status)}`}>{p.status}</span>
            </div>
            <ul className="text-xs text-fg-subtle space-y-1 mb-6">
              <li><span className="text-fg-muted">Vocabulary:</span> {p.vocabulary || '—'}</li>
              <li><span className="text-fg-muted">Avg. Sentence Length:</span> {p.avgSentenceLength ? `${p.avgSentenceLength} words` : '—'}</li>
            </ul>
            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition">
              <button
                onClick={() => onEdit ? onEdit(p) : null}
                className="h-8 w-8 inline-flex items-center justify-center rounded-md bg-bg-subtle border border-border text-fg-muted hover:text-fg hover:bg-bg transition"
                aria-label={`Edit ${p.name}`}
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete ? onDelete(p) : setPersonas(list => list.filter(x => x.id !== p.id))}
                className="h-8 w-8 inline-flex items-center justify-center rounded-md bg-bg-subtle border border-border text-fg-muted hover:text-danger hover:bg-danger/10 transition"
                aria-label={`Delete ${p.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      {!personas.length && (
        <div className="text-sm text-fg-subtle italic opacity-70 pt-10 text-center">No personas yet. Create one to begin style adaptation.</div>
      )}
    </section>
  );
}
