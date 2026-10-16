import React, { useState } from 'react';
import { HIGH_SCHOOL_MUTATIONS } from '../../data/geneticsData';
import { DNAViewMode } from '../../types/genetics';
import { soundFx } from '../../utils/soundEffects';
import { AlertCircle, Eye, ShieldAlert, Sparkles, Flame, CheckCircle2, ArrowRight } from 'lucide-react';

interface MutationExplorerProps {
  onSwitchTo3DMode: (mode: DNAViewMode) => void;
}

export const MutationExplorer: React.FC<MutationExplorerProps> = ({ onSwitchTo3DMode }) => {
  const [activeCategory, setActiveCategory] = useState<'types' | 'examples' | 'causes'>('types');
  const [sliderPos, setSliderPos] = useState<number>(50);

  const sgkMutationTypes = [
    {
      name: '1. Đột biến thay thế cặp nucleotide (Base Substitution)',
      subtitle: 'Tần số xuất hiện cao nhất',
      consequence: 'Chỉ thay đổi tối đa 1 amino acid hoặc giữ nguyên (Đồng nghĩa)',
      detail: 'Một cặp nucleotide này được thay thế bằng một cặp nucleotide khác (ví dụ: chuyển đổi transition A-T → G-C hoặc đảo chuyển transversion A-T → T-A). Do tính thoái hóa của mã di truyền, đột biến có thể là đột biến câm (Silent), sai nghĩa (Missense) hoặc vô nghĩa (Nonsense).',
      example: 'Bệnh thiếu máu hồng cầu hình liềm (HbS): Thay thế cặp A-T bằng T-A tại codon số 6 gen Beta-Globin làm đổi Glutamic acid thành Valine.',
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-800',
      view3D: 'mutation_substitute' as DNAViewMode
    },
    {
      name: '2. Đột biến chèn thêm cặp nucleotide (Base Insertion)',
      subtitle: 'Đột biến dịch khung (Frameshift Mutation)',
      consequence: 'Làm lệch toàn bộ khung đọc mở (Open Reading Frame)',
      detail: 'Chèn thêm 1 hoặc một số cặp nucleotide (không chia hết cho 3) vào chuỗi xoắn kép DNA. Kể từ vị trí chèn, toàn bộ các bộ ba mã hóa phía sau bị lệch khung đọc, dẫn đến chuỗi polypeptide tổng hợp ra bị biến đổi hoàn toàn hoặc làm xuất hiện sớm codon kết thúc STOP.',
      example: 'Làm mất hoàn toàn cấu trúc bậc 3 và hoạt tính xúc tác của protein hoặc thụ thể tế bào.',
      badgeColor: 'bg-rose-950 text-rose-300 border-rose-800',
      view3D: 'mutation_insert' as DNAViewMode
    },
    {
      name: '3. Đột biến mất cặp nucleotide (Base Deletion)',
      subtitle: 'Đột biến dịch khung (Frameshift Mutation)',
      consequence: 'Dịch chuyển khung đọc và rút ngắn chuỗi polypeptide',
      detail: 'Mất đi 1 hoặc một số cặp nucleotide trên phân tử DNA. Toàn bộ các codon kế tiếp bị kéo lùi vị trí, làm sai khác toàn bộ trình tự amino acid từ vị trí đột biến đến tận đầu C-tận của phân tử protein.',
      example: 'Gây ra các hội chứng suy giảm chức năng enzym nghiêm trọng (ví dụ: Thalassemia di truyền).',
      badgeColor: 'bg-purple-950 text-purple-300 border-purple-800',
      view3D: 'mutation_delete' as DNAViewMode
    }
  ];

  const sgkCauses = [
    {
      title: 'Tác nhân Vật lý (Bức xạ UV & Phóng xạ Ion hóa)',
      icon: '☀️',
      color: 'border-amber-500/40 bg-amber-950/20',
      items: [
        {
          name: 'Bức xạ cực tím (Tia UV bước sóng 254 - 320 nm)',
          desc: 'Tia UV kích hoạt phản ứng quang hóa khiến 2 base Thymine (T) kế cận trên cùng một chuỗi polynucleotide tạo vòng cyclobutane dimer thymine (T=T). Tổn thương này làm gập góc trục chuỗi xoắn kép DNA, làm tắc nghẽn hoạt động của DNA polymerase.'
        },
        {
          name: 'Bức xạ ion hóa (Tia X, Tia Gamma)',
          desc: 'Năng lượng photon cao tạo các gốc tự do ROS gây đứt gãy một chuỗi (SSB) hoặc đứt gãy kép cả 2 chuỗi DNA (DSB), gây chuyển đoạn và đột biến cấu trúc nhiễm sắc thể.'
        }
      ]
    },
    {
      title: 'Tác nhân Hóa học (Chất đồng đẳng & Hỗ biến Tautomer)',
      icon: '🧪',
      color: 'border-cyan-500/40 bg-cyan-950/20',
      items: [
        {
          name: 'Chất đồng đẳng base 5-Bromouracil (5-BU)',
          desc: '5-BU là chất đồng đẳng của Thymine. Khi hỗ biến sang dạng enol hiếm, 5-BU bắt cặp với Guanine, sau 3 chu kỳ sao chép tế bào biến đổi cặp A-T thành G-C: A-T → A-5BU → G-5BU → G-C.'
        },
        {
          name: 'Base nitơ dạng hiếm (Hỗ biến Tautomer: G*)',
          desc: 'Base Guanine dạng hỗ biến hiếm (G*) có vị trí nguyên tử Hydrogen thay đổi, bắt cặp nhầm với Thymine (T) thay vì Cytosine (C), dẫn đến thay thế cặp G-C thành A-T.'
        }
      ]
    },
    {
      title: 'Tác nhân Sinh học (Virus sinh u & Rối loạn nội bào)',
      icon: '🦠',
      color: 'border-emerald-500/40 bg-emerald-950/20',
      items: [
        {
          name: 'Oncogenic Virus (Virus sinh ung thư)',
          desc: 'Các virus như HPV, HBV, EBV tích hợp vật chất di truyền của chúng vào bộ gen tế bào chủ, làm bất hoạt các gen ức chế khối u (như TP53, RB1).'
        },
        {
          name: 'Rối loạn chuyển hóa nội bào & Gốc oxy hóa tự do (ROS)',
          desc: 'Gốc tự do nội sinh làm oxy hóa base nitơ (ví dụ: tạo 8-oxo-dG) hoặc sai sót của enzyme DNA polymerase vượt qua cơ chế hiệu chỉnh đọc sửa (Proofreading).'
        }
      ]
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-7 pb-16 text-slate-100">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-rose-950/30 to-slate-900 border border-slate-800 p-6 md:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl space-y-2.5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Sinh Học Phân Tử & Bệnh Lý Học Di Truyền (Molecular Genetics)</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Cơ Chế Đột Biến Gen & Tác Nhân Đột Biến Phân Tử
          </h2>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            Đột biến gen là những biến đổi trong trình tự nucleotide của phân tử DNA, liên quan đến một cặp nucleotide (đột biến điểm) hoặc một số cặp nucleotide. Khám phá 3 dạng đột biến điểm điển hình và cơ chế phát sinh theo chuẩn di truyền học hiện đại.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 flex-wrap">
        <button
          onClick={() => {
            soundFx.playClick();
            setActiveCategory('types');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeCategory === 'types'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          3 Dạng Đột Biến Điểm Phân Tử
        </button>
        <button
          onClick={() => {
            soundFx.playClick();
            setActiveCategory('examples');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeCategory === 'examples'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Mô Hình Lâm Sàng: Hồng Cầu Hình Liềm (HbS)
        </button>
        <button
          onClick={() => {
            soundFx.playClick();
            setActiveCategory('causes');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeCategory === 'causes'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Tác Nhân Đột Biến (Vật Lý, Hóa Học, Sinh Học)
        </button>
      </div>

      {/* 3 Point Mutations */}
      {activeCategory === 'types' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sgkMutationTypes.map((mut, idx) => (
              <div
                key={idx}
                className="bg-slate-900/80 border border-slate-800 hover:border-rose-500/40 transition-all rounded-2xl p-5 shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${mut.badgeColor}`}>
                      {mut.subtitle}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm mb-1">{mut.name}</h4>
                  <div className="text-xs text-amber-300 font-semibold mb-2">
                    Hậu quả: {mut.consequence}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    {mut.detail}
                  </p>
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-cyan-300 mb-4">
                    <strong>Minh họa phân tử:</strong> {mut.example}
                  </div>
                </div>

                <button
                  onClick={() => {
                    soundFx.playMutationTrigger();
                    onSwitchTo3DMode(mut.view3D);
                  }}
                  className="w-full py-2 px-3 bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Xem trên mô hình 3D</span>
                </button>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl text-xs text-slate-300 leading-relaxed flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <strong>Nguyên lý di truyền học phân tử:</strong> Đột biến thay thế 1 cặp base thường gây hậu quả nhẹ hơn do tính thoái hóa của mã bộ ba di truyền; trong khi đột biến chèn hoặc mất 1 cặp base làm lệch toàn bộ khung đọc mở (Frameshift), dẫn đến mất hoàn toàn cấu hình không gian bậc 3 của protein.
            </div>
          </div>
        </div>
      )}

      {/* Classic Example: Sickle Cell Anemia */}
      {activeCategory === 'examples' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-slate-800 gap-2">
            <div>
              <span className="text-xs text-rose-400 font-semibold uppercase tracking-wider">
                Trường hợp bệnh lý phân tử kinh điển (Molecular Pathology)
              </span>
              <h3 className="text-lg font-bold text-white">Bệnh Thiếu Máu Hồng Cầu Hình Liềm (Sickle Cell Anemia - HbS)</h3>
            </div>
            <span className="text-xs font-mono font-bold bg-slate-800 px-3 py-1 rounded-lg border border-slate-700 text-cyan-300">
              Gen Beta-Globin (HBB - Codon 6)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-950/70 border border-emerald-900/60 rounded-xl space-y-2">
              <span className="font-bold text-emerald-400 block text-sm">Hemoglobin bình thường (HbA):</span>
              <p className="text-slate-300">
                Codon thứ 6 trên mạch khuôn của gen là <strong>CTC</strong> → phiên mã thành mRNA là <strong>GAG</strong> → dịch mã thành <strong>Glutamic acid</strong> (Amino acid ưa nước mang điện tích âm).
              </p>
              <div className="text-[11px] text-emerald-300 bg-emerald-950/60 p-2 rounded border border-emerald-800/40">
                Kiểu hình tế bào: Hồng cầu hình đĩa lõm hai mặt, mềm dẻo, lưu thông trơn tru qua hệ thống vi mao mạch.
              </div>
            </div>

            <div className="p-4 bg-slate-950/70 border border-rose-900/60 rounded-xl space-y-2">
              <span className="font-bold text-rose-400 block text-sm">Hemoglobin đột biến (HbS):</span>
              <p className="text-slate-300">
                Đảo chuyển transversion cặp <strong>A-T → T-A</strong> → codon trên mạch khuôn thành <strong>CAC</strong> → phiên mã thành <strong>GUG</strong> → dịch mã thành <strong>Valine</strong> (Amino acid kỵ nước).
              </p>
              <div className="text-[11px] text-rose-300 bg-rose-950/60 p-2 rounded border border-rose-800/40">
                Kiểu hình tế bào: Các phân tử HbS kết tụ thành chuỗi polymer dạng sợi dài không tan, làm biến dạng hồng cầu hình liềm giòn vỡ và gây tắc vi mạch.
              </div>
            </div>
          </div>

          {/* Interactive slider */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-200">Kéo thanh trượt để so sánh biến đổi hình thái tế bào:</span>
              <span className="text-slate-400 font-mono">Bình thường (HbA) ⟷ Đột biến liềm (HbS)</span>
            </div>

            <div className="relative h-28 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center bg-slate-900">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-950/80 to-red-900/60 flex items-center justify-center p-4 border-r border-red-500/50"
                style={{ width: `${sliderPos}%` }}
              >
                <div className="text-center">
                  <div className="text-3xl mb-1">🔴</div>
                  <div className="text-xs font-bold text-white">Hồng cầu đĩa lõm 2 mặt (HbA)</div>
                  <div className="text-[10px] text-red-200">Mềm dẻo, vận chuyển O₂ tối ưu</div>
                </div>
              </div>

              <div
                className="absolute inset-y-0 right-0 bg-gradient-to-l from-rose-950 to-purple-950/80 flex items-center justify-center p-4"
                style={{ width: `${100 - sliderPos}%` }}
              >
                <div className="text-center">
                  <div className="text-3xl mb-1">🌙</div>
                  <div className="text-xs font-bold text-rose-300">Hồng cầu hình liềm (HbS)</div>
                  <div className="text-[10px] text-rose-200">Cứng nhọn, kết cụm gây tắc mạch</div>
                </div>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={sliderPos}
                onChange={(e) => setSliderPos(parseInt(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
              />
              <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-xl pointer-events-none z-10"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white text-slate-900 flex items-center justify-center text-[10px] font-bold shadow-lg">
                  ↔
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Causes & Mutagens */}
      {activeCategory === 'causes' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sgkCauses.map((grp, idx) => (
            <div key={idx} className={`p-5 rounded-2xl border ${grp.color} flex flex-col justify-between space-y-4`}>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{grp.icon}</span>
                  <h3 className="font-bold text-white text-sm">{grp.title}</h3>
                </div>

                <div className="space-y-3">
                  {grp.items.map((it, itIdx) => (
                    <div key={itIdx} className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1 text-xs">
                      <strong className="text-cyan-300 block">{it.name}</strong>
                      <p className="text-slate-300 leading-relaxed text-[11px]">{it.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {idx === 0 && (
                <button
                  onClick={() => {
                    soundFx.playMutationTrigger();
                    onSwitchTo3DMode('mutation_uv_dimer');
                  }}
                  className="w-full py-1.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Xem Dimer Thymine 3D</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
