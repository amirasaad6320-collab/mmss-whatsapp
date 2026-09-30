const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');

const app = express();
app.use(express.json());

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] 
    }
});

client.on('qr', qr => {
    console.log('====================================');
    console.log('📱 SCAN THIS QR CODE WITH WHATSAPP 📱');
    console.log('====================================');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ WhatsApp Bot is Ready and Connected!');
});

app.post('/api/send', async (req, res) => {
    const { numbers, message } = req.body;
    if (!numbers || !message) return res.status(400).send('Missing data');
    
    let sent = 0;
    for (let num of numbers) {
        try {
            let cleanNum = num.toString().replace(/[\+\s\-\(\)]/g, '');
            if (cleanNum.startsWith('00')) cleanNum = cleanNum.substring(2);
            if (cleanNum.length === 11 && cleanNum.startsWith('01')) cleanNum = '2' + cleanNum;
            
            const chatId = cleanNum + '@c.us';
            await client.sendMessage(chatId, message);
            sent++;
        } catch(e) {
            console.log('Failed to send to', num, e.message);
        }
    }
    res.json({ success: true, sent });
});

client.initialize();

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log('🚀 Server is running on port ' + PORT);
});
