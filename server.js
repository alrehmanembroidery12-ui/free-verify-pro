const { createClient } = require('@supabase/supabase-js');
const express = require('express');
const app = express();
app.use(express.json());

// 🔑 CONFIG
let config = {
    user: "admin", pass: "admin",
    supabaseUrl: 'https://mlalpaaabgxizqdbsuyt.supabase.co', 
    supabaseKey: 'sb_publishable_6XL09-0H_pTX70556Mf1Wg_Iuh5UALP',
    is2FAEnabled: true
};
let supabase = createClient(config.supabaseUrl, config.supabaseKey);

const PAGE_HEAD = `
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;800&display=swap" rel="stylesheet">
    <style>
        body { background: #020617; font-family: 'Plus Jakarta Sans', sans-serif; color: white; margin: 0; }
        .glass { background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.05); }
        .active-tab { background: rgba(59, 130, 246, 0.1); color: #3b82f6; border-left: 4px solid #3b82f6; }
    </style>
`;

const NAV_LOGO = `
    <div class="text-center mb-8">
        <a href="/" class="text-3xl font-black italic text-blue-500 hover:text-blue-400 transition-all" style="text-decoration:none">
            FEEVERIFY <span class="text-white">PRO</span>
        </a>
    </div>
`;

// --- 🏠 1. HOME GATEWAY ---
app.get('/', (req, res) => {
    res.send(`
        <head>${PAGE_HEAD}</head>
        <body class="flex flex-col items-center justify-center min-h-screen p-6">
            <h1 class="text-5xl font-black italic text-blue-500 mb-2">FEEVERIFY PRO</h1>
            <p class="text-slate-500 uppercase tracking-widest text-[10px] font-bold mb-12">Elite Security System</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                <button onclick="window.location.href='/student'" class="glass p-10 rounded-[2rem] hover:border-blue-500 transition-all">
                    <span class="text-4xl block mb-2">🎓</span>
                    <span class="font-bold uppercase tracking-tighter">Student Portal</span>
                </button>
                <button onclick="window.location.href='/login'" class="glass p-10 rounded-[2rem] hover:border-emerald-500 transition-all">
                    <span class="text-4xl block mb-2">🔐</span>
                    <span class="font-bold uppercase tracking-tighter text-emerald-400">Admin Login</span>
                </button>
            </div>
        </body>
    `);
});

// --- 🎓 2. STUDENT PORTAL ---
app.get('/student', (req, res) => {
    res.send(`
        <head>${PAGE_HEAD}</head>
        <body class="flex flex-col items-center justify-center min-h-screen p-6">
            ${NAV_LOGO}
            <div class="glass p-8 rounded-[2rem] w-full max-w-md border-blue-500/20">
                <h2 class="text-2xl font-black mb-6 text-center italic">Fee Verification</h2>
                <div class="space-y-4">
                    <input type="text" id="sn" class="w-full bg-black/40 border border-white/10 p-4 rounded-xl outline-none" placeholder="Student Name">
                    <input type="text" id="ti" class="w-full bg-black/40 border border-white/10 p-4 rounded-xl outline-none" placeholder="Trx ID (TID)">
                    <input type="number" id="am" class="w-full bg-black/40 border border-white/10 p-4 rounded-xl outline-none" placeholder="Amount Paid">
                    <button onclick="v()" id="btn" class="w-full bg-blue-600 p-4 rounded-xl font-black uppercase text-white shadow-lg">Verify Now</button>
                    <div id="m" class="text-center mt-4 text-xs font-bold uppercase italic tracking-widest"></div>
                </div>
            </div>
            <script>
                async function v() {
                    const btn = document.getElementById('btn'); btn.innerText = "CHECKING...";
                    const res = await fetch('/student-verify', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({name: document.getElementById('sn').value, trxId: document.getElementById('ti').value, amount: document.getElementById('am').value}) });
                    document.getElementById('m').innerText = res.status === 200 ? "✅ Verified" : "❌ Record Not Found";
                    btn.innerText = "Verify Now";
                }
            </script>
        </body>
    `);
});

// --- 🔑 3. ADMIN LOGIN ---
app.get('/login', (req, res) => {
    res.send(`
        <head>${PAGE_HEAD}</head>
        <body class="flex flex-col items-center justify-center min-h-screen p-6">
            ${NAV_LOGO}
            <div class="glass p-10 rounded-[2rem] border border-white/10 w-full max-w-sm text-center">
                <h2 class="text-xl font-black mb-8 uppercase tracking-widest">Admin Access</h2>
                <div class="space-y-4">
                    <input type="text" id="u" class="w-full bg-black/40 border border-white/10 p-4 rounded-xl outline-none" placeholder="Username">
                    <input type="password" id="p" class="w-full bg-black/40 border border-white/10 p-4 rounded-xl outline-none" placeholder="Password">
                    <button onclick="doLogin()" class="w-full bg-blue-600 p-4 rounded-xl font-black text-white">Continue</button>
                </div>
            </div>
            <script>
                async function doLogin() {
                    const u = document.getElementById('u').value;
                    const p = document.getElementById('p').value;
                    const res = await fetch('/auth-check', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({u, p}) });
                    const data = await res.json();
                    if(res.status === 200) { window.location.href = data.is2FA ? '/two-factor' : '/admin-panel?auth=true'; }
                    else { alert('Access Denied!'); }
                }
            </script>
        </body>
    `);
});

app.post('/auth-check', (req, res) => {
    if(req.body.u === config.user && req.body.p === config.pass) res.status(200).json({ is2FA: config.is2FAEnabled });
    else res.status(401).json({ message: "Error" });
});

app.get('/two-factor', (req, res) => {
    res.send(`
        <head>${PAGE_HEAD}</head>
        <body class="flex flex-col items-center justify-center min-h-screen p-6 text-center">
            <h2 class="text-2xl font-black mb-6 uppercase">Approve Mobile Login</h2>
            <div class="glass p-8 rounded-[2rem] max-w-xs w-full">
                <button onclick="window.location.href='/admin-panel?auth=true'" class="w-full bg-emerald-600 p-4 rounded-xl font-black text-white shadow-lg">ALLOW ACCESS</button>
            </div>
        </body>
    `);
});

// --- 🏛️ 4. ADMIN PANEL ---
app.get('/admin-panel', async (req, res) => {
    if(req.query.auth !== 'true') return res.redirect('/login');
    const { data: txs } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
    const total = txs?.reduce((acc, c) => acc + (c.status === 'verified' ? c.amount : 0), 0) || 0;

    res.send(`
        <head>${PAGE_HEAD}</head>
        <body class="flex h-screen overflow-hidden">
            <aside class="hidden md:flex flex-col w-64 glass border-r border-white/5 p-6">
                <a href="/" class="text-xl font-black italic text-blue-500 mb-10" style="text-decoration:none">FEEVERIFY PRO</a>
                <nav class="space-y-2 flex-1">
                    <button onclick="switchTab('dash')" id="btn-dash" class="w-full text-left p-4 rounded-xl active-tab font-bold">📊 Dashboard</button>
                    <button onclick="switchTab('set')" id="btn-set" class="w-full text-left p-4 rounded-xl font-bold">⚙️ Settings</button>
                </nav>
                <button onclick="window.location.href='/'" class="text-red-500 text-xs font-bold p-2 uppercase tracking-widest">Logout</button>
            </aside>

            <main class="flex-1 overflow-y-auto p-4 md:p-10">
                <div class="md:hidden mb-6 text-center"><a href="/" class="text-xl font-black italic text-blue-500" style="text-decoration:none">FEEVERIFY PRO</a></div>
                
                <div id="tab-dash">
                    <div class="flex justify-between items-center mb-8">
                        <h2 class="text-2xl font-black italic">Live Monitor</h2>
                        <div class="glass px-6 py-2 rounded-xl text-emerald-400 font-bold border border-emerald-500/20">Rs ${total.toLocaleString()}</div>
                    </div>
                    <div class="glass rounded-3xl overflow-hidden">
                        <table class="w-full text-left">
                            <thead class="bg-white/5 text-[10px] font-black uppercase text-slate-500 border-b border-white/5">
                                <tr><th class="p-4">TID</th><th class="p-4">Student</th><th class="p-4 text-right">Amount</th></tr>
                            </thead>
                            <tbody class="divide-y divide-white/5">
                                ${txs?.map(t => `
                                    <tr class="hover:bg-white/5 transition">
                                        <td class="p-4 font-mono text-blue-400 text-xs">${t.trx_id}</td>
                                        <td class="p-4 text-sm font-bold text-slate-200">${t.student_name || 'System Entry'}</td>
                                        <td class="p-4 text-right font-black">Rs ${t.amount}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div id="tab-set" class="hidden max-w-md">
                    <h2 class="text-2xl font-black mb-8 italic">Engine Settings</h2>
                    <div class="glass p-8 rounded-3xl border-blue-500/20 space-y-4">
                        <p class="text-[10px] font-black text-blue-400 uppercase tracking-widest">Database Keys</p>
                        <input type="text" value="${config.supabaseUrl}" class="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs" readonly>
                        <input type="password" value="${config.supabaseKey}" class="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs" readonly>
                        <button onclick="alert('Config Synced!')" class="w-full bg-blue-600 p-4 rounded-xl font-black uppercase text-xs">Sync System</button>
                    </div>
                </div>
            </main>

            <script>
                function switchTab(t) {
                    document.getElementById('tab-dash').classList.toggle('hidden', t !== 'dash');
                    document.getElementById('tab-set').classList.toggle('hidden', t !== 'set');
                    document.getElementById('btn-dash').classList.toggle('active-tab', t === 'dash');
                    document.getElementById('btn-set').classList.toggle('active-tab', t === 'set');
                }
            </script>
        </body>
    `);
});

// --- 🛡️ BACKEND LOGIC ---
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

app.listen(5000, () => console.log('🚀 Final System Live'));
module.exports = app;
