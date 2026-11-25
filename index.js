const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const pino = require('pino')
const readline = require('readline')

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const ask = (q) => new Promise(res => rl.question(q, res))

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth')
  const sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    auth: state,
    printQRInTerminal: false
  })

  sock.ev.on('creds.update', saveCreds)

  if (!sock.authState.creds.registered) {
    const phone = await ask('Andika namba yako ya WhatsApp mfano 255758123456: ')
    const code = await sock.requestPairingCode(phone.trim())
    console.log('PAIRING CODE YAKO NI: ' + code)
    console.log('Nenda WhatsApp > Linked Devices > Link with phone number > Andika hii code')
  }

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
      console.log('Imekatika, inajaribu tena...')
      if (shouldReconnect) startBot()
    } else if (connection === 'open') {
      console.log('BOT IMEWAKA! Imeunganishwa na WhatsApp ✅')
    }
  })

  sock.ev.on('group-participants.update', async (u) => {
if (u.action === 'add') {
for (let p of u.participants) {
let jid = typeof p === 'string' ? p : p.id; await sock.sendMessage(u.id, { text: `Karibu sana @${jid.split('@')[0]} kwenye MUUNGANO EMPIRE! 🎉🔥 Soma sheria na heshimu wenzako.`, mentions: [jid] })
}}
})
sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0]
    if (!msg.message || msg.key.fromMe) return
    const from = msg.key.remoteJid
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ''
    console.log('Ujumbe:', text)
if (text.toLowerCase().includes('https://')) {
await sock.sendMessage(from, { text: 'ONYO! Usitume link hapa!' })
return
}
    if (text.toLowerCase() === 'hi' || text.toLowerCase() === 'hello') {
      await sock.sendMessage(from, { text: 'Hello! Mimi ni Robby Tz 🤖 Niko online!' })
    }
    if (text.toLowerCase() === 'menu') {
      await sock.sendMessage(from, { text: 'MENU:\n- Andika hi\n- Andika menu\n- Andika ping' })
    }
    if (text.toLowerCase() === 'ping') {
      await sock.sendMessage(from, { text: 'Pong! 🏓 Bot inafanya kazi' })
    }
  })
}
startBot()
