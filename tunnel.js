const ngrok = require('ngrok');
const config = require('config');

const BOT_PORT = config.get('PORT') || 8007;
// const BOT_TUNNEL_SUBDOMAIN = config.get('botTunnelSubDomain') || '';
const VERIFY_TOKEN = config.get('VERIFY_TOKEN');

ngrok.connect({
	addr: BOT_PORT,
	onStatusChange: status => {
		if(status == 'closed') {
			console.log(`\nTunnel closed`)
		}
	},
}).then(url => {
	console.log(`
    Local Bot running on: ${url}
    Configure your Facebook App's Webhook with:
    Webhook URL: ${url}/webhook
    Verify Token: ${VERIFY_TOKEN}
    Press Ctrl + C to stop.
    `)
}).catch(err => console.log(err));