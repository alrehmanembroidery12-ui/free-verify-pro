const { createClient } = require('@supabase/supabase-js');
const express = require('express');
const app = express();
app.use(express.json());

const config = {
    user: "admin", pass: "admin",
    supabaseUrl: 'https://mlalpaaabgxizqdbsuyt.supabase.co', 
    supabaseKey: 'sb_publishable_6XL09-0H_pTX70556Mf1Wg_Iuh5UALP'
};
const supabase = createClient(config.supabaseUrl, config.supabaseKey);

const PAGE_HEAD = `<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><script src="https://cdn.tailwindcss.com"></script><style>body{background:#020617;color:white;font-family:sans-serif;margin:0}.glass{background:rgba(15,23,42,0.8);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.05)}.active-tab{background:rgba(59,130,246,0.2)!important;color:#3b82f6!important;border-left:4px solid #3b82f6!important}</style>`;

app.get('/', (req, res) => res.send(`<head>${PAGE_HEAD}</head><body class="flex flex-col items-center justify-center min-h-screen p-6 text-center"><h1 class="text-5xl font-black italic text-blue-500 mb-12 uppercase">FeeVerify Pro</h1><div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl"><button onclick="location.href='/student'" class="glass p-10 rounded-[2rem]">🎓 Student Portal</button><button onclick="location.href='/login'" class="glass p-10 rounded-[2rem] text-emerald-400">🔐 Admin Login</button></div></body>`));

app.get('/login', (req, res) => res.send(`<head>${PAGE_HEAD}</head><body class="flex flex-col items-center justify-center min-h-screen p-6"><div class="glass p-10 rounded-[2rem] w-full max-w-sm text-center"><h2 class="text-xl font-bold mb-8 uppercase italic">Admin Access</h2><input type="text" id="u" class="w-full bg-black/40 border border-white/10 p-4 rounded-xl mb-4 text-white outline-none" placeholder="Username"><input type="password" id="p" class="w-full bg-black/40 border border-white/10 p-4 rounded-xl mb-4 text-white outline-none" placeholder="Password"><button onclick="doLogin()" class="w-full bg-blue-600 p-4 rounded-xl font-bold">Login</button></div><script>async function doLogin(){const res=await fetch('/auth-check',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({u:document.getElementById('u').value,p:document.getElementById('p').value})});if(res.status===200)location.href='/admin-panel?auth=true';else alert('Denied');}</script></body>`));

app.post('/auth-check', (req, res) => (req.body.u === config.user && req.body.p === config.pass) ? res.status(200).json({ok:true}) : res.status(401).json({ok:false}));

app.get('/admin-panel', async (req, res) => {
    if(req.query.auth !== 'true') return res.redirect('/login');
    const { data: txs } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
    const total = txs?.reduce((acc, c) => acc + (c.status === 'verified' ? c.amount : 0), 0) || 0;
    let rows = (txs && txs.length > 0) ? txs.map(t => `<tr class="border-b border-white/5"><td class="p-4 text-blue-400 font-mono text-xs">${t.trx_id}</td><td class="p-4 text-sm font-bold">${t.student_name || 'System'}</td><td class="p-4 text-right font-black">Rs ${t.amount}</td></tr>`).join('') : '<tr><td colspan="3" class="p-4 text-center">No Records</td></tr>';

    res.send(`<head>${PAGE_HEAD}</head><body class="flex h-screen overflow-hidden"><aside class="w-64 glass border-r border-white/5 p-6 hidden md:flex flex-col"><h1 class="text-xl font-bold text-blue-500 mb-10">FEEVERIFY PRO</h1><nav class="space-y-4 flex-1"><button onclick="st('d')" id="bd" class="w-full text-left p-4 rounded-xl active-tab font-bold">📊 Dashboard</button><button onclick="st('s')" id="bs" class="w-full text-left p-4 rounded-xl font-bold">⚙️ Settings</button></nav><button onclick="location.href='/'" class="mt-auto text-red-500 text-xs font-bold p-2 uppercase">Logout</button></aside><main class="flex-1 p-10 overflow-y-auto"><div id="td"><div class="flex justify-between items-center mb-10"><h1 class="text-2xl font-bold italic">Live Monitor</h1><div class="glass px-6 py-2 rounded-xl text-emerald-400 font-bold border border-emerald-500/20 text-lg">Rs ${total.toLocaleString()}</div></div><div class="glass rounded-3xl overflow-hidden border border-white/5"><table class="w-full text-left text-sm"><tr class="bg-white/5 text-[10px] text-slate-500 uppercase"><th class="p-4">TID</th><th class="p-4">Student</th><th class="p-4 text-right">Amount</th></tr>${rows}</table></div></div><div id="ts" style="display:none"><h2 class="text-2xl font-bold mb-8 italic text-white uppercase">System Engine</h2><div class="glass p-8 rounded-2xl border-emerald-500/20"><p class="text-blue-400 text-xs uppercase mb-2">Database Connection</p><p class="text-emerald-400 font-bold">Connected & Live</p></div></div></main><script>function st(t){document.getElementById('td').style.display=(t==='d'?'block':'none');document.getElementById('ts').style.display=(t==='s'?'block':'none');document.getElementById('bd').classList.toggle('active-tab',t==='d');document.getElementById('bs').classList.toggle('active-tab',t==='s');}</script></body>`);
});

app.get('/student', (req, res) => res.send(`<head>${PAGE_HEAD}</head><body class="flex flex-col items-center justify-center min-h-screen p-6"><div class="glass p-10 rounded-[3rem] w-full max-w-md text-center"><h2 class="text-2xl font-bold mb-10 italic uppercase">Fee Portal</h2><input type="text" id="sn" class="w-full bg-black/40 border border-white/10 p-4 rounded-xl mb-4 text-white" placeholder="Student Name"><input type="text" id="ti" class="w-full bg-black/40 border border-white/10 p-4 rounded-xl mb-4 text-white" placeholder="Trx ID"><input type="number" id="am" class="w-full bg-black/40 border border-white/10 p-4 rounded-xl mb-4 text-white" placeholder="Amount Paid"><button onclick="v()" id="btn" class="w-full bg-blue-600 p-4 rounded-xl font-bold text-white shadow-lg">Verify Now</button><div id="m" class="mt-4 font-bold text-xs uppercase tracking-widest"></div></div><script>async function v(){const res=await fetch('/student-verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:document.getElementById('sn').value,trxId:document.getElementById('ti').value,amount:document.getElementById('am').value})});document.getElementById('m').innerText=res.status===200?"✅ VERIFIED":"❌ NOT FOUND";}</script></body>`));

app.post('/student-verify', async (req, res) => {
    const { name, trxId, amount } = req.body;
    try {
        const { data: found } = await supabase.from('transactions').select('*').eq('trx_id', trxId).single();
        if (found && found.status !== 'verified' && parseInt(found.amount) === parseInt(amount)) {
            await supabase.from('transactions').update({ status: 'verified', student_name: name }).eq('trx_id', trxId);
            res.status(200).json({ok:true});
        } else res.status(400).json({ok:false});
    } catch (e) { res.status(500).json({ok:false}); }
});

app.listen(5000, () => console.log('🚀 Final System Live'));
module.exports = app;
