import { Client, DefaultMediaReceiver } from 'castv2-client';
import mdns from 'mdns';
import { cast as castConfig } from 'config';
import Debug from 'debug';
import Promise from 'bluebird';

const debug = Debug('dash-control-cast');

const browser = mdns.createBrowser(mdns.tcp('googlecast'));
const services = [];

browser.on('serviceUp', (service) => services.push(service));
browser.start();

async function cast({ media, name: serviceName }) {
	const { addresses: [host] } = services.find((service) => service.txtRecord.fn === serviceName);
	const client = Promise.promisifyAll(new Client());

	client.on('error', (err) => {
		console.warn(`Error: ${ err.message }`);
		client.close();
	});

	await client.connectAsync(host);
	debug('connected, launching app ...');

	const player = Promise.promisifyAll(await client.launchAsync(DefaultMediaReceiver));
	player.on('status', (status) => debug(`status broadcast playerState=${ status.playerState }`));
	debug(`app "${ player.session.displayName }" launched, loading media ${ media.contentId } ...`);

	const status = await player.loadAsync(media, { autoplay: true });
	debug(`media loaded playerState=${ status.playerState }`);
}

export default {
	cast
}