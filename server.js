
const { createClient } = require('@supabase/supabase-js');
const express = require('express');
const app = express();

app.use(express.json());

// 🔑 Supabase Connection
const supabaseUrl = 'https://mlalpaaabgxizqdbsuyt.supabase.co'; 
const supabaseKey = 'sb_publishable_6XL09-0H_pTX70556Mf1Wg_Iuh5UALP'; 

const supabase = createClient(supabaseUrl, supabaseKey);

// 🏠 Dashboard Route
app.get('/', async (req, res) => {
    try {
        const { data: transactions } = await supabase
            .from('transactions')
            .select('*')
            .order('created_at', { ascending: false });

        res.send(`
            <html>
            <head>
                <script src="https://cdn.tailwindcss.com"></script>
                <title>FeeVerify Pro Dashboard</title>
                <style>body { background: #0f172a; color: white; font-family: sans-serif; }</style>
            </head>
            <body class="p-10">
                <div class="max-w-4xl mx-auto">
                    <div class="flex justify-between items-center mb-10">
                        <h1 class="text-3xl font-bold text-blue-400">🚀 FeeVerify Pro Dashboard</h1>
                        <span class="bg-emerald-500/10 text-emerald-500 px-4 py-1 rounded-full text-xs font-bold border border-emerald-500/20">Online</span>
                    </div>
                    <div class="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
                        <table class="w-full text-left">
                            <thead class="bg-slate-700/50">
                                <tr>
                                    <th class="p-4 text-slate-400 text-xs uppercase">Trx ID</th>
                                    <th class="p-4 text-slate-400 text-xs uppercase">Amount</th>
                                    <th class="p-4 text-slate-400 text-xs uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${transactions?.map(t => `
                                    <tr class="border-t border-slate-700/50">
                                        <td class="p-4 font-mono text-blue-300">${t.trx_id}</td>
                                        <td class="p-4 font-bold text-emerald-400">Rs. ${t.amount}</td>
                                        <td class="p-4 text-xs uppercase font-bold text-amber-500">${t.status}</td>
                                    </tr>
                                `).join('') || '<tr><td colspan="3" class="p-10 text-center text-slate-500">Waiting for first transaction...</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
            </body>
            </html>
        `);
    } catch (err) {
        res.status(500).send("Dashboard Error: " + err.message);
    }
});

// 📡 SMS Webhook
app.post('/sms-receive', async (req, res) => {
    try {
        const smsText = req.body.message;
        const trxMatch = smsText.match(/TrxID:\s*(\d+)|TID:\s*(\d+)|ID:\s*(\d+)/i);
        const amountMatch = smsText.match(/Rs\.?\s*([\d,]+)/i);

        if (trxMatch && amountMatch) {
            const trxId = trxMatch[1] || trxMatch[2] || trxMatch[3];
            const amount = amountMatch[1].replace(/,/g, '');

            await supabase.from('transactions').insert([{ 
                trx_id: trxId, 
                amount: parseInt(amount), 
                bank_name: "Auto-Detected", 
                status: 'unclaimed' 
            }]);
            res.status(200).send("Success");
        } else {
            res.status(400).send("Invalid Format");
        }
    } catch (err) {
        res.status(500).send("Error");
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log('------------------------------------------');
    console.log('🚀 SYSTEM IS LIVE ON PORT 5000!');
    console.log('------------------------------------------');
});
app.listen(5000, () => console.log('🚀 Seven-Star Elite System Live on Port 5000'));

module.exports = app;
