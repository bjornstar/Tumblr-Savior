// ==UserScript==
// @include        http://*.tumblr.com/*
// @exclude        http://assets.tumblr.com/*
// @exclude        http://www.tumblr.com/messages
// ==/UserScript==

var defaultSettings = { 'version': '0.3.4', 'listBlack': ['iphone', 'ipad'], 'listWhite': ['bjorn', 'octopus'], 'hide_source': true, 'show_notice': true, 'show_words': true, 'no_pagetracker': false, 'match_words': false, 'promoted_tags': false, 'context_menu': true, 'toolbar_butt': true }; //initialize default values.
var settings;

function needstobesaved(theStr){
  var blackList = settings['listBlack'];
  var whiteList = settings['listWhite'];
  var blacklisted = [];
  
  theStr = theStr.toLowerCase();
  
  for(var i=0;i<whiteList.length;i++) {
    if(theStr.indexOf(whiteList[i].toLowerCase())>=0) {
      return blacklisted;
    }
  }

  if (settings['match_words']) {
    for(var i=0;i<blackList.length;i++) {
      var filterRegex;
      filterRegex='(^|\\W)('+blackList[i].toLowerCase().replace(/\x2a/g, "(\\w*?)")+')(\\W|$)';
      var re = new RegExp(filterRegex);
      if (theStr.match(re)) {
        if (settings['show_words']) {
          blacklisted.push(blackList[i]);
        } else {
          return blackList[i];
        }
      }
    }
  } else {
    for(var i=0;i<blackList.length;i++) {
      if(theStr.indexOf(blackList[i].toLowerCase())>=0) {
        if (settings['show_words']) {
          blacklisted.push(blackList[i]);
        } else {
          return blackList[i];
        }
      }
    }
  }

  return blacklisted;
}

function addGlobalStyle(css) {
  var elmHead, elmStyle;
  elmHead = document.getElementsByTagName('head')[0];
  elmStyle = document.createElement('style');
  elmStyle.type = 'text/css';
  elmStyle.innerHTML = css;
  elmHead.appendChild(elmStyle);
}

function hide_source() {
  var better_rule = '.source_url {display:none!important;}';
  addGlobalStyle(better_rule);
}

function safariMessageHandler(event) {
  if (event.name == "refreshSettings") {
    safari.self.tab.dispatchMessage("getSettings");
    return;
  }
  savedSettings = event.message.data;
  settings = parseSettings(savedSettings);
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
  savedSettings = event.data;
  settings = parseSettings(savedSettings);
  WaitForPosts();
}

function operaHandleMessage(event) {
  if (event.data == "refreshSettings") {
    opera.extension.postMessage("getSettings");
    return;
  }
  savedSettings = event.data;
  settings = parseSettings(savedSettings);
  WaitForPosts();
}

function hide_follower_count() {
  var anchors = document.getElementsByTagName('a');
  for (var anchor in anchors) {
    if (anchors[anchor] && anchors[anchor].href=='http://www.tumblr.com/followers') {
      var liFollowerCount = anchors[anchor].parentNode;
      if (settings['follower_count']) {
        liFollowerCount.style.display='none';
      } else {
        liFollowerCount.style.display='list-item';
      }
      return;
    }
  }
}

function WaitForPosts() {
  var olPosts = document.getElementById('posts');
  if (olPosts === null) {
    setTimeout(WaitForPosts, 10);
    return;
  }
  var liPosts = olPosts.children;
	for(var liPost in liPosts){
		checkPost(liPosts[liPost]);
	}
  olPosts.addEventListener("DOMNodeInserted", checkPost, false);
  hide_follower_count();
}

function parseSettings(savedSettings) {
  var parsedSettings;
  if (savedSettings == undefined) {
    parsedSettings = defaultSettings;
  } else {
    parsedSettings = JSON.parse(savedSettings);
  }
  if (parsedSettings['hide_source']=='true'||parsedSettings['hide_source']==true) {
    hide_source();
  }
  if (parsedSettings['show_notice']=='true'){
    parsedSettings['show_notice'] = true;
  }
  if (parsedSettings['no_pagetracker']=='true') {
    parsedSettings['no_pagetracker'] = true;
  }
  if (parsedSettings['show_words']=='true') {
    parsedSettings['show_words'] = true;
  }
  return parsedSettings;
}

function initializeTumblrSavior() {
  if (typeof chrome != 'undefined') {
    chrome.extension.sendRequest('getSettings', chromeHandleMessage);
    chrome.extension.onRequest.addListener(
      function(request, sender, sendResponse) {
        if (request=="refreshSettings") {
          chrome.extension.sendRequest('getSettings', chromeHandleMessage);
        }
      });
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

function checkPost(liPost) {
  if (typeof liPost == 'object') {
    if (liPost.target) liPost = liPost.target;
    if (liPost.id && liPost.id.substring(0,4)=='post' && liPost.className.indexOf('not_mine') >= 0) {
      var savedfrom = needstobesaved(liPost.innerHTML);
      var olPosts = document.getElementById('posts');
      if (savedfrom.length) {
        if (settings['show_notice']) {
          var author = getAuthor(liPost);

          var liRemove = document.getElementById('notification_'+liPost.id);
          if(liRemove) {
            olPosts.removeChild(liRemove);
          }

          var li_notice = document.createElement('li');
          li_notice.id = 'notification_'+liPost.id;
          li_notice.className = 'notification single_notification';
          li_notice.innerHTML = '<a href="http://'+author['name']+'.tumblr.com/" style="border-width:0px;"><img alt class="avatar" src="'+author['avatar']+'" /></a><b><a href="http://'+author['name']+'.tumblr.com/">'+author['name']+'</a> posted something';
          
          if (settings['show_words']) {
            li_notice.innerHTML += ' with';
            for (var j=0;j<savedfrom.length;j++) {
              if (savedfrom.length>2&&j!=0&&j<savedfrom.length-1){
                li_notice.innerHTML += ',';
              }
              if (savedfrom.length>1&&j==savedfrom.length-1) {
                li_notice.innerHTML += ' and';
              }
              li_notice.innerHTML += ' \''+savedfrom[j]+'\'';
            }
            li_notice.innerHTML += ' in it';
          } else {
            li_notice.innerHTML += ' you probably didn\'t want to see';
          }
          li_notice.innerHTML += '.</b><br /><a onclick="this.parentNode.previousSibling.style.display=\'list-item\'; this.parentNode.style.display=\'none\'; return false;" href="#"><i>If you cannot resist the temptation, click here...</i></a>';

          if(liPost.nextSibling) {
            olPosts.insertBefore(li_notice, liPost.nextSibling);
          } else {
            olPosts.appendChild(li_notice);
          }
        }
        liPost.style.display = 'none';
      } else {
        if (liPost.style.display=='none') {
          liPost.style.display = 'list-item';
          if (settings['show_notice']) {
            var liRemove = document.getElementById('notification_'+liPost.id);
            if(liRemove) {
              olPosts.removeChild(liRemove);
            }
          }
        }
      }
    }
    if (liPost.id) {
      checkAnchors(liPost);
    }
  }
}

function checkAnchors(liPost) {
  console.log(liPost);
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
}

function getAuthor(liPost) {
  var author = [];
	while(liPost.tagName != "LI" || liPost.getElementsByClassName("post_info").length == 0) {
		liPost = liPost.previousSibling;
	}
	author['name'] = liPost.getElementsByClassName("post_info").item(0).getElementsByTagName("A").item(0).innerHTML;
	var avatar = document.getElementById(liPost.id.replace('_','_avatar_'));
	author['avatar'] = avatar.getAttribute("style").replace('background-image:url(\'','').replace('_64','_16').replace('\')','');
	return author;
}

initializeTumblrSavior();