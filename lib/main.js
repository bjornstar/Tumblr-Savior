var settings;

var firefoxWorkers = [];
var firefoxOptionsPanel;

function getBrowser() {
	if (window && window.chrome) {
		return 'Chrome';
	}
	if (window && window.safari) {
		return 'Safari';
	}
	if (window && window.opera) {
		return 'Opera';
	}
	if (navigator.userAgent.indexOf('Firefox') >= 0) {
		return 'Firefox';
	}
	console.log('Tumblr Savior could not detect your browser.');
	return 'Undetected Browser';
}

var browser = getBrowser;

function chromeMessageHandler(message, sender, sendResponse) {
	if (message === 'getSettings') {
		sendResponse({data: localStorage.settings});
	} else {
		sendResponse({}); // send a blank reply.
	}
}

function parseSettings() {
	var parsedSettings;

	if (localStorage === undefined || localStorage.settings === undefined || localStorage.settings === null) {
		parsedSettings = defaultSettings;
	} else {
		parsedSettings = JSON.parse(localStorage.settings);
	}

	return parsedSettings;
}

function checkurl(url, filter) {
	var f, filterRegex, re;

	if (url === undefined || url === null) {
		return false;
	}

	for (f = 0; f < filter.length; f++) {
		filterRegex = filter[f].replace(/\x2a/g, '(.*?)');
		re = new RegExp(filterRegex);
		if (url.match(re)) {
			return true;
		}
	}
	return false;
}

function addToBlackList(theword) {
	var oldSettings, v;

	oldSettings = parseSettings();

	for (v = 0; v < oldSettings.listBlack.length; v++) {
		if (oldSettings.listBlack[v].toLowerCase() === theword.toLowerCase()) {
			alert('\'' + theword + '\' is already on your black list.');
			return false;
		}
	}

	oldSettings.listBlack.push(theword.toLowerCase());
	localStorage.settings = JSON.stringify(oldSettings);

	return true;
}

function chromeAddToBlackList(info, tab) {
	var theword, success, chromeViews, chromeView;
	theword = info.selectionText;

	if (theword !== undefined) {
		success = addToBlackList(theword);

		if (success) {
			chromeViews = chrome.extension.getViews();
			for (chromeView = 0; chromeView < chromeViews.length; chromeView++) {
				if (chromeViews[chromeView].location === chrome.extension.getURL('data/options.html')) {
					chromeViews[chromeView].location.reload();
				}
			}
			if (chrome.tabs.sendMessage !== undefined) {
				chrome.tabs.sendMessage(tab.id, 'refreshSettings');
			} else if (chrome.tabs.sendRequest !== undefined) {
				chrome.tabs.sendRequest(tab.id, 'refreshSettings');
			}
		}
	}
}

function operaToolbar() {
	var settings, button;

	settings = parseSettings();

	if (settings.toolbar_butt) {
		button = opera.contexts.toolbar.createItem({
			icon: 'data/Icon-16.png',
			popup: {
				href: 'data/options.html',
				width: 940,
				height: 610
			},
			title: 'Tumblr Savior'
		});
		opera.contexts.toolbar.addItem(button);
	} else {
		opera.contexts.toolbar.removeItem(opera.contexts.toolbar.item(0));
	}
}

function operaMessageHandler(event) {
	switch (event.data) {
	case 'getSettings':
		event.source.postMessage({topic: 'settings', data: localStorage.settings});
		break;
	case 'refreshSettings':
		opera.extension.broadcastMessage('refreshSettings');
		break;
	case 'toolbar':
		operaToolbar();
		break;
	default:
		event.source.postMessage({}); // send a blank reply.
		break;
	}
}

function safariMessageHandler(event) {
	var tab;

	switch (event.name) {
	case 'getSettings':
		event.target.page.dispatchMessage('settings', {data: localStorage.settings});
		break;
	case 'refreshSettings':
		localStorage.settings = JSON.stringify(event.message);
		for (tab = 0; tab < safari.application.activeBrowserWindow.tabs.length; tab++) {
			if (checkurl(safari.application.activeBrowserWindow.tabs[tab].url, ['http://*.tumblr.com/*'])) {
				safari.application.activeBrowserWindow.tabs[tab].page.dispatchMessage('refreshSettings');
			}
		}
		break;
	default:
		event.target.page.dispatchMessage({}); // send a blank reply.
		break;
	}
}

function safariCommandHandler(event) {
	var tabAlreadyOpened, tab, newTab, theword, success;

	switch (event.command) {
	case 'options':
		for (tab = 0; tab < safari.application.activeBrowserWindow.tabs.length; tab++) {
			if (safari.application.activeBrowserWindow.tabs[tab].url === safari.extension.baseURI + 'data/options.html') {
				tabAlreadyOpened = tab;
			}
		}
		if (tabAlreadyOpened === undefined) {
			newTab = safari.application.activeBrowserWindow.openTab();
			newTab.url = safari.extension.baseURI + 'data/options.html';
		} else {
			safari.application.activeBrowserWindow.tabs[tabAlreadyOpened].activate();
		}
		break;
	case 'addToBlackList':
		theword = event.userInfo;
		if (theword !== undefined) {
			success = addToBlackList(theword);
			if (success) {
				for (tab = 0; tab < safari.application.activeBrowserWindow.tabs; tab++) {
					if (checkurl(safari.application.activeBrowserWindow.tabs[tab].url, ['http://*.tumblr.com/*'])) {
						safari.application.activeBrowserWindow.tabs[tab].page.dispatchMessage('refreshSettings');
					} else if (safari.application.activeBrowserWindow.tabs[tab].url === safari.extension.baseURI + 'data/options.html') {
						safari.application.activeBrowserWindow.tabs[tab].page.dispatchMessage('updateSettings', localStorage.settings);
					}
				}
			}
		}
		break;
	}
}

function safariContextMenuHandler(event) {
	var wordBlack, settings;

	wordBlack = event.userInfo;
	settings = parseSettings();

	if (settings.context_menu && wordBlack !== undefined && wordBlack !== null) {
		if (wordBlack.length > 25) {
			wordBlack = wordBlack.substr(0, 25);
			wordBlack = wordBlack.replace(/^\s+|\s+$/g, '');
			wordBlack = wordBlack + '...';
		}
		event.contextMenu.appendContextMenuItem('addToBlackList', 'Add \'' + wordBlack + '\' to Tumblr Savior black list');
	}
}

function firefoxMessageHandler(data) {
	firefoxOptionsPanel.postMessage('getSettings');
}

function firefoxOptionsMessageHandler(data) {
	var worker;

	for (worker = 0; worker < firefoxWorkers.length; worker++) {
		firefoxWorkers[worker].postMessage(data);
	}
}

function firefoxDetachWorker(worker) {
	var index;

	index = firefoxWorkers.indexOf(worker);

	if (index !== -1) {
		firefoxWorkers.splice(index, 1);
	}
}


switch (browser) {
case 'Chrome':
	if (chrome.extension.onMessage !== undefined) {
		chrome.extension.onMessage.addListener(chromeMessageHandler);
	} else if (chrome.extension.onRequest !== undefined) {
		chrome.extension.onRequest.addListener(chromeMessageHandler);
	}

	settings = parseSettings();

	if (settings.context_menu === 'true' || settings.context_menu === true) {
		chrome.contextMenus.create({
			'type': 'normal',
			'title': 'Add \'%s\' to Tumblr Savior black list',
			'contexts': ['selection'],
			'documentUrlPatterns': ['http://*.tumblr.com/*'],
			'onclick': chromeAddToBlackList
		});
	}
	break;
case 'Opera':
	opera.extension.onmessage = operaMessageHandler;
	operaToolbar();
	break;
case 'Safari':
	safari.application.addEventListener('message', safariMessageHandler, false);
	safari.application.addEventListener('command', safariCommandHandler, false);
	safari.application.addEventListener('contextmenu', safariContextMenuHandler, false);
	break;
case 'Firefox':
	// Developing extensions for this browser sucks...

	break;
}

// You have to put it into an exports outside of any other statements.
exports.main = function () {
	var pageMod = require('page-mod');
	var self = require('self');
	var ss = require('simple-storage');
	var widgets = require('widget');
	var panels = require('panel');

	pageMod.PageMod({
		include: ['http://www.tumblr.com/*'],
		contentScriptFile: self.data.url('script.js'),
		contentScriptWhen: 'ready',
		onAttach: function onAttach(worker) {
			firefoxWorkers.push(worker);
			worker.on('message', firefoxMessageHandler);
			worker.on('detach', function () {
				firefoxDetachWorker(this);
			});
		}
	});

	firefoxOptionsPanel = panels.Panel({
		width: 720,
		height: 600,
		contentURL: self.data.url('options.html')
	});

	firefoxOptionsPanel.on('message', firefoxOptionsMessageHandler);

	var optionsWidget = widgets.Widget({
		id: 'optionsWidget',
		label: 'Tumblr Savior Options',
		panel: firefoxOptionsPanel,
		content: '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAnNJREFUeNqMU09M02AU/8awC5vJsu2g4ExwkDgJQzfCEsWEgQxI1CVLvHDadYNE9IAm84KJ3EBPBjGe0ETw6AXmwRBPXhjTkjCTicvC+FPKZC1tt7brs1/JcIMY92val+977/3e7/v6HgIAVAtMJpPR4XA463Q6XeV+/f8SbTbbWY/bfT0QCAQpitI/m5wMV/p1WEElqcFgQFc7Ojq9Xm+Pt6vL53K5blxqbraZrVb0ZXk529Pbaz+loLHx/LmhwaHbnk5Pj/ua+2ZrS4vDpiYoiqKRK6AgmqJQU1OTiSCIelEU5WMGrODR+HhUtcCzLGxns3CYz4PAccCp63dzc/Di+TTs03s4BG719Q1UKqjDH5qmD7Cl9igE6rMUi6GJpxPoTuAu+pVOI5Ik0T5NawmRcHi06pKwgra2K66SLIEsiZBYjcOTaBRez87i3wNrJKlVpnZ3oAy73X6xigDjW2I1hZ07W1vAq/IxfD4fDA8Pw0m8mpl5c4pgdGTk/snAT7EYGI1GyGQy2rpQLGpWkiSwWiyWKgK9Xt/AsuwhDiiVSsckOMTv90OhUABeEIA5CoEHY2MPjy8R56tJwvTU1Eu8KBZFbTOZTKJgMIi6u7sRw7JIEiXE87zm6x8YvKcW1ZcVELipzGZzq8ALJVmW4fdBHtbXkyAIBa2irIqSlb/HI8m1PbW9G8qtLGEV+Xw+tfBh4XMoFOo/QxDI6bx8dEz1XY2vbDMMQ8Xj8ZVEIv41lfr5g+M4oUyAY7Tu+q4CK0xvbDCbm5sbuVxua37+/dulxcWPoiTxp4bl5DS2t7d3RcKRx1ar5UItU6qrdZz/hT8CDADaR5pMovP3DQAAAABJRU5ErkJggg==" />'
	});
};