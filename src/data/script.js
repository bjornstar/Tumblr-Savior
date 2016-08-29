// ==UserScript==
// @include http://www.tumblr.com/*
// @include https://www.tumblr.com/*
// @exclude http://www.tumblr.com/upload/*
// @exclude https://www.tumblr.com/upload/*
// ==/UserScript==

var defaultSettings = {
	'version': '0.5.0',
	'listBlack': ['iphone', 'ipad'],
	'listWhite': ['bjorn', 'octopus'],
	'show_notice': true,
	'show_words': true,
	'match_words': true,
	'ignore_header': false,
	'ignore_body': false,
	'ignore_tags': false,
	'context_menu': true,
	'white_notice': true,
	'black_notice': true,
	'show_tags': true,
	'disable_on_inbox': false,
	'hide_source': true,
	'hide_premium': true,
	'hide_radar': true,
	'hide_recommended': true,
	'hide_recommended_blogs': true,
	'hide_some_more_blogs': true,
	'hide_sponsored': true,
	'hide_trending_badges': true,
	'hide_sponsored_notifications': true,
	'hide_yahoo_ads': true,
	'remove_redirects': true
}; // Initialize default values.

var invalidTumblrURLs = [
	'http://www.tumblr.com/upload/*',
	'https://www.tumblr.com/upload/*'
]; // Don't run tumblr savior on these pages.

var settings = defaultSettings;
var gotSettings = false;
var manuallyShown = {};
var isTumblrSaviorRunning = false;
var inProgress = {};

var noTags = /<[^>]*>/g;

var howToHide = '{display:none!important;}';

var styleRules = {
	hide_premium: [
		'#tumblr_radar.premium' + howToHide
	],
	hide_radar: [
		'div#tumblr_radar' + howToHide,
		'ul.controls_section_radar' + howToHide
	],
	hide_recommended: [
		'div.post.is_recommended' + howToHide
	],
	hide_recommended_blogs: [
		'div.recommended_tumblelogs' + howToHide
	],
	hide_some_more_blogs: [
		'li.recommended-unit-container' + howToHide
	],
	hide_source: [
		'div.post_source' + howToHide,
		// Simply doing display: none will cause the tags to be too far to the left. (#15)
		'div.post-source-footer { overflow: hidden; width: 0px; height: 1px; }',
		'.post.post_source_reposition.has_source.generic_source .post_tags { padding-left: 0px; }'
	],
	hide_sponsored: [
		'.remnantUnitContainer' + howToHide,
		'.remnant-unit-container' + howToHide,
		'.video-ad-container' + howToHide,
		'.sponsored_post' + howToHide,
		'.standalone-ad-container' + howToHide
	],
	hide_sponsored_notifications: [
		'li.notification.takeover-container' + howToHide
	],
	hide_trending_badges: [
		'div.explore-trending-badge-footer' + howToHide
	],
	hide_yahoo_ads: [
		'li.yamplus-unit-container' + howToHide,
		'.sidebar-ad-container' + howToHide
	]
};

var whiteListed = {};
var blackListed = {};

var filters = {};

function needstobesaved(theStr) {
	var blackList, whiteList, returnObject, i;

	blackList = settings.listBlack;
	whiteList = settings.listWhite;

	returnObject = { bL: [], wL: [] };

	normalizedStr = theStr.toLowerCase().replace(/&amp;/g, '&').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/\s+/g, ' ');

	for (i = 0; i < blackList.length; i += 1) {
		if (filters.black[i](normalizedStr)) {
			returnObject.bL.push(blackList[i]);
		}
	}
	for (i = 0; i < whiteList.length; i += 1) {
		if (filters.white[i](normalizedStr)) {
			returnObject.wL.push(whiteList[i]);
		}
	}

	return returnObject;
}

function createStyle(styleId) {
	var elmStyle = document.createElement('style');
	elmStyle.type = 'text/css';
	elmStyle.id = styleId;

	return elmStyle;
}

function addGlobalStyle(styleId, newRules) {
	var elmHead, cStyle, hadStyle, i, newRule;

	elmHead = document.getElementsByTagName('head')[0];

	if (!elmHead) {
		return;
	}

	cStyle = document.getElementById(styleId);

	hadStyle = !!cStyle;

	cStyle = cStyle || createStyle(styleId);

	while (cStyle.sheet && cStyle.sheet.cssRules.length) {
		cStyle.sheet.deleteRule(0);
	}

	if (cStyle.innerText) {
		cStyle.innerText = '';
	}

	for (i = 0; i < newRules.length; i += 1) {
		newRule = newRules[i];
		if (cStyle.sheet && cStyle.sheet.cssRules[0]) {
			cStyle.sheet.insertRule(newRule, 0);
		} else {
			cStyle.appendChild(document.createTextNode(newRule));
		}
	}

	if (!hadStyle) {
		elmHead.appendChild(cStyle);
	}
}

function show_tags() {
	var cssRules = [ '.tumblr_savior a.tag {font-weight: normal !important;}' ];
	addGlobalStyle('notice_tags_css', cssRules);
}

function hide_tags() {
	var cssRules = [ '.tumblr_savior a.tag {display: none !important;}' ];
	addGlobalStyle('notice_tags_css', cssRules);
}

function show_white_notice() {
	var cssRules = [];

	cssRules[0]  = '.whitelisted {';
	cssRules[0] += 'background-color: #56bc8a;';
	cssRules[0] += 'top: ' + (settings.black_notice ? 50 : 20) + 'px;';
	cssRules[0] += '}';
	addGlobalStyle('white_notice_style', cssRules);
}

function show_black_notice() {
	var cssRules = [];

	cssRules[0]  = '.blacklisted {';
	cssRules[0] += 'background-color: #d95e40;';
	cssRules[0] += 'top: 20px;';
	cssRules[0] += '}';
	cssRules[1]  = '.blacklisted i{';
	cssRules[1] += 'margin: 0px 0px 0px 4px;';
	cssRules[1] += '}';
	addGlobalStyle('black_notice_style', cssRules);
}

function hide_white_notice() {
	var cssRules = [ '.whitelisted {display: none;}' ];
	addGlobalStyle('white_notice_style', cssRules);
}

function hide_black_notice() {
	var cssRules = [ '.blacklisted {display: none;}' ];
	addGlobalStyle('black_notice_style', cssRules);
}

function hide_ratings() {
	var cssRules = [];

	cssRules[0]  = '.savior_rating {display: none;}';
	addGlobalStyle('savior_rating_style', cssRules);
}

function show_ratings() {
	var cssRules = [];

	cssRules[0]  = '.savior_rating {';
	cssRules[0] += 'position: absolute;';
	cssRules[0] += 'left: 532px;';
	cssRules[0] += 'width: 20px;';
	cssRules[0] += 'height: 20px;';
	cssRules[0] += '-webkit-border-radius: 4px;';
	cssRules[0] += '-webkit-box-shadow: 0 1px 5px rgba(0, 0, 0, .46);';
	cssRules[0] += 'border-radius: 4px;';
	cssRules[0] += 'color: #fff;';
	cssRules[0] += '}';
	cssRules[1]  = '.savior_rating:hover {';
	cssRules[1] += 'overflow: hidden;';
	cssRules[1] += 'white-space: nowrap;';
	cssRules[1] += 'width: 200px;';
	cssRules[1] += '}';
	cssRules[2]  = '.savior_rating:hover span{';
	cssRules[2] += 'display: inline;';
	cssRules[2] += '}';
	cssRules[3]  = '.savior_rating i {';
	cssRules[3] += 'margin: 0px 0px 0px 6px;';
	cssRules[3] += '}';
	cssRules[4]  = '.savior_rating span{';
	cssRules[4] += 'display: none;';
	cssRules[4] += 'line-height:20px;';
	cssRules[4] += 'margin-left:4px;';
	cssRules[4] += 'vertical-align: top;';
	cssRules[4] += '}';

	addGlobalStyle('savior_rating_style', cssRules);
}

function toggleStyle(id) {
	var rules = styleRules[id];
	var hide = settings[id];
	var cssRules = [];

	if (hide) {
		for (var i = 0; i < rules.length; i += 1) {
			cssRules.push(rules[i]);
		}
	}

	addGlobalStyle(id, cssRules);
}

function applySettings() {
	if (settings.white_notice || settings.black_notice) {
		show_ratings();
	} else {
		hide_ratings();
	}

	if (settings.black_notice) {
		show_black_notice();
	} else {
		hide_black_notice();
	}

	if (settings.white_notice) {
		show_white_notice();
	} else {
		hide_white_notice();
	}

	if (settings.show_tags) {
		show_tags();
	} else {
		hide_tags();
	}

	for (var id in styleRules) {
		toggleStyle(id);
	}
}

function buildRegex(entry) {
	// Escape all regex characters except for * which matches anything except spaces.
	entry = entry.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, ' ').replace(/[*]/g, '[^\\s]*?');

	var str = '(^|\\W)(' + entry + ')(\\W|$)';
	var re = new RegExp(str);

	return function testRegex(content) {
		return content.match(re);
	};
}

function buildIndexOf(entry) {
	return function testIndexOf(content) {
		return content.indexOf(entry) !== -1;
	};
}

function parseSettings(savedSettings) {
	// This parses the settings received from the options page and stashes them in the global
	// settings object. If there is a parse error, we get a warning and default values. We also
	// take this opportunity to pre-compile our blacklist and whitelist filters so we are not
	// wasting time repeatedly building them while filtering.

	var i, entry, test;

	try {
		settings = JSON.parse(savedSettings);
	} catch (err) {
		console.warn('Tumblr Savior: Error parsing settings, using defaults.');
		settings = defaultSettings;
	}

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

function getAuthor(post) {
	var author = {
		name: post.dataset.tumblelogName
	};

	var avatar = document.getElementById(post.id.replace('_', '_avatar_'));

	if (avatar) {
		author.avatar = avatar.getAttribute('style').replace('background-image:url(\'', '').replace('_64.', '_40.').replace('\')', '');
	}

	return author;
}

function handleReveal(e) {
	var searchUp;

	e.preventDefault();
	e.stopPropagation();

	searchUp = e.target;

	while (searchUp.tagName !== 'LI') {
		searchUp = searchUp.parentNode;
	}

	searchUp.previousSibling.style.display = 'list-item';
	searchUp.style.display = 'none';
	manuallyShown[searchUp.id.replace('notification_','')] = true;
}

// 2016-01-21 - Tumblr is now replacing external links in posts with their redirect service
// http://t.umblr.com/redirect?z=http%3A%2F%2Flookbook.nu%2Flook%2F8018284-Diario-De-Una-Couturier-Skirt-Buttoned-And-Blue&t=ZjQ2YzcxNTlhYmFlZTQzNGYyMGRmMmJjY2JlZDFjMmJkNzczMDk0YyxheENoQUl3Wg%3D%3D

regexRedirect = /z=([^&]*)/;

function removeRedirect(link) {
	var encodedUrl = link.href.match(regexRedirect)[1];
	if (encodedUrl) {
		link.href = decodeURIComponent(encodedUrl);
	}
}

function removeRedirects(post) {
	if (!settings.remove_redirects) {
		return;
	}

	links = post.getElementsByTagName('A')

	for (var i = 0; i < links.length; i += 1) {
		var link = links[i];
		if (link.href.indexOf('t.umblr.com') != -1) {
			removeRedirect(link);
		}
	}
}

function checkPost(post) {
	var bln, wln, liRemove, n, savedfrom, author, a_avatar, img_avatar, nipple_border, nipple, a_author, txtPosted, txtContents, j, br, a_reveal, i_reveal, span_notice_tags, span_tags, divRating, iconRating, spanWhitelisted, spanBlacklisted;

	// We don't filter our own posts
	if (post.className.indexOf('not_mine') === -1) {
		return;
	}

	if (post.className.indexOf('post_micro') !== -1) {
		return;
	}

	if (manuallyShown[post.id]) {
		return;
	}

	if (settings.disable_on_inbox && window.location.pathname.indexOf('/inbox') !== -1) {
		return;
	}

	removeRedirects(post);

	bln = post.getElementsByClassName('blacklisted');
	wln = post.getElementsByClassName('whitelisted');
	liRemove = document.getElementById('notification_' + post.id);

	if (liRemove) {
		liRemove.parentNode.removeChild(liRemove);
	}

	if (bln.length) {
		for (n = 0; n < bln.length; n++) {
			if (bln[n].parentNode) {
				bln[n].parentNode.removeChild(bln[n]);
			}
		}
	}

	if (wln.length) {
		for (n = 0; n < wln.length; n++) {
			if (wln[n].parentNode) {
				wln[n].parentNode.removeChild(wln[n]);
			}
		}
	}

	var postText = '';
	var postHeader = post.querySelector('.post_header');
	var postContent = post.querySelector('.post_content');
	var postTags = post.querySelector('.post_tags');

	if (!settings.ignore_header) {
		if (!postHeader) {
			return setTimeout(function () { checkPost(post); }, 0);
		}
		postText += postHeader.innerHTML.replace(noTags, ' ');
	}

	if (!settings.ignore_body) {
		if (!postContent) {
			return setTimeout(function () { checkPost(post); }, 0);
		}
		postText += postContent.innerHTML;
	}

	if (postTags && !settings.ignore_tags) {
		if (!postTags) {
			return setTimeout(function () { checkPost(post); }, 0);
		}
		postText += postTags.innerHTML.replace(noTags, ' ');
	}

	savedfrom = needstobesaved(postText);

	if (savedfrom.bL.length && savedfrom.wL.length === 0) {
		if (settings.show_notice) {
			author = getAuthor(post);

			li_notice = document.createElement('li');
			li_notice.id = 'notification_' + post.id;
			li_notice.className = 'notification single_notification tumblr_savior';

			div_inner = document.createElement('DIV');
			div_inner.className = 'notification_inner clearfix';

			div_sentence = document.createElement('DIV');
			div_sentence.className = 'notification_sentence';

			div_inner.appendChild(div_sentence);
			li_notice.appendChild(div_inner);

			a_avatar = document.createElement('a');
			a_avatar.href = 'http://' + author.name + '.tumblr.com/';
			a_avatar.className = 'avatar_frame';
			a_avatar.title = author.name;

			img_avatar = document.createElement('img');
			img_avatar.src = author.avatar;
			img_avatar.className = 'avatar';
			img_avatar.title = author.name;

			a_author = document.createElement('a');
			a_author.href = 'http://' + author.name + '.tumblr.com/';
			a_author.className = 'username';
			a_author.textContent = author.name;

			a_avatar.appendChild(img_avatar);

			li_notice.appendChild(a_avatar);
			div_sentence.appendChild(a_author);

			txtPosted = document.createTextNode(' made a post containing');
			div_sentence.appendChild(txtPosted);

			if (settings.show_words) {

				txtContents = ':';

				for (j = 0; j < savedfrom.bL.length; j++) {
					if (savedfrom.bL.length > 2 && j !== 0 && j < savedfrom.bL.length - 1) {
						txtContents += ',';
					}
					if (savedfrom.bL.length > 1 && j === savedfrom.bL.length - 1) {
						txtContents += ' and';
					}
					txtContents += ' \'' + savedfrom.bL[j] + '\'';
				}

				div_sentence.appendChild(document.createTextNode(txtContents));
			} else {
				div_sentence.appendChild(document.createTextNode(' something from your blacklist.'));
			}

			a_reveal = document.createElement('a');
			a_reveal.href = '#';

			i_reveal = document.createElement('i');
			i_reveal.appendChild(document.createTextNode(' -- click to show.'));

			li_notice.addEventListener('click', handleReveal, false);

			a_reveal.appendChild(i_reveal);

			div_sentence.appendChild(a_reveal);

			if (settings.show_tags) {

				span_tags = post.getElementsByClassName('post_tags');

				if (span_tags.length) {
					div_sentence.appendChild(document.createElement('br'));
					div_sentence.appendChild(document.createElement('br'));

					span_notice_tags = document.createElement('span');
					span_notice_tags.appendChild(document.createTextNode('Tags: '));
					span_notice_tags.appendChild(document.createTextNode(span_tags[0].textContent.replace(/#/g, ' #')));

					div_sentence.appendChild(span_notice_tags);
				}
			}
			if (post.nextSibling) {
				post.parentNode.insertBefore(li_notice, post.nextSibling);
			} else {
				post.parentNode.appendChild(li_notice);
			}
		}

		post.style.display = 'none';

	} else if (post.style.display === 'none' && post.className.indexOf('tumblr_hate') < 0) {
		post.style.display = 'list-item';
		if (settings.show_notice) {
			liRemove = document.getElementById('notification_' + post.id);
			if (liRemove) {
				post.parentNode.removeChild(liRemove);
			}
		}
	}

	divRating = document.getElementById('whitelisted_post_' + post.id);

	if (divRating) {
		divRating.parentNode.removeChild(divRating);
	}

	if (savedfrom.wL.length > 0 && settings.white_notice) {
		whiteListed[post.id] = [];

		while (savedfrom.wL.length > 0) {
			whiteListed[post.id].push(savedfrom.wL.pop());
		}

		divRating = document.createElement('div');
		divRating.id = 'whitelisted_post_' + post.id;
		divRating.className = 'savior_rating whitelisted';

		iconRating = document.createElement('i');
		iconRating.className = 'icon_checkmark';

		divRating.appendChild(iconRating);

		spanWhitelisted = document.createElement('span');
		spanWhitelisted.textContent = whiteListed[post.id].join(', ');

		divRating.appendChild(spanWhitelisted);
		post.insertBefore(divRating, post.firstChild);
	}

	divRating = document.getElementById('blacklisted_post_' + post.id);

	if (divRating) {
		divRating.parentNode.removeChild(divRating);
	}

	if (savedfrom.bL.length > 0 && settings.black_notice) {
		blackListed[post.id] = [];

		while (savedfrom.bL.length > 0) {
			blackListed[post.id].push(savedfrom.bL.pop());
		}

		divRating = document.createElement('div');
		divRating.id = 'blacklisted_post_' + post.id;
		divRating.className = 'savior_rating blacklisted';

		iconRating = document.createElement('i');
		iconRating.className = 'icon_remove';

		divRating.appendChild(iconRating);

		spanBlacklisted = document.createElement('span');
		spanBlacklisted.textContent = blackListed[post.id].join(', ');

		divRating.appendChild(spanBlacklisted);
		post.insertBefore(divRating, post.firstChild);
	}
}

function detectBrowser() {
	// Since Opera is just another version of chrome, we check the userAgent.
	if (window && window.navigator.userAgent.indexOf('OPR') !== -1) {
		return 'Opera';
	}
	if (window && window.navigator.userAgent.indexOf('Firefox') !== -1) {
		return 'Firefox';
	}
	if (window && window.chrome) {
		return 'Chrome';
	}
	if (window && window.safari) {
		return 'Safari';
	}

	console.error('Tumblr Savior could not detect your browser.');
	return 'Undetected Browser';
}

var browser = detectBrowser();

function handlePostInserted(argPost) {
	var post = argPost.target;

	// If there's no post id, we don't need to scan the contents.
	var postId = post.getAttribute('data-post-id');

	if (!postId || inProgress[postId]) {
		return;
	}

	if (!gotSettings) {
		inProgress[postId] = post;
		return;
	}

	checkPost(post);
}

function wireupnodes() {
	var cssRules = [];

	document.addEventListener('animationstart', handlePostInserted, false);
	document.addEventListener('webkitAnimationStart', handlePostInserted, false);

	cssRules.push(
		'@keyframes nodeInserted {' +
		'    from { clip: rect(1px, auto, auto, auto); }' +
		'    to { clip: rect(0px, auto, auto, auto); }' +
		'}'
	);

	cssRules.push(
		'@-moz-keyframes nodeInserted {' +
		'    from { clip: rect(1px, auto, auto, auto); }' +
		'    to { clip: rect(0px, auto, auto, auto); }' +
		'}'
	);

	cssRules.push(
		'@-webkit-keyframes nodeInserted {' +
		'    from { clip: rect(1px, auto, auto, auto); }' +
		'    to { clip: rect(0px, auto, auto, auto); }' +
		'}'
	);

	cssRules.push(
		'li.post_container div.post, li.post, ol.posts li, article.post {' +
		'    animation-duration: 1ms;' +
		'    -moz-animation-duration: 1ms;' +
		'    -webkit-animation-duration: 1ms;' +
		'    animation-name: nodeInserted;' +
		'    -moz-animation-name: nodeInserted;' +
		'    -webkit-animation-name: nodeInserted;' +
		'}'
	);

	addGlobalStyle('wires', cssRules);
}

function checkPosts() {
	for (var postId in inProgress) {
		var post = inProgress[postId];
		checkPost(post);
		delete inProgress[postId];
	}
}

function diaper() {
	var posts = document.getElementsByClassName('post');

	for (var i = 0; i < posts.length; i += 1) {
		var post = posts[i];
		var postId = post.getAttribute('data-post-id');

		if (postId) {
			inProgress[postId] = post;
		}
	}

	checkPosts();
}

function waitForPosts() {
	var posts = document.getElementsByClassName('post');
	gotSettings = true;

	if (!posts.length && !isTumblrSaviorRunning) {
		setTimeout(waitForPosts, 0);
	} else if (!isTumblrSaviorRunning) {
		wireupnodes();
		isTumblrSaviorRunning = true;
		setTimeout(diaper, 0);
	} else {
		diaper();
	}
}


function safariMessageHandler(event) {
	if (event.name === 'refreshSettings') {
		safari.self.tab.dispatchMessage('getSettings');
		return;
	}

	parseSettings(event.message);
	applySettings();
	waitForPosts();
}

function safariContextMenuHandler(event) {
	var sel;

	sel = window.parent.getSelection().toString();
	sel = sel.replace(/[\r\n]/g, ' ');
	sel = sel.replace(/^\s+|\s+$/g, '');

	if (sel.length > 0) {
		safari.self.tab.setContextMenuEventUserInfo(event, sel);
	}
}

function chromeHandleMessage(event) {
	if (!event) {
		return console.error('There seems to be something wrong with Tumblr Savior.');
	}
	parseSettings(event.data);

	applySettings();
	waitForPosts();
}

function initializeTumblrSavior(browser) {
	switch (browser) {
	case 'Chrome':
	case 'Firefox':
	case 'Opera':
		chrome.runtime.onMessage.addListener(
			function (request) {
				if (request === 'refreshSettings') {
					chrome.runtime.sendMessage(null, 'getSettings', null, chromeHandleMessage);
				}
			}
		);
		chrome.runtime.sendMessage(null, 'getSettings', null, chromeHandleMessage);
		break;
	case 'Safari':
		window.addEventListener('contextmenu', safariContextMenuHandler, false);
		safari.self.addEventListener('message', safariMessageHandler, false);
		safari.self.tab.dispatchMessage('getSettings');
		break;
	default:
		console.error('I\'m sorry, but Tumblr Savior could not detect which browser you are using.');
	}
}

function checkurl(url, filter) {
	var filterRegex, re, f;

	for (f = 0; f < filter.length; f+= 1) {
		filterRegex = filter[f].replace(/\x2a/g, '(.*?)');
		re = new RegExp(filterRegex);
		if (re.test(url)) {
			return true;
		}
	}
	return false;
}

if (!checkurl(window.location.href, invalidTumblrURLs)) {
	initializeTumblrSavior(browser);
}
