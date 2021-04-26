import React, { useEffect, useState } from 'react';
import { Container, Image, Text } from './styles';
import { ipcRenderer } from 'electron';

const Greetings: React.FC = () => {
	const [version, setVersion] = useState<string | null>(null);
	useEffect(() => {
		console.log('test');
		ipcRenderer.send('app_version');
		ipcRenderer.on('app_version', (event, arg) => {
			ipcRenderer.removeAllListeners('app_version');
			console.log('Version ' + arg.version);
			setVersion(arg.version);
		});

		ipcRenderer.on('update_available', () => {
			ipcRenderer.removeAllListeners('update_available');
			console.log('update available');
			// message.innerText = 'A new update is available. Downloading now...';
			// notification.classList.remove('hidden');
		});

		ipcRenderer.on('update_not_available', () => {
			console.log('update_not_available');
		});

		ipcRenderer.on('checking_for_update', () => {
			console.log('checking_for_update');
		});
		ipcRenderer.on('check', () => {
			console.log('checked');
		});

		ipcRenderer.on('update_downloaded', () => {
			ipcRenderer.removeAllListeners('update_downloaded');
			console.log('upload downloaded');
		});
	}, []);

	const check = () => {
		ipcRenderer.send('check');
	};
	return (
		<Container>
			<Image
				src='https://www.vectorlogo.zone/logos/reactjs/reactjs-icon.svg'
				alt='ReactJS logo'
			/>
			<Text>Loop MDM</Text>
			<div>Version: {version || '-'}</div>
			<button onClick={() => check()} >update</button>

		</Container>
	);
};

export default Greetings;
