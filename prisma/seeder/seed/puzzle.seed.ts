import path from 'node:path';

import { type Prisma, PrismaClient } from '@prisma/client';
import { file, resolveSync } from 'bun';
import csv from 'csvtojson';

const prisma = new PrismaClient();

interface IPuzzleCsv {
  id: string;
  game_template_id: string;
  creator_id: string;
  name: string;
  description: string;
  thumbnail_image: string;
  puzzle_image: string;
  is_publish_immediately: string;
  rows: string;
  cols: string;
  difficulty: string;
}

interface IPuzzleJson {
  title: string;
  description: string;
  imageUrl: string;
  thumbnail: string;
  rows: number;
  cols: number;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimitSec: number;
}

function getTimeLimitByDifficulty(difficulty: string): number {
  switch (difficulty) {
    case 'easy': {
      return 300;
    } // 5 minutes

    case 'medium': {
      return 600;
    } // 10 minutes

    case 'hard': {
      return 900;
    } // 15 minutes

    default: {
      return 600;
    }
  }
}

export const puzzleSeed = async () => {
  try {
    console.log('🧩 Seed puzzle game');

    const datas: IPuzzleCsv[] = await csv().fromFile(
      resolveSync('../data/' + 'puzzle-games.data.csv', __dirname),
    );

    for (const data of datas) {
      const thumbnailPath = await uploadImage(
        data.id,
        data.thumbnail_image,
        'thumbnail',
      );

      const puzzleImagePath = await uploadImage(
        data.id,
        data.puzzle_image,
        'puzzle',
      );

      const gameJson: IPuzzleJson = {
        title: data.name,
        description: data.description,
        imageUrl: puzzleImagePath,
        thumbnail: thumbnailPath,
        rows: Number.parseInt(data.rows),
        cols: Number.parseInt(data.cols),
        difficulty: data.difficulty as 'easy' | 'medium' | 'hard',
        timeLimitSec: getTimeLimitByDifficulty(data.difficulty),
      };

      await prisma.games.upsert({
        where: { id: data.id },
        create: {
          id: data.id,
          name: data.name,
          description: data.description,
          game_template_id: data.game_template_id,
          creator_id: data.creator_id,
          thumbnail_image: thumbnailPath,
          is_published: data.is_publish_immediately === 'true',
          game_json: gameJson as unknown as Prisma.InputJsonValue,
        },
        update: {
          name: data.name,
          description: data.description,
          game_template_id: data.game_template_id,
          creator_id: data.creator_id,
          thumbnail_image: thumbnailPath,
          is_published: data.is_publish_immediately === 'true',
          game_json: gameJson as unknown as Prisma.InputJsonValue,
        },
      });
    }

    console.log(`   ✅ Seeded ${datas.length} puzzle games`);
  } catch (error) {
    console.log(`❌ Error in puzzle game. ${error}`);

    throw error;
  }
};

async function uploadImage(
  puzzleId: string,
  imageName: string,
  imageType: string,
) {
  try {
    const picture = file(
      resolveSync('../data/' + 'images/' + imageName, __dirname),
    );

    const picturePath = `uploads/game/puzzle/${puzzleId}/${imageType}${path.extname(picture.name || '.jpg')}`;

    await Bun.write(`./${picturePath}`, picture, {
      createPath: true,
    });

    return picturePath;
  } catch {
    // If image doesn't exist, use a placeholder path
    console.log(`   ⚠️  Image ${imageName} not found, using placeholder`);

    return `uploads/game/puzzle/${puzzleId}/${imageType}.jpg`;
  }
}
