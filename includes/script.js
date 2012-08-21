// ==UserScript==
// @include        http://www.tumblr.com/*
// @exclude        http://www.tumblr.com/blog/*
// @exclude        http://www.tumblr.com/upload/*
// @exclude        http://www.tumblr.com/inbox/*
// @exclude        http://www.tumblr.com/inbox
// ==/UserScript==

var defaultSettings = {
  'version': '0.4.3',
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
  'auto_unpin': true,
  'show_tags': false,
  'hide_premium': true
}; //initialize default values.

var settings = new Object();
var gotSettings = false;
var manuallyShown = new Object();
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
      filterRegex='(^|\\W)('+whiteList[i].toLowerCase().replace(/\)/g, "\\)").replace(/\(/g, "\\(").replace(/\[/g, "\\[").replace(/\x2a/g, "(\\w*?)")+')(\\W|$)';
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
      var filterRegex = '(^|\\W)('+blackList[i].toLowerCase().replace(/\)/g, "\\)").replace(/\(/g, "\\(").replace(/\[/g, "\\[").replace(/\x2a/g, "(\\w*?)")+')(\\W|$)';
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

function addGlobalStyle(styleID, cssRules) {
  var cStyle, elmHead;
  cStyle = document.getElementById(styleID);
  elmHead = document.getElementsByTagName('head')[0];

  if (elmHead == undefined) {
    return false;
  }

  if (cStyle == undefined) {
    var elmStyle = document.createElement('style');
    elmStyle.type = 'text/css';
    elmStyle.id = styleID;
    while (cssRules.length > 0) {
      var cssRule = cssRules.pop();
      if (elmStyle.sheet != undefined && elmStyle.sheet.cssRules[0] != null) {
        elmStyle.sheet.insertRule(cssRule,0);
      } else {
        elmStyle.appendChild(document.createTextNode(cssRule));
      }
    }
    elmHead.appendChild(elmStyle);
    return true;
  } else {
    while (cStyle.sheet.cssRules.length > 0) {
      cStyle.sheet.deleteRule(0);
    }
    while (cssRules.length > 0) {
      var cssRule = cssRules.pop();
      if (cStyle.sheet != undefined && cStyle.sheet.cssRules[0] != null) {
        cStyle.sheet.insertRule(cssRule,0);
      } else {
        cStyle.appendChild(document.createTextNode(cssRule));
      }
    }
    return true;
  }
}

function show_tags() {
  var cssRules = new Array();
  cssRules[0]  = ".tumblr_savior a.tag {";
  cssRules[0] += "font-weight: normal !important;";
  cssRules[0] += "}";
  addGlobalStyle("notice_tags_css",cssRules);
}

function hide_tags() {
  var cssRules = new Array();
  cssRules[0]  = ".tumblr_savior a.tag {}";
//  addGlobalStyle("notice_tags_css", cssRules);
}

function show_white_notice() {
  var cssRules = new Array();
  cssRules[0]  = ".whitelisted {";
  cssRules[0] += "background: #57b787;";
  if (settings['black_notice']) {
    cssRules[0] += "top: 50px;";
  } else {
    cssRules[0] += "top: 20px;";
  }
  cssRules[0] += "}";
  addGlobalStyle("white_notice_style",cssRules);
}

function show_black_notice() { 
  var cssRules = new Array();
  cssRules[0]  = ".blacklisted {";
  cssRules[0] += "background: #d93023;";
  cssRules[0] += "top: 20px;";
  cssRules[0] += "}";
  addGlobalStyle("black_notice_style",cssRules);
}

function hide_white_notice() {
  var cssRules = new Array();
  cssRules[0]  = ".whitelisted {";
  cssRules[0] += "display: none;";
  cssRules[0] += "}";
  addGlobalStyle("white_notice_style", cssRules);
}

function hide_black_notice() {
  var cssRules = new Array();
  cssRules[0]  = ".blacklisted {";
  cssRules[0] += "display: none;";
  cssRules[0] += "}";
  addGlobalStyle("black_notice_style", cssRules);
}

function hide_premium() {
  var cssRules = new Array();
  cssRules[0]  = "#tumblr_radar.premium {";
  cssRules[0] += "display: none;";
  cssRules[0] += "}";
  addGlobalStyle("premium_style", cssRules);
}

function show_premium() {
  var cssRules = new Array();
  cssRules[0]  = "#tumblr_radar.premium {}";
  addGlobalStyle("premium_style", cssRules);
}

function hide_pinned() {
  var cssRules = new Array();
  cssRules[0]  = ".promotion_pinned {";
  cssRules[0] += "display: none;";
  cssRules[0] += "}";
  addGlobalStyle("pinned_style", cssRules);
}

function show_pinned() {
  var cssRules = new Array();
  cssRules[0]  = ".promotion_pinned {}";
  addGlobalStyle("pinned_style", cssRules);
}

function hide_ratings() {
  var cssRules = new Array();
  cssRules[0]  = ".savior_rating {";
  cssRules[0] += "display: none;";
  cssRules[0] += "}";
  addGlobalStyle("savior_rating_style",cssRules);
}

function show_ratings() {
  var cssRules = new Array();
  cssRules[0]  = ".savior_rating {";
  cssRules[0] += "position: absolute;";
  cssRules[0] += "left: 532px;";
  cssRules[0] += "width: 20px;";
  cssRules[0] += "height: 20px;";
  cssRules[0] += "-webkit-border-radius: 4px;";
  cssRules[0] += "-webkit-box-shadow: 0 1px 5px rgba(0, 0, 0, .46);";
  cssRules[0] += "border-radius: 4px;";
  cssRules[0] += "}";
  cssRules[1]  = ".savior_rating:hover {";
  cssRules[1] += "overflow: hidden;";
  cssRules[1] += "white-space: nowrap;";
  cssRules[1] += "width: 200px;";
  cssRules[1] += "}";
  cssRules[2]  = ".savior_rating:hover span{";
  cssRules[2] += "display: inline;";
  cssRules[2] += "}";
  cssRules[3]  = ".savior_rating img {";
  cssRules[3] += "margin: 2px 0px 0px 2px;";
  cssRules[3] += "}";
  cssRules[4]  = ".savior_rating span{";
  cssRules[4] += "display: none;";
  cssRules[4] += "line-height:20px;";
  cssRules[4] += "margin-left:2px;";
  cssRules[4] += "vertical-align: top;";
  cssRules[4] += "}";
  addGlobalStyle("savior_rating_style",cssRules);
}

function hide_source() {
  var cssRules = new Array();
  cssRules[0]  = '.source_url {display:none!important;}';
  addGlobalStyle("source_url_style",cssRules);
}

function show_source() {
  var cssRules = new Array();
  cssRules[0]  = '.source_url {}';
  addGlobalStyle("source_url_style",cssRules);
}

function unpin(thepost) {
  var clickUnpin = document.createEvent("MouseEvents");
  clickUnpin.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
  var pins = thepost.getElementsByClassName("pin");
  var pin = pins[0];
  if (pin != undefined) {
    pin.dispatchEvent(clickUnpin);
  }
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

function firefoxMessageHandler(data) {
  var savedSettings = data;
  settings = parseSettings(savedSettings);

  applySettings();
  WaitForPosts();
}

function WaitForPosts() {
  gotSettings = true;
  var olPosts = document.getElementById('posts');
  if (olPosts === null && !isTumblrSaviorRunning) {
    setTimeout(WaitForPosts, 10);
  } else if (!isTumblrSaviorRunning) {
    wireupnodes();
    //olPosts.addEventListener("DOMNodeInserted", handlePostInserted, false);
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
  checkPosts();
}

function handlePostInserted(argPost) {
  var liPost = argPost.target;
  if (liPost.id==undefined) {
    return;
  }
  if (inProgress[liPost.id] != undefined) {
    return;
  }
  if (liPost.id.indexOf("post") != 0) {
    return
  }
  if (gotSettings) {
    checkPost(liPost);
  } else {
    inProgress[liPost.id] = new Object();
  }
}

function checkPosts() {
  for (var liPost in inProgress) {
    checkPost(document.getElementById(liPost));
    delete inProgress[liPost]
  }
  //reconcileBuffer();
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
  if (savedSettings == undefined || savedSettings == null || savedSettings == '' || savedSettings == '{}') {
    parsedSettings = defaultSettings;
  } else {
    try {
      parsedSettings = JSON.parse(savedSettings);
    } catch (err) {
      parsedSettings = defaultSettings;
    }
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
  if (settings['show_tags']) {
    show_tags();
  } else {
    hide_tags();
  }
  if (settings['hide_premium']) {
    hide_premium();
  } else {
    show_premium();
  }
}

function wireupnodes() {
  document.addEventListener('animationstart', handlePostInserted, false);
  document.addEventListener('MSAnimationStart', handlePostInserted, false);
  document.addEventListener('webkitAnimationStart', handlePostInserted, false);
  document.addEventListener('OAnimationStart', handlePostInserted, false);

  var cssRules = new Array();

  cssRules[0]  = "@keyframes nodeInserted {";
  cssRules[0] += "    from { clip: rect(1px, auto, auto, auto); }";
  cssRules[0] += "    to { clip: rect(0px, auto, auto, auto); }";
  cssRules[0] += "}";

  cssRules[1]  = "@-moz-keyframes nodeInserted {";
  cssRules[1] += "    from { clip: rect(1px, auto, auto, auto); }";
  cssRules[1] += "    to { clip: rect(0px, auto, auto, auto); }";
  cssRules[1] += "}";

  cssRules[2]  = "@-webkit-keyframes nodeInserted {";
  cssRules[2] += "    from { clip: rect(1px, auto, auto, auto); }";
  cssRules[2] += "    to { clip: rect(0px, auto, auto, auto); }";
  cssRules[2] += "}";

  cssRules[3]  = "@-ms-keyframes nodeInserted {";
  cssRules[3] += "    from { clip: rect(1px, auto, auto, auto); }";
  cssRules[3] += "    to { clip: rect(0px, auto, auto, auto); }";
  cssRules[3] += "}";

  cssRules[4]  = "@-o-keyframes nodeInserted {";
  cssRules[4] += "    from { clip: rect(1px, auto, auto, auto); }";
  cssRules[4] += "    to { clip: rect(0px, auto, auto, auto); }";
  cssRules[4] += "}";

  cssRules[5]  = "ol#posts li {";
  cssRules[5] += "    animation-duration: 1ms;";
  cssRules[5] += "    -o-animation-duration: 1ms;";
  cssRules[5] += "    -ms-animation-duration: 1ms;";
  cssRules[5] += "    -moz-animation-duration: 1ms;";
  cssRules[5] += "    -webkit-animation-duration: 1ms;";
  cssRules[5] += "    animation-name: nodeInserted;";
  cssRules[5] += "    -o-animation-name: nodeInserted;";
  cssRules[5] += "    -ms-animation-name: nodeInserted;";     
  cssRules[5] += "    -moz-animation-name: nodeInserted;";
  cssRules[5] += "    -webkit-animation-name: nodeInserted;";
  cssRules[5] += "}";

  addGlobalStyle("wires",cssRules);
}

function initializeTumblrSavior() {
  if (typeof chrome != 'undefined') {
/*  if (typeof chrome.extension.onMessage != "undefined") {
      chrome.extension.onMessage.addListener(
        function(request, sender, sendResponse) {
          if (request=="refreshSettings") {
            chrome.extension.sendMessage(null, 'getSettings', chromeHandleMessage);
          }
        });
      chrome.extension.sendMessage(null, 'getSettings', chromeHandleMessage);
    } else */ 
    if (typeof chrome.extension.onRequest != "undefined") {
      chrome.extension.onRequest.addListener(
        function(request, sender, sendResponse) {
          if (request=="refreshSettings") {
            chrome.extension.sendRequest('getSettings', chromeHandleMessage);
          }
        });
      chrome.extension.sendRequest('getSettings', chromeHandleMessage);
    }
  } else if (typeof opera != 'undefined') {
    opera.extension.onmessage = operaHandleMessage;
    opera.extension.postMessage('getSettings');
  } else if (typeof safari != 'undefined') {
    window.addEventListener("contextmenu", safariContextMenuHandler, false);
    safari.self.addEventListener('message', safariMessageHandler, false);
    safari.self.tab.dispatchMessage('getSettings');
  } else { // We must be firefox.
    self.on('message', firefoxMessageHandler);
    self.postMessage('getSettings');
  }
}

var whiteListed = new Object();
var blackListed = new Object();
var promoted = new Array();

//var checkPostInterval = setInterval(checkPosts, 500);

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
  if (typeof manuallyShown[liPost.id] !== "undefined") {
    return;
  }
  if (settings['auto_unpin'] && liPost.className.indexOf('promotion_pinned') >=0) {
    unpin(liPost);
  }

  var olPosts = document.getElementById('posts');

  var bln = liPost.getElementsByClassName("blacklisted");
  var wln = liPost.getElementsByClassName("whitelisted");
  var liRemove = document.getElementById('notification_'+liPost.id);

  if(liRemove) {
    olPosts.removeChild(liRemove);
  }

  if (bln.length) {
    for (var n=0;n<bln.length;n++) {
      if (bln[n].parentNode != undefined) {
        bln[n].parentNode.removeChild(bln[n]);
      }
    }
  }
  
  if (wln.length) {
    for (var n=0;n<wln.length;n++) {
      if (wln[n].parentNode != undefined) {
        wln[n].parentNode.removeChild(wln[n]);
      }
    }
  }

  var savedfrom = needstobesaved(liPost.innerHTML);

  if (savedfrom.bL.length && savedfrom.wL.length == 0) {
    if (settings['show_notice']) {
      var author = getAuthor(liPost);

      var li_notice = document.createElement('li');
      li_notice.id = 'notification_'+liPost.id;
      li_notice.className = 'notification first_notification last_notification tumblr_savior';

      var a_avatar = document.createElement('a');
      a_avatar.href = "http://"+author['name']+".tumblr.com/";
      a_avatar.className = "avatar_frame";
      a_avatar.title = author['name'];

      var img_avatar = document.createElement('img');
      img_avatar.src = author['avatar'];
      img_avatar.className = "avatar";
      img_avatar.title = author['name'];

      a_avatar.appendChild(img_avatar);
      
      li_notice.appendChild(a_avatar);

      var nipple_border = document.createElement('div');
      nipple_border.className = "nipple border";
      li_notice.appendChild(nipple_border);
      
      var nipple = document.createElement('div');
      nipple.className = "nipple";
      li_notice.appendChild(nipple);

      var a_author = document.createElement('a');
      a_author.href = "http://"+author['name']+".tumblr.com/";
      a_author.textContent = author['name'];
      
      li_notice.appendChild(a_author);
      
      var txtPosted = document.createTextNode(" posted something");
      li_notice.appendChild(txtPosted);
      
      if (settings['show_words']) {
        var txtContents = " with";
        for (var j=0;j<savedfrom.bL.length;j++) {
          if (savedfrom.bL.length>2&&j!=0&&j<savedfrom.bL.length-1){
            txtContents += ',';
          }
          if (savedfrom.bL.length>1&&j==savedfrom.bL.length-1) {
            txtContents += ' and';
          }
          txtContents += ' \''+savedfrom.bL[j]+'\'';
        }
        txtContents += ' in it.';
        li_notice.appendChild(document.createTextNode(txtContents));
      } else {
        li_notice.appendChild(document.createTextNode(' you probably didn\'t want to see.'));
      }
      
      var br = document.createElement("br");
      li_notice.appendChild(br);

      var a_reveal = document.createElement("a");
      a_reveal.href="#";

      var i_reveal = document.createElement("i");
      i_reveal.appendChild(document.createTextNode("If you cannot resist the temptation, click here..."));

      a_reveal.addEventListener("click", handleReveal, false);

      a_reveal.appendChild(i_reveal);

      li_notice.appendChild(a_reveal);
      
      if (settings['show_tags']) {
        var span_tags = document.getElementById(liPost.id.replace('post_','post_tags_'));
        if (span_tags != null) {
          li_notice.appendChild(document.createElement("br"));
          li_notice.appendChild(document.createElement("br"));
          var span_notice_tags = document.createElement("span");
          span_notice_tags.appendChild(document.createTextNode("Tags: "));
          span_notice_tags.appendChild(document.createTextNode(span_tags.innerText));
          li_notice.appendChild(span_notice_tags);
        }
      }

      if(liPost.nextSibling) {
        olPosts.insertBefore(li_notice, liPost.nextSibling);
      } else {
        olPosts.appendChild(li_notice);
      }

      //liBuffer.push(li_notice); // We put it into a buffer so that we don't mess up the state of the posts as it's being iterated through. Gotta make sure we reconcile this after we're done.
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
    var imgRating = document.createElement('img');
    imgRating.src = 'data:image/png;base64,'+icon;
    imgRating.title = whiteListed[liPost.id].join(", ");
    divRating.appendChild(imgRating);
    var spanWhitelisted = document.createElement('span');
    spanWhitelisted.textContent = whiteListed[liPost.id].join(", ");
    divRating.appendChild(spanWhitelisted);
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
    var imgRating = document.createElement('img');
    imgRating.src = 'data:image/png;base64,'+icon;
    imgRating.title = blackListed[liPost.id].join(", ");
    divRating.appendChild(imgRating);
    var spanBlacklisted = document.createElement('span');
    spanBlacklisted.textContent = blackListed[liPost.id].join(", ");
    divRating.appendChild(spanBlacklisted);
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
      var remove = liPost.id;
      document.getElementById(remove).className = document.getElementById(remove).className.replace(/promotion_highlighted/gm, "");
      var ribbon_right = document.getElementById("highlight_ribbon_right_"+remove.replace("post_",""));
      var ribbon_left = document.getElementById("highlight_ribbon_left_"+remove.replace("post_",""));
      ribbon_right.parentNode.removeChild(ribbon_right);
      ribbon_left.parentNode.removeChild(ribbon_left);
    }
  }
}

function handleReveal(e) {
  e.preventDefault();
  e.stopPropagation();

  var searchUp = e.target;

  while (searchUp.tagName != "LI") {
    searchUp = searchUp.parentNode;
  }

  searchUp.previousSibling.style.display = "list-item";
  searchUp.style.display = "none";
  manuallyShown[searchUp.previousSibling.id] = new Object();
}

function getAuthor(liPost) {
  var pPost = liPost;
  var author = [];

	if (liPost.className.indexOf("same_user_as_last") >=0) { // There's no post_info data after the first in sequential posts by the same author, so we need to look for the previous post and it may not be immediately above the post we're looking at.
    while(pPost.previousSibling.id == undefined || pPost.previousSibling.id.indexOf("post_") != 0 || pPost.previousSibling.className.indexOf("same_user_as_last") >= 0) {
      pPost = pPost.previousSibling;
    }
    pPost = pPost.previousSibling;
  }

	author['name'] = pPost.getElementsByClassName("post_info").item(0).getElementsByTagName("A").item(0).innerHTML;
	var avatar = document.getElementById(pPost.id.replace('_','_avatar_'));
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

if (!checkurl(window.location.href, ['http://www.tumblr.com/upload/*', 'http://www.tumblr.com/inbox','http://www.tumblr.com/blog/*','http://www.tumblr.com/inbox/*'])){
  initializeTumblrSavior();
}