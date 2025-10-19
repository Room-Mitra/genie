import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';

marked.setOptions({
  gfm: true,
  smartLists: true,
});

const BLOG_DIR = path.join(process.cwd(), 'src', 'content', 'blog');

export async function getAllPostSlugs() {
  const files = await fs.readdir(BLOG_DIR);
  return files.filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, ''));
}

export async function getAllPostsMeta() {
  const files = await fs.readdir(BLOG_DIR);
  const posts = [];

  for (const file of files) {
    if (!file.endsWith('.md')) continue;
    const fullPath = path.join(BLOG_DIR, file);
    const raw = await fs.readFile(fullPath, 'utf8');
    const { data } = matter(raw);

    // Basic validation with sensible defaults
    posts.push({
      title: data.title ?? file,
      slug: data.slug ?? file.replace(/\.md$/, ''),
      author: data.author ?? 'Unknown',
      date: data.date ?? '1970-01-01',
      hero: data.hero ?? null,
      description: data.description ?? '',
    });
  }

  // Newest first
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  return posts;
}

export async function getPostBySlug(slug) {
  const fullPath = path.join(BLOG_DIR, `${slug}.md`);
  const raw = await fs.readFile(fullPath, 'utf8');
  const { data, content } = matter(raw);

  const html = marked.parse(content);

  return {
    title: data.title ?? slug,
    slug: data.slug ?? slug,
    author: data.author ?? 'Unknown',
    date: data.date ?? '1970-01-01',
    hero: data.hero ?? null,
    description: data.description ?? '',
    html,
  };
}
