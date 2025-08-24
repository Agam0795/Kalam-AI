"use client";
import React from 'react';
import { Check, Loader2, X, UserCheck, Edit2, Trash2 } from 'lucide-react';

export interface PersonaItem { id: string; name: string; status: 'ready' | 'processing' | 'failed'; }
interface PersonasDashboardProps {
  personas?: PersonaItem[];
  onUse?: (id:string)=>void;
  onEdit?: (id:string)=>void;
  onDelete?: (id:string)=>void;
}

const statusStyles: Record<PersonaItem['status'], string> = {
  ready: 'badge-success',
  processing: 'badge-warn',
  failed: 'badge-danger'
};

const statusLabel: Record<PersonaItem['status'], string> = {
  ready: 'Ready', processing: 'Processing', failed: 'Failed'
};

const PersonasDashboard: React.FC<PersonasDashboardProps> = ({ personas = [], onUse, onEdit, onDelete }) => {
  if (!personas.length) {
    return <div className="ki-card text-sm text-fg-subtle">No personas yet. Upload writing samples to create one.</div>;
  }
  return (
    <ul className="hover-list">
      {personas.map(p => (
        <li key={p.id} className="group cursor-pointer">
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm flex items-center gap-2">{p.name}
              <span className={`badge ${statusStyles[p.status]}`}>{statusLabel[p.status]}</span>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button className="ki-btn ghost !px-2" aria-label="Use Persona" onClick={()=> onUse?.(p.id)}><UserCheck className="h-4 w-4" /></button>
            <button className="ki-btn ghost !px-2" aria-label="Edit Persona" onClick={()=> onEdit?.(p.id)}><Edit2 className="h-4 w-4" /></button>
            <button className="ki-btn ghost !px-2" aria-label="Delete Persona" onClick={()=> onDelete?.(p.id)}><Trash2 className="h-4 w-4" /></button>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default PersonasDashboard;
