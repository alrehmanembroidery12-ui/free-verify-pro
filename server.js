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
        .active-tab { background: rgba(59, 130, 246, 0.1); color: #3b82f6 !important; border-left: 4px solid #3b82f6; }
        .no-underline { text-decoration: none !important; }
    </style>
`;

// --- 🏠 1. MAIN GATEWAY ---
app.get('/', (req, res) => {
    res.send(`
        <head>${PAGE_HEAD}</head>
        <body class="flex flex-col items-center justify-center min-h-screen p-6 text-center">
            <h1 class="text-5xl font-black tracking-tighter text-blue-500 italic mb-2 uppercase">FeeVerify Pro</h1>
            <p class="text-slate-500 uppercase tracking-[0.3em] text-[10px] font-bold mb-12">Authorized Personnel Only</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
                <div onclick="window.location.href='/student'" class="glass p-12 rounded-[3rem] cursor-pointer hover:border-blue-500/50 transition-all group">
                    <div class="text-6xl mb-4 group-hover:scale-110 transition">🎓</div>
                    <h2 class="text-xl font-bold uppercase tracking-widest text-white">Student Portal</h2>
                </div>
                <div onclick="window.location.href='/login'" class="glass p-12 rounded-[3rem] cursor-pointer hover:border-emerald-500/50 transition-all border-emerald-500/10 group">
                    <div class="text-6xl mb-4 group-hover:scale-110 transition">🔐</div>
                    <h2 class="text-xl font-bold uppercase tracking-widest text-emerald-400">Admin Login</h2>
                </div>
            </div>
        </body>
    `);
});

// --- 🔑 2. LOGIN & 2FA ---
app.get('/login', (req, res) => {
    res.send(`
        <head>${PAGE_HEAD}</head>
        <body class="flex flex-col items-center justify-center min-h-screen p-6">
            <a href="/" class="text-2xl font-black text-blue-500 mb-10 italic no-underline">FEEVERIFY PRO</a>
            <div class="glass p-10 rounded-[3rem] border border-white/10 w-full max-w-md glow-blue">
                <h2 class="text-xl font-black mb-8 uppercase text-center italic tracking-widest text-white">Vault Entry</h2>
                <div class="space-y-4">
                    <input type="text" id="u" class="w-full bg-black/40 border border-white/10 p-5 rounded-2xl outline-none text-white" placeholder="Username">
                    <input type="password" id="p" class="w-full bg-black/40 border border-white/10 p-5 rounded-2xl outline-none text-white" placeholder="Password">
                    <button onclick="doLogin()" class="w-full bg-blue-600 p-5 rounded-2xl font-black uppercase text-white shadow-xl">Login</button>
                </div>
            </div>
            <script>
                async function doLogin() {
                    const u = document.getElementById('u').value;
                    const p = document.getElementById('p').value;
                    const res = await fetch('/auth-check', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({u, p}) });
                    const data = await res.json();
                    if(res.status === 200) { window.location.href = data.is2FA ? '/two-factor' : '/admin-panel?auth=true'; }
                    else { alert('Access Denied'); }
                }
            </script>
        </body>
    `);
});

app.post('/auth-check', (req, res) => {
    if(req.body.u === config.user && req.body.p === config.pass) res.status(200).json({ is2FA: config.is2FAEnabled });
    else res.status(401).json({ message: "Invalid" });
});

app.get('/two-factor', (req, res) => {
    res.send(`
        <head>${PAGE_HEAD}</head>
        <body class="flex flex-col items-center justify-center min-h-screen p-6 text-center">
            <div class="text-6xl mb-6">📱</div>
            <h2 class="text-2xl font-black mb-10 italic uppercase text-white tracking-widest">Mobile Approval</h2>
            <button onclick="window.location.href='/admin-panel?auth=true'" class="glass px-12 py-5 rounded-2xl font-black text-emerald-400 border-emerald-500/30 uppercase tracking-widest">Allow Access</button>
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
            <aside class="hidden md:flex flex-col w-72 glass border-r border-white/5 p-8 z-50">
                <a href="/" class="text-2xl font-black italic text-blue-500 mb-12 no-underline">FEEVERIFY <span class="text-white">PRO</span></a>
                <nav class="space-y-4 flex-1">
                    <button onclick="showTab('dash')" id="btn-dash" class="w-full text-left p-4 rounded-xl font-bold text-white active-tab">📊 Dashboard</button>
                    <button onclick="showTab('set')" id="btn-set" class="w-full text-left p-4 rounded-xl font-bold text-slate-400">⚙️ Settings</button>
                </nav>
                <button onclick="window.location.href='/'" class="text-red-500 text-xs font-black uppercase tracking-widest p-2">Logout</button>
            </aside>

            <main class="flex-1 overflow-y-auto p-4 md:p-12 pb-32">
                <div id="tab-dash">
                    <div class="flex justify-between items-end mb-10">
                        <h1 class="text-3xl font-black italic text-white uppercase">Live Monitor</h1>
                        <div class="glass px-6 py-3 rounded-2xl border-emerald-500/20 text-emerald-400 font-black text-lg">Rs ${total.toLocaleString()}</div>
                    </div>
                    <div class="glass rounded-[2rem] overflow-hidden border border-white/5">
                        <table class="w-full text-left">
                            <thead class="bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5">
                                <tr><th class="p-6">TID</th><th class="p-6">Student</th><th class="p-6 text-right">Amount</th></tr>
                            </thead>
                            <tbody class="divide-y divide-white/5">
                                ${txs?.map(t => `
                                    <tr>
                                        <td class="p-6 font-mono text-blue-400 font-bold">${t.trx_id}</td>
                                        <td class="p-6 font-bold text-sm text-slate-200">${t.student_name || 'System Auto'}</td>
                                        <td class="p-6 text-right font-black text-white">Rs ${t.amount}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div id="tab-set" class="hidden max-w-lg">
                    <h1 class="text-3xl font-black italic text-blue-500 mb-10 uppercase">System Config</h1>
                    <div class="glass p-10 rounded-[2.5rem] border-white/10 glow-blue">
                        <input type="text" value="${config.supabaseUrl}" class="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-xs text-white mb-4" readonly>
                        <input type="password" value="${config.supabaseKey}" class="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-xs text-white mb-6" readonly>
                        <button onclick="alert('Configuration Synced!')" class="w-full bg-blue-600 p-5 rounded-2xl font-black uppercase text-xs text-white">Update Engine</button>
                    </div>
                </div>
            </main>

            <script>
                function showTab(t) {
                    document.getElementById('tab-dash').classList.toggle('hidden', t !== 'dash');
                    document.getElementById('tab-set').classList.toggle('hidden', t !== 'set');
                    document.getElementById('btn-dash').className = t === 'dash' ? 'w-full text-left p-4 rounded-xl font-bold text-white active-tab' : 'w-full text-left p-4 rounded-xl font-bold text-slate-400';
                    document.getElementById('btn-set').className = t === 'set' ? 'w-full text-left p-4 rounded-xl font-bold text-white active-tab' : 'w-full text-left p-4 rounded-xl font-bold text-slate-400';
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
            <a href="/" class="text-2xl font-black text-blue-500 mb-10 italic no-underline">FEEVERIFY PRO</a>
            <div class="glass p-10 md:p-14 rounded-[3rem] border border-blue-500/20 w-full max-w-lg glow-blue text-center">
                <h2 class="text-3xl font-black italic mb-10 text-white uppercase">Fee Verification</h2>
                <div class="space-y-4 text-left">
                    <input type="text" id="sn" class="w-full bg-black/40 border border-white/10 p-5 rounded-2xl outline-none text-white" placeholder="Full Name">
                    <input type="text" id="ti" class="w-full bg-black/40 border border-white/10 p-5 rounded-2xl outline-none font-mono text-white" placeholder="Trx ID (TID)">
                    <input type="number" id="am" class="w-full bg-black/40 border border-white/10 p-5 rounded-2xl outline-none text-white" placeholder="Amount (Rs)">
                    <button onclick="verify()" id="btn" class="w-full bg-blue-600 p-5 rounded-2xl font-black text-white shadow-xl">Verify Payment</button>
                    <div id="m" class="mt-6 text-center font-black uppercase text-xs tracking-widest italic text-white"></div>
                </div>
            </div>
            <script>
                async function verify() {
                    const btn = document.getElementById('btn'); btn.innerText = "AUTHENTICATING...";
                    const res = await fetch('/student-verify', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({name: document.getElementById('sn').value, trxId: document.getElementById('ti').value, amount: document.getElementById('am').value}) });
                    document.getElementById('m').innerText = res.status === 200 ? "✅ Verified" : "❌ Record Not Found";
                    btn.innerText = "Verify Payment";
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
        } else res.status(400).json({ message: "Error" });
    } catch (err) { res.status(500).json({ message: "Error" }); }
});

app.listen(5000, () => console.log('🚀 System Live'));
module.exports = app;
