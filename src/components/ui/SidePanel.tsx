// src/components/ui/SidePanel.tsx
import React, { useEffect } from 'react';

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: number; // default 480
}

export const SidePanel: React.FC<SidePanelProps> = ({
  isOpen,
  onClose,
  children,
  width = 480
}) => {
  // Esc key closes panel
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile only backdrop for full-screen feel; desktop has NO backdrop so grid is visible & interactive */}
      <div
        className="md:hidden fixed inset-0 z-40 bg-black/20"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Side Panel Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        style={{ maxWidth: width }}
        className="fixed top-0 right-0 z-50 h-full w-full md:w-[480px] bg-white border-l border-[#E6E6E3] shadow-xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
      >
        {children}
      </aside>
    </>
  );
};

