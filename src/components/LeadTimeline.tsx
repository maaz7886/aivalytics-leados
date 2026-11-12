// src/components/LeadTimeline.tsx
import { useState, useEffect } from 'react';
import type { Lead, TimelineEvent } from '../types';
import { useApp } from '../context/AppContext';

interface Props {
  lead: Lead;
}

export default function LeadTimeline({ lead }: Props) {
  const { fetchLeadTimeline, logTimelineEvent, currentUser } = useApp();
  const [dbEvents, setDbEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadTimeline() {
      if (!lead?.id) return;
      setLoading(true);
      try {
        const events = await fetchLeadTimeline(lead.id);
        if (mounted && events && events.length > 0) {
          setDbEvents(events);
        }
      } catch (err) {
        console.error('Error loading timeline:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadTimeline();
    return () => {
      mounted = false;
    };
  }, [lead?.id, fetchLeadTimeline]);

  // Merge database timeline events with local lead events for seamless resilience
  const combinedEvents: {
    id: string;
    type: string;
    title: string;
    description: string;
    performedBy: string;
    timestamp: string;
    icon: string;
    badgeColor: string;
  }[] = [];

  // Add DB events
  dbEvents.forEach((ev) => {
    let icon = '📌';
    let badgeColor = 'bg-gray-100 text-gray-800';

    const evType = String(ev.eventType);
    if (evType === 'created' || evType === 'synced_from_sheet') {
      icon = '📥';
      badgeColor = 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
    } else if (evType === 'assigned' || evType === 'reassigned') {
      icon = '👤';
      badgeColor = 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
    } else if (evType === 'call_logged') {
      icon = '📞';
      badgeColor = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
    } else if (evType === 'stage_changed') {
      icon = '🔄';
      badgeColor = 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300';
    } else if (evType === 'note_added') {
      icon = '📝';
      badgeColor = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    } else if (evType.includes('pay') || evType.includes('enrolled')) {
      icon = '💳';
      badgeColor = 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300';
    }

    combinedEvents.push({
      id: ev.id,
      type: ev.eventType,
      title: ev.title || ev.eventType.replace(/_/g, ' '),
      description: ev.description || '',
      performedBy: ev.performedByName || 'System',
      timestamp: ev.createdAt,
      icon,
      badgeColor
    });
  });

  // Synthesize events from lead state if DB was offline or empty
  if (combinedEvents.length === 0) {
    // 1. Lead creation
    if (lead.dateCaptured || lead.createdTime) {
      combinedEvents.push({
        id: `synth-create-${lead.id}`,
        type: 'synced_from_sheet',
        title: 'Lead Ingested from Meta Ads',
        description: `Source: ${lead.source || 'Meta Ads Form'} • Campaign: ${lead.metaCampaign || lead.campaignName || 'Direct'}`,
        performedBy: 'Google Sheet Sync',
        timestamp: lead.dateCaptured || lead.createdTime || new Date().toISOString(),
        icon: '📥',
        badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
      });
    }

    // 2. Assignment
    if (lead.assignedSalesperson && lead.assignedSalesperson !== 'Unassigned') {
      combinedEvents.push({
        id: `synth-assign-${lead.id}`,
        type: 'lead_assigned',
        title: `Assigned to ${lead.assignedSalesperson}`,
        description: `Lead allocated to ${lead.assignedSalesperson} for immediate outreach.`,
        performedBy: 'Admin / Auto-Assign',
        timestamp: lead.assignedAt || lead.dateCaptured || new Date().toISOString(),
        icon: '👤',
        badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
      });
    }

    // 3. Call notes history
    if (lead.callNotesHistory && Array.isArray(lead.callNotesHistory)) {
      lead.callNotesHistory.forEach((note: any, idx: number) => {
        combinedEvents.push({
          id: note.id || `synth-note-${idx}`,
          type: 'call_logged',
          title: note.rawNotes?.includes('[Outcome:')
            ? `Call: ${note.rawNotes.split('[Outcome:')[1].split(']')[0].trim()}`
            : 'Outreach Activity',
          description: note.rawNotes || 'Call logged',
          performedBy: note.salesperson || lead.assignedSalesperson || 'Sales Rep',
          timestamp: note.date || new Date().toISOString(),
          icon: '📞',
          badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
        });
      });
    }

    // 4. Conversion or Payment
    if (lead.paymentStatus === 'Paid' || lead.crmStage === 'Converted') {
      combinedEvents.push({
        id: `synth-paid-${lead.id}`,
        type: 'payment_recorded',
        title: 'Payment Received / Program Enrolled',
        description: `Enrolled in ${lead.programName || 'AI Program'} - Amount: ₹${(lead.amountPaid || 49999).toLocaleString('en-IN')}`,
        performedBy: lead.assignedSalesperson || 'Sales Rep',
        timestamp: lead.lastContacted || new Date().toISOString(),
        icon: '💳',
        badgeColor: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'
      });
    }
  }

  // Sort descending by timestamp
  combinedEvents.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const handleAddQuickNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setIsSubmitting(true);
    const performer = currentUser?.name || 'Sales Rep';
    const noteText = newNote.trim();

    try {
      await logTimelineEvent(
        lead.id,
        'note_added',
        'Quick Note Added',
        noteText
      );

      // Add to local list immediately
      setDbEvents((prev) => [
        {
          id: `ev-${Date.now()}`,
          leadId: lead.id,
          eventType: 'note_added',
          title: 'Quick Note Added',
          description: noteText,
          performedByName: performer,
          createdAt: new Date().toISOString()
        },
        ...prev
      ]);

      setNewNote('');
    } catch (err) {
      console.error('Error logging note:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick Add Timeline Note Form */}
      <form onSubmit={handleAddQuickNote} className="flex gap-2">
        <input
          type="text"
          placeholder="Add an update or note to lead timeline..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="flex-1 px-3.5 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-750 text-gray-900 dark:text-gray-100 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
        />
        <button
          type="submit"
          disabled={!newNote.trim() || isSubmitting}
          className="px-4 py-2 bg-[#133926] hover:bg-[#1a4a33] disabled:opacity-50 text-white text-xs font-bold rounded-xl cursor-pointer transition-all"
        >
          {isSubmitting ? 'Posting...' : 'Post'}
        </button>
      </form>

      {/* Visual Timeline Stream */}
      <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-700">
        {loading && combinedEvents.length === 0 ? (
          <div className="text-xs text-gray-400 py-4">Loading timeline stream...</div>
        ) : combinedEvents.length === 0 ? (
          <div className="text-xs text-gray-400 py-4">No events recorded yet.</div>
        ) : (
          combinedEvents.map((ev) => {
            let formattedTime = ev.timestamp;
            try {
              const d = new Date(ev.timestamp);
              if (!isNaN(d.getTime())) {
                formattedTime = d.toLocaleString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });
              }
            } catch {}

            return (
              <div key={ev.id} className="relative group">
                {/* Node Dot / Icon */}
                <div className="absolute -left-6 top-0 w-5 h-5 rounded-full bg-white dark:bg-gray-800 border-2 border-emerald-500 flex items-center justify-center text-[10px] shadow-2xs">
                  {ev.icon}
                </div>

                {/* Content Box */}
                <div className="bg-gray-50 dark:bg-gray-750/70 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-xs text-gray-900 dark:text-gray-100">
                      {ev.title}
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">
                      {formattedTime}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                    {ev.description}
                  </p>

                  <div className="mt-2 flex items-center justify-between text-[10px] text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-1.5">
                    <span>
                      Performed by: <strong>{ev.performedBy}</strong>
                    </span>
                    <span className={`px-2 py-0.2 rounded-full font-bold ${ev.badgeColor}`}>
                      {ev.type}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
