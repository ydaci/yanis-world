import { login } from "@/lib/actions";
import { isConfigured } from "@/lib/config";
export default async function Login({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>;
}) {
    const { error } = await searchParams;
    return (
        <main className="admin-shell">
            <div className="admin-panel">
                <div className="eyebrow">PRIVATE ADMINISTRATION</div>
                <h1>Welcome back.</h1>
                {!isConfigured && (
                    <p className="error">
                        Configure Supabase in .env.local to enable sign-in.
                    </p>
                )}
                {error && (
                    <p className="error">
                        Sign-in failed. Check your credentials and admin access.
                    </p>
                )}
                <form action={login} className="stack">
                    <label>
                        Email
                        <input name="email" type="email" required />
                    </label>
                    <label>
                        Password
                        <input name="password" type="password" required />
                    </label>
                    <button className="btn">Sign in</button>
                </form>
            </div>
        </main>
    );
}
