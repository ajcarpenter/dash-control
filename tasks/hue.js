import { HueApi, lightState } from 'node-hue-api';
import { hue as hueConfig } from 'config';
import { includes } from 'lodash';
import Debug from 'debug';

const debug = Debug('dash-control-hue');
const api = HueApi(hueConfig.bridgeIp, hueConfig.userId);

let lights = [];

api.lights().then((foundLights) => lights = foundLights.lights);

const toggle = (args) => {
	const state = lightState.create();
	const lightsToToggle = lights.filter((light) => includes(args.names, light.name));

	lightsToToggle.forEach((light) => {
		api.lightStatus(light.id).then(({ state }) => {
			debug(`Turning ${ light.name } ${ state.on ? 'off' : 'on' }`);
			api.setLightState(light.id, { on: !state.on }).done();
		});
	});
}

export default {
	toggle
}