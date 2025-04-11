const defaultSettings = {
	'context_menu': true,
	'hide_filtered_content': false,
	'hide_radar': true,
	'hide_reblog_header': true,
	'hide_recommended_blogs': true,
	'hide_recommended_posts': true,
	'hide_sidebar_buttons': true,
	'hide_source': true,
	'hide_sponsored': true,
	'hide_sponsored_sidebar': true,
	'hide_timeline_objects': true,
	'ignore_body': false,
	'ignore_filtered_content': true,
	'ignore_header': false,
	'ignore_tags': false,
	'listBlack': ['trump'],
	'listWhite': ['bjorn', 'octopus'],
	'match_words': true,
	'remove_redirects': true,
	'show_notice': true,
	'show_tags': true,
	'show_words': true,
	'version': '2.4.0'
}; // Initialize default values.

const { version } = defaultSettings;

function getSettings() {
	return chrome.storage.local.get().then(settings => ({ ...defaultSettings, ...settings }));
}

function setupContextMenu() {
	return getSettings().then(({ context_menu }) => {
		return chrome.contextMenus.removeAll().then(() => {
			if (context_menu === 'false' || !context_menu) return;

			chrome.contextMenus.create({
				contexts: ['selection'],
				documentUrlPatterns: ['https://www.tumblr.com/*'],
				id: 'addToBlackList',
				title: 'Add \'%s\' to Tumblr Savior black list',
				type: 'normal',
			});
		});
	});
}

chrome.contextMenus.onClicked.addListener((info) => {
	const theword = info.selectionText.trim();

	if (!theword) return;

	return getSettings().then(({ listBlack, ...settings }) => {
		for (let v = 0; v < listBlack.length; v++) {
			if (listBlack[v].toLowerCase() === theword.toLowerCase()) {
				return alert('\'' + theword + '\' is already on your black list.');
			}
		}

		listBlack.push(theword.toLowerCase());

		return chrome.storage.local.set({ ...defaultSettings, ...settings, listBlack, version });
	});
});

setupContextMenu();
