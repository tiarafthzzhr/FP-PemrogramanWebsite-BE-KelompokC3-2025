# 🧩 INSTRUKSI TEKNIS FRONTEND - PUZZLE GAME (FINAL & COMPLIANT)

> **PERHATIAN**: Dokumen ini berisi aturan WAJIB yang harus dipatuhi. Pelanggaran dapat menyebabkan nilai dikurangi.

---

## ⚠️ ATURAN WAJIB (STRICT RULES)

### 1. Tech Stack (WAJIB)
| Komponen | Teknologi |
|----------|-----------|
| Package Manager | **NPM** |
| Framework | **ReactJS** |
| Language | **TypeScript** |
| Styling | **TailwindCSS** |
| UI Components | **ShadCN** |

### 2. Folder Structure (WAJIB)
- Buat folder baru: `src/pages/puzzle`
- Letakkan **SELURUH** kebutuhan halaman puzzle ke dalam folder tersebut
- **KECUALI** file validation (schema) yang mungkin ada di folder common

### 3. Backend Integration (WAJIB)
- Integrasi **HANYA** ke `http://localhost:4000` (lokal)
- **DILARANG** mengirim request ke backend WordIT production
- Pastikan backend lokal berjalan dengan `bun start:dev`

### 4. Exit Button (WAJIB)
- **HARUS ADA** tombol Exit/Keluar di halaman game
- Saat ditekan, **WAJIB** melakukan:
  1. `POST /api/game/play-count` dengan body `{ game_id: "<id>" }`
  2. Kemudian navigate ke Home Page (`/`)

### 5. Pause Button (WAJIB untuk Time-Based Game)
- Puzzle adalah game **time-based** (ada timer)
- **WAJIB** ada tombol Pause yang:
  - Menghentikan timer sementara
  - Menampilkan overlay "Game Paused"
  - Memiliki tombol Resume untuk melanjutkan

---

## 📂 Struktur Folder yang Benar

```
src/
└── pages/
    └── puzzle/                        # ← FOLDER WAJIB
        ├── index.tsx                  # Halaman utama (jika perlu)
        ├── [id]/
        │   └── index.tsx              # Halaman game (Lobby + Play)
        ├── components/
        │   ├── DifficultySelector.tsx # Pilihan Easy/Medium/Hard
        │   ├── PuzzleBoard.tsx        # Area puzzle (drag & drop)
        │   ├── PuzzlePiece.tsx        # Potongan puzzle
        │   ├── GameTimer.tsx          # Timer countdown
        │   ├── ExitButton.tsx         # ⚠️ WAJIB
        │   ├── PauseButton.tsx        # ⚠️ WAJIB
        │   ├── PauseOverlay.tsx       # Overlay saat pause
        │   └── WinDialog.tsx          # Dialog menang
        ├── hooks/
        │   ├── usePuzzleGame.ts       # Logic game
        │   ├── useGameTimer.ts        # Logic timer + pause
        │   └── usePuzzleApi.ts        # API calls
        └── types.ts                   # TypeScript interfaces
```

---

## 🔄 Alur Game (Game Flow)

### Flow Diagram:
```
┌─────────────────────────────────────────────────────────────┐
│                      HOME PAGE                              │
│  ┌─────────────────────────────────────┐                   │
│  │  [Puzzle Game Card]  → Klik "Main"  │                   │
│  └─────────────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   /puzzle/:id (LOBBY)                       │
│                                                             │
│            "Pilih Tingkat Kesulitan"                        │
│                                                             │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│   │   EASY   │  │  MEDIUM  │  │   HARD   │                 │
│   │   3×3    │  │   4×4    │  │   5×5    │                 │
│   │  5 min   │  │  10 min  │  │  15 min  │                 │
│   │ 🐱Orange │  │ 🐱Grey   │  │ 🐱Black  │                 │
│   └────┬─────┘  └────┬─────┘  └────┬─────┘                 │
│        │             │             │                        │
│        └─────────────┴─────────────┘                        │
│                      │                                      │
│           POST /:id/start { difficulty }                    │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   /puzzle/:id (PLAYING)                     │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐│
│  │[Exit]          Timer: 04:32         [Pause]            ││
│  ├────────────────────────────────────────────────────────┤│
│  │                                                        ││
│  │   ┌─────────────┐          ┌─────────────────────┐    ││
│  │   │ PUZZLE GRID │          │  POTONGAN PUZZLE    │    ││
│  │   │ (Drop Zone) │          │  (Drag dari sini)   │    ││
│  │   └─────────────┘          └─────────────────────┘    ││
│  │                                                        ││
│  └────────────────────────────────────────────────────────┘│
│                                                             │
│  Pause → Tampilkan PauseOverlay                            │
│  Exit  → POST /play-count → Navigate to /                  │
│  Selesai/Timeout → POST /finish → WinDialog                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:4000/api/game/game-type/puzzle
```

### 1. Start Game (PENTING: Kirim Difficulty!)
```http
POST /:id/start
Content-Type: application/json

{
  "difficulty": "easy"  // atau "medium", "hard"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "gameId": "uuid",
    "gameName": "Puzzle Game",
    "gameJson": {
      "title": "Puzzle Game",
      "imageUrl": "uploads/game/puzzle/{id}/easy.png",  // ← BEDA tiap level
      "rows": 3,
      "cols": 3,
      "timeLimitSec": 300
    }
  }
}
```

### 2. Finish Game
```http
POST /finish
Content-Type: application/json

{
  "sessionId": "uuid",
  "gameId": "uuid",
  "moveCount": 25,
  "timeTaken": 120
}
```

### 3. Update Play Count (WAJIB saat Exit)
```http
POST http://localhost:4000/api/game/play-count
Content-Type: application/json

{
  "game_id": "uuid"
}
```

---

## 🔧 CRUD API (Admin Only)

> **PENTING:** Endpoint CRUD hanya bisa diakses oleh user dengan role `ADMIN` atau `SUPER_ADMIN`. Pastikan mengirim token JWT di header.

### Header Authorization (WAJIB untuk CRUD)
```http
Authorization: Bearer <jwt_token>
```

### 1. CREATE - Buat Puzzle Baru
```http
POST /api/game/game-type/puzzle
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

**Request Body (FormData):**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Nama puzzle (max 128 char) |
| `description` | string | ❌ | Deskripsi (max 256 char) |
| `thumbnail_image` | File | ✅ | Gambar thumbnail |
| `puzzle_image` | File | ✅ | Gambar untuk puzzle |
| `is_publish_immediately` | boolean | ❌ | Langsung publish? (default: false) |
| `rows` | number | ❌ | Jumlah baris (2-10, default: 3) |
| `cols` | number | ❌ | Jumlah kolom (2-10, default: 3) |
| `difficulty` | string | ❌ | easy/medium/hard (default: medium) |

**Response:**
```json
{
  "success": true,
  "message": "Puzzle created",
  "data": { "id": "uuid-of-new-puzzle" }
}
```

### 2. READ - Ambil Daftar Puzzle
```http
GET /api/game/game-type/puzzle
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Puzzle Game",
      "description": "Susun potongan gambar...",
      "thumbnail_image": "uploads/game/puzzle/.../thumbnail.png",
      "game_json": { ... },
      "total_played": 10,
      "created_at": "2024-12-14T..."
    }
  ]
}
```

### 3. READ - Detail Puzzle
```http
GET /api/game/game-type/puzzle/:id
```

### 4. READ - Detail untuk Edit (Admin)
```http
GET /api/game/game-type/puzzle/:id/edit
Authorization: Bearer <token>
```

### 5. UPDATE - Edit Puzzle
```http
PATCH /api/game/game-type/puzzle/:id
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

**Request Body (FormData) - Semua Optional:**
| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Nama baru |
| `description` | string | Deskripsi baru |
| `thumbnail_image` | File | Thumbnail baru |
| `puzzle_image` | File | Gambar puzzle baru |
| `is_publish` | boolean | Status publish |
| `rows` | number | Jumlah baris baru |
| `cols` | number | Jumlah kolom baru |
| `difficulty` | string | Difficulty baru |

**Response:**
```json
{
  "success": true,
  "message": "Puzzle updated",
  "data": { "id": "uuid" }
}
```

### 6. DELETE - Hapus Puzzle
```http
DELETE /api/game/game-type/puzzle/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Puzzle deleted successfully",
  "data": { "id": "uuid-deleted" }
}
```

---

## 💻 Contoh Kode CRUD (React)

### Service untuk CRUD
```tsx
// hooks/usePuzzleApi.ts

const API_URL = 'http://localhost:4000/api/game/game-type/puzzle';

export const puzzleCrudApi = {
  // CREATE
  create: async (formData: FormData, token: string) => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
    return res.json();
  },

  // READ LIST
  getList: async () => {
    const res = await fetch(API_URL);
    return res.json();
  },

  // READ DETAIL
  getById: async (id: string) => {
    const res = await fetch(`${API_URL}/${id}`);
    return res.json();
  },

  // READ FOR EDIT
  getForEdit: async (id: string, token: string) => {
    const res = await fetch(`${API_URL}/${id}/edit`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },

  // UPDATE
  update: async (id: string, formData: FormData, token: string) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
    return res.json();
  },

  // DELETE
  delete: async (id: string, token: string) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  }
};
```

### Form Create Puzzle (Contoh)
```tsx
// components/CreatePuzzleForm.tsx
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { puzzleCrudApi } from '@/pages/puzzle/hooks/usePuzzleApi';

export function CreatePuzzleForm() {
  const { token } = useAuth();
  const [name, setName] = useState('');
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [puzzleImage, setPuzzleImage] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', name);
    formData.append('difficulty', 'medium');
    if (thumbnail) formData.append('thumbnail_image', thumbnail);
    if (puzzleImage) formData.append('puzzle_image', puzzleImage);

    const result = await puzzleCrudApi.create(formData, token);
    console.log('Created:', result);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="text" 
        placeholder="Nama Puzzle" 
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input 
        type="file" 
        accept="image/*"
        onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
      />
      <input 
        type="file" 
        accept="image/*"
        onChange={(e) => setPuzzleImage(e.target.files?.[0] || null)}
      />
      <button type="submit">Buat Puzzle</button>
    </form>
  );
}
```

---

## 🖥️ IMPLEMENTASI HALAMAN CRUD (Admin Panel)

> **WAJIB:** Tim FE harus menyediakan halaman untuk Admin mengelola puzzle (Create, Edit, Delete).

### Struktur Folder CRUD

```
src/
└── pages/
    └── puzzle/
        ├── admin/                          # ← FOLDER ADMIN CRUD
        │   ├── index.tsx                   # Daftar puzzle (List)
        │   ├── create.tsx                  # Form buat puzzle baru
        │   └── edit/
        │       └── [id].tsx                # Form edit puzzle
        └── components/
            ├── PuzzleForm.tsx              # Form reusable (Create/Edit)
            ├── PuzzleList.tsx              # Tabel daftar puzzle
            ├── PuzzleCard.tsx              # Card untuk list
            └── DeleteConfirmDialog.tsx     # Konfirmasi hapus
```

### Routes yang Diperlukan

| Path | Komponen | Fungsi |
|------|----------|--------|
| `/puzzle/admin` | `admin/index.tsx` | Daftar semua puzzle (Admin) |
| `/puzzle/admin/create` | `admin/create.tsx` | Form buat puzzle baru |
| `/puzzle/admin/edit/:id` | `admin/edit/[id].tsx` | Form edit puzzle |

---

### 1. Halaman Daftar Puzzle (Admin)

```tsx
// pages/puzzle/admin/index.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { puzzleCrudApi } from '../hooks/usePuzzleApi';
import { DeleteConfirmDialog } from '../components/DeleteConfirmDialog';
import { useAuth } from '@/hooks/useAuth';

interface Puzzle {
  id: string;
  name: string;
  description: string;
  thumbnail_image: string;
  total_played: number;
}

export default function PuzzleAdminList() {
  const { token } = useAuth();
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchPuzzles = async () => {
    setLoading(true);
    const res = await puzzleCrudApi.getList();
    setPuzzles(res.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPuzzles();
  }, []);

  const handleDelete = async () => {
    if (!deleteId || !token) return;
    await puzzleCrudApi.delete(deleteId, token);
    setDeleteId(null);
    fetchPuzzles(); // Refresh list
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Kelola Puzzle</h1>
        <Link to="/puzzle/admin/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Buat Puzzle Baru
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {puzzles.map((puzzle) => (
          <Card key={puzzle.id} className="p-4">
            <img 
              src={`http://localhost:4000/${puzzle.thumbnail_image}`}
              alt={puzzle.name}
              className="w-full h-40 object-cover rounded mb-3"
            />
            <h3 className="font-bold text-lg">{puzzle.name}</h3>
            <p className="text-gray-500 text-sm mb-3">{puzzle.description}</p>
            <p className="text-sm">Dimainkan: {puzzle.total_played}x</p>
            
            <div className="flex gap-2 mt-4">
              <Link to={`/puzzle/admin/edit/${puzzle.id}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <Button 
                variant="destructive" 
                onClick={() => setDeleteId(puzzle.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Dialog Konfirmasi Hapus */}
      <DeleteConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Hapus Puzzle?"
        description="Puzzle yang dihapus tidak dapat dikembalikan."
      />
    </div>
  );
}
```

---

### 2. Halaman Buat Puzzle Baru

```tsx
// pages/puzzle/admin/create.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { puzzleCrudApi } from '../hooks/usePuzzleApi';

export default function CreatePuzzlePage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    difficulty: 'medium',
    rows: 4,
    cols: 4,
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [puzzleImageFile, setPuzzleImageFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!thumbnailFile || !puzzleImageFile) {
      setError('Thumbnail dan gambar puzzle wajib diisi');
      setLoading(false);
      return;
    }

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('difficulty', formData.difficulty);
    data.append('rows', formData.rows.toString());
    data.append('cols', formData.cols.toString());
    data.append('thumbnail_image', thumbnailFile);
    data.append('puzzle_image', puzzleImageFile);
    data.append('is_publish_immediately', 'true');

    try {
      const result = await puzzleCrudApi.create(data, token!);
      if (result.success) {
        navigate('/puzzle/admin');
      } else {
        setError(result.message || 'Gagal membuat puzzle');
      }
    } catch (err) {
      setError('Terjadi kesalahan');
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Buat Puzzle Baru</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Nama Puzzle *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Contoh: Puzzle Kucing Lucu"
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Deskripsi</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Deskripsi singkat puzzle"
          />
        </div>

        <div>
          <Label htmlFor="difficulty">Tingkat Kesulitan</Label>
          <Select
            value={formData.difficulty}
            onValueChange={(val) => setFormData({ ...formData, difficulty: val })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy (3x3)</SelectItem>
              <SelectItem value="medium">Medium (4x4)</SelectItem>
              <SelectItem value="hard">Hard (5x5)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="thumbnail">Thumbnail *</Label>
            <Input
              id="thumbnail"
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
              required
            />
          </div>
          <div>
            <Label htmlFor="puzzleImage">Gambar Puzzle *</Label>
            <Input
              id="puzzleImage"
              type="file"
              accept="image/*"
              onChange={(e) => setPuzzleImageFile(e.target.files?.[0] || null)}
              required
            />
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Batal
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Menyimpan...' : 'Simpan Puzzle'}
          </Button>
        </div>
      </form>
    </div>
  );
}
```

---

### 3. Halaman Edit Puzzle

```tsx
// pages/puzzle/admin/edit/[id].tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { puzzleCrudApi } from '../../hooks/usePuzzleApi';

export default function EditPuzzlePage() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [puzzleImageFile, setPuzzleImageFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !token) return;
      const res = await puzzleCrudApi.getForEdit(id, token);
      if (res.data) {
        setFormData({
          name: res.data.name || '',
          description: res.data.description || '',
        });
      }
      setLoading(false);
    };
    fetchData();
  }, [id, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    if (thumbnailFile) data.append('thumbnail_image', thumbnailFile);
    if (puzzleImageFile) data.append('puzzle_image', puzzleImageFile);

    await puzzleCrudApi.update(id!, data, token!);
    navigate('/puzzle/admin');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Edit Puzzle</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Nama Puzzle</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="description">Deskripsi</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div>
          <Label>Thumbnail Baru (opsional)</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
          />
        </div>

        <div>
          <Label>Gambar Puzzle Baru (opsional)</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setPuzzleImageFile(e.target.files?.[0] || null)}
          />
        </div>

        <div className="flex gap-4 pt-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Batal
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Menyimpan...' : 'Update Puzzle'}
          </Button>
        </div>
      </form>
    </div>
  );
}
```

---

### 4. Dialog Konfirmasi Hapus

```tsx
// components/DeleteConfirmDialog.tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
}

export function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
}: DeleteConfirmDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600">
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

---

## ✅ Checklist CRUD UI

- [ ] Halaman `/puzzle/admin` - List semua puzzle
- [ ] Halaman `/puzzle/admin/create` - Form create
- [ ] Halaman `/puzzle/admin/edit/:id` - Form edit
- [ ] Tombol Delete dengan konfirmasi
- [ ] File upload untuk thumbnail & gambar puzzle
- [ ] Loading states
- [ ] Error handling
- [ ] Refresh list setelah CRUD
- [ ] Hanya tampil untuk user ADMIN/SUPER_ADMIN

---

## 👤 Authorization di Frontend

```tsx
// Contoh proteksi route admin
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  // Hanya ADMIN dan SUPER_ADMIN yang bisa akses
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

// Penggunaan di router:
<Route 
  path="/puzzle/admin/*" 
  element={
    <AdminRoute>
      <PuzzleAdminRoutes />
    </AdminRoute>
  } 
/>
```


## 💻 Contoh Kode (Sesuai Aturan)

### Exit Button (WAJIB)
```tsx
// components/ExitButton.tsx
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface ExitButtonProps {
  gameId: string;
  onBeforeExit?: () => void;
}

export function ExitButton({ gameId, onBeforeExit }: ExitButtonProps) {
  const navigate = useNavigate();

  const handleExit = async () => {
    // 1. Pause timer dulu (optional)
    onBeforeExit?.();

    // 2. ⚠️ WAJIB: POST play-count
    try {
      await fetch('http://localhost:4000/api/game/play-count', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_id: gameId })
      });
    } catch (error) {
      console.error('Failed to update play count:', error);
    }

    // 3. Navigate ke Home
    navigate('/');
  };

  return (
    <Button variant="destructive" onClick={handleExit}>
      <LogOut className="w-4 h-4 mr-2" />
      Keluar
    </Button>
  );
}
```

### Pause Button (WAJIB)
```tsx
// components/PauseButton.tsx
import { Button } from '@/components/ui/button';
import { Pause, Play } from 'lucide-react';

interface PauseButtonProps {
  isPaused: boolean;
  onToggle: () => void;
}

export function PauseButton({ isPaused, onToggle }: PauseButtonProps) {
  return (
    <Button variant="secondary" onClick={onToggle}>
      {isPaused ? (
        <>
          <Play className="w-4 h-4 mr-2" />
          Lanjutkan
        </>
      ) : (
        <>
          <Pause className="w-4 h-4 mr-2" />
          Pause
        </>
      )}
    </Button>
  );
}
```

### Pause Overlay (WAJIB)
```tsx
// components/PauseOverlay.tsx
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

interface PauseOverlayProps {
  isVisible: boolean;
  onResume: () => void;
}

export function PauseOverlay({ isVisible, onResume }: PauseOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Game Paused</h2>
        <p className="text-gray-300 mb-6">Timer dihentikan sementara</p>
        <Button onClick={onResume} size="lg">
          <Play className="w-5 h-5 mr-2" />
          Lanjutkan Main
        </Button>
      </div>
    </div>
  );
}
```

---

## ⚙️ Konfigurasi Per Difficulty

| Difficulty | Grid | Potongan | Waktu | Gambar Kucing |
|------------|------|----------|-------|----------------|
| `easy`     | 3×3  | 9        | 5 min | Orange Tabby   |
| `medium`   | 4×4  | 16       | 10 min| Grey & White   |
| `hard`     | 5×5  | 25       | 15 min| Black Cat      |

**Gambar berbeda untuk setiap level!** Backend sudah menyediakan URL gambar yang berbeda di response `gameJson.imageUrl`.

---

## ✅ Checklist Final

### Struktur & Kode
- [ ] Folder `src/pages/puzzle` sudah dibuat
- [ ] Semua komponen ada di dalam folder puzzle
- [ ] Menggunakan NPM + ReactJS + TypeScript + TailwindCSS + ShadCN

### Fitur Wajib
- [ ] Exit Button ada dan berfungsi (POST play-count)
- [ ] Pause Button ada dan berfungsi
- [ ] Pause Overlay muncul saat pause
- [ ] Timer berjalan dan bisa di-pause

### API Integration
- [ ] Hanya ke localhost:4000 (bukan production)
- [ ] Start game mengirim difficulty
- [ ] Finish game mengirim hasil

### UI/UX
- [ ] 1 Card Puzzle di Home Page
- [ ] Pilihan Easy/Medium/Hard di dalam halaman
- [ ] Gambar kucing berbeda tiap level
- [ ] Responsive design

---

## 📞 Kontak Backend

**Server:** `http://localhost:4000`

Untuk menjalankan backend:
```bash
cd backend
bun start:dev
```

Good luck! 🚀
