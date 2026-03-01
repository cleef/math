import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Info, Scale, Box, Play, Pause } from 'lucide-react';

// Density in g/cm³ (which is kg/L)
const PRESETS = [
  { name: 'Aerogel', density: 0.1, color: '#E0F7FA' },
  { name: 'Styrofoam', density: 0.05, color: '#FFFFFF' },
  { name: 'Wood (Pine)', density: 0.5, color: '#D2B48C' },
  { name: 'Water', density: 1.0, color: '#4FC3F7' },
  { name: 'Loose Sand', density: 1.4, color: '#E6C288' },
  { name: 'Packed Sand', density: 1.7, color: '#C2A268' },
  { name: 'Wet Sand', density: 1.9, color: '#A08250' },
  { name: 'Concrete', density: 2.4, color: '#9E9E9E' },
  { name: 'Aluminum', density: 2.7, color: '#B0BEC5' },
];

export default function DensityDemo() {
  const [density, setDensity] = useState(1.4); // Default to loose sand
  const [showInfo, setShowInfo] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<{x: number, y: number, z: number}[]>([]);
  const requestRef = useRef<number>();
  const angleRef = useRef(0);

  // 1L = 1000 cm³
  // Mass = Density * Volume
  // If Volume is fixed at 1L (1000 cm³), Mass in grams = Density * 1000
  // Mass in kg = Density
  const massKg = density;

  // Auto-play logic
  useEffect(() => {
    let interval: number;
    if (isAutoPlaying) {
      interval = window.setInterval(() => {
        setDensity(prev => {
          if (prev >= 3.0) {
            setIsAutoPlaying(false);
            return 3.0;
          }
          return Math.min(3.0, prev + 0.02);
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  // Generate particles based on density
  useEffect(() => {
    // Base count 800 for density 1.0
    const count = Math.floor(density * 800); 
    const newParticles = [];
    const size = 140; // Cube size range (-70 to 70)
    
    for (let i = 0; i < count; i++) {
      newParticles.push({
        x: (Math.random() - 0.5) * size,
        y: (Math.random() - 0.5) * size,
        z: (Math.random() - 0.5) * size,
      });
    }
    particlesRef.current = newParticles;
  }, [density]);

  // Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      
      angleRef.current += 0.005;
      const angle = angleRef.current;
      
      // Color interpolation
      const t = Math.min(1, Math.max(0, (density - 0.5) / 2.5));
      const r = Math.round(230 - t * (230 - 100));
      const g = Math.round(194 - t * (194 - 80));
      const b = Math.round(136 - t * (136 - 60));
      const color = `rgb(${r}, ${g}, ${b})`;

      // 3D Projection Helper
      const project = (x: number, y: number, z: number) => {
        // Rotate around Y
        const x1 = x * Math.cos(angle) - z * Math.sin(angle);
        const z1 = x * Math.sin(angle) + z * Math.cos(angle);
        
        // Rotate around X (tilt slightly down to see top)
        const tilt = 0.4;
        const y2 = y * Math.cos(tilt) - z1 * Math.sin(tilt);
        const z2 = y * Math.sin(tilt) + z1 * Math.cos(tilt);
        
        // Perspective
        const dist = 400;
        const scale = dist / (dist + z2);
        
        return {
          x: cx + x1 * scale,
          y: cy + y2 * scale,
          scale: scale,
          z: z2
        };
      };

      // Cube Vertices
      const s = 70; // Half size
      const vertices = [
        {x:-s, y:-s, z:-s}, {x:s, y:-s, z:-s}, {x:s, y:s, z:-s}, {x:-s, y:s, z:-s}, // Front (initially)
        {x:-s, y:-s, z:s}, {x:s, y:-s, z:s}, {x:s, y:s, z:s}, {x:-s, y:s, z:s}      // Back
      ];
      
      const projV = vertices.map(v => project(v.x, v.y, v.z));
      
      // Draw Edges
      ctx.strokeStyle = '#94a3b8'; // slate-400
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      
      const edges = [
        [0,1], [1,2], [2,3], [3,0], // Front face
        [4,5], [5,6], [6,7], [7,4], // Back face
        [0,4], [1,5], [2,6], [3,7]  // Connecting edges
      ];

      // Draw back edges first (farthest Z)? 
      // Simple wireframe: just draw all.
      ctx.beginPath();
      edges.forEach(([i, j]) => {
        ctx.moveTo(projV[i].x, projV[i].y);
        ctx.lineTo(projV[j].x, projV[j].y);
      });
      ctx.stroke();

      // Draw Particles
      ctx.fillStyle = color;
      
      // Optional: Sort particles by Z for correct occlusion if we were drawing solids
      // For performance with 2000+ particles, skipping sort is okay for "sand" look
      // But let's try to be nice.
      // particlesRef.current.sort((a, b) => b.z - a.z); // This modifies the ref array, risky if generating?
      // Actually, just drawing them is fine for this effect.
      
      particlesRef.current.forEach(p => {
        const proj = project(p.x, p.y, p.z);
        // Size scales with perspective
        const size = Math.max(0.5, 2 * proj.scale);
        
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, size, 0, Math.PI * 2);
        ctx.fill();
      });

      requestRef.current = requestAnimationFrame(render);
    };
    
    render();
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [density]); // Re-run when density changes to update color logic inside render loop

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 flex flex-col items-center">
      
      <header className="w-full max-w-4xl mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Density Visualizer</h1>
          <p className="text-slate-500 mt-1">Explore how mass changes with density in a fixed 1L volume of sand.</p>
        </div>
        <button 
          onClick={() => setShowInfo(!showInfo)}
          className="p-2 rounded-full hover:bg-slate-200 transition-colors"
        >
          <Info className="w-6 h-6 text-slate-600" />
        </button>
      </header>

      <main className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Visualizer Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden border border-slate-100">
          
          {/* The Cube Container */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Label for 1L */}
            <div className="absolute top-0 right-0 text-xs font-mono text-slate-400 font-bold">1.0 L Cube</div>
            
            {/* Canvas for particles */}
            <canvas 
              ref={canvasRef} 
              width={300} 
              height={300} 
              className="w-[300px] h-[300px]"
            />
          </div>

          {/* Scale / Weight Display */}
          <div className="mt-8 relative">
            <div className="w-48 h-4 bg-slate-300 rounded-full mx-auto mb-2"></div>
            <div className="bg-slate-800 text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-3 min-w-[200px] justify-center">
              <Scale className="w-5 h-5 text-emerald-400" />
              <div className="flex flex-col items-start">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Mass</span>
                <motion.div
                  key={massKg}
                  initial={{ scale: 1.1, color: '#34d399' }}
                  animate={{ scale: 1, color: '#ffffff' }}
                  transition={{ duration: 0.2 }}
                  className="text-2xl font-mono font-bold tabular-nums"
                >
                  {massKg.toFixed(2)} <span className="text-sm font-normal text-slate-400">kg</span>
                </motion.div>
              </div>
            </div>
          </div>

        </div>

        {/* Controls Section */}
        <div className="flex flex-col gap-6">
          
          {/* Main Slider */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-end mb-4">
              <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Density</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    if (!isAutoPlaying && density >= 3.0) {
                      setDensity(0.1);
                    }
                    setIsAutoPlaying(!isAutoPlaying);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm font-medium"
                >
                  {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isAutoPlaying ? 'Stop' : 'Auto Play'}
                </button>
                <div className="text-right">
                  <span className="text-3xl font-bold text-slate-900 tabular-nums">{density.toFixed(2)}</span>
                  <span className="text-sm text-slate-500 ml-1">g/cm³ (kg/L)</span>
                  <div className="text-xs text-indigo-600 font-medium mt-1 h-4">
                    {PRESETS.find(p => Math.abs(p.density - density) < 0.05)?.name || 'Custom Density'}
                  </div>
                </div>
              </div>
            </div>
            
            <input
              type="range"
              min="0.1"
              max="3.0"
              step="0.05"
              value={density}
              onChange={(e) => setDensity(parseFloat(e.target.value))}
              className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-500 transition-all"
            />
            
            <div className="flex justify-between text-xs text-slate-400 mt-2 font-mono">
              <span>0.1</span>
              <span>1.5</span>
              <span>3.0</span>
            </div>
          </div>

          {/* Presets Grid */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Material Presets</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => setDensity(preset.density)}
                  className={`
                    px-3 py-2 rounded-xl text-sm font-medium transition-all text-left flex flex-col gap-1 border
                    ${Math.abs(density - preset.density) < 0.05 
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700 ring-2 ring-indigo-500/20' 
                      : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100 hover:border-slate-200'}
                  `}
                >
                  <span className="truncate">{preset.name}</span>
                  <span className="text-xs opacity-70 font-mono">{preset.density} g/cm³</span>
                </button>
              ))}
            </div>
          </div>

          {/* Formula Card */}
          <div className="bg-indigo-900 text-white rounded-3xl shadow-lg p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Box className="w-32 h-32" />
            </div>
            <h3 className="text-sm font-semibold text-indigo-200 uppercase tracking-wider mb-2">The Physics</h3>
            <div className="text-2xl font-mono mb-4">
              ρ = m / V
            </div>
            <p className="text-indigo-100 text-sm leading-relaxed max-w-[90%]">
              <strong>Density (ρ)</strong> is the amount of mass (m) per unit of volume (V).
              <br/><br/>
              Since our container is fixed at <strong>1 Liter</strong> (1000 cm³), increasing the density directly increases the mass.
            </p>
          </div>

        </div>
      </main>

      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowInfo(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4">About this Demo</h2>
              <p className="text-slate-600 mb-4">
                This simulation visualizes density by showing how many "particles" fit into a fixed volume.
              </p>
              <ul className="space-y-2 text-slate-600 mb-6 list-disc pl-5">
                <li><strong>Volume:</strong> Fixed at 1 Liter.</li>
                <li><strong>Particles:</strong> Represent atoms or grains of sand. More particles = Higher Density.</li>
                <li><strong>Mass:</strong> Calculated as Density × Volume.</li>
              </ul>
              <button
                onClick={() => setShowInfo(false)}
                className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
