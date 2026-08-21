"use client";

import React, { useState, useRef } from 'react';
import { Upload, Loader2, Scan, Hexagon } from 'lucide-react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<Array<{ label: string, confidence: number }> | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Static Card Ref (if needed later)
  const cardRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setPredictions(null);
      setError("");
    }
  };

  const handleProcessImage = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError("");

    try {
      // Create FormData to send to our SECURE Next.js Backend
      const formData = new FormData();
      formData.append('image', file);

      // Hit our own /api/predict route (which securely holds the HF Token)
      const res = await fetch('/api/predict', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to process image");
      }

      setPredictions(data.result[0].confidences);
    } catch (err) {
      console.error(err);
      setError(`Error: ${err instanceof Error ? err.message : "Something went wrong"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const loadExample = async (imgPath: string) => {
    try {
      const res = await fetch(imgPath);
      const blob = await res.blob();
      const newFile = new File([blob], imgPath.split('/').pop() || 'example.jpg', { type: blob.type });
      setFile(newFile);
      setPreviewUrl(imgPath);
      setPredictions(null);
      setError("");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-[#000000] text-white flex flex-col items-center justify-center p-6 overflow-x-hidden selection:bg-white/20">
      
      {/* Static Background Glows */}
      <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-1/4 w-[800px] h-[400px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />

      {/* The Premium Flat Card */}
      <div className="w-full max-w-2xl z-10 relative">
        <div className="relative w-full rounded-[24px] border border-white/15 bg-[#0a0a0a]/80 backdrop-blur-2xl p-1 shadow-2xl">
          {/* Inner Card Content */}
          <div className="rounded-[20px] p-8 sm:p-10 border border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent">
            
            {/* Premium Header */}
            <div className="flex items-center justify-between mb-10">
              <div>
                <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white mb-2">
                  Vision <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">ResNet Core</span>
                </h1>
                <p className="text-white/40 text-xs sm:text-sm tracking-widest uppercase font-mono">
                  Geometric Mean Ensemble • 3x3 Conv • F1: 0.628
                </p>
              </div>
              <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-white/5 shadow-inner">
                <Hexagon className="w-6 h-6 text-white/70" />
              </div>
            </div>

            {/* Interactive Upload Box */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`relative group overflow-hidden rounded-[16px] border transition-all duration-500 cursor-pointer p-6 sm:p-10 flex flex-col items-center justify-center min-h-[220px]
                ${file ? 'border-blue-500/50 bg-blue-900/10' : 'border-white/10 hover:border-white/30 bg-black/40 hover:bg-black/60'}`}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              
              {previewUrl ? (
                <div className="flex flex-col items-center text-center w-full">
                  <div className="relative w-full max-w-md h-48 sm:h-64 mb-4 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain bg-black/50" />
                  </div>
                  <p className="font-mono text-xs text-white/30 tracking-widest uppercase mt-2">Click anywhere to reselect</p>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                    <Upload className="w-6 h-6 text-white/60" />
                  </div>
                  <p className="font-medium text-white/70 tracking-wide">Select Biological Image</p>
                  <p className="text-xs text-white/30 mt-2 tracking-widest uppercase font-mono">JPG / PNG FORMAT ONLY</p>
                </div>
              )}
            </div>

            {/* Premium Process Button */}
            <button
              onClick={handleProcessImage}
              disabled={!file || isProcessing}
              className={`w-full mt-6 py-4 rounded-[12px] font-medium tracking-wide flex items-center justify-center gap-3 transition-all duration-500 overflow-hidden relative
                ${!file ? 'bg-white/5 text-white/30 cursor-not-allowed' : 
                 isProcessing ? 'bg-white/10 text-white cursor-wait' : 
                 'bg-white text-black hover:bg-neutral-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]'}`}
            >
              {isProcessing && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />}
              
              {isProcessing ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> <span className="font-mono text-sm uppercase tracking-widest">Analyzing Image...</span></>
              ) : (
                <><Scan className="w-5 h-5" /> <span>Run ZeroGPU Inference</span></>
              )}
            </button>

            {error && (
              <div className="mt-4 text-center text-red-400 text-sm font-mono tracking-wide">
                {error}
              </div>
            )}

            {/* Premium Output Area */}
            {predictions && predictions.length > 0 && (
              <div 
                className="mt-8 relative animate-in fade-in slide-in-from-bottom-4 duration-700"
              >
                <div className="absolute -top-3 left-6 bg-[#0a0a0a] px-2 text-[10px] font-mono tracking-[0.2em] text-white/40 uppercase z-10 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500/80 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                  Prediction Matrix
                </div>
                <div className="relative p-6 sm:p-8 rounded-[16px] border border-white/10 bg-black/50 shadow-inner">
                  
                  <div className="space-y-4">
                    {predictions.map((p: { label: string, confidence: number }, idx: number) => (
                      <div key={idx} className="w-full">
                        <div className="flex justify-between text-xs font-mono mb-1 text-white/80">
                          <span className="uppercase tracking-widest text-blue-400">{p.label}</span>
                          <span>{(p.confidence * 100).toFixed(2)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                            style={{ width: `${p.confidence * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            )}

          </div>
        </div>

        {/* Examples Row (Outside the Card) */}
        <div className="mt-8 max-w-2xl mx-auto">
          <p className="text-[10px] font-mono tracking-widest text-white/40 uppercase mb-4 text-center">Or select a quick example from our dataset:</p>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              '/examples/amphibia.jpg', 
              '/examples/animalia.jpg', 
              '/examples/arachnida.jpg', 
              '/examples/aves.jpg',
              '/examples/fungi.jpg',
              '/examples/insecta.jpg',
              '/examples/mammalia.jpg',
              '/examples/mollusca.jpg',
              '/examples/plantae.jpg',
              '/examples/reptilia.jpg'
            ].map((src, i) => (
              <button 
                key={i} 
                onClick={() => loadExample(src)}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-[16px] border-2 border-white/10 overflow-hidden hover:scale-105 hover:border-blue-500 transition-all shadow-[0_0_20px_rgba(0,0,0,0.6)] focus:outline-none"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`Example ${i+1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Minimal Footer */}
      <div className="mt-12 text-[10px] font-mono tracking-[0.2em] text-white/20 uppercase flex items-center gap-4 z-10">
        <span>Server Status: Online</span>
        <span className="w-1 h-1 bg-white/20 rounded-full" />
        <span>Hardware: ZeroGPU</span>
        <span className="w-1 h-1 bg-white/20 rounded-full" />
        <span>Vercel Serverless API</span>
      </div>
    </div>
  );
}
