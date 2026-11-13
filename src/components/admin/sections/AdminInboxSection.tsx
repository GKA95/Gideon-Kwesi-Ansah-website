import { useEffect, useState } from 'react';
import { Archive, Mail, MailOpen, Trash2 } from 'lucide-react';
import { apiFetch } from '../../../services/api';
import type { ContactMessageItem } from '../../../types/portfolio';

export function AdminInboxSection() {
  const [messages, setMessages] = useState<ContactMessageItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'archived'>('all');
  const [selected, setSelected] = useState<ContactMessageItem | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadMessages() {
    setLoading(true);
    try {
      const res = await apiFetch<{ messages: ContactMessageItem[] }>('/api/admin/messages');
      setMessages(res.messages || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadMessages();
  }, []);

  async function setStatus(id: string, status: 'unread' | 'read' | 'archived') {
    const res = await apiFetch<{ message: ContactMessageItem }>(`/api/admin/messages/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    setMessages((prev) => prev.map((m) => (m._id === id ? res.message : m)));
    if (selected?._id === id) setSelected(res.message);
  }

  async function openMessage(msg: ContactMessageItem) {
    setSelected(msg);
    if (msg.status === 'unread') {
      await setStatus(msg._id, 'read');
    }
  }

  async function deleteMessage(id: string) {
    await apiFetch(`/api/admin/messages/${id}`, { method: 'DELETE' });
    setMessages((prev) => prev.filter((m) => m._id !== id));
    if (selected?._id === id) setSelected(null);
  }

  const filtered = messages.filter((m) => (filter === 'all' ? true : m.status === filter));
  const unreadCount = messages.filter((m) => m.status === 'unread').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white">
            Contact Messages Inbox
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {unreadCount} unread · {messages.length} total
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-[#0D1B2E] border border-slate-200 dark:border-slate-800">
          {(['all', 'unread', 'read', 'archived'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize ${
                filter === tab
                  ? 'bg-white dark:bg-[#0A192F] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1B2E] divide-y divide-slate-200 dark:divide-slate-800 overflow-hidden">
          {loading ? (
            <div className="p-6 text-sm text-slate-500">Loading inbox...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No messages in this folder.
            </div>
          ) : (
            filtered.map((msg) => {
              const isSelected = selected?._id === msg._id;
              return (
                <button
                  key={msg._id}
                  type="button"
                  onClick={() => void openMessage(msg)}
                  className={`w-full text-left p-4 transition-colors ${
                    isSelected
                      ? 'bg-sky-50/80 dark:bg-sky-950/30'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-sm ${
                        msg.status === 'unread'
                          ? 'font-bold text-slate-900 dark:text-white'
                          : 'font-medium text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {msg.fullName}
                    </span>
                    <span className="text-[11px] font-mono tabular-nums text-slate-500">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-sky-700 dark:text-sky-400">
                    {msg.serviceOfInterest}
                    {msg.status === 'unread' ? ' · Unread' : ''}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {msg.message}
                  </p>
                </button>
              );
            })
          )}
        </div>

        <div className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1B2E] p-6">
          {selected ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">
                    {selected.fullName}
                  </h3>
                  <p className="text-sm text-sky-700 dark:text-sky-400">{selected.email}</p>
                  {selected.organisation ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Organisation: {selected.organisation}
                    </p>
                  ) : null}
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 tabular-nums">
                    Service: {selected.serviceOfInterest} · Received{' '}
                    {new Date(selected.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      void setStatus(
                        selected._id,
                        selected.status === 'unread' ? 'read' : 'unread'
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium"
                  >
                    {selected.status === 'unread' ? (
                      <>
                        <MailOpen className="w-3.5 h-3.5" />
                        <span>Mark Read</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-3.5 h-3.5" />
                        <span>Mark Unread</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => void setStatus(selected._id, 'archived')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>Archive</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => void deleteMessage(selected._id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-300 dark:border-rose-800 text-xs font-medium text-rose-600 dark:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              <div className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                {selected.message}
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-sm text-slate-500 dark:text-slate-400">
              Select a message from the inbox to read full details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
