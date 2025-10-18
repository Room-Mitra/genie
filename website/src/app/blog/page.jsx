// app/blog/page.jsx
import Link from 'next/link';
import Image from 'next/image';
import { getAllPostsMeta } from '@/lib/blog';
import Footer from '@/components/Footer';
import { absoluteUrl } from '@/lib/urls';

export const metadata = {
  title: 'Blog',
  description: 'All posts',
  keywords:
    'hotel automation, in-room assistant, hospitality tech, voice assistant, Room Mitra, hotel guest experience',
  authors: [{ name: 'Room Mitra' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Room Mitra | Blog',
    description: 'How tehnology and design are shaping the modern guest experience.',
    url: absoluteUrl('/blog'),
    siteName: 'Room Mitra',
    images: [{ url: absoluteUrl('/blog/post-1.png') }],
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@RoomMitra',
    creator: '@RoomMitra',
    title: 'Room Mitra | Blog',
    description: 'How tehnology and design are shaping the modern guest experience.',
    image: absoluteUrl('/room-mitra-logo.png'),
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default async function BlogIndexPage() {
  const posts = await getAllPostsMeta();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    url: absoluteUrl('/blog'),
    name: 'Room Mitra Blog',
    blogPost: posts.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      url: absoluteUrl(`/blog/${p.slug}`),
      datePublished: new Date(p.date).toISOString(),
      author: { '@type': 'Person', name: p.author },
      image: p.hero ? absoluteUrl(p.hero) : undefined,
    })),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': absoluteUrl('/blog'),
    },
  };

  // Optional ItemList for rich results
  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: posts.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: absoluteUrl(`/blog/${p.slug}`),
    })),
  };

  return (
    <>
      <main className="mx-auto max-w-5xl px-4 py-10 mt-10">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
        />
        <h1 className="text-3xl font-bold mb-6 text-center">Hospitality Reimagined</h1>
        <p className="text-center text-gray-600 mb-12">
          How technology and design are shaping the modern guest experience.
        </p>

        {posts.length === 0 && <p className="text-gray-500">No posts yet.</p>}

        <ul className="grid gap-8 sm:grid-cols-3">
          {posts.map((post) => (
            <li key={post.slug} className="border border-gray-400 rounded-xl overflow-hidden">
              {post.hero && (
                <Link href={`/blog/${post.slug}`}>
                  <Image
                    src={post.hero}
                    alt={post.title}
                    width={1200}
                    height={630}
                    className="w-full h-56 object-cover"
                    priority={false}
                  />
                </Link>
              )}

              <div className="p-5">
                <h2 className="text-xl font-semibold">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  By {post.author} on {new Date(post.date).toLocaleDateString()}
                </p>
                {post.description && <p className="text-gray-700 mt-3">{post.description}</p>}
                <Link
                  className="inline-block mt-4 text-blue-600 hover:underline"
                  href={`/blog/${post.slug}`}
                >
                  Read more →
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </>
  );
}
