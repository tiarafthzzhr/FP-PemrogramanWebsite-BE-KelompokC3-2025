# Revised Puzzle Gameplay Instructions

Dokumen ini menggantikan instruksi sebelumnya untuk halaman **Detail & Gameplay Puzzle**.
Tujuan revisi: Menyederhanakan UI, menghilangkan fitur "Peringkat/Leaderboard", dan fokus pada pengalaman bermain.

---

## 📂 Struktur Halaman

Kita akan menggunakan satu file utama yang menangani flow:
1. **Lobby State**: User melihat detail puzzle dan memilih difficulty.
2. **Play State**: User sedang bermain puzzle.
3. **Finish State**: User menyelesaikan puzzle.

File: `src/pages/puzzle/[id]/index.tsx`

---

## 💻 Kode Implementasi (`src/pages/puzzle/[id]/index.tsx`)

Silakan ganti seluruh isi file tersebut dengan kode di bawah ini:

```tsx
import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Play, 
  Timer, 
  RotateCcw, 
  Pause, 
  Maximize2 
} from 'lucide-react'; // Pastikan install lucide-react atau gunakan icon library lain
import { puzzleApi } from '../../services/puzzle.service';
import type { PuzzleGame, PuzzleSession } from '../../types/puzzle.types';

// Komponen Game Board (Placeholder)
const PuzzleBoard = ({ session, onComplete }: { session: PuzzleSession, onComplete: (time: number) => void }) => {
  return (
    <div className="bg-black/20 p-8 rounded-3xl border-2 border-dashed border-white/20 text-center">
      <p className="text-gray-400 mb-4">Area Permainan Puzzle</p>
      <p className="text-sm text-gray-500">Implementasi Drag & Drop Puzzle di sini...</p>
      {/* Tombol debug untuk simulasi menang */}
      <button 
        onClick={() => onComplete(50)} // Simulasi selesai dalam 50 detik
        className="mt-4 px-4 py-2 bg-green-600 rounded text-sm hover:bg-green-500"
      >
        [DEBUG] Auto Win
      </button>
    </div>
  );
};

export default function PuzzlePage() {
  const { id } = useParams<{ id: string }>();
  
  // States
  const [puzzle, setPuzzle] = useState<PuzzleGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'finished'>('lobby');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard' | null>(null);
  const [session, setSession] = useState<PuzzleSession | null>(null);
  
  // Timer State
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Fetch Puzzle Detail
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        if (!id) return;
        const data = await puzzleApi.getById(id);
        setPuzzle(data);
      } catch (error) {
        console.error('Failed to load puzzle', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  // Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'playing' && !isPaused) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, isPaused]);

  // Handlers
  const handleStartGame = async () => {
    if (!id || !selectedDifficulty) return;
    try {
      setLoading(true);
      const newSession = await puzzleApi.startGame(id, selectedDifficulty);
      setSession(newSession);
      setGameState('playing');
      setTimeElapsed(0);
    } catch (error) {
      console.error('Failed to start game', error);
      alert('Gagal memulai game.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinishGame = async (timeTaken: number) => {
    if (!id || !selectedDifficulty) return;
    try {
      await puzzleApi.finishGame({
        gameId: id,
        difficulty: selectedDifficulty,
        timeTaken: timeTaken,
        isCompleted: true
      });
      setGameState('finished');
    } catch (error) {
      console.error('Failed to save progress', error);
    }
  };

  if (loading && !puzzle) {
    return (
      <div className="min-h-screen bg-[#0F0826] flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!puzzle) return <div className="text-white text-center p-10">Puzzle tidak ditemukan.</div>;


// Helper untuk URL Gambar
const getImageUrl = (path?: string) => {
  if (!path) return 'https://placehold.co/600x400/1e1e2e/FFF?text=Puzzle+Image'; // Placeholder default
  if (path.startsWith('http')) return path;
  // Sesuaikan dengan variable env frontend kamu
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'; 
  return `${baseUrl}/${path}`;
};

export default function PuzzlePage() {
  const { id } = useParams<{ id: string }>();
  
  // States
  const [puzzle, setPuzzle] = useState<PuzzleGame | null>(null);
  // ... other states

  // ... useEffect logic ...

  // UI Render Logic
  // Karena backend 1 puzzle = 1 difficulty (fixed), kita otomatis set difficulty dari data
  useEffect(() => {
    if (puzzle?.difficulty) {
      setSelectedDifficulty(puzzle.difficulty as any);
    }
  }, [puzzle]);

  // ...

  return (
    // ... Header ...

      <main className="p-6 md:p-12 max-w-7xl mx-auto">
        
        {/* VIEW 1: LOBBY & INFO */}
        {gameState === 'lobby' && puzzle && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center animate-fadeIn">
            
            {/* Left: Image Preview */}
            <div className="relative group">
               {/* Gunakan getImageUrl untuk fix gambar broken */}
               <img 
                  src={getImageUrl(puzzle.thumbnail_image || (puzzle as any).game_json?.imageUrl)} 
                  alt={puzzle.name} 
                  className="w-full h-full object-cover rounded-3xl border border-white/10 shadow-2xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/1e1e2e/FFF?text=Image+Error';
                  }}
                />
            </div>

            {/* Right: Info */}
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-4 py-1 rounded-full text-sm font-bold uppercase border
                    ${puzzle.difficulty === 'easy' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                      puzzle.difficulty === 'hard' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                      'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}
                  `}>
                    {puzzle.difficulty || 'Medium'}
                  </span>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{puzzle.name}</h1>
                <p className="text-gray-400 text-lg">
                  {puzzle.description || 'Mainkan puzzle seru ini!'}
                </p>
              </div>

              <div className="bg-[#1A103C] p-6 rounded-3xl border border-white/5">
                <button
                  onClick={handleStartGame}
                  className="w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-[1.02] transition shadow-lg text-white"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Main Sekarang
                </button>
                <p className="text-center text-gray-500 text-sm mt-4">
                  Tingkat Kesulitan: <span className="text-white capitalize">{puzzle.difficulty}</span>
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* ... VIEW 2 & 3 (Playing & Finished) tetap sama ... */}


        {/* VIEW 2: PLAYING STATE */}
        {gameState === 'playing' && session && (
          <div className="max-w-4xl mx-auto animate-fadeIn">
            {/* Game Controls Bar */}
            <div className="flex justify-between items-center mb-8 bg-[#1A103C] p-4 rounded-2xl border border-white/10">
              <div className="flex items-center gap-4">
                <div className="text-gray-400 text-sm font-medium uppercase tracking-widest">
                  {selectedDifficulty} Level
                </div>
                <div className="h-6 w-px bg-white/10"></div>
                <div className="font-mono text-2xl font-bold text-white flex items-center gap-2">
                  <Timer className="w-5 h-5 text-purple-400" />
                  {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => setIsPaused(!isPaused)}
                  className="p-2 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition"
                >
                  {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                </button>
                <button 
                  onClick={() => setGameState('lobby')}
                  className="p-2 hover:bg-red-500/20 rounded-lg text-gray-300 hover:text-red-400 transition"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Game Area */}
            <div className="relative">
               {isPaused && (
                 <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center rounded-3xl">
                   <div className="text-center">
                     <h2 className="text-3xl font-bold mb-4">Game Paused</h2>
                     <button 
                       onClick={() => setIsPaused(false)}
                       className="px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition"
                     >
                       Resume
                     </button>
                   </div>
                 </div>
               )}

               <PuzzleBoard session={session} onComplete={handleFinishGame} />
            </div>
          </div>
        )}

        {/* VIEW 3: FINISHED STATE */}
        {gameState === 'finished' && (
          <div className="max-w-md mx-auto text-center animate-slideUp">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              Puzzle Selesai!
            </h2>
            <p className="text-gray-400 mb-8">
              Kamu menyelesaikan puzzle {selectedDifficulty} dalam waktu {timeElapsed} detik.
            </p>
            
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => setGameState('lobby')} 
                className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition"
              >
                Kembali ke Menu
              </button>
              <Link 
                to="/puzzle" 
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold hover:scale-105 transition"
              >
                Pilih Puzzle Lain
              </Link>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
```
