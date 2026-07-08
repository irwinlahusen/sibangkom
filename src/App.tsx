import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, CircleDashed, ListChecks } from 'lucide-react';

const SCRIPT_URL = ""; 

const fallbackData: Record<string, any[]> = {
  "Morowali": [
    { name: "LATSAR CPNS MOROWALI Angkatan XXVII", tasks: ["Selesai", "Selesai", "Selesai", "Selesai"] }
  ]
};

const taskLabels = ["Perencanaan", "Pendaftaran", "Izin", "Sertifikat"];

export default function App() {
  const [dataByRegion, setDataByRegion] = useState<Record<string, any[]>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!SCRIPT_URL || SCRIPT_URL === "") {
      setDataByRegion(fallbackData);
      setLoading(false);
      return;
    }

    fetch(SCRIPT_URL)
      .then(res => res.json())
      .then(data => {
        setDataByRegion(data || fallbackData);
        setLoading(false);
      })
      .catch(() => {
        setDataByRegion(fallbackData);
        setLoading(false);
      });
  }, []);

  const regions = Object.keys(dataByRegion);

  const nextSlide = () => {
    setCurrentIdx((prev) => (prev + 1) % regions.length);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  };

  useEffect(() => {
    if (regions.length === 0) return;
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 5) {
          setTimeout(nextSlide, 2000); 
        } else {
          scrollRef.current.scrollTop += 1;
        }
      }
    }, 50);
    return () => clearInterval(interval);
  }, [currentIdx, regions]);

  if (loading) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Memuat...</div>;

  const currentRegion = regions[currentIdx];
  const batches = dataByRegion[currentRegion] || [];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
      <div className="relative w-full max-w-4xl bg-slate-900 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl">
        <div className="bg-slate-800 p-6 border-b border-slate-700">
          <h2 className="text-sm text-blue-400 font-bold uppercase tracking-widest">Wilayah Kerja</h2>
          <h1 className="text-3xl font-black">KABUPATEN {currentRegion?.toUpperCase()}</h1>
        </div>
        <div ref={scrollRef} className="h-[500px] overflow-y-auto p-6 space-y-6">
          {batches.map((batch: any, bIdx: number) => (
            <div key={bIdx} className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700">
              <h3 className="font-bold text-lg mb-4 text-blue-200 flex items-center gap-2">
                <ListChecks size={20} />
                {batch.name}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {batch.tasks.map((status: any, tIdx: number) => {
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