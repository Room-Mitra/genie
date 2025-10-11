// app/blog/[slug]/page.jsx
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getAllPostSlugs, getPostBySlug } from '@/lib/blog';
import RequestDemoForm from '@/components/RequestDemoForm';
import Footer from '@/components/Footer';

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = params;
  try {
    const post = await getPostBySlug(slug);
    return {
      title: post.title,
      description: post.description || `${post.title} by ${post.author}`,
      openGraph: {
        title: post.title,
        description: post.description || undefined,
        images: post.hero ? [{ url: post.hero }] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.description || undefined,
        images: post.hero ? [post.hero] : undefined,
      },
    };
  } catch {
    return { title: 'Post not found' };
  }
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;

  let post;
  try {
    post = await getPostBySlug(slug);
  } catch {
    notFound();
  }

  return (
    <>
      <main className="mx-auto max-w-3xl px-4 py-10 mt-10">
        <article>
          <header className="mb-6">
            <h1 className="text-3xl font-bold">{post.title}</h1>
            <p className="text-sm text-gray-600 mt-2">
              By {post.author} on {new Date(post.date).toLocaleDateString()}
            </p>
          </header>

          {post.hero && (
            <div className="mb-8">
              <Image
                src={post.hero}
                alt={post.title}
                width={1200}
                height={630}
                className="w-full h-auto rounded-xl"
                priority
              />
            </div>
          )}

          <div
            className="prose prose-lg prose-slate max-w-none
             prose-ol:list-decimal prose-li:my-2 prose-li:leading-relaxed
             marker:font-semibold"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />
        </article>
      </main>
      <div className="mt-10">
        <hr className="border-gray-300 max-w-3xl mx-auto" />
        <RequestDemoForm />
      </div>
      <Footer />
    </>
  );
}
