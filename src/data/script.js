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
	'version': '2.5.0'
}; // Initialize default values.

const BASE_CONTAINER_ID = 'base-container';

const CSS_CLASS_MAP = {
	attribution: 'eqBap',
	blogRow: 'Ut4iZ',
	cell: 'rZlUD',
	contentSource: 'd_FyU',
	controlIcon: 'gc3fY',
	controls: 'MCavR',
	desktopContainer: 'B15CE',
	diamondShape: 'jMbMz',
	filteredScreen: 'W0ros',
	footerWrapper: 'qYXF9',
	footer: 'Ha4CC',
	isVisible: 'KYCZY',
	listTimelineObject: 'So6RQ',
	moreContent: 'oFuUq',
	mrecContainer: 'Yc2Sp',
	noteCount: 'gstmW',
	noteCountButton: 'rlv6m',
	radar: 'Q55_h',
	reblog: 'u2tXn',
	reblogHeader: 'fAAi8',
	recommendationReasonTopTeaserWrapper: 'n_1Sv',
	recommendedBlogs: 'PwJi6',
	sidebar: 'e1knl',
	sidebarItem: 'FZkjV',
	stickyContainer: 'AD_w7',
	tags: 'hAFp3',
	textBlock: 'k31gt',
	timeline: [
		"Gm6ol",
		"iPJDl",
		"NEYEx",
		"Evcyl",
		"j8ha0",
		"AiNLD",
		"pvWan",
		"dZmD5"
	]
};

/**
 * @param className {keyof CSS_CLASS_MAP}
 **/
function css(className) {
	return `.${CSS_CLASS_MAP[className]}`;
}

let settings = defaultSettings;
let gotSettings = false;

const howToHide = '{display:none!important;}';

const styleRules = {
	hide_filtered_content: [
		'.has-filtered-content' + howToHide
	],
	hide_radar: [`
		@supports selector(:has(a)) {
			${css('sidebarItem')}:has(${css('radar')})${howToHide}
		}
		@supports not selector(:has(a)) {
			aside .radar${howToHide}
		}`
	],
	hide_reblog_header: [
		css('reblogHeader') + howToHide,
		css('reblog') + '{padding-top:inherit;}'
	],
	// We can drop the conditional when Firefox supports the :has selector
	hide_recommended_blogs: [`
		@supports selector(:has(a)) {
			${css('sidebarItem')}:has(${css('recommendedBlogs')})${howToHide}
			${css('desktopContainer')}:has(${css('recommendedBlogs')})${howToHide}
		}
		@supports not selector(:has(a)) {
			aside .recommendedBlogs${howToHide}
		}`
	],
	hide_recommended_posts: [
		'.recommended-post' + howToHide
	],
	hide_sidebar_buttons: [
		`${css('sidebarItem')}:has(${css('diamondShape')})${howToHide}`
	],
	hide_source: [
		css('attribution') + howToHide,
		css('contentSource') + howToHide
	],
	hide_sponsored: [
		`${css('listTimelineObject')}.moatContainer ${howToHide}`,
	],
	hide_sponsored_sidebar: [
		css('mrecContainer') + howToHide
	],
	hide_timeline_objects: CSS_CLASS_MAP.timeline.map(timeline =>
		`.${timeline} ${css('cell')}${css('isVisible')}:not(:has(article)){visibility:hidden;height:0}`,
	),
};

const tumblrSaviorAnimation = [`
	@keyframes tumblrSaviorAnimation {
		from { clip: rect(1px, auto, auto, auto); }
		to { clip: rect(0px, auto, auto, auto); }
	}`,`
	article {
		animation-duration: 1ms;
		animation-name: tumblrSaviorAnimation;
	}
`];

const articleBlacklistedStyle = [`
	article.tumblr-savior-blacklisted:not(.tumblr-savior-override) > :not(${css('stickyContainer')}):not(header):not(${css('footerWrapper')}):not(ts-notice) {
		display: none;
	}
`];

const hydratingStyle = [`
	#${BASE_CONTAINER_ID}.hydrating .tumblr-savior-blacklisted footer::after {
		content: "Loading...";
	}
`];

const hideNoteCountStyle = [`
	article.tumblr-savior-blacklisted:not(.tumblr-savior-override) ${css('noteCountButton')} {
		display: none;
	}
`];

const hideControlsStyle = [`
	article.tumblr-savior-blacklisted:not(.tumblr-savior-override) ${css('controlIcon')} {
		display: none;
	}
`];

const showButtonStyle = [`
	.tumblr-savior-show {
		border: 1px solid rgba(var(--black),.65);
		color: rgba(var(--black),.65);
		border-radius: 2px;
		font-weight: 700;
		padding: 5px 7px;
		margin-left: 10px;
	}
	.tumblr-savior-show::after {
		content: "Show me"
	}
	.tumblr-savior-override .tumblr-savior-show::after {
		content: "Hide this"
	}
`];

const noticeStyle = [`
	ts-notice ${css('textBlock')} {
		background-color: rgba(var(--black),.07);
		display: flex;
		white-space: normal;
	}
	ts-notice svg {
		width: 64px;
	}
	ts-notice div.content {
		flex: 1 1 0;
		padding-left: 10px;
	}
	ts-notice h1 {
		margin-top: 5px;
	}
	article.tumblr-savior-blacklisted.tumblr-savior-override ts-notice {
		display: none;
	}
`];

let id = 0;

function getId() {
	return id++;
}

function createWarningSVG() {
	const id = getId();

	// Based on https://github.com/fabianalexisinostroza/Antu-classic
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.setAttribute('viewBox', '0 0 64 64');

	const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

	const linearGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
	linearGradient.setAttribute('gradientTransform', 'matrix(1.31117 0 0 1.30239 737.39 159.91)')
	linearGradient.setAttribute('gradientUnits', 'userSpaceOnUse');
	linearGradient.setAttribute('id', id);
	linearGradient.setAttribute('y2', '-.599');
	linearGradient.setAttribute('x2', '0');
	linearGradient.setAttribute('y1', '45.47');

	const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
	stop1.setAttribute('stop-color', '#ffc515');

	const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
	stop2.setAttribute('offset', '1');
	stop2.setAttribute('stop-color', '#ffd55b');

	linearGradient.appendChild(stop1);
	linearGradient.appendChild(stop2);
	defs.appendChild(linearGradient);
	svg.appendChild(defs);

	const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	g.setAttribute('transform', 'matrix(.85714 0 0 .85714-627.02-130.8)');

	const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	path1.setAttribute('d', 'm797.94 212.01l-25.607-48c-.736-1.333-2.068-2.074-3.551-2.074-1.483 0-2.822.889-3.569 2.222l-25.417 48c-.598 1.185-.605 2.815.132 4 .737 1.185 1.921 1.778 3.404 1.778h51.02c1.483 0 2.821-.741 3.42-1.926.747-1.185.753-2.667.165-4');
	path1.setAttribute('fill', `url(#${id})`);

	const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	path2.setAttribute('d', 'm-26.309 18.07c-1.18 0-2.135.968-2.135 2.129v12.82c0 1.176.948 2.129 2.135 2.129 1.183 0 2.135-.968 2.135-2.129v-12.82c0-1.176-.946-2.129-2.135-2.129zm0 21.348c-1.18 0-2.135.954-2.135 2.135 0 1.18.954 2.135 2.135 2.135 1.181 0 2.135-.954 2.135-2.135 0-1.18-.952-2.135-2.135-2.135z');
	path2.setAttribute('fill', '#000');
	path2.setAttribute('fill-opacity', '.75');
	path2.setAttribute('stroke', '#40330d');
	path2.setAttribute('transform', 'matrix(1.05196 0 0 1.05196 796.53 161.87)');

	g.appendChild(path1);
	g.appendChild(path2);

	svg.appendChild(g);

	return svg;
}

const filters = {};

function needsToBeSaved(text) {
	const normalizedStr = text.toLowerCase().replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/\s+/g, ' ');

	return {
		blackList: settings.listBlack.filter((entry, index) => {
			return filters.black[index](normalizedStr);
		}),
		whiteList: settings.listWhite.filter((entry, index) => {
			return filters.white[index](normalizedStr);
		})
	};
}

function createStyle(styleId) {
	const elmStyle = document.createElement('style');

	elmStyle.id = styleId;

	return elmStyle;
}

function addGlobalStyle(styleId, newRules) {
	const [elmHead] = document.getElementsByTagName('head');

	if (!elmHead) {
		return;
	}

	let cStyle = document.getElementById(styleId);

	const hadStyle = !!cStyle;

	cStyle = cStyle || createStyle(styleId);

	while (cStyle.sheet && cStyle.sheet.cssRules.length) {
		cStyle.sheet.deleteRule(0);
	}

	if (cStyle.textContent) {
		cStyle.textContent = '';
	}

	newRules.forEach(newRule => {
		if (cStyle.sheet && cStyle.sheet.cssRules[0]) {
			cStyle.sheet.insertRule(newRule, 0);
		} else {
			cStyle.appendChild(document.createTextNode(newRule));
		}
	});

	if (!hadStyle) {
		elmHead.appendChild(cStyle);
	}
}

function extractText({ childNodes, nodeType, tagName, textContent }) {
	if (nodeType === 3 || tagName === 'P') return textContent + (textContent.endsWith(' ') ? '' : ' ');

	return Array.prototype.filter.call(childNodes, ({ textContent }) => textContent).map(extractText).join('');
}

const hideNoticesStyle = [ `article.tumblr-savior-blacklisted:not(.tumblr-savior-override) {display:none;}` ];
const hideTagsStyle = [ `.tumblr-savior-blacklisted:not(.tumblr-savior-override) ${css('tags')} {display:none!important;}` ];

function applySettings() {
	addGlobalStyle('show-notices', settings.show_notice ? [] : hideNoticesStyle);
	addGlobalStyle('show-tags', settings.show_tags ? [] : hideTagsStyle)

	for (const id in styleRules) {
		const cssRules = [...(settings[id] ? styleRules[id] : [])];
		addGlobalStyle(id, cssRules);
	}
}

function buildRegex(entry) {
	// Escape all regex characters except for * which matches anything except spaces.
	entry = entry.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, ' ').replace(/[*]/g, '[^\\s]*?');

	const str = '(^|\\W)(' + entry + ')(\\W|$)';
	const re = new RegExp(str);

	return function testRegex(content) {
		return content.match(re);
	};
}

function buildIndexOf(entry) {
	return function testIndexOf(content) {
		return content.indexOf(entry) !== -1;
	};
}

function buildFilters() {
	let i, entry, test;

	filters.black = [];
	filters.white = [];

	if (settings.match_words) {
		for (i = 0; i < settings.listBlack.length; i += 1) {
			entry = settings.listBlack[i].toLowerCase();
			test = buildRegex(entry);
			filters.black.push(test);
		}
		for (i = 0; i < settings.listWhite.length; i += 1) {
			entry = settings.listWhite[i].toLowerCase();
			test = buildRegex(entry);
			filters.white.push(test);
		}
	} else {
		for (i = 0; i < settings.listBlack.length; i += 1) {
			entry = settings.listBlack[i].toLowerCase();
			test = buildIndexOf(entry);
			filters.black.push(test);
		}
		for (i = 0; i < settings.listWhite.length; i += 1) {
			entry = settings.listWhite[i].toLowerCase();
			test = buildIndexOf(entry);
			filters.white.push(test);
		}
	}
}

function removeRedirects(post) {
	if (!settings.remove_redirects) return;

	const links = post.getElementsByTagName('A')

	Array.prototype.forEach.call(links, link => {
		if (link.href.startsWith('https://href.li/?')) {
			link.href = link.href.replace('https://href.li/?', '');
		}
	})
}

function listWords(list) {
	const length = list.length;
	return list.reduce((out, word, index) => {
		if (length > 2 && index !== 0 && index < length - 1) {
			out += ',';
		}
		if (length > 1 && index === length - 1) {
			out += ' and';
		}
		out += ' \'' + word + '\'';
		return out;
	}, ':');
}

function decoratePost(post, blackList) {
	if (!blackList.length) {
		return;
	}

	const tsNotice = document.createElement('ts-notice');
	tsNotice.className = CSS_CLASS_MAP.reblog;

	const divNotice = document.createElement('div');
	divNotice.className = CSS_CLASS_MAP.textBlock;

	const divContent = document.createElement('div');
	divContent.className = 'content';

	const h1Content = document.createElement('h1');
	h1Content.appendChild(document.createTextNode('Content warning'));
	divContent.appendChild(h1Content);

	const spanContent = document.createElement('span');
	const textContent = 'This post may contain' +
		(settings.show_words ? listWords(blackList) : ' something from your blacklist.');
	const textNotice = document.createTextNode(textContent);
	spanContent.appendChild(textNotice);

	divContent.appendChild(spanContent);

	divNotice.appendChild(createWarningSVG());
	divNotice.appendChild(divContent);
	tsNotice.appendChild(divNotice);

	post.insertBefore(tsNotice, post.querySelector('header').nextSibling);

	const buttonShow = document.createElement('button');
	buttonShow.className = 'tumblr-savior-show';
	buttonShow.addEventListener('click', () => {
		if (post.classList.contains('tumblr-savior-override')) {
			post.classList.remove('tumblr-savior-override');
		} else {
			post.classList.add('tumblr-savior-override');
		}
	});

	const footerWrapper = post.querySelector(css('footerWrapper')) || post.appendChild(createFooterWrapper());

	const footer = last(post.querySelectorAll(`footer ${css('controls')}`)) || footerWrapper.appendChild(createFooter());

	footer.appendChild(buttonShow);
}

function last(arrayLike) {
	return Array.prototype.at.call(arrayLike, -1);
}

function createFooterWrapper() {
	const footerWrapper = document.createElement('div');
	footerWrapper.classList.add(CSS_CLASS_MAP.footerWrapper);

	const noteCount = document.createElement('div');
	noteCount.classList.add(CSS_CLASS_MAP.noteCount);
	footerWrapper.appendChild(noteCount);

	return footerWrapper;
}

function createFooter() {
	const controls = document.createElement('div');
	controls.classList.add(CSS_CLASS_MAP.controls);

	const footer = document.createElement('footer')
	footer.appendChild(controls);
	footer.classList.add(CSS_CLASS_MAP.footer);
	return footer;
}

function removeElement(element) {
	element.parentNode.removeChild(element);
}

function removeByClassName(element, className) {
	Array.prototype.forEach.call(element.getElementsByClassName(className), removeElement);
}

function removeByTagName(element, tagName) {
	Array.prototype.forEach.call(element.getElementsByTagName(tagName), removeElement);
}

function undecoratePost(post) {
	removeByTagName(post, 'ts-notice');
	removeByClassName(post, 'tumblr-savior-show');
}

function checkPost(post) {
	if (!gotSettings) return;

	removeRedirects(post);

	post.classList.remove('tumblr-savior-blacklisted');
	post.removeAttribute('data-tumblr-savior-blacklist');

	if (window.location.pathname.endsWith('/drafts')) return;

	let postText = '';

	const postHeader = post.querySelector('header');
	const postTags = post.querySelector(css('tags'));

	if (postHeader && !settings.ignore_header) {
		postText += extractText(postHeader);
	}

	let hasFilteredContent = false;

	postText += Array.prototype.reduce.call(post.childNodes, (out, node) => {
		const { classList, innerHTML, tagName } = node;
		hasFilteredContent = hasFilteredContent || classList.contains(CSS_CLASS_MAP.filteredScreen);

		if (settings.ignore_body || ['HEADER', 'TS-NOTICE'].includes(tagName) || classList.contains(CSS_CLASS_MAP.footerWrapper) || (settings.ignore_filtered_content && hasFilteredContent)) {
			return out;
		}

		return `${out} ${innerHTML} ${extractText(node)} `;
	}, ' ');

	const isRecommendedPost = post.querySelector(css('recommendationReasonTopTeaserWrapper'));

	if (postTags && !settings.ignore_tags) {
		postText += extractText(postTags);
	}

	const { blackList, whiteList } = needsToBeSaved(postText);

	if (blackList.length) {
		post.classList.add('tumblr-savior-blacklisted');
		post.setAttribute('data-tumblr-savior-blacklist', blackList.join(', '));
	}

	if (whiteList.length) {
		post.classList.add('tumblr-savior-override');
		post.setAttribute('data-tumblr-savior-whitelist', whiteList.join(', '));
	}

	if (hasFilteredContent) {
		post.classList.add('has-filtered-content');
	}

	if (isRecommendedPost) {
		post.classList.add('recommended-post');
	}

	hydrationPromise.then(() => {
		undecoratePost(post);
		decoratePost(post, blackList);
	});
}

function handleAnimationStart(event) {
	const { animationName, target: post } = event;

	if (animationName !== 'tumblrSaviorAnimation') return;

	checkPost(post);
}

function checkPosts() {
	const posts = document.getElementsByTagName('article');

	Array.prototype.forEach.call(posts, checkPost);
}

function getSettings() {
	return chrome.storage.local.get().then(savedSettings => {
		settings = { ...defaultSettings, ...savedSettings };
		gotSettings = true;

		buildFilters();
		applySettings();
		checkPosts();
	});
}

function initialize() {
	document.addEventListener('animationstart', handleAnimationStart, false);

	addGlobalStyle('tumblr-savior-animation', tumblrSaviorAnimation);
	addGlobalStyle('article-blacklisted', articleBlacklistedStyle);
	addGlobalStyle('hydrating', hydratingStyle);
	addGlobalStyle('hide-note-count', hideNoteCountStyle);
	addGlobalStyle('hide-controls', hideControlsStyle);
	addGlobalStyle('show-button', showButtonStyle);
	addGlobalStyle('ts-notice', noticeStyle);

	chrome.storage.onChanged.addListener(() => getSettings());

	return getSettings();
}

function addClassNameToParent(container, className) {
	const element = container.querySelector(css(className));
	if (element) {
		element.parentNode.classList.add(className);
	}
}

function observeAside(baseContainer) {
	let asideObserver;
	const observer = new MutationObserver(mutationList => {
		for (let i = 0; i < mutationList.length; i += 1) {
			if (mutationList[i].removedNodes.length && asideObserver) {
				if (asideObserver) {
					asideObserver.disconnect();
					asideObserver = undefined;
				}
			}

			if (mutationList[i].addedNodes.length && !asideObserver) {
				const onAddAside = baseContainer.querySelector('aside');

				if (!onAddAside) return;

				addClassNameToParent(onAddAside, 'radar');
				addClassNameToParent(onAddAside, 'recommendedBlogs');

				asideObserver = asideObserver || new MutationObserver(() => {
					addClassNameToParent(onAddAside, 'radar');
					addClassNameToParent(onAddAside, 'recommendedBlogs');
				});

				asideObserver.observe(onAddAside, { childList: true, subtree: true });
			}
		}
	});

	observer.observe(baseContainer, { childList: true });
}

function waitForHydration(baseContainer) {
	baseContainer.classList.add('hydrating');

	return new Promise((resolve, reject) => {
		const hydrationTimeout = setTimeout(() => {
			reject('Timed out waiting for hydration to complete');
		}, 10000);

		const observer = new MutationObserver(() => {
			observer.disconnect();
			clearTimeout(hydrationTimeout);
			baseContainer.classList.remove('hydrating');
			resolve();
		});

		observer.observe(baseContainer, { childList: true });
	});
}

function waitForBaseContainer() {
	return new Promise((resolve) => {
		const observer = new MutationObserver(mutationList => {
			for (let i = 0; i < mutationList.length; i += 1) {
				for (let j = 0; j < mutationList[i].addedNodes.length; j += 1) {
					if (mutationList[i].addedNodes[j].id === BASE_CONTAINER_ID) {
						observer.disconnect();
						return resolve(mutationList[i].addedNodes[j]);
					}
				}
			}
		});
		observer.observe(document, { childList: true, subtree: true });
	});
}

const bcPromise = waitForBaseContainer();

const hydrationPromise = bcPromise.then(baseContainer => {
	initialize(baseContainer);

	if (!CSS.supports('selector(:has(a))')) {
		observeAside(baseContainer);
	}

	return waitForHydration(baseContainer);
}).catch(console.error);
