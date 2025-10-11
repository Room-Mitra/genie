// app/blog/page.jsx
import Link from 'next/link';
import Image from 'next/image';
import { getAllPostsMeta } from '@/lib/blog';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Blog',
  description: 'All posts',
};

export default async function BlogIndexPage() {
  const posts = await getAllPostsMeta();

  return (
    <>
      <main className="mx-auto max-w-5xl px-4 py-10 mt-10">
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
