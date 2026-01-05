'use client';

import { useEffect, useState, useRef, cloneElement } from 'react';
import {
    Users,
    Activity,
    AlertTriangle,
    CheckCircle2,
    HelpCircle,
    TrendingUp,
    LayoutDashboard,
    Bell,
    Search,
    MoreVertical
} from 'lucide-react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    YAxis
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

export default function TeacherDashboard() {
    const [students, setStudents] = useState({});
    const [isConnected, setIsConnected] = useState(false);
    const [filter, setFilter] = useState('all');
    const socketRef = useRef(null);

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8000/ws/teacher');

        ws.onopen = () => setIsConnected(true);
        ws.onclose = () => setIsConnected(false);

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            const { student_id, confusion_level, timestamp } = data;

            const timeStr = new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

            setStudents(prev => {
                const student = prev[student_id] || {
                    ...data,
                    history: []
                };

                const newHistory = [...(student.history || []), { time: timeStr, level: confusion_level }];
                if (newHistory.length > 20) newHistory.shift();

                return {
                    ...prev,
                    [student_id]: {
                        ...data,
                        history: newHistory
                    }
                };
            });
        };

        socketRef.current = ws;
        return () => ws.close();
    }, []);

    const getStatusConfig = (student) => {
        if (student.proctor_alert) return {
            color: 'text-red-400',
            bg: 'bg-red-500/10',
            border: 'border-red-500/30',
            label: `ALERT: ${student.proctor_message}`,
            icon: <AlertTriangle className="w-5 h-5 text-red-400" />
        };
        if (student.status === 'Confused') return {
            color: 'text-yellow-400',
            bg: 'bg-yellow-500/10',
            border: 'border-yellow-500/30',
            label: 'Student Confused',
            icon: <HelpCircle className="w-5 h-5 text-yellow-400" />
        };
        return {
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/30',
            label: 'Engagement Normal',
            icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        };
    };

    const activeCount = Object.keys(students).length;
    const alertCount = Object.values(students).filter(s => s.proctor_alert).length;
    const confusedCount = Object.values(students).filter(s => s.status === 'Confused').length;

    const filteredStudents = Object.values(students).filter(s => {
        if (filter === 'alerts') return s.proctor_alert;
        if (filter === 'confused') return s.status === 'Confused';
        return true;
    });

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans grid grid-cols-[380px_1fr] overflow-hidden">
            {/* Dynamic Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-500/5 blur-[150px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/5 blur-[150px] rounded-full" />
            </div>

            {/* LEFT SIDE: Control Center (Everything) */}
            <aside className="h-screen glass border-y-0 border-l-0 border-r border-white/10 p-8 flex flex-col relative z-20 shadow-[10px_0_30px_rgba(0,0,0,0.5)] overflow-y-auto">
                <div className="flex items-center gap-3 mb-12">
                    <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
                        <LayoutDashboard className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tighter uppercase italic">Super<span className="text-blue-500">Vision</span></h2>
                </div>

                <div className="space-y-8 flex-1 overflow-y-auto pr-2 scrollbar-hide">
                    <section>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 px-1">Global Telemetry</h3>
                        <div className="flex flex-col gap-4">
                            <StatCard label="Live Students" value={activeCount} icon={<Users />} />
                            <StatCard label="Proctor Alerts" value={alertCount} type="danger" icon={<AlertTriangle />} />
                            <StatCard label="Active Confusion" value={confusedCount} type="warning" icon={<HelpCircle />} />
                        </div>
                    </section>

                    <section>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 px-1">Control Filter</h3>
                        <div className="bg-white/5 p-1.5 rounded-2xl border border-white/5 mb-6">
                            <div className="flex flex-col gap-1">
                                <FilterTab active={filter === 'all'} onClick={() => setFilter('all')} label="Overview: All Students" />
                                <FilterTab active={filter === 'alerts'} onClick={() => setFilter('alerts')} label="Critical: Proctor Alerts" />
                                <FilterTab active={filter === 'confused'} onClick={() => setFilter('confused')} label="Support: Confused Feed" />
                            </div>
                        </div>

                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search student profile..."
                                className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all font-medium text-white placeholder-slate-600"
                            />
                        </div>
                    </section>

                    <section className="bg-blue-600/10 border border-blue-500/20 rounded-[2rem] p-8 mt-4">
                        <div className="flex items-center gap-3 mb-4">
                            <TrendingUp className="text-blue-400 w-5 h-5" />
                            <h4 className="text-sm font-bold text-blue-100 uppercase tracking-tighter">Class Vibe Index</h4>
                        </div>
                        <p className="text-xs text-blue-200/60 leading-relaxed font-medium">
                            The overall engagement is currently stable. Keep an eye on the realtime feed for sudden spikes in confusion.
                        </p>
                    </section>
                </div>

                <div className="pt-8 mt-auto border-t border-white/5">
                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-100 font-black border border-white/10">ABC</div>
                        <div>
                            <p className="text-sm font-black text-white uppercase tracking-tighter">Prof. ABC</p>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Physics 101 • Session Live</p>
                        </div>
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 text-center">Builded by <span className="text-blue-500">Pragati Gadkar</span></p>
                </div>
            </aside>

            {/* RIGHT SIDE: Detailed Student Feed */}
            <main className="flex-1 h-screen overflow-y-auto p-8 lg:p-12 relative z-10 scrollbar-hide bg-slate-950/20">
                <header className="flex justify-between items-center mb-10 sticky top-0 z-30 pt-4 pb-8 backdrop-blur-md bg-slate-950/40">
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Real-time <span className="text-blue-500">Telemetry</span></h1>
                        <p className="text-slate-500 text-sm font-medium">Student-wise behavioral insights and proctoring feed</p>
                    </div>

                    <div className="flex items-center gap-3 glass px-5 py-2.5 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Broadcasting: WS/8000</span>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
                    <AnimatePresence mode="popLayout">
                        {filteredStudents.map(student => (
                            <StudentTelemetryCard key={student.student_id} student={student} config={getStatusConfig(student)} />
                        ))}
                    </AnimatePresence>

                    {filteredStudents.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="col-span-full py-48 flex flex-col items-center justify-center glass rounded-[3rem] border-dashed border-2 border-white/5"
                        >
                            <Users className="w-16 h-16 text-slate-800 mb-6" />
                            <p className="text-slate-400 text-xl font-black uppercase tracking-tighter">Waiting for synchronization</p>
                            <p className="text-slate-600 font-medium">Connect a student portal to see the split feed</p>
                        </motion.div>
                    )}
                </div>
            </main>
        </div>
    );
}

function StudentTelemetryCard({ student, config }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass rounded-[2.5rem] p-8 flex flex-col gap-8 group hover:border-white/20 transition-all duration-500 relative overflow-hidden"
        >
            <div className={`absolute top-0 right-0 w-48 h-48 blur-[80px] opacity-20 pointer-events-none ${config.bg.replace('10', '40')}`} />

            <div className="flex justify-between items-start relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-slate-900 border border-white/10 flex items-center justify-center text-2xl font-black text-white uppercase tracking-tighter shadow-2xl">
                        {student.student_id ? student.student_id.split('_')[1]?.substring(0, 2) || 'S' : 'S'}
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-white tracking-tighter uppercase">{student.student_id}</h3>
                        <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${config.color} mt-1`}>
                            <Activity className="w-3.5 h-3.5" />
                            {config.label}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em]">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <button className="mt-4 p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/5">
                        <MoreVertical className="w-5 h-5 text-slate-400" />
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                    <h4 className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Engagement Vibe</h4>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
                        <span className="text-[10px] font-black text-blue-400 uppercase italic">Real-time Stream</span>
                    </div>
                </div>
                <div className="h-32 w-full bg-slate-900/40 rounded-[2rem] border border-white/5 p-6 overflow-hidden">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={student.history}>
                            <defs>
                                <linearGradient id={`grad-${student.student_id}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={student.proctor_alert ? '#f43f5e' : student.status === 'Confused' ? '#fbbf24' : '#10b981'} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={student.proctor_alert ? '#f43f5e' : student.status === 'Confused' ? '#fbbf24' : '#10b981'} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Area
                                type="monotone"
                                dataKey="level"
                                stroke={student.proctor_alert ? '#f43f5e' : student.status === 'Confused' ? '#fbbf24' : '#10b981'}
                                strokeWidth={3}
                                fillOpacity={1}
                                fill={`url(#grad-${student.student_id})`}
                                isAnimationActive={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6 relative z-10">
                <MetricBadge label="Confusion" value={`${(student.confusion_level * 100).toFixed(0)}%`} icon={<HelpCircle className="w-4 h-4" />} color={student.confusion_level > 0.5 ? 'text-yellow-400' : 'text-slate-400'} />
                <MetricBadge label="Focus State" value={student.engagement} icon={<Activity className="w-4 h-4" />} color={student.engagement === 'High' ? 'text-emerald-400' : 'text-slate-400'} />
            </div>
        </motion.div>
    );
}

function MetricBadge({ label, value, icon, color }) {
    return (
        <div className="bg-white/5 border border-white/5 p-6 rounded-[1.8rem] group-hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-2 mb-2">
                <span className="text-slate-500 uppercase font-black text-[9px] tracking-widest">{label}</span>
            </div>
            <div className={`text-xl font-black uppercase tracking-tighter flex items-center gap-2.5 ${color}`}>
                {icon}
                {value}
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, type = 'success' }) {
    const styles = {
        success: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        danger: 'text-red-400 bg-red-500/10 border-red-500/20',
        warning: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
    };

    return (
        <div className={`glass px-8 py-6 rounded-[2rem] flex items-center justify-between border shadow-lg group hover:scale-[1.02] transition-transform duration-300 ${styles[type].split(' ').slice(2).join(' ')}`}>
            <div className="flex items-center gap-5">
                <div className={`p-4 rounded-2xl shadow-inner ${styles[type].split(' ').slice(0, 2).join(' ')}`}>
                    {cloneElement(icon, { className: 'w-6 h-6' })}
                </div>
                <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.25em] block mb-1">{label}</span>
                    <span className="text-3xl font-black text-white tracking-tighter leading-none">{value < 10 ? `0${value}` : value}</span>
                </div>
            </div>
            <div className="w-1.5 h-12 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: '70%' }}
                    className={`w-full ${styles[type].split(' ')[0]} bg-current opacity-30`}
                />
            </div>
        </div>
    );
}

function FilterTab({ active, onClick, label }) {
    return (
        <button
            onClick={onClick}
            className={`w-full text-left px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}
        >
            {label}
        </button>
    );
}
