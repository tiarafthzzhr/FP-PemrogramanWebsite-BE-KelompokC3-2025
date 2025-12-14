# 📋 Frontend Instructions: Puzzle CRUD (Admin Panel)

## Overview

Dokumen ini berisi instruksi untuk mengimplementasikan **CRUD Puzzle Game** di Admin Panel.

---

## 🔐 Permissions

| Action | Role yang Bisa Akses |
|--------|----------------------|
| **Create** | `ADMIN`, `SUPER_ADMIN` |
| **Read** | Semua (public) |
| **Update** | `ADMIN`, `SUPER_ADMIN` |
| **Delete** | `ADMIN`, `SUPER_ADMIN` |

---

## 📝 TypeScript Interfaces

```typescript
// types/puzzle.types.ts

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

export interface CreatePuzzlePayload {
  title: string;
  description: string;
  thumbnail: string;
  image_easy: string;
  image_medium: string;
  image_hard: string;
  time_limit_easy?: number;    // default: 300 (5 menit)
  time_limit_medium?: number;  // default: 180 (3 menit)
  time_limit_hard?: number;    // default: 120 (2 menit)
  is_published?: boolean;      // default: true
}

export interface UpdatePuzzlePayload {
  title?: string;
  description?: string;
  thumbnail?: string;
  image_easy?: string;
  image_medium?: string;
  image_hard?: string;
  time_limit_easy?: number;
  time_limit_medium?: number;
  time_limit_hard?: number;
  is_published?: boolean;
}
```

---

## 🔌 API Service Layer

```typescript
// services/puzzle.service.ts

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const puzzleApi = {
  // ============ READ ============
  
  /** Get all puzzles */
  getAll: async (): Promise<PuzzleGame[]> => {
    const response = await axios.get(
      `${API_BASE_URL}/api/game/game-type/puzzle`,
      { headers: getAuthHeader() }
    );
    return response.data.data;
  },

  /** Get puzzle by ID */
  getById: async (gameId: string): Promise<PuzzleGame> => {
    const response = await axios.get(
      `${API_BASE_URL}/api/game/game-type/puzzle/${gameId}`,
      { headers: getAuthHeader() }
    );
    return response.data.data;
  },

  /** Get puzzle for editing (admin only) */
  getForEdit: async (gameId: string): Promise<PuzzleGame> => {
    const response = await axios.get(
      `${API_BASE_URL}/api/game/game-type/puzzle/${gameId}/edit`,
      { headers: getAuthHeader() }
    );
    return response.data.data;
  },

  // ============ CREATE ============

  /** Create new puzzle (admin only) */
  create: async (payload: CreatePuzzlePayload): Promise<PuzzleGame> => {
    const response = await axios.post(
      `${API_BASE_URL}/api/game/game-type/puzzle`,
      payload,
      { headers: getAuthHeader() }
    );
    return response.data.data;
  },

  /** Upload image untuk puzzle */
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

  // ============ UPDATE ============

  /** Update puzzle (admin only) */
  update: async (gameId: string, payload: UpdatePuzzlePayload): Promise<PuzzleGame> => {
    const response = await axios.patch(
      `${API_BASE_URL}/api/game/game-type/puzzle/${gameId}`,
      payload,
      { headers: getAuthHeader() }
    );
    return response.data.data;
  },

  // ============ DELETE ============

  /** Delete puzzle (admin only) */
  delete: async (gameId: string): Promise<void> => {
    await axios.delete(
      `${API_BASE_URL}/api/game/game-type/puzzle/${gameId}`,
      { headers: getAuthHeader() }
    );
  },
};
```

---

## 📊 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/game/game-type/puzzle` | Get all puzzles | Optional |
| `GET` | `/api/game/game-type/puzzle/:id` | Get puzzle by ID | Optional |
| `GET` | `/api/game/game-type/puzzle/:id/edit` | Get puzzle for edit | Admin |
| `POST` | `/api/game/game-type/puzzle` | Create puzzle | Admin |
| `POST` | `/api/game/game-type/puzzle/upload-image` | Upload image | Optional |
| `PATCH` | `/api/game/game-type/puzzle/:id` | Update puzzle | Admin |
| `DELETE` | `/api/game/game-type/puzzle/:id` | Delete puzzle | Admin |

---

## 📄 Contoh Request/Response

### CREATE - Request Body

```json
POST /api/game/game-type/puzzle
Authorization: Bearer <token>

{
  "title": "Animal Puzzle",
  "description": "Susun gambar hewan dengan benar!",
  "thumbnail": "https://example.com/thumbnail.jpg",
  "image_easy": "https://example.com/easy.jpg",
  "image_medium": "https://example.com/medium.jpg",
  "image_hard": "https://example.com/hard.jpg",
  "time_limit_easy": 300,
  "time_limit_medium": 180,
  "time_limit_hard": 120,
  "is_published": true
}
```

### UPDATE - Request Body

```json
PATCH /api/game/game-type/puzzle/:game_id
Authorization: Bearer <token>

{
  "title": "Animal Puzzle Updated",
  "time_limit_easy": 360
}
```

### Response Format

```json
// Success
{
  "success": true,
  "statusCode": 200,
  "message": "Puzzle created",
  "data": { ... }
}

// Error
{
  "status": false,
  "code": 400,
  "message": "Error message"
}
```

---

## 🎯 Create Puzzle dengan Satu Difficulty

Backend **sudah mendukung** pembuatan puzzle dengan **satu difficulty saja** (tidak harus 3 sekaligus).

### Schema yang Digunakan Backend

```typescript
CreatePuzzleSchema = {
  name: string,                    // ✅ Wajib - Nama puzzle
  description?: string,            // ❌ Optional - Deskripsi
  thumbnail_image: File,           // ✅ Wajib - Gambar thumbnail
  files_to_upload: File[],         // ✅ Wajib - Array berisi 1 gambar puzzle
  difficulty: 'easy' | 'medium' | 'hard',  // ✅ Default: 'medium'
  rows?: number,                   // ❌ Optional - Default: 3
  cols?: number,                   // ❌ Optional - Default: 3
  is_publish_immediately?: boolean // ❌ Optional - Default: false
}
```

### Tabel Field

| Field | Required? | Default | Keterangan |
|-------|-----------|---------|------------|
| `name` | ✅ Wajib | - | Nama puzzle (max 128 char) |
| `description` | ❌ Optional | - | Deskripsi (max 256 char) |
| `thumbnail_image` | ✅ Wajib | - | File gambar thumbnail |
| `files_to_upload` | ✅ Wajib | - | **Array dengan 1 file gambar puzzle** |
| `difficulty` | ❌ Optional | `medium` | Pilih: `easy`, `medium`, `hard` |
| `rows` | ❌ Optional | `3` | Jumlah baris grid (2-10) |
| `cols` | ❌ Optional | `3` | Jumlah kolom grid (2-10) |
| `is_publish_immediately` | ❌ Optional | `false` | Langsung publish? |

### Contoh Implementasi Form (FE)

```typescript
// CreatePuzzleForm.tsx

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const formData = new FormData();
  
  // Required fields
  formData.append('name', 'Animal Puzzle');
  formData.append('thumbnail_image', thumbnailFile);  // File object
  formData.append('files_to_upload', puzzleImageFile); // Append ke array files_to_upload
  
  // Optional - pilih salah satu difficulty
  formData.append('difficulty', 'easy');  // 'easy' | 'medium' | 'hard'
  
  // Optional - ukuran grid
  formData.append('rows', '3');
  formData.append('cols', '3');
  
  // Optional fields
  formData.append('description', 'Susun gambar hewan!');
  formData.append('is_publish_immediately', 'true');

  try {
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
    console.log('Puzzle created:', response.data);
  } catch (error) {
    console.error('Failed to create puzzle:', error);
  }
};
```

### Contoh Form UI

```tsx
<form onSubmit={handleSubmit}>
  {/* Nama */}
  <input 
    type="text" 
    name="name" 
    placeholder="Nama Puzzle" 
    required 
  />
  
  {/* Deskripsi */}
  <textarea 
    name="description" 
    placeholder="Deskripsi (optional)" 
  />
  
  {/* Thumbnail */}
  <input 
    type="file" 
    name="thumbnail_image" 
    accept="image/*" 
    required 
  />
  
  {/* Gambar Puzzle (1 saja) */}
  <input 
    type="file" 
    name="files_to_upload" 
    accept="image/*" 
    required 
  />
  
  {/* Pilih Difficulty */}
  <select name="difficulty">
    <option value="easy">😊 Easy (3x3)</option>
    <option value="medium" selected>🤔 Medium (4x4)</option>
    <option value="hard">😤 Hard (5x5)</option>
  </select>
  
  {/* Grid Size (optional) */}
  <input type="number" name="rows" min="2" max="10" defaultValue="3" />
  <input type="number" name="cols" min="2" max="10" defaultValue="3" />
  
  {/* Publish */}
  <label>
    <input type="checkbox" name="is_publish_immediately" />
    Publish langsung
  </label>
  
  <button type="submit">Create Puzzle</button>
</form>
```

### Perbedaan dengan 3 Difficulty

| Mode | Field yang Dikirim |
|------|-------------------|
| **1 Difficulty** | `files_to_upload` + `difficulty` |
| **3 Difficulty** | `image_easy` + `image_medium` + `image_hard` |

> ⚠️ **Note:** Saat ini backend hanya mendukung **1 difficulty per puzzle**. Jika ingin puzzle dengan 3 difficulty dalam 1 game, perlu modifikasi BE.

---

## ✅ Checklist

- [ ] Setup API service dengan axios
- [ ] Buat halaman Admin Puzzle List
- [ ] Buat halaman Create Puzzle dengan form
- [ ] Buat halaman Edit Puzzle
- [ ] Implementasi upload image
- [ ] Implementasi delete dengan konfirmasi
- [ ] Tambah route protection untuk admin only
- [ ] Handle loading & error states

---

**Last Updated:** 2025-12-14
