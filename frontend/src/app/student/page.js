'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, AlertCircle, CheckCircle, Shield, User, Info, Wifi } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StudentPortal() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [studentId, setStudentId] = useState('');
    const [status, setStatus] = useState('Initializing Systems...');

    useEffect(() => {
        const id = `student_${Math.floor(Math.random() * 1000)}`;
        setStudentId(id);

        const ws = new WebSocket(`ws://localhost:8000/ws/student/${id}`);

        ws.onopen = () => {
            setIsConnected(true);
            setSocket(ws);
            setStatus('Active Monitoring Session');
        };

        ws.onclose = () => {
            setIsConnected(false);
            setStatus('Session Disconnected');
        };

        const setupCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 640, height: 480, frameRate: 10 }
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                setStatus('Camera Access Denied');
            }
        };

        setupCamera();

        return () => {
            ws.close();
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            }
        };
    }, []);

    useEffect(() => {
        if (!socket || !isConnected) return;

        const sendFrame = () => {
            if (videoRef.current && canvasRef.current && socket.readyState === WebSocket.OPEN) {
                const context = canvasRef.current.getContext('2d');
                if (context) {
                    context.drawImage(videoRef.current, 0, 0, 320, 240);
                    const imageData = canvasRef.current.toDataURL('image/jpeg', 0.5);
                    socket.send(JSON.stringify({ image: imageData }));
                }
            }
        };

        const interval = setInterval(sendFrame, 200);
        return () => clearInterval(interval);
    }, [socket, isConnected]);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500/30">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
            </div>

            <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12"
                >
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-emerald-500/20 rounded-lg">
                                <Shield className="w-6 h-6 text-emerald-400" />
                            </div>
                            <h1 className="text-4xl font-black tracking-tight text-white">
                                Student <span className="text-emerald-400">Portal</span>
                            </h1>
                        </div>
                        <p className="text-slate-400 font-medium">Empowering your learning with Super Vision AI</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <motion.div
                            animate={{ scale: isConnected ? [1, 1.02, 1] : 1 }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className={`flex items-center gap-3 px-6 py-3 rounded-2xl border glass ${isConnected ? 'border-emerald-500/30' : 'border-red-500/30'}`}
                        >
                            <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-400 shadow-[0_0_10px_#10b981]' : 'bg-red-400 shadow-[0_0_10px_#f43f50]'}`} />
                            <span className="text-sm font-bold tracking-wide uppercase">{status}</span>
                        </motion.div>
                    </div>
                </motion.header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-8 group"
                    >
                        <div className="relative glass rounded-[2.5rem] p-4 overflow-hidden shadow-2xl transition-all duration-500 hover:border-white/20">
                            <div className="relative aspect-video rounded-[1.8rem] overflow-hidden bg-slate-900 border border-white/5">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
                                />
                                <canvas ref={canvasRef} width="320" height="240" className="hidden" />

                                <div className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
                                    <div className="w-2 h-2 bg-red-500 animate-pulse rounded-full" />
                                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Rec 1080p</span>
                                </div>

                                <div className="absolute bottom-8 left-8 flex items-center gap-3 px-5 py-2.5 bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/10">
                                    <Camera className="w-4 h-4 text-emerald-400" />
                                    <span className="text-xs font-bold tracking-widest uppercase">Perspective: Frontal</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glass p-8 rounded-[2rem] border-white/5"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 bg-blue-500/20 rounded-xl">
                                    <User className="w-5 h-5 text-blue-400" />
                                </div>
                                <h3 className="text-slate-100 font-bold uppercase tracking-wider text-sm">Session Identity</h3>
                            </div>
                            <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5">
                                <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">Authenticated ID</p>
                                <p className="text-2xl font-mono text-white tracking-tight">{studentId || 'SECURE_INIT'}</p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="glass p-8 rounded-[2rem] flex-1 flex flex-col border-white/5"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 bg-emerald-500/20 rounded-xl">
                                    <Info className="w-5 h-5 text-emerald-400" />
                                </div>
                                <h3 className="text-slate-100 font-bold uppercase tracking-wider text-sm">AI Guidance</h3>
                            </div>

                            <div className="space-y-6">
                                <GuidanceItem
                                    icon={<Wifi className="w-4 h-4" />}
                                    text="Your biometric telemetry is being streamed securely to the teacher dashboard."
                                />
                                <GuidanceItem
                                    icon={<CheckCircle className="w-4 h-4" />}
                                    text="Focus on your screen to maintain a 'Focused' status and optimize your learning vibe."
                                />
                                <GuidanceItem
                                    icon={<AlertCircle className="w-4 h-4" />}
                                    text="If you feel confused, the AI will notify the teacher so they can offer assistance."
                                />
                            </div>

                            <div className="mt-auto pt-8">
                                <div className="bg-emerald-500/10 p-5 rounded-2xl border border-emerald-500/10">
                                    <p className="text-xs text-emerald-400 leading-relaxed font-medium">
                                        "Super Vision is not surveillance; it's a bridge to understanding."
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>
            <footer className="relative z-10 max-w-7xl mx-auto px-6 pb-8 border-t border-white/5 mt-12 pt-8 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                <p>© 2026 Super Vision AI</p>
                <p>Builded by <span className="text-emerald-400">Pragati Gadkar</span></p>
            </footer>
        </div>
    );
}

function GuidanceItem({ icon, text }) {
    return (
        <div className="flex gap-4 items-start">
            <div className="mt-1 p-1.5 bg-white/5 rounded-lg text-slate-400">
                {icon}
            </div>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
                {text}
            </p>
        </div>
    );
}
