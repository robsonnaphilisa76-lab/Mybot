const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');
const PHONE_NUMBER = "255623023874";

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('session');
  const sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    auth: state,
    printQRInTerminal: false
  });

  sock.ev.on('creds.update', saveCreds);

  if (!sock.authState.creds.registered) {
    const code = await sock.requestPairingCode(PHONE_NUMBER);
    console.log('PAIRING CODE YAKO NI: ' + code);
    console.log('Nenda WhatsApp > Linked Devices > Link a Device > Link with phone number');
  }

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401;
      console.log('Imekatika, inajaribu tena...');
      if (shouldReconnect) startBot();
    } else if (connection === 'open') {
      console.log('Bot imeunganishwa!');
    }
  });
}

startBot();
