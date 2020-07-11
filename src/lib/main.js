/* global defaultSettings:readonly */

let hasContextMenu = false;

function parseSettings() {
	let parsedSettings = defaultSettings;

	const savedSettings = localStorage && localStorage.getItem('settings');

	if (savedSettings) {
		try {
			parsedSettings = JSON.parse(savedSettings);
		} catch (e) {
			console.error('Failed to parse settings:', e);
		}
	}

	return parsedSettings;
}

function setupContextMenu() {
	const { context_menu } = parseSettings();

	if (!context_menu) {
		chrome.contextMenus.removeAll();
		hasContextMenu = false;
	} else if (!hasContextMenu && (context_menu === 'true' || context_menu === true)) {
		chrome.contextMenus.create({
			type: 'normal',
			title: 'Add \'%s\' to Tumblr Savior black list',
			contexts: ['selection'],
			documentUrlPatterns: ['http://www.tumblr.com/*', 'https://www.tumblr.com/*'],
			onclick: chromeAddToBlackList
		});
		hasContextMenu = true;
	}
}

function addToBlackList(theword) {
	const oldSettings = parseSettings();

	for (let v = 0; v < oldSettings.listBlack.length; v++) {
		if (oldSettings.listBlack[v].toLowerCase() === theword.toLowerCase()) {
			alert('\'' + theword + '\' is already on your black list.');
			return false;
		}
	}

	oldSettings.listBlack.push(theword.toLowerCase());
	localStorage.setItem('settings', JSON.stringify(oldSettings));

	return true;
}

function chromeAddToBlackList(info, tab) {
	const theword = info.selectionText.trim();

	if (!theword || !addToBlackList(theword)) {
		return;
	}

	const views = chrome.extension.getViews();
	const optionsURI = chrome.extension.getURL('data/options.html');

	Array.prototype.forEach.call(views, ({ location }) => {
		if (location === optionsURI) location.reload();
	});

	chrome.tabs.sendMessage(tab.id, 'refreshSettings');
}


function chromeMessageHandler({ name }, sender, sendResponse) {
	const response = { name };

	if (name === 'getSettings') {
		setupContextMenu();
		response.parameters = localStorage.getItem('settings');
	}

	sendResponse(response);
}

chrome.runtime.onMessage.addListener(chromeMessageHandler);

setupContextMenu();
