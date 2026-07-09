import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, CircleDashed, ListChecks } from 'lucide-react';

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwk-rOVHXrdUH5ZflSZ2yvrzqanERA84DDG8OaTD77bTx2P1OXGvyP1-E6q4wypzAI3/exec"; 


const taskLabels = ["Perencanaan", "Pendaftaran", "Izin", "Sertifikat"];

export default function App() {
  const [dataByRegion, setDataByRegion] = useState({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isWaiting, setIsWaiting] = useState(false);
  const scrollRef = useRef(null);

  const fetchData = async () => {
    try {
      const res = await fetch(SCRIPT_URL + "?t=" + new Date().getTime());
      const data = await res.json();
      if (data) setDataByRegion(data);
      setLoading(false);
    } catch (err) {
      console.error("Gagal memuat:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, 300000);
    return () => clearInterval(timer);
  }, []);

  const regions = Object.keys(dataByRegion);

  useEffect(() => {
    if (regions.length === 0 || isWaiting) return;

    const scrollInterval = setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;

      if (el.scrollTop + el.clientHeight < el.scrollHeight - 5) {
        el.scrollTop += 1;
      } else {
        setIsWaiting(true);
        const waitTime = 3000 + ((dataByRegion[regions[currentIdx]]?.length || 0) * 500);
        
        setTimeout(() => {
          el.scrollTop = 0;
          setCurrentIdx((prev) => (prev + 1) % regions.length);
          setIsWaiting(false);
        }, waitTime);
      }
    }, 50);

    return () => clearInterval(scrollInterval);
  }, [currentIdx, regions, dataByRegion, isWaiting]);

  if (loading) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Memuat Data...</div>;

  const currentRegion = regions[currentIdx];
  const batches = dataByRegion[currentRegion] || [];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
      <div className="relative w-full max-w-4xl bg-slate-900 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl">
        <div className="bg-slate-800 p-6 border-b border-slate-700 flex justify-between items-center">
          <div>
            <h2 className="text-sm text-blue-400 font-bold uppercase tracking-widest">SiBangkom 2026</h2>
            <h1 className="text-3xl font-black">KABUPATEN {currentRegion?.toUpperCase()}</h1>
          </div>
          <div className="text-blue-500 font-mono text-sm">Slide {currentIdx + 1} / {regions.length}</div>
        </div>
        <div ref={scrollRef} className="h-[500px] overflow-y-auto p-6 space-y-6">
          {batches.map((batch, bIdx) => (
            <div key={bIdx} className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700">
              <h3 className="font-bold text-lg mb-4 text-blue-200 flex items-center gap-2">
                <ListChecks size={20} />
                {batch.name}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {batch.tasks.map((status, tIdx) => {
                  const isSelesai = status === "Selesai" || status === true || status === 1;
                  return (
                    <div key={tIdx} className={`p-3 rounded-lg flex items-center gap-3 ${isSelesai ? 'bg-emerald-900/30' : 'bg-slate-700/50'}`}>
                      {isSelesai ? <CheckCircle2 className="text-emerald-400" size={20} /> : <CircleDashed className="text-amber-400 animate-spin" size={20} />}
                      <div className="text-xs">
                        <p className="opacity-60">{taskLabels[tIdx]}</p>
                        <p className="font-bold">{isSelesai ? "SELESAI" : (status || "ON PROSES")}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}