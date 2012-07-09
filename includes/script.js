// ==UserScript==
// @include        http://www.tumblr.com/*
// @exclude        http://www.tumblr.com/tumblelog/*
// ==/UserScript==

var defaultSettings = {
  'version': '0.3.18',
  'listBlack': ['iphone', 'ipad'],
  'listWhite': ['bjorn', 'octopus'],
  'hide_source': true,
  'show_notice': true,
  'show_words': true,
  'no_pagetracker': false,
  'match_words': false,
  'promoted_tags': false,
  'promoted_posts': false,
  'context_menu': true,
  'toolbar_butt': true,
  'white_notice': false,
  'black_notice': false,
  'hide_pinned': false,
  'auto_unpin': true
}; //initialize default values.

var settings = new Object();
var liBuffer = [];
var divBuffer = [];
var isTumblrSaviorRunning = false;
var inProgress = new Object();
var icon = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAnNJREFUeNqMU09M02AU/8awC5vJsu2g4ExwkDgJQzfCEsWEgQxI1CVLvHDadYNE9IAm84KJ3EBPBjGe0ETw6AXmwRBPXhjTkjCTicvC+FPKZC1tt7brs1/JcIMY92val+977/3e7/v6HgIAVAtMJpPR4XA463Q6XeV+/f8SbTbbWY/bfT0QCAQpitI/m5wMV/p1WEElqcFgQFc7Ojq9Xm+Pt6vL53K5blxqbraZrVb0ZXk529Pbaz+loLHx/LmhwaHbnk5Pj/ua+2ZrS4vDpiYoiqKRK6AgmqJQU1OTiSCIelEU5WMGrODR+HhUtcCzLGxns3CYz4PAccCp63dzc/Di+TTs03s4BG719Q1UKqjDH5qmD7Cl9igE6rMUi6GJpxPoTuAu+pVOI5Ik0T5NawmRcHi06pKwgra2K66SLIEsiZBYjcOTaBRez87i3wNrJKlVpnZ3oAy73X6xigDjW2I1hZ07W1vAq/IxfD4fDA8Pw0m8mpl5c4pgdGTk/snAT7EYGI1GyGQy2rpQLGpWkiSwWiyWKgK9Xt/AsuwhDiiVSsckOMTv90OhUABeEIA5CoEHY2MPjy8R56tJwvTU1Eu8KBZFbTOZTKJgMIi6u7sRw7JIEiXE87zm6x8YvKcW1ZcVELipzGZzq8ALJVmW4fdBHtbXkyAIBa2irIqSlb/HI8m1PbW9G8qtLGEV+Xw+tfBh4XMoFOo/QxDI6bx8dEz1XY2vbDMMQ8Xj8ZVEIv41lfr5g+M4oUyAY7Tu+q4CK0xvbDCbm5sbuVxua37+/dulxcWPoiTxp4bl5DS2t7d3RcKRx1ar5UItU6qrdZz/hT8CDADaR5pMovP3DQAAAABJRU5ErkJggg==";

function needstobesaved(theStr){
  var blackList = settings['listBlack'];
  var whiteList = settings['listWhite'];
  var rO = new Object(); //returnObject
  
  rO.bL = []; //returnObject.blackListed
  rO.wL = []; //returnObject.whiteListed

  theStr = theStr.toLowerCase();

  if (settings['match_words']) {
    for(var i=0;i<whiteList.length;i++) {
      var filterRegex;
      filterRegex='(^|\\W)('+whiteList[i].toLowerCase().replace(/\x2a/g, "(\\w*?)")+')(\\W|$)';
      var re = new RegExp(filterRegex);
      if (theStr.match(re)) {
        rO.wL.push(whiteList[i]);
      }
    }
  } else {
    for(var i=0;i<whiteList.length;i++) {
      if(theStr.indexOf(whiteList[i].toLowerCase())>=0) {
        rO.wL.push(whiteList[i]);
      }
    }
  }

  if (settings['match_words']) {
    for(var i=0;i<blackList.length;i++) {
      var filterRegex = '(^|\\W)('+blackList[i].toLowerCase().replace(/\x2a/g, "(\\w*?)")+')(\\W|$)';
      var re = new RegExp(filterRegex);
      if (theStr.match(re)) {
        rO.bL.push(blackList[i]);
      }
    }
  } else {
    for(var i=0;i<blackList.length;i++) {
      if(theStr.indexOf(blackList[i].toLowerCase())>=0) {
        rO.bL.push(blackList[i]);
      }
    }
  }

  return rO;
}

function addGlobalStyle(styleID, css) {
  var cStyle = document.getElementById(styleID);
  if (cStyle == undefined) {
    var elmHead, elmStyle;
    elmHead = document.getElementsByTagName('head')[0];
    elmStyle = document.createElement('style');
    elmStyle.type = 'text/css';
    elmStyle.innerHTML = css;
    elmStyle.id = styleID;
    elmHead.appendChild(elmStyle);
  } else {
    cStyle.innerHTML = css;
  }
}

function show_white_notice() {
  var cssRatings = ".whitelisted {";
  cssRatings += "background: #57b787;";
  if (settings['black_notice']) {
    cssRatings += "top: 50px;";
  } else {
    cssRatings += "top: 20px;";
  }
  cssRatings += "}";
  addGlobalStyle("white_notice_style",cssRatings);
}

function show_black_notice() { 
  var cssRatings = ".blacklisted {";
  cssRatings += "background: #d93023;";
  cssRatings += "top: 20px;";
  cssRatings += "}";
  addGlobalStyle("black_notice_style",cssRatings);
}

function hide_white_notice() {
  var cssRatings = ".whitelisted {";
  cssRatings += "display: none;";
  cssRatings += "}";
  addGlobalStyle("white_notice_style", cssRatings);
}

function hide_black_notice() {
  var cssRatings = ".blacklisted {";
  cssRatings += "display: none;";
  cssRatings += "}";
  addGlobalStyle("black_notice_style", cssRatings);
}

function hide_pinned() {
  var cssPinned = ".promotion_pinned {";
  cssPinned += "display: none;";
  cssPinned += "}";
  addGlobalStyle("pinned_style", cssPinned);
}

function show_pinned() {
  addGlobalStyle("pinned_style", "");
}

function unpin(thepost) {
  var clickUnpin = document.createEvent("MouseEvents");
  clickUnpin.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
  var pins = thepost.getElementsByClassName("pin");
  var pin = pins[0];
  pin.dispatchEvent(clickUnpin);
}

function hide_ratings() {
  var cssRatings = ".savior_rating {";
  cssRatings += "display: none;";
  cssRatings += "}";
  addGlobalStyle("savior_rating_style",cssRatings);
}

function show_ratings() {
  var cssRatings = ".savior_rating {";
  cssRatings += "position: absolute;";
  cssRatings += "left: 532px;";
  cssRatings += "width: 20px;";
  cssRatings += "height: 20px;";
  cssRatings += "-webkit-border-radius: 4px;";
  cssRatings += "-webkit-box-shadow: 0 1px 5px rgba(0, 0, 0, .46);";
  cssRatings += "border-radius: 4px;";
  cssRatings += "}";
  cssRatings += ".savior_rating:hover {";
  cssRatings += "overflow: hidden;";
  cssRatings += "white-space: nowrap;";
  cssRatings += "width: 200px;";
  cssRatings += "}";
  cssRatings += ".savior_rating:hover span{";
  cssRatings += "display: inline;";
  cssRatings += "}";
  cssRatings += ".savior_rating img {";
  cssRatings += "margin: 2px 0px 0px 2px;";
  cssRatings += "}";
  cssRatings += ".savior_rating span{";
  cssRatings += "display: none;";
  cssRatings += "line-height:20px;";
  cssRatings += "margin-left:2px;";
  cssRatings += "vertical-align: top;";
  cssRatings += "}";
  addGlobalStyle("savior_rating_style",cssRatings);
}

function hide_source() {
  var better_rule = '.source_url {display:none!important;}';
  addGlobalStyle("source_url_style",better_rule);
}

function show_source() {
  addGlobalStyle("source_url_style",'');
}

function safariMessageHandler(event) {
  if (event.name == "refreshSettings") {
    safari.self.tab.dispatchMessage("getSettings");
    return;
  }
  var savedSettings = event.message.data;
  settings = parseSettings(savedSettings);
  applySettings();
  WaitForPosts();
}

function safariContextMenuHandler(event) {
  var sel = window.parent.getSelection()+'';
	sel = sel.replace(/[\r\n]/g," ");
	sel = sel.replace(/^\s+|\s+$/g,"");
  if (sel.length >0) {
    safari.self.tab.setContextMenuEventUserInfo(event, sel);
  }
}

function chromeHandleMessage(event) {
  var savedSettings = event.data;
  settings = parseSettings(savedSettings);
  applySettings();
  WaitForPosts();
}

function operaHandleMessage(event) {
  if (event.data == "refreshSettings") {
    opera.extension.postMessage("getSettings");
    return;
  }
  if (event.data.topic == "settings") {
    var savedSettings = event.data.data;
    settings = parseSettings(savedSettings);
  }
  applySettings();
  WaitForPosts();
}

function WaitForPosts() {
  var olPosts = document.getElementById('posts');
  if (olPosts === null && !isTumblrSaviorRunning) {
    setTimeout(WaitForPosts, 10);
  } else if (!isTumblrSaviorRunning) {
    olPosts.addEventListener("DOMNodeInserted", handlePostInserted, false);
    isTumblrSaviorRunning = true;
    setTimeout(Diaper, 200);
  } else {
    Diaper();
  }
}

function Diaper() {
  var olPosts = document.getElementById('posts');
  var liPosts = olPosts.children;
  for(var fff=0;fff<liPosts.length;fff++){
    var liPost = liPosts[fff];
    if (liPost.id == undefined) {
      continue;
    }
    if (liPost.id.indexOf("post")==0) {
      inProgress[liPost.id] = new Object();
    }
  }
  reconcileBuffer();
}

function handlePostInserted(liPost) {
  var liPost = liPost.target;
  if (liPost.id==undefined) {
    return;
  }
  if (inProgress[liPost.id] != undefined) {
    return;
  }
  if(liPost.id.indexOf("post")==0) {
    inProgress[liPost.id] = new Object();
  }
}

function checkPosts() {
  for (liPost in inProgress) {
    checkPost(document.getElementById(liPost));
    delete inProgress[liPost]
  }
  reconcileBuffer();
  while (promoted.length) {
    var remove = promoted.pop();
    document.getElementById(remove).className = document.getElementById(remove).className.replace(/promotion_highlighted/gm, "");
    var ribbon_right = document.getElementById("highlight_ribbon_right_"+remove.replace("post_",""));
    var ribbon_left = document.getElementById("highlight_ribbon_left_"+remove.replace("post_",""));
    ribbon_right.parentNode.removeChild(ribbon_right);
    ribbon_left.parentNode.removeChild(ribbon_left);
  }
}

function reconcileBuffer() {
  while (liBuffer.length > 0) {
    var liNotice = liBuffer.pop();
    var liPost = document.getElementById(liNotice.id.replace('notification_',''));
    var olPosts = document.getElementById('posts');
    if(liPost.nextSibling) {
      olPosts.insertBefore(liNotice, liPost.nextSibling);
    } else {
      olPosts.appendChild(liNotice);
    }
  }
  if (!settings['white_notice'] && !settings['black_notice']) {
    divBuffer = [];
  }
  while (divBuffer.length > 0) {
    var divRating = divBuffer.pop();
    var liPost = document.getElementById('post_'+divRating.id.substring(divRating.id.lastIndexOf('_')+1));
    liPost.appendChild(divRating);
  }
}

function parseSettings(savedSettings) {
  var parsedSettings = new Object();
  if (savedSettings == undefined || savedSettings == null) {
    parsedSettings = defaultSettings;
  } else {
    parsedSettings = JSON.parse(savedSettings);
  }
  return parsedSettings;
}

function applySettings() {
  if (settings['hide_source']) {
    hide_source();
  } else {
    show_source();
  }
  if (settings['white_notice'] || settings['black_notice']) {
    show_ratings();
  } else {
    hide_ratings();
  }
  if (settings['black_notice']) {
    show_black_notice();
  } else {
    hide_black_notice();
  }
  if (settings['white_notice']) {
    show_white_notice();
  } else {
    hide_white_notice();
  }
  if (settings['hide_pinned']) {
    hide_pinned();
  } else {
    show_pinned();
  }
}

function initializeTumblrSavior() {
  if (typeof chrome != 'undefined') {
    if (typeof chrome.extension.onMessage != "undefined") {
      chrome.extension.onMessage.addListener(
        function(request, sender, sendResponse) {
          if (request=="refreshSettings") {
            chrome.extension.sendMessage(null, 'getSettings', chromeHandleMessage);
          }
        });
      chrome.extension.sendMessage(null, 'getSettings', chromeHandleMessage);
    } else if (typeof chrome.extension.onRequest != "undefined") {
      chrome.extension.onRequest.addListener(
        function(request, sender, sendResponse) {
          if (request=="refreshSettings") {
            chrome.extension.sendRequest('getSettings', chromeHandleMessage);
          }
        });
      chrome.extension.sendRequest('getSettings', chromeHandleMessage);
    }
  }
  if (typeof opera != 'undefined') {
    opera.extension.onmessage = operaHandleMessage;
    opera.extension.postMessage('getSettings');
  }
  if (typeof safari != 'undefined') {
    window.addEventListener("contextmenu", safariContextMenuHandler, false);
    safari.self.addEventListener('message', safariMessageHandler, false);
    safari.self.tab.dispatchMessage('getSettings');
  }
}

var whiteListed = new Object();
var blackListed = new Object();
var promoted = new Array();

var checkPostInterval = setInterval(checkPosts, 500);

function checkPost(liPost) {
  if (typeof liPost != 'object') {
    return;
  }
  if (liPost.target) liPost = liPost.target;
  if (liPost.id == undefined) {
    return;
  }
  if (liPost.tagName!="LI") {
    return;
  }
  if (liPost.id.substring(0,4)!='post') {
    return;
  }
  if (liPost.className.indexOf('not_mine') < 0) {
    return;
  }
  if (settings['auto_unpin'] && liPost.className.indexOf('promotion_pinned') >=0) {
    unpin(liPost);
  }
  
  var savedfrom = needstobesaved(liPost.innerHTML);
  var olPosts = document.getElementById('posts');

  if (savedfrom.bL.length && savedfrom.wL.length == 0) {
    if (settings['show_notice']) {
      var author = getAuthor(liPost);

      var liRemove = document.getElementById('notification_'+liPost.id);
      if(liRemove) {
        olPosts.removeChild(liRemove);
      }

      var li_notice = document.createElement('li');
      li_notice.id = 'notification_'+liPost.id;
      li_notice.className = 'notification first_notification last_notification tumblr_savior';
      li_notice.innerHTML = '<a href="http://'+author['name']+'.tumblr.com/" class="avatar_frame"><img alt class="avatar" src="'+author['avatar']+'" /></a>';
      li_notice.innerHTML += '<div class="nipple border"></div>';
      li_notice.innerHTML += '<div class="nipple"></div>';
      li_notice.innerHTML += '<b><a href="http://'+author['name']+'.tumblr.com/">'+author['name']+'</a> posted something';
      
      if (settings['show_words']) {
        li_notice.innerHTML += ' with';
        for (var j=0;j<savedfrom.bL.length;j++) {
          if (savedfrom.bL.length>2&&j!=0&&j<savedfrom.bL.length-1){
            li_notice.innerHTML += ',';
          }
          if (savedfrom.bL.length>1&&j==savedfrom.bL.length-1) {
            li_notice.innerHTML += ' and';
          }
          li_notice.innerHTML += ' \''+savedfrom.bL[j]+'\'';
        }
        li_notice.innerHTML += ' in it';
      } else {
        li_notice.innerHTML += ' you probably didn\'t want to see';
      }
      li_notice.innerHTML += '.</b><br /><a onclick="this.parentNode.previousSibling.style.display=\'list-item\'; this.parentNode.style.display=\'none\'; return false;" href="#"><i>If you cannot resist the temptation, click here...</i></a>';

      liBuffer.push(li_notice); // We put it into a buffer so that we don't mess up the state of the posts as it's being iterated through. Gotta make sure we reconcile this after we're done.
    }
    liPost.style.display = 'none';
  } else {
    if (liPost.style.display=='none' && liPost.className.indexOf('tumblr_hate')<0) {
      liPost.style.display = 'list-item';
      if (settings['show_notice']) {
        var liRemove = document.getElementById('notification_'+liPost.id);
        if(liRemove) {
          olPosts.removeChild(liRemove);
        }
      }
    }
  }

  var divRating = document.getElementById('white_rating_'+liPost.id);
  if (divRating != null) {
    liPost.removeChild(divRating);
  }

  if (savedfrom.wL.length > 0 && settings['white_notice']) {
    whiteListed[liPost.id] = new Array();
    while (savedfrom.wL.length > 0) {
      whiteListed[liPost.id].push(savedfrom.wL.pop());
    }
    var divRating = document.createElement('div');
    divRating.id = 'white_rating_'+liPost.id;
    divRating.className = 'savior_rating whitelisted';
    divRating.innerHTML = '<img src="data:image/png;base64,'+icon+'" title="'+whiteListed[liPost.id].join(", ")+'" /><span>'+whiteListed[liPost.id].join(', ')+'</span>';
    divBuffer.push(divRating);
  }

  var divRating = document.getElementById('black_rating_'+liPost.id);
  if (divRating != null) {
    divRating.parentNode.removeChild(divRating);
  }

  if (savedfrom.bL.length > 0 && settings['black_notice']) {
    blackListed[liPost.id] = new Array();
    while (savedfrom.bL.length > 0 ) {
      blackListed[liPost.id].push(savedfrom.bL.pop());
    }
    var divRating = document.createElement('div');
    divRating.id = 'black_rating_'+liPost.id;
    divRating.className = 'savior_rating blacklisted';
    divRating.innerHTML = '<img src="data:image/png;base64,'+icon+'" title="'+blackListed[liPost.id].join(", ")+'" /><span>'+blackListed[liPost.id].join(', ')+'</span>';
    divBuffer.push(divRating);
  }

  var anchors = liPost.getElementsByTagName('a');
  if (settings['no_pagetracker']){
    for (var anchor in anchors) {
      if (anchors[anchor].outerHTML && anchors[anchor].outerHTML.indexOf('pageTracker')>=0) {
        anchors[anchor].outerHTML=anchors[anchor].outerHTML.replace(/pageTracker\._trackEvent\(.*\);/gm, " ");
      }
    }
  }

  if (settings['promoted_tags']) {
    for (var anchor in anchors) {
      if (anchors[anchor].outerHTML && anchors[anchor].outerHTML.indexOf('blingy blue')>=0) {
        anchors[anchor].outerHTML=anchors[anchor].outerHTML.replace(/blingy blue/gm, " ");
      }
    }
  }
  if (settings['promoted_posts']) {
    if (liPost.outerHTML.indexOf("promotion_highlighted")>=0) {
      promoted.push(liPost.id);
    }
  }
}

function getAuthor(liPost) {
  var author = [];
	while(liPost.tagName != "LI" || liPost.getElementsByClassName("post_info").length == 0) {
		liPost = liPost.previousSibling;
	}
	author['name'] = liPost.getElementsByClassName("post_info").item(0).getElementsByTagName("A").item(0).innerHTML;
	var avatar = document.getElementById(liPost.id.replace('_','_avatar_'));
	if (avatar != null) {
    author['avatar'] = avatar.getAttribute("style").replace('background-image:url(\'','').replace('_64.','_40.').replace('\')','');
  }
	return author;
}

function checkurl(url, filter) {
  for (var f in filter) {
    var filterRegex;
    filterRegex=filter[f].replace(/\x2a/g, "(.*?)");
    var re = new RegExp(filterRegex);
    if (url.match(re)) {
      return true;
    }
  }
  return false;
}

if (!checkurl(window.location.href, ['http://www.tumblr.com/upload/*'])){
  initializeTumblrSavior();
}