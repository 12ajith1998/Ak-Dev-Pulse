import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Binary, 
  HardDrive, 
  Clock, 
  Hash, 
  Copy, 
  Check, 
  RotateCcw,
  Network
} from 'lucide-react';
import { audioService } from '../../services/audioService';

export const DevCalculator: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'programmer' | 'standard' | 'storage' | 'epoch' | 'http'>('programmer');

  // --- Programmer Mode State ---
  const [progDec, setProgDec] = useState<number>(2048);
  const [bitSize, setBitSize] = useState<8 | 16 | 32>(16);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // --- Standard Calculator State ---
  const [calcDisplay, setCalcDisplay] = useState<string>('0');
  const [calcMemory, setCalcMemory] = useState<number | null>(null);
  const [prevOp, setPrevOp] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState<boolean>(false);

  // --- Storage Converter State ---
  const [storageValue, setStorageValue] = useState<number>(1024);
  const [storageUnit, setStorageUnit] = useState<'B' | 'KB' | 'MB' | 'GB' | 'TB'>('MB');
  const [isBinaryPrefix, setIsBinaryPrefix] = useState<boolean>(true); // 1024 vs 1000

  // --- Epoch Converter State ---
  const [currentEpoch, setCurrentEpoch] = useState<number>(Math.floor(Date.now() / 1000));
  const [inputEpoch, setInputEpoch] = useState<string>(Math.floor(Date.now() / 1000).toString());
  const [epochResult, setEpochResult] = useState<{ utc: string; local: string; relative: string }>({
    utc: new Date().toUTCString(),
    local: new Date().toString(),
    relative: 'Just now',
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentEpoch(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    try {
      const num = parseInt(inputEpoch);
      if (!isNaN(num)) {
        // Check if seconds or milliseconds
        const date = num > 1e11 ? new Date(num) : new Date(num * 1000);
        setEpochResult({
          utc: date.toUTCString(),
          local: date.toLocaleString(),
          relative: getRelativeTime(date),
        });
      }
    } catch {
      // ignore
    }
  }, [inputEpoch]);

  const getRelativeTime = (date: Date): string => {
    const diffSec = Math.floor((date.getTime() - Date.now()) / 1000);
    if (Math.abs(diffSec) < 60) return `${Math.abs(diffSec)}s ${diffSec >= 0 ? 'from now' : 'ago'}`;
    const diffMin = Math.floor(diffSec / 60);
    if (Math.abs(diffMin) < 60) return `${Math.abs(diffMin)}m ${diffMin >= 0 ? 'from now' : 'ago'}`;
    const diffHours = Math.floor(diffMin / 60);
    if (Math.abs(diffHours) < 24) return `${Math.abs(diffHours)}h ${diffHours >= 0 ? 'from now' : 'ago'}`;
    const diffDays = Math.floor(diffHours / 24);
    return `${Math.abs(diffDays)}d ${diffDays >= 0 ? 'from now' : 'ago'}`;
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    audioService.playBeep(1200, 0.05);
    setCopyFeedback(key);
    setTimeout(() => setCopyFeedback(null), 1500);
  };

  // --- Programmer Calc Handlers ---
  const handleDecChange = (val: string) => {
    const parsed = parseInt(val, 10);
    setProgDec(isNaN(parsed) ? 0 : parsed);
  };

  const handleHexChange = (val: string) => {
    const parsed = parseInt(val.replace(/^0x/i, ''), 16);
    setProgDec(isNaN(parsed) ? 0 : parsed);
  };

  const handleBinChange = (val: string) => {
    const clean = val.replace(/[^01]/g, '');
    const parsed = parseInt(clean, 2);
    setProgDec(isNaN(parsed) ? 0 : parsed);
  };

  const toggleBit = (bitIndex: number) => {
    const mask = 1 << bitIndex;
    setProgDec((prev) => prev ^ mask);
    audioService.playBeep(800 + bitIndex * 40, 0.04);
  };

  // --- Standard Calc Handlers ---
  const inputDigit = (digit: string) => {
    audioService.playBeep(600, 0.03);
    if (waitingForOperand) {
      setCalcDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setCalcDisplay(calcDisplay === '0' ? digit : calcDisplay + digit);
    }
  };

  const inputDot = () => {
    audioService.playBeep(600, 0.03);
    if (!calcDisplay.includes('.')) {
      setCalcDisplay(calcDisplay + '.');
    }
  };

  const clearCalc = () => {
    audioService.playBeep(450, 0.05);
    setCalcDisplay('0');
    setCalcMemory(null);
    setPrevOp(null);
    setWaitingForOperand(false);
  };

  const performOp = (nextOp: string) => {
    audioService.playBeep(700, 0.04);
    const inputValue = parseFloat(calcDisplay);

    if (calcMemory === null) {
      setCalcMemory(inputValue);
    } else if (prevOp) {
      const current = calcMemory;
      let newValue = current;
      if (prevOp === '+') newValue = current + inputValue;
      else if (prevOp === '-') newValue = current - inputValue;
      else if (prevOp === '*') newValue = current * inputValue;
      else if (prevOp === '/') newValue = inputValue !== 0 ? current / inputValue : 0;
      else if (prevOp === '%') newValue = current % inputValue;
      else if (prevOp === '^') newValue = Math.pow(current, inputValue);

      setCalcMemory(newValue);
      setCalcDisplay(String(newValue));
    }

    setWaitingForOperand(true);
    setPrevOp(nextOp);
  };

  // --- Storage Multipliers ---
  const base = isBinaryPrefix ? 1024 : 1000;
  const getBytes = (): number => {
    switch (storageUnit) {
      case 'B': return storageValue;
      case 'KB': return storageValue * base;
      case 'MB': return storageValue * Math.pow(base, 2);
      case 'GB': return storageValue * Math.pow(base, 3);
      case 'TB': return storageValue * Math.pow(base, 4);
    }
  };

  const totalBytes = getBytes();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs mb-1">
            <Calculator className="w-3.5 h-3.5" />
            <span>DEV POWER TOOLKIT</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Programmer & IT System Calculator
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Base conversions (HEX/DEC/BIN), bitwise operators, byte unit scaling, and live Unix epoch timestamps.
          </p>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center p-1 rounded-lg bg-slate-950 border border-slate-800 text-xs">
          {[
            { id: 'programmer', label: 'Programmer / Base', icon: Binary },
            { id: 'standard', label: 'Scientific Math', icon: Calculator },
            { id: 'storage', label: 'Byte Sizing', icon: HardDrive },
            { id: 'epoch', label: 'Unix Epoch', icon: Clock },
            { id: 'http', label: 'HTTP / Ports', icon: Network },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSubTab(tab.id as any);
                  audioService.playBeep(850, 0.03);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-mono transition-colors ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. PROGRAMMER / BASE CONVERTER MODE */}
      {activeSubTab === 'programmer' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* HEX Input */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="text-indigo-400 font-semibold">HEX (Base 16)</span>
                <button
                  onClick={() => handleCopy(`0x${progDec.toString(16).toUpperCase()}`, 'hex')}
                  className="hover:text-white flex items-center gap-1"
                >
                  {copyFeedback === 'hex' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Copy</span>
                </button>
              </div>
              <input
                type="text"
                value={`0x${progDec.toString(16).toUpperCase()}`}
                onChange={(e) => handleHexChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm font-mono text-indigo-300 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* DEC Input */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="text-cyan-400 font-semibold">DEC (Base 10)</span>
                <button
                  onClick={() => handleCopy(progDec.toString(10), 'dec')}
                  className="hover:text-white flex items-center gap-1"
                >
                  {copyFeedback === 'dec' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Copy</span>
                </button>
              </div>
              <input
                type="number"
                value={progDec}
                onChange={(e) => handleDecChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* OCT Input */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="text-amber-400 font-semibold">OCT (Base 8)</span>
                <button
                  onClick={() => handleCopy(`0o${progDec.toString(8)}`, 'oct')}
                  className="hover:text-white flex items-center gap-1"
                >
                  {copyFeedback === 'oct' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Copy</span>
                </button>
              </div>
              <input
                type="text"
                value={`0o${progDec.toString(8)}`}
                readOnly
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm font-mono text-amber-300 focus:outline-none"
              />
            </div>

            {/* BIN Input */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="text-emerald-400 font-semibold">BIN (Base 2)</span>
                <button
                  onClick={() => handleCopy(progDec.toString(2), 'bin')}
                  className="hover:text-white flex items-center gap-1"
                >
                  {copyFeedback === 'bin' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Copy</span>
                </button>
              </div>
              <input
                type="text"
                value={progDec.toString(2)}
                onChange={(e) => handleBinChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm font-mono text-emerald-300 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Interactive Bit Toggler */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Binary className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">Interactive Bit Matrix</h3>
                <span className="text-xs text-slate-500 font-mono">(Click any bit to toggle 0 / 1)</span>
              </div>

              {/* Bit Size Selector */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
                {[8, 16, 32].map((size) => (
                  <button
                    key={size}
                    onClick={() => setBitSize(size as any)}
                    className={`px-2.5 py-0.5 rounded transition-colors ${
                      bitSize === size
                        ? 'bg-cyan-600 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {size}-bit
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Bit Grid (arranged in 4-bit nibbles) */}
            <div className="flex flex-wrap items-center justify-end gap-2 p-4 rounded-lg bg-slate-950 border border-slate-800/80 font-mono">
              {Array.from({ length: bitSize }).map((_, idx) => {
                const bitIndex = bitSize - 1 - idx;
                const isSet = (progDec & (1 << bitIndex)) !== 0;
                const isNibbleBoundary = (bitIndex + 1) % 4 === 0 && bitIndex !== bitSize - 1;

                return (
                  <React.Fragment key={bitIndex}>
                    {isNibbleBoundary && <div className="w-1.5 h-6 bg-slate-800 rounded"></div>}
                    <button
                      onClick={() => toggleBit(bitIndex)}
                      className={`flex flex-col items-center justify-center w-8 h-12 rounded border transition-all cursor-pointer ${
                        isSet
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                          : 'bg-slate-900/60 border-slate-800 text-slate-500 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xs font-bold">{isSet ? '1' : '0'}</span>
                      <span className="text-[9px] text-slate-500">{bitIndex}</span>
                    </button>
                  </React.Fragment>
                );
              })}
            </div>

            {/* Quick Bitwise Operations Toolbar */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800 text-xs font-mono">
              <span className="text-slate-500 mr-2">Quick Bitwise:</span>
              <button
                onClick={() => { setProgDec((prev) => prev << 1); audioService.playBeep(700, 0.04); }}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                &lt;&lt; 1 (Shift Left)
              </button>
              <button
                onClick={() => { setProgDec((prev) => prev >> 1); audioService.playBeep(700, 0.04); }}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                &gt;&gt; 1 (Shift Right)
              </button>
              <button
                onClick={() => { setProgDec((prev) => ~prev & ((1 << bitSize) - 1)); audioService.playBeep(700, 0.04); }}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                NOT (Invert)
              </button>
              <button
                onClick={() => { setProgDec(0); audioService.playBeep(450, 0.04); }}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-rose-400"
              >
                Clear (0)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. STANDARD & SCIENTIFIC CALCULATOR */}
      {activeSubTab === 'standard' && (
        <div className="max-w-md mx-auto p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4 animate-in fade-in duration-150">
          {/* Display */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-right space-y-1">
            <div className="text-xs font-mono text-slate-500 h-4">
              {calcMemory !== null && `${calcMemory} ${prevOp || ''}`}
            </div>
            <div className="text-3xl font-mono font-bold text-white tracking-wider overflow-x-auto">
              {calcDisplay}
            </div>
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-4 gap-2 text-sm font-mono font-semibold">
            <button onClick={clearCalc} className="p-3 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-900">
              AC
            </button>
            <button onClick={() => { setCalcDisplay(String(-parseFloat(calcDisplay))); audioService.playBeep(600, 0.03); }} className="p-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200">
              ±
            </button>
            <button onClick={() => performOp('%')} className="p-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200">
              %
            </button>
            <button onClick={() => performOp('/')} className="p-3 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800">
              ÷
            </button>

            {/* Row 2 */}
            <button onClick={() => inputDigit('7')} className="p-3 rounded-lg bg-slate-950 hover:bg-slate-800 text-white border border-slate-800">
              7
            </button>
            <button onClick={() => inputDigit('8')} className="p-3 rounded-lg bg-slate-950 hover:bg-slate-800 text-white border border-slate-800">
              8
            </button>
            <button onClick={() => inputDigit('9')} className="p-3 rounded-lg bg-slate-950 hover:bg-slate-800 text-white border border-slate-800">
              9
            </button>
            <button onClick={() => performOp('*')} className="p-3 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800">
              ×
            </button>

            {/* Row 3 */}
            <button onClick={() => inputDigit('4')} className="p-3 rounded-lg bg-slate-950 hover:bg-slate-800 text-white border border-slate-800">
              4
            </button>
            <button onClick={() => inputDigit('5')} className="p-3 rounded-lg bg-slate-950 hover:bg-slate-800 text-white border border-slate-800">
              5
            </button>
            <button onClick={() => inputDigit('6')} className="p-3 rounded-lg bg-slate-950 hover:bg-slate-800 text-white border border-slate-800">
              6
            </button>
            <button onClick={() => performOp('-')} className="p-3 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800">
              -
            </button>

            {/* Row 4 */}
            <button onClick={() => inputDigit('1')} className="p-3 rounded-lg bg-slate-950 hover:bg-slate-800 text-white border border-slate-800">
              1
            </button>
            <button onClick={() => inputDigit('2')} className="p-3 rounded-lg bg-slate-950 hover:bg-slate-800 text-white border border-slate-800">
              2
            </button>
            <button onClick={() => inputDigit('3')} className="p-3 rounded-lg bg-slate-950 hover:bg-slate-800 text-white border border-slate-800">
              3
            </button>
            <button onClick={() => performOp('+')} className="p-3 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800">
              +
            </button>

            {/* Row 5 */}
            <button onClick={() => inputDigit('0')} className="col-span-2 p-3 rounded-lg bg-slate-950 hover:bg-slate-800 text-white border border-slate-800">
              0
            </button>
            <button onClick={inputDot} className="p-3 rounded-lg bg-slate-950 hover:bg-slate-800 text-white border border-slate-800">
              .
            </button>
            <button onClick={() => performOp('=')} className="p-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/20">
              =
            </button>
          </div>
        </div>
      )}

      {/* 3. BYTE / STORAGE UNIT CONVERTER */}
      {activeSubTab === 'storage' && (
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-cyan-400" />
                <span>Data Storage & Memory Scaler</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Convert between raw bytes, kilobytes, megabytes, gigabytes, and terabytes with precision.
              </p>
            </div>

            {/* 1024 vs 1000 standard toggle */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400">Standard:</span>
              <button
                onClick={() => setIsBinaryPrefix(true)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  isBinaryPrefix ? 'bg-cyan-600 text-white font-bold' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Binary (1024 = 1 KiB)
              </button>
              <button
                onClick={() => setIsBinaryPrefix(false)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  !isBinaryPrefix ? 'bg-cyan-600 text-white font-bold' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Decimal (1000 = 1 KB)
              </button>
            </div>
          </div>

          {/* Converter Input Form */}
          <div className="flex flex-col sm:flex-row items-center gap-3 p-4 rounded-lg bg-slate-950 border border-slate-800">
            <div className="flex-1 w-full">
              <label className="block text-xs font-mono text-slate-400 mb-1">Enter Value</label>
              <input
                type="number"
                min="0"
                value={storageValue}
                onChange={(e) => setStorageValue(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono text-base focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="w-full sm:w-48">
              <label className="block text-xs font-mono text-slate-400 mb-1">Unit</label>
              <select
                value={storageUnit}
                onChange={(e) => setStorageUnit(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono text-base focus:outline-none focus:border-cyan-500"
              >
                <option value="B">Bytes (B)</option>
                <option value="KB">{isBinaryPrefix ? 'KiB (Kilobytes)' : 'KB'}</option>
                <option value="MB">{isBinaryPrefix ? 'MiB (Megabytes)' : 'MB'}</option>
                <option value="GB">{isBinaryPrefix ? 'GiB (Gigabytes)' : 'GB'}</option>
                <option value="TB">{isBinaryPrefix ? 'TiB (Terabytes)' : 'TB'}</option>
              </select>
            </div>
          </div>

          {/* Conversion Output Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 font-mono text-xs">
            {[
              { label: 'Bytes', val: totalBytes.toLocaleString() + ' B', raw: totalBytes },
              { label: isBinaryPrefix ? 'KiB' : 'KB', val: (totalBytes / base).toFixed(4) + ' KB', raw: totalBytes / base },
              { label: isBinaryPrefix ? 'MiB' : 'MB', val: (totalBytes / Math.pow(base, 2)).toFixed(4) + ' MB', raw: totalBytes / Math.pow(base, 2) },
              { label: isBinaryPrefix ? 'GiB' : 'GB', val: (totalBytes / Math.pow(base, 3)).toFixed(4) + ' GB', raw: totalBytes / Math.pow(base, 3) },
              { label: isBinaryPrefix ? 'TiB' : 'TB', val: (totalBytes / Math.pow(base, 4)).toFixed(6) + ' TB', raw: totalBytes / Math.pow(base, 4) },
            ].map((item) => (
              <div key={item.label} className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[11px] block">{item.label}</span>
                <span className="text-cyan-300 font-bold text-sm block truncate" title={item.val}>
                  {item.val}
                </span>
                <button
                  onClick={() => handleCopy(item.val, item.label)}
                  className="text-[10px] text-slate-500 hover:text-white flex items-center gap-1 mt-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. UNIX TIMESTAMP & EPOCH CONVERTER */}
      {activeSubTab === 'epoch' && (
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-6 animate-in fade-in duration-150">
          {/* Current Live Epoch Box */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg bg-gradient-to-r from-slate-950 to-cyan-950/40 border border-cyan-800/40">
            <div>
              <span className="text-xs font-mono text-cyan-400 font-semibold block">CURRENT UNIX EPOCH (SECONDS)</span>
              <span className="text-3xl font-mono font-extrabold text-white tracking-widest mt-1 block">
                {currentEpoch}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(currentEpoch.toString(), 'live-epoch')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono transition-colors"
              >
                {copyFeedback === 'live-epoch' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Current Timestamp</span>
              </button>
            </div>
          </div>

          {/* Epoch to Human Date Form */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              Convert Timestamp to Human Date
            </h4>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={inputEpoch}
                onChange={(e) => setInputEpoch(e.target.value)}
                placeholder="Enter seconds or milliseconds (e.g. 1774341000)"
                className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm font-mono text-white focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={() => setInputEpoch(currentEpoch.toString())}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300"
              >
                Use Now
              </button>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[11px] block">UTC Formatted</span>
                <span className="text-emerald-400 font-semibold text-xs block truncate">{epochResult.utc}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[11px] block">Local Time</span>
                <span className="text-cyan-400 font-semibold text-xs block truncate">{epochResult.local}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[11px] block">Relative Offset</span>
                <span className="text-amber-400 font-semibold text-xs block truncate">{epochResult.relative}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. HTTP STATUS CODES & PORTS CHEAT SHEET */}
      {activeSubTab === 'http' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-150">
          {/* Common HTTP Status Codes */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Network className="w-4 h-4 text-cyan-400" />
              <span>Key HTTP Status Codes</span>
            </h3>
            <div className="space-y-1.5 text-xs font-mono">
              {[
                { code: '200 OK', desc: 'Standard successful request' },
                { code: '201 Created', desc: 'Resource created (POST/PUT)' },
                { code: '204 No Content', desc: 'Success with no body (DELETE)' },
                { code: '400 Bad Request', desc: 'Malformed JSON, invalid schema' },
                { code: '401 Unauthorized', desc: 'Missing or expired Bearer JWT' },
                { code: '403 Forbidden', desc: 'Authenticated but insufficient RBAC role' },
                { code: '404 Not Found', desc: 'Endpoint or entity ID does not exist' },
                { code: '409 Conflict', desc: 'Unique constraint or version clash' },
                { code: '422 Unprocessable', desc: 'Semantic validation failed' },
                { code: '429 Too Many Requests', desc: 'Rate limited by gateway' },
                { code: '500 Internal Server Error', desc: 'Unhandled exception in backend' },
                { code: '502 Bad Gateway', desc: 'Upstream container or proxy down' },
                { code: '503 Service Unavailable', desc: 'Overloaded or health check failing' },
                { code: '504 Gateway Timeout', desc: 'Upstream exceeded timeout limit' },
              ].map((item) => (
                <div key={item.code} className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                  <span className="font-bold text-cyan-400">{item.code}</span>
                  <span className="text-slate-400 text-[11px]">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Standard Ports */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Hash className="w-4 h-4 text-purple-400" />
              <span>Standard IT Engineer Ports</span>
            </h3>
            <div className="space-y-1.5 text-xs font-mono">
              {[
                { port: '8080', service: 'Spring Boot / Tomcat default' },
                { port: '4200', service: 'Angular CLI dev server' },
                { port: '5432', service: 'PostgreSQL Database' },
                { port: '3000', service: 'React / Vite / Node.js' },
                { port: '6379', service: 'Redis Cache & Pub/Sub' },
                { port: '9092', service: 'Apache Kafka Broker' },
                { port: '27017', service: 'MongoDB Service' },
                { port: '80 / 443', service: 'HTTP / HTTPS standard' },
                { port: '22', service: 'SSH remote terminal' },
                { port: '5000', service: 'Docker Registry / Flask' },
              ].map((item) => (
                <div key={item.port} className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                  <span className="font-bold text-purple-400">{item.port}</span>
                  <span className="text-slate-400 text-[11px]">{item.service}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
