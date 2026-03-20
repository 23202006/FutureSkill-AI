import React, { useEffect, useRef, useState, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Map, 
  Search, 
  Cpu, 
  BarChart3, 
  Users, 
  GraduationCap, 
  Building2,
  CheckCircle2,
  ArrowRight,
  Github,
  Twitter,
  Linkedin,
  Mail,
  Zap,
  Shield,
  Clock,
  MessageSquare,
  LogOut,
  User,
  Lock,
  LayoutDashboard,
  Settings,
  Bell,
  ChevronRight,
  Plus,
  FileText,
  PieChart,
  Globe
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar,
  Cell,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  LineChart,
  Line
} from 'recharts';
import { cn } from './lib/utils';
import { auth, db } from './firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

// --- Mock Data ---
const skillTrends = [
  { name: 'Generative AI', growth: 450, score: 98, color: '#3b82f6' },
  { name: 'Cloud Architecture', growth: 120, score: 85, color: '#8b5cf6' },
  { name: 'Cybersecurity', growth: 85, score: 92, color: '#10b981' },
  { name: 'Data Engineering', growth: 180, score: 88, color: '#f59e0b' },
  { name: 'Quantum Computing', growth: 320, score: 75, color: '#ec4899' },
];

const demandHistory = [
  { year: '2023', demand: 45 },
  { year: '2024', demand: 52 },
  { year: '2025', demand: 68 },
  { year: '2026 (Est)', demand: 85 },
  { year: '2027 (Est)', demand: 94 },
];

const radarData = [
  { subject: 'Technical Depth', A: 120, fullMark: 150 },
  { subject: 'Market Alignment', A: 98, fullMark: 150 },
  { subject: 'Soft Skills', A: 86, fullMark: 150 },
  { subject: 'Tool Proficiency', A: 99, fullMark: 150 },
  { subject: 'Project Impact', A: 85, fullMark: 150 },
  { subject: 'Future Readiness', A: 65, fullMark: 150 },
];

const emergingSkills = [
  { name: 'AI Safety Engineering', growth: 850, adoption: 12, demand: 'High', color: '#3b82f6' },
  { name: 'Quantum Machine Learning', growth: 420, adoption: 5, demand: 'Medium', color: '#8b5cf6' },
  { name: 'Spatial Computing', growth: 310, adoption: 18, demand: 'High', color: '#10b981' },
  { name: 'AI Governance Specialist', growth: 640, adoption: 25, demand: 'Critical', color: '#f59e0b' },
  { name: 'Edge AI Developer', growth: 280, adoption: 32, demand: 'High', color: '#ec4899' },
];

const lifecycleSkills = [
  { name: 'PHP', status: 'declining', growth: -15, risk: 85, trend: [20, 18, 15, 12, 10] },
  { name: 'Prompt Engineering', status: 'growing', growth: 320, risk: 5, trend: [5, 15, 45, 120, 320] },
  { name: 'Data Science', status: 'stable', growth: 12, risk: 20, trend: [40, 42, 45, 48, 50] },
  { name: 'React.js', status: 'stable', growth: 8, risk: 15, trend: [60, 62, 65, 68, 70] },
  { name: 'COBOL', status: 'declining', growth: -5, risk: 95, trend: [10, 9, 8, 7, 6] },
];

const roiData = [
  { month: 'Current', salary: 45000 },
  { month: 'Month 2', salary: 48000 },
  { month: 'Month 4', salary: 65000 },
  { month: 'Month 6', salary: 95000 },
  { month: 'Year 1', salary: 145000 },
];

const mobilityData = [
  { country: 'USA', demand: 95, supply: 40, salary: '$140k' },
  { country: 'Germany', demand: 82, supply: 35, salary: '€85k' },
  { country: 'India', demand: 98, supply: 60, salary: '₹35L' },
  { country: 'Singapore', demand: 88, supply: 30, salary: '$110k' },
  { country: 'UK', demand: 75, supply: 45, salary: '£75k' },
];

// --- Gemini Setup ---
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
const model = genAI.models.get({ model: "gemini-3-flash-preview" });

// --- Auth Context & Provider ---
interface UserProfile {
  uid: string;
  email: string;
  role: 'student' | 'company' | 'admin';
  displayName?: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const docRef = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }: { isOpen: boolean, onClose: () => void, initialMode?: 'login' | 'signup' }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [role, setRole] = useState<'student' | 'company' | 'admin'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          email,
          role,
          createdAt: serverTimestamp()
        });
      }
      onClose();
    } catch (err: any) {
      if (err.code === 'auth/network-request-failed') {
        setError('Network error: Please check your internet connection or disable any ad-blockers/VPNs that might be blocking Firebase.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass w-full max-w-md rounded-3xl p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600" />
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <Plus className="w-6 h-6 rotate-45" />
        </button>

        <h2 className="text-2xl font-bold mb-2">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
        <p className="text-slate-400 text-sm mb-6">Access your personalized FutureSkill dashboard.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="flex gap-2 p-1 bg-white/5 rounded-xl mb-4">
              {(['student', 'company', 'admin'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={cn(
                    "flex-1 py-2 text-xs font-bold rounded-lg transition-all capitalize",
                    role === r ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-xs font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-sm text-slate-400 hover:text-blue-400 transition-colors"
          >
            {mode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// --- Dashboard Components ---

const DashboardLayout = ({ children, title }: { children: React.ReactNode, title: string }) => {
  const { profile, logout } = useAuth();
  
  return (
    <div className="min-h-screen bg-[#050505] text-white flex">
      {/* Sidebar */}
      <aside className="w-64 glass border-r border-white/5 flex flex-col hidden lg:flex">
        <div className="p-6 flex items-center gap-2 border-b border-white/5">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Brain className="text-white w-5 h-5" />
          </div>
          <span className="text-lg font-bold">FutureSkill</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600 text-white font-medium">
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all">
            <TrendingUp className="w-5 h-5" /> Market Trends
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all">
            <Target className="w-5 h-5" /> Skill Analysis
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all">
            <Users className="w-5 h-5" /> Networking
          </button>
          <div className="pt-4 border-t border-white/5 mt-4">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all">
              <Settings className="w-5 h-5" /> Settings
            </button>
            <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all">
              <LogOut className="w-5 h-5" /> Logout
            </button>
          </div>
        </nav>
        
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 p-3 glass rounded-2xl">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold">
              {profile?.email[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{profile?.email.split('@')[0]}</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold">{profile?.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 glass border-b border-white/5 flex items-center justify-between px-8">
          <h1 className="text-lg font-bold">{title}</h1>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-white relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#050505]" />
            </button>
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <User className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </header>
        
        <div className="flex-1 p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

const StudentDashboard = () => (
  <DashboardLayout title="Student Dashboard">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <div className="glass rounded-3xl p-8 bg-gradient-to-br from-blue-600/10 to-transparent">
          <h2 className="text-2xl font-bold mb-2">Welcome back, Future Leader! 🚀</h2>
          <p className="text-slate-400 mb-6">Your skill readiness has increased by 12% this month. Keep up the great work!</p>
          <div className="flex gap-4">
            <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all">
              Continue Roadmap
            </button>
            <button className="glass hover:bg-white/5 text-white px-6 py-3 rounded-xl font-bold transition-all">
              View Certificates
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass rounded-3xl p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-400" /> Current Focus
            </h3>
            <div className="space-y-4">
              {['Advanced React Patterns', 'System Design', 'MLOps Basics'].map((skill, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <span className="text-sm">{skill}</span>
                  <span className="text-[10px] font-bold text-blue-400 uppercase">In Progress</span>
                </div>
              ))}
            </div>
          </div>
          <div className="glass rounded-3xl p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" /> Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all text-center">
                <FileText className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                <span className="text-[10px] font-bold uppercase">Analyze CV</span>
              </button>
              <button className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all text-center">
                <MessageSquare className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                <span className="text-[10px] font-bold uppercase">AI Mentor</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="glass rounded-3xl p-6">
          <h3 className="font-bold mb-4">Skill Readiness</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#ffffff10" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Radar name="Skills" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="glass rounded-3xl p-6">
          <h3 className="font-bold mb-4">Upcoming Events</h3>
          <div className="space-y-4">
            <div className="flex gap-4 p-3 bg-white/5 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex flex-col items-center justify-center text-blue-400">
                <span className="text-xs font-bold">12</span>
                <span className="text-[8px] uppercase">Mar</span>
              </div>
              <div>
                <p className="text-sm font-bold">AI Career Fair</p>
                <p className="text-[10px] text-slate-500">Virtual Event • 2:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
);

const CompanyDashboard = () => (
  <DashboardLayout title="Organization Dashboard">
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <div className="glass rounded-3xl p-6 border-l-4 border-blue-500">
          <p className="text-slate-400 text-xs font-bold uppercase mb-1">Total Applicants</p>
          <h3 className="text-3xl font-bold">1,284</h3>
          <p className="text-emerald-400 text-[10px] font-bold mt-2">↑ 14% from last month</p>
        </div>
        <div className="glass rounded-3xl p-6 border-l-4 border-purple-500">
          <p className="text-slate-400 text-xs font-bold uppercase mb-1">Skill Match Rate</p>
          <h3 className="text-3xl font-bold">76%</h3>
          <p className="text-emerald-400 text-[10px] font-bold mt-2">↑ 5% optimization</p>
        </div>
        <div className="glass rounded-3xl p-6 border-l-4 border-emerald-500">
          <p className="text-slate-400 text-xs font-bold uppercase mb-1">Active Postings</p>
          <h3 className="text-3xl font-bold">24</h3>
          <p className="text-slate-500 text-[10px] font-bold mt-2">Across 4 departments</p>
        </div>
      </div>

      <div className="lg:col-span-3 space-y-8">
        <div className="glass rounded-3xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold">Talent Pipeline Trends</h3>
            <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-xs outline-none">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={demandHistory}>
                <defs>
                  <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="demand" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorDemand)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-3xl p-8">
          <h3 className="text-xl font-bold mb-6">Top Talent Matches</h3>
          <div className="space-y-4">
            {[
              { name: 'Alex Rivera', role: 'AI Engineer', score: 98, skills: ['PyTorch', 'Rust', 'MLOps'] },
              { name: 'Sarah Chen', role: 'Data Architect', score: 94, skills: ['Snowflake', 'Python', 'AWS'] },
              { name: 'Marcus Thorne', role: 'Product Manager', score: 91, skills: ['Agile', 'AI Ethics', 'Strategy'] },
            ].map((talent, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold">
                    {talent.name[0]}
                  </div>
                  <div>
                    <p className="font-bold">{talent.name}</p>
                    <p className="text-xs text-slate-500">{talent.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="hidden md:flex gap-2">
                    {talent.skills.map(s => (
                      <span key={s} className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded-md text-[8px] font-bold uppercase">{s}</span>
                    ))}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-500">{talent.score}%</p>
                    <p className="text-[8px] text-slate-500 uppercase font-bold">Match</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
);

const AdminDashboard = () => (
  <DashboardLayout title="System Administration">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass rounded-3xl p-6">
            <Users className="w-8 h-8 text-blue-500 mb-4" />
            <h4 className="text-slate-400 text-xs font-bold uppercase">Total Users</h4>
            <p className="text-2xl font-bold">42,891</p>
          </div>
          <div className="glass rounded-3xl p-6">
            <Globe className="w-8 h-8 text-purple-500 mb-4" />
            <h4 className="text-slate-400 text-xs font-bold uppercase">Active Regions</h4>
            <p className="text-2xl font-bold">124</p>
          </div>
          <div className="glass rounded-3xl p-6">
            <Shield className="w-8 h-8 text-emerald-500 mb-4" />
            <h4 className="text-slate-400 text-xs font-bold uppercase">System Health</h4>
            <p className="text-2xl font-bold">99.9%</p>
          </div>
        </div>

        <div className="glass rounded-3xl p-8">
          <h3 className="text-xl font-bold mb-6">User Growth Analytics</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip cursor={{ fill: '#ffffff05' }} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }} />
                <Bar dataKey="growth" radius={[4, 4, 0, 0]}>
                  {skillTrends.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="glass rounded-3xl p-6">
          <h3 className="font-bold mb-4">Recent System Logs</h3>
          <div className="space-y-4">
            {[
              { event: 'New Company Verified', time: '2 mins ago', type: 'success' },
              { event: 'API Usage Spike', time: '15 mins ago', type: 'warning' },
              { event: 'Database Backup', time: '1 hour ago', type: 'info' },
              { event: 'Security Patch Applied', time: '3 hours ago', type: 'success' },
            ].map((log, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className={cn(
                  "w-2 h-2 rounded-full mt-1.5",
                  log.type === 'success' ? 'bg-emerald-500' :
                  log.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                )} />
                <div>
                  <p className="text-xs font-bold">{log.event}</p>
                  <p className="text-[10px] text-slate-500">{log.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-3xl p-6">
          <h3 className="font-bold mb-4">Pending Verifications</h3>
          <div className="space-y-3">
            {['Stanford University', 'TechFlow Inc.', 'MIT Global'].map((org, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <span className="text-xs">{org}</span>
                <button className="text-[10px] font-bold text-blue-400 hover:underline">Review</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
);
const CheckoutPage = ({ plan, onBack }: { plan: any, onBack: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { profile } = useAuth();

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate payment
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 2000);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass max-w-md w-full p-10 rounded-[40px] text-center"
        >
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-white">Payment Successful!</h2>
          <p className="text-slate-400 mb-8">Welcome to the {plan.name}. Your account has been upgraded successfully.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold transition-all"
          >
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
          <ArrowRight className="w-4 h-4 rotate-180" /> Back to Plans
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Complete Your Order</h2>
              <p className="text-slate-400">Secure checkout for {plan.name}</p>
            </div>

            <div className="glass p-8 rounded-3xl space-y-6">
              <div className="flex justify-between items-center pb-6 border-b border-white/5">
                <div>
                  <h3 className="font-bold">{plan.name}</h3>
                  <p className="text-xs text-slate-500">Monthly Subscription</p>
                </div>
                <p className="text-xl font-bold">{plan.price}</p>
              </div>
              <div className="space-y-3">
                {plan.features.map((f: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-400">
                    <CheckCircle2 className="w-3 h-3 text-blue-500" /> {f}
                  </div>
                ))}
              </div>
              <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                <span className="font-bold">Total Due Today</span>
                <span className="text-2xl font-bold text-blue-500">{plan.price}</span>
              </div>
            </div>
          </div>

          <div className="glass p-8 rounded-3xl">
            <h3 className="text-xl font-bold mb-6">Payment Details</h3>
            <form onSubmit={handlePayment} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cardholder Name</label>
                <input 
                  type="text" 
                  required 
                  defaultValue={profile?.displayName || ""}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors" 
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Card Number</label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    required 
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-blue-500 transition-colors" 
                    placeholder="0000 0000 0000 0000"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Expiry Date</label>
                  <input 
                    type="text" 
                    required 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors" 
                    placeholder="MM/YY"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">CVV</label>
                  <input 
                    type="text" 
                    required 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors" 
                    placeholder="123"
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 mt-6 disabled:opacity-50"
              >
                {loading ? "Processing..." : `Pay ${plan.price}`}
              </button>
              <p className="text-[10px] text-slate-500 text-center mt-4">
                By clicking pay, you agree to our Terms of Service and Privacy Policy.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const Navbar = ({ onAuthClick }: { onAuthClick: (mode: 'login' | 'signup') => void }) => {
  const { user, profile, logout } = useAuth();
  
  return (
    <nav className="fixed top-0 w-full z-50 glass border-b border-white/5 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Brain className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold font-display tracking-tight">FutureSkill <span className="text-blue-500">AI</span></span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
          <a href="#trends" className="hover:text-white transition-colors">Trends</a>
          <a href="#analyzer" className="hover:text-white transition-colors">Analyzer</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-400 hidden sm:inline-block">
                {profile?.role.toUpperCase()}
              </span>
              <button 
                onClick={logout}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <>
              <button 
                onClick={() => onAuthClick('login')}
                className="text-slate-400 hover:text-white text-sm font-semibold transition-colors"
              >
                Login
              </button>
              <button 
                onClick={() => onAuthClick('signup')}
                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-full text-sm font-semibold transition-all shadow-lg shadow-blue-500/20"
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const Hero = () => (
  <section className="relative pt-32 pb-20 px-6 overflow-hidden">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 bg-gradient-mesh opacity-50" />
    <div className="max-w-5xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6">
          Predicting Tomorrow's Skills Today
        </span>
        <h1 className="text-5xl md:text-7xl font-display font-bold mb-8 leading-tight">
          Don’t Prepare for <span className="text-slate-500">Yesterday’s</span> Jobs. <br />
          <span className="text-gradient">Prepare for Tomorrow’s.</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          FutureSkill AI uses advanced predictive intelligence to forecast the global job market 3 years ahead, 
          helping you master the skills that will actually matter.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="#portfolio" className="w-full sm:w-auto bg-white text-dark px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-200 transition-all flex items-center justify-center gap-2 group">
            Check My Future Skill Score
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
          <a href="#trends" className="w-full sm:w-auto glass px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center">
            View Industry Trends
          </a>
        </div>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="mt-20 relative"
      >
        <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full -z-10" />
        <div className="glass rounded-2xl p-4 md:p-8 border-white/10 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="text-xs text-slate-500 font-mono">SKILL_PREDICTION_ENGINE_V2.4</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="h-32 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/5 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white">94%</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-tighter">Prediction Accuracy</span>
              </div>
              <div className="h-32 rounded-xl bg-white/5 border border-white/5 p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] text-slate-400 uppercase">Active Nodes</span>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-[80%] bg-emerald-500" />
                  </div>
                  <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-[65%] bg-blue-500" />
                  </div>
                  <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-[90%] bg-purple-500" />
                  </div>
                </div>
              </div>
            </div>
            <div className="md:col-span-2 h-full min-h-[200px] rounded-xl bg-white/5 border border-white/5 p-4">
               <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={demandHistory}>
                  <defs>
                    <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="year" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#3b82f6' }}
                  />
                  <Area type="monotone" dataKey="demand" stroke="#3b82f6" fillOpacity={1} fill="url(#colorDemand)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

const HowItWorks = () => {
  const steps = [
    {
      icon: <Search className="w-6 h-6 text-blue-400" />,
      title: "AI Scans Global Job Markets",
      desc: "Our engine processes millions of job postings, patent filings, and tech blogs daily."
    },
    {
      icon: <Cpu className="w-6 h-6 text-purple-400" />,
      title: "Extracts & Clusters Skills",
      desc: "Advanced NLP identifies emerging skill clusters before they become mainstream."
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-emerald-400" />,
      title: "Forecasts Future Demand",
      desc: "Predictive models calculate the growth trajectory of skills for the next 1-3 years."
    },
    {
      icon: <Map className="w-6 h-6 text-orange-400" />,
      title: "Generates Career Roadmap",
      desc: "Receive a personalized, step-by-step learning path to bridge your specific skill gaps."
    }
  ];

  return (
    <section id="how-it-works" className="py-24 px-6 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">How It Works</h2>
          <p className="text-slate-400">The science behind predicting your future career success.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -10 }}
              className="glass p-8 rounded-2xl glass-hover relative group"
            >
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-xl bg-dark border border-white/10 flex items-center justify-center shadow-xl group-hover:border-blue-500/50 transition-colors">
                {step.icon}
              </div>
              <div className="mt-4">
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const SkillHeatmap = () => {
  const [horizon, setHorizon] = React.useState('2 years');
  
  return (
    <section id="trends" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Skill Demand Heatmap</h2>
            <p className="text-slate-400">Real-time predictive analytics for the tech industry.</p>
          </div>
          <div className="flex gap-2 p-1 bg-white/5 rounded-lg border border-white/10">
            {['1 year', '2 years', '3 years'].map((h) => (
              <button
                key={h}
                onClick={() => setHorizon(h)}
                className={cn(
                  "px-4 py-2 rounded-md text-xs font-bold transition-all",
                  horizon === h ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                )}
              >
                {h}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 glass rounded-2xl p-6 md:p-8">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillTrends} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    width={120}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    cursor={{ fill: '#ffffff05' }}
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                  />
                  <Bar dataKey="growth" radius={[0, 4, 4, 0]} barSize={32}>
                    {skillTrends.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="glass rounded-2xl p-6">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Top Trending Skill</h4>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">Generative AI</div>
                  <div className="text-emerald-400 text-sm font-medium flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" /> +450% Growth
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full border-2 border-blue-500 flex items-center justify-center text-blue-500 font-bold">
                  98
                </div>
              </div>
            </div>
            
            <div className="glass rounded-2xl p-6">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Market Saturation</h4>
              <div className="space-y-4">
                {skillTrends.slice(0, 3).map((skill, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span>{skill.name}</span>
                      <span className="text-slate-500">{skill.score}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500" 
                        style={{ width: `${skill.score}%`, backgroundColor: skill.color }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl p-6 text-white">
              <h4 className="font-bold mb-2">Unlock Full Report</h4>
              <p className="text-sm text-white/80 mb-4">Get detailed insights into 500+ skills and industry-specific forecasts.</p>
              <button className="w-full py-2 bg-white text-blue-600 rounded-lg font-bold text-sm hover:bg-slate-100 transition-colors">
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const SkillAnalyzer = () => {
  const [analyzing, setAnalyzing] = React.useState(false);
  const [result, setResult] = React.useState<any>(null);
  const [formData, setFormData] = React.useState({
    degree: '',
    industry: 'AI & Robotics',
    skills: '',
    goal: ''
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnalyzing(true);

    try {
      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze the skill gap for the following user profile:
        Degree: ${formData.degree}
        Target Industry: ${formData.industry}
        Current Skills: ${formData.skills}
        Career Goal: ${formData.goal}
        
        Return a JSON object:
        {
          "gapScore": number (0-100, where 100 means no gap),
          "missingSkills": string[],
          "roadmap": [{ "step": string, "desc": string }],
          "resources": string[]
        }`,
        config: {
          responseMimeType: "application/json",
        }
      });

      const data = JSON.parse(response.text || "{}");
      setResult(data);
    } catch (error) {
      console.error("Gap Analysis Error:", error);
      setResult({
        gapScore: 45,
        missingSkills: ['PyTorch', 'MLOps', 'Vector Databases'],
        roadmap: [{ step: 'Master Python for AI', desc: 'Focus on NumPy and Pandas.' }],
        resources: ['Coursera: Deep Learning Specialization']
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <section id="analyzer" className="py-24 px-6 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Personalized Skill Gap Analyzer</h2>
          <p className="text-slate-400">Discover exactly what you need to learn for your dream role.</p>
        </div>

        {!result ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto glass p-8 rounded-3xl"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Current Degree</label>
                  <input 
                    type="text" 
                    value={formData.degree}
                    onChange={(e) => setFormData({...formData, degree: e.target.value})}
                    placeholder="e.g. B.Tech Computer Science" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Preferred Industry</label>
                  <select 
                    value={formData.industry}
                    onChange={(e) => setFormData({...formData, industry: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                  >
                    <option>FinTech</option>
                    <option>HealthTech</option>
                    <option>EdTech</option>
                    <option>Web3 & Crypto</option>
                    <option>AI & Robotics</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Known Skills</label>
                <input 
                  type="text" 
                  value={formData.skills}
                  onChange={(e) => setFormData({...formData, skills: e.target.value})}
                  placeholder="e.g. Python, React, SQL" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Career Goal</label>
                <input 
                  type="text" 
                  value={formData.goal}
                  onChange={(e) => setFormData({...formData, goal: e.target.value})}
                  placeholder="e.g. Senior AI Engineer" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors" 
                />
              </div>
              <button 
                type="submit" 
                disabled={analyzing}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
              >
                {analyzing ? "Analyzing Skill Gap..." : "Analyze My Skill Gap"}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-1 glass rounded-3xl p-8 flex flex-col items-center justify-center text-center">
              <div className="relative w-40 h-40 mb-6">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                  <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={440} strokeDashoffset={440 - (440 * (100 - result.gapScore)) / 100} className="text-blue-500 transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold">{100 - result.gapScore}%</span>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Skill Gap</span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">Readiness Level</h3>
              <p className="text-slate-400 text-sm mb-6">You are {result.gapScore}% ready for your target role.</p>
              <button onClick={() => setResult(null)} className="text-blue-400 text-xs font-bold hover:underline">Start New Analysis</button>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="glass rounded-3xl p-8">
                <h4 className="font-bold mb-6 flex items-center gap-2">
                  <Map className="w-5 h-5 text-blue-400" /> Your Personalized Learning Roadmap
                </h4>
                <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/5">
                  {result.roadmap.map((step: any, i: number) => (
                    <div key={i} className="relative pl-10">
                      <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold z-10">
                        {i + 1}
                      </div>
                      <h5 className="font-bold text-sm mb-1">{step.step}</h5>
                      <p className="text-xs text-slate-500">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass rounded-3xl p-6">
                  <h4 className="font-bold mb-4 text-red-400 text-sm">Critical Skills to Acquire</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.missingSkills.map((s: string) => (
                      <span key={s} className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-[10px] font-bold">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="glass rounded-3xl p-6">
                  <h4 className="font-bold mb-4 text-emerald-400 text-sm">Recommended Resources</h4>
                  <ul className="text-[10px] text-slate-400 space-y-2">
                    {result.resources.map((res: string, i: number) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" /> {res}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

const EmergingSkillRadar = () => (
  <section id="radar" className="py-24 px-6 bg-white/[0.02]">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Emerging Skill Radar</h2>
        <p className="text-slate-400">Live trend detection system identifying sudden spikes in global job postings.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="glass rounded-3xl p-8 h-[500px] relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <div className="w-[400px] h-[400px] border border-blue-500/30 rounded-full animate-ping" />
            <div className="absolute w-[300px] h-[300px] border border-blue-500/20 rounded-full" />
            <div className="absolute w-[200px] h-[200px] border border-blue-500/10 rounded-full" />
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="#ffffff10" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
              <Radar
                name="Market Demand"
                dataKey="A"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.5}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" /> Newly Emerging This Month
          </h3>
          {emergingSkills.map((skill, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass p-4 rounded-2xl flex items-center justify-between group hover:border-blue-500/30 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-lg", `bg-gradient-to-br from-${skill.color} to-black`)} style={{ backgroundColor: skill.color }}>
                  {skill.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-sm">{skill.name}</div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Adoption: {skill.adoption}%</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-emerald-400 text-sm font-bold">+{skill.growth}%</div>
                <div className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 inline-block uppercase font-bold">
                  {skill.demand} Demand
                </div>
              </div>
            </motion.div>
          ))}
          <button className="w-full mt-4 py-3 glass rounded-xl text-sm font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2">
            View Full Radar Map <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </section>
);

const PortfolioAnalyzer = () => {
  const [analyzing, setAnalyzing] = React.useState(false);
  const [result, setResult] = React.useState<any>(null);
  const [resumeText, setResumeText] = React.useState('');

  const handleAnalyze = async () => {
    if (!resumeText.trim()) return;
    setAnalyzing(true);
    
    try {
      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze the following resume text for a future-ready tech career (2-3 years ahead). 
        Return a JSON object with the following structure:
        {
          "readinessScore": number (0-100),
          "keywordScore": number (0-100),
          "impactScore": number (0-100),
          "missingSkills": string[],
          "improvements": string[],
          "suggestedProjects": [{ "title": string, "desc": string }]
        }
        
        Resume Text: ${resumeText}`,
        config: {
          responseMimeType: "application/json",
        }
      });

      const data = JSON.parse(response.text || "{}");
      setResult(data);
    } catch (error) {
      console.error("Analysis Error:", error);
      // Fallback to mock data if API fails
      setResult({
        readinessScore: 75,
        keywordScore: 88,
        impactScore: 65,
        missingSkills: ['Kubernetes', 'LLM Fine-tuning', 'Rust'],
        improvements: ['Quantify impact in Experience section', 'Add Cloud Architecture to header'],
        suggestedProjects: [{ title: 'Scalable RAG Pipeline', desc: 'Implement a vector database with LangChain.' }]
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <section id="portfolio" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Analyze My Skill Portfolio</h2>
          <p className="text-slate-400">Professional AI assessment of your resume and LinkedIn profile.</p>
        </div>

        {!result ? (
          <div className="max-w-3xl mx-auto glass rounded-3xl p-10 border-dashed border-2 border-white/10 hover:border-blue-500/30 transition-all text-center">
            <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Paste Your Resume</h3>
            <p className="text-slate-400 mb-8">Paste your resume text or LinkedIn summary to start the deep AI analysis.</p>
            
            <div className="space-y-4 mb-8">
              <textarea 
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume content here..."
                className="w-full h-48 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors resize-none text-sm"
              />
            </div>

            <button 
              onClick={handleAnalyze}
              disabled={analyzing || !resumeText.trim()}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              {analyzing ? "Analyzing Portfolio..." : "Analyze Portfolio"}
            </button>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-1 glass rounded-3xl p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-4 border-blue-500 mb-4">
                  <span className="text-4xl font-bold">{result.readinessScore}%</span>
                </div>
                <h3 className="text-xl font-bold">Market Readiness</h3>
                <p className="text-slate-500 text-xs uppercase font-bold tracking-widest mt-1">AI Assessment Score</p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Keyword Optimization</span>
                    <span className="text-blue-400 font-bold">{result.keywordScore}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${result.keywordScore}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Impact Score</span>
                    <span className="text-purple-400 font-bold">{result.impactScore}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500" style={{ width: `${result.impactScore}%` }} />
                  </div>
                </div>
              </div>
              <button onClick={() => setResult(null)} className="w-full mt-8 py-2 text-blue-400 text-xs font-bold hover:underline">Analyze Another Resume</button>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass rounded-3xl p-6">
                  <h4 className="font-bold mb-4 text-red-400 flex items-center gap-2">
                    <Shield className="w-4 h-4" /> Missing High-Demand Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.missingSkills.map((s: string) => (
                      <span key={s} className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-[10px] font-bold">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="glass rounded-3xl p-6">
                  <h4 className="font-bold mb-4 text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Resume Improvements
                  </h4>
                  <ul className="text-xs text-slate-400 space-y-2">
                    {result.improvements.map((imp: string, i: number) => (
                      <li key={i}>• {imp}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="glass rounded-3xl p-8">
                <h4 className="font-bold mb-6 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-400" /> Suggested Projects to Improve Profile
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.suggestedProjects.map((proj: any, i: number) => (
                    <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all">
                      <h5 className="font-bold text-sm mb-1">{proj.title}</h5>
                      <p className="text-[10px] text-slate-500">{proj.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

const AIMentor = () => {
  const [messages, setMessages] = React.useState([
    { role: 'ai', text: "Hello! I'm your FutureSkill AI Mentor. How can I help you navigate your career today?" }
  ]);
  const [input, setInput] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;
    
    const userMessage = { role: 'user', text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const chat = genAI.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: "You are an expert AI Career Mentor for FutureSkill AI. You help students and professionals navigate their career by predicting future skill demands, suggesting project ideas, and explaining market trends. Be encouraging, data-driven, and concise. Your goal is to help users prepare for tomorrow's jobs today.",
        },
      });

      // We send the current message. In a real app we might send history too.
      const response = await chat.sendMessage({ message: text });
      const aiText = response.text || "I'm sorry, I couldn't process that. Could you try rephrasing?";
      
      setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
    } catch (error) {
      console.error("Gemini Error:", error);
      setMessages(prev => [...prev, { role: 'ai', text: "I'm having trouble connecting to my knowledge base right now. Please try again in a moment." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <section id="mentor" className="py-24 px-6 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">AI Mentor Mode</h2>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              Your 24/7 intelligent career advisor. Get personalized project ideas, internship recommendations, and real-time market insights.
            </p>
            <div className="space-y-4">
              {[
                "Suggest a project for Generative AI",
                "Why is Rust becoming popular?",
                "Recommend internships for Web3",
                "What are the next steps in my roadmap?"
              ].map((prompt, i) => (
                <button 
                  key={i}
                  onClick={() => handleSend(prompt)}
                  className="block w-full text-left px-6 py-3 glass rounded-xl text-sm font-medium hover:bg-white/10 transition-all border-l-4 border-l-blue-500"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="glass rounded-[32px] overflow-hidden flex flex-col h-[600px] shadow-2xl border-white/10">
            <div className="p-6 border-b border-white/5 flex items-center gap-4 bg-white/5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Brain className="text-white w-6 h-6" />
              </div>
              <div>
                <div className="font-bold">AI Career Mentor</div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online & Learning
                </div>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed",
                    msg.role === 'user' ? "bg-blue-600 text-white rounded-tr-none" : "glass rounded-tl-none"
                  )}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="glass p-4 rounded-2xl rounded-tl-none flex gap-1">
                    <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-white/5 bg-white/5">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask your career mentor..." 
                  className="flex-1 bg-dark border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors" 
                />
                <button 
                  onClick={() => handleSend()}
                  className="bg-blue-600 p-3 rounded-xl hover:bg-blue-500 transition-colors"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const SkillLifecycle = () => (
  <section id="lifecycle" className="py-24 px-6">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Skill Lifecycle Intelligence</h2>
        <p className="text-slate-400">Real-time tracking of skill evolution, demand growth, and automation risk.</p>
      </div>

      <div className="glass rounded-3xl overflow-hidden border-white/5">
        <div className="grid grid-cols-5 p-6 border-b border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          <div className="col-span-1">Skill Name</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1 text-center">3-Year Trend</div>
          <div className="col-span-1 text-center">Growth</div>
          <div className="col-span-1 text-center">Automation Risk</div>
        </div>
        <div className="divide-y divide-white/5">
          {lifecycleSkills.map((skill, i) => (
            <div key={i} className="grid grid-cols-5 p-6 items-center hover:bg-white/[0.02] transition-colors">
              <div className="col-span-1 font-bold">{skill.name}</div>
              <div className="col-span-1">
                <span className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase border",
                  skill.status === 'growing' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                  skill.status === 'stable' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                  "bg-red-500/10 text-red-400 border-red-500/20"
                )}>
                  {skill.status}
                </span>
              </div>
              <div className="col-span-1 h-12">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={skill.trend.map((v, idx) => ({ v, idx }))}>
                    <Line 
                      type="monotone" 
                      dataKey="v" 
                      stroke={skill.status === 'growing' ? '#10b981' : skill.status === 'stable' ? '#3b82f6' : '#ef4444'} 
                      strokeWidth={2} 
                      dot={false} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className={cn("col-span-1 text-center font-bold", skill.growth > 0 ? "text-emerald-400" : "text-red-400")}>
                {skill.growth > 0 ? "+" : ""}{skill.growth}%
              </div>
              <div className="col-span-1 px-8">
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500" style={{ width: `${skill.risk}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const ROIPredictor = () => (
  <section id="roi" className="py-24 px-6 bg-blue-600/5">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6">
            Financial Impact Analysis
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 leading-tight">
            The <span className="text-emerald-400">ROI</span> of Your Learning Journey.
          </h2>
          <p className="text-slate-400 text-lg mb-8 leading-relaxed">
            We don't just suggest skills; we predict your future market value. Our AI calculates the direct correlation between skill acquisition and salary growth.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass p-6 rounded-2xl border-emerald-500/20">
              <div className="text-3xl font-bold text-emerald-400 mb-1">3.2x</div>
              <div className="text-xs text-slate-500 uppercase font-bold">Avg. Salary Increase</div>
            </div>
            <div className="glass p-6 rounded-2xl border-blue-500/20">
              <div className="text-3xl font-bold text-blue-400 mb-1">45 Days</div>
              <div className="text-xs text-slate-500 uppercase font-bold">Time to Break-even</div>
            </div>
          </div>
        </div>

        <div className="glass rounded-3xl p-8 h-[400px] relative overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-sm uppercase tracking-widest text-slate-500">Projected Market Value</h3>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <TrendingUp className="w-4 h-4" /> +220% Growth
            </div>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={roiData}>
              <defs>
                <linearGradient id="colorSalary" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Market Value']}
              />
              <Area type="monotone" dataKey="salary" stroke="#10b981" fillOpacity={1} fill="url(#colorSalary)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  </section>
);

const GlobalMobility = () => (
  <section id="mobility" className="py-24 px-6">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Global Talent Mobility Map</h2>
        <p className="text-slate-400">Discover where your skills are most valuable across the globe.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass rounded-3xl p-8 min-h-[400px] flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
             <div className="w-full h-full bg-[url('https://picsum.photos/seed/worldmap/1200/800')] bg-cover bg-center grayscale" />
          </div>
          <div className="relative z-10 text-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Map className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Interactive Talent Scarcity Map</h3>
            <p className="text-slate-500 text-sm">Our AI analyzes 180+ countries to find the best market for your profile.</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Top Arbitrage Markets</h3>
          {mobilityData.map((item, i) => (
            <div key={i} className="glass p-4 rounded-2xl flex items-center justify-between group hover:border-blue-500/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold">
                  {item.country.substring(0, 2)}
                </div>
                <div>
                  <div className="font-bold text-sm">{item.country}</div>
                  <div className="text-[10px] text-slate-500">Avg. {item.salary}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-blue-400 text-xs font-bold">{item.demand}% Demand</div>
                <div className="h-1 w-16 bg-white/5 rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${item.demand}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const CollegeAlignment = () => {
  const [analyzing, setAnalyzing] = React.useState(false);
  const [result, setResult] = React.useState<any>(null);
  const [syllabusText, setSyllabusText] = React.useState('');
  const [industry, setIndustry] = React.useState('Artificial Intelligence');

  const handleAnalyze = async () => {
    if (!syllabusText.trim()) return;
    setAnalyzing(true);

    try {
      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze the following college syllabus text for alignment with the ${industry} industry.
        Return a JSON object:
        {
          "matchScore": number (0-100),
          "grade": string (e.g. A, B-, C+),
          "outdatedTopics": string[],
          "improvements": string[]
        }
        
        Syllabus Text: ${syllabusText}`,
        config: {
          responseMimeType: "application/json",
        }
      });

      const data = JSON.parse(response.text || "{}");
      setResult(data);
    } catch (error) {
      console.error("College Analysis Error:", error);
      setResult({
        matchScore: 48,
        grade: 'B-',
        outdatedTopics: ['Manual Testing Basics', 'Legacy PHP Frameworks'],
        improvements: ['Add LLMOps Module', 'Integrate Rust for Systems']
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <section id="college" className="py-24 px-6 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            {!result ? (
              <div className="glass rounded-3xl p-10">
                <h3 className="text-2xl font-bold mb-6">College Industry Alignment</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Paste Syllabus Content</label>
                    <textarea 
                      value={syllabusText}
                      onChange={(e) => setSyllabusText(e.target.value)}
                      placeholder="Paste syllabus text here..."
                      className="w-full h-32 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors resize-none text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Target Industry</label>
                    <select 
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                    >
                      <option>Artificial Intelligence</option>
                      <option>Cloud Computing</option>
                      <option>Cybersecurity</option>
                      <option>Data Science</option>
                    </select>
                  </div>
                  <button 
                    onClick={handleAnalyze}
                    disabled={analyzing || !syllabusText.trim()}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50"
                  >
                    {analyzing ? "Analyzing Alignment..." : "Analyze Alignment"}
                  </button>
                </div>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass rounded-3xl p-8 space-y-8"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-4xl font-bold text-purple-400">{result.matchScore}%</div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Industry Match Score</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{result.grade}</div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Future-Ready Grade</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-red-400">Outdated Topics Detected</h4>
                  <div className="space-y-2">
                    {result.outdatedTopics.map((t: string) => (
                      <div key={t} className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl text-xs text-slate-400 flex justify-between">
                        {t} <span className="text-red-400 font-bold">Replace</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-emerald-400">Suggested Curriculum Improvements</h4>
                  <div className="space-y-2">
                    {result.improvements.map((t: string) => (
                      <div key={t} className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-xs text-slate-400 flex justify-between">
                        {t} <span className="text-emerald-400 font-bold">High Impact</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={() => setResult(null)} className="w-full py-2 text-purple-400 text-xs font-bold hover:underline">Analyze Another Syllabus</button>
              </motion.div>
            )}
          </div>

          <div className="order-1 lg:order-2">
            <span className="inline-block px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-widest mb-6">
              B2B Enterprise Feature
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 leading-tight">
              Bridge the Gap Between <span className="text-purple-400">Education</span> & <span className="text-emerald-400">Industry</span>.
            </h2>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              Colleges can now audit their curriculum against real-time global demand. Identify outdated topics and receive AI-driven suggestions to make your students future-ready.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="glass p-6 rounded-2xl">
                <div className="text-2xl font-bold mb-1">500+</div>
                <div className="text-xs text-slate-500 uppercase font-bold">Industry Benchmarks</div>
              </div>
              <div className="glass p-6 rounded-2xl">
                <div className="text-2xl font-bold mb-1">Real-time</div>
                <div className="text-xs text-slate-500 uppercase font-bold">Market Alignment</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const TargetUsers = () => {
  const users = [
    {
      icon: <GraduationCap className="w-10 h-10 text-blue-400" />,
      title: "Students",
      desc: "Stop guessing. Start learning what matters. Get personalized roadmaps and internship leads based on future demand.",
      benefits: ["Skill Gap Analysis", "Personalized Roadmaps", "Industry Insights"]
    },
    {
      icon: <Building2 className="w-10 h-10 text-purple-400" />,
      title: "Colleges",
      desc: "Align your curriculum with the future. Improve placement rates by teaching skills that industries actually need.",
      benefits: ["Curriculum Audits", "Placement Analytics", "Industry Partnerships"]
    },
    {
      icon: <Users className="w-10 h-10 text-emerald-400" />,
      title: "Corporate L&D",
      desc: "Future-proof your workforce. Identify internal talent and upskill them for emerging roles before you need to hire.",
      benefits: ["Talent Mapping", "Upskilling Paths", "ROI Analytics"]
    }
  ];

  return (
    <section className="py-24 px-6 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {users.map((u, i) => (
            <div key={i} className="glass p-10 rounded-3xl flex flex-col h-full">
              <div className="mb-8">{u.icon}</div>
              <h3 className="text-2xl font-bold mb-4">{u.title}</h3>
              <p className="text-slate-400 mb-8 flex-1">{u.desc}</p>
              <ul className="space-y-3">
                {u.benefits.map((b, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Pricing = ({ onSelectPlan }: { onSelectPlan: (plan: any) => void }) => {
  const plans = [
    {
      name: "Student Plan",
      price: "₹199",
      period: "/month",
      features: ["Basic Skill Gap Analysis", "1-Year Forecasts", "Standard Roadmaps", "Email Support"],
      cta: "Get Started",
      highlight: false
    },
    {
      name: "Pro Plan",
      price: "₹499",
      period: "/month",
      features: ["Advanced Gap Analysis", "3-Year Forecasts", "AI Mentor Access", "Priority Support", "Project Suggestions"],
      cta: "Go Pro",
      highlight: true
    },
    {
      name: "College Plan",
      price: "₹999",
      period: "/month",
      features: ["Full Institution Dashboard", "Curriculum Alignment", "Placement Insights", "Dedicated Manager"],
      cta: "Contact Sales",
      highlight: false
    }
  ];

  return (
    <section id="pricing" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-slate-400">Invest in your future career today.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((p, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10 }}
              className={cn(
                "glass p-10 rounded-3xl flex flex-col relative overflow-hidden",
                p.highlight && "border-blue-500/50 shadow-2xl shadow-blue-500/10"
              )}
            >
              {p.highlight && (
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-4 py-1 rounded-bl-xl uppercase tracking-widest">
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-bold mb-2">{p.name}</h3>
              <div className="mb-8">
                <span className="text-4xl font-bold">{p.price}</span>
                <span className="text-slate-500 text-sm">{p.period}</span>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                {p.features.map((f, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm text-slate-400">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" /> {f}
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => onSelectPlan(p)}
                className={cn(
                  "w-full py-4 rounded-xl font-bold transition-all",
                  p.highlight ? "bg-blue-600 text-white hover:bg-blue-500" : "glass hover:bg-white/10"
                )}
              >
                {p.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CTA = () => (
  <section className="py-24 px-6">
    <div className="max-w-5xl mx-auto glass rounded-[40px] p-12 md:p-20 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 -z-10" />
      <h2 className="text-4xl md:text-5xl font-display font-bold mb-8">Start Building Skills for 2028 Today.</h2>
      <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto">
        Join 50,000+ students and professionals who are already using AI to stay ahead of the curve.
      </p>
      <a href="#portfolio" className="bg-white text-dark px-10 py-5 rounded-full font-bold text-xl hover:bg-slate-200 transition-all shadow-2xl shadow-white/10 inline-block">
        Generate My Future Skill Roadmap
      </a>
    </div>
  </section>
);

const Footer = () => (
  <footer className="py-20 px-6 border-t border-white/5">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold font-display tracking-tight">FutureSkill AI</span>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed">
            Predicting tomorrow's skills today. The world's first AI-powered skill gap intelligence engine.
          </p>
        </div>
        <div>
          <h4 className="font-bold mb-6">Product</h4>
          <ul className="space-y-4 text-sm text-slate-500">
            <li><a href="#" className="hover:text-white transition-colors">Skill Analyzer</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Market Trends</a></li>
            <li><a href="#" className="hover:text-white transition-colors">AI Mentor</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-6">Company</h4>
          <ul className="space-y-4 text-sm text-slate-500">
            <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-6">Subscribe</h4>
          <p className="text-sm text-slate-500 mb-4">Get the latest skill trends in your inbox.</p>
          <div className="flex gap-2">
            <input type="email" placeholder="Email address" className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 flex-1" />
            <button className="bg-blue-600 p-2 rounded-lg hover:bg-blue-500 transition-colors">
              <Mail className="w-5 h-5" />
            </button>
          </div>
          <div className="flex gap-4 mt-6">
            <Twitter className="w-5 h-5 text-slate-500 hover:text-white cursor-pointer transition-colors" />
            <Github className="w-5 h-5 text-slate-500 hover:text-white cursor-pointer transition-colors" />
            <Linkedin className="w-5 h-5 text-slate-500 hover:text-white cursor-pointer transition-colors" />
          </div>
        </div>
      </div>
      <div className="text-center text-slate-600 text-xs">
        © 2026 FutureSkill AI. All rights reserved. Built with ❤️ for the future of work.
      </div>
    </div>
  </footer>
);

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [authModal, setAuthModal] = useState<{ isOpen: boolean, mode: 'login' | 'signup' }>({ isOpen: false, mode: 'login' });
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full"
        />
      </div>
    );
  }

  if (selectedPlan) {
    return <CheckoutPage plan={selectedPlan} onBack={() => setSelectedPlan(null)} />;
  }

  if (user && profile) {
    switch (profile.role) {
      case 'student': return <StudentDashboard />;
      case 'company': return <CompanyDashboard />;
      case 'admin': return <AdminDashboard />;
      default: return <StudentDashboard />;
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30">
      <Navbar onAuthClick={(mode) => setAuthModal({ isOpen: true, mode })} />
      <AuthModal 
        isOpen={authModal.isOpen} 
        onClose={() => setAuthModal({ ...authModal, isOpen: false })} 
        initialMode={authModal.mode} 
      />
      <main>
        <Hero />
        <HowItWorks />
        <EmergingSkillRadar />
        <ROIPredictor />
        <PortfolioAnalyzer />
        <GlobalMobility />
        <AIMentor />
        <SkillLifecycle />
        <CollegeAlignment />
        <SkillHeatmap />
        <SkillAnalyzer />
        <TargetUsers />
        <Pricing onSelectPlan={setSelectedPlan} />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
