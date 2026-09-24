import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function TasksPage() {
  const { leads, updateLeadStage, setSelectedLeadId } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'Overdue Leads' | 'Due Today' | 'Upcoming' | 'AI Attention Required'>('Due Today');

  const today = new Date().toISOString().substring(0, 10);
  const next3Days = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);
  const past3Days = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);

  const filteredLeads = leads.filter((l) => {
    // Helper to extract YYYY-MM-DD from nextFollowUp (could be datetime)
    const leadNext = l.nextFollowUp ? l.nextFollowUp.substring(0, 10) : '';
    
    const isOverdue = leadNext && leadNext < today;
    const isToday = leadNext === today;
    const isUpcoming = leadNext && leadNext > today && leadNext <= next3Days;
    
    const lastCont = l.lastContacted ? l.lastContacted.substring(0, 10) : '';
    const isAiAttention = (l.leadHealthScore < 40 || l.priority === 'P1' || l.temperature === 'Hot') && 
                          (!lastCont || lastCont < past3Days);

    if (activeTab === 'Overdue Leads') return isOverdue;
    if (activeTab === 'Due Today') return isToday;
    if (activeTab === 'Upcoming') return isUpcoming;
    if (activeTab === 'AI Attention Required') return isAiAttention;
    return false;
  });

  const handleViewLead = (leadId: string) => {
    setSelectedLeadId(leadId);
    navigate('/profile');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Follow-Up Command Center</h1>
        <p className="text-sm text-gray-500">Manage your follow-ups based on AI recommendations and schedule.</p>
      </div>

      <div className="flex border-b border-gray-200 dark:border-gray-700 gap-4 text-sm font-semibold">
        {(['Overdue Leads', 'Due Today', 'Upcoming', 'AI Attention Required'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-1 border-b-2 transition-all ${
              activeTab === tab
                ? 'border-primary-600 text-primary-600 dark:text-primary-400 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredLeads.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-400 text-sm">
            No leads found for {activeTab}.
          </div>
        ) : (
          filteredLeads.map((l) => (
            <div key={l.id} className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row justify-between gap-4 hover:border-primary-200 transition-colors">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h3 onClick={() => handleViewLead(l.id)} className="text-lg font-bold text-gray-900 dark:text-gray-100 cursor-pointer hover:text-primary-600">
                    {l.fullName}
                  </h3>
                  <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-bold text-gray-600 dark:text-gray-300">{l.crmStage}</span>
                  {(l.leadHealthScore < 40) && <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-bold">Stale Health</span>}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-primary-700 dark:text-primary-400">Next Best Action: </span> 
                  {l.nextBestAction || l.recommendedNextAction || 'Follow up to gauge interest'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 italic">
                  <span className="font-semibold not-italic">Last Note: </span> 
                  {l.comments || 'No previous notes.'}
                </div>
              </div>
              
              <div className="flex flex-col gap-2 min-w-[200px]">
                <div className="flex gap-2">
                  <a href={`https://wa.me/${l.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs text-center rounded-lg shadow-sm">
                    💬 WhatsApp
                  </a>
                  <a href={`tel:${l.phone.replace(/[^0-9]/g, '')}`} className="flex-1 py-1.5 bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs text-center rounded-lg shadow-sm">
                    📞 Call
                  </a>
                </div>
                <select
                  value={l.crmStage}
                  onChange={(e) => updateLeadStage(l.id, e.target.value as any)}
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-xs font-bold w-full focus:ring-primary-500"
                >
                  <option value="New Lead">New Lead</option>
                  <option value="Call Pending">Call Pending</option>
                  <option value="Did Not Receive Call">Did Not Receive Call</option>
                  <option value="Connected">Connected</option>
                  <option value="Interested">Interested</option>
                  <option value="Details Sent on WhatsApp">Details Sent on WhatsApp</option>
                  <option value="Follow-Up 1">Follow-Up 1</option>
                  <option value="Follow-Up 2">Follow-Up 2</option>
                  <option value="Follow-Up 3">Follow-Up 3</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Payment Pending">Payment Pending</option>
                  <option value="Joined Session">Joined Session</option>
                  <option value="Not Interested">Not Interested</option>
                  <option value="Unqualified">Unqualified</option>
                  <option value="Lost">Lost</option>
                  <option value="Converted">Converted</option>
                </select>
                <button onClick={() => handleViewLead(l.id)} className="text-xs text-primary-600 font-bold hover:underline mt-1 text-center">
                  View Full Profile & Log Notes →
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
