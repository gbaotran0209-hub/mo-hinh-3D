import React, { useState, useMemo } from 'react';
import { CODON_TABLE } from '../../data/geneticsData';
import { soundFx } from '../../utils/soundEffects';
import { X, Search, Sparkles, Filter } from 'lucide-react';

interface CodonWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CodonWheelModal: React.FC<CodonWheelModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<string>('all');

  const codonsList = useMemo(() => {
    return Object.values(CODON_TABLE);
  }, []);

  const filteredCodons = useMemo(() => {
    return codonsList.filter((item) => {
      const matchSearch =
        item.codon.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.aminoAcid.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.aminoAcidFullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.vietnameseName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchProperty =
        selectedProperty === 'all' || item.property === selectedProperty;

      return matchSearch && matchProperty;
    });
  }, [codonsList, searchTerm, selectedProperty]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold">
              🧬
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Bảng Tra Cứu 64 Bộ Ba Mã Di Truyền (Genetic Code)</h3>
              <p className="text-xs text-slate-400">
                Tính thoái hóa, tính phổ biến và đặc hiệu của mã di truyền trên phân tử mRNA
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

        {/* Filters & Search Toolbar */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm codon (ví dụ: AUG, UAA) hoặc axit amin..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {['all', 'Hydrophobic', 'Polar', 'Acidic', 'Basic', 'Stop'].map((prop) => (
              <button
                key={prop}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedProperty(prop);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedProperty === prop
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {prop === 'all'
                  ? 'Tất cả (64)'
                  : prop === 'Hydrophobic'
                  ? 'Kỵ nước'
                  : prop === 'Polar'
                  ? 'Phân cực'
                  : prop === 'Acidic'
                  ? 'Tính Acid'
                  : prop === 'Basic'
                  ? 'Tính Base'
                  : 'Mã kết thúc (Stop)'}
              </button>
            ))}
          </div>
        </div>

        {/* 64 Codon Grid */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {filteredCodons.map((item) => {
              const isStop = item.property === 'Stop';
              const isStart = item.codon === 'AUG';

              return (
                <div
                  key={item.codon}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                    isStop
                      ? 'bg-rose-950/40 border-rose-800 text-rose-300 hover:border-rose-500'
                      : isStart
                      ? 'bg-emerald-950/50 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/50'
                      : item.property === 'Hydrophobic'
                      ? 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      : item.property === 'Polar'
                      ? 'bg-cyan-950/20 border-cyan-800/40 text-cyan-200 hover:border-cyan-600'
                      : item.property === 'Acidic'
                      ? 'bg-amber-950/30 border-amber-800/40 text-amber-200 hover:border-amber-600'
                      : 'bg-indigo-950/30 border-indigo-800/40 text-indigo-200 hover:border-indigo-600'
                  }`}
                >
                  <div className="font-mono font-bold text-sm tracking-wider mb-0.5">
                    {item.codon}
                  </div>
                  <div className="font-bold text-xs text-white">
                    {item.aminoAcid} ({item.letterCode})
                  </div>
                  <div className="text-[10px] text-slate-400 line-clamp-1">
                    {item.vietnameseName}
                  </div>
                  {isStart && (
                    <span className="mt-1 text-[9px] px-1 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/40">
                      Mở đầu
                    </span>
                  )}
                  {isStop && (
                    <span className="mt-1 text-[9px] px-1 bg-rose-500/20 text-rose-300 rounded border border-rose-500/40">
                      Dừng
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {filteredCodons.length === 0 && (
            <div className="py-12 text-center text-slate-500 text-xs">
              Không tìm thấy codon hoặc axit amin phù hợp với từ khóa "{searchTerm}".
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Mã di truyền có 3 đặc điểm: Tính liên tục (không gối), Tính phổ biến (dùng chung cho mọi loài) và Tính thoái hóa.</span>
          </div>
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
