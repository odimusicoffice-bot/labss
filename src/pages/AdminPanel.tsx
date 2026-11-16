import { useEffect, useState, useCallback, useRef } from 'react';
import {
  ArrowLeft, Copy, Check, Trash2, Loader2, ShieldAlert, KeyRound, X, Save,
  ImagePlus, LayoutDashboard, FileEdit, Users, Inbox, Check as CheckIcon,
  AlertCircle, ChevronDown,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth, type Profile } from '@/context/AuthContext';
import { defaultSiteContent, type SiteContent } from '@/data/siteContent';

interface AdminPanelProps {
  onBack: () => void;
}

type Tab = 'overview' | 'content' | 'users' | 'requests';

interface UserRequest {
  id: string;
  user_id: string;
  type: 'event' | 'artist_submission' | 'vip_verification' | 'audition';
  status: 'pending' | 'approved' | 'rejected';
  payload: Record<string, string>;
  created_at: string;
}

const requestTypeLabels: Record<UserRequest['type'], string> = {
  event: 'Event Request',
  artist_submission: 'Artist Submission',
  vip_verification: 'VIP Verification',
  audition: 'Audition',
};

const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'content', label: 'Site Content', icon: FileEdit },
  { id: 'users', label: 'Manage Users', icon: Users },
  { id: 'requests', label: 'Requests', icon: Inbox },
];

const ADMIN_EMAIL = 'odimusic.office@gmail.com';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

export default function AdminPanel({ onBack }: AdminPanelProps) {
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [users, setUsers] = useState<Profile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [requests, setRequests] = useState<UserRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [resetResult, setResetResult] = useState<{ email: string; password: string } | null>(null);
  const [changingRoleId, setChangingRoleId] = useState<string | null>(null);
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);
  const [jetFile, setJetFile] = useState<File | null>(null);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [savingContent, setSavingContent] = useState(false);
  const [contentSaved, setContentSaved] = useState(false);
  const [trackCount, setTrackCount] = useState(0);
  const [notesCount, setNotesCount] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const fetchUsers = useCallback(async () => {
    if (!session) return;
    setLoadingUsers(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? 'Failed to load users');
      } else {
        setUsers(data.users as Profile[]);
      }
    } catch {
      setError('Connection lost. Could not load users.');
    }
    setLoadingUsers(false);
  }, [session]);

  const fetchRequests = useCallback(async () => {
    setLoadingRequests(true);
    const { data, error: reqError } = await supabase
      .from('user_requests')
      .select('*')
      .order('created_at', { ascending: false });
    if (reqError) {
      setError('Could not load requests.');
    } else if (data) {
      setRequests(data as UserRequest[]);
    }
    setLoadingRequests(false);
  }, []);

  const fetchStats = useCallback(async () => {
    const [{ count: tCount }, { count: nCount }] = await Promise.all([
      supabase.from('tracks').select('*', { count: 'exact', head: true }),
      supabase.from('notes').select('*', { count: 'exact', head: true }),
    ]);
    setTrackCount(tCount ?? 0);
    setNotesCount(nCount ?? 0);
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchRequests();
    fetchStats();
  }, [fetchUsers, fetchRequests, fetchStats]);

  useEffect(() => {
    let mounted = true;
    supabase
      .from('site_content')
      .select('id, hero_title, hero_subtitle, hero_image_url, jet_image_url, about_legend, updated_at')
      .eq('id', 1)
      .maybeSingle()
      .then(({ data }) => {
        if (mounted && data) setContent(data as SiteContent);
      });
    return () => { mounted = false; };
  }, []);

  const uploadContentImage = async (file: File, kind: 'jet' | 'hero') => {
    if (!file.type.startsWith('image/') || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      throw new Error('Please choose a JPG, PNG, or WebP image.');
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Images must be smaller than 5 MB.');
    }
    const extension = file.type.split('/')[1].replace('jpeg', 'jpg');
    const path = `${kind}-${Date.now()}-${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from('site-content').upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    if (error) throw error;
    return supabase.storage.from('site-content').getPublicUrl(path).data.publicUrl;
  };

  const handleSaveContent = async () => {
    setSavingContent(true);
    setError(null);
    setContentSaved(false);
    try {
      const jetImageUrl = jetFile ? await uploadContentImage(jetFile, 'jet') : content.jet_image_url;
      const heroImageUrl = heroFile ? await uploadContentImage(heroFile, 'hero') : content.hero_image_url;
      const { data, error: saveError } = await supabase
        .from('site_content')
        .update({
          hero_title: content.hero_title.trim(),
          hero_subtitle: content.hero_subtitle.trim(),
          hero_image_url: heroImageUrl,
          jet_image_url: jetImageUrl,
          about_legend: content.about_legend,
        })
        .eq('id', 1)
        .select('id, hero_title, hero_subtitle, hero_image_url, jet_image_url, about_legend, updated_at')
        .maybeSingle();
      if (saveError || !data) throw saveError ?? new Error('Content was not saved.');
      setContent(data as SiteContent);
      setJetFile(null);
      setHeroFile(null);
      setContentSaved(true);
      showToast('Content saved.', 'success');
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : '';
      setError(
        message === 'Please choose a JPG, PNG, or WebP image.' || message === 'Images must be smaller than 5 MB.'
          ? message
          : 'Could not save homepage content.'
      );
      showToast('Could not save content.', 'error');
    } finally {
      setSavingContent(false);
    }
  };

  const handleCopy = async (text: string, fieldKey: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldKey);
      setTimeout(() => setCopiedField(null), 2000);
    } catch { /* clipboard not available */ }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!session) return;
    setChangingRoleId(userId);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, role: newRole }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        showToast(data.error ?? 'Failed to update role.', 'error');
      } else {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole as Profile['role'] } : u)));
        showToast('Role updated.', 'success');
      }
    } catch {
      showToast('Connection lost.', 'error');
    }
    setChangingRoleId(null);
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (!session) return;
    if (!window.confirm(`Delete user "${userName}"? This cannot be undone.`)) return;
    setDeletingId(userId);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        showToast(data.error ?? 'Failed to delete user.', 'error');
      } else {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        showToast('User deleted.', 'success');
      }
    } catch {
      showToast('Connection lost.', 'error');
    }
    setDeletingId(null);
  };

  const handleResetPassword = async (userId: string) => {
    if (!session) return;
    if (!window.confirm('Generate a new temporary password for this user?')) return;
    setResettingId(userId);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        showToast(data.error ?? 'Failed to reset password.', 'error');
      } else {
        setResetResult({ email: data.email, password: data.tempPassword });
      }
    } catch {
      showToast('Connection lost.', 'error');
    }
    setResettingId(null);
  };

  const handleRequestAction = async (requestId: string, newStatus: 'approved' | 'rejected') => {
    const { error: updateError } = await supabase
      .from('user_requests')
      .update({ status: newStatus })
      .eq('id', requestId);
    if (updateError) {
      showToast('Could not update request.', 'error');
    } else {
      setRequests((prev) => prev.map((r) => (r.id === requestId ? { ...r, status: newStatus } : r)));
      showToast(`Request ${newStatus}.`, 'success');
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const adminCount = users.filter((u) => u.role === 'admin').length;

  return (
    <div className="min-h-screen bg-[#0A0A0A] px-6 py-8 sm:px-10">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-[#888888] transition-colors hover:text-white"
          >
            <ArrowLeft size={18} strokeWidth={1.5} />
            Back
          </button>
          <span className="flex items-center gap-2 rounded-full border border-[#3B82F6]/30 bg-[#3B82F6]/10 px-3 py-1 text-xs font-medium text-[#3B82F6]">
            <ShieldAlert size={14} strokeWidth={1.5} />
            Admin
          </span>
        </div>

        <h1 className="font-anton text-4xl uppercase leading-tight text-white sm:text-5xl">
          Admin Panel
        </h1>
        <p className="mt-3 text-sm text-[#888888]">Manage your platform content, users, and requests.</p>

        {/* Tabs */}
        <div className="mt-8 flex gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] p-1 backdrop-blur-md">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#3B82F6] text-white'
                    : 'text-[#888888] hover:text-white'
                }`}
              >
                <Icon size={15} strokeWidth={1.75} />
                {tab.label}
                {tab.id === 'requests' && pendingRequests.length > 0 && (
                  <span className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                    isActive ? 'bg-white text-[#3B82F6]' : 'bg-[#3B82F6] text-white'
                  }`}>
                    {pendingRequests.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="mt-6">
          {/* Overview */}
          {activeTab === 'overview' && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total Users" value={users.length} />
              <StatCard label="Admins" value={adminCount} />
              <StatCard label="Tracks" value={trackCount} />
              <StatCard label="Notes" value={notesCount} />
              <div className="sm:col-span-2 lg:col-span-4">
                <StatCard label="Pending Requests" value={pendingRequests.length} highlight={pendingRequests.length > 0} />
              </div>
            </div>
          )}

          {/* Site Content */}
          {activeTab === 'content' && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-anton text-2xl uppercase text-white">Content Manager</h2>
                  <p className="mt-2 text-sm text-[#888888]">Edit the public homepage content and About legend.</p>
                </div>
                <ImagePlus size={22} className="text-[#3B82F6]" strokeWidth={1.5} />
              </div>

              <div className="mt-6 grid gap-5">
                <label className="grid gap-2">
                  <span className="text-xs font-medium uppercase tracking-wider text-[#888888]">Hero Title</span>
                  <input
                    value={content.hero_title}
                    onChange={(e) => setContent((prev) => ({ ...prev, hero_title: e.target.value }))}
                    className="rounded-2xl border border-white/10 bg-[#0A0A0A] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[#3B82F6]"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-xs font-medium uppercase tracking-wider text-[#888888]">Hero Subtitle</span>
                  <input
                    value={content.hero_subtitle}
                    onChange={(e) => setContent((prev) => ({ ...prev, hero_subtitle: e.target.value }))}
                    className="rounded-2xl border border-white/10 bg-[#0A0A0A] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[#3B82F6]"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-xs font-medium uppercase tracking-wider text-[#888888]">About Us Legend</span>
                  <textarea
                    value={content.about_legend ?? ''}
                    onChange={(e) => setContent((prev) => ({ ...prev, about_legend: e.target.value }))}
                    rows={3}
                    className="resize-none rounded-2xl border border-white/10 bg-[#0A0A0A] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[#3B82F6]"
                    placeholder="e.g. Three cities. One sound."
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid cursor-pointer gap-2">
                    <span className="text-xs font-medium uppercase tracking-wider text-[#888888]">JET Photo</span>
                    <span className="flex min-h-32 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#0A0A0A] px-4 text-center text-xs text-[#888888] transition-colors hover:border-[#3B82F6]">
                      {jetFile?.name ?? 'Choose an image'}
                    </span>
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setJetFile(e.target.files?.[0] ?? null)} className="sr-only" />
                  </label>

                  <label className="grid cursor-pointer gap-2">
                    <span className="text-xs font-medium uppercase tracking-wider text-[#888888]">Hero Photo</span>
                    <span className="flex min-h-32 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#0A0A0A] px-4 text-center text-xs text-[#888888] transition-colors hover:border-[#3B82F6]">
                      {heroFile?.name ?? 'Choose an image'}
                    </span>
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setHeroFile(e.target.files?.[0] ?? null)} className="sr-only" />
                  </label>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <button
                  onClick={handleSaveContent}
                  disabled={savingContent || !content.hero_title.trim() || !content.hero_subtitle.trim()}
                  className="inline-flex items-center gap-2 rounded-full bg-[#3B82F6] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingContent ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save
                </button>
                {contentSaved && <span className="text-sm text-[#60A5FA]">Saved successfully</span>}
              </div>
            </div>
          )}

          {/* Manage Users */}
          {activeTab === 'users' && (
            <>
              <div className="mb-4 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur-md">
                <ShieldAlert size={18} className="mt-0.5 shrink-0 text-[#888888]" strokeWidth={1.5} />
                <p className="text-xs leading-relaxed text-[#888888]">
                  The Super Admin (odimusic.office@gmail.com) cannot be demoted, deleted, or have their password reset.
                </p>
              </div>

              {error && (
                <p className="mb-4 rounded-xl bg-[#EF4444]/10 px-4 py-3 text-sm text-[#EF4444]">{error}</p>
              )}

              {loadingUsers ? (
                <div className="mt-12 flex justify-center">
                  <Loader2 size={24} className="animate-spin text-[#888888]" />
                </div>
              ) : users.length === 0 ? (
                <p className="mt-12 text-center text-sm text-[#888888]">No users found.</p>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-left">
                        <th className="py-3 px-4 text-xs font-medium uppercase tracking-wider text-[#888888]">Name</th>
                        <th className="py-3 px-4 text-xs font-medium uppercase tracking-wider text-[#888888]">Email</th>
                        <th className="py-3 px-4 text-xs font-medium uppercase tracking-wider text-[#888888]">Role</th>
                        <th className="py-3 px-4 text-xs font-medium uppercase tracking-wider text-[#888888]">Joined</th>
                        <th className="py-3 px-4 text-right text-xs font-medium uppercase tracking-wider text-[#888888]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => {
                        const isSuperAdmin = u.email === ADMIN_EMAIL;
                        return (
                          <tr key={u.id} className="border-b border-white/5 transition-colors hover:bg-white/[0.02]">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-white">{u.name}</span>
                                {u.role === 'admin' && (
                                  <span className="rounded-full bg-[#3B82F6]/15 px-2 py-0.5 text-[10px] font-medium uppercase text-[#3B82F6]">Admin</span>
                                )}
                                {isSuperAdmin && (
                                  <span className="rounded-full bg-[#D4AF37]/15 px-2 py-0.5 text-[10px] font-medium uppercase text-[#D4AF37]">Super</span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-[#CCCCCC]">{u.email}</span>
                                <button
                                  onClick={() => handleCopy(u.email, `email-${u.id}`)}
                                  className="text-[#555555] transition-colors hover:text-[#3B82F6]"
                                  aria-label="Copy email"
                                >
                                  {copiedField === `email-${u.id}` ? <Check size={14} strokeWidth={2} /> : <Copy size={14} strokeWidth={1.5} />}
                                </button>
                              </div>
                            </td>
                            <td className="py-4 px-4">
              {isSuperAdmin ? (
                <span className="text-sm font-medium text-[#D4AF37]">Admin</span>
              ) : (
                <div className="relative inline-block">
                  <select
                    value={u.role}
                    disabled={changingRoleId === u.id}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className="appearance-none rounded-lg border border-white/10 bg-[#0A0A0A] px-3 py-1.5 pr-8 text-xs text-white outline-none transition-colors focus:border-[#3B82F6] disabled:opacity-50"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                  <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#888888]" />
                  {changingRoleId === u.id && <Loader2 size={12} className="absolute right-7 top-1/2 -translate-y-1/2 animate-spin text-[#3B82F6]" />}
                </div>
              )}
                            </td>
                            <td className="py-4 px-4 text-sm text-[#888888]">{formatDate(u.created_at)}</td>
                            <td className="py-4 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleResetPassword(u.id)}
                                  disabled={isSuperAdmin || resettingId === u.id}
                                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-[#888888] transition-all hover:border-[#3B82F6]/50 hover:text-[#3B82F6] disabled:cursor-not-allowed disabled:opacity-30"
                                  title={isSuperAdmin ? 'Cannot reset Super Admin password' : 'Reset password'}
                                >
                                  {resettingId === u.id ? <Loader2 size={12} className="animate-spin" /> : <KeyRound size={12} strokeWidth={1.5} />}
                                  Reset
                                </button>
                                <button
                                  onClick={() => handleDelete(u.id, u.name)}
                                  disabled={isSuperAdmin || deletingId === u.id}
                                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-[#888888] transition-all hover:border-[#EF4444]/40 hover:text-[#EF4444] disabled:cursor-not-allowed disabled:opacity-30"
                                  title={isSuperAdmin ? 'Cannot delete Super Admin' : 'Delete user'}
                                >
                                  {deletingId === u.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} strokeWidth={1.5} />}
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* Requests */}
          {activeTab === 'requests' && (
            <>
              {loadingRequests ? (
                <div className="mt-12 flex justify-center">
                  <Loader2 size={24} className="animate-spin text-[#888888]" />
                </div>
              ) : requests.length === 0 ? (
                <div className="mt-12 text-center">
                  <Inbox size={32} className="mx-auto text-[#555555]" strokeWidth={1.5} />
                  <p className="mt-4 text-sm text-[#888888]">No requests yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {requests.map((req) => (
                    <div
                      key={req.id}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-[#3B82F6]">
                              {requestTypeLabels[req.type]}
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
                          <div className="mt-3 space-y-1">
                            {Object.entries(req.payload).map(([key, value]) => (
                              <div key={key} className="flex gap-2 text-sm">
                                <span className="text-[#555555] capitalize">{key.replace(/_/g, ' ')}:</span>
                                <span className="text-[#CCCCCC] truncate">{value}</span>
                              </div>
                            ))}
                          </div>
                          <p className="mt-2 text-xs text-[#555555]">{formatDate(req.created_at)}</p>
                        </div>

                        {req.status === 'pending' && (
                          <div className="flex shrink-0 items-center gap-2">
                            <button
                              onClick={() => handleRequestAction(req.id, 'approved')}
                              className="inline-flex items-center gap-1.5 rounded-full border border-[#22C55E]/30 bg-[#22C55E]/10 px-3 py-2 text-xs font-medium text-[#22C55E] transition-all hover:bg-[#22C55E]/20"
                            >
                              <CheckIcon size={13} strokeWidth={2} />
                              Approve
                            </button>
                            <button
                              onClick={() => handleRequestAction(req.id, 'rejected')}
                              className="inline-flex items-center gap-1.5 rounded-full border border-[#EF4444]/30 bg-[#EF4444]/10 px-3 py-2 text-xs font-medium text-[#EF4444] transition-all hover:bg-[#EF4444]/20"
                            >
                              <X size={13} strokeWidth={2} />
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Password reset modal */}
      {resetResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade" onClick={() => setResetResult(null)}>
          <div className="relative w-[min(92vw,440px)] rounded-[32px] border border-white/10 bg-[#0A0A0A]/95 p-8 animate-scale-in backdrop-blur-xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setResetResult(null)} className="absolute right-5 top-5 text-[#888888] transition-colors hover:text-white" aria-label="Close">
              <X size={20} strokeWidth={1.5} />
            </button>
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#3B82F6]/15 text-[#3B82F6]">
              <KeyRound size={26} strokeWidth={1.5} />
            </div>
            <h2 className="font-anton text-2xl uppercase text-white">Password Reset</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#888888]">
              Temporary password for <span className="text-white">{resetResult.email}</span>.
              Share it with the user and ask them to change it after signing in.
            </p>
            <div className="mt-6 rounded-2xl border border-white/10 bg-[#0A0A0A] px-5 py-4">
              <p className="text-xs uppercase tracking-wider text-[#555555]">New temporary password</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <code className="font-mono text-lg text-white">{resetResult.password}</code>
                <button
                  onClick={() => handleCopy(resetResult.password, 'temp-password')}
                  className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#3B82F6] px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-[#2563EB]"
                >
                  {copiedField === 'temp-password' ? <><Check size={14} strokeWidth={2} /> Copied</> : <><Copy size={14} strokeWidth={1.5} /> Copy</>}
                </button>
              </div>
            </div>
            <button onClick={() => setResetResult(null)} className="mt-6 w-full rounded-2xl border border-white/10 py-3.5 text-sm font-medium text-[#888888] transition-colors hover:border-white/30 hover:text-white">
              Done
            </button>
          </div>
        </div>
      )}

      {/* Toasts */}
      {toasts.length > 0 && (
        <div className="fixed bottom-8 left-1/2 z-[100] flex -translate-x-1/2 flex-col items-center gap-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`flex items-center gap-2.5 rounded-full border px-5 py-3 shadow-xl animate-fade-up backdrop-blur-md ${
                toast.type === 'success'
                  ? 'border-[#3B82F6]/30 bg-[#0A0A0A]/90 text-white'
                  : 'border-[#EF4444]/30 bg-[#0A0A0A]/90 text-[#EF4444]'
              }`}
            >
              {toast.type === 'success' ? <CheckIcon size={16} className="text-[#3B82F6]" strokeWidth={2} /> : <AlertCircle size={16} strokeWidth={2} />}
              <span className="text-sm">{toast.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border p-6 backdrop-blur-md transition-all ${
      highlight
        ? 'border-[#3B82F6]/30 bg-[#3B82F6]/5'
        : 'border-white/10 bg-white/[0.03]'
    }`}>
      <p className="text-xs font-medium uppercase tracking-wider text-[#888888]">{label}</p>
      <p className={`mt-2 font-anton text-3xl ${highlight ? 'text-[#3B82F6]' : 'text-white'}`}>{value}</p>
    </div>
  );
}
