import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';
import installExtension, { REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } from 'electron-devtools-installer';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';

let mainWindow: Electron.BrowserWindow | null;

autoUpdater.logger = log;
// autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

function sendStatusToWindow (text: string) {
	log.info(text);
	/* eslint-disable no-unused-expressions */
	mainWindow?.webContents.send('message', text);
}

function createWindow () {
	mainWindow = new BrowserWindow({
		width: 1100,
		height: 700,
		backgroundColor: '#191622',
		webPreferences: {
			nodeIntegration: true
		}
	});

	if (process.env.NODE_ENV === 'development') {
		mainWindow.loadURL('http://localhost:4000');
	} else {
		mainWindow.loadURL(
			url.format({
				pathname: path.join(__dirname, 'renderer/index.html'),
				protocol: 'file:',
				slashes: true
			})
		);
	}

	mainWindow.once('ready-to-show', () => {
		autoUpdater.checkForUpdatesAndNotify();
	});

	mainWindow.on('closed', () => {
		mainWindow = null;
	});
}

app.on('ready', createWindow)
	.whenReady()
	.then(() => {
		if (process.env.NODE_ENV === 'development') {
			installExtension(REACT_DEVELOPER_TOOLS)
				.then((name) => console.log(`Added Extension:  ${name}`))
				.catch((err) => console.log('An error occurred: ', err));
			installExtension(REDUX_DEVTOOLS)
				.then((name) => console.log(`Added Extension:  ${name}`))
				.catch((err) => console.log('An error occurred: ', err));
		}
	});
app.allowRendererProcessReuse = true;

ipcMain.on('app_version', (event) => {
	console.log('app version');
	event.sender.send('app_version', { version: app.getVersion() });
});

ipcMain.on('check', (event) => {
	console.log('checking for update');
	autoUpdater.setFeedURL({
		provider: 'github',
		owner: 'LukeXF',
		repo: 'electron-react-ts-v2'
		// token: [YOUR ACCESS TOKEN],
	});
	autoUpdater.checkForUpdates();
	event.sender.send('check', { version: app.getVersion() });
});

autoUpdater.on('download-progress', (progressObj) => {
	let logMessage = 'Download speed: ' + progressObj.bytesPerSecond;
	logMessage = logMessage + ' - Downloaded ' + progressObj.percent + '%';
	logMessage = logMessage + ' (' + progressObj.transferred + '/' + progressObj.total + ')';
	sendStatusToWindow(logMessage);
});

autoUpdater.on('update-available', () => {
	console.log('update available');
	/* eslint-disable no-unused-expressions */
	sendStatusToWindow('update_available');
});

autoUpdater.on('update-not-available', () => {
	console.log('update not available');
	/* eslint-disable no-unused-expressions */
	mainWindow?.webContents.on('did-finish-load', function () {
		sendStatusToWindow('update_not_available');
	});
});

autoUpdater.on('checking-for-update', () => {
	console.log('checking for update');
	/* eslint-disable no-unused-expressions */
	mainWindow?.webContents.on('did-finish-load', function () {
		sendStatusToWindow('checking_for_update');
	});
});

autoUpdater.on('update-downloaded', () => {
	console.log('update downloaded');
	/* eslint-disable no-unused-expressions */
	sendStatusToWindow('update_downloaded');
});

autoUpdater.on('error', message => {
	console.error('There was a problem updating the application');
	console.error(message);
});

ipcMain.on('restart_app', () => {
	autoUpdater.quitAndInstall();
});
