import devices from './devices.json';
import DashButton from 'node-dash-button';
import tasks from './tasks'
import Promise from 'bluebird';

Object.keys(devices).forEach((address) => {
	const { tasks: deviceTasks = {} } = devices[address];
	const dashButton = DashButton(address, null, null, 'all');

	dashButton.on('detected', () => {
		Object.keys(deviceTasks)
			.forEach((task) => Object.keys(deviceTasks[task])
				.forEach((subTask) => {
					tasks[task][subTask](deviceTasks[task][subTask]);
				})
			)

	});
});