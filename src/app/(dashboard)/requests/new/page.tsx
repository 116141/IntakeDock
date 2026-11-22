'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Trash2, Copy, Check, ArrowRight } from 'lucide-react';
import { INDUSTRY_PRESETS } from '@/services/templates/presets';

interface DraftItem {
  title: string;
  instructionsForClient: string;
  expectedDocType: string;
  isRequired: boolean;
  requireExpiryCheck: boolean;
}

export default function NewRequestPage() {
  const [selectedPreset, setSelectedPreset] = useState(INDUSTRY_PRESETS[0]!.id);
  const [title, setTitle] = useState(INDUSTRY_PRESETS[0]!.label);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhoneE164, setClientPhoneE164] = useState('');
  const [items, setItems] = useState<DraftItem[]>(INDUSTRY_PRESETS[0]!.items);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdPortal, setCreatedPortal] = useState<{ id: string; portalUrl: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const applyPreset = (presetId: (typeof INDUSTRY_PRESETS)[number]['id']) => {
    const preset = INDUSTRY_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setSelectedPreset(preset.id);
    setTitle(preset.label);
    setItems(preset.items.map((item) => ({ ...item })));
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        title: '',
        instructionsForClient: '',
        expectedDocType: 'unknown',
        isRequired: true,
        requireExpiryCheck: false,
      },
    ]);
  };

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          clientName,
          clientEmail,
          clientPhoneE164: clientPhoneE164.trim(),
          items: items.filter((i) => i.title.trim().length > 1),
        }),
      });
      const data = (await res.json()) as { id?: string; portalPath?: string; error?: string };
      if (!res.ok || !data.id || !data.portalPath) {
        setError(data.error ?? 'Failed to create request');
        setLoading(false);
        return;
      }

      setCreatedPortal({
        id: data.id,
        portalUrl: `${window.location.origin}${data.portalPath}`,
      });
    } catch {
      setError('Network error creating request');
    } finally {
      setLoading(false);
    }
  };

  if (createdPortal) {
    const waText = encodeURIComponent(
      `Hello ${clientName}, please upload your documents securely using this link (no login required): ${createdPortal.portalUrl}`
    );

    return (
      <div className="max-w-2xl mx-auto bg-white border border-[#EAE6F5] rounded-2xl p-8 space-y-6">
        <div className="space-y-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Portal Link Ready
          </span>
          <h1 className="text-2xl font-bold text-slate-950">Client Request Created</h1>
          <p className="text-sm text-slate-600">
            Share this private 256-bit portal link with <strong>{clientName}</strong>. Copy it now
            — for security, the raw token is stored only as a SHA-256 hash.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#F8F7FC] border border-[#EAE6F5] flex items-center justify-between gap-3">
          <code className="text-xs font-mono text-slate-800 break-all">{createdPortal.portalUrl}</code>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(createdPortal.portalUrl);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="px-3 py-2 rounded-lg bg-slate-950 text-white text-xs font-semibold shrink-0 inline-flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href={`https://wa.me/${clientPhoneE164.replace(/\D/g, '')}?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl border border-[#EAE6F5] bg-white text-sm font-semibold text-slate-900 hover:bg-slate-50"
          >
            Send via WhatsApp
          </a>
          <Link
            href={`/requests/${createdPortal.id}`}
            className="px-4 py-2.5 rounded-xl bg-slate-950 text-white text-sm font-semibold hover:bg-slate-800 inline-flex items-center gap-1.5"
          >
            Open Request Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">New Client Document Request</h1>
        <p className="text-sm text-slate-500">
          Pick an industry preset or customize the checklist items for your client.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-[#EAE6F5] rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700">Industry Template</label>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {INDUSTRY_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.id)}
                className={`p-3 rounded-xl border text-left transition-colors ${
                  selectedPreset === preset.id
                    ? 'border-slate-950 bg-slate-50'
                    : 'border-[#EAE6F5] hover:bg-slate-50'
                }`}
              >
                <p className="text-sm font-semibold text-slate-950">{preset.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{preset.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-slate-700">Request Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE6F5] bg-[#F8F7FC] text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Client Name</label>
            <input
              type="text"
              required
              placeholder="Maria Silva"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE6F5] bg-[#F8F7FC] text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Client Email</label>
            <input
              type="email"
              required
              placeholder="maria@example.com"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE6F5] bg-[#F8F7FC] text-sm"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-slate-700">
              Client WhatsApp (optional, E.164 e.g. +14155552671)
            </label>
            <input
              type="text"
              placeholder="+14155552671"
              value={clientPhoneE164}
              onChange={(e) => setClientPhoneE164(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE6F5] bg-[#F8F7FC] text-sm"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700">Checklist Items</label>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-900 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              Add item
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-[#EAE6F5] bg-[#F8F7FC] space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Document title"
                    value={item.title}
                    onChange={(e) => {
                      const next = [...items];
                      next[idx] = { ...item, title: e.target.value };
                      setItems(next);
                    }}
                    className="flex-1 px-3 py-2 rounded-lg border border-[#EAE6F5] bg-white text-sm font-medium"
                  />
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="p-2 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Instructions for client (optional)"
                  value={item.instructionsForClient}
                  onChange={(e) => {
                    const next = [...items];
                    next[idx] = { ...item, instructionsForClient: e.target.value };
                    setItems(next);
                  }}
                  className="w-full px-3 py-1.5 rounded-lg border border-[#EAE6F5] bg-white text-xs text-slate-600"
                />
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-slate-950 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? 'Generating secure portal link...' : 'Create Request & Generate Portal Link'}
        </button>
      </form>
    </div>
  );
}
