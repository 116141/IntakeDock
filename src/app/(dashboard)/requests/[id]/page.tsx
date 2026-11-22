import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { RequestDetailClient } from './RequestDetailClient';

export default async function RequestDetailPage(context: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await context.params;
  const supabase = await createSupabaseServerClient();

  const { data: reqRow } = await supabase
    .from('id_client_requests')
    .select('id, title, client_name, client_email, status, created_at')
    .eq('id', id)
    .maybeSingle();

  if (!reqRow) notFound();

  const { data: items } = await supabase
    .from('id_request_items')
    .select('id, title, status, rejection_reason, sort_order')
    .eq('request_id', reqRow.id)
    .order('sort_order', { ascending: true });

  const { data: submissions } = await supabase
    .from('id_document_submissions')
    .select('id, request_item_id, original_filename_sanitized, ai_status, ai_client_feedback, ai_is_expired')
    .eq('request_id', reqRow.id)
    .eq('is_current', true);

  const subByItem = new Map((submissions ?? []).map((s) => [s.request_item_id, s]));

  return (
    <div className="space-y-6">
      <Link
        href="/overview"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-950"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to requests
      </Link>

      <div className="bg-white border border-[#EAE6F5] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">{reqRow.title}</h1>
          <p className="text-sm text-slate-500 mt-1">
            {reqRow.client_name} &middot; {reqRow.client_email}
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 capitalize self-start">
          {reqRow.status.replace('_', ' ')}
        </span>
      </div>

      <RequestDetailClient
        requestId={reqRow.id}
        items={(items ?? []).map((item) => ({
          id: item.id,
          title: item.title,
          status: item.status,
          rejection_reason: item.rejection_reason,
          submission: subByItem.get(item.id) ?? null,
        }))}
      />
    </div>
  );
}
