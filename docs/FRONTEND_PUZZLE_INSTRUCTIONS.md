# 📋 Frontend Instructions: Puzzle Game Module

## Overview

Dokumen ini berisi instruksi lengkap untuk tim Frontend dalam mengimplementasikan fitur **Puzzle Game** termasuk CRUD untuk Admin Panel dan Game Play untuk User.

---

## 🔧 Environment Setup

### Base URL Configuration

```typescript
// src/config/api.config.ts
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
```

### Environment Variables (.env)

```env
VITE_API_URL=http://localhost:4000
```

---

## 📁 Folder Structure

```
src/
├── pages/
│   ├── puzzle/
│   │   ├── index.tsx                  # Puzzle lobby/listing page
│   │   ├── [id]/
│   │   │   └── index.tsx              # Puzzle game play page
│   │   ├── components/
│   │   │   ├── PuzzleCard.tsx         # Card untuk display puzzle
│   │   │   ├── PuzzleBoard.tsx        # Board puzzle game
│   │   │   ├── PuzzlePiece.tsx        # Individual puzzle piece
│   │   │   ├── GameTimer.tsx          # Timer component
│   │   │   ├── GameStats.tsx          # Stats display
│   │   │   ├── ExitButton.tsx         # Exit button component
│   │   │   ├── PauseButton.tsx        # Pause button component
│   │   │   └── PauseOverlay.tsx       # Pause overlay modal
│   │   ├── hooks/
│   │   │   ├── usePuzzle.ts           # Hook untuk puzzle data
│   │   │   └── useGameTimer.ts        # Hook untuk timer
│   │   ├── services/
│   │   │   └── puzzle.service.ts      # API service layer
│   │   └── types/
│   │       └── puzzle.types.ts        # TypeScript interfaces
│   │
│   │   ├── services/
│   │   │   └── puzzle.service.ts      # API service layer
│   │   └── types/
│   │       └── puzzle.types.ts        # TypeScript interfaces
│   │
│   └── admin/
│       └── puzzle/
│           ├── create.tsx             # Create new puzzle
│           └── edit/
│               └── [id].tsx           # Edit puzzle
```

---

## 📝 TypeScript Interfaces

```typescript
// src/pages/puzzle/types/puzzle.types.ts

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface PuzzleGame {
  game_id: string;
  title: string;
  description: string;
  thumbnail: string;
  is_published: boolean;
  play_count: number;
  like_count: number;
  created_at: string;
  updated_at: string;
  creator: {
    user_id: string;
    username: string;
    profile_picture: string | null;
  };
  puzzle_game: {
    puzzle_game_id: string;
    image_easy: string;
    image_medium: string;
    image_hard: string;
    time_limit_easy: number;
    time_limit_medium: number;
    time_limit_hard: number;
  };
}

export interface PuzzleSession {
  puzzleImage: string;
  gridSize: number;
  timeLimit: number;
}

export interface PuzzleFinishResult {
  score: number;
  time_taken: number;
  is_completed: boolean;
  leaderboard_rank?: number;
}

export interface LeaderboardEntry {
  rank: number;
  user: {
    user_id: string;
    username: string;
    profile_picture: string | null;
  };
  score: number;
  time_taken: number;
  completed_at: string;
}

export interface CreatePuzzlePayload {
  name: string;
  description: string;
  is_publish_immediately?: boolean;
  rows?: number;
  cols?: number;
  difficulty?: Difficulty;
}

export interface UpdatePuzzlePayload {
  name?: string;
  description?: string;
  is_published?: boolean;
  rows?: number;
  cols?: number;
  difficulty?: Difficulty;
}

export interface FinishPuzzlePayload {
  gameId: string;
  difficulty: Difficulty;
  timeTaken: number;
  isCompleted: boolean;
}
```

---

## 🔌 API Service Layer

```typescript
// src/pages/puzzle/services/puzzle.service.ts

import axios from 'axios';
import type {
  PuzzleGame,
  PuzzleSession,
  PuzzleFinishResult,
  LeaderboardEntry,
  CreatePuzzlePayload,
  UpdatePuzzlePayload,
  FinishPuzzlePayload,
  Difficulty,
} from '../types/puzzle.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Helper untuk get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const puzzleApi = {
  // ============ PUBLIC ENDPOINTS ============

  /**
   * Get all puzzles (public)
   * Digunakan di: Puzzle Lobby/Home
   */
  getAll: async (): Promise<PuzzleGame[]> => {
    const response = await axios.get(
      `${API_BASE_URL}/api/game/game-type/puzzle`,
      { headers: getAuthHeader() }
    );
    return response.data.data;
  },

  /**
   * Get puzzle by ID (public)
   * Digunakan di: Puzzle Detail/Game Page
   */
  getById: async (gameId: string): Promise<PuzzleGame> => {
    const response = await axios.get(
      `${API_BASE_URL}/api/game/game-type/puzzle/${gameId}`,
      { headers: getAuthHeader() }
    );
    return response.data.data;
  },

  /**
   * Get leaderboard for a puzzle (public)
   */
  getLeaderboard: async (gameId: string): Promise<LeaderboardEntry[]> => {
    const response = await axios.get(
      `${API_BASE_URL}/api/game/game-type/puzzle/${gameId}/leaderboard`
    );
    return response.data.data;
  },

  // ============ GAME PLAY ENDPOINTS ============

  /**
   * Start a puzzle session
   * Digunakan di: Saat user mulai main puzzle
   */
  startGame: async (
    gameId: string,
    difficulty: Difficulty
  ): Promise<PuzzleSession> => {
    const response = await axios.post(
      `${API_BASE_URL}/api/game/game-type/puzzle/${gameId}/start`,
      { difficulty },
      { headers: getAuthHeader() }
    );
    return response.data.data;
  },

  /**
   * Finish/Complete a puzzle session
   * Digunakan di: Saat puzzle selesai atau timeout
   */
  finishGame: async (payload: FinishPuzzlePayload): Promise<PuzzleFinishResult> => {
    const response = await axios.post(
      `${API_BASE_URL}/api/game/game-type/puzzle/finish`,
      payload,
      { headers: getAuthHeader() }
    );
    return response.data.data;
  },

  /**
   * Upload puzzle image
   * Digunakan di: Admin create/edit puzzle
   */
  uploadImage: async (file: File): Promise<{ imageUrl: string }> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await axios.post(
      `${API_BASE_URL}/api/game/game-type/puzzle/upload-image`,
      formData,
      {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  /**
   * Increment play count
   * Dipanggil saat user exit game
   */
  incrementPlayCount: async (gameId: string): Promise<void> => {
    await axios.post(
      `${API_BASE_URL}/api/game/play-count`,
      { game_id: gameId },
      { headers: getAuthHeader() }
    );
  },

  // ============ ADMIN ONLY ENDPOINTS ============
  // Hanya bisa diakses oleh ADMIN dan SUPER_ADMIN

  /**
   * Get puzzle for editing (admin only)
   */
  getForEdit: async (gameId: string): Promise<PuzzleGame> => {
    const response = await axios.get(
      `${API_BASE_URL}/api/game/game-type/puzzle/${gameId}/edit`,
      { headers: getAuthHeader() }
    );
    return response.data.data;
  },

  /**
   * Create new puzzle (admin only)
   */
  /**
   * Create new puzzle (admin only)
   */
  create: async (payload: CreatePuzzlePayload, thumbnail: File, files: File[]): Promise<PuzzleGame> => {
    const formData = new FormData();
    formData.append('name', payload.name);
    formData.append('description', payload.description);
    if (payload.is_publish_immediately !== undefined) {
      formData.append('is_publish_immediately', String(payload.is_publish_immediately));
    }
    if (payload.rows) formData.append('rows', String(payload.rows));
    if (payload.cols) formData.append('cols', String(payload.cols));
    if (payload.difficulty) formData.append('difficulty', payload.difficulty);
    
    formData.append('thumbnail_image', thumbnail);
    
    files.forEach((file) => {
      formData.append('files_to_upload', file);
    });

    const response = await axios.post(
      `${API_BASE_URL}/api/game/game-type/puzzle`,
      formData,
      {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  /**
   * Update puzzle (admin only)
   */
  update: async (
    gameId: string,
    payload: UpdatePuzzlePayload,
    thumbnail?: File,
    files?: File[]
  ): Promise<PuzzleGame> => {
    const formData = new FormData();
    if (payload.name) formData.append('name', payload.name);
    if (payload.description) formData.append('description', payload.description);
    if (payload.is_published !== undefined) {
      formData.append('is_publish', String(payload.is_published));
    }
     if (payload.rows) formData.append('rows', String(payload.rows));
    if (payload.cols) formData.append('cols', String(payload.cols));
    if (payload.difficulty) formData.append('difficulty', payload.difficulty);

    if (thumbnail) {
      formData.append('thumbnail_image', thumbnail);
    }
    
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('files_to_upload', file);
      });
    }

    const response = await axios.patch(
      `${API_BASE_URL}/api/game/game-type/puzzle/${gameId}`,
      formData,
      {
         headers: {
          ...getAuthHeader(),
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  /**
   * Delete puzzle (admin only)
   */
  delete: async (gameId: string): Promise<void> => {
    await axios.delete(
      `${API_BASE_URL}/api/game/game-type/puzzle/${gameId}`,
      { headers: getAuthHeader() }
    );
  },
};
```

---

## 🎮 Game Components Implementation

### Exit Button Component

```typescript
// src/pages/puzzle/components/ExitButton.tsx

import { useNavigate } from 'react-router-dom';
import { puzzleApi } from '../services/puzzle.service';

interface ExitButtonProps {
  gameId: string;
  onBeforeExit?: () => void;
}

export const ExitButton = ({ gameId, onBeforeExit }: ExitButtonProps) => {
  const navigate = useNavigate();

  const handleExit = async () => {
    if (onBeforeExit) {
      onBeforeExit();
    }

    // Increment play count saat exit
    try {
      await puzzleApi.incrementPlayCount(gameId);
    } catch (error) {
      console.error('Failed to update play count:', error);
    }

    navigate('/');
  };

  return (
    <button
      onClick={handleExit}
      className="exit-button"
      title="Exit Game"
    >
      ✕ Exit
    </button>
  );
};
```

### Pause Button & Overlay

```typescript
// src/pages/puzzle/components/PauseButton.tsx

interface PauseButtonProps {
  isPaused: boolean;
  onTogglePause: () => void;
}

export const PauseButton = ({ isPaused, onTogglePause }: PauseButtonProps) => {
  return (
    <button
      onClick={onTogglePause}
      className="pause-button"
      title={isPaused ? 'Resume' : 'Pause'}
    >
      {isPaused ? '▶️ Resume' : '⏸️ Pause'}
    </button>
  );
};
```

```typescript
// src/pages/puzzle/components/PauseOverlay.tsx

interface PauseOverlayProps {
  isVisible: boolean;
  onResume: () => void;
  onExit: () => void;
}

export const PauseOverlay = ({ isVisible, onResume, onExit }: PauseOverlayProps) => {
  if (!isVisible) return null;

  return (
    <div className="pause-overlay">
      <div className="pause-modal">
        <h2>⏸️ Game Paused</h2>
        <div className="pause-actions">
          <button onClick={onResume} className="resume-btn">
            ▶️ Resume
          </button>
          <button onClick={onExit} className="exit-btn">
            🚪 Exit Game
          </button>
        </div>
      </div>
    </div>
  );
};
```

---

## 📄 Page Implementations

### 1. Puzzle Lobby (Home) Page

```typescript
// src/pages/puzzle/index.tsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { puzzleApi } from './services/puzzle.service';
import type { PuzzleGame, Difficulty } from './types/puzzle.types';

export default function PuzzleLobby() {
  const [puzzles, setPuzzles] = useState<PuzzleGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPuzzle, setSelectedPuzzle] = useState<PuzzleGame | null>(null);
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPuzzles = async () => {
      try {
        const data = await puzzleApi.getAll();
        setPuzzles(data);
      } catch (error) {
        console.error('Failed to fetch puzzles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPuzzles();
  }, []);

  const handlePuzzleClick = (puzzle: PuzzleGame) => {
    setSelectedPuzzle(puzzle);
    setShowDifficultyModal(true);
  };

  const handleDifficultySelect = (difficulty: Difficulty) => {
    if (selectedPuzzle) {
      navigate(`/puzzle/${selectedPuzzle.game_id}?difficulty=${difficulty}`);
    }
    setShowDifficultyModal(false);
  };

  if (loading) {
    return <div className="loading">Loading puzzles...</div>;
  }

  return (
    <div className="puzzle-lobby">
      <h1>🧩 Puzzle Games</h1>
      
      <div className="puzzle-grid">
        {puzzles.map((puzzle) => (
          <div
            key={puzzle.game_id}
            className="puzzle-card"
            onClick={() => handlePuzzleClick(puzzle)}
          >
            <img src={puzzle.thumbnail} alt={puzzle.title} />
            <h3>{puzzle.title}</h3>
            <p>{puzzle.description}</p>
            <div className="puzzle-stats">
              <span>▶️ {puzzle.play_count} plays</span>
              <span>❤️ {puzzle.like_count} likes</span>
            </div>
          </div>
        ))}
      </div>

      {/* Difficulty Selection Modal */}
      {showDifficultyModal && selectedPuzzle && (
        <div className="difficulty-modal-overlay">
          <div className="difficulty-modal">
            <h2>Select Difficulty</h2>
            <p>Choose difficulty for: {selectedPuzzle.title}</p>
            
            <div className="difficulty-options">
              <button
                onClick={() => handleDifficultySelect('easy')}
                className="difficulty-btn easy"
              >
                <span>😊 Easy</span>
                <span className="time">
                  {selectedPuzzle.puzzle_game.time_limit_easy}s | 3x3 Grid
                </span>
              </button>
              
              <button
                onClick={() => handleDifficultySelect('medium')}
                className="difficulty-btn medium"
              >
                <span>🤔 Medium</span>
                <span className="time">
                  {selectedPuzzle.puzzle_game.time_limit_medium}s | 4x4 Grid
                </span>
              </button>
              
              <button
                onClick={() => handleDifficultySelect('hard')}
                className="difficulty-btn hard"
              >
                <span>😤 Hard</span>
                <span className="time">
                  {selectedPuzzle.puzzle_game.time_limit_hard}s | 5x5 Grid
                </span>
              </button>
            </div>
            
            <button
              onClick={() => setShowDifficultyModal(false)}
              className="close-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

### 2. Puzzle Game Play Page

```typescript
// src/pages/puzzle/[id]/index.tsx

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { puzzleApi } from '../services/puzzle.service';
import { ExitButton } from '../components/ExitButton';
import { PauseButton } from '../components/PauseButton';
import { PauseOverlay } from '../components/PauseOverlay';
import type { Difficulty, PuzzleSession } from '../types/puzzle.types';

export default function PuzzleGame() {
  const { id: gameId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const difficulty = (searchParams.get('difficulty') as Difficulty) || 'easy';
  
  const [session, setSession] = useState<PuzzleSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Start game session
  useEffect(() => {
    const startGame = async () => {
      if (!gameId) return;
      
      try {
        const data = await puzzleApi.startGame(gameId, difficulty);
        setSession(data);
        setTimeRemaining(data.timeLimit);
      } catch (error) {
        console.error('Failed to start game:', error);
        navigate('/puzzle');
      } finally {
        setLoading(false);
      }
    };

    startGame();
  }, [gameId, difficulty, navigate]);

  // Timer logic
  useEffect(() => {
    if (!session || isPaused || isCompleted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Time's up - submit as incomplete
          handleGameEnd(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session, isPaused, isCompleted]);

  const handleGameEnd = async (completed: boolean) => {
    if (!gameId || !session) return;
    
    setIsCompleted(true);
    
    try {
      const result = await puzzleApi.finishGame({
        gameId,
        difficulty,
        timeTaken: session.timeLimit - timeRemaining,
        isCompleted: completed,
      });
      
      // Show result modal/page
      console.log('Game result:', result);
    } catch (error) {
      console.error('Failed to submit result:', error);
    }
  };

  const handlePuzzleComplete = () => {
    handleGameEnd(true);
  };

  const handleExit = async () => {
    if (gameId) {
      await puzzleApi.incrementPlayCount(gameId);
    }
    navigate('/');
  };

  if (loading) {
    return <div className="loading">Loading puzzle...</div>;
  }

  if (!session) {
    return <div className="error">Failed to load puzzle</div>;
  }

  return (
    <div className="puzzle-game">
      {/* Game Header */}
      <div className="game-header">
        <ExitButton gameId={gameId!} />
        
        <div className="game-info">
          <span className="difficulty">{difficulty.toUpperCase()}</span>
          <span className="timer">
            ⏱️ {Math.floor(timeRemaining / 60)}:
            {(timeRemaining % 60).toString().padStart(2, '0')}
          </span>
        </div>
        
        <PauseButton
          isPaused={isPaused}
          onTogglePause={() => setIsPaused(!isPaused)}
        />
      </div>

      {/* Puzzle Board */}
      <div className="puzzle-container">
        {/* 
          Implement your puzzle board logic here
          - Use session.puzzleImage untuk gambar
          - Use session.gridSize untuk ukuran grid
          - Implement drag-and-drop untuk pieces
        */}
        <img src={session.puzzleImage} alt="Puzzle" className="puzzle-preview" />
      </div>

      {/* Pause Overlay */}
      <PauseOverlay
        isVisible={isPaused}
        onResume={() => setIsPaused(false)}
        onExit={handleExit}
      />
    </div>
  );
}
```

---

## 👨‍💼 Admin Panel Implementation

### Admin Puzzle List

```typescript
// Page Removed as per requirements
// Management is handled elsewhere or not needed in this specific form.

```

### Create Puzzle Page

```typescript
// src/pages/admin/puzzle/create.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { puzzleApi } from '../../puzzle/services/puzzle.service';
import type { CreatePuzzlePayload } from '../../puzzle/types/puzzle.types';

export default function CreatePuzzle() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreatePuzzlePayload>({
    title: '',
    description: '',
    thumbnail: '',
    image_easy: '',
    image_medium: '',
    image_hard: '',
    time_limit_easy: 300,
    time_limit_medium: 180,
    time_limit_hard: 120,
    is_published: true,
  });

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'thumbnail' | 'image_easy' | 'image_medium' | 'image_hard'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await puzzleApi.uploadImage(file);
      setFormData({ ...formData, [field]: result.imageUrl });
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await puzzleApi.create(formData);
      alert('Puzzle created successfully!');
      navigate('/admin/puzzle');
    } catch (error) {
      console.error('Failed to create puzzle:', error);
      alert('Failed to create puzzle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-puzzle">
      <h1>🧩 Create New Puzzle</h1>

      <form onSubmit={handleSubmit}>
        {/* Basic Info */}
        <div className="form-group">
          <label>Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            required
          />
        </div>

        {/* Thumbnail */}
        <div className="form-group">
          <label>Thumbnail *</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, 'thumbnail')}
          />
          {formData.thumbnail && (
            <img src={formData.thumbnail} alt="Thumbnail" width={100} />
          )}
        </div>

        {/* Puzzle Images by Difficulty */}
        <div className="difficulty-images">
          <h3>Puzzle Images</h3>

          <div className="form-group">
            <label>Easy Image (3x3 Grid) *</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'image_easy')}
            />
            {formData.image_easy && (
              <img src={formData.image_easy} alt="Easy" width={100} />
            )}
          </div>

          <div className="form-group">
            <label>Medium Image (4x4 Grid) *</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'image_medium')}
            />
            {formData.image_medium && (
              <img src={formData.image_medium} alt="Medium" width={100} />
            )}
          </div>

          <div className="form-group">
            <label>Hard Image (5x5 Grid) *</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'image_hard')}
            />
            {formData.image_hard && (
              <img src={formData.image_hard} alt="Hard" width={100} />
            )}
          </div>
        </div>

        {/* Time Limits */}
        <div className="time-limits">
          <h3>Time Limits (in seconds)</h3>

          <div className="form-group">
            <label>Easy Time Limit</label>
            <input
              type="number"
              value={formData.time_limit_easy}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  time_limit_easy: parseInt(e.target.value),
                })
              }
            />
          </div>

          <div className="form-group">
            <label>Medium Time Limit</label>
            <input
              type="number"
              value={formData.time_limit_medium}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  time_limit_medium: parseInt(e.target.value),
                })
              }
            />
          </div>

          <div className="form-group">
            <label>Hard Time Limit</label>
            <input
              type="number"
              value={formData.time_limit_hard}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  time_limit_hard: parseInt(e.target.value),
                })
              }
            />
          </div>
        </div>

        {/* Publish Status */}
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={formData.is_published}
              onChange={(e) =>
                setFormData({ ...formData, is_published: e.target.checked })
              }
            />
            Publish immediately
          </label>
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button type="button" onClick={() => navigate('/admin/puzzle')}>
            Cancel
          </button>
          <button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Puzzle'}
          </button>
        </div>
      </form>
    </div>
  );
}
```

---

## 🔐 Route Protection

Pastikan admin routes dilindungi dengan role checking:

```typescript
// src/components/ProtectedRoute.tsx

import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('USER' | 'ADMIN' | 'SUPER_ADMIN')[];
}

export const ProtectedRoute = ({
  children,
  allowedRoles = [],
}: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
```

### Route Configuration

```typescript
// Di router config


<Route
  path="/admin/puzzle/create"
  element={
    <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
      <CreatePuzzle />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/puzzle/edit/:id"
  element={
    <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
      <EditPuzzle />
    </ProtectedRoute>
  }
/>
```

---

## 📊 API Response Format

Semua response dari backend mengikuti format:

### Success Response
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "status": false,
  "code": 400,
  "message": "Error message here"
}
```

---

## ✅ Checklist Implementation

- [ ] Setup environment variables
- [ ] Create TypeScript interfaces
- [ ] Implement API service layer
- [ ] Create Puzzle Lobby page
- [ ] Create Puzzle Game page with timer
- [ ] Implement Exit Button (with play count increment)
- [ ] Implement Pause Button & Overlay

- [ ] Create Admin Create Puzzle page
- [ ] Create Admin Edit Puzzle page
- [ ] Add route protection for admin pages
- [ ] Style all components
- [ ] Test all CRUD operations
- [ ] Test game flow (start → play → finish)

---

## 📞 Backend API Endpoints Summary

| Method | Endpoint | Auth Required | Role |
|--------|----------|---------------|------|
| GET | `/api/game/game-type/puzzle` | Optional | Public |
| GET | `/api/game/game-type/puzzle/:id` | Optional | Public |
| GET | `/api/game/game-type/puzzle/:id/leaderboard` | No | Public |
| GET | `/api/game/game-type/puzzle/:id/edit` | Yes | ADMIN/SUPER_ADMIN |
| POST | `/api/game/game-type/puzzle` | Yes | ADMIN/SUPER_ADMIN |
| PATCH | `/api/game/game-type/puzzle/:id` | Yes | ADMIN/SUPER_ADMIN |
| DELETE | `/api/game/game-type/puzzle/:id` | Yes | ADMIN/SUPER_ADMIN |
| POST | `/api/game/game-type/puzzle/:id/start` | Optional | Public |
| POST | `/api/game/game-type/puzzle/finish` | Optional | Public |
| POST | `/api/game/game-type/puzzle/upload-image` | Optional | Public |
| POST | `/api/game/play-count` | Optional | Public |

---

**Last Updated:** 2025-12-14
