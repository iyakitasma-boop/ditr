// app/genres/page.js
import { Suspense } from 'react'
import GenresClient from './GenresClient'
import Loading from './loading'

async function getGenres() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${apiUrl}/genres`, {
      next: { revalidate: 86400 }
    });
    
    if (!response.ok) {
      throw new Error('Gagal mengambil data genres');
    }
    
    const result = await response.json();
    return result.genres || [];
  } catch (error) {
    console.error("Error fetching genres:", error);
    return [];
  }
}

async function getSampleAnimeForGenre(slug) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${apiUrl}/genre/${slug}?page=1`, {
      next: { revalidate: 86400 }
    });
    
    if (!response.ok) {
      return null;
    }
    
    const result = await response.json();
    return result.animes?.[0]?.poster || null;
  } catch (error) {
    return null;
  }
}

export default async function GenresPage() {
  const genres = await getGenres();

  const genresPromise = Promise.all(
    genres.map(async (genre) => {
      const image = await getSampleAnimeForGenre(genre.slug);
      return { ...genre, image };
    })
  );

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<Loading />}>
          <GenresClient genresPromise={genresPromise} />
        </Suspense>
      </div>
    </div>
  );
}
