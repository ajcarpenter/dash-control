import { HueApi } from 'node-hue-api';
import config, { hue as hueConfig } from 'config';
 
const api = HueApi();

api.registerUser(hueConfig.bridgeIp, 'Dash Control').then(console.log).catch((err) => console.warn(err)).done();