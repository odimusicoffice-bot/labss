import { useState } from 'react';
import { Check, X, ShieldCheck, Mic, Calendar, LifeBuoy, Inbox } from 'lucide-react';
import { useContent, type RequestType } from '@/context/ContentContext';

type SubTab = RequestType | 'all';

const subTabs: { id: SubTab; label: string; icon: typeof ShieldCheck }[] = [
  { id: 'all', label: 'All', icon: Inbox },
  { id: 'verification', label: 'Verification', icon: ShieldCheck },
  { id: 'audition', label: 'Auditions', icon: Mic },
  { id: 'event', label: 'Events', icon: Calendar },
  { id: 'support', label: 'Support', icon: LifeBuoy },
];

const typeLabels: Record<RequestType, string> = {
  verification: 'VIP Verification',
  audition: 'Audition',
  event: 'Event Request',
  support: 'Support Ticket',
};

export default function RequestsTab() {
  const { consolidatedRequests, approveRequest, rejectRequest, eventRequests, approveEventRequest, rejectEventRequest } = useContent();
  const [activeSub, setActiveSub] = useState<SubTab>('all');

  const filtered = activeSub === 'all'
    ? consolidatedRequests
    : consolidatedRequests.filter((r) => r.type === activeSub);

  const pendingCount = consolidatedRequests.filter((r) => r.status === 'pending').length;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const handleApprove = (id: string) => {
    // TODO: connect Supabase
    approveRequest(id);
  };

  const handleReject = (id: string) => {
    // TODO: connect Supabase
    rejectRequest(id);
  };

  return (
    <div className="space-y-6">
      {/* Consolidated requests */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-anton text-2xl uppercase text-white">Requests</h2>
            <p className="mt-1 text-sm text-[#888888]">
              {pendingCount > 0 ? `${pendingCount} pending request${pendingCount > 1 ? 's' : ''}` : 'All caught up.'}
            </p>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="mb-5 flex gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] p-1">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSub === tab.id;
            const count = tab.id === 'all'
              ? consolidatedRequests.length
              : consolidatedRequests.filter((r) => r.type === tab.id).length;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSub(tab.id)}
                className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                  isActive ? 'bg-[#3B82F6] text-white' : 'text-[#888888] hover:text-white'
                }`}
              >
                <Icon size={13} strokeWidth={1.75} />
                {tab.label}
                {count > 0 && (
                  <span className={`rounded-full px-1.5 text-[10px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-[#888888]'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="mt-8 text-center">
            <Inbox size={32} className="mx-auto text-[#555555]" strokeWidth={1.5} />
            <p className="mt-4 text-sm text-[#888888]">No requests in this category.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((req) => (
              <div
                key={req.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#3B82F6]">
                        {typeLabels[req.type]}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${
                        req.status === 'pending'
                          ? 'bg-[#F59E0B]/15 text-[#F59E0B]'
                          : req.status === 'approved'
                          ? 'bg-[#22C55E]/15 text-[#22C55E]'
                          : 'bg-[#EF4444]/15 text-[#EF4444]'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-[#555555]">From: {req.submittedBy}</p>
                    <div className="mt-2 space-y-1">
                      {Object.entries(req.details).map(([key, value]) => (
                        <div key={key} className="flex gap-2 text-sm">
                          <span className="text-[#555555] capitalize">{key.replace(/_/g, ' ')}:</span>
                          <span className="text-[#CCCCCC] truncate">{value}</span>
                        </div>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-[#555555]">{formatDate(req.createdAt)}</p>
                  </div>

                  {req.status === 'pending' && (
                    <div className="flex shrink-0 flex-col gap-2">
                      <button
                        onClick={() => handleApprove(req.id)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#22C55E]/30 bg-[#22C55E]/10 px-3 py-2 text-xs font-medium text-[#22C55E] transition-all hover:bg-[#22C55E]/20"
                      >
                        <Check size={13} strokeWidth={2} /> Approve
                      </button>
                      <button
                        onClick={() => handleReject(req.id)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#EF4444]/30 bg-[#EF4444]/10 px-3 py-2 text-xs font-medium text-[#EF4444] transition-all hover:bg-[#EF4444]/20"
                      >
                        <X size={13} strokeWidth={2} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Event Requests section */}
      <div className="border-t border-white/10 pt-6">
        <h3 className="font-anton text-xl uppercase text-white">Event Requests</h3>
        <p className="mt-1 text-sm text-[#888888]">Approving adds the event to the public Map.</p>

        <div className="mt-4 space-y-3">
          {eventRequests.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#888888]">No event suggestions submitted.</p>
          ) : (
            eventRequests.map((req) => (
              <div
                key={req.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[#3B82F6]/15 px-2 py-0.5 text-[10px] font-medium uppercase text-[#3B82F6]">
                        {req.category}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${
                        req.status === 'pending'
                          ? 'bg-[#F59E0B]/15 text-[#F59E0B]'
                          : req.status === 'approved'
                          ? 'bg-[#22C55E]/15 text-[#22C55E]'
                          : 'bg-[#EF4444]/15 text-[#EF4444]'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    <h4 className="mt-2 text-sm font-medium text-white">{req.title}</h4>
                    <p className="mt-1 text-xs text-[#888888]">{req.city}, {req.country}</p>
                    <p className="mt-1 text-sm text-[#CCCCCC]">{req.description}</p>
                    <p className="mt-2 text-xs text-[#555555]">By {req.submittedBy} · {formatDate(req.createdAt)}</p>
                  </div>

                  {req.status === 'pending' && (
                    <div className="flex shrink-0 flex-col gap-2">
                      <button
                        onClick={() => approveEventRequest(req.id)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#22C55E]/30 bg-[#22C55E]/10 px-3 py-2 text-xs font-medium text-[#22C55E] transition-all hover:bg-[#22C55E]/20"
                      >
                        <Check size={13} strokeWidth={2} /> Approve
                      </button>
                      <button
                        onClick={() => rejectEventRequest(req.id)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#EF4444]/30 bg-[#EF4444]/10 px-3 py-2 text-xs font-medium text-[#EF4444] transition-all hover:bg-[#EF4444]/20"
                      >
                        <X size={13} strokeWidth={2} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
