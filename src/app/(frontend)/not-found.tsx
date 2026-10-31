import Link from "next/link"

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-ink px-6 text-center">
      <div>
        <p className="font-display text-sm tracking-[0.4em] text-blue">ERROR 404</p>
        <h1 className="mt-3 font-display text-5xl font-extrabold">Evicted from this page</h1>
        <p className="mt-4 text-mist">The page you are looking for does not exist or has been removed.</p>
        <Link className="mt-8 inline-block bg-blue px-6 py-3 font-display text-sm font-semibold tracking-widest text-white clip-cut-sm hover:bg-ice" href="/">
          BACK TO HOME
        </Link>
      </div>
    </main>
  )
}
