'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ECGHeartbeatProps {
  className?: string;
}

export function ECGHeartbeat({ 
  className = '' 
}: ECGHeartbeatProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined as number | undefined);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Use setTimeout to avoid synchronous setState in effect
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const updateCanvasSize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    };

    // Initial size update with a small delay to ensure container is rendered
    const initTimeout = setTimeout(() => {
      updateCanvasSize();
      window.addEventListener('resize', updateCanvasSize);
    }, 100);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let offset = 0;
    const speed = 1.5;
    const lineColor = '#00ff88';
    const glowColor = '#00ff88';

    // ECG waveform data points (P-Q-R-S-T wave)
    const generateECGWave = (x: number): number => {
      const cycleLength = 400;
      const cyclePos = (x % cycleLength) / cycleLength;
      
      // P wave (small upward bump)
      if (cyclePos < 0.15) {
        const pPos = cyclePos / 0.15;
        return Math.sin(pPos * Math.PI) * 15;
      }
      // PR segment (flat)
      if (cyclePos < 0.25) {
        return 0;
      }
      // Q wave (small downward)
      if (cyclePos < 0.30) {
        const qPos = (cyclePos - 0.25) / 0.05;
        return -Math.sin(qPos * Math.PI) * 20;
      }
      // R wave (large upward spike)
      if (cyclePos < 0.35) {
        const rPos = (cyclePos - 0.30) / 0.05;
        return Math.sin(rPos * Math.PI) * 80;
      }
      // S wave (downward)
      if (cyclePos < 0.40) {
        const sPos = (cyclePos - 0.35) / 0.05;
        return -Math.sin(sPos * Math.PI) * 30;
      }
      // ST segment (flat)
      if (cyclePos < 0.70) {
        return 0;
      }
      // T wave (rounded upward)
      if (cyclePos < 0.90) {
        const tPos = (cyclePos - 0.70) / 0.20;
        return Math.sin(tPos * Math.PI) * 25;
      }
      // Rest (flat baseline)
      return 0;
    };

    const drawECGLine = () => {
      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const lineY = height * 0.9; // Center the line vertically within the bottom container
      
      // Build the path once
      const path = new Path2D();
      for (let x = 0; x < width; x++) {
        const waveX = width - x + offset;
        const y = lineY - generateECGWave(waveX);
        if (x === 0) {
          path.moveTo(x, y);
        } else {
          path.lineTo(x, y);
        }
      }
      
      // Draw single line with subtle glow
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 8;
      ctx.shadowColor = glowColor;
      ctx.globalAlpha = 0.6;
      ctx.stroke(path);
      
      // Reset context
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    };

    const animate = () => {
      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      
      // Clear canvas with transparent background
      ctx.clearRect(0, 0, width, height);
      
      // Draw ECG line
      drawECGLine();
      
      // Update offset for scrolling effect (right to left)
      offset += speed;
      if (offset > 400) {
        offset = 0;
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Start animation after a small delay to ensure canvas is ready
    const animationTimeout = setTimeout(() => {
      animate();
    }, 150);

    return () => {
      clearTimeout(initTimeout);
      clearTimeout(animationTimeout);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [mounted]);

  if (!mounted) {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      className={`absolute top-[40%] left-0 right-0 h-20 pointer-events-none ${className}`}
      style={{
        mixBlendMode: 'screen',
        opacity: 0.4,
        zIndex: 5,
        filter: 'brightness(1.0)',
      }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{
          display: 'block',
        }}
      />
    </div>
  );
}

