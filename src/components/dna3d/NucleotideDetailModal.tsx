import React from 'react';
import { BasePairData, NucleotideType } from '../../types/genetics';
import { NUCLEOTIDES } from '../../data/geneticsData';
import { soundFx } from '../../utils/soundEffects';
import { X, ExternalLink, ShieldCheck, Atom, Zap, Layers } from 'lucide-react';

interface NucleotideDetailModalProps {
  basePair: BasePairData | null;
  selectedBase: NucleotideType | null;
  strand: 1 | 2;
  onClose: () => void;
}

export const NucleotideDetailModal: React.FC<NucleotideDetailModalProps> = ({
  basePair,
  selectedBase,
  strand,
  onClose,
}) => {
  if (!basePair || !selectedBase) return null;

  const nuc = NUCLEOTIDES[selectedBase];
  const complementaryBase = nuc.complementary;
  const compNuc = NUCLEOTIDES[complementaryBase];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-xl shadow-lg border"
              style={{
                backgroundColor: `${nuc.hexCode}20`,
                borderColor: nuc.hexCode,
                color: nuc.hexCode,
              }}
            >
              {nuc.type}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{nuc.fullName}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                  Chuỗi {strand} (5' → 3')
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Vị trí cặp base #{basePair.index + 1} trên chuỗi xoắn kép B-DNA
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

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm">
          {/* Base Pairing Card */}
          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-sm border"
                style={{ backgroundColor: `${nuc.hexCode}20`, borderColor: nuc.hexCode, color: nuc.hexCode }}
              >
                {nuc.type}
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs text-cyan-400 font-semibold">{nuc.hydrogenBonds} liên kết Hydrogen</span>
                <span className="text-slate-500 text-xs font-mono">
                  {nuc.hydrogenBonds === 3 ? '≡ (liên kết ba)' : '= (liên kết đôi)'}
                </span>
              </div>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-sm border"
                style={{ backgroundColor: `${compNuc.hexCode}20`, borderColor: compNuc.hexCode, color: compNuc.hexCode }}
              >
                {compNuc.type}
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block">Nguyên tắc bổ sung</span>
              <span className="text-xs font-semibold text-emerald-400">Watson - Crick / Chargaff: [A] = [T], [G] = [C]</span>
            </div>
          </div>

          {/* Molecular & Physical Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-2.5 bg-slate-800/50 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-400 block mb-1">Phân loại Base</span>
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1">
                <Atom className="w-3.5 h-3.5 text-cyan-400" />
                {nuc.category}
              </span>
            </div>
            <div className="p-2.5 bg-slate-800/50 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-400 block mb-1">Cấu trúc dị vòng</span>
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                {nuc.rings === 2 ? 'Purine (2 vòng)' : 'Pyrimidine (1 vòng)'}
              </span>
            </div>
            <div className="p-2.5 bg-slate-800/50 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-400 block mb-1">Công thức hóa học</span>
              <span className="text-xs font-mono font-semibold text-cyan-300">
                {nuc.formula}
              </span>
            </div>
            <div className="p-2.5 bg-slate-800/50 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-400 block mb-1">Vai trò sinh học</span>
              <span className="text-xs font-semibold text-emerald-300">
                Đơn phân DNA
              </span>
            </div>
          </div>

          {/* Structural Description */}
          <div className="p-3.5 bg-slate-800/30 border border-slate-800 rounded-xl space-y-2">
            <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Đặc điểm cấu tạo & Ghép cặp phân tử</span>
            </h4>
            <p className="text-xs leading-relaxed text-slate-300">
              {nuc.description}
            </p>
          </div>

          {/* Biological Role */}
          <div className="p-3.5 bg-slate-800/30 border border-slate-800 rounded-xl space-y-2">
            <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Chức năng sinh học phân tử</span>
            </h4>
            <p className="text-xs leading-relaxed text-slate-300">
              {nuc.biologicalRole || 'Đơn vị cấu trúc cơ bản của nucleic acid di truyền.'}
            </p>
          </div>

          {/* Chemical Formula ASCII / Diagram */}
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-slate-400">Sơ đồ liên kết đường Deoxyribose & Phosphate:</span>
              <span className="text-[10px] font-mono text-cyan-400">Liên kết 3'-5' Phosphodiester</span>
            </div>
            <div className="p-2.5 bg-slate-900/80 rounded-lg font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed border border-slate-800">
              <div className="text-emerald-400 font-semibold mb-1">5' Đầu Phosphate [PO₄³⁻]</div>
              <div className="text-slate-400 pl-4">│ Liên kết ester tại C5' của đường Pentose</div>
              <div className="text-cyan-400 font-semibold pl-4">┌──[Đường Deoxyribose C₅H₁₀O₄]──┐</div>
              <div className="text-slate-400 pl-8">│ C1' gắn liên kết β-N-glycosidic với {nuc.fullName} ({nuc.type})</div>
              <div className="text-indigo-400 font-semibold pl-8">└── Base Nitơ: [{nuc.type}] ═══ (Liên kết Hydrogen) ═══ [{compNuc.type}]</div>
              <div className="text-slate-400 pl-4">│ C3' chứa nhóm tự do [-OH]</div>
              <div className="text-amber-400 font-semibold">3' Đầu Hydroxyl tự do [-OH] (vị trí kéo dài chuỗi tổng hợp)</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            <span>Nguồn: PDB 1BNA & Campbell Biology (12th Ed)</span>
          </div>
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
