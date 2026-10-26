
'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db, isAdmin } from '@/lib/supabase';
import { validLanguage } from '@/lib/config';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { createHmac } from 'node:crypto';

const str = (f: FormData, k: string) =>
    String(f.get(k) || '').trim();

function articlePath(lang: string, slug: string) {
    return `/${lang}/${encodeURIComponent(slug)}`;
}


// CONNEXION ADMINISTRATEUR
export async function login(form: FormData) {
    const s = await db();

    if (!s) redirect('/admin/login?error=config');

    const { error } = await s.auth.signInWithPassword({
        email: str(form, 'email'),
        password: str(form, 'password'),
    });

    if (error) {
        redirect('/admin/login?error=credentials');
    }

    if (!(await isAdmin())) {
        await s.auth.signOut();
        redirect('/admin/login?error=credentials');
    }

    redirect('/admin');
}

// DÉCONNEXION
export async function logout() {
    const s = await db();
    await s?.auth.signOut();
    redirect('/');
}

// AJOUT D'UN COMMENTAIRE

export async function addComment(form: FormData) {
    const lang = str(form, 'lang');
    const slug = str(form, 'slug');

    if (!validLanguage(lang)) return;

    const path = `/${lang}/${encodeURIComponent(slug)}`;

    // Champ invisible anti-robot
    if (str(form, 'website')) {
        redirect(path + '?sent=1');
    }

    const nickname = str(form, 'nickname');
    const content = str(form, 'body');
    const articleId = str(form, 'post_id');

    // Validation du formulaire
    if (
        !/^[a-z0-9-]{3,100}$/.test(slug) ||
        !/^[0-9a-f-]{36}$/i.test(articleId) ||
        nickname.length > 48 ||
        content.length < 2 ||
        content.length > 2000
    ) {
        redirect(path + '?error=invalid');
    }

    // Maximum 2 liens dans un commentaire
    const links = content.match(/https?:\/\/|www\./gi) || [];
    if (links.length > 2) {
        redirect(path + '?error=invalid');
    }

    // Lecture de l'adresse IP depuis Vercel
    const h = await headers();

    const ip = h.get('x-forwarded-for')
        ?.split(',')[0]
        ?.trim();

    if (!ip) {
        redirect(path + '?error=submit');
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secret = process.env.SUPABASE_SECRET_KEY;
    const salt = process.env.COMMENT_RATE_LIMIT_SALT;

    if (!url || !secret || !salt) {
        console.error('Missing comment security configuration');
        redirect(path + '?error=submit');
    }

    // Ne jamais enregistrer l'IP en clair dans Supabase
    const ipHash = createHmac('sha256', salt)
        .update(ip)
        .digest('hex');

    // Client Supabase privé, utilisé côté serveur
    const adminDb = createClient(url, secret, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
        },
    });

    const { data, error } = await adminDb.rpc(
        'submit_comment_limited',
        {
            p_article_id: articleId,
            p_language: lang,
            p_slug: slug,
            p_nickname: nickname,
            p_content: content,
            p_ip_hash: ipHash,
        }
    );

    if (error) {
        console.error('Comment submission error:', error.message);
        redirect(path + '?error=submit');
    }

    if (data === 'rate') {
        redirect(path + '?error=rate');
    }

    if (data === 'invalid') {
        redirect(path + '?error=invalid');
    }

    if (data !== 'ok') {
        redirect(path + '?error=submit');
    }

    redirect(path + '?sent=1');
}


// CRÉATION ET MODIFICATION D'ARTICLE
export async function savePost(form: FormData) {
    if (!(await isAdmin())) {
        redirect('/admin/login');
    }

    const s = await db();

    if (!s) redirect('/admin?error=config');

    const lang = str(form, 'language');

    if (!validLanguage(lang)) {
        redirect('/admin?error=fields');
    }

    const title = str(form, 'title');
    const body = str(form, 'body');
    const slug = str(form, 'slug').toLowerCase();
    const id = str(form, 'id');

    if (
        !title ||
        !body ||
        !/^[a-z0-9-]{3,100}$/.test(slug)
    ) {
        redirect('/admin?error=fields');
    }

    // Récupérer le blog correspondant à la langue.
    const { data: blog, error: blogError } = await s
        .from('blogs')
        .select('id')
        .eq('slug', lang)
        .single();

    if (blogError || !blog) {
        redirect('/admin?error=blog');
    }

    // Récupérer l'administrateur connecté.
    const {
        data: { user },
        error: authError,
    } = await s.auth.getUser();

    if (authError || !user) {
        redirect('/admin/login');
    }

    const publish = form.get('published') === 'on';

    const row = {
        blog_id: blog.id,
        title,
        content: body,
        slug,
        image_url: str(form, 'cover_url') || null,
        status: publish ? 'published' : 'draft',
        published_at: publish
            ? new Date().toISOString()
            : null,
    };

    const { error } = id
        ? await s
            .from('articles')
            .update(row)
            .eq('id', id)
            .eq('author_id', user.id)
        : await s
            .from('articles')
            .insert({
                ...row,
                author_id: user.id,
            });

    if (error) {
        console.error('Erreur sauvegarde article:', error.message);
        redirect('/admin?error=save');
    }

    revalidatePath('/');
    revalidatePath('/' + lang);
    revalidatePath(articlePath(lang, slug));
    revalidatePath('/admin');

    redirect('/admin?success=1');
}

// SUPPRESSION D'ARTICLE
export async function deletePost(form: FormData) {
    if (!(await isAdmin())) {
        redirect('/admin/login');
    }

    const s = await db();
    if (!s) redirect('/admin?error=config');

    const id = str(form, 'id');

    if (!id) redirect('/admin?error=fields');

    const { error } = await s
        .from('articles')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Erreur suppression:', error.message);
        redirect('/admin?error=delete');
    }

    revalidatePath('/');
    revalidatePath('/japan');
    revalidatePath('/china');
    revalidatePath('/korea');
    revalidatePath('/admin');

    redirect('/admin');
}

// MODÉRATION DES COMMENTAIRES
export async function moderate(form: FormData) {
    if (!(await isAdmin())) {
        redirect('/admin/login');
    }

    const status = str(form, 'status');
    const id = str(form, 'id');

    if (
        !['approved', 'rejected'].includes(status) ||
        !id
    ) {
        redirect('/admin?error=fields');
    }

    const s = await db();
    if (!s) redirect('/admin?error=config');

    const { error } = await s
        .from('comments')
        .update({ status })
        .eq('id', id);

    if (error) {
        console.error('Erreur modération:', error.message);
        redirect('/admin?error=moderate');
    }

    revalidatePath('/admin');
    revalidatePath('/japan');
    revalidatePath('/china');
    revalidatePath('/korea');

    redirect('/admin');
}
