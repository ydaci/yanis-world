import Link from "next/link";
export default function Header() {
    return (
        <header className="nav">
            <div className="container nav-inner">
                <Link href="/" className="brand">
                    <span className="brand-symbol">
                        Y<span>/</span>W
                    </span>
                    <span>YANIS' WORLD</span>
                </Link>
                <nav aria-label="Main navigation">
                    <Link href="/">Home</Link>
                    <Link href="/japan">Japan</Link>
                    <Link href="/china">China</Link>
                    <Link href="/korea">Korea</Link>
                    <Link href="/about">About</Link>
                </nav>
            </div>
        </header>
    );
}
