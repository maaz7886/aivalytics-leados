// src/pages/Leads.tsx
import { useState } from 'react';
import LeadTable from '../components/LeadTable';
import MetaLeadSimulatorModal from '../components/MetaLeadSimulatorModal';
import CsvImportModal from '../components/CsvImportModal';
import LeadCalendarView from '../components/LeadCalendarView';
import Pipeline from './Pipeline';

export default function Leads() {
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'kanban' | 'calendar'>('calendar');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Leads & Sales CRM</h1>
          <p className="text-sm text-gray-500">Manage incoming Meta Ads leads, view calendar capture timeline, and drag & drop CRM stages.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* View Toggle */}
          <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex items-center border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-xs'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <span>📅</span> Calendar View
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-xs'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <span>📋</span> Table View
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-xs'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <span>📌</span> Kanban CRM
            </button>
          </div>

          <button
            onClick={() => setIsCsvImportOpen(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            📊 Upload Excel / CSV Leads
          </button>
          <button
            onClick={() => setIsSimulatorOpen(true)}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>⚡</span> + Simulate Meta Lead
          </button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <LeadCalendarView />
      ) : viewMode === 'table' ? (
        <LeadTable />
      ) : (
        <Pipeline />
      )}

      <MetaLeadSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
      />

      <CsvImportModal
        isOpen={isCsvImportOpen}
        onClose={() => setIsCsvImportOpen(false)}
      />
    </div>
  );
}
