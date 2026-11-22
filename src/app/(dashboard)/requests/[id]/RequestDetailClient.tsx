'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, Eye, Download, FolderArchive } from 'lucide-react';

interface SubmissionInfo {
  id: string;
  original_filename_sanitized: string;
  ai_status: string;
  ai_client_feedback: string | null;
  ai_is_expired: boolean | null;
}

interface ItemInfo {
  id: string;
  title: string;
  status: string;
  rejection_reason: string | null;
  submission: SubmissionInfo | null;
}

export function RequestDetailClient({
  requestId,
  items,
}: {
  requestId: string;
  items: ItemInfo[];
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [exporting, setExporting] = useState<'zip' | 'pdf' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleView = async (submissionId: string) => {
    setBusyId(submissionId);
    setError(null);
    try {
      const res = await fetch(`/api/submissions/${submissionId}/view`);
      const data = (await res.json()) as { signedUrl?: string; error?: string };
      if (!res.ok || !data.signedUrl) {
        setError(data.error ?? 'Failed to open file');
        return;
      }
      window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
    } finally {
      setBusyId(null);
    }
  };

  const handleReview = async (requestItemId: string, decision: 'human_approved' | 'rejected') => {
    const rejectionReason =
      decision === 'rejected' ? window.prompt('Reason for rejection (shown to client):') ?? '' : undefined;
    if (decision === 'rejected' && rejectionReason === '') return;

    setBusyId(requestItemId);
    setError(null);
    try {
      const res = await fetch(`/api/requests/${requestId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestItemId, decision, rejectionReason }),
      });
      if (!res.ok) {
        setError('Failed to save review');
        return;
      }
      router.refresh();
    } finally {
      setBusyId(null);
    }
  };

  const handleExport = async (format: 'zip' | 'pdf') => {
    setExporting(format);
    setError(null);
    try {
      const res = await fetch(`/api/requests/${requestId}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format }),
      });
      const data = (await res.json()) as { signedUrl?: string; error?: string };
      if (!res.ok || !data.signedUrl) {
        setError(data.error ?? 'Export failed');
        return;
      }
      window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => handleExport('zip')}
          disabled={exporting !== null}
          className="px-4 py-2 rounded-xl bg-slate-950 text-white text-xs font-semibold hover:bg-slate-800 inline-flex items-center gap-2 disabled:opacity-50"
        >
          <FolderArchive className="w-4 h-4" />
          {exporting === 'zip' ? 'Generating ZIP...' : 'Export ZIP Dossier'}
        </button>
        <button
          type="button"
          onClick={() => handleExport('pdf')}
          disabled={exporting !== null}
          className="px-4 py-2 rounded-xl border border-[#EAE6F5] bg-white text-slate-900 text-xs font-semibold hover:bg-slate-50 inline-flex items-center gap-2 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {exporting === 'pdf' ? 'Merging PDF...' : 'Export Merged PDF'}
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white border border-[#EAE6F5] rounded-2xl divide-y divide-slate-200">
        {items.map((item) => (
          <div key={item.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <p className="font-bold text-slate-950">{item.title}</p>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                  {item.status.replace('_', ' ')}
                </span>
              </div>
              {item.submission ? (
                <div className="text-xs text-slate-500 space-y-0.5">
                  <p>
                    File: <span className="font-mono">{item.submission.original_filename_sanitized}</span>{' '}
                    &middot; AI: <strong>{item.submission.ai_status}</strong>
                    {item.submission.ai_is_expired ? ' (EXPIRED)' : ''}
                  </p>
                  {item.submission.ai_client_feedback && (
                    <p className="text-slate-600">{item.submission.ai_client_feedback}</p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-400">Waiting for client upload</p>
              )}
            </div>

            {item.submission && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleView(item.submission!.id)}
                  disabled={busyId === item.submission.id}
                  className="px-3 py-1.5 rounded-lg border border-[#EAE6F5] text-xs font-semibold text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View (60s URL)
                </button>
                <button
                  type="button"
                  onClick={() => handleReview(item.id, 'human_approved')}
                  disabled={busyId === item.id}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 inline-flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => handleReview(item.id, 'rejected')}
                  disabled={busyId === item.id}
                  className="px-3 py-1.5 rounded-lg border border-red-200 text-red-700 text-xs font-semibold hover:bg-red-50 inline-flex items-center gap-1"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
