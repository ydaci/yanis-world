import { notFound } from "next/navigation";
import Image from "next/image";
import { getPosts } from "@/lib/data";
import PostCard from "@/components/PostCard";
import { languages, validLanguage } from "@/lib/config";
export default async function Journal({
    params,
}: {
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;
    if (!validLanguage(lang)) notFound();
    const v = languages[lang],
        posts = await getPosts(lang);
    return (
        <main className={"lang-page theme-" + lang}>
            <section className="language-hero">
                <div className="container language-hero-grid">
                    <div>
                        <div className="eyebrow">{v.label} / DAILY LIFE</div>
                        <h1>{v.name}</h1>
                        <p className="native-subtitle">{v.headline}</p>
                        <p>{v.subtitle}</p>
                    </div>
                    <Image
                        src={v.image}
                        width={650}
                        height={400}
                        alt={v.country + " inspired artwork"}
                    />
                </div>
            </section>
            <section className="section container">
                <div className="eyebrow">DIARY ENTRIES</div>
                <h2>
                    Little moments, <em>day by day.</em>
                </h2>
                <div className="content-grid">
                    <div className="post-list">
                        {posts.length ? (
                            posts.map((p) => <PostCard key={p.id} post={p} />)
                        ) : (
                            <p>
                                No entries published yet. The next sentence is
                                coming soon.
                            </p>
                        )}
                    </div>
                    <aside className="side-box">
                        <div className="eyebrow">ABOUT THIS JOURNAL</div>
                        <h3>One sentence is enough to begin.</h3>
                        <p>
                            Learning in public. Sharing everyday life.
                            Celebrating small progress.
                        </p>
                        <hr />
                        <strong>{v.country} journal</strong>
                        <p>New articles are published as they are written.</p>
                        <hr />
                        <strong>JOIN THE CONVERSATION</strong>
                        <p>
                            Comments need only a nickname and are approved
                            before appearing.
                        </p>
                    </aside>
                </div>
            </section>
        </main>
    );
}
export function generateStaticParams() {
    return Object.keys(languages).map((lang) => ({ lang }));
}
