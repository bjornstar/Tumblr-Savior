/* global defaultSettings:readonly */

let inputLast = 0; //our unique ids for list items

const settingsInputs = { //match up our settings object with our dom.
	checkboxes: {
		context_menu: 'context_menu_cb',
		hide_filtered_content: 'hide_filtered_content_cb',
		hide_radar: 'hide_radar_cb',
		hide_reblog_header: 'hide_reblog_header_cb',
		hide_recommended_blogs: 'hide_recommended_blogs_cb',
		hide_recommended_posts: 'hide_recommended_posts_cb',
		hide_source: 'hide_source_cb',
		hide_sponsored: 'hide_sponsored_cb',
		hide_sponsored_sidebar: 'hide_sponsored_sidebar_cb',
		ignore_body: 'ignore_body_cb',
		ignore_filtered_content: 'ignore_filtered_content_cb',
		ignore_header: 'ignore_header_cb',
		ignore_tags: 'ignore_tags_cb',
		match_words: 'match_words_cb',
		remove_redirects: 'remove_redirects_cb',
		show_notice: 'show_notice_cb',
		show_tags: 'show_tags_cb',
		show_words: 'show_words_cb',
	},
	lists:  {
		listBlack: 'listBlack',
		listWhite: 'listWhite'
	}
};

function tabClick(whichTab) {
	let currentTab;

	const tabs = document.getElementById('tabs');

	for (let tab in tabs.children) {
		if (Object.prototype.hasOwnProperty.call(tabs.children, tab)) {
			currentTab = tabs.children[tab];
			if (typeof currentTab === 'object') {
				if (currentTab.id !== whichTab.id) {
					currentTab.className = '';
				} else {
					currentTab.className = 'selected';
				}
			}
		}
	}

	const foregroundDiv = document.getElementById('foregroundDiv');
	const backgroundDiv = document.getElementById('backgroundDiv');
	const load_btn = document.getElementById('load_btn');
	const save_btn = document.getElementById('save_btn');
	const reset_btn = document.getElementById('reset_btn');
	const spacerDiv = document.getElementById('spacer');

	if (foregroundDiv.children[0].id !== whichTab.id.replace('Tab', 'Div')) {
		const switchto = document.getElementById(whichTab.id.replace('Tab', 'Div'));
		const switchfrom = foregroundDiv.children[0];
		backgroundDiv.appendChild(switchfrom);
		foregroundDiv.appendChild(switchto);
		switch (whichTab.id) {
		case 'aboutTab':
			load_btn.style.display = 'none';
			save_btn.style.display = 'none';
			reset_btn.style.display = 'none';
			spacerDiv.style.display = 'none';
			break;
		case 'saveloadTab':
			load_btn.style.display = '';
			save_btn.style.display = 'none';
			reset_btn.style.display = '';
			spacerDiv.style.display = 'none';
			break;
		case 'listsTab':
		case 'settingsTab':
			load_btn.style.display = 'none';
			save_btn.style.display = '';
			reset_btn.style.display = '';
			spacerDiv.style.display = '';
			break;
		}
	}
}

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

function removeElement(id) {
	const element = document.getElementById(id);
	element && element.parentNode.removeChild(element);
}

function addInput(whichList, itemValue = '') {
	let currentLength = inputLast++; //have unique DOM id's

	const listDiv = document.getElementById(whichList);
	const listAdd = document.getElementById(whichList + 'Add');

	const optionInput = document.createElement('input');
	optionInput.value = itemValue;
	optionInput.name = 'option' + whichList;
	optionInput.id = 'option' + whichList + currentLength;

	const optionAdd = document.createElement('a');
	optionAdd.href = '#';
	optionAdd.addEventListener('click', function (e) {
		let removeThis = e.target;
		while (removeThis.tagName !== 'DIV') {
			removeThis = removeThis.parentNode;
		}
		if (removeThis.id.indexOf('_div') >= 0) {
			removeElement(removeThis.id);
		}
		e.preventDefault();
		e.stopPropagation();
	}, false);

	optionAdd.appendChild(document.createTextNode('\u00A0'));

	const optionImage = document.createElement('img');
	optionImage.src = '../data/x.png';
	optionAdd.appendChild(optionImage);

	optionAdd.appendChild(document.createTextNode('\u00A0'));

	const optionLinebreak = document.createElement('br');
	const optionDiv = document.createElement('div');
	optionDiv.id = 'option' + whichList + currentLength + '_div';
	optionDiv.appendChild(optionAdd);
	optionDiv.appendChild(optionInput);
	optionDiv.appendChild(optionLinebreak);

	listDiv.insertBefore(optionDiv, listAdd);
}

function loadOptions() {
	const loadSettings = parseSettings();

	for (const settingsValue in settingsInputs.checkboxes) {
		if (Object.prototype.hasOwnProperty.call(settingsInputs.checkboxes, settingsValue)) {
			const settingsInput = document.getElementById(settingsInputs.checkboxes[settingsValue]);
			if (settingsInput !== undefined) {
				settingsInput.checked = loadSettings[settingsValue];
			}
		}
	}

	for (const settingsValue in settingsInputs.lists) {
		if (Object.prototype.hasOwnProperty.call(settingsInputs.lists, settingsValue)) {
			const settingsInput = settingsInputs.lists[settingsValue];
			for (const listEntry in loadSettings[settingsValue]) {
				if (Object.prototype.hasOwnProperty.call(loadSettings[settingsValue], listEntry)) {
					addInput(settingsInput, loadSettings[settingsValue][listEntry]);
				}
			}
			addInput(settingsInput); //prepare a blank input box.
		}
	}

	const inandout = document.getElementById('inandout');
	inandout.textContent = JSON.stringify(loadSettings, null, 2);
}

function checkurl(url, filter) {
	for (let f in filter) {
		if (Object.prototype.hasOwnProperty.call(filter, f)) {
			const filterRegex = filter[f].replace(/\x2a/g, '(.*?)');
			const re = new RegExp(filterRegex);
			if (url.match(re)) {
				return true;
			}
		}
	}
	return false;
}

function webExtensionNotifyTumblr(tabs) {
	for (let tab in tabs) {
		if (Object.prototype.hasOwnProperty.call(tabs, tab) && checkurl(tabs[tab].url, ['http://www.tumblr.com/*', 'https://www.tumblr.com/*'])) {
			chrome.tabs.sendMessage(tabs[tab].id, 'refreshSettings');
		}
	}
}

function notifyBrowsers() {
	chrome.tabs.query({ url: '*://*.tumblr.com/*' }, webExtensionNotifyTumblr);
}

function resetLists() {
	const listsDiv = document.getElementById('listsDiv');
	const listsInputs = listsDiv.getElementsByTagName('input');

	const arrayRemove = Array.prototype.map.call(listsInputs, listsInput => `${listsInput.id}_div`);

	arrayRemove.forEach(removeElement);
}

function saveOptions() {
	let settingsInput, listInputs;

	const newSettings = {};

	for (let settingsValue in settingsInputs.checkboxes) {
		if (Object.prototype.hasOwnProperty.call(settingsInputs.checkboxes, settingsValue)) {
			settingsInput = document.getElementById(settingsInputs.checkboxes[settingsValue]);
			if (settingsInput) {
				newSettings[settingsValue] = settingsInput.checked;
			}
		}
	}

	for (let settingsValue in settingsInputs.lists) {
		if (Object.prototype.hasOwnProperty.call(settingsInputs.lists, settingsValue)) {
			newSettings[settingsValue] = [];
			settingsInput = document.getElementById(settingsInputs.lists[settingsValue]);
			listInputs = settingsInput.getElementsByTagName('input');
			for (let i = 0; i < listInputs.length; i += 1) {
				if (listInputs[i].value !== '') {
					newSettings[settingsValue].push(listInputs[i].value);
				}
			}
		}
	}

	newSettings.version = defaultSettings.version; //always update version info from default.

	localStorage.setItem('settings', JSON.stringify(newSettings));
	notifyBrowsers(newSettings);
	resetLists();
	loadOptions();
}

function eraseOptions() {
	localStorage.setItem('settings', JSON.stringify(defaultSettings));
	notifyBrowsers(defaultSettings);
	resetLists();
	loadOptions();
}

function importOptions() {
	const dirtySettings = document.getElementById('inandout').value;

	let importSettings;

	try {
		importSettings = JSON.parse(dirtySettings);
	} catch (e) {
		alert('Those are settings are corrupt, I\'m sorry but I can\'t use them.');
		return;
	}

	localStorage.setItem('settings', JSON.stringify(importSettings));

	resetLists();
	loadOptions();
	notifyBrowsers(importSettings);
}

function addInputClickHandler(e) {
	addInput(e.target.parentNode.id);
	e.preventDefault();
	e.stopPropagation();
}

function getBrowserName() {
	if (navigator.userAgent.includes('OPR')) return 'Opera';
	if (navigator.userAgent.includes('Firefox')) return 'Firefox';
	if (navigator.userAgent.includes('Edg/')) return 'Edge';
	if (navigator.userAgent.includes('Chrome')) return 'Chrome';

	console.error('Tumblr Savior could not detect your browser.');

	return 'Undetected Browser';
}

function contentLoaded() {
	const save_btn = document.getElementById('save_btn');
	const reset_btn = document.getElementById('reset_btn');
	const load_btn = document.getElementById('load_btn');
	const listsTab = document.getElementById('listsTab');
	const settingsTab = document.getElementById('settingsTab');
	const saveloadTab = document.getElementById('saveloadTab');
	const aboutTab = document.getElementById('aboutTab');

	save_btn.addEventListener('click', saveOptions);

	load_btn.addEventListener('click', function () {
		if (confirm('Are you sure you want to load these settings?')) {
			importOptions();
		}
	});

	reset_btn.addEventListener('click', function () {
		if (confirm('Are you sure you want to restore defaults?')) {
			eraseOptions();
		}
	});

	for (const settingsValue in settingsInputs.lists) {
		if (Object.prototype.hasOwnProperty.call(settingsInputs.lists, settingsValue)) {
			const addButton = document.getElementById(settingsInputs.lists[settingsValue] + 'Add');
			addButton.addEventListener('click', addInputClickHandler, false);
		}
	}

	listsTab.addEventListener('click', function (e) {
		tabClick(listsTab);
		e.preventDefault();
		e.stopPropagation();
	}, false);

	settingsTab.addEventListener('click', function (e) {
		tabClick(settingsTab);
		e.preventDefault();
		e.stopPropagation();
	}, false);

	saveloadTab.addEventListener('click', function (e) {
		tabClick(saveloadTab);
		e.preventDefault();
		e.stopPropagation();
	}, false);

	aboutTab.addEventListener('click', function (e) {
		tabClick(aboutTab);
		e.preventDefault();
		e.stopPropagation();
	}, false);


	const version_div = document.getElementById('version_div');
	version_div.textContent = 'v' + defaultSettings.version; //use default so we're always showing current version regardless of what people have saved.

	const browserName = getBrowserName();
	if (browserName !== 'Undetected') {
		const browser_span = document.getElementById('browser_span');
		browser_span.textContent = `for ${browserName}\u2122`;
	}

	loadOptions();
}

document.addEventListener('DOMContentLoaded', contentLoaded);
