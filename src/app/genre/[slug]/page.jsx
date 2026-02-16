// app/genre/[slug]/page.jsx
import { Suspense } from 'react'
import GenreClient from './GenreClient'
import Loading from './loading'

async function getAnimeByGenre(slug, page = 1) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    // 👇 UBAH KE /anime/genre/[slug]
    const response = await fetch(`${apiUrl}/anime/genre/${slug}?page=${page}`, {
      next: { revalidate: 3600 }
    });
    
    if (!response.ok) {
      throw new Error('Gagal mengambil data anime');
    }
    
    const result = await response.json();
    return {
      animes: result.animes || [],
      pagination: result.pagination || { hasNext: false, hasPrev: false }
    };
  } catch (error) {
    console.error("Error fetching anime by genre:", error);
    return { animes: [], pagination: { hasNext: false, hasPrev: false } };
  }
}

async function getGenres() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${apiUrl}/genres`, {
      next: { revalidate: 86400 }
    });
    
    if (!response.ok) {
      return [];
    }
    
    const result = await response.json();
    return result.genres || [];
  } catch (error) {
    return [];
  }
}

export default async function GenrePage({ params: paramsPromise, searchParams }) {
  const params = await paramsPromise;
  const { slug } = params;
  const currentPage = parseInt(searchParams.page) || 1;

  const resultPromise = getAnimeByGenre(slug, currentPage);
  const allGenresPromise = getGenres();

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<Loading />}>
          <GenreClient 
            resultPromise={resultPromise}
            allGenresPromise={allGenresPromise}
            slug={slug}
            currentPage={currentPage}
          />
        </Suspense>
      </div>
    </div>
  );
}
