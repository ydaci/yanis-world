import Link from "next/link";
import type { Post } from "@/lib/config";
export default function PostCard({ post }: { post: Post }) {
    return (
        <article className="post-card">
            <div className="post-date">
                {new Date(post.created_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                })}{" "}
                <span>· {post.language.toUpperCase()}</span>
            </div>
            <h3>
                <Link href={"/" + post.language + "/" + post.slug}>
                    {post.title}
                </Link>
            </h3>
            <p>{post.excerpt || post.body.slice(0, 160)}</p>
            <Link
                href={"/" + post.language + "/" + post.slug}
                className="read-link"
            >
                Read story <span aria-hidden="true">↗</span>
            </Link>
        </article>
    );
}
