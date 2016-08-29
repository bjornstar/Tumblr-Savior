var settings;

function detectBrowser() {
	if (window && window.chrome) {
		return 'Chrome';
	}
	if (window && window.safari) {
		return 'Safari';
	}
}

var browser = detectBrowser();

function chromeMessageHandler(message, sender, sendResponse) {
	var response = {};

	if (message === 'getSettings') {
		response.data = localStorage.settings;
	}

	sendResponse(response);
}

function parseSettings() {
	var parsedSettings;

	if (!localStorage || !localStorage.settings) {
		parsedSettings = defaultSettings;
	} else {
		try {
			parsedSettings = JSON.parse(localStorage.settings);
		} catch (e) {
			parsedSettings = defaultSettings;
		}
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
	var theword, chromeViews, chromeView;
	theword = info.selectionText;

	if (theword && addToBlackList(theword)) {
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

function safariMessageHandler(event) {
	var tab;

	switch (event.name) {
	case 'getSettings':
		event.target.page.dispatchMessage('settings', localStorage.settings);
		break;
	case 'refreshSettings':
		localStorage.settings = JSON.stringify(event.message);
		for (tab = 0; tab < safari.application.activeBrowserWindow.tabs.length; tab++) {
			if (checkurl(safari.application.activeBrowserWindow.tabs[tab].url, ['http://www.tumblr.com/*', 'https://www.tumblr.com/*'])) {
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
	var tabAlreadyOpened, tab, newTab, theword;

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
		if (theword && addToBlackList(theword)) {
			for (tab = 0; tab < safari.application.activeBrowserWindow.tabs.length; tab++) {
				if (checkurl(safari.application.activeBrowserWindow.tabs[tab].url, ['http://www.tumblr.com/*', 'https://www.tumblr.com/*'])) {
					safari.application.activeBrowserWindow.tabs[tab].page.dispatchMessage('refreshSettings');
				}
				if (safari.application.activeBrowserWindow.tabs[tab].url === safari.extension.baseURI + 'data/options.html') {
					safari.application.activeBrowserWindow.tabs[tab].page.dispatchMessage('settings', localStorage.settings);
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

	if (settings.context_menu && wordBlack) {
		if (wordBlack.length > 25) {
			wordBlack = wordBlack.substr(0, 25);
			wordBlack = wordBlack.replace(/^\s+|\s+$/g, '');
			wordBlack = wordBlack + '...';
		}
		event.contextMenu.appendContextMenuItem('addToBlackList', 'Add \u201c' + wordBlack + '\u201d to Tumblr Savior black list');
	}
}

function safariValidateHandler(event) {
	var settings;

	if (event.command === 'addToBlackList') {
		settings = parseSettings();
		if (!settings.context_menu || event.userInfo === null) {
			event.target.disabled = true
		}
	}
}

switch (browser) {
case 'Chrome':
	console.log('Setting up the',browser,'backend.');
	chrome.runtime.onMessage.addListener(chromeMessageHandler);

	settings = parseSettings();

	if (settings.context_menu === 'true' || settings.context_menu === true) {
		chrome.contextMenus.create({
			'type': 'normal',
			'title': 'Add \'%s\' to Tumblr Savior black list',
			'contexts': ['selection'],
			'documentUrlPatterns': ['http://www.tumblr.com/*', 'https://www.tumblr.com/*'],
			'onclick': chromeAddToBlackList
		});
	}
	break;
case 'Safari':
	console.log('Setting up the',browser,'backend.');
	safari.application.addEventListener('message', safariMessageHandler, false);
	safari.application.addEventListener('command', safariCommandHandler, false);
	safari.application.addEventListener('contextmenu', safariContextMenuHandler, false);
	safari.application.addEventListener('validate', safariValidateHandler, false);
	break;
default:
	console.error('I\'m sorry, but your browser extension system was not detected correctly.');
}
