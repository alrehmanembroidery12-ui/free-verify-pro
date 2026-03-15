const { createClient } = require('@supabase/supabase-js');
const express = require('express');
const app = express();
app.use(express.json());

// 🔑 GLOBAL CONFIG
let config = {
    user: "admin",
    pass: "admin",
    supabaseUrl: 'https://mlalpaaabgxizqdbsuyt.supabase.co', 
    supabaseKey: 'sb_publishable_6XL09-0H_pTX70556Mf1Wg_Iuh5UALP',
    is2FAEnabled: true
};

let supabase = createClient(config.supabaseUrl, config.supabaseKey);

const PAGE_HEAD = `
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap" rel="stylesheet">
    <style>
        body { background: #020617; font-family: 'Plus Jakarta Sans', sans-serif; color: white; margin: 0; }
        .glass { background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.05); }
        .glow-blue { box-shadow: 0 0 30px rgba(59, 130, 246, 0.1); }
        .active-tab { background: rgba(59, 130, 246, 0.1); color: #3b82f6; border-left: 4px solid #3b82f6; }
        .sub-tab-btn.active { background: #3b82f6; color: white; border-color: #3b82f6; }
        .toggle-bg:after { content: ''; position: absolute; top: 2px; left: 2px; background: white; border-radius: 99px; height: 20px; width: 20px; transition: 0.3s; }
        input:checked + .toggle-bg:after { transform: translateX(24px); }
        input:checked + .toggle-bg { background: #3b82f6; }
    </style>
`;

// --- 🏠 1. MAIN GATEWAY ---
app.get('/', (req, res) => {
    res.send(`
        <head>${PAGE_HEAD}</head>
        <body class="flex flex-col items-center justify-center min-h-screen p-6 text-center">
            <h1 class="text-5xl font-black tracking-tighter text-blue-500 italic mb-2">FEEVERIFY PRO</h1>
            <p class="text-slate-500 uppercase tracking-[0.3em] text-[10px] font-bold mb-12 italic">Professional Gateway</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
                <a href="/student" style="text-decoration:none">
                    <div class="glass p-12 rounded-[3rem] cursor-pointer hover:border-blue-500/50 transition-all group">
                        <div class="text-6xl mb-4 group-hover:scale-110 transition">🎓</div>
                        <h2 class="text-xl font-bold uppercase tracking-widest text-white">Student Portal</h2>
                    </div>
                </a>
                <a href="/login" style="text-decoration:none">
                    <div class="glass p-12 rounded-[3rem] cursor-pointer hover:border-emerald-500/50 transition-all border-emerald-500/10 group">
                        <div class="text-6xl mb-4 group-hover:scale-110 transition">🔐</div>
                        <h2 class="text-xl font-bold uppercase tracking-widest text-emerald-400">Admin Login</h2>
                    </div>
                </a>
            </div>
        </body>
    `);
});

// --- 🔑 2. LOGIN & 2FA ---
app.get('/login', (req, res) => {
    res.send(`
        <head>${PAGE_HEAD}</head>
        <body class="flex flex-col items-center justify-center min-h-screen p-6">
            <a href="/" class="text-2xl font-black text-blue-500 mb-10 italic" style="text-decoration:none">FEEVERIFY PRO</a>
            <div class="glass p-10 rounded-[3rem] border border-white/10 w-full max-w-md glow-blue">
                <h2 class="text-xl font-black mb-8 uppercase text-center italic tracking-widest text-white">Authentication</h2>
                <div class="space-y-4">
                    <input type="text" id="u" class="w-full bg-black/40 border border-white/10 p-5 rounded-2xl outline-none" placeholder="Username">
                    <input type="password" id="p" class="w-full bg-black/40 border border-white/10 p-5 rounded-2xl outline-none" placeholder="Password">
                    <button onclick="doLogin()" class="w-full bg-blue-600 p-5 rounded-2xl font-black uppercase tracking-widest text-white">Continue</button>
                </div>
            </div>
            <script>
                async function doLogin() {
                    const u = document.getElementById('u').value;
                    const p = document.getElementById('p').value;
                    const res = await fetch('/auth-check', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({u, p}) });
                    const data = await res.json();
                    if(res.status === 200) { window.location.href = data.is2FA ? '/two-factor' : '/admin-panel?auth=true'; }
                    else { alert(data.message); }
                }
            </script>
        </body>
    `);
});

app.post('/auth-check', (req, res) => {
    if(req.body.u === config.user && req.body.p === config.pass) res.status(200).json({ is2FA: config.is2FAEnabled });
    else res.status(401).json({ message: "Invalid Credentials" });
});

app.get('/two-factor', (req, res) => {
    res.send(`
        <head>${PAGE_HEAD}</head>
        <body class="flex flex-col items-center justify-center min-h-screen p-6 text-center">
            <div class="text-6xl mb-6">📱</div>
            <h2 class="text-2xl font-black mb-2 italic uppercase text-white">Mobile Security</h2>
            <div class="glass p-8 rounded-[2.5rem] glow-blue max-w-sm w-full">
                <button onclick="window.location.href='/admin-panel?auth=true'" class="w-full bg-emerald-600 p-5 rounded-2xl font-black shadow-lg text-white">APPROVE ACCESS</button>
            </div>
        </body>
    `);
});

// --- 🏛️ 3. ADMIN PANEL ---
app.get('/admin-panel', async (req, res) => {
    if(req.query.auth !== 'true') return res.redirect('/login');
    const { data: txs } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
    const total = txs?.reduce((acc, c) => acc + (c.status === 'verified' ? c.amount : 0), 0) || 0;

    res.send(`
        <head>${PAGE_HEAD}</head>
        <body class="flex h-screen overflow-hidden">
            <aside class="hidden md:flex flex-col w-72 glass border-r border-white/5 p-6 z-50">
                <a href="/" class="text-2xl font-black italic text-blue-500 mb-12" style="text-decoration:none">FEEVERIFY <span class="text-white">PRO</span></a>
                <nav class="space-y-4 flex-1">
                    <button onclick="switchMainTab('dash')" id="mbtn-dash" class="w-full text-left p-4 rounded-2xl transition-all flex items-center gap-3 font-bold active-tab">📊 Dashboard</button>
                    <button onclick="switchMainTab('set')" id="mbtn-set" class="w-full text-left p-4 rounded-2xl transition-all flex items-center gap-3 font-bold">⚙️ Settings</button>
                </nav>
                <button onclick="window.location.href='/'" class="w-full p-4 rounded-2xl bg-red-500/10 text-red-500 font-bold text-xs uppercase tracking-widest border border-red-500/20">Logout</button>
            </aside>

            <main class="flex-1 overflow-y-auto p-4 md:p-12 pb-32">
                <div id="main-dash" class="main-tab">
                    <div class="flex justify-between items-end mb-10">
                        <h1 class="text-4xl font-black italic tracking-tighter text-white">Live Monitor</h1>
                        <div class="glass px-8 py-4 rounded-[2rem] border-emerald-500/20 text-right">
                            <p class="text-[10px] font-black uppercase text-emerald-500">Collection</p>
                            <p class="text-2xl font-black text-white">Rs ${total.toLocaleString()}</p>
                        </div>
                    </div>
                    <div class="glass rounded-[2.5rem] overflow-hidden">
                        <table class="w-full text-left">
                            <thead class="bg-white/5 text-[9px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5">
                                <tr><th class="p-6">TRX ID</th><th class="p-6">Student</th><th class="p-6">Status</th><th class="p-6 text-right">Amount</th></tr>
                            </thead>
                            <tbody class="divide-y divide-white/5">
                                ${txs?.map(t => `
                                    <tr>
                                        <td class="p-6 font-mono text-blue-400 font-bold">${t.trx_id}</td>
                                        <td class="p-6 font-bold text-sm text-slate-200">${t.student_name || 'System Auto'}</td>
                                        <td class="p-6"><span class="px-3 py-1 rounded-full text-[9px] font-black uppercase ${t.status === 'verified' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-500'}">${t.status}</span></td>
                                        <td class="p-6 text-right font-black text-white">Rs ${t.amount}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div id="main-set" class="main-tab hidden max-w-3xl mx-auto">
                    <h2 class="text-3xl font-black italic mb-8 text-center text-blue-500">Settings</h2>
                    <div class="flex justify-center gap-4 mb-10">
                        <button onclick="switchSubSet('db')" id="sub-btn-db" class="sub-tab-btn active px-6 py-3 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-white">🗄️ Database</button>
                        <button onclick="switchSubSet('acc')" id="sub-btn-acc" class="sub-tab-btn px-6 py-3 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-white">👤 Account</button>
                    </div>
                    <div id="subset-db" class="subset-box glass p-10 rounded-[3rem] glow-blue border-blue-500/20">
                        <input type="text" id="sUrl" value="${config.supabaseUrl}" class="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-xs mb-4 text-white" placeholder="URL">
                        <input type="password" id="sKey" value="${config.supabaseKey}" class="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-xs mb-4 text-white" placeholder="Key">
                        <button onclick="saveAll()" class="w-full bg-blue-600 p-5 rounded-2xl font-black uppercase text-xs text-white">Sync Database</button>
                    </div>
                    <div id="subset-acc" class="subset-box hidden glass p-10 rounded-[3rem] border-white/10">
                        <input type="text" id="aUser" value="${config.user}" class="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-xs mb-4 text-white" placeholder="User">
                        <input type="password" id="aPass" value="${config.pass}" class="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-xs mb-4 text-white" placeholder="Pass">
                        <button onclick="saveAll()" class="w-full bg-blue-600 p-5 rounded-2xl font-black uppercase text-xs text-white">Update Profile</button>
                    </div>
                </div>
            </main>
            <script>
                function switchMainTab(t) {
                    document.querySelectorAll('.main-tab').forEach(c => c.classList.add('hidden'));
                    document.getElementById('main-' + t).classList.remove('hidden');
                    document.querySelectorAll('aside button').forEach(b => b.classList.remove('active-tab'));
                    document.getElementById('mbtn-' + t).classList.add('active-tab');
                }
                function switchSubSet(s) {
                    document.querySelectorAll('.subset-box').forEach(b => b.classList.add('hidden'));
                    document.getElementById('subset-' + s).classList.remove('hidden');
                    document.querySelectorAll('.sub-tab-btn').forEach(b => b.classList.remove('active'));
                    document.getElementById('sub-btn-' + s).classList.add('active');
                }
                async function saveAll() {
                    const data = {
                        supabaseUrl: document.getElementById('sUrl').value,
                        supabaseKey: document.getElementById('sKey').value,
                        user: document.getElementById('aUser')?.value || config.user,
                        pass: document.getElementById('aPass')?.value || config.pass,
                        is2FAEnabled: true
                    };
                    const res = await fetch('/update-config', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) });
                    if(res.status === 200) { alert('🚀 Professional Profile Synced!'); window.location.reload(); }
                }
            </script>
        </body>
    `);
});

// --- 🎓 4. STUDENT PORTAL ---
app.get('/student', (req, res) => {
    res.send(`
        <head>${PAGE_HEAD}</head>
        <body class="flex flex-col items-center justify-center min-h-screen p-6">
            <a href="/" class="text-2xl font-black text-blue-500 mb-10 italic" style="text-decoration:none">FEEVERIFY PRO</a>
            <div class="glass p-10 md:p-14 rounded-[3rem] border border-blue-500/20 w-full max-w-lg glow-blue text-center">
                <h2 class="text-3xl font-black italic mb-2 text-white">Verify Fee</h2>
                <div class="space-y-4">
                    <input type="text" id="sn" class="w-full bg-black/40 border border-white/10 p-5 rounded-2xl outline-none text-white" placeholder="Student Name">
                    <input type="text" id="ti" class="w-full bg-black/40 border border-white/10 p-5 rounded-2xl outline-none font-mono text-white" placeholder="Trx ID (TID)">
                    <input type="number" id="am" class="w-full bg-black/40 border border-white/10 p-5 rounded-2xl outline-none text-white" placeholder="Amount (Rs)">
                    <button onclick="v()" id="btn" class="w-full bg-blue-600 p-5 rounded-2xl font-black text-white shadow-xl">AUTHENTICATE</button>
                    <div id="m" class="text-center mt-6 font-black uppercase text-xs tracking-widest italic text-white"></div>
                </div>
            </div>
            <script>
                async function v() {
                    const btn = document.getElementById('btn'); btn.innerText = "VERIFYING...";
                    const res = await fetch('/student-verify', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({name: document.getElementById('sn').value, trxId: document.getElementById('ti').value, amount: document.getElementById('am').value}) });
                    const data = await res.json();
                    const m = document.getElementById('m');
                    m.innerText = res.status === 200 ? "✅ PAYMENT VERIFIED" : "❌ " + data.message;
                    m.className = res.status === 200 ? "text-emerald-400 mt-6 font-black" : "text-red-400 mt-6 font-black";
                    btn.innerText = "AUTHENTICATE";
                }
            </script>
        </body>
    `);
});

// --- 🛡️ BACKEND LOGIC ---
app.post('/update-config', (req, res) => {
    config = { ...config, ...req.body };
    supabase = createClient(config.supabaseUrl, config.supabaseKey);
    res.status(200).send("OK");
});

app.post('/student-verify', async (req, res) => {
    const { name, trxId, amount } = req.body;
    try {
        const { data: found } = await supabase.from('transactions').select('*').eq('trx_id', trxId).single();
        if (found && found.status !== 'verified' && parseInt(found.amount) === parseInt(amount)) {
            await supabase.from('transactions').update({ status: 'verified', student_name: name }).eq('trx_id', trxId);
            res.status(200).json({ message: "OK" });
        } else res.status(400).json({ message: "Check details" });
    } catch (err) { res.status(500).json({ message: "Error" }); }
});

app.listen(5000, () => console.log('🚀 Final Seven-Star System Live'));
module.exports = app;
