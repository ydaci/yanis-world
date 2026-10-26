
import { redirect } from "next/navigation";
import { isAdmin, db } from "@/lib/supabase";
import { savePost, deletePost, moderate, logout } from "@/lib/actions";
import { languages, type Comment } from "@/lib/config";
import { getPosts } from "@/lib/data";

// Ne pas mettre le tableau de bord en cache
export const dynamic = "force-dynamic";

export default async function Admin({
    searchParams,
}: {
    searchParams: Promise<{
        edit?: string;
        success?: string;
        error?: string;
    }>;
}) {
    // Vérification serveur obligatoire
    const admin = await isAdmin();

    if (!admin) {
        redirect("/admin/login");
    }

    const s = await db();

    if (!s) {
        redirect("/admin/login?error=config");
    }

    const q = await searchParams;

    // Récupération des articles et commentaires
    const [rows, result] = await Promise.all([
        getPosts(undefined, true),
        s.from("comments")
            .select("*")
            .eq("status", "pending")
            .order("created_at", { ascending: false }),
    ]);

    if (result.error) {
        console.error(
            "Erreur récupération commentaires:",
            result.error.message
        );
    }

    // Conversion des commentaires Supabase
    const pending: Comment[] = (result.data || []).map((c) => ({
        id: c.id,
        post_id: c.article_id,
        nickname: c.nickname || "Anonyme",
        body: c.content,
        status: c.status,
        created_at: c.created_at,
    }));

    // Article sélectionné pour modification
    const selected = rows.find((p) => p.id === q.edit);

    return (
        <main className="admin-layout container">
            <div className="admin-heading">
                <div>
                    <div className="eyebrow">
                        YANIS' WORLD / CMS
                    </div>

                    <h1>Editorial dashboard</h1>

                    <p>
                        Write a sentence or a whole chapter.
                    </p>
                </div>

                <form action={logout}>
                    <button
                        type="submit"
                        className="btn-outline"
                    >
                        Sign out
                    </button>
                </form>
            </div>

            {q.success && (
                <p className="notice">
                    Article saved successfully.
                </p>
            )}

            {q.error && (
                <p className="error">
                    An error occurred. Please check your
                    information and try again.
                </p>
            )}

            <div className="admin-grid">
                {/* FORMULAIRE ARTICLE */}
                <section className="admin-panel">
                    <h2>
                        {selected
                            ? "Edit article"
                            : "New article"}
                    </h2>

                    <form
                        action={savePost}
                        className="stack"
                    >
                        {selected && (
                            <input
                                name="id"
                                type="hidden"
                                value={selected.id}
                            />
                        )}

                        <label>
                            Journal

                            <select
                                name="language"
                                defaultValue={
                                    selected?.language || "japan"
                                }
                                key={selected?.id || "new"}
                            >
                                {Object.entries(languages).map(
                                    ([k, v]) => (
                                        <option
                                            value={k}
                                            key={k}
                                        >
                                            {v.country} — {v.name}
                                        </option>
                                    )
                                )}
                            </select>
                        </label>

                        <label>
                            Article title

                            <input
                                name="title"
                                required
                                defaultValue={
                                    selected?.title || ""
                                }
                                placeholder="今日の日記"
                                key={
                                    (selected?.id || "new") +
                                    "-title"
                                }
                            />
                        </label>

                        <label>
                            URL slug (lowercase letters,
                            numbers, dashes)

                            <input
                                name="slug"
                                required
                                pattern="[a-z0-9-]{3,100}"
                                defaultValue={
                                    selected?.slug || ""
                                }
                                placeholder="my-first-entry"
                                key={
                                    (selected?.id || "new") +
                                    "-slug"
                                }
                            />
                        </label>

                        <label>
                            Article text

                            <textarea
                                name="body"
                                rows={10}
                                required
                                defaultValue={
                                    selected?.body || ""
                                }
                                placeholder="One sentence is enough..."
                                key={
                                    (selected?.id || "new") +
                                    "-body"
                                }
                            />
                        </label>

                        <label>
                            Cover image URL (optional)

                            <input
                                name="cover_url"
                                type="url"
                                defaultValue={
                                    selected?.cover_url || ""
                                }
                                placeholder="https://..."
                                key={
                                    (selected?.id || "new") +
                                    "-cover"
                                }
                            />
                        </label>

                        <label className="check">
                            <input
                                type="checkbox"
                                name="published"
                                defaultChecked={
                                    selected?.published || false
                                }
                                key={
                                    (selected?.id || "new") +
                                    "-published"
                                }
                            />
                            {" "}
                            Publish now
                        </label>

                        <button
                            className="btn"
                            type="submit"
                        >
                            {selected
                                ? "Update article ↗"
                                : "Save article ↗"}
                        </button>
                    </form>
                </section>

                {/* ARTICLES EXISTANTS */}
                <section className="admin-panel">
                    <h2>
                        Articles ({rows.length})
                    </h2>

                    <div className="admin-items">
                        {rows.map((p) => (
                            <div
                                className="admin-item"
                                key={p.id}
                            >
                                <div>
                                    <strong>{p.title}</strong>

                                    <small>
                                        {p.language} ·{" "}
                                        {p.published
                                            ? "Published"
                                            : "Draft"}
                                    </small>
                                </div>

                                <div className="admin-actions">
                                    <a
                                        href={
                                            "/admin?edit=" + p.id
                                        }
                                    >
                                        Edit
                                    </a>

                                    <form action={deletePost}>
                                        <input
                                            name="id"
                                            type="hidden"
                                            value={p.id}
                                        />

                                        <button
                                            type="submit"
                                            className="text-danger"
                                        >
                                            Delete
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ))}

                        {!rows.length && (
                            <p>No articles yet.</p>
                        )}
                    </div>

                    {/* MODÉRATION */}
                    <h2 className="space-top">
                        Pending comments ({pending.length})
                    </h2>

                    <div className="admin-items">
                        {pending.map((c) => (
                            <div
                                className="admin-item"
                                key={c.id}
                            >
                                <div>
                                    <strong>
                                        {c.nickname}
                                    </strong>

                                    <p>{c.body}</p>
                                </div>

                                <div className="admin-actions">
                                    <form action={moderate}>
                                        <input
                                            name="id"
                                            type="hidden"
                                            value={c.id}
                                        />

                                        <input
                                            name="status"
                                            type="hidden"
                                            value="approved"
                                        />

                                        <button type="submit">
                                            Approve
                                        </button>
                                    </form>

                                    <form action={moderate}>
                                        <input
                                            name="id"
                                            type="hidden"
                                            value={c.id}
                                        />

                                        <input
                                            name="status"
                                            type="hidden"
                                            value="rejected"
                                        />

                                        <button
                                            type="submit"
                                            className="text-danger"
                                        >
                                            Reject
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ))}

                        {!pending.length && (
                            <p>
                                Nothing to moderate. 🎉
                            </p>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}
