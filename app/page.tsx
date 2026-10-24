import Link from "next/link";
import Image from "next/image";
import { languages } from "@/lib/config";
import { getPosts } from "@/lib/data";
import PostCard from "@/components/PostCard";
export default async function Home() {
    const posts = (await getPosts()).slice(0, 3);
    return (
        <main>
            <section className="hero container">
                <div className="hero-copy">
                    <div className="eyebrow">A PERSONAL LANGUAGE JOURNAL</div>
                    <h1>
                        Three languages.
                        <br />
                        <em>One world.</em>
                        <br />A thousand little stories.
                    </h1>
                    <p>
                        Welcome to my little corner of the world. Follow my
                        everyday adventures in Japanese, Chinese and Korean —
                        one sentence at a time.
                    </p>
                    <Link href="#journals" className="btn">
                        Explore my journals <span>↗</span>
                    </Link>
                    <div className="tiny-note">日本語 · 中文 · 한국어</div>
                </div>
                <div className="hero-visual">
                    <Image
                        src="/Kyoto.jpg"
                        width={780}
                        height={580}
                        alt="Kyoto-inspired landscape artwork"
                        priority
                    />
                    <div className="hero-sticker">
                        Small steps, every day.
                        <br />
                        毎日、少しずつ。
                    </div>
                </div>
            </section>
            <section id="journals" className="section container">
                <div className="section-top">
                    <div>
                        <div className="eyebrow">
                            THREE JOURNALS · THREE WORLDS
                        </div>
                        <h2>
                            Choose a language, <em>follow a story.</em>
                        </h2>
                    </div>
                    <p>
                        Everyday life, honest progress, small discoveries —
                        written in the languages I'm learning.
                    </p>
                </div>
                <div className="journal-grid">
                    {Object.entries(languages).map(([key, v]) => (
                        <Link
                            key={key}
                            href={"/" + key}
                            className={"journal-card journal-" + key}
                        >
                            <div className="journal-image">
                                <Image
                                    src={v.image}
                                    alt={
                                        v.country +
                                        " landscape-inspired artwork"
                                    }
                                    width={650}
                                    height={400}
                                />
                            </div>
                            <div className="journal-body">
                                <div className="eyebrow">{v.label}</div>
                                <h3>{v.name}</h3>
                                <p>{v.subtitle}</p>
                                <span className="card-link">
                                    Explore {v.country} ↗
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
            <section className="section recent">
                <div className="container">
                    <div className="eyebrow">LATEST UPDATES</div>
                    <h2>
                        Recent <em>little stories.</em>
                    </h2>
                    <div className="posts-grid">
                        {posts.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>
                </div>
            </section>
            <section className="closing container">
                <h2>
                    One sentence today.
                    <br />
                    <em>A whole story tomorrow.</em>
                </h2>
                <p>
                    Languages grow with small, consistent moments. Thanks for
                    being part of the journey.
                </p>
            </section>
        </main>
    );
}
