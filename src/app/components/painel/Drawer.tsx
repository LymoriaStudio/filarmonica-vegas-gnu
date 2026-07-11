import React, { useState, useEffect, useCallback } from 'react';
import { X, LucideIcon } from 'lucide-react';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconBg?: string;
  iconColor?: string;
  onSubmit?: (e: React.FormEvent) => void;
  submitLabel?: string;
  submitting?: boolean;
  children: React.ReactNode;
  width?: string;
}

export function Drawer({
  open,
  onClose,
  title,
  description,
  icon: Icon,
  iconBg = 'bg-amber-50',
  iconColor = 'text-amber-500',
  onSubmit,
  submitLabel = 'Salvar',
  submitting = false,
  children,
  width = 'w-[560px]',
}: DrawerProps) {
  const [closing, setClosing] = useState(false);

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 180);
  }, [onClose]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, handleClose]);

  if (!open) return null;

  const slideIn  = 'drawerSlideIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) both';
  const slideOut = 'drawerSlideOut 0.18s cubic-bezier(0.4, 0, 1, 1) both';

  const inner = (
    <div
      className={`fixed top-0 right-0 z-50 h-full ${width} max-w-full bg-white shadow-2xl flex flex-col`}
      style={{ animation: closing ? slideOut : slideIn }}
    >
      {onSubmit ? (
        <form onSubmit={onSubmit} className="flex flex-col h-full">
          <DrawerHeader Icon={Icon} iconBg={iconBg} iconColor={iconColor} title={title} description={description} onClose={handleClose} />
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">{children}</div>
          <DrawerFooter onClose={handleClose} submitLabel={submitLabel} submitting={submitting} />
        </form>
      ) : (
        <div className="flex flex-col h-full">
          <DrawerHeader Icon={Icon} iconBg={iconBg} iconColor={iconColor} title={title} description={description} onClose={handleClose} />
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">{children}</div>
          <DrawerFooter onClose={handleClose} submitLabel={submitLabel} submitting={submitting} noSubmit />
        </div>
      )}
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes drawerSlideIn  { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes drawerSlideOut { from { transform: translateX(0); } to { transform: translateX(100%); } }
      `}</style>
      <div
        className="fixed top-0 left-0 w-screen h-screen z-40 bg-black/60 animate-fade-in"
        onClick={handleClose}
      />
      {inner}
    </>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────────── */

function DrawerHeader({ Icon, iconBg, iconColor, title, description, onClose }: {
  Icon?: LucideIcon; iconBg?: string; iconColor?: string;
  title: string; description?: string; onClose: () => void;
}) {
  return (
    <div className="flex items-start gap-3 px-6 py-5 border-b border-gray-100 shrink-0">
      {Icon && (
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
          <Icon size={18} className={iconColor} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h2 className="text-base font-bold text-[#001856] leading-tight">{title}</h2>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer shrink-0"
      >
        <X size={16} />
      </button>
    </div>
  );
}

function DrawerFooter({ onClose, submitLabel, submitting, noSubmit }: {
  onClose: () => void; submitLabel?: string; submitting?: boolean; noSubmit?: boolean;
}) {
  return (
    <div className="shrink-0 px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={onClose}
        className="px-5 py-2.5 text-sm font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
      >
        Cancelar
      </button>
      {!noSubmit && (
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 text-sm font-bold bg-[#ffc300] hover:bg-yellow-400 text-[#001856] rounded-lg transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? 'Salvando...' : submitLabel}
        </button>
      )}
    </div>
  );
}

/* ── Section helper ─────────────────────────────────────────────────────── */
export function DrawerSection({ title, optional, children }: {
  title: string; optional?: boolean; children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#001856]/40">
        {title}{optional && <span className="normal-case font-normal text-gray-400 ml-1">(Opcional)</span>}
      </h3>
      {children}
    </section>
  );
}

/* ── Field helpers ──────────────────────────────────────────────────────── */
const fieldBase = 'w-full bg-gray-50 border border-gray-200 text-[#001856] px-3 py-2.5 text-sm rounded-lg focus:outline-none focus:border-[#ffc300] focus:ring-1 focus:ring-[#ffc300]/30 transition-colors placeholder:text-gray-400';

export function DrawerField({ label, required, children }: {
  label: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
        {label}
        {required ? <span className="text-rose-500 ml-0.5">*</span> : <span className="text-gray-400 font-normal ml-1">(Opcional)</span>}
      </label>
      {children}
    </div>
  );
}

export function DrawerInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${fieldBase} ${props.className ?? ''}`} />;
}

export function DrawerTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${fieldBase} resize-none ${props.className ?? ''}`} />;
}

export function DrawerSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${fieldBase} ${props.className ?? ''}`} />;
}
