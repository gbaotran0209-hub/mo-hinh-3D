import React, { useState, useEffect } from 'react';
import { soundFx } from '../utils/soundEffects';
import { Volume2, VolumeX, BookOpen, Layers, Menu, X, Sparkles, Dna, Activity, HeartPulse, Cpu, Maximize2, Minimize2 } from 'lucide-react';

export type TabId = '3d' | 'structure' | 'mutations' | 'studio' | 'lab';

interface NavbarProps {
  currentTab: TabId;
  onSelectTab: (tab: TabId) => void;
  onOpenCodonModal: () => void;
  onOpenReferencesModal: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenCodonModal,
  onOpenReferencesModal,
  soundEnabled,
  onToggleSound,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleToggleFullscreen = () => {
    soundFx.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: '3d', label: 'Mô Hình 3D DNA', icon: <Dna className="w-4 h-4 text-cyan-400" /> },
    { id: 'structure', label: 'Cấu Trúc Phân Tử', icon: <Layers className="w-4 h-4 text-indigo-400" /> },
    { id: 'mutations', label: 'Các Đột Biến Gen', icon: <Activity className="w-4 h-4 text-rose-400" /> },
    { id: 'studio', label: 'Xưởng Dịch Mã & Đột Biến', icon: <Cpu className="w-4 h-4 text-amber-400" /> },
    { id: 'lab', label: 'Thử Thách Bác Sĩ Gen', icon: <HeartPulse className="w-4 h-4 text-emerald-400" /> },
  ];

  const handleTabClick = (tabId: TabId) => {
    soundFx.playClick(700);
    onSelectTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 border-b border-slate-800/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo & Brand */}
        <div
          onClick={() => handleTabClick('3d')}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <span className="text-xl">🧬</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                GeneCraft<span className="text-cyan-400 font-mono">3D</span>
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-cyan-950/80 border border-cyan-800 text-cyan-300 rounded">
                B-DNA
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
              Khám Phá Cấu Trúc DNA & Đột Biến Gen
            </p>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2">
          {/* Codon Table Modal Trigger */}
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenCodonModal();
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs font-medium text-slate-200 transition-colors cursor-pointer"
            title="Tra cứu bảng 64 mã bộ ba"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Mã di truyền</span>
          </button>

          {/* References Trigger */}
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenReferencesModal();
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs font-medium text-slate-200 transition-colors cursor-pointer"
            title="Tài liệu trích dẫn uy tín (Nature, NCBI, Campbell)"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Nguồn tài liệu</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={handleToggleFullscreen}
            className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
            title={isFullscreen ? 'Thu nhỏ giao diện' : 'Toàn màn hình (Full Screen)'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-cyan-400" /> : <Maximize2 className="w-4 h-4 text-slate-300" />}
          </button>

          {/* Audio Sound Toggle */}
          <button
            onClick={() => {
              onToggleSound();
            }}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-cyan-950/60 border-cyan-600/70 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
            title={soundEnabled ? 'Tắt âm thanh tương tác' : 'Bật âm thanh tương tác'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 lg:hidden bg-slate-900 border border-slate-800 rounded-xl text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-b border-slate-800 px-4 py-3 space-y-2 animate-in slide-in-from-top-2">
          <div className="space-y-1">
            {tabs.map((tab) => {
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
                    isActive
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-800 flex flex-col gap-1.5">
            <button
              onClick={() => {
                soundFx.playClick();
                onOpenCodonModal();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-900 text-left"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Tra cứu 64 bộ ba mã di truyền</span>
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                onOpenReferencesModal();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-900 text-left"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Nguồn tài liệu khoa học uy tín</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
