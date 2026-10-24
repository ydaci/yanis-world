
import { db } from '@/lib/supabase';
import {
    demoPosts,
    isConfigured,
    type Language,
    type Post,
    type Comment,
} from '@/lib/config';

const names: Record<string, Language> = {
    japan: 'japan',
    china: 'china',
    korea: 'korea',
};

// Conversion d'un article Supabase en objet Post
function mapPost(r: any): Post {
    const blog = Array.isArray(r.blogs)
        ? r.blogs[0]
        : r.blogs;

    return {
        id: r.id,
        language: names[blog?.slug] || 'japan',
        slug: r.slug,
        title: r.title,
        body: r.content,
        excerpt: (r.content || '').slice(0, 150),
        cover_url: r.image_url ?? null,
        published: r.status === 'published',
        created_at: r.created_at,
    };
}

// Récupérer les articles
export async function getPosts(
    language?: Language,
    includeDrafts = false
): Promise<Post[]> {
    if (!isConfigured) {
        return demoPosts
            .filter(
                (p) =>
                    (!language || p.language === language) &&
                    (includeDrafts || p.published)
            )
            .sort((a, b) =>
                b.created_at.localeCompare(a.created_at)
            );
    }

    const s = await db();

    if (!s) return [];

    let q = s
        .from('articles')
        .select('*, blogs!inner(slug)')
        .order('created_at', { ascending: false });

    if (language) {
        q = q.eq('blogs.slug', language);
    }

    if (!includeDrafts) {
        q = q.eq('status', 'published');
    }

    const { data, error } = await q;

    if (error) {
        console.error('Erreur récupération articles:', error);
        throw new Error(error.message);
    }

    return (data || []).map(mapPost);
}

// Récupérer un article par langue et slug
export async function getPost(
    language: Language,
    slug: string
): Promise<Post | null> {
    const posts = await getPosts(language);
    return posts.find((p) => p.slug === slug) || null;
}

// Récupérer les commentaires approuvés
export async function getComments(
    postId: string
): Promise<Comment[]> {
    if (!isConfigured) return [];

    const s = await db();

    if (!s) return [];

    const { data, error } = await s
        .from('comments')
        .select('*')
        .eq('article_id', postId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Erreur récupération commentaires:', error);
        throw new Error(error.message);
    }

    // Conversion du format BDD vers le format du site
    return (data || []).map((c) => ({
        id: c.id,
        post_id: c.article_id,
        nickname: c.nickname || 'Anonyme',
        body: c.content,
        status: c.status,
        created_at: c.created_at,
    })) as Comment[];
}
