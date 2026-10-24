import Link from "next/link";
export default function Footer() {
    return (
        <footer className="footer">
            <div className="container foot-row">
                <div>
                    <strong>YANIS' WORLD</strong>
                    <p>
                        Three languages. One world. A thousand little stories.
                    </p>
                </div>
                <div>
                    <Link href="/">Home</Link>
                    <Link href="/about">About</Link>
                    <Link href="/admin">Admin</Link>
                </div>
            </div>
        </footer>
    );
}
