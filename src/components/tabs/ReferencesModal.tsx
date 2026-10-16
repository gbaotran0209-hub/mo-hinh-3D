import React from 'react';
import { SCIENTIFIC_REFERENCES } from '../../data/geneticsData';
import { soundFx } from '../../utils/soundEffects';
import { X, BookOpen, ExternalLink, ShieldCheck } from 'lucide-react';

interface ReferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReferencesModal: React.FC<ReferencesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Nguồn Trích Dẫn & Tài Liệu Tham Khảo Chuyên Ngành</h3>
              <p className="text-xs text-slate-400">
                Cơ sở dữ liệu di truyền học quốc tế và các công trình khoa học đạt giải Nobel
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of references */}
        <div className="p-5 overflow-y-auto space-y-4">
          {SCIENTIFIC_REFERENCES.map((ref, idx) => (
            <div key={idx} className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-bold text-slate-100">{ref.title}</h4>
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              </div>

              <div className="text-xs text-slate-400">
                <span className="text-slate-300 font-medium">{ref.authors}</span> · <span className="text-cyan-300">{ref.journal}</span> ({ref.year})
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {ref.description}
              </p>

              <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-slate-400">
                {'doi' in ref && ref.doi && <span>DOI: {ref.doi}</span>}
                {'isbn' in ref && (ref as { isbn?: string }).isbn && <span>ISBN: {(ref as { isbn?: string }).isbn}</span>}
                {'pdbId' in ref && (ref as { pdbId?: string }).pdbId && <span className="text-amber-400 font-bold">RCSB PDB ID: {(ref as { pdbId?: string }).pdbId}</span>}
                {'url' in ref && (ref as { url?: string }).url && (
                  <a
                    href={(ref as { url?: string }).url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <span>Cổng tra cứu</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
