'use client';

import { useState } from 'react';
import { Upload, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

interface PortalItem {
  id: string;
  title: string;
  instructions_for_client: string;
  status: string;
  rejection_reason: string | null;
  ai_feedback: string | null;
}

export function PortalUploadClient({
  portalToken,
  initialItems,
}: {
  portalToken: string;
  initialItems: PortalItem[];
}) {
  const [items, setItems] = useState<PortalItem[]>(initialItems);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = async (itemId: string, file: File | undefined) => {
    if (!file) return;
    setUploadingId(itemId);
    setErrorMsg(null);

    try {
      const mimeType = file.type || 'application/pdf';
      const urlRes = await fetch('/api/portal/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portalToken,
          requestItemId: itemId,
          filename: file.name,
          mimeType,
          fileSizeBytes: file.size,
        }),
      });

      const urlData = (await urlRes.json()) as {
        signedUrl?: string;
        quarantinePath?: string;
        error?: string;
      };

      if (!urlRes.ok || !urlData.signedUrl || !urlData.quarantinePath) {
        setErrorMsg(urlData.error ?? 'Upload rejected. Use PDF, JPEG, PNG, or WebP up to 15 MB.');
        return;
      }

      const putRes = await fetch(urlData.signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': mimeType },
        body: file,
      });

      if (!putRes.ok) {
        setErrorMsg('Direct upload to secure storage failed. Please try again.');
        return;
      }

      const confirmRes = await fetch('/api/portal/confirm-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portalToken,
          requestItemId: itemId,
          quarantinePath: urlData.quarantinePath,
          originalFilename: file.name,
          allowManualOverride: true,
        }),
      });

      const confirmData = (await confirmRes.json()) as {
        ok?: boolean;
        itemStatus?: string;
        feedback?: string;
        error?: string;
      };

      if (!confirmRes.ok || !confirmData.ok) {
        setErrorMsg(confirmData.error ?? 'Document validation failed.');
        return;
      }

      setItems((prev) =>
        prev.map((it) =>
          it.id === itemId
            ? {
                ...it,
                status: confirmData.itemStatus ?? 'ai_approved',
                ai_feedback: confirmData.feedback ?? null,
                rejection_reason: null,
              }
            : it
        )
      );
    } catch {
      setErrorMsg('Network error during upload.');
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700">
          {errorMsg}
        </div>
      )}

      {items.map((item, idx) => {
        const isDone = item.status === 'ai_approved' || item.status === 'human_approved';
        const needsFix = item.status === 'ai_flagged' || item.status === 'rejected';
        const isBusy = uploadingId === item.id;

        return (
          <div
            key={item.id}
            className={`p-5 rounded-2xl bg-white border ${
              needsFix ? 'border-amber-300' : isDone ? 'border-emerald-200' : 'border-slate-200'
            } space-y-3`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-slate-950 text-sm sm:text-base">
                  {idx + 1}. {item.title}
                </p>
                {item.instructions_for_client && (
                  <p className="text-xs text-slate-500 mt-1">{item.instructions_for_client}</p>
                )}
              </div>

              {isDone && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Received
                </span>
              )}
              {needsFix && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold shrink-0">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Re-upload suggested
                </span>
              )}
            </div>

            {(item.rejection_reason || item.ai_feedback) && (
              <p
                className={`text-xs p-2.5 rounded-lg ${
                  needsFix ? 'bg-amber-50 text-amber-900' : 'bg-emerald-50 text-emerald-800'
                }`}
              >
                {item.rejection_reason ?? item.ai_feedback}
              </p>
            )}

            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-[#F8FAFC] hover:bg-slate-100 text-xs font-semibold text-slate-800 cursor-pointer transition-colors">
              {isBusy ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading &amp; checking...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  {isDone || needsFix ? 'Replace file' : 'Upload PDF or Photo'}
                </>
              )}
              <input
                type="file"
                className="hidden"
                accept=".pdf,image/jpeg,image/png,image/webp"
                disabled={isBusy}
                onChange={(e) => handleFileChange(item.id, e.target.files?.[0])}
              />
            </label>
          </div>
        );
      })}
    </div>
  );
}
