import React, { useState, useMemo } from 'react';
import { CODON_TABLE } from '../../data/geneticsData';
import { NucleotideType } from '../../types/genetics';
import { soundFx } from '../../utils/soundEffects';
import { Play, RotateCcw, AlertTriangle, ArrowRight, Check, Zap, Info, Scissors, Plus, Trash2 } from 'lucide-react';

interface GenePreset {
  id: string;
  name: string;
  gene: string;
  sequence: string; // DNA coding strand 5'->3'
  description: string;
  mutationHotspotIndex?: number;
  mutationAlternative?: NucleotideType;
}

const PRESETS: GenePreset[] = [
  {
    id: 'hbb',
    name: 'Đoạn gen HBB (Beta-Globin - Bệnh hồng cầu liềm)',
    gene: 'HBB',
    sequence: 'ATGGTGCACCTGACTCCTGAGGAGAAGTCT', // Start codon ATG, codon 6 is GAG (Glu)
    description: 'Vị trí codon số 6 là GAG (mã hóa Glutamate). Đổi A thành T sẽ tạo ra GTG (Valine) gây bệnh hồng cầu liềm.',
    mutationHotspotIndex: 19, // A in GAG (pos 19)
    mutationAlternative: 'T'
  },
  {
    id: 'cftr',
    name: 'Đoạn gen CFTR (Bệnh xơ nang Delta F508)',
    gene: 'CFTR',
    sequence: 'ACCATTAAAGAAAATATCATCTTTGGTGTT', // CTT (Phe508)
    description: 'Đoạn mã hóa vùng F508. Mất 3 nucleotide CTT sẽ làm mất axit amin Phenylalanine, gây cuộn gập sai hỏng kênh ion Cl-.',
    mutationHotspotIndex: 18,
  },
  {
    id: 'tp53',
    name: 'Đoạn gen TP53 (Gen ức chế khối u - Ung thư)',
    gene: 'TP53',
    sequence: 'ATGGAGGAGCCGCAGTCAGATCCTAGCGTC',
    description: 'Gen ức chế khối u quan trọng nhất ở người, nhận diện và ngăn chặn tế bào ung thư.',
  }
];

export const MutationStudio: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<GenePreset>(PRESETS[0]);
  const [dnaSequence, setDnaSequence] = useState<string>(PRESETS[0].sequence);
  const [selectedBaseIndex, setSelectedBaseIndex] = useState<number | null>(null);

  // Load preset
  const handleSelectPreset = (preset: GenePreset) => {
    soundFx.playClick();
    setSelectedPreset(preset);
    setDnaSequence(preset.sequence);
    setSelectedBaseIndex(null);
  };

  // Reset to original preset sequence
  const handleReset = () => {
    soundFx.playClick();
    setDnaSequence(selectedPreset.sequence);
    setSelectedBaseIndex(null);
  };

  // Transcription: DNA coding strand -> mRNA (replace T with U)
  const mrnaSequence = useMemo(() => {
    return dnaSequence.toUpperCase().replace(/T/g, 'U');
  }, [dnaSequence]);

  // Translation: mRNA -> Polypeptide
  const { translatedAAs, codonsList } = useMemo(() => {
    const codons: string[] = [];
    for (let i = 0; i < mrnaSequence.length; i += 3) {
      const codon = mrnaSequence.slice(i, i + 3);
      if (codon.length === 3) {
        codons.push(codon);
      }
    }

    const aas = codons.map((c) => {
      return CODON_TABLE[c] || {
        codon: c,
        aminoAcid: '???',
        aminoAcidFullName: 'Không xác định',
        letterCode: '?',
        property: 'Polar' as const,
        vietnameseName: 'Chưa rõ'
      };
    });

    return { translatedAAs: aas, codonsList: codons };
  }, [mrnaSequence]);

  // Original Wildtype translation for comparison
  const originalTranslation = useMemo(() => {
    const origMrna = selectedPreset.sequence.replace(/T/g, 'U');
    const aas = [];
    for (let i = 0; i < origMrna.length; i += 3) {
      const c = origMrna.slice(i, i + 3);
      if (c.length === 3) {
        aas.push(CODON_TABLE[c]?.aminoAcid || '???');
      }
    }
    return aas;
  }, [selectedPreset]);

  // Mutation Analysis
  const mutationAnalysis = useMemo(() => {
    const orig = selectedPreset.sequence;
    const curr = dnaSequence;

    if (orig === curr) {
      return {
        type: 'wildtype',
        title: 'Chuỗi nguyên bản (Wildtype) - Không có đột biến',
        severity: 'normal',
        detail: 'Chuỗi DNA trùng khớp 100% với gen gốc của người khỏe mạnh.'
      };
    }

    if (curr.length !== orig.length) {
      const diff = curr.length - orig.length;
      const isMultipleOf3 = Math.abs(diff) % 3 === 0;
      return {
        type: 'frameshift',
        title: isMultipleOf3
          ? `Đột biến thêm/mất ${Math.abs(diff)} nucleotide (Bội số 3 - Bảo toàn khung đọc)`
          : `Đột biến dịch khung nghiêm trọng (${diff > 0 ? `Chèn +${diff}` : `Mất ${diff}`} nucleotide)`,
        severity: isMultipleOf3 ? 'moderate' : 'severe',
        detail: isMultipleOf3
          ? 'Khung đọc bộ ba (triplet codons) được bảo toàn nhưng số lượng amino acid bị tăng hoặc giảm, có thể làm thay đổi cấu hình không gian.'
          : 'Lệch toàn bộ khung đọc mã di truyền phía sau vị trí đột biến. Gần như 100% chuỗi polypeptide bị biến tính hoặc sớm xuất hiện mã kết thúc STOP cụt ngắn.'
      };
    }

    // Same length -> substitution
    let diffCount = 0;
    let diffIndices: number[] = [];
    for (let i = 0; i < curr.length; i++) {
      if (curr[i] !== orig[i]) {
        diffCount++;
        diffIndices.push(i);
      }
    }

    // Check amino acid changes
    let aaDiffCount = 0;
    let hasPrematureStop = false;
    let oldAa = '';
    let newAa = '';

    for (let i = 0; i < translatedAAs.length; i++) {
      const origAa = originalTranslation[i];
      const curAa = translatedAAs[i].aminoAcid;
      if (origAa !== curAa) {
        aaDiffCount++;
        oldAa = origAa;
        newAa = curAa;
        if (curAa === 'STOP' && origAa !== 'STOP') {
          hasPrematureStop = true;
        }
      }
    }

    if (aaDiffCount === 0) {
      return {
        type: 'silent',
        title: 'Đột biến đồng nghĩa (Silent Mutation)',
        severity: 'mild',
        detail: `Thay đổi ${diffCount} cặp nucleotide nhưng không làm đổi bất kỳ axit amin nào do tính thoái hóa của mã di truyền.`
      };
    }

    if (hasPrematureStop) {
      return {
        type: 'nonsense',
        title: 'Đột biến vô nghĩa (Nonsense Mutation) - Xuất hiện mã STOP sớm!',
        severity: 'severe',
        detail: `Codon mã hóa bị biến đổi thành bộ ba kết thúc (${newAa}), khiến chuỗi polypeptide bị cụt ngắn và giáng hóa.`
      };
    }

    return {
      type: 'missense',
      title: `Đột biến sai nghĩa (Missense Mutation): ${oldAa} → ${newAa}`,
      severity: 'moderate',
      detail: `Thay đổi 1 axit amin tại vị trí codon bị đột biến. Nếu thay thế giữa axit amin ưa nước (Hydrophilic) và kỵ nước (Hydrophobic), cấu trúc protein có thể bị sụp đổ (như bệnh hồng cầu liềm HbS).`
    };
  }, [dnaSequence, selectedPreset, translatedAAs, originalTranslation]);

  // Mutation action handlers
  const handleSubstituteBase = (newBase: NucleotideType) => {
    if (selectedBaseIndex === null) return;
    soundFx.playMutationTrigger();
    const chars = dnaSequence.split('');
    chars[selectedBaseIndex] = newBase;
    setDnaSequence(chars.join(''));
  };

  const handleInsertBase = (base: NucleotideType) => {
    if (selectedBaseIndex === null) return;
    soundFx.playMutationTrigger();
    const chars = dnaSequence.split('');
    chars.splice(selectedBaseIndex + 1, 0, base);
    setDnaSequence(chars.join(''));
    setSelectedBaseIndex(selectedBaseIndex + 1);
  };

  const handleDeleteBase = () => {
    if (selectedBaseIndex === null || dnaSequence.length <= 3) return;
    soundFx.playMutationTrigger();
    const chars = dnaSequence.split('');
    chars.splice(selectedBaseIndex, 1);
    setDnaSequence(chars.join(''));
    setSelectedBaseIndex(Math.max(0, selectedBaseIndex - 1));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 text-slate-100">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800 p-6 md:p-8">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5" />
            <span>Phòng Nghiên Cứu Biến Nạp & Dịch Mã Tương Tác</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Xưởng Đột Biến Gen & Giải Mã Di Truyền Thời Gian Thực
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Tự do thử nghiệm các dạng đột biến bằng cách nhấp vào bất kỳ nucleotide nào trong chuỗi DNA bên dưới để
            <strong> thay thế</strong>, <strong>chèn thêm</strong> hoặc <strong>xóa</strong> base. Xem ngay kết quả phiên mã sang mRNA và sự biến đổi của chuỗi polypeptide!
          </p>
        </div>
      </div>

      {/* Preset Gene Selectors */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2.5">
          Chọn đoạn gen mẫu của người:
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {PRESETS.map((preset) => {
            const isSelected = selectedPreset.id === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950/60 text-cyan-200 ring-1 ring-cyan-400/50 shadow-md'
                    : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-white">{preset.name}</span>
                  <span className="text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-cyan-300">
                    {preset.gene}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">{preset.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Sequence Editor Canvas */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-slate-800 gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Chuỗi DNA Mạch Khuôn Mã Hóa (5' → 3')
            </span>
            <span className="text-xs font-mono text-cyan-400">({dnaSequence.length} bp)</span>
          </div>

          <div className="flex items-center gap-2">
            {selectedPreset.mutationHotspotIndex !== undefined && (
              <button
                onClick={() => {
                  soundFx.playMutationTrigger();
                  setSelectedBaseIndex(selectedPreset.mutationHotspotIndex!);
                  if (selectedPreset.mutationAlternative) {
                    const chars = dnaSequence.split('');
                    chars[selectedPreset.mutationHotspotIndex!] = selectedPreset.mutationAlternative;
                    setDnaSequence(chars.join(''));
                  }
                }}
                className="px-2.5 py-1 bg-rose-950/70 hover:bg-rose-900/80 border border-rose-700 text-rose-300 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <AlertTriangle className="w-3 h-3 text-rose-400" />
                <span>Kích hoạt điểm nóng đột biến ({selectedPreset.gene})</span>
              </button>
            )}

            <button
              onClick={handleReset}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Khôi phục mẫu chuẩn</span>
            </button>
          </div>
        </div>

        {/* Nucleotide Sequence Row (Clickable) */}
        <div>
          <div className="text-xs text-slate-400 mb-2 flex items-center justify-between">
            <span>Nhấp vào bất kỳ nucleotide nào để chỉnh sửa hoặc gây đột biến:</span>
            {selectedBaseIndex !== null && (
              <span className="text-cyan-400 font-mono">
                Đang chọn: Vị trí #{selectedBaseIndex + 1} ({dnaSequence[selectedBaseIndex]})
              </span>
            )}
          </div>

          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto flex flex-wrap gap-1.5 items-center">
            {dnaSequence.split('').map((char, idx) => {
              const isSelected = selectedBaseIndex === idx;
              const isMutatedFromOriginal = selectedPreset.sequence[idx] !== char;
              const codonGroup = Math.floor(idx / 3);
              const isCodonStart = idx % 3 === 0;

              return (
                <div key={idx} className="flex items-center">
                  {isCodonStart && idx > 0 && (
                    <div className="w-1.5 h-6 mx-1 border-r border-slate-700/80" />
                  )}
                  <button
                    onClick={() => {
                      soundFx.playClick(600);
                      setSelectedBaseIndex(idx);
                    }}
                    className={`w-7 h-9 rounded-lg font-mono font-bold text-sm transition-all flex flex-col items-center justify-center cursor-pointer ${
                      isSelected
                        ? 'ring-2 ring-cyan-400 scale-110 z-10 bg-cyan-500 text-slate-950 shadow-lg'
                        : isMutatedFromOriginal
                        ? 'bg-rose-950 border border-rose-500 text-rose-300'
                        : char === 'A'
                        ? 'bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 hover:bg-emerald-900/60'
                        : char === 'T'
                        ? 'bg-rose-950/60 border border-rose-800/80 text-rose-300 hover:bg-rose-900/60'
                        : char === 'G'
                        ? 'bg-amber-950/60 border border-amber-800/80 text-amber-300 hover:bg-amber-900/60'
                        : 'bg-cyan-950/60 border border-cyan-800/80 text-cyan-300 hover:bg-cyan-900/60'
                    }`}
                  >
                    <span>{char}</span>
                    <span className="text-[8px] opacity-60 -mt-0.5">{idx + 1}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Base Action Toolbar */}
        {selectedBaseIndex !== null && (
          <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Thay đổi thành:</span>
              {(['A', 'T', 'G', 'C'] as NucleotideType[]).map((base) => (
                <button
                  key={base}
                  onClick={() => handleSubstituteBase(base)}
                  disabled={dnaSequence[selectedBaseIndex] === base}
                  className={`w-8 h-8 rounded-lg font-mono font-bold text-xs border transition-all cursor-pointer ${
                    dnaSequence[selectedBaseIndex] === base
                      ? 'opacity-40 cursor-not-allowed border-slate-700'
                      : 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:border-cyan-400'
                  }`}
                >
                  {base}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Chèn thêm:</span>
              {(['A', 'T', 'G', 'C'] as NucleotideType[]).map((base) => (
                <button
                  key={base}
                  onClick={() => handleInsertBase(base)}
                  className="px-2 py-1 rounded-lg text-xs font-mono font-semibold bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-700 text-indigo-300 transition-colors flex items-center gap-0.5 cursor-pointer"
                  title={`Chèn thêm ${base} phía sau`}
                >
                  <Plus className="w-2.5 h-2.5" />
                  <span>{base}</span>
                </button>
              ))}

              <button
                onClick={handleDeleteBase}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-950/80 hover:bg-rose-900 border border-rose-700 text-rose-300 transition-colors flex items-center gap-1 cursor-pointer"
                title="Xóa nucleotide này (Đột biến mất cặp)"
              >
                <Trash2 className="w-3 h-3" />
                <span>Xóa nu</span>
              </button>
            </div>
          </div>
        )}

        {/* Central Dogma Live Flow: mRNA & Polypeptide */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* mRNA Output */}
          <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5" />
                <span>1. Bản Phiên Mã mRNA (5' → 3')</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">U thế chỗ T</span>
            </div>
            <div className="p-2.5 bg-slate-900 rounded-lg font-mono text-xs text-cyan-300 tracking-widest break-all border border-slate-800">
              {mrnaSequence}
            </div>
            <div className="text-[11px] text-slate-400">
              Tổng số bộ ba hoàn chỉnh: <strong>{codonsList.length} codons</strong>
            </div>
          </div>

          {/* Polypeptide Translation Output */}
          <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>2. Chuỗi Polypeptide (Dịch mã Axit Amin)</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Đầu N → Đầu C</span>
            </div>

            <div className="p-2.5 bg-slate-900 rounded-lg flex flex-wrap gap-1.5 border border-slate-800 min-h-[46px] items-center">
              {translatedAAs.map((aa, aIdx) => {
                const isStop = aa.property === 'Stop';
                const isMutatedAA = originalTranslation[aIdx] !== aa.aminoAcid;

                return (
                  <div
                    key={aIdx}
                    className={`px-2 py-1 rounded-md text-xs font-mono font-bold flex items-center gap-1 border ${
                      isStop
                        ? 'bg-rose-950 border-rose-500 text-rose-300 animate-pulse'
                        : isMutatedAA
                        ? 'bg-amber-950 border-amber-500 text-amber-200 shadow-md'
                        : 'bg-slate-800 border-slate-700 text-slate-200'
                    }`}
                    title={`${aa.aminoAcidFullName} (${aa.vietnameseName}) - Codon: ${aa.codon}`}
                  >
                    <span>{aa.aminoAcid}</span>
                    <span className="text-[9px] font-normal opacity-60">#{aIdx + 1}</span>
                  </div>
                );
              })}
            </div>

            <div className="text-[11px] text-slate-400 flex justify-between">
              <span>Độ dài: <strong>{translatedAAs.length} axit amin</strong></span>
              <span className="text-amber-400 font-mono text-[10px]">Màu vàng: Axit amin bị biến đổi</span>
            </div>
          </div>
        </div>

        {/* Live Genetic Diagnosis Card */}
        <div
          className={`p-4 rounded-xl border ${
            mutationAnalysis.severity === 'severe'
              ? 'bg-rose-950/40 border-rose-700/80 text-rose-200'
              : mutationAnalysis.severity === 'moderate'
              ? 'bg-amber-950/40 border-amber-700/80 text-amber-200'
              : mutationAnalysis.severity === 'mild'
              ? 'bg-emerald-950/40 border-emerald-700/80 text-emerald-200'
              : 'bg-cyan-950/40 border-cyan-700/80 text-cyan-200'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <h4 className="text-sm font-bold">{mutationAnalysis.title}</h4>
          </div>
          <p className="text-xs leading-relaxed opacity-90 pl-6">
            {mutationAnalysis.detail}
          </p>
        </div>
      </div>
    </div>
  );
};
