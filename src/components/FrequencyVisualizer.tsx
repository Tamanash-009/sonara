import React, { useEffect, useRef, useState } from 'react';
import { useAudio } from '../contexts/AudioContext';
import { cn } from '../lib/utils';
import { Sparkles, Sliders, Activity } from 'lucide-react';

type VisualizerMode = 'columns' | 'flow' | 'nebula';

export function FrequencyVisualizer() {
  const { analyserRef, isPlaying, currentTrack } = useAudio();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mode, setMode] = useState<VisualizerMode>('columns');
  const animationFrameId = useRef<number | null>(null);

  // Keep track of smooth values for decay/animations
  const smoothedHeights = useRef<number[]>([]);
  const rotationAngle = useRef<number>(0);
  const waveOffset = useRef<number>(0);

  // Cache theme colors
  const [brandColor, setBrandColor] = useState('#22d3ee');
  const [secondaryColor, setSecondaryColor] = useState('#6366f1');

  // Listen to theme changes or read color in main loop
  useEffect(() => {
    const updateColors = () => {
      const docStyle = getComputedStyle(document.documentElement);
      const primary = docStyle.getPropertyValue('--brand-primary').trim();
      const secondary = docStyle.getPropertyValue('--color-brand-secondary').trim();
      
      if (primary) setBrandColor(primary);
      if (secondary) setSecondaryColor(secondary);
    };

    updateColors();
    // Watch for theme changes via attribute mutations on document element
    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style'] });
    return () => observer.disconnect();
  }, []);

  // Update canvas sizing dynamically
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        const dpr = window.devicePixelRatio || 1;
        
        // Scale canvas for high-DPI displays
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.scale(dpr, dpr);
        }
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Main rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);

      // Clear with slight alpha to create a motion-blur/ghosting trail effect
      ctx.fillStyle = 'rgba(15, 20, 26, 0.25)';
      ctx.fillRect(0, 0, width, height);

      const analyser = analyserRef.current;
      const isActuallyPlaying = isPlaying && analyser;
      let dataArray = new Uint8Array(0);

      if (isActuallyPlaying && analyser) {
        // Retrieve real-time data
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);
      }

      // Choose visualizer logic
      if (mode === 'columns') {
        drawColumns(ctx, width, height, dataArray, isActuallyPlaying);
      } else if (mode === 'flow') {
        drawFlow(ctx, width, height, dataArray, isActuallyPlaying);
      } else {
        drawNebula(ctx, width, height, dataArray, isActuallyPlaying);
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [mode, analyserRef, isPlaying, brandColor, secondaryColor]);

  // COLUMNS MODE (Retro-Futuristic Glowing Equalizer Bars)
  const drawColumns = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    dataArray: Uint8Array,
    isActuallyPlaying: boolean
  ) => {
    const barCount = 38;
    const barSpacing = 4;
    const availableWidth = width - (barCount - 1) * barSpacing;
    const barWidth = Math.max(2, availableWidth / barCount);
    
    // We analyze the lower/mid 75% of frequencies for best movement (lowers visual noise from empty super-high registers)
    const frequencyRange = Math.floor(dataArray.length * 0.7) || 128;
    const step = Math.max(1, Math.floor(frequencyRange / barCount));

    for (let i = 0; i < barCount; i++) {
      let targetHeight = 0;

      if (isActuallyPlaying) {
        // Read data for this band section
        const dataIndex = Math.min(i * step, dataArray.length - 1);
        const dataValue = dataArray[dataIndex] || 0;
        // Map 0-255 to 10% to 90% of visualizer height
        targetHeight = (dataValue / 255) * (height - 12);
      } else {
        // Idle breathing state based on natural smooth sine-waves
        const timeFactor = Date.now() * 0.0025;
        const indexOffset = i * 0.22;
        targetHeight = (Math.sin(timeFactor + indexOffset) + 1) * 0.5 * (height * 0.3) + 2;
      }

      // Smooth progression
      const prevHeight = smoothedHeights.current[i] || 0;
      const stepSpeed = isActuallyPlaying ? 0.28 : 0.08;
      const smoothH = prevHeight + (targetHeight - prevHeight) * stepSpeed;
      smoothedHeights.current[i] = smoothH;

      // Draw symmetrical setup radiating from the center of visualizer
      const x = (width / 2) + (i % 2 === 0 ? 1 : -1) * Math.ceil(i / 2) * (barWidth + barSpacing) - (barWidth / 2);

      // Create rich vertical gradients
      const gradient = ctx.createLinearGradient(x, height, x, height - smoothH);
      gradient.addColorStop(0, `${secondaryColor}22`); // subtle fade bottom
      gradient.addColorStop(0.3, secondaryColor);
      gradient.addColorStop(1, brandColor);

      ctx.fillStyle = gradient;
      ctx.shadowColor = brandColor;
      ctx.shadowBlur = isActuallyPlaying ? Math.min(10, smoothH * 0.15) : 3;

      // Draw nicely rounded pill bars
      ctx.beginPath();
      // Using manual rounded rectangles to guarantee support across platforms
      const radius = barWidth / 2;
      const topY = height - Math.max(2, smoothH);
      ctx.moveTo(x + radius, height);
      ctx.lineTo(x + radius, topY + radius);
      ctx.quadraticCurveTo(x + radius, topY, x, topY);
      ctx.quadraticCurveTo(x - radius, topY, x - radius, topY + radius);
      ctx.lineTo(x - radius, height);
      ctx.closePath();
      ctx.fill();
    }

    ctx.shadowBlur = 0; // reset
  };

  // FLOW MODE (Smooth Bezier Cybernetic Waves)
  const drawFlow = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    dataArray: Uint8Array,
    isActuallyPlaying: boolean
  ) => {
    waveOffset.current += isActuallyPlaying ? 0.015 : 0.005;

    // Background energy pulse
    if (isActuallyPlaying) {
      let energy = 0;
      for (let i = 0; i < 16; i++) {
        energy += dataArray[i] || 0;
      }
      energy = energy / 16 / 255; // average low registers
      ctx.fillStyle = `rgba(34, 211, 238, ${energy * 0.04})`;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, Math.max(10, energy * (width * 0.45)), 0, Math.PI * 2);
      ctx.fill();
    }

    // Render 3 distinct layers of overlay wave ripples
    const waveCount = 3;
    for (let w = 0; w < waveCount; w++) {
      const waveDamp = 0.4 + w * 0.15;
      const offsetSpeed = waveOffset.current * (1 + w * 0.4);

      ctx.beginPath();
      ctx.moveTo(0, height);

      const segmentCount = 16;
      const segmentWidth = width / segmentCount;

      for (let i = 0; i <= segmentCount; i++) {
        let amp = 0;

        if (isActuallyPlaying) {
          // Average a block of frequencies
          const dataChunkSize = Math.floor(dataArray.length / segmentCount);
          const chunkIndex = Math.min(i * dataChunkSize, dataArray.length - 1);
          amp = (dataArray[chunkIndex] || 0) / 255 * (height * 0.7);
        } else {
          amp = (Math.cos(offsetSpeed + i * 0.4) + 1) * 0.5 * (height * 0.25) + 3;
        }

        const smoothAmp = amp * waveDamp;
        const x = i * segmentWidth;
        // Combine sine oscillation to create multi-frequency float
        const y = height - (smoothAmp * (0.8 + Math.sin(offsetSpeed + i * 0.5) * 0.2)) - 5;

        if (i === 0) {
          ctx.lineTo(x, y);
        } else {
          const prevX = (i - 1) * segmentWidth;
          const prevAmp = isActuallyPlaying 
            ? (dataArray[Math.min((i - 1) * Math.floor(dataArray.length / segmentCount), dataArray.length - 1)] || 0) / 255 * (height * 0.7)
            : (Math.cos(offsetSpeed + (i - 1) * 0.4) + 1) * 0.5 * (height * 0.25) + 3;
          const prevY = height - (prevAmp * waveDamp * (0.8 + Math.sin(offsetSpeed + (i - 1) * 0.5) * 0.2)) - 5;

          const cpX1 = prevX + segmentWidth / 2;
          const cpY1 = prevY;
          const cpX2 = prevX + segmentWidth / 2;
          const cpY2 = y;

          ctx.bezierCurveTo(cpX1, cpY1, cpX2, cpY2, x, y);
        }
      }

      ctx.lineTo(width, height);
      ctx.closePath();

      // Create style gradients mirroring each layer
      const gradient = ctx.createLinearGradient(0, height, 0, 0);
      if (w === 0) {
        gradient.addColorStop(0, `${brandColor}00`);
        gradient.addColorStop(1, `${brandColor}44`);
        ctx.strokeStyle = `${brandColor}cc`;
      } else if (w === 1) {
        gradient.addColorStop(0, `${secondaryColor}00`);
        gradient.addColorStop(1, `${secondaryColor}33`);
        ctx.strokeStyle = `${secondaryColor}99`;
      } else {
        gradient.addColorStop(0, `${brandColor}00`);
        gradient.addColorStop(1, `${brandColor}1a`);
        ctx.strokeStyle = `${brandColor}55`;
      }

      ctx.fillStyle = gradient;
      ctx.shadowColor = brandColor;
      ctx.shadowBlur = isActuallyPlaying ? 8 : 2;
      ctx.lineWidth = 2.5 - w * 0.5;
      ctx.fill();
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  };

  // NEBULA MODE (Symmetric Circular Rings Pulsating to Beats)
  const drawNebula = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    dataArray: Uint8Array,
    isActuallyPlaying: boolean
  ) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const baseRadius = Math.min(width, height) * 0.26;

    rotationAngle.current += isActuallyPlaying ? 0.008 : 0.002;

    // Draw dynamic star field glow
    let intensity = 0.5;
    if (isActuallyPlaying) {
      let sum = 0;
      // Get treble energy for pulse sparkles
      for (let i = 30; i < 60; i++) sum += dataArray[i] || 0;
      intensity = (sum / 30) / 255;
    } else {
      intensity = (Math.sin(Date.now() * 0.003) + 1) * 0.5 * 0.3;
    }

    // Outer radial energy aura
    const auraGlow = ctx.createRadialGradient(centerX, centerY, baseRadius * 0.8, centerX, centerY, baseRadius * (2 + intensity));
    auraGlow.addColorStop(0, 'rgba(15, 20, 26, 0)');
    auraGlow.addColorStop(0.5, `${secondaryColor}${Math.floor(intensity * 12).toString(16).padStart(2, '0')}`);
    auraGlow.addColorStop(1, 'rgba(15, 20, 26, 0)');
    ctx.fillStyle = auraGlow;
    ctx.fillRect(0, 0, width, height);

    // Symmetric circular waveform
    const pointCount = 72;
    const angleStep = (Math.PI * 2) / pointCount;

    ctx.beginPath();
    ctx.shadowColor = brandColor;
    ctx.shadowBlur = isActuallyPlaying ? 16 : 4;

    for (let i = 0; i <= pointCount; i++) {
      const currentAngle = i * angleStep + rotationAngle.current;
      
      let frequencyValue = 0;
      if (isActuallyPlaying) {
        // Mirrored spectrum
        const mappedIndex = Math.min(
          Math.floor((i <= pointCount / 2 ? i : pointCount - i) * (dataArray.length * 0.45 / (pointCount / 2))),
          dataArray.length - 1
        );
        frequencyValue = dataArray[mappedIndex] || 0;
      } else {
        // Natural waves for idle ring
        frequencyValue = (Math.sin(i * 0.3 + Date.now() * 0.004) + 1) * 0.5 * 30;
      }

      const offsetRadius = baseRadius + (frequencyValue / 255) * (height * 0.32);
      const x = centerX + Math.cos(currentAngle) * offsetRadius;
      const y = centerY + Math.sin(currentAngle) * offsetRadius;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.closePath();
    ctx.strokeStyle = brandColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Floating particles/neural nodes inside visualizer to convey pristine digital craftsmanship
    if (isActuallyPlaying && intensity > 0.4) {
      ctx.fillStyle = brandColor;
      for (let p = 0; p < 8; p++) {
        const pAngle = (p * Math.PI * 0.25) - rotationAngle.current * 1.5;
        const pRadius = baseRadius + intensity * (height * 0.4) * (0.8 + 0.2 * Math.sin(p * 2));
        const px = centerX + Math.cos(pAngle) * pRadius;
        const py = centerY + Math.sin(pAngle) * pRadius;
        
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.shadowBlur = 0;
  };

  return (
    <div className="w-full flex flex-col items-center gap-3">
      {/* Visualizer Frame */}
      <div 
        ref={containerRef} 
        className="w-full h-20 md:h-24 bg-white/[0.01] border border-white/[0.04] rounded-3xl overflow-hidden relative"
      >
        <canvas ref={canvasRef} className="block w-full h-full" />
        
        <div className="absolute top-2 right-3 flex items-center gap-1.5 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/5 opacity-40 hover:opacity-100 transition-opacity">
          <Activity size={10} className="text-brand-primary animate-pulse" />
          <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest leading-none">
            {isPlaying ? 'Live Analyzer' : 'Idle Heartbeat'}
          </span>
        </div>
      </div>

      {/* Control Switcher Bar */}
      <div className="flex items-center gap-1 p-0.5 bg-white/[0.02] border border-white/5 rounded-2xl">
        {(['columns', 'flow', 'nebula'] as VisualizerMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              "px-4 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all",
              mode === m 
                ? "bg-brand-primary/20 text-brand-primary font-black shadow-inner border border-brand-primary/30" 
                : "text-slate-500 hover:text-slate-300"
            )}
          >
            {m === 'columns' && 'Quantum Columns'}
            {m === 'flow' && 'Neon Flow'}
            {m === 'nebula' && 'Circular Nebula'}
          </button>
        ))}
      </div>
    </div>
  );
}
