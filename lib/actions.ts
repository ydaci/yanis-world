
'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db, isAdmin } from '@/lib/supabase';
import { validLanguage } from '@/lib/config';

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

    const path = articlePath(lang, slug);

    // Champ honeypot anti-spam
    if (str(form, 'website')) {
        redirect(path + '?sent=1');
    }

    const nickname = str(form, 'nickname');
    const body = str(form, 'body');
    const articleId = str(form, 'post_id');

    if (
        nickname.length > 48 ||
        body.length < 2 ||
        body.length > 2000 ||
        !articleId
    ) {
        redirect(path + '?error=invalid');
    }

    const s = await db();

    if (!s) redirect(path + '?error=demo');

    // Vérifier que l'article existe et qu'il est publié.
    const { data: article, error: articleError } = await s
        .from('articles')
        .select('id, blogs!inner(slug)')
        .eq('id', articleId)
        .eq('slug', slug)
        .eq('status', 'published')
        .eq('blogs.slug', lang)
        .maybeSingle();

    if (articleError || !article) {
        redirect(path + '?error=invalid');
    }

    // Utiliser le client serveur autorisé pour
    // l'insertion anonyme, jamais une clé secrète
    // exposée au navigateur.
    const { error } = await s.from('comments').insert({
        article_id: article.id,
        nickname: nickname || null,
        content: body,
        status: 'pending',
    });

    if (error) {
        console.error('ERREUR SUPABASE COMMENTAIRE:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        });
    }

    redirect(
        path + (error ? '?error=submit' : '?sent=1')
    );
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
