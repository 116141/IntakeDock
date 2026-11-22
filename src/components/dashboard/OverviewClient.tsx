'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, FileText, Plus, Search } from 'lucide-react';

export interface OverviewRequestRow {
  readonly id: string;
  readonly title: string;
  readonly client_name: string;
  readonly client_email: string;
  readonly status: string;
  readonly created_at: string;
  readonly id_request_items: readonly { readonly status: string }[] | null;
}

interface OverviewClientProps {
  readonly requests: readonly OverviewRequestRow[];
}

export function OverviewClient({ requests }: OverviewClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'ready' | 'completed'>('all');

  if (requests.length === 0) {
    return (
      <div className="bg-white border border-[#EAE6F5] rounded-2xl p-12 text-center space-y-4">
        <div className="w-11 h-11 rounded-xl bg-[#EFEAFF] text-[#6D4AFF] flex items-center justify-center mx-auto">
          <FileText className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-[#1B1340]">No client requests yet</h2>
          <p className="text-sm text-[#5C5873] max-w-md mx-auto">
            Create your first checklist request using a built-in template and send the no-login
            portal link to your client.
          </p>
        </div>
        <Link
          href="/requests/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#6D4AFF] text-white text-sm font-semibold hover:bg-[#4A2DC5] transition"
        >
          <Plus className="w-4 h-4" />
          Create first request
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const isReadyToExport = (req: OverviewRequestRow) => {
    const items = req.id_request_items ?? [];
    if (items.length === 0) return false;
    return items.every((i) => i.status === 'ai_approved' || i.status === 'human_approved');
  };

  const pendingCount = requests.filter((r) => !isReadyToExport(r) && r.status !== 'completed').length;
  const readyCount = requests.filter((r) => isReadyToExport(r) && r.status !== 'completed').length;
  const completedCount = requests.filter((r) => r.status === 'completed').length;

  const filteredRequests = requests.filter((req) => {
    if (activeTab === 'pending' && (isReadyToExport(req) || req.status === 'completed')) return false;
    if (activeTab === 'ready' && (!isReadyToExport(req) || req.status === 'completed')) return false;
    if (activeTab === 'completed' && req.status !== 'completed') return false;
    if (!normalizedQuery) return true;
    return (
      req.title.toLowerCase().includes(normalizedQuery) ||
      req.client_name.toLowerCase().includes(normalizedQuery) ||
      req.client_email.toLowerCase().includes(normalizedQuery)
    );
  });

  const TABS = [
    { id: 'all', label: 'All', count: requests.length },
    { id: 'pending', label: 'In Progress', count: pendingCount },
    { id: 'ready', label: 'Ready to Export', count: readyCount },
    { id: 'completed', label: 'Completed', count: completedCount },
  ] as const;

  return (
    <div className="space-y-4">
      {/* PROTON-STYLE SEARCH + TAB FILTERS */}
      <div className="rounded-2xl bg-white border border-[#EAE6F5] p-3.5 space-y-3 shadow-sm">
        <div className="relative">
          <Search
            className="w-4 h-4 text-[#5C5873] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            strokeWidth={1.75}
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search requests by title, client name, or email..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#F7F5FF] border border-[#EAE6F5] text-sm text-[#1B1340] placeholder:text-[#5C5873] focus:bg-white focus:border-[#6D4AFF] focus:outline-none transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 border-t border-[#EAE6F5] pt-2.5">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  isActive
                    ? 'bg-[#EFEAFF] text-[#6D4AFF]'
                    : 'text-[#5C5873] hover:text-[#1B1340] hover:bg-[#F7F5FF]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                    isActive ? 'bg-[#6D4AFF] text-white' : 'bg-[#F7F5FF] text-[#5C5873]'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="bg-white border border-[#EAE6F5] rounded-2xl p-10 text-center space-y-1.5">
          <p className="text-sm font-semibold text-[#1B1340]">No matching requests</p>
          <p className="text-xs text-[#5C5873]">
            Try clearing your search or switching filter tabs.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#EAE6F5] rounded-2xl overflow-hidden divide-y divide-[#EAE6F5]">
          {filteredRequests.map((req) => {
            const items = req.id_request_items ?? [];
            const doneCount = items.filter(
              (i) => i.status === 'ai_approved' || i.status === 'human_approved'
            ).length;

            return (
              <Link
                key={req.id}
                href={`/requests/${req.id}`}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F7F5FF] transition-colors"
              >
                <div className="space-y-1">
                  <p className="font-bold text-[#1B1340]">{req.title}</p>
                  <p className="text-xs text-[#5C5873]">
                    {req.client_name} &middot; {req.client_email}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs font-semibold text-[#4A4660]">
                    {doneCount} / {items.length} approved
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#EFEAFF] text-[#5B38E8] capitalize">
                    {req.status.replace('_', ' ')}
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#5C5873]" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
