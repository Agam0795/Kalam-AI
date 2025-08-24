'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Bot, Copy, Loader2, MessageSquare, MoreVertical, Pencil, Plus, Send, Trash2, User } from 'lucide-react';

type Role = 'user' | 'assistant';

interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  timestamp: string; // ISO
}

interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

const LS_KEY = 'kalam-chat-conversations';

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function loadConversations(): Conversation[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Conversation[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveConversations(convos: Conversation[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(convos));
  } catch {
    // ignore
  }
}

export default function ModernChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [renamingId, setRenamingId] = useState<string>('');
  const [tempTitle, setTempTitle] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load from server, fallback to localStorage
    (async () => {
      try {
        const res = await fetch('/api/conversations', { cache: 'no-store' });
        const data = await res.json();
        if (res.ok && Array.isArray(data.conversations)) {
          const convs = data.conversations as Array<{ id: string; title: string; createdAt: string; updatedAt: string; count: number }>;
          if (convs.length === 0) {
            const createRes = await fetch('/api/conversations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'New chat' }) });
            const created = await createRes.json();
            const convo: Conversation = created.conversation;
            setConversations([convo]);
            setActiveId(convo.id);
            saveConversations([convo]);
          } else {
            // fetch first conversation detail to get messages
            const firstId = convs[0].id;
            const detailRes = await fetch(`/api/conversations/${firstId}`);
            const detail = await detailRes.json();
            const first = detail.conversation as Conversation;
            const rest: Conversation[] = [first, ...convs.slice(1).map(c => ({ ...c, messages: [] as ChatMessage[] }))];
            setConversations(rest);
            setActiveId(firstId);
            saveConversations(rest);
          }
          return;
        }
      } catch {
        // ignore network failures
      }
      // Fallback: localStorage
      const convos = loadConversations();
      if (convos.length === 0) {
        const first: Conversation = {
          id: uid(),
          title: 'New chat',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: [],
        };
        setConversations([first]);
        setActiveId(first.id);
        saveConversations([first]);
      } else {
        convos.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
        setConversations(convos);
        setActiveId(convos[0].id);
      }
    })();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeId, conversations]);

  const active = useMemo(
    () => conversations.find(c => c.id === activeId) || null,
    [conversations, activeId]
  );

  // Load messages when switching to a conversation that hasn't been loaded yet
  useEffect(() => {
    (async () => {
      if (!active) return;
      if (active.messages && active.messages.length > 0) return;
      try {
        const res = await fetch(`/api/conversations/${active.id}`);
        if (res.ok) {
          const d = await res.json();
          const full = d.conversation as Conversation;
          updateConversations(prev => prev.map(c => (c.id === active.id ? full : c)));
        }
      } catch {}
    })();
  }, [activeId]);

  function updateConversations(mutator: (prev: Conversation[]) => Conversation[]) {
    setConversations(prev => {
      const next = mutator(prev);
      saveConversations(next);
      return next;
    });
  }

  async function newChat() {
    try {
      const res = await fetch('/api/conversations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'New chat' }) });
      const data = await res.json();
      if (res.ok && data.conversation) {
        const convo: Conversation = data.conversation;
        updateConversations(prev => [convo, ...prev]);
        setActiveId(convo.id);
      } else {
        throw new Error('Failed to create chat');
      }
    } catch {
      // fallback local only
      const convo: Conversation = {
        id: uid(),
        title: 'New chat',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
      };
      updateConversations(prev => [convo, ...prev]);
      setActiveId(convo.id);
    }
    setInput('');
    setError('');
  }

  async function deleteChat(id: string) {
    updateConversations(prev => prev.filter(c => c.id !== id));
    try {
      await fetch('/api/conversations', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    } catch {}
    if (activeId === id) {
      setTimeout(() => {
        const convos = loadConversations();
        if (convos.length === 0) void newChat();
        else setActiveId(convos[0].id);
      }, 0);
    }
  }

  function startRename(id: string) {
    const c = conversations.find(x => x.id === id);
    if (!c) return;
    setRenamingId(id);
    setTempTitle(c.title);
  }

  async function commitRename() {
    if (!renamingId) return;
    const title = tempTitle.trim() || 'Untitled chat';
    updateConversations(prev => prev.map(c => (c.id === renamingId ? { ...c, title } : c)));
    try { await fetch(`/api/conversations/${renamingId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title }) }); } catch {}
    setRenamingId('');
    setTempTitle('');
  }

  function autoTitleFrom(text: string) {
    const t = text.replace(/\s+/g, ' ').trim();
    return t.length > 48 ? t.slice(0, 48) + '…' : t || 'New chat';
  }

  async function send() {
    if (!input.trim() || !active || loading) return;
    setLoading(true);
    setError('');

    const userMsg: ChatMessage = {
      id: uid(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    // optimistic update
    updateConversations(prev => prev.map(c => {
      if (c.id !== active.id) return c;
      const title = c.messages.length === 0 ? autoTitleFrom(userMsg.content) : c.title;
      return {
        ...c,
        title,
        updatedAt: new Date().toISOString(),
        messages: [...c.messages, userMsg],
      };
    }));
    setInput('');

    try {
      // If messages not loaded (e.g., selected from list), load conversation first
      if (!active.messages || active.messages.length === 0) {
        try {
          const detail = await fetch(`/api/conversations/${active.id}`);
          if (detail.ok) {
            const d = await detail.json();
            const full = d.conversation as Conversation;
            updateConversations(prev => prev.map(c => (c.id === active.id ? full : c)));
          }
        } catch {}
      }
      const res = await fetch(`/api/conversations/${active.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to get response');

  // server already appended both user and assistant messages, refetch to sync
      const detail = await fetch(`/api/conversations/${active.id}`);
      if (detail.ok) {
        const d = await detail.json();
        const full = d.conversation as Conversation;
        updateConversations(prev => prev.map(c => (c.id === active.id ? full : c)));
      }
    } catch (e: any) {
      setError(e?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  }

  function copy(text: string) {
    navigator.clipboard?.writeText(text).catch(() => {});
  }

  function formatClock(ts: string) {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="h-screen w-full flex bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-72 lg:w-80 flex-col border-r bg-white">
        <div className="p-3 border-b flex items-center gap-2">
          <button
            onClick={newChat}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm"
            title="New chat"
          >
            <Plus className="h-4 w-4" /> New chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.length === 0 && (
            <div className="text-xs text-gray-500 p-3">No conversations yet</div>
          )}
          {conversations.map(c => (
            <div
              key={c.id}
              className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer ${
                c.id === activeId ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100'
              }`}
              onClick={() => setActiveId(c.id)}
            >
              <MessageSquare className="h-4 w-4 flex-shrink-0" />
              {renamingId === c.id ? (
                <input
                  autoFocus
                  value={tempTitle}
                  onChange={e => setTempTitle(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={e => {
                    if (e.key === 'Enter') commitRename();
                    if (e.key === 'Escape') setRenamingId('');
                  }}
                  className="flex-1 bg-white border rounded px-2 py-1 text-sm"
                  aria-label="Conversation title"
                  title="Conversation title"
                  placeholder="Conversation title"
                />
              ) : (
                <div className="flex-1 truncate text-sm">{c.title}</div>
              )}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  className="p-1 hover:bg-gray-200 rounded"
                  title="Rename"
                  onClick={(e) => { e.stopPropagation(); startRename(c.id); }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  className="p-1 hover:bg-gray-200 rounded"
                  title="Delete"
                  onClick={(e) => { e.stopPropagation(); deleteChat(c.id); }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Chat */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white border-b">
          <div className="flex items-center gap-3">
            <Bot className="h-6 w-6 text-blue-600" />
            <div>
              <div className="font-semibold">Kalam AI Chat</div>
              <div className="text-xs text-gray-500">Powered by Google Gemini</div>
            </div>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded" title="More">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 pb-6 pt-4">
          {!active || active.messages.length === 0 ? (
            <div className="mt-24 text-center text-gray-500">
              <MessageSquare className="h-14 w-14 mx-auto mb-3 text-gray-300" />
              <div className="text-lg font-medium">Start a conversation</div>
              <div className="text-sm">Ask anything. Press Enter to send, Shift+Enter for a new line.</div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-4">
              {active.messages.map(m => (
                <div key={m.id} className={`flex items-start gap-3 ${m.role === 'user' ? 'justify-end' : ''}`}>
                  {m.role === 'assistant' && (
                    <div className="flex-shrink-0">
                      <Bot className="h-8 w-8 bg-blue-100 text-blue-600 rounded-full p-1.5" />
                    </div>
                  )}
                  <div className={`max-w-[80%] ${m.role === 'user' ? 'order-1' : ''}`}>
                    <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                      m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border'
                    }`}>
                      <div className="whitespace-pre-wrap">{m.content}</div>
                    </div>
                    <div className={`mt-1 text-[11px] text-gray-500 ${m.role === 'user' ? 'text-right' : ''}`}>
                      {formatClock(m.timestamp)}
                      {m.role === 'assistant' && (
                        <button
                          className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] hover:bg-gray-50"
                          onClick={() => copy(m.content)}
                          title="Copy"
                        >
                          <Copy className="h-3 w-3" /> Copy
                        </button>
                      )}
                    </div>
                  </div>
                  {m.role === 'user' && (
                    <div className="flex-shrink-0 order-2">
                      <User className="h-8 w-8 bg-gray-100 text-gray-600 rounded-full p-1.5" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-start gap-3">
                  <Bot className="h-8 w-8 bg-blue-100 text-blue-600 rounded-full p-1.5" />
                  <div className="rounded-2xl px-4 py-3 text-sm bg-white border">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 text-red-800 text-sm px-3 py-2">{error}</div>
              )}

              <div ref={endRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t bg-white">
          <div className="mx-auto max-w-3xl p-4">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                rows={1}
                placeholder="Type your message…"
                className="flex-1 resize-none rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={send}
                disabled={!input.trim() || loading}
                className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                title="Send"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
            <div className="mt-2 text-center text-xs text-gray-500">Enter to send • Shift+Enter for new line</div>
          </div>
        </div>
      </main>
    </div>
  );
}
