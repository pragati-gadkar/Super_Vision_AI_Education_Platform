import Link from 'next/link';

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-slate-950">
            <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm lg:flex flex-col gap-8">
                <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-4 tracking-tighter">
                    SUPER VISION
                </h1>
                <p className="text-slate-400 text-xl mb-8">The future of empowered education.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                    <Link href="/student" className="glass p-8 rounded-2xl hover:bg-white/10 transition-all group">
                        <h2 className="text-2xl font-bold mb-2 group-hover:text-emerald-400 uppercase tracking-tighter">Student Portal</h2>
                        <p className="text-slate-400 italic">Enter your session and start learning with AI assistance.</p>
                    </Link>

                    <Link href="/teacher" className="glass p-8 rounded-2xl hover:bg-white/10 transition-all group">
                        <h2 className="text-2xl font-bold mb-2 group-hover:text-blue-400 uppercase tracking-tighter">Teacher Dashboard</h2>
                        <p className="text-slate-400 italic">Monitor engagement and provide support where needed.</p>
                    </Link>
                </div>
            </div>
        </main>
    );
}
