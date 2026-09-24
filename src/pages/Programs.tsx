// src/pages/Programs.tsx
import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Programs() {
  const { programs, updateProgram } = useApp();
  const [selectedProgId, setSelectedProgId] = useState<string>('ai-pm');
  const [isEditing, setIsEditing] = useState(false);

  const prog = programs.find((p) => p.id === selectedProgId) || programs[0];

  const [editPrice, setEditPrice] = useState(prog.price);
  const [editDuration, setEditDuration] = useState(prog.duration);
  const [editTiming, setEditTiming] = useState(prog.batchTiming);

  const handleSelect = (id: string) => {
    setSelectedProgId(id);
    const selected = programs.find((p) => p.id === id);
    if (selected) {
      setEditPrice(selected.price);
      setEditDuration(selected.duration);
      setEditTiming(selected.batchTiming);
    }
  };

  const handleSave = () => {
    updateProgram({
      ...prog,
      price: Number(editPrice),
      duration: editDuration,
      batchTiming: editTiming
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Program Database</h1>
          <p className="text-sm text-gray-500">Configure program curricula, duration, fees, eligibility, and capstone project specifications.</p>
        </div>
      </div>

      {/* Program Selector Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 gap-4 text-sm font-semibold">
        {programs.map((p) => (
          <button
            key={p.id}
            onClick={() => handleSelect(p.id)}
            className={`pb-3 px-1 border-b-2 transition-all ${
              selectedProgId === p.id
                ? 'border-primary-600 text-primary-600 dark:text-primary-400 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Program Details Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{prog.name}</h2>
            <p className="text-xs text-gray-500 mt-0.5">Program ID: {prog.id}</p>
          </div>
          <button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className="px-4 py-2 bg-primary-600 text-white font-bold text-xs rounded-lg shadow hover:bg-primary-700"
          >
            {isEditing ? '💾 Save Changes' : '✏️ Edit Program Details'}
          </button>
        </div>

        {/* Pricing & Duration Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <span className="text-xs text-gray-500 block font-semibold">Duration</span>
            {isEditing ? (
              <input
                type="text"
                value={editDuration}
                onChange={(e) => setEditDuration(e.target.value)}
                className="mt-1 px-2 py-1 border rounded text-sm w-full dark:bg-gray-700"
              />
            ) : (
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{prog.duration}</span>
            )}
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <span className="text-xs text-gray-500 block font-semibold">Program Fee (INR)</span>
            {isEditing ? (
              <input
                type="number"
                value={editPrice}
                onChange={(e) => setEditPrice(Number(e.target.value))}
                className="mt-1 px-2 py-1 border rounded text-sm w-full dark:bg-gray-700"
              />
            ) : (
              <span className="text-lg font-bold text-primary-600">₹{prog.price.toLocaleString()}</span>
            )}
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <span className="text-xs text-gray-500 block font-semibold">Batch Timing</span>
            {isEditing ? (
              <input
                type="text"
                value={editTiming}
                onChange={(e) => setEditTiming(e.target.value)}
                className="mt-1 px-2 py-1 border rounded text-sm w-full dark:bg-gray-700"
              />
            ) : (
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{prog.batchTiming}</span>
            )}
          </div>
        </div>

        {/* Curriculum Structure */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">Curriculum Structure</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {prog.structure.map((item, idx) => (
              <div key={idx} className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl space-y-2">
                <span className="text-xs font-bold text-primary-600">{item.month}</span>
                <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">{item.title}</h4>
                <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-300 space-y-1">
                  {item.topics.map((t, tidx) => (
                    <li key={tidx}>{t}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Projects & Outcomes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">Capstone Projects</h3>
            <ul className="list-disc list-inside text-xs text-gray-700 dark:text-gray-300 space-y-1 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              {prog.projects.map((proj, idx) => (
                <li key={idx}>{proj}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">Expected Learning Outcomes</h3>
            <ul className="list-disc list-inside text-xs text-gray-700 dark:text-gray-300 space-y-1 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              {prog.outcomes.map((out, idx) => (
                <li key={idx}>{out}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Placement Support & Policies */}
        <div className="p-4 bg-primary-50/50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-900 rounded-xl space-y-1">
          <h4 className="text-xs font-bold text-primary-900 dark:text-primary-300">Placement Support Policy</h4>
          <p className="text-xs text-gray-700 dark:text-gray-300">{prog.placementSupport}</p>
        </div>
      </div>
    </div>
  );
}
