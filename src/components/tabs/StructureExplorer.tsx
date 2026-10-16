import React, { useState } from 'react';
import { SGK_ADN_SPECS, SGK_FORMULAS, NUCLEOTIDES_SGK } from '../../data/geneticsData';
import { soundFx } from '../../utils/soundEffects';
import { BookOpen, Calculator, Sparkles, CheckCircle2, BookmarkCheck } from 'lucide-react';

export const StructureExplorer: React.FC = () => {
  // High School Biology Formula Solver state
  const [inputMode, setInputMode] = useState<'N' | 'L' | 'AG'>('N');
  const [valN, setValN] = useState<number>(3000);
  const [valL, setValL] = useState<number>(5100);
  const [valA, setValA] = useState<number>(600);
  const [valG, setValG] = useState<number>(900);

  // Compute values based on input
  let computedN = 3000;
  let computedA = 600;
  let computedT = 600;
  let computedG = 900;
  let computedX = 900;

  if (inputMode === 'N') {
    computedN = valN;
    // Assume 20% A and 30% G by default
    computedA = Math.round(valN * 0.2);
    computedT = computedA;
    computedG = Math.round(valN * 0.3);
    computedX = computedG;
  } else if (inputMode === 'L') {
    computedN = Math.round((valL / 3.4) * 2);
    computedA = Math.round(computedN * 0.2);
    computedT = computedA;
    computedG = Math.round(computedN * 0.3);
    computedX = computedG;
  } else {
    computedA = valA;
    computedT = valA;
    computedG = valG;
    computedX = valG;
    computedN = (valA + valG) * 2;
  }

  const computedL = (computedN / 2) * 3.4;
  const computedH = 2 * computedA + 3 * computedG;
  const computedC = computedN / 20;
  const computedM = computedN * 300;
  const computedHT = computedN - 2;

  return (
    <div className="max-w-5xl mx-auto space-y-7 pb-16 text-slate-100">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800 p-6 md:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl space-y-2.5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
            <BookmarkCheck className="w-3.5 h-3.5" />
            <span>Chuẩn Danh Pháp Quốc Tế IUPAC & Cấu Trúc B-DNA (Watson - Crick)</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Cấu Trúc Phân Tử DNA (Deoxyribonucleic Acid)
          </h2>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            Phân tích chi tiết cấu tạo hóa học của 4 loại đơn phân nucleotide, mô hình chuỗi xoắn kép không gian B-DNA và hệ thống thông số lý sinh - hình học phân tử chuẩn quốc tế.
          </p>
        </div>
      </div>

      {/* 4 Nucleotides (A, T, G, C) */}
      <div>
        <h3 className="text-base font-bold text-white mb-3.5 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <span>4 Loại Đơn Phân Nucleotide Cấu Tạo DNA Chuẩn Quốc Tế (A, T, G, C)</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {Object.values(NUCLEOTIDES_SGK).map((nuc) => (
            <div
              key={nuc.type}
              className="bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all rounded-2xl p-4 shadow-lg flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-xl border shadow-md group-hover:scale-105 transition-transform"
                    style={{
                      backgroundColor: `${nuc.hexCode}20`,
                      borderColor: nuc.hexCode,
                      color: nuc.hexCode,
                    }}
                  >
                    {nuc.type}
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {nuc.category} ({nuc.rings === 2 ? '2 dị vòng' : '1 dị vòng'})
                  </span>
                </div>
                <h4 className="font-bold text-slate-100 text-sm">{nuc.fullName}</h4>
                <div className="text-xs text-emerald-400 font-semibold my-1 font-mono">
                  Bắt cặp: {nuc.type} = {nuc.complementary} ({nuc.hydrogenBonds} liên kết Hydrogen)
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mt-1">
                  {nuc.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Physical specs & NTBS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Kích Thước & Hình Học Không Gian Chuỗi Xoắn Kép (B-DNA)</span>
          </h3>
          <div className="space-y-2">
            {SGK_ADN_SPECS.map((sp, idx) => (
              <div key={idx} className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-xs font-semibold text-slate-200">{sp.name}</span>
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                    {sp.value}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{sp.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Nguyên tắc bổ sung */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Ý Nghĩa Sinh Học Của Nguyên Tắc Bổ Sung Watson - Crick</span>
            </h3>

            <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
                <strong className="text-cyan-400 block mb-1">1. Đảm bảo đường kính DNA luôn không đổi (2.0 nm / 20 Å):</strong>
                <p>Do 1 base Purine kích thước lớn (A, G gồm 2 vòng) luôn liên kết bổ sung đặc hiệu với 1 base Pyrimidine kích thước nhỏ (T, C gồm 1 vòng), khoảng cách giữa 2 chuỗi đối song luôn đạt trạng thái cân bằng hình học tối ưu.</p>
              </div>
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
                <strong className="text-emerald-400 block mb-1">2. Cơ chế truyền đạt và bảo tồn thông tin di truyền:</strong>
                <p>Trong quá trình sao chép (nhân đôi) và phiên mã, từng chuỗi polynucleotide đóng vai trò mạch khuôn để các nucleotide tự do liên kết theo nguyên tắc bổ sung, đảm bảo độ chuẩn xác phân tử tuyệt đối.</p>
              </div>
            </div>
          </div>

          <div className="mt-3 p-2.5 bg-cyan-950/40 border border-cyan-800/40 rounded-xl text-[11px] text-cyan-300">
            💡 <strong>Quy luật Chargaff:</strong> Khi biết chính xác trình tự nucleotide trên một chuỗi đơn (5' → 3'), hoàn toàn xác định được chuỗi đối song bổ sung (3' → 5').
          </div>
        </div>
      </div>

      {/* Molecular Formulas Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Calculator className="w-4 h-4 text-amber-400" />
          <span>Hệ Thống Công Thức Lý Sinh & Tính Toán Phân Tử DNA</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {SGK_FORMULAS.map((f, idx) => (
            <div key={idx} className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
              <span className="text-xs font-semibold text-slate-300 block">{f.title}</span>
              <div className="font-mono font-bold text-xs text-amber-300 bg-amber-950/30 p-1.5 rounded border border-amber-900/50">
                {f.formula}
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive High School Formula Quick-Solver */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-cyan-400" />
              <span>Máy Tính Mô Phỏng Thông Số Lý Sinh Phân Tử DNA</span>
            </h3>
            <p className="text-xs text-slate-400">Chọn biến số đầu vào để hệ thống tự động giải mã toàn bộ thông số hình học & vật lý:</p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                soundFx.playClick();
                setInputMode('N');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                inputMode === 'N' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tổng Nucleotide (N)
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setInputMode('L');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                inputMode === 'L' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Chiều Dài (L)
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setInputMode('AG');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                inputMode === 'AG' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Số Lượng A & G
            </button>
          </div>
        </div>

        {/* Input sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {inputMode === 'N' && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Tổng số nucleotide (N):</span>
                <span className="font-mono font-bold text-cyan-400">{valN.toLocaleString()} nt</span>
              </div>
              <input
                type="range"
                min="600"
                max="6000"
                step="60"
                value={valN}
                onChange={(e) => setValN(parseInt(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer h-1.5"
              />
            </div>
          )}

          {inputMode === 'L' && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Chiều dài phân tử DNA (L):</span>
                <span className="font-mono font-bold text-cyan-400">{valL.toLocaleString()} Å ({(valL / 10).toFixed(1)} nm)</span>
              </div>
              <input
                type="range"
                min="1020"
                max="10200"
                step="102"
                value={valL}
                onChange={(e) => setValL(parseInt(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer h-1.5"
              />
            </div>
          )}

          {inputMode === 'AG' && (
            <>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Số nucleotide loại Adenine (A = T):</span>
                  <span className="font-mono font-bold text-rose-400">{valA} nt</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="1500"
                  step="50"
                  value={valA}
                  onChange={(e) => setValA(parseInt(e.target.value))}
                  className="w-full accent-rose-400 bg-slate-800 rounded-lg cursor-pointer h-1.5"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Số nucleotide loại Guanine (G = C):</span>
                  <span className="font-mono font-bold text-amber-400">{valG} nt</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="1500"
                  step="50"
                  value={valG}
                  onChange={(e) => setValG(parseInt(e.target.value))}
                  className="w-full accent-amber-400 bg-slate-800 rounded-lg cursor-pointer h-1.5"
                />
              </div>
            </>
          )}
        </div>

        {/* Solved Results Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 pt-2">
          <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-center shadow-inner">
            <span className="text-[10px] text-slate-400 block font-mono">Tổng Nu (N)</span>
            <span className="font-mono font-bold text-sm text-cyan-300">{computedN.toLocaleString()} nt</span>
          </div>
          <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-center shadow-inner">
            <span className="text-[10px] text-slate-400 block font-mono">Chiều dài (L)</span>
            <span className="font-mono font-bold text-sm text-cyan-300">{computedL.toLocaleString()} Å</span>
            <span className="text-[9px] text-slate-500 block font-mono">{(computedL / 10).toFixed(1)} nm</span>
          </div>
          <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-center shadow-inner">
            <span className="text-[10px] text-slate-400 block font-mono">Liên kết Hydrogen</span>
            <span className="font-mono font-bold text-sm text-emerald-300">{computedH.toLocaleString()} H</span>
          </div>
          <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-center shadow-inner">
            <span className="text-[10px] text-slate-400 block font-mono">Chu kỳ xoắn (C)</span>
            <span className="font-mono font-bold text-sm text-indigo-300">{computedC} turns</span>
          </div>
          <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-center shadow-inner">
            <span className="text-[10px] text-slate-400 block font-mono">Khối lượng (M)</span>
            <span className="font-mono font-bold text-sm text-amber-300">{computedM.toLocaleString()} Da</span>
          </div>
          <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-center shadow-inner">
            <span className="text-[10px] text-slate-400 block font-mono">Phosphodiester</span>
            <span className="font-mono font-bold text-sm text-rose-300">{computedHT.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
