import React, { useState } from 'react';
import { soundFx } from '../../utils/soundEffects';
import { 
  X, ChevronLeft, ChevronRight, Play, Pause, FastForward, CheckCircle2, 
  HelpCircle, Sparkles, BookOpen, Minimize2, Maximize2, Compass, Layers, 
  ArrowRight, ShieldCheck, Zap
} from 'lucide-react';
import { DNAViewMode } from '../../types/genetics';

interface PolymeraseWalkthroughOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  polymeraseActive: boolean;
  onTogglePolymerase: () => void;
  polymeraseSpeed: number;
  onChangePolymeraseSpeed: (spd: number) => void;
  viewMode: DNAViewMode;
  onChangeViewMode: (mode: DNAViewMode) => void;
}

interface WalkthroughStep {
  id: number;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  focusHint: string;
  content: string[];
  scientificFormula?: {
    label: string;
    equation: string;
    note: string;
  };
  diagramType?: 'clamp' | 'chemical_reaction' | 'replication_fork' | 'ligase_pipeline';
  interactiveActionLabel?: string;
  onAction?: () => void;
}

export const PolymeraseWalkthroughOverlay: React.FC<PolymeraseWalkthroughOverlayProps> = ({
  isOpen,
  onClose,
  polymeraseActive,
  onTogglePolymerase,
  polymeraseSpeed,
  onChangePolymeraseSpeed,
  viewMode,
  onChangeViewMode,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  
  // Interactive mini-quiz state for step 5
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number | null>>({ 1: null, 2: null });
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const steps: WalkthroughStep[] = [
    {
      id: 1,
      badge: 'BƯỚC 1 / 5',
      badgeColor: 'bg-amber-950/80 border-amber-600/50 text-amber-400',
      title: 'Phức Hệ Tái Bản & Càng Trượt β (Beta-Sliding Clamp)',
      subtitle: 'Cỗ máy phân tử siêu tốc với độ bền vững (Processivity) vượt trội',
      focusHint: 'Quan sát vành khuyên đôi màu vàng kim loại ôm trọn trục xoắn kép DNA.',
      content: [
        'Enzyme DNA Polymerase III là phức hệ holoenzyme chính chịu trách nhiệm kéo dài chuỗi DNA trong quá trình nhân đôi ở sinh vật nhân sơ (và các polymerase tương đồng như Pol δ/ε ở người).',
        'Vòng kẹp trượt β (Beta-Sliding Clamp): Một dimer hình vành xuyến đối xứng ôm trọn chuỗi xoắn kép. Kẹp trượt đóng vai trò then chốt giữ cho polymerase không bị văng ra khỏi mạch khuôn, giúp enzyme tổng hợp liên tục hơn 5,000 nucleotide mà không bị gián đoạn (tính liên tục cao - high processivity).',
        'Cấu trúc tương đồng "bàn tay phải": Gồm miền Lòng bàn tay (Palm - chứa trung tâm xúc tác với 2 ion Mg²⁺), miền Ngón tay (Fingers - bắt cặp dNTP tự do) và miền Ngón cái (Thumb - định hướng chuỗi con mới tổng hợp).'
      ],
      diagramType: 'clamp',
      interactiveActionLabel: polymeraseActive ? 'Đang chạy mô phỏng 3D' : 'Khởi động enzyme trên mô hình 3D',
      onAction: () => {
        if (!polymeraseActive) onTogglePolymerase();
        onChangeViewMode('normal');
      }
    },
    {
      id: 2,
      badge: 'BƯỚC 2 / 5',
      badgeColor: 'bg-cyan-950/80 border-cyan-500/50 text-cyan-400',
      title: 'Quy Tắc Hóa Học Tuyệt Đối: Tổng Hợp 5\' → 3\'',
      subtitle: 'Bản chất phản ứng tấn công ái nhân & giải phóng Pyrophosphate',
      focusHint: 'Nhóm 3\'-OH tự do trên mạch đang nối tấn công α-phosphate của dNTP đi vào.',
      content: [
        'Mọi enzyme DNA Polymerase trong tự nhiên đều CHỈ CÓ THỂ kéo dài mạch theo chiều từ 5\' đến 3\'. Nghĩa là mạch mới được tổng hợp theo chiều 5\' → 3\', trong khi mạch khuôn được đọc theo chiều 3\' → 5\'.',
        'Cơ chế hóa học: Nhóm 3\'-OH tự do ở nucleotide cuối cùng của chuỗi đang kéo dài thực hiện tấn công ái nhân (nucleophilic attack) vào nhóm α-phosphate của phân tử deoxynucleoside triphosphate (dNTP) tự do.',
        'Động lực nhiệt động học: Phản ứng giải phóng một phân tử Pyrophosphate (PPi). PPi ngay lập tức bị enzyme Pyrophosphatase thủy phân thành 2 phân tử photphat vô cơ (2 Pi), giải phóng năng lượng lớn (ΔG°\' = -33.5 kJ/mol), khiến phản ứng trùng hợp chỉ diễn ra theo MỘT CHIỀU duy nhất không thể đảo nghịch.'
      ],
      scientificFormula: {
        label: 'PHƯƠNG TRÌNH XÚC TÁC TRÙNG HỢP POLYNUCLEOTIDE:',
        equation: '(DNA)n + dNTP  ──(Mg²⁺, DNA Pol III)──►  (DNA)n+1 + PPi  ──►  2 Pi + Năng lượng',
        note: 'Mg²⁺ trung hòa điện tích âm của gốc phosphate và định hướng nhóm 3\'-OH tấn công chính xác.'
      },
      diagramType: 'chemical_reaction',
      interactiveActionLabel: 'Quan sát các ion Mg²⁺ & dNTP trên 3D',
      onAction: () => {
        if (!polymeraseActive) onTogglePolymerase();
      }
    },
    {
      id: 3,
      badge: 'BƯỚC 3 / 5',
      badgeColor: 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400',
      title: 'Chạc Ba Tái Bản: Mạch Dẫn Đầu vs Mạch Muộn',
      subtitle: 'Nghịch lý đối song song (Antiparallel) và sự hình thành đoạn Okazaki',
      focusHint: 'Tại chạc ba sao chép (Replication Fork), 2 mạch khuôn ngược chiều nhau.',
      content: [
        'Hai mạch của chuỗi xoắn kép DNA luôn đối song song: Một mạch có hướng 3\' → 5\', mạch đối diện có hướng 5\' → 3\'.',
        'Mạch dẫn đầu (Leading Strand): Mạch khuôn có chiều 3\' → 5\' theo hướng mở của chạc ba. DNA Polymerase III chỉ cần MỘT đoạn mồi RNA duy nhất (do Primase tổng hợp), sau đó trượt và tổng hợp LIÊN TỤC cùng chiều với sự di chuyển của chạc ba tái bản.',
        'Mạch muộn / Mạch theo sau (Lagging Strand): Mạch khuôn có chiều 5\' → 3\'. Vì enzyme bắt buộc phải tổng hợp 5\' → 3\', nó phải tổng hợp GIÁN ĐOẠN ngược chiều mở của chạc ba, tạo thành từng đoạn ngắn gọi là các Đoạn Okazaki (Okazaki Fragments, dài 1000 - 2000 bp ở vi khuẩn, 100 - 200 bp ở sinh vật nhân thực).'
      ],
      diagramType: 'replication_fork',
      interactiveActionLabel: viewMode === 'replication_fork' ? 'Đang xem Chẽ ba tái bản (Fork)' : 'Mở mô hình Chẽ ba tái bản 3D',
      onAction: () => {
        onChangeViewMode('replication_fork');
      }
    },
    {
      id: 4,
      badge: 'BƯỚC 4 / 5',
      badgeColor: 'bg-purple-950/80 border-purple-500/50 text-purple-400',
      title: 'Hoàn Thiện Mạch: DNA Polymerase I & DNA Ligase',
      subtitle: 'Loại bỏ đoạn mồi RNA và hàn gắn các vết khía phosphodiester',
      focusHint: 'Quá trình biến các đoạn Okazaki rời rạc thành một mạch polynucleotide liền mạch.',
      content: [
        'Trên mạch muộn (Lagging Strand), sau khi DNA Polymerase III hoàn thành tổng hợp một đoạn Okazaki đến giáp đoạn mồi RNA tiếp theo, một phức hệ hoàn thiện sẽ tiếp quản:',
        '1. DNA Polymerase I: Sử dụng hoạt tính Exonuclease 5\' → 3\' chuyên biệt để loại bỏ hoàn toàn các ribonucleotide của đoạn mồi RNA, đồng thời dùng hoạt tính Polymerase 5\' → 3\' lấp đầy khoảng trống bằng các deoxyribonucleotide chuẩn.',
        '2. Vết khía (Nick): Dù đã lấp đầy, giữa đầu 3\'-OH của đoạn mới và đầu 5\'-phosphate của đoạn kế bên vẫn còn một khoảng hở chưa có liên kết cộng hóa trị.',
        '3. DNA Ligase: Sử dụng năng lượng từ ATP (hoặc NAD⁺ ở vi khuẩn) để xúc tác tạo liên kết phosphodiester cuối cùng, "hàn" kín vết khía, biến mạch muộn thành chuỗi DNA nguyên vẹn không tì vết.'
      ],
      diagramType: 'ligase_pipeline',
      interactiveActionLabel: 'Khám phá cấu trúc B-DNA hoàn chỉnh',
      onAction: () => {
        onChangeViewMode('normal');
      }
    },
    {
      id: 5,
      badge: 'BƯỚC 5 / 5',
      badgeColor: 'bg-rose-950/80 border-rose-500/50 text-rose-400',
      title: 'Kiểm Tra Kiến Thức & Trực Quan Hóa Tương Tác',
      subtitle: 'Đánh giá độ hiểu cơ chế tái bản chuẩn sinh học phân tử quốc tế',
      focusHint: 'Trả lời 2 câu hỏi trắc nghiệm khoa học để củng cố nền tảng kiến thức.',
      content: [
        'Xin chúc mừng! Bạn đã nắm vững cơ chế phân tử cốt lõi của quá trình tái bản DNA: Tại sao enzyme chỉ tổng hợp 5\' → 3\', vai trò của vòng kẹp trượt β, và sự phân hóa giữa mạch dẫn đầu (Leading) với mạch muộn (Lagging).'
      ],
      interactiveActionLabel: 'Tăng tốc độ mô phỏng 4x',
      onAction: () => {
        onChangePolymeraseSpeed(4);
        if (!polymeraseActive) onTogglePolymerase();
      }
    }
  ];

  const currentStep = steps[currentStepIndex];

  const handleNext = () => {
    soundFx.playClick();
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrev = () => {
    soundFx.playClick();
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSelectQuiz = (qNum: number, optIndex: number) => {
    soundFx.playClick();
    setQuizAnswers(prev => ({ ...prev, [qNum]: optIndex }));
  };

  const handleSubmitQuiz = () => {
    soundFx.playClick();
    setQuizSubmitted(true);
    if (quizAnswers[1] === 1 && quizAnswers[2] === 2) {
      soundFx.playSuccess();
    }
  };

  return (
    <>
      {/* Floating Minimized Floating Button */}
      {isMinimized ? (
        <div className="fixed top-20 right-4 z-40 animate-fadeIn">
          <button
            onClick={() => {
              soundFx.playClick();
              setIsMinimized(false);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/95 border border-emerald-500/60 text-emerald-300 hover:text-white hover:bg-emerald-950/80 shadow-2xl transition-all cursor-pointer backdrop-blur-md text-xs font-bold"
          >
            <BookOpen className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Mở Hướng Dẫn Mô Phỏng (Bước {currentStepIndex + 1}/5)</span>
            <Maximize2 className="w-3.5 h-3.5 ml-1 text-slate-400" />
          </button>
        </div>
      ) : (
        /* Full Walkthrough Floating Modal Overlay */
        <div className="fixed inset-0 z-40 pointer-events-none flex items-center justify-center p-3 sm:p-5">
          {/* Backdrop (semi-transparent click-away, allows observing 3D canvas) */}
          <div 
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px] pointer-events-auto"
            onClick={() => {
              // Click outside minimizes instead of abrupt close
              setIsMinimized(true);
            }} 
          />

          {/* Main Walkthrough Card Container */}
          <div 
            className="relative pointer-events-auto w-full max-w-2xl max-h-[92vh] flex flex-col bg-slate-950/95 border border-emerald-500/40 rounded-2xl shadow-2xl shadow-emerald-950/60 backdrop-blur-md overflow-hidden text-slate-100 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header: Title, Step badge, Minimize & Close */}
            <div className="p-4 sm:px-6 sm:py-4 border-b border-slate-800 bg-slate-900/70 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-950/90 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${currentStep.badgeColor}`}>
                      {currentStep.badge}
                    </span>
                    <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
                      HƯỚNG DẪN TƯƠNG TÁC TÁI BẢN PHÂN TỬ
                    </span>
                  </div>
                  <h2 className="text-sm sm:text-base font-bold text-white mt-0.5 line-clamp-1">
                    {currentStep.title}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-1.5 ml-auto">
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setIsMinimized(true);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Thu nhỏ để quan sát 3D toàn cảnh"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    soundFx.playClick();
                    onClose();
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Đóng hướng dẫn"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Step Progress Dots Bar */}
            <div className="px-4 sm:px-6 py-2 bg-slate-900/40 border-b border-slate-800/80 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-1">
                {steps.map((st, idx) => (
                  <button
                    key={st.id}
                    onClick={() => {
                      soundFx.playClick();
                      setCurrentStepIndex(idx);
                    }}
                    className={`h-2 rounded-full transition-all cursor-pointer flex-1 ${
                      idx === currentStepIndex
                        ? 'bg-emerald-400 ring-2 ring-emerald-400/30'
                        : idx < currentStepIndex
                        ? 'bg-emerald-700 hover:bg-emerald-600'
                        : 'bg-slate-800 hover:bg-slate-700'
                    }`}
                    title={`Chuyển tới Bước ${idx + 1}: ${st.title}`}
                  />
                ))}
              </div>
              <span className="text-[11px] font-mono text-slate-400 pl-2">
                {currentStepIndex + 1} / {steps.length}
              </span>
            </div>

            {/* Scrollable Step Content Body */}
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[62vh] space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
              {/* Subtitle callout */}
              <div className="text-xs text-emerald-300/90 font-medium bg-emerald-950/40 border border-emerald-500/20 px-3.5 py-2 rounded-xl flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{currentStep.subtitle}</span>
              </div>

              {/* Text Paragraphs */}
              <div className="space-y-2.5">
                {currentStep.content.map((p, pIdx) => (
                  <p key={pIdx} className="text-slate-300">
                    {p}
                  </p>
                ))}
              </div>

              {/* Chemical Equation Card (Step 2) */}
              {currentStep.scientificFormula && (
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 space-y-1.5 font-mono text-xs">
                  <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                    {currentStep.scientificFormula.label}
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-cyan-800/60 text-cyan-200 font-semibold text-center overflow-x-auto text-[11px] sm:text-xs">
                    {currentStep.scientificFormula.equation}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    💡 {currentStep.scientificFormula.note}
                  </div>
                </div>
              )}

              {/* Embedded Diagrams */}
              {currentStep.diagramType === 'clamp' && (
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-amber-500/30 space-y-2">
                  <div className="text-xs font-bold text-amber-300 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Sơ Đồ Phân Vùng Chức Năng Của Replisome</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                    <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-amber-400 font-bold block mb-1">Càng Trượt β (Ring)</span>
                      <p className="text-slate-400 text-[10px]">Torus đường kính 35Å, trượt trơn tru dọc theo rãnh lớn DNA.</p>
                    </div>
                    <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-sky-400 font-bold block mb-1">Lòng Bàn Tay (Palm)</span>
                      <p className="text-slate-400 text-[10px]">Chứa 2 ion Mg²⁺ phối trí với aspartate, xúc tác gắn liên kết phosphodiester.</p>
                    </div>
                    <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-emerald-400 font-bold block mb-1">Đọc Sửa (Exonuclease)</span>
                      <p className="text-slate-400 text-[10px]">Cắt lùi 3'→5' khi base bắt cặp sai, giảm tỉ lệ đột biến xuống 10⁻⁷.</p>
                    </div>
                  </div>
                </div>
              )}

              {currentStep.diagramType === 'chemical_reaction' && (
                <div className="p-3 rounded-xl bg-slate-900/80 border border-cyan-500/30 space-y-2">
                  <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    <span>Chi Tiết Cơ Chế Tấn Công Ái Nhân (Nucleophilic Attack)</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] space-y-1.5 text-slate-300">
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                      <span>Chuỗi đang tổng hợp:</span>
                      <span className="text-slate-200">5' ── [Base-Đường] ── 3'-OH</span>
                    </div>
                    <div className="text-center text-cyan-400 text-xs py-0.5">
                      ⬇ (Tấn công ái nhân vào α-Phosphate với sự hỗ trợ của Mg²⁺)
                    </div>
                    <div className="flex items-center gap-2 text-amber-400 font-semibold">
                      <span>Cơ chất tự do (dNTP):</span>
                      <span className="text-slate-200">α-(PO₄) ── β-(PO₄) ── γ-(PO₄) ── [Đường-Base]</span>
                    </div>
                    <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                      ✂ Tách đôi: Nhóm α-(PO₄) nối vào 3'-OH tạo liên kết phosphodiester mới, giải phóng Pyrophosphate (β-γ).
                    </div>
                  </div>
                </div>
              )}

              {currentStep.diagramType === 'replication_fork' && (
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 space-y-2.5">
                  <div className="text-xs font-bold text-emerald-300 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Compass className="w-4 h-4 text-emerald-400" />
                      <span>Sơ Đồ Chạc Ba Tái Bản (Replication Fork)</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Chiều chạc ba tiến ➔</span>
                  </div>

                  {/* Graphical Schematic */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
                    {/* Leading strand branch */}
                    <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-600/40 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-emerald-400 font-bold">1. Mạch Dẫn Đầu (Leading Strand):</span>
                        <span className="text-emerald-300 text-[10px]">TỔNG HỢP LIÊN TỤC</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-300">
                        <span className="text-slate-500">Khuôn 3'→5':</span>
                        <span className="tracking-widest">3' ──────────────────────────► 5'</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-emerald-300 font-bold">
                        <span className="text-slate-500">Mạch mới:</span>
                        <span className="tracking-widest">5' ══════════════════════════► 3'</span>
                        <span className="text-[9px] bg-emerald-900/80 px-1.5 py-0.2 rounded text-emerald-200">1 mồi RNA</span>
                      </div>
                    </div>

                    {/* Lagging strand branch */}
                    <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-600/40 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-amber-400 font-bold">2. Mạch Theo Sau (Lagging Strand):</span>
                        <span className="text-amber-300 text-[10px]">TỔNG HỢP GIÁN ĐOẠN (OKAZAKI)</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-300">
                        <span className="text-slate-500">Khuôn 5'→3':</span>
                        <span className="tracking-widest">5' ◄────────────────────────── 3'</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-amber-300 font-bold">
                        <span className="text-slate-500">Mạch mới:</span>
                        <span>◄══ [Okazaki 2] ◄══ [Okazaki 1] (5'→3')</span>
                        <span className="text-[9px] bg-amber-900/80 px-1.5 py-0.2 rounded text-amber-200">Nhiều mồi RNA</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep.diagramType === 'ligase_pipeline' && (
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-purple-500/30 space-y-2">
                  <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-purple-400" />
                    <span>Quy Trình 3 Bước Hàn Gắn Đoạn Okazaki</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-purple-400 font-bold block mb-1">Bước 1: Cắt Mồi RNA</span>
                      <p className="text-slate-400 text-[10px]">Pol I dùng hoạt tính 5'→3' exonuclease dọn sạch các đoạn ribonucleotide mồi.</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-cyan-400 font-bold block mb-1">Bước 2: Lấp Khoảng Trống</span>
                      <p className="text-slate-400 text-[10px]">Pol I tổng hợp deoxyribonucleotide thay thế, để lại vết khía hở (nick).</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-emerald-400 font-bold block mb-1">Bước 3: Hàn Bằng Ligase</span>
                      <p className="text-slate-400 text-[10px]">DNA Ligase dùng ATP tạo liên kết phosphodiester hàn kín hoàn toàn chuỗi.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5 Interactive Comprehension Check Quiz */}
              {currentStep.id === 5 && (
                <div className="p-4 rounded-xl bg-slate-900/90 border border-rose-500/30 space-y-4">
                  <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                    <HelpCircle className="w-4 h-4 text-rose-400" />
                    <span>Kiểm Tra Nhanh Kiến Thức Cơ Chế Tái Bản (2 Câu)</span>
                  </div>

                  {/* Question 1 */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-slate-200">
                      Câu 1: Nhóm hóa học nào cung cấp điểm tựa tự do để DNA Polymerase tiếp tục kéo dài chuỗi?
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                      {[
                        'Nhóm 5\'-Phosphate tự do',
                        'Nhóm 3\'-OH (Hydroxyl) tự do',
                        'Gốc base nitơ Purine tự do',
                        'Liên kết Hydrogen trung gian'
                      ].map((opt, oIdx) => {
                        const isSelected = quizAnswers[1] === oIdx;
                        const isCorrect = oIdx === 1;
                        let itemClass = 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700';
                        if (isSelected) {
                          itemClass = 'bg-cyan-950/80 border-cyan-500 text-cyan-200 font-bold';
                        }
                        if (quizSubmitted) {
                          if (isCorrect) itemClass = 'bg-emerald-950/90 border-emerald-500 text-emerald-200 font-bold';
                          else if (isSelected && !isCorrect) itemClass = 'bg-rose-950/90 border-rose-500 text-rose-200 line-through';
                        }
                        return (
                          <button
                            key={oIdx}
                            disabled={quizSubmitted}
                            onClick={() => handleSelectQuiz(1, oIdx)}
                            className={`p-2 rounded-lg border text-left transition-colors cursor-pointer text-xs ${itemClass}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Question 2 */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="text-xs font-semibold text-slate-200">
                      Câu 2: Tại sao mạch muộn (Lagging Strand) phải tổng hợp thành các đoạn Okazaki gián đoạn?
                    </div>
                    <div className="grid grid-cols-1 gap-1.5 text-xs">
                      {[
                        'Vì chạc ba tái bản không đủ năng lượng ATP để kéo dài',
                        'Vì mạch muộn không có enzyme DNA Polymerase gắn kết',
                        'Vì 2 mạch đối song song và enzyme CHỈ CÓ THỂ tổng hợp theo chiều 5\' → 3\''
                      ].map((opt, oIdx) => {
                        const isSelected = quizAnswers[2] === oIdx;
                        const isCorrect = oIdx === 2;
                        let itemClass = 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700';
                        if (isSelected) {
                          itemClass = 'bg-cyan-950/80 border-cyan-500 text-cyan-200 font-bold';
                        }
                        if (quizSubmitted) {
                          if (isCorrect) itemClass = 'bg-emerald-950/90 border-emerald-500 text-emerald-200 font-bold';
                          else if (isSelected && !isCorrect) itemClass = 'bg-rose-950/90 border-rose-500 text-rose-200 line-through';
                        }
                        return (
                          <button
                            key={oIdx}
                            disabled={quizSubmitted}
                            onClick={() => handleSelectQuiz(2, oIdx)}
                            className={`p-2 rounded-lg border text-left transition-colors cursor-pointer text-xs ${itemClass}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Submit / Results */}
                  <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
                    {!quizSubmitted ? (
                      <button
                        onClick={handleSubmitQuiz}
                        disabled={quizAnswers[1] === null || quizAnswers[2] === null}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:pointer-events-none text-white transition-all cursor-pointer shadow-lg shadow-rose-950/50"
                      >
                        Kiểm Tra Kết Quả
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 text-xs">
                        {quizAnswers[1] === 1 && quizAnswers[2] === 2 ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" />
                            Xuất sắc! Bạn đã trả lời đúng 2/2 câu theo chuẩn sinh học phân tử quốc tế!
                          </span>
                        ) : (
                          <span className="text-amber-400 font-semibold">
                            Đã hiển thị đáp án chuẩn (màu xanh lá). Hãy ghi nhớ cơ chế 3'-OH và chiều 5'→3' tuyệt đối!
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Navigation Bar */}
            <div className="p-3.5 sm:px-6 sm:py-3.5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  disabled={currentStepIndex === 0}
                  className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Trước</span>
                </button>

                <button
                  onClick={handleNext}
                  disabled={currentStepIndex === steps.length - 1}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-md shadow-emerald-900/40"
                >
                  <span>Tiếp theo</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Step Contextual Action Button (Triggers 3D interaction) */}
              {currentStep.interactiveActionLabel && (
                <button
                  onClick={() => {
                    soundFx.playClick();
                    currentStep.onAction?.();
                  }}
                  className="px-3.5 py-1.5 rounded-xl border border-emerald-500/50 bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ml-auto shadow-sm"
                >
                  <Play className="w-3 h-3 text-emerald-400" />
                  <span>{currentStep.interactiveActionLabel}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
