// src/pages/Mentors.tsx
import { useState } from 'react';
import { MENTOR_PRESETS } from '../utils/cadenceUtils';
import { Button } from '../components/ui/Button';
import {
  Video,
  Clock,
  Award,
  ExternalLink,
  Plus,
  CheckCircle2,
  X
} from 'lucide-react';

export default function Mentors() {
  const [mentors, setMentors] = useState(MENTOR_PRESETS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMentorName, setNewMentorName] = useState('');
  const [newMentorTitle, setNewMentorTitle] = useState('');
  const [newMentorSpecialty, setNewMentorSpecialty] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddMentor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMentorName || !newMentorTitle) return;

    setMentors([
      ...mentors,
      {
        name: newMentorName,
        title: newMentorTitle,
        specialty: newMentorSpecialty || 'AI Strategy & Transition'
      }
    ]);
    showToast(`Added ${newMentorName} to faculty directory`);
    setIsModalOpen(false);
    setNewMentorName('');
    setNewMentorTitle('');
    setNewMentorSpecialty('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 px-4 py-2.5 bg-[#1F1F1D] text-white rounded-lg shadow-lg flex items-center gap-2 text-[13px] font-medium animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[20px] font-semibold text-[#1F1F1D] tracking-tight">
              Faculty & Mentor Directory
            </h1>
            <span className="text-[12px] font-medium px-2 py-0.5 rounded-full bg-[#F7F7F5] border border-[#E6E6E3] text-[#6B6B66] tabular-nums font-mono">
              {mentors.length} Active Mentors
            </span>
          </div>
          <p className="text-[13px] text-[#6B6B66] mt-0.5">
            Designated curriculum mentors for 1-on-1 strategy sessions (Attempt 2), diagnostic calls, and career transitions.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 text-[13px]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Faculty Mentor</span>
        </Button>
      </div>

      {/* Mentors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mentors.map((m) => (
          <div
            key={m.name}
            className="bg-white border border-[#E6E6E3] rounded-lg p-5 flex flex-col justify-between space-y-4 hover:border-[#3B4BDB]/40 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#EEF0FD] text-[#3B4BDB] font-semibold text-[14px] flex items-center justify-center shrink-0">
                  {m.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div>
                  <h3 className="font-semibold text-[14px] text-[#1F1F1D]">{m.name}</h3>
                  <span className="text-[12px] text-[#6B6B66] block">{m.title}</span>
                </div>
              </div>

              <div className="p-3 bg-[#F7F7F5] rounded-md border border-[#E6E6E3] space-y-1.5 text-[12px]">
                <div className="flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-[#6B6B66] shrink-0" />
                  <span className="text-[#1F1F1D]">
                    <span className="text-[#6B6B66]">Specialty:</span> {m.specialty}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#6B6B66] shrink-0" />
                  <span className="text-[#6B6B66]">Format: 15–30 min 1-on-1 Strategy Call</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E6E6E3] flex items-center justify-between text-[12px]">
              <span className="text-[11px] font-medium text-[#17673A] bg-[#DDF4E4] px-2 py-0.5 rounded-full border border-[#C3ECD0] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#17673A]" /> Available for Booking
              </span>
              <a
                href="https://meet.google.com/aiv-mentor-session"
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 text-[#3B4BDB] hover:bg-[#EEF0FD] rounded-md font-medium text-[12px] flex items-center gap-1"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Meet Link</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Add Mentor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form
            onSubmit={handleAddMentor}
            className="bg-white rounded-lg max-w-md w-full p-5 shadow-xl border border-[#E6E6E3] space-y-4 animate-in fade-in"
          >
            <div className="flex items-center justify-between border-b border-[#E6E6E3] pb-3">
              <h3 className="font-semibold text-[14px] text-[#1F1F1D]">
                Add Faculty Mentor
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#6B6B66] hover:text-[#1F1F1D] p-1 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-[13px]">
              <div>
                <label className="font-medium text-[#1F1F1D] block mb-1 text-[12px]">
                  Mentor Name *
                </label>
                <input
                  type="text"
                  required
                  value={newMentorName}
                  onChange={(e) => setNewMentorName(e.target.value)}
                  placeholder="e.g. Maaz Khan"
                  className="w-full px-3 py-1.5 border border-[#E6E6E3] rounded-md text-[13px] bg-white text-[#1F1F1D] focus:outline-hidden focus:border-[#3B4BDB]"
                />
              </div>

              <div>
                <label className="font-medium text-[#1F1F1D] block mb-1 text-[12px]">
                  Title / Role *
                </label>
                <input
                  type="text"
                  required
                  value={newMentorTitle}
                  onChange={(e) => setNewMentorTitle(e.target.value)}
                  placeholder="e.g. Lead Instructor & Head of AI"
                  className="w-full px-3 py-1.5 border border-[#E6E6E3] rounded-md text-[13px] bg-white text-[#1F1F1D] focus:outline-hidden focus:border-[#3B4BDB]"
                />
              </div>

              <div>
                <label className="font-medium text-[#1F1F1D] block mb-1 text-[12px]">
                  Curriculum Specialty
                </label>
                <input
                  type="text"
                  value={newMentorSpecialty}
                  onChange={(e) => setNewMentorSpecialty(e.target.value)}
                  placeholder="e.g. AI-PM Architecture & Agent Orchestration"
                  className="w-full px-3 py-1.5 border border-[#E6E6E3] rounded-md text-[13px] bg-white text-[#1F1F1D] focus:outline-hidden focus:border-[#3B4BDB]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#E6E6E3]">
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Add Mentor
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
