
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';
import { isConfigured } from '@/lib/config';

// Création du client Supabase côté serveur
export async function db() {
    if (!isConfigured) {
        return null;
    }

    const store = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return store.getAll();
                },

                setAll(
                    items: {
                        name: string;
                        value: string;
                        options: CookieOptions;
                    }[]
                ) {
                    try {
                        items.forEach(({ name, value, options }) => {
                            store.set(name, value, options);
                        });
                    } catch {
                        // Les Server Components peuvent lire les
                        // cookies mais pas toujours les modifier.
                    }
                },
            },
        }
    );
}

// Vérifier si l'utilisateur est administrateur
export async function isAdmin(): Promise<boolean> {
    const s = await db();

    if (!s) return false;

    const {
        data: { user },
        error: authError,
    } = await s.auth.getUser();

    if (authError || !user) {
        return false;
    }

    const { data, error } = await s
        .from('users')
        .select('id')
        .eq('id', user.id)
        .eq('is_admin', true)
        .maybeSingle();

    if (error) {
        console.error('Erreur vérification admin:', error);
        return false;
    }

    return !!data;
}
