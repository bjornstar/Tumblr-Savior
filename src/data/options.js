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
	'version': '2.3.1'
}; // Initialize default values.

const { version } = defaultSettings;

let inputLast = 0; //our unique ids for list items

const settingsInputs = { //match up our settings object with our dom.
	checkboxes: {
		context_menu: 'context_menu_cb',
		hide_filtered_content: 'hide_filtered_content_cb',
		hide_radar: 'hide_radar_cb',
		hide_reblog_header: 'hide_reblog_header_cb',
		hide_recommended_blogs: 'hide_recommended_blogs_cb',
		hide_recommended_posts: 'hide_recommended_posts_cb',
		hide_sidebar_buttons: 'hide_sidebar_buttons_cb',
		hide_source: 'hide_source_cb',
		hide_sponsored: 'hide_sponsored_cb',
		hide_sponsored_sidebar: 'hide_sponsored_sidebar_cb',
		hide_timeline_objects: 'hide_timeline_objects_cb',
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
		load_btn.style.display = ['aboutTab', 'listsTab', 'settingsTab'].includes(whichTab.id) ? 'none' : '';
		save_btn.style.display = ['aboutTab', 'saveloadTab'].includes(whichTab.id) ? 'none' : '';
		reset_btn.style.display = ['aboutTab'].includes(whichTab.id) ? 'none' : '';
		spacerDiv.style.display = ['aboutTab', 'saveloadTab'].includes(whichTab.id) ? 'none' : '';
	}
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

	return chrome.storage.local.set({ ...defaultSettings, ...newSettings, version });
}

function eraseOptions() {
	return chrome.storage.local.set(defaultSettings);
}

function importOptions() {
	const inandout = document.getElementById('inandout');

	let importSettings;

	try {
		importSettings = JSON.parse(inandout.value);
		return chrome.storage.local.set({ ...defaultSettings, ...importSettings, version });
	} catch (e) {
		console.error(e);
		alert('Those are settings are corrupt, I\'m sorry but I can\'t use them.');
	}
}

function readLocalStorage() {
	try {
		const localStorageSettings = JSON.parse(localStorage.getItem('settings'));
		if (!localStorageSettings) throw new Error('Nothing in localStorage');
		const displaySettings = JSON.stringify(localStorageSettings, null, 2);

		const inandout = document.getElementById('inandout');

		inandout.value = displaySettings;
		inandout.textContent = displaySettings;
	} catch(e) {
		console.error(e);
		alert('Could not find any valid settings in localStorage, sorry!');
	}
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
	const read_btn = document.getElementById('read_btn');
	const reset_btn = document.getElementById('reset_btn');
	const load_btn = document.getElementById('load_btn');
	const listsTab = document.getElementById('listsTab');
	const settingsTab = document.getElementById('settingsTab');
	const saveloadTab = document.getElementById('saveloadTab');
	const aboutTab = document.getElementById('aboutTab');

	read_btn.addEventListener('click', readLocalStorage);
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
	version_div.textContent = 'v' + version;

	const browserName = getBrowserName();
	if (browserName !== 'Undetected') {
		const browser_span = document.getElementById('browser_span');
		browser_span.textContent = `for ${browserName}\u2122`;
	}

	return updateInputs();
}

document.addEventListener('DOMContentLoaded', contentLoaded);

function v2AlertClick(e) {
	tabClick(document.getElementById('saveloadTab'));
	e.preventDefault();
	e.stopPropagation();
}

function updateInputs() {
	return chrome.storage.local.get().then(settings => {
		const appliedSettings = { ...defaultSettings, ...settings };
		const displaySettings = JSON.stringify(appliedSettings, null, 2);

		const inandout = document.getElementById('inandout')

		inandout.value = displaySettings;
		inandout.textContent = displaySettings;

		resetLists();

		for (const settingsValue in settingsInputs.checkboxes) {
			if (Object.prototype.hasOwnProperty.call(settingsInputs.checkboxes, settingsValue)) {
				const settingsInput = document.getElementById(settingsInputs.checkboxes[settingsValue]);
				if (settingsInput !== undefined) {
					settingsInput.checked = appliedSettings[settingsValue];
				}
			}
		}

		for (const settingsValue in settingsInputs.lists) {
			if (Object.prototype.hasOwnProperty.call(settingsInputs.lists, settingsValue)) {
				const settingsInput = settingsInputs.lists[settingsValue];
				for (const listEntry in appliedSettings[settingsValue]) {
					if (Object.prototype.hasOwnProperty.call(appliedSettings[settingsValue], listEntry)) {
						addInput(settingsInput, appliedSettings[settingsValue][listEntry]);
					}
				}
				addInput(settingsInput); //prepare a blank input box.
			}
		}

		document.querySelector('#v2_alert a').removeEventListener('click', v2AlertClick);

		if (localStorage.getItem('settings') && !Object.keys(settings).length) {
			document.getElementById('v2_alert').style.display = 'block';
			document.querySelector('#v2_alert a').addEventListener('click', v2AlertClick, false);
		} else {
			document.getElementById('v2_alert').style.display = 'none';
		}
	});
}

chrome.storage.onChanged.addListener(updateInputs);
