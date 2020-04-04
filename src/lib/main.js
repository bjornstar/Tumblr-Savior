var settings;

function chromeMessageHandler({ name, parameters }, sender, sendResponse) {
	var response = { name };

	if (name === 'getSettings') {
		response.parameters = localStorage.settings;
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

		chrome.tabs.sendMessage(tab.id, 'refreshSettings');
	}
}

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
