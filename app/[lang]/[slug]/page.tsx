import Link from 'next/link';
import { notFound } from 'next/navigation';
import { addComment } from '@/lib/actions';
import { getPost, getComments } from '@/lib/data';
import { languages, validLanguage } from '@/lib/config';

const messages = {
    japan: {
        comments: 'コメント', success: 'ありがとうございます！コメントは承認後に公開されます。',
        error: 'コメントを送信できませんでした。入力内容または接続を確認してください。',
        empty: '最初のコメントを投稿してください。',
        info: '登録不要です。コメントは承認後に公開されます。',
        nickname: 'ニックネーム', comment: 'コメント', placeholder: 'コメントを入力してください…',
        submit: 'コメントを送信 ↗', demo: 'Supabaseを設定してください。',
    },
    china: {
        comments: '评论', success: '谢谢！您的评论将在审核通过后显示。',
        error: '评论发送失败，请检查输入内容或网络连接。',
        empty: '欢迎留下第一条评论。',
        info: '无需注册。评论将在审核后显示。',
        nickname: '昵称', comment: '评论', placeholder: '请输入您的评论…',
        submit: '发表评论 ↗', demo: '请配置 Supabase。',
    },
    korea: {
        comments: '댓글', success: '감사합니다! 댓글은 승인 후에 게시됩니다.',
        error: '댓글을 보내지 못했습니다. 입력 내용이나 연결을 확인해 주세요.',
        empty: '첫 댓글을 남겨 주세요.',
        info: '가입 없이 댓글을 남길 수 있습니다. 승인 후 게시됩니다.',
        nickname: '닉네임', comment: '댓글', placeholder: '댓글을 작성해 주세요…',
        submit: '댓글 보내기 ↗', demo: 'Supabase를 설정해 주세요.',
    },
};

export default async function Article({ params, searchParams }: {
    params: Promise<{ lang: string; slug: string }>;
    searchParams: Promise<{ sent?: string; error?: string }>;
}) {
    const { lang, slug } = await params;
    if (!validLanguage(lang)) notFound();
    const p = await getPost(lang, slug);
    if (!p) notFound();
    const q = await searchParams;
    const comments = await getComments(p.id);
    const v = languages[lang];
    const m = messages[lang];
    const locale = lang === 'japan' ? 'ja-JP' : lang === 'china' ? 'zh-CN' : 'ko-KR';

    return (
        <main className={'theme-' + lang}>
            <section className="article-head">
                <div className="container article-narrow">
                    <Link href={'/' + lang} className="back">← {v.name}</Link>
                    <div className="eyebrow">
                        {v.label} · {new Date(p.created_at).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <h1>{p.title}</h1>
                </div>
            </section>

            <article className="article-narrow article-body">
                {p.body.split('\n').map((s: string, i: number) => <p key={i}>{s || '\u00a0'}</p>)}
            </article>

            <section className="article-narrow comments">
                <h2>{m.comments} <span>({comments.length})</span></h2>
                {q.sent && <p className="notice">{m.success}</p>}
                {q.error && <p className="error">{q.error === 'demo' ? m.demo : m.error}</p>}
                {comments.length ? comments.map(c => (
                    <div className="comment" key={c.id}>
                        <div><b>{c.nickname || 'Anonymous'}</b><small>{new Date(c.created_at).toLocaleDateString(locale)}</small></div>
                        <p>{c.body}</p>
                    </div>
                )) : <p className="muted">{m.empty}</p>}

                <div className="comment-form">
                    <h3>{v.comment}</h3>
                    <p>{m.info}</p>
                    <form action={addComment}>
                        <input type="hidden" name="post_id" value={p.id} />
                        <input type="hidden" name="lang" value={lang} />
                        <input type="hidden" name="slug" value={slug} />
                        <div className="honeypot" aria-hidden="true">
                            <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
                        </div>
                        <label>{m.nickname}<input name="nickname" minLength={2} maxLength={48} placeholder={m.nickname} /></label>
                        <label>{m.comment}<textarea name="body" minLength={2} maxLength={2000} required rows={5} placeholder={m.placeholder} /></label>
                        <button className="btn" type="submit">{m.submit}</button>
                    </form>
                </div>
            </section>
        </main>
    );
}
