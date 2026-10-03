'use client';

import { useRef, useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { getSocket } from '@/hooks/useSocket';
import { CANVAS_WIDTH, CANVAS_HEIGHT, BRUSH_SIZES, COLOR_PALETTE } from '@drawspy/shared';
import type { DrawTool, Stroke, StrokePoint } from '@drawspy/shared';
import { generateId } from '@drawspy/game-engine';
import { CountdownTimer } from '@/components/ui/CountdownTimer';
import { motion } from 'framer-motion';
import { Pencil, Eraser, Undo2, Send, ShieldAlert, HelpCircle, Droplet } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { GameRulesModal } from '@/components/ui/GameRulesModal';
import { WordVisualGuide } from '@/components/ui/WordVisualGuide';
import { useTranslation } from '@/utils/i18n';

interface DrawingScreenProps {
  roomCode: string;
}

export function DrawingScreen({ roomCode }: DrawingScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const store = useGameStore();
  const socket = getSocket();
  const t = useTranslation(store.language);

  const [tool, setTool] = useState<DrawTool>('pen');
  const [color, setColor] = useState('#000000');
  const [brushIdx, setBrushIdx] = useState(1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [chatText, setChatText] = useState('');
  const [showRules, setShowRules] = useState(true);
  const [usedInk, setUsedInk] = useState(0);
  const [skippedNotice, setSkippedNotice] = useState<string | null>(null);

  const MAX_INK_DISTANCE = 400; // Maximum stroke distance limit per turn

  const currentStrokeId = useRef<string | null>(null);
  const pointBuffer = useRef<StrokePoint[]>([]);
  const lastSendTime = useRef(0);
  const THROTTLE_MS = 20;

  const myId = store.myPlayerId;
  const activePlayerId = store.activePlayerId;
  const isMyTurn = myId === activePlayerId;
  const room = store.room;
  const players = room?.players ?? [];
  const currentPlayer = players.find((p) => p.id === activePlayerId);

  // Reset ink when active turn changes
  useEffect(() => {
    setUsedInk(0);
  }, [activePlayerId]);

  // Listen for skipped turns (when player did not draw)
  useEffect(() => {
    const s = getSocket();
    const handleTurnEnded = ({ playerId, didDraw }: { playerId: string; didDraw?: boolean }) => {
      if (didDraw === false) {
        const skippedPlayer = players.find((p) => p.id === playerId);
        if (skippedPlayer) {
          setSkippedNotice(`${skippedPlayer.nickname} bu tur çizim yapmadı!`);
          setTimeout(() => setSkippedNotice(null), 3500);
        }
      }
    };
    s.on('turn_ended', handleTurnEnded as any);
    return () => {
      s.off('turn_ended', handleTurnEnded as any);
    };
  }, [players]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FAFAF8';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    store.strokes.forEach((stroke) => {
      renderStroke(ctx, stroke);
    });
  }, [store.strokes]);

  function renderStroke(ctx: CanvasRenderingContext2D, stroke: Stroke) {
    if (stroke.points.length < 2) {
      if (stroke.points.length === 1) {
        ctx.beginPath();
        ctx.fillStyle = stroke.tool === 'eraser' ? '#FAFAF8' : stroke.color;
        ctx.arc(stroke.points[0].x, stroke.points[0].y, stroke.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      return;
    }

    ctx.beginPath();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = stroke.size;
    ctx.strokeStyle = stroke.tool === 'eraser' ? '#FAFAF8' : stroke.color;
    ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over';

    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (let i = 1; i < stroke.points.length; i++) {
      const mid = {
        x: (stroke.points[i - 1].x + stroke.points[i].x) / 2,
        y: (stroke.points[i - 1].y + stroke.points[i].y) / 2,
      };
      ctx.quadraticCurveTo(stroke.points[i - 1].x, stroke.points[i - 1].y, mid.x, mid.y);
    }
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
  }

  function getCanvasPos(e: React.PointerEvent<HTMLCanvasElement>): StrokePoint {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    return {
      x: Math.round((e.clientX - rect.left) * scaleX),
      y: Math.round((e.clientY - rect.top) * scaleY),
      t: Date.now(),
    };
  }

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isMyTurn || usedInk >= MAX_INK_DISTANCE) return;
    e.currentTarget.setPointerCapture(e.pointerId);

    setIsDrawing(true);
    const pos = getCanvasPos(e);
    const strokeId = generateId();
    currentStrokeId.current = strokeId;

    const stroke: Stroke = {
      strokeId,
      playerId: myId!,
      color,
      size: BRUSH_SIZES[brushIdx],
      tool,
      points: [pos],
    };

    pointBuffer.current = [pos];
    store.addStroke(stroke);

    socket.emit('draw_begin', {
      strokeId,
      color,
      size: BRUSH_SIZES[brushIdx],
      tool,
    });
    socket.emit('draw_points', {
      strokeId,
      points: [pos],
    });
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawing || !isMyTurn || !currentStrokeId.current) return;

    const pos = getCanvasPos(e);

    // Track ink consumption
    const lastPos = pointBuffer.current[pointBuffer.current.length - 1];
    if (lastPos) {
      const stepDist = Math.hypot(pos.x - lastPos.x, pos.y - lastPos.y);
      if (usedInk + stepDist >= MAX_INK_DISTANCE) {
        setUsedInk(MAX_INK_DISTANCE);
        setIsDrawing(false);
        if (currentStrokeId.current) {
          socket.emit('draw_end', { strokeId: currentStrokeId.current });
          currentStrokeId.current = null;
        }
        return;
      }
      setUsedInk((prev) => prev + stepDist);
    }

    pointBuffer.current.push(pos);

    const stroke = store.strokes.find((s) => s.strokeId === currentStrokeId.current);
    if (stroke) stroke.points.push(pos);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) renderStroke(ctx, { ...stroke!, points: pointBuffer.current });
    }

    const now = Date.now();
    if (now - lastSendTime.current >= THROTTLE_MS) {
      socket.emit('draw_points', {
        strokeId: currentStrokeId.current,
        points: pointBuffer.current,
      });
      pointBuffer.current = [pos];
      lastSendTime.current = now;
    }
  }

  function onPointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawing || !isMyTurn) return;
    setIsDrawing(false);

    if (currentStrokeId.current) {
      socket.emit('draw_end', {
        strokeId: currentStrokeId.current,
      });
      currentStrokeId.current = null;
      pointBuffer.current = [];
    }
  }

  function handleUndo() {
    if (!isMyTurn) return;
    socket.emit('draw_undo');
  }

  function sendChat() {
    if (!chatText.trim()) return;
    socket.emit('send_chat', { text: chatText.trim() });
    setChatText('');
  }

  return (
    <div className="min-h-screen bg-[#060D18] flex flex-col text-slate-100 font-sans">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-[#0F1C2E] border-b border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-xl tracking-tight text-white">
            Draw<span className="text-cyan-400">Spy</span>
          </span>
          <div className="h-4 w-px bg-slate-700 hidden sm:block" />

          {/* Active Drawer Badge */}
          {isMyTurn ? (
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
            >
              <Pencil className="w-3.5 h-3.5 stroke-[3]" />
              <span>SENİN SIRAN (ÇİZ!)</span>
            </motion.div>
          ) : (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-slate-400 text-xs font-semibold">
                Çizen: <span className="font-bold text-cyan-400">{currentPlayer?.nickname ?? '...'}</span>
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Secret Word & Visual Guide Graphic */}
          {store.myRole === 'normal' && store.myWord && (
            <div className="flex items-center gap-2.5 bg-slate-900/90 border border-amber-500/40 px-3.5 py-1.5 rounded-xl shadow-lg">
              <WordVisualGuide word={store.myWord} category={store.room?.settings.category} className="w-7 h-7" />
              <div className="flex flex-col">
                <span className="text-[10px] text-amber-400 font-black uppercase tracking-widest leading-none">Çizilecek Nesne Görseli</span>
                <span className="text-sm font-black text-white uppercase tracking-wider">{store.myWord}</span>
              </div>
            </div>
          )}

          {store.myRole === 'spy' && (
            <div className="text-rose-400 font-black text-xs uppercase tracking-wide flex items-center gap-1.5 bg-rose-500/10 px-3 py-1.5 rounded-xl border border-rose-500/30">
              <ShieldAlert className="w-4 h-4" /> SEN IMPOSTOR'SUN
            </div>
          )}

          <button
            onClick={() => setShowRules(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/40 rounded-xl text-amber-300 font-extrabold text-xs transition-all hover:scale-105"
            title="Kuralları Gör"
          >
            <HelpCircle className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline uppercase">{t('rulesHeader')}</span>
          </button>

          {store.phaseEndsAt && (
            <CountdownTimer endsAt={store.phaseEndsAt} warningAt={3} />
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* Left: Player turn order */}
        <div className="hidden md:flex flex-col gap-2 p-3 w-48 bg-slate-900/60 border-r border-slate-800">
          <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider px-1 mb-1">Tur Sırası</p>
          {room?.players.map((p) => {
            const isActive = p.id === activePlayerId;
            return (
              <div
                key={p.id}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all ${
                  isActive ? 'bg-cyan-500/20 border border-cyan-400/50 shadow-md' : 'opacity-60'
                }`}
              >
                <Avatar id={p.avatarId} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold truncate ${isActive ? 'text-cyan-400' : 'text-white'}`}>
                    {p.nickname}
                  </p>
                  <p className="text-slate-400 text-[10px] font-semibold">{p.score} puan</p>
                </div>
                {isActive && <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />}
              </div>
            );
          })}
        </div>

        {/* Canvas area */}
        <div className="flex-1 flex flex-col items-center justify-center p-2 md:p-4 gap-3">
          <div className="relative w-full" style={{ maxWidth: `${CANVAS_WIDTH}px` }}>
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              className={`w-full h-auto rounded-2xl shadow-2xl ${isMyTurn ? 'cursor-crosshair' : 'cursor-not-allowed'}`}
              style={{
                touchAction: 'none',
                background: '#FAFAF8',
                border: isMyTurn ? '3px solid rgba(56, 189, 248, 0.6)' : '3px solid rgba(255,255,255,0.1)',
              }}
            />

            {!isMyTurn && (
              <div className="absolute inset-0 flex items-end justify-center pb-4 pointer-events-none">
                <div className="bg-slate-950/80 backdrop-blur-md rounded-full px-4 py-2 text-slate-300 text-xs font-semibold">
                  {currentPlayer?.nickname} çizim yapıyor...
                </div>
              </div>
            )}

            {/* Skipped turn notice toast */}
            {skippedNotice && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 font-black text-xs px-5 py-2.5 rounded-2xl border-2 border-slate-900 shadow-2xl backdrop-blur-xs flex items-center gap-2 select-none"
              >
                <ShieldAlert className="w-4 h-4 stroke-[3]" />
                <span>SÜRE BİTTİ — {skippedNotice}</span>
              </motion.div>
            )}

            {/* Ink Exhausted Toast */}
            {isMyTurn && usedInk >= MAX_INK_DISTANCE && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-rose-500 text-white font-black text-xs px-5 py-2.5 rounded-2xl border-2 border-slate-900 shadow-2xl backdrop-blur-xs flex items-center gap-2 animate-bounce select-none">
                <ShieldAlert className="w-4 h-4 stroke-[3]" />
                <span>MÜREKKEP BİTTİ! (Bu turdaki çizim hakkını tamamladın)</span>
              </div>
            )}
          </div>

          {/* Toolbar */}
          {isMyTurn && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2.5 flex-wrap justify-center shadow-xl"
            >
              {/* Tool buttons */}
              <div className="flex gap-1">
                <button
                  onClick={() => setTool('pen')}
                  className={`p-2 rounded-xl flex items-center justify-center transition-all ${
                    tool === 'pen' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Kalem"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setTool('eraser')}
                  className={`p-2 rounded-xl flex items-center justify-center transition-all ${
                    tool === 'eraser' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Silgi"
                >
                  <Eraser className="w-4 h-4" />
                </button>
              </div>

              <div className="w-px h-6 bg-slate-800" />

              {/* Brush sizes */}
              <div className="flex items-center gap-2">
                {BRUSH_SIZES.map((size, i) => (
                  <button
                    key={size}
                    onClick={() => setBrushIdx(i)}
                    className={`flex items-center justify-center rounded-full transition-all ${
                      brushIdx === i ? 'bg-cyan-500/30 border border-cyan-400' : 'hover:bg-slate-800'
                    }`}
                    style={{ width: 32, height: 32 }}
                  >
                    <div
                      className="rounded-full bg-white"
                      style={{ width: Math.min(size, 20), height: Math.min(size, 20), opacity: brushIdx === i ? 1 : 0.4 }}
                    />
                  </button>
                ))}
              </div>

              <div className="w-px h-6 bg-slate-800" />

              {/* Color palette */}
              <div className="flex flex-wrap gap-1" style={{ maxWidth: 180 }}>
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={c}
                    onClick={() => { setColor(c); setTool('pen'); }}
                    className={`rounded-lg transition-all ${
                      color === c && tool === 'pen' ? 'ring-2 ring-cyan-400 scale-110' : 'hover:scale-105'
                    }`}
                    style={{
                      width: 22,
                      height: 22,
                      backgroundColor: c,
                      border: c === '#FFFFFF' ? '1px solid rgba(255,255,255,0.2)' : 'none',
                    }}
                  />
                ))}
              </div>

              <div className="w-px h-6 bg-slate-800" />

              {/* Undo */}
              <button
                onClick={handleUndo}
                className="p-2 text-slate-400 hover:text-white transition-colors"
                title="Geri Al"
              >
                <Undo2 className="w-4 h-4" />
              </button>

              <div className="w-px h-6 bg-slate-800" />

              {/* Ink Limit Gauge */}
              {(() => {
                const inkPct = Math.max(0, Math.round(((MAX_INK_DISTANCE - usedInk) / MAX_INK_DISTANCE) * 100));
                return (
                  <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800" title="Mürekkep Limiti">
                    <Droplet className={`w-4 h-4 ${inkPct > 30 ? 'text-cyan-400' : inkPct > 10 ? 'text-amber-400' : 'text-rose-500 animate-bounce'}`} />
                    <div className="w-16 bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
                      <div
                        className={`h-full transition-all duration-100 ${
                          inkPct > 30 ? 'bg-gradient-to-r from-sky-400 to-indigo-500' : inkPct > 10 ? 'bg-amber-400' : 'bg-rose-500'
                        }`}
                        style={{ width: `${inkPct}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-black font-mono text-slate-300">%{inkPct}</span>
                  </div>
                );
              })()}
            </motion.div>
          )}
        </div>

        {/* Right Chat Panel */}
        <div className="hidden lg:flex flex-col w-60 bg-slate-900/80 border-l border-slate-800">
          <div className="p-3 border-b border-slate-800">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Canlı Sohbet</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {store.chatMessages.map((msg, i) => (
              <div key={i} className="text-xs">
                <span className="text-cyan-400 font-bold">{msg.nickname}: </span>
                <span className="text-slate-300">{msg.text}</span>
              </div>
            ))}
          </div>
          {room?.settings.chatEnabled && (
            <div className="p-3 border-t border-slate-800 flex gap-2">
              <input
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                placeholder="Mesaj yaz..."
                maxLength={150}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-400 outline-none"
              />
              <button onClick={sendChat} className="p-2 bg-cyan-500 text-slate-950 font-bold rounded-xl hover:bg-cyan-400 transition-colors">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Game Rules Modal Popup */}
      <GameRulesModal isOpen={showRules} onClose={() => setShowRules(false)} />
    </div>
  );
}
