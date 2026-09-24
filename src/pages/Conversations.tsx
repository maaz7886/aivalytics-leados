// src/pages/Conversations.tsx
import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Conversations() {
  const { leads } = useApp();
  const [selectedLeadId, setSelectedLeadId] = useState(leads[0].id);

  const selectedLead = leads.find((l) => l.id === selectedLeadId) || leads[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Multi-Channel Conversations</h1>
        <p className="text-sm text-gray-500">Unified inbox for WhatsApp messages, email threads, and call recording transcripts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Leads List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 overflow-y-auto space-y-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-2">Lead Conversations</h3>
          {leads.map((l) => (
            <div
              key={l.id}
              onClick={() => setSelectedLeadId(l.id)}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                selectedLeadId === l.id
                  ? 'bg-primary-50 dark:bg-primary-950 border-primary-500'
                  : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex justify-between font-bold text-sm text-gray-900 dark:text-gray-100">
                <span>{l.fullName}</span>
                <span className="text-xs text-gray-400 font-normal">10m ago</span>
              </div>
              <p className="text-xs text-gray-500 truncate mt-1">{l.programName}</p>
            </div>
          ))}
        </div>

        {/* Conversation Thread */}
        <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col justify-between">
          <div className="space-y-4 overflow-y-auto pr-2">
            <div className="pb-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">{selectedLead.fullName}</h3>
                <span className="text-xs text-gray-400">{selectedLead.phone} • {selectedLead.email}</span>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                WhatsApp Active
              </span>
            </div>

            {/* Chat Bubble 1 */}
            <div className="flex flex-col items-start space-y-1">
              <span className="text-[10px] text-gray-400">Prospect ({selectedLead.fullName}) - Yesterday</span>
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-2xl max-w-md text-sm text-gray-800 dark:text-gray-100">
                Hi, I filled the Meta ad form for {selectedLead.programName}. Can you share the curriculum details?
              </div>
            </div>

            {/* Chat Bubble 2 */}
            <div className="flex flex-col items-end space-y-1">
              <span className="text-[10px] text-gray-400">Salesperson ({selectedLead.assignedSalesperson}) - Yesterday</span>
              <div className="bg-primary-600 text-white p-3 rounded-2xl max-w-md text-sm shadow">
                Hi {selectedLead.fullName.split(' ')[0]}! Thanks for reaching out. Based on your {selectedLead.yearsOfExperience} years of experience in {selectedLead.industry}, our course focuses specifically on adding AI agent orchestration to your existing skillset.
              </div>
            </div>

            {/* Chat Bubble 3 */}
            <div className="flex flex-col items-start space-y-1">
              <span className="text-[10px] text-gray-400">Prospect ({selectedLead.fullName}) - Today</span>
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-2xl max-w-md text-sm text-gray-800 dark:text-gray-100">
                That sounds great. What time can we speak on Saturday?
              </div>
            </div>
          </div>

          {/* Reply Box */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
            <input
              type="text"
              placeholder="Type WhatsApp reply..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-sm"
            />
            <button className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm rounded-xl shadow">
              Send Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
