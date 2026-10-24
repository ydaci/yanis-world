export const isConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
export const languages = {
    japan: { id: 'japan', country: 'Japan', name: 'ヤニスの世界', headline: '日本語で綴る、毎日の小さな物語。', subtitle: 'フランス人ヤニスの日本語日記', label: 'JAPANESE JOURNAL', accent: '#a76c75', light: '#fae9e9', image: '/Kyoto.jpg', button: '続きを読む', comment: 'コメントを残す' },
    china: { id: 'china', country: 'China', name: '亚尼斯的世界', headline: '用中文记录生活中的小故事。', subtitle: '一个法国人的中文日记', label: 'CHINESE JOURNAL', accent: '#ae6554', light: '#fbede3', image: '/Guilin.jpg', button: '阅读更多', comment: '发表评论' },
    korea: { id: 'korea', country: 'Korea', name: '야니스의 세계', headline: '하루 한 문장, 작은 이야기들.', subtitle: '프랑스인 야니스의 한국어 일기', label: 'KOREAN JOURNAL', accent: '#558678', light: '#e7f4ec', image: '/Séoul.jpg', button: '더 읽기', comment: '댓글 남기기' }
} as const;
export type Language = keyof typeof languages;
export const validLanguage = (x: string): x is Language => x in languages;
export type Post = { id: string, language: Language, slug: string, title: string, body: string, excerpt: string | null, cover_url: string | null, published: boolean, created_at: string };
export type Comment = { id: string, post_id: string, nickname: string, body: string, status: 'pending' | 'approved' | 'rejected', created_at: string };
export const demoPosts: Post[] = [
    { id: 'demo-j1', language: 'japan', slug: 'kyou-no-nikki', title: '今日は日本語を勉強しました。', body: '今日は仕事の後で日本語を勉強しました。少し疲れましたが、楽しかったです。\n\n毎日少しずつ頑張りたいです。', excerpt: '少し疲れましたが、楽しかったです。', cover_url: null, published: true, created_at: '2026-10-19T10:00:00Z' },
    { id: 'demo-j2', language: 'japan', slug: 'shuumatsu', title: '週末の散歩', body: '週末に友達と公園を散歩しました。天気がよかったです。', excerpt: '天気がよかったです。', cover_url: null, published: true, created_at: '2026-10-17T10:00:00Z' },
    { id: 'demo-c1', language: 'china', slug: 'jintian', title: '今天有点累。', body: '今天工作很忙，但是晚上我还是学习了一点中文。', excerpt: '今天工作很忙。', cover_url: null, published: true, created_at: '2026-10-19T11:00:00Z' },
    { id: 'demo-c2', language: 'china', slug: 'zhoumo', title: '周末的生活', body: '今天我跟朋友一起散步了。', excerpt: '今天我跟朋友一起散步了。', cover_url: null, published: true, created_at: '2026-10-17T11:00:00Z' },
    { id: 'demo-k1', language: 'korea', slug: 'oneul', title: '오늘은 한국어를 공부했어요.', body: '오늘은 일이 많아서 조금 피곤했어요. 그래도 한국어를 공부했어요.', excerpt: '그래도 한국어를 공부했어요.', cover_url: null, published: true, created_at: '2026-10-19T12:00:00Z' },
    { id: 'demo-k2', language: 'korea', slug: 'jumal', title: '주말 이야기', body: '주말에 친구를 만났어요. 정말 즐거웠어요.', excerpt: '정말 즐거웠어요.', cover_url: null, published: true, created_at: '2026-10-17T12:00:00Z' }
];
