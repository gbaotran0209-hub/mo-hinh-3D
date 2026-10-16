import React, { useState } from 'react';
import { DNAViewMode, RenderStyle, HelixForm, SphereColorMode, RibbonTightness } from '../../types/genetics';
import { soundFx } from '../../utils/soundEffects';
import { Play, Pause, ChevronDown, ChevronUp, Layers, Sparkles, AlertTriangle, Box, Compass } from 'lucide-react';

interface DNACustomizerDockProps {
  viewMode: DNAViewMode;
  onChangeViewMode: (mode: DNAViewMode) => void;
  renderStyle: RenderStyle;
  onChangeRenderStyle: (style: RenderStyle) => void;
  sphereColorMode?: SphereColorMode;
  onChangeSphereColorMode?: (mode: SphereColorMode) => void;
  ribbonTightness?: RibbonTightness;
  onChangeRibbonTightness?: (tightness: RibbonTightness) => void;
  showLabels?: boolean;
  onToggleLabels?: () => void;
  helixForm: HelixForm;
  onChangeHelixForm: (form: HelixForm) => void;
  showClassroomStand: boolean;
  onToggleClassroomStand: () => void;
  useVietnameseX: boolean;
  onToggleVietnameseX: () => void;
  rotationSpeed: number;
  onChangeRotationSpeed: (speed: number) => void;
  explodedFactor: number;
  onChangeExplodedFactor: (val: number) => void;
}

export const DNACustomizerDock: React.FC<DNACustomizerDockProps> = ({
  viewMode,
  onChangeViewMode,
  renderStyle,
  onChangeRenderStyle,
  sphereColorMode = 'sgk',
  onChangeSphereColorMode,
  ribbonTightness = 'close',
  onChangeRibbonTightness,
  showLabels = true,
  onToggleLabels,
  helixForm,
  onChangeHelixForm,
  showClassroomStand,
  onToggleClassroomStand,
  useVietnameseX,
  onToggleVietnameseX,
  rotationSpeed,
  onChangeRotationSpeed,
  explodedFactor,
  onChangeExplodedFactor,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'style' | 'mutations' | 'dna_forms' | 'settings'>('style');

  const simulationModes: { id: DNAViewMode; label: string; icon: string; desc: string }[] = [
    {
      id: 'normal',
      label: 'B-DNA Watson - Crick',
      icon: '🧬',
      desc: 'Cấu trúc xoắn kép chuẩn (A=T 2 liên kết Hydrogen, G≡C 3 liên kết Hydrogen)'
    },
    {
      id: 'mutation_substitute',
      label: 'Thay thế cặp Base',
      icon: '🔄',
      desc: 'Thay thế cặp base A-T bằng T-A (cơ chế gây bệnh thiếu máu hồng cầu liềm HbS)'
    },
    {
      id: 'mutation_insert',
      label: 'Thêm cặp Nucleotide',
      icon: '➕',
      desc: 'Chèn thêm cặp nucleotide gây đột biến dịch khung đọc mã (Frameshift) và biến dạng trục xoắn'
    },
    {
      id: 'mutation_delete',
      label: 'Mất cặp Nucleotide',
      icon: '➖',
      desc: 'Mất cặp nucleotide tạo đứt gãy chuỗi và dịch chuyển khung đọc mã'
    },
    {
      id: 'mutation_uv_dimer',
      label: 'Dimer Thymine (T=T)',
      icon: '☀️',
      desc: 'Bức xạ tia cực tím UV kích thích tạo liên kết chéo quang hóa vòng cyclobutane giữa 2 base Thymine'
    },
    {
      id: 'replication_fork',
      label: 'Chẽ ba sao chép (Fork)',
      icon: '⚡',
      desc: 'Mô phỏng tháo xoắn tách chuỗi đơn trong quá trình tái bản DNA'
    }
  ];

  return (
    <div
      className={`fixed z-20 bottom-4 left-1/2 -translate-x-1/2 transition-all duration-300 ${
        isCollapsed ? 'translate-y-[calc(100%-36px)]' : 'translate-y-0'
      }`}
      style={{ width: 'min(940px, 94vw)' }}
    >
      {/* Collapse Toggle Tab */}
      <div className="flex justify-center -mb-px">
        <button
          onClick={() => {
            soundFx.playClick();
            setIsCollapsed(!isCollapsed);
          }}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-900/95 border-t border-x border-slate-700/80 rounded-t-xl text-xs font-medium text-slate-300 hover:text-cyan-400 hover:bg-slate-800 transition-colors shadow-2xl cursor-pointer"
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Bảng Tùy Chỉnh Kiểu Dáng 3D & Đột Biến</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              <span>Thu gọn (Chế độ ngắm 3D toàn cảnh)</span>
            </>
          )}
        </button>
      </div>

      {/* Main Dock Container */}
      <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl p-3.5 shadow-2xl backdrop-blur-none text-slate-100">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                soundFx.playClick();
                setActiveTab('style');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'style'
                  ? 'bg-cyan-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>Kiểu Mô Hình 3D</span>
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setActiveTab('mutations');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'mutations'
                  ? 'bg-cyan-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Mô Phỏng Đột Biến Gen Phân Tử</span>
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setActiveTab('dna_forms');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'dna_forms'
                  ? 'bg-cyan-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>3 Dạng DNA (B, A, Z)</span>
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setActiveTab('settings');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-cyan-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Tùy Chọn & Giá Đỡ</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundFx.playClick();
                onChangeRotationSpeed(rotationSpeed > 0 ? 0 : 1);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border cursor-pointer ${
                rotationSpeed > 0
                  ? 'border-cyan-500/40 bg-cyan-950/60 text-cyan-300'
                  : 'border-slate-700 bg-slate-800 text-slate-400'
              }`}
            >
              {rotationSpeed > 0 ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{rotationSpeed > 0 ? 'Dừng xoay' : 'Tự xoay'}</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Render Styles (Mục 1, 2, 3) */}
        {activeTab === 'style' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Mục 1: Que & Bi */}
              <button
                onClick={() => {
                  soundFx.playClick();
                  onChangeRenderStyle('ballstick');
                }}
                className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  renderStyle === 'ballstick'
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/30'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <span className="text-lg">⚛</span>
                <span className="text-sm font-semibold">1. Que & Bi</span>
              </button>

              {/* Mục 2: Không Gian */}
              <button
                onClick={() => {
                  soundFx.playClick();
                  onChangeRenderStyle('sphere');
                }}
                className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  renderStyle === 'sphere'
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/30'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <span className="text-lg">🌑</span>
                <span className="text-sm font-semibold">2. Không Gian</span>
              </button>

              {/* Mục 3: Dải */}
              <button
                onClick={() => {
                  soundFx.playClick();
                  onChangeRenderStyle('cartoon');
                }}
                className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  renderStyle === 'cartoon'
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/30'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <span className="text-lg">🧬</span>
                <span className="text-sm font-semibold">3. Dải</span>
              </button>
            </div>

            {/* Tùy chỉnh chi tiết cho 1. Que & Bi */}
            {renderStyle === 'ballstick' && (
              <div className="p-3 bg-slate-950/80 border border-blue-500/30 rounded-xl flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    <span>Phối màu 1. Que & Bi:</span>
                  </span>
                  <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        onChangeSphereColorMode?.('sgk');
                      }}
                      className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                        sphereColorMode === 'sgk'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Chuẩn IUPAC: Phân biệt rõ các cặp base nitơ trong lõi và khung đường - phosphate"
                    >
                      Chuẩn IUPAC (Lõi & Khung)
                    </button>
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        onChangeSphereColorMode?.('cpk');
                      }}
                      className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                        sphereColorMode === 'cpk'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Màu nguyên tố hóa học CPK chuẩn quốc tế (C xám, O đỏ, N lam, P vàng)"
                    >
                      Nguyên tử CPK
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      onToggleLabels?.();
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                      showLabels
                        ? 'bg-blue-950/90 border-blue-500/60 text-blue-300'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{showLabels ? '👁️ Nhãn Base A-T-G-C' : '👁️ Đã ẩn nhãn'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Tùy chỉnh chi tiết cho 2. Không Gian */}
            {renderStyle === 'sphere' && (
              <div className="p-3 bg-slate-950/80 border border-cyan-500/30 rounded-xl flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Phối màu 2. Không Gian:</span>
                  </span>
                  <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        onChangeSphereColorMode?.('sgk');
                      }}
                      className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                        sphereColorMode === 'sgk'
                          ? 'bg-cyan-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Phân biệt rõ khung đường - phosphate viền ngoài và các cặp base A-T & G-C trong lõi"
                    >
                      Chuẩn IUPAC (Lõi & Khung)
                    </button>
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        onChangeSphereColorMode?.('strands');
                      }}
                      className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                        sphereColorMode === 'strands'
                          ? 'bg-cyan-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Tô màu phân biệt 2 chuỗi polynucleotide xoắn đối song"
                    >
                      2 Chuỗi Polynucleotide
                    </button>
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        onChangeSphereColorMode?.('cpk');
                      }}
                      className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                        sphereColorMode === 'cpk'
                          ? 'bg-cyan-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Màu nguyên tử hóa học CPK chuẩn quốc tế (C xám, O đỏ, N lam, P vàng, H trắng)"
                    >
                      Nguyên tử CPK
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      onToggleLabels?.();
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                      showLabels
                        ? 'bg-cyan-950/90 border-cyan-500/60 text-cyan-300'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{showLabels ? '👁️ Nhãn Base A-T-G-C' : '👁️ Đã ẩn nhãn'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Tùy chỉnh chi tiết cho 3. Dải */}
            {renderStyle === 'cartoon' && (
              <div className="p-3 bg-slate-950/80 border border-purple-500/30 rounded-xl flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>Khoảng cách 2 dải:</span>
                  </span>
                  <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        onChangeRibbonTightness?.('close');
                      }}
                      className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                        ribbonTightness === 'close'
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Hai dải áp sát chuẩn tỉ lệ B-DNA (RCSB PDB), nối liền khít với các bậc thang base nitơ"
                    >
                      Gần nhau (Compact B-DNA)
                    </button>
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        onChangeRibbonTightness?.('wide');
                      }}
                      className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                        ribbonTightness === 'wide'
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Mở rộng khoảng cách 2 dải"
                    >
                      Mở rộng
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      onToggleLabels?.();
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                      showLabels
                        ? 'bg-purple-950/90 border-purple-500/60 text-purple-300'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{showLabels ? '👁️ Nhãn Base A-T-G-C' : '👁️ Đã ẩn nhãn'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Mutations */}
        {activeTab === 'mutations' && (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {simulationModes.map((mode) => {
                const isSelected = viewMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => {
                      if (mode.id !== 'normal') soundFx.playMutationTrigger();
                      else soundFx.playClick();
                      onChangeViewMode(mode.id);
                    }}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/80 text-cyan-200 ring-1 ring-cyan-400/50 shadow-md'
                        : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <span className="text-xl mb-1">{mode.icon}</span>
                    <span className="text-xs font-semibold leading-tight">{mode.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-2.5 px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-lg flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{simulationModes.find((m) => m.id === viewMode)?.desc}</span>
              </div>
              <span className="text-slate-500 hidden sm:inline">Phân loại biến dị di truyền phân tử chuẩn quốc tế</span>
            </div>
          </div>
        )}

        {/* Tab 3: DNA Forms (B-DNA, A-DNA, Z-DNA) */}
        {activeTab === 'dna_forms' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => {
                soundFx.playClick();
                onChangeHelixForm('b-dna');
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                helixForm === 'b-dna'
                  ? 'border-cyan-400 bg-cyan-950/70 text-cyan-200 ring-1 ring-cyan-400/50 shadow-md'
                  : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-white">B-DNA (Dạng sinh lý điển hình)</span>
                <span className="text-[10px] font-mono text-cyan-400 bg-slate-900 px-1.5 py-0.5 rounded">Xoắn phải</span>
              </div>
              <p className="text-[11px] text-slate-400">
                10 cặp base (bp) / chu kỳ xoắn 34 Å (3.4 nm), đường kính 20 Å (2.0 nm) - Cấu trúc B-DNA kinh điển Watson & Crick.
              </p>
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                onChangeHelixForm('a-dna');
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                helixForm === 'a-dna'
                  ? 'border-cyan-400 bg-cyan-950/70 text-cyan-200 ring-1 ring-cyan-400/50 shadow-md'
                  : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-white">A-DNA (Nén chặt - Mất nước)</span>
                <span className="text-[10px] font-mono text-cyan-400 bg-slate-900 px-1.5 py-0.5 rounded">Xoắn phải</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Xuất hiện khi môi trường khử nước: 11 cặp base (bp) / chu kỳ 28 Å, ép ngắn và trục mở rộng hơn.
              </p>
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                onChangeHelixForm('z-dna');
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                helixForm === 'z-dna'
                  ? 'border-cyan-400 bg-cyan-950/70 text-cyan-200 ring-1 ring-cyan-400/50 shadow-md'
                  : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-white">Z-DNA (Xoắn trái Ziczac)</span>
                <span className="text-[10px] font-mono text-amber-400 bg-slate-900 px-1.5 py-0.5 rounded">Xoắn trái</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Xoắn ngược chiều kim đồng hồ! 12 cặp base (bp) / chu kỳ dài 45 Å, khung đường-phosphate gập góc ziczac.
              </p>
            </button>
          </div>
        )}

        {/* Tab 4: Settings & Stand Toggles */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-center">
            {/* Toggle Stand */}
            <div className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Giá đỡ phòng thí nghiệm</span>
                <span className="text-[10px] text-slate-400">Trục thép & chân đế nghiên cứu</span>
              </div>
              <button
                onClick={() => {
                  soundFx.playClick();
                  onToggleClassroomStand();
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  showClassroomStand
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {showClassroomStand ? 'Đang bật' : 'Đang tắt'}
              </button>
            </div>

            {/* Toggle Vietnamese X vs C */}
            <div className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Ký hiệu Cytosine:</span>
                <span className="text-[10px] text-slate-400">Chuẩn IUPAC 'C' hoặc 'X'</span>
              </div>
              <button
                onClick={() => {
                  soundFx.playClick();
                  onToggleVietnameseX();
                }}
                className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-800 border border-cyan-500/50 text-cyan-300 transition-colors cursor-pointer"
              >
                {useVietnameseX ? 'Đang dùng X' : 'Đang dùng C'}
              </button>
            </div>

            {/* Exploded slider */}
            <div className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-slate-200">Độ mở rộng khung xoắn:</span>
                <span className="text-xs font-mono text-cyan-400">{Math.round(explodedFactor * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={explodedFactor}
                onChange={(e) => onChangeExplodedFactor(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer h-1.5"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
