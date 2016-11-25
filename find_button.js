/*
 * Must be run under NODE_ENV = test because node-dash-button only exports what we need when that's true.
 */

import { int_array_to_hex, create_session } from 'node-dash-button/index';
import { manufacturer_directory } from 'node-dash-button/stor';
import pcap from 'pcap';
import minimist from 'minimist';
import Promise from 'bluebird';
import * as jsonfileSync from 'jsonfile';

const jsonfile = Promise.promisifyAll(jsonfileSync);
jsonfile.spaces = 4;

const AMAZON_MANUFACTURER_ID = '50F5DA';
const DEVICES_CONFIG_FILE = './devices.json';

const { iface } = minimist(process.argv);

const pcap_session = create_session(iface, 'all');


jsonfile.readFileAsync(DEVICES_CONFIG_FILE)
    .catch((e) => {
        console.warn('No existing devices.json found. Will create on device discovery.');
        return {};
    }) 
    .then((devices) => {
        pcap_session.on('packet', (raw_packet) => {
            const {
                payload: {
                    ethertype,
                    payload: {
                        sender_ha: {
                            addr: arpAddress
                        } = {}
                    } = {},
                    shost: {
                        addr: udpAddress
                    } = {}
                } = {}
            } = pcap.decode.packet(raw_packet); //decodes the packet

            let device_address;

            if(ethertype === 2054 || ethertype === 2048) { //ensures it is an arp or udp packet
                let protocol = { 2054: 'arp', 2048: 'udp' }[ethertype], 
                    device_address = int_array_to_hex( ethertype === 2054 ? arpAddress : udpAddress ),
                    manufacturerKey = device_address.slice(0,8).toString().toUpperCase().split(':').join('');

                if (manufacturerKey === AMAZON_MANUFACTURER_ID) {
                    if(!devices[device_address]) {
                        console.info(`Found: ${ device_address }. Adding to devices.json.`);
                        devices[device_address] = { tasks: {} };
                    } else {
                        console.info('Device already discovered. Not adding to devices.json');
                    }

                    jsonfile.writeFileAsync(DEVICES_CONFIG_FILE, devices)
                        .then(() => process.exit(0))
                        .catch((e) => console.warn(e) && process.exit(1));
                }
            }
        });

        console.log("Please press your dash button now!");
    });
