// src/pages/Mentors.tsx
import { useState } from 'react';
import { MENTOR_PRESETS } from '../utils/cadenceUtils';
import { Video, Clock, Award, ExternalLink, Plus } from 'lucide-react';

export default function Mentors() {
  const [mentors] = useState(MENTOR_PRESETS);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
              Faculty & Mentor Directory
            </h1>
            <span className="px-3 py-0.5 rounded-full text-xs font-black bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
              {mentors.length} Active Mentors
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Designated curriculum mentors for AI-Native PM 1-on-1 alignment calls and career transition reviews.
          </p>
        </div>

        <button
          onClick={() => alert('New faculty mentor onboarding modal')}
          className="px-4 py-2 bg-[#133926] hover:bg-[#1a4a33] text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Faculty Mentor</span>
        </button>
      </div>

      {/* Mentor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mentors.map((m) => (
          <div
            key={m.name}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-2xs p-6 flex flex-col justify-between space-y-4 hover:border-emerald-500/50 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-black text-lg flex items-center justify-center shadow-xs">
                  {m.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">{m.name}</h3>
                  <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 block">{m.title}</span>
                </div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-750 rounded-xl space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-2 text-[11px]">
                  <Award className="w-3.5 h-3.5 text-gray-400" />
                  <span><strong>Specialty:</strong> {m.specialty}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span><strong>Format:</strong> 30 min 1-on-1 Google Meet</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Available for Booking
              </span>
              <a
                href="https://meet.google.com/aiv-mentor-session"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-bold flex items-center gap-1"
              >
                <Video className="w-3 h-3" />
                <span>Meet Link</span>
                <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
