import { useState } from 'react';
import { Search, BookOpen, ExternalLink } from 'lucide-react';

interface PaperResult {
  id: string;
  title: string;
  authors: string;
  abstract: string;
}

interface AcademicPapersProps {
  onSearch?: (query: string) => Promise<PaperResult[]> | PaperResult[];
  onAnalyze?: (paper: PaperResult) => void | Promise<void>;
  onView?: (paper: PaperResult) => void | Promise<void>;
}

export default function AcademicPapers({ onSearch, onAnalyze, onView }: AcademicPapersProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PaperResult[]>([]);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    try {
      let data: PaperResult[] = [];
      if (onSearch) {
        const r = await onSearch(query);
        data = Array.isArray(r) ? r : [];
      } else {
        // mock
        data = [1,2,3].map(i => ({
          id: String(i),
          title: `Sample Research Paper Title ${i}`,
          authors: 'Doe J.; Smith A.; Zhang Q.',
          abstract: 'This is a placeholder abstract snippet demonstrating the style extraction and summarization potential within Kalam AI.'
        }));
      }
      setResults(data);
    } catch (e) {
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-[1200px] mx-auto px-6 py-14">
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
            placeholder="Search academic papers (title, keywords, DOI)..."
            aria-label="Search academic papers"
            className="w-full rounded-xl bg-[rgb(var(--color-bg-alt))] border border-border px-4 py-3 pr-12 text-sm focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition shadow-sm"
          />
          <Search className="h-5 w-5 absolute top-1/2 -translate-y-1/2 right-4 text-fg-muted" />
        </div>
        <button
          onClick={handleSearch}
          disabled={!query.trim() || loading}
          className="sm:w-auto w-full inline-flex items-center justify-center gap-2 rounded-lg bg-accent text-white px-6 py-3 text-sm font-medium shadow-md hover:shadow-lg hover:brightness-110 active:scale-[.98] disabled:opacity-50 transition"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
      {error && <div className="text-sm text-danger mb-4">{error}</div>}
      <div className="grid gap-5">
        {results.map(p => (
          <div key={p.id} className="group border border-border rounded-xl bg-[rgb(var(--color-bg-alt))] p-5 shadow-sm hover:border-accent/70 transition relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition bg-gradient-to-br from-accent/5 to-transparent" />
            <h3 className="text-base font-semibold tracking-tight mb-1 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-accent" /> {p.title}
            </h3>
            <p className="text-xs italic text-fg-muted mb-3">{p.authors}</p>
            <p className="text-sm leading-relaxed text-fg-subtle mb-4 line-clamp-3">{p.abstract}</p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => onAnalyze?.(p)}
                className="inline-flex items-center gap-2 rounded-md bg-accent text-white px-4 py-2 text-xs font-medium shadow-sm hover:shadow hover:brightness-110 transition"
              >Analyze Style</button>
              <button
                onClick={() => onView?.(p)}
                className="inline-flex items-center gap-2 rounded-md border border-accent/60 text-accent px-4 py-2 text-xs font-medium hover:bg-accent/10 transition"
              >View Source <ExternalLink className="h-3 w-3" /></button>
            </div>
          </div>
        ))}
        {!loading && results.length === 0 && (
          <div className="text-sm text-fg-subtle italic opacity-70 pt-8 text-center">No results yet. Try searching for a topic or DOI.</div>
        )}
      </div>
    </section>
  );
}
