import React, { useState } from 'react';
import { LAB_CASES } from '../../data/geneticsData';
import { LabCase, NucleotideType } from '../../types/genetics';
import { soundFx } from '../../utils/soundEffects';
import { HeartPulse, CheckCircle2, RotateCcw, Award, Sparkles, Shield, Wrench, AlertCircle, ArrowRight } from 'lucide-react';

export const GeneticLabGame: React.FC = () => {
  const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
  const [patientSequence, setPatientSequence] = useState<string>(LAB_CASES[0].patientSequence);
  const [selectedNuIndex, setSelectedNuIndex] = useState<number | null>(null);
  const [isResolved, setIsResolved] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  const currentCase: LabCase = LAB_CASES[currentCaseIndex];

  const handleSelectCase = (idx: number) => {
    soundFx.playClick();
    setCurrentCaseIndex(idx);
    setPatientSequence(LAB_CASES[idx].patientSequence);
    setSelectedNuIndex(null);
    setIsResolved(false);
  };

  const handleFixBase = (newBase: NucleotideType) => {
    if (selectedNuIndex === null || isResolved) return;

    soundFx.playMutationTrigger();
    const chars = patientSequence.split('');
    chars[selectedNuIndex] = newBase;
    const updated = chars.join('');
    setPatientSequence(updated);

    // Check if fixed matches wildtype
    if (updated === currentCase.wildtypeSequence) {
      soundFx.playSuccess();
      setIsResolved(true);
      setScore((s) => s + 100);
    }
  };

  const handleRepairDimer = () => {
    soundFx.playSuccess();
    setPatientSequence(currentCase.wildtypeSequence);
    setIsResolved(true);
    setScore((s) => s + 100);
  };

  const handleNextCase = () => {
    soundFx.playClick();
    const nextIdx = (currentCaseIndex + 1) % LAB_CASES.length;
    handleSelectCase(nextIdx);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16 text-slate-100">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950/20 to-slate-900 border border-slate-800 p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <HeartPulse className="w-3.5 h-3.5" />
              <span>Phòng Cấp Cứu Phân Tử & Trị Liệu Gen</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Thử Thách: Bác Sĩ Di Truyền Học (DNA Rescue Lab)
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Bạn vào vai chuyên gia di truyền phân tử. Hãy đọc kết quả giải trình tự gen của bệnh nhân, xác định chính xác nucleotide bị đột biến và kích hoạt enzyme sửa sai để chữa lành chuỗi DNA!
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 px-4 py-2.5 rounded-2xl shadow-xl">
            <Award className="w-6 h-6 text-amber-400" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Điểm kinh nghiệm:</span>
              <span className="text-lg font-mono font-bold text-amber-300">{score} XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Case Navigator Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {LAB_CASES.map((cs, idx) => {
          const isCurrent = currentCaseIndex === idx;
          return (
            <button
              key={cs.id}
              onClick={() => handleSelectCase(idx)}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                isCurrent
                  ? 'border-emerald-500 bg-emerald-950/50 text-emerald-200 ring-1 ring-emerald-500/50 shadow-lg'
                  : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white">Ca #{idx + 1}</span>
                <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-cyan-300">
                  {cs.geneName}
                </span>
              </div>
              <h4 className="text-xs font-semibold line-clamp-1">{cs.title.split(': ')[1]}</h4>
            </button>
          );
        })}
      </div>

      {/* Patient Profile Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-slate-800 gap-2">
          <div>
            <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Hồ sơ bệnh án</span>
            <h3 className="text-base font-bold text-white">{currentCase.title}</h3>
          </div>
          <span className="text-xs font-mono text-cyan-300 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
            Gen mục tiêu: {currentCase.geneName}
          </span>
        </div>

        <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2 text-xs">
          <p className="text-slate-300 leading-relaxed">
            <strong className="text-white">Triệu chứng lâm sàng:</strong> {currentCase.patientProfile}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {currentCase.symptoms.map((sym: string, sIdx: number) => (
              <span key={sIdx} className="px-2.5 py-0.5 rounded-md bg-rose-950/50 border border-rose-800/60 text-rose-300 text-[11px]">
                ⚠️ {sym}
              </span>
            ))}
          </div>
        </div>

        {/* DNA Sequence Analysis & Repair Interactive Area */}
        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-cyan-400" />
              <span>Kết quả giải trình tự Sanger của bệnh nhân (Nhấp vào nucleotide bị sai để sửa):</span>
            </span>
            {selectedNuIndex !== null && !isResolved && (
              <span className="font-mono text-cyan-400">Đang chọn nu #{selectedNuIndex + 1}</span>
            )}
          </div>

          {/* Interactive DNA Sequence Row */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto flex flex-wrap gap-2 items-center justify-center">
            {patientSequence.split('').map((char, idx) => {
              const isSelected = selectedNuIndex === idx;
              const isDimerSymbol = char === '=';
              const isMutated = currentCase.wildtypeSequence[idx] !== char;

              return (
                <button
                  key={idx}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedNuIndex(idx);
                  }}
                  disabled={isResolved}
                  className={`w-9 h-11 rounded-xl font-mono font-bold text-base transition-all flex flex-col items-center justify-center cursor-pointer ${
                    isSelected
                      ? 'ring-2 ring-emerald-400 scale-110 bg-emerald-500 text-slate-950 shadow-xl'
                      : isResolved
                      ? 'bg-emerald-950/70 border border-emerald-600 text-emerald-300'
                      : isMutated
                      ? 'bg-rose-950 border-2 border-rose-500 text-rose-300 animate-pulse'
                      : 'bg-slate-800/80 border border-slate-700 text-slate-200 hover:border-slate-500'
                  }`}
                >
                  <span>{char}</span>
                  <span className="text-[9px] opacity-60 -mt-1 font-normal">#{idx + 1}</span>
                </button>
              );
            })}
          </div>

          {/* Reference Wildtype Sequence for Comparison */}
          <div className="p-2.5 bg-slate-950/50 border border-slate-800 rounded-lg flex items-center justify-between text-xs text-slate-400">
            <span>Trình tự gen chuẩn người bình thường (Wildtype):</span>
            <span className="font-mono font-bold text-emerald-400 tracking-wider">
              {currentCase.wildtypeSequence}
            </span>
          </div>

          {/* Repair Toolbar */}
          {!isResolved && (
            <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3">
              {currentCase.fixAction === 'repair_dimer' ? (
                <div className="w-full flex items-center justify-between">
                  <span className="text-xs text-amber-300 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    <span>Phát hiện Dimer Thymine (T=T) biến dạng quang hóa do bức xạ cực tím!</span>
                  </span>
                  <button
                    onClick={handleRepairDimer}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Kích hoạt phức hệ enzyme sửa sai cắt bỏ Nucleotide (NER)</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-300 font-semibold">Chọn base chuẩn IUPAC để sửa chữa:</span>
                  {(['A', 'T', 'G', 'C'] as NucleotideType[]).map((base) => (
                    <button
                      key={base}
                      onClick={() => handleFixBase(base)}
                      disabled={selectedNuIndex === null}
                      className={`w-9 h-9 rounded-xl font-mono font-bold text-xs border transition-all cursor-pointer ${
                        selectedNuIndex === null
                          ? 'opacity-40 cursor-not-allowed border-slate-800 bg-slate-900 text-slate-500'
                          : 'border-emerald-600/70 bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300'
                      }`}
                    >
                      {base}
                    </button>
                  ))}
                  {selectedNuIndex === null && (
                    <span className="text-[11px] text-slate-500 italic ml-2">
                      (Hãy nhấp chọn ô nucleotide lỗi ở hàng trên trước)
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Success Resolved Card */}
          {isResolved && (
            <div className="p-5 rounded-2xl bg-emerald-950/60 border border-emerald-500 text-emerald-200 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <h4 className="text-sm font-bold text-white">Chữa lành thành công chuỗi gen! (+100 XP)</h4>
                </div>
                <button
                  onClick={handleNextCase}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Chuyển sang ca tiếp theo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-xs space-y-1.5 text-slate-200">
                <p>
                  <strong>Chẩn đoán xác định:</strong> {currentCase.diagnosis}
                </p>
                <p>
                  <strong>Cơ chế điều trị:</strong> {currentCase.solutionDescription}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
