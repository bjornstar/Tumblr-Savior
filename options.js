document.addEventListener("DOMContentLoaded", function () {
  var save_btn = document.getElementById("save_btn");
  var reset_btn = document.getElementById("reset_btn");
  var listWhiteAdd = document.getElementById("listWhiteAdd");
  var listBlackAdd = document.getElementById("listBlackAdd");

  save_btn.addEventListener("click", saveOptions);
  reset_btn.addEventListener("click", function() { if (confirm("Are you sure you want to restore defaults?")) {eraseOptions();}; });

  listWhiteAdd.addEventListener(
    "click",
    function(e) {
      addInput("White");
      e.preventDefault();
      e.stopPropagation();
    },
    false
  );

  listBlackAdd.addEventListener( // This is soooooo much easier than onclick="asdf(); return false;" yeah, thanks a lot Google.
    "click",
    function(e) {
      addInput("Black");
      e.preventDefault();
      e.stopPropagation();
    },
    false
  );

  loadOptions();
});

function parseSettings() {
  var parsedSettings;
  
  if (localStorage["settings"] == undefined || localStorage == null) {
    parsedSettings = defaultSettings;
  } else {
    parsedSettings = JSON.parse(localStorage["settings"]);
  }
  console.log(parsedSettings);
  return parsedSettings;
}

function loadOptions() {
  var loadSettings;
  
  loadSettings = parseSettings();
  
  var hide_source_cb = document.getElementById("hide_source_cb");
  hide_source_cb.checked = loadSettings["hide_source"];
  
  var show_notice_cb = document.getElementById("show_notice_cb");
  show_notice_cb.checked = loadSettings["show_notice"];
  
  var show_Words_cb = document.getElementById("show_words_cb");
  show_words_cb.checked = loadSettings["show_words"];
  
  var pagetracker_cb = document.getElementById("pagetracker_cb");
  pagetracker_cb.checked = loadSettings["no_pagetracker"];
  
  var match_words_cb = document.getElementById("match_words_cb");
  match_words_cb.checked = loadSettings["match_words"];
  
  var promoted_tags_cb = document.getElementById("promoted_tags_cb");
  promoted_tags_cb.checked = loadSettings["promoted_tags"];
  
  var promoted_posts_db = document.getElementById("promoted_posts_cb");
  promoted_posts_cb.checked = loadSettings["promoted_posts"];
  
  var context_menu_cb = document.getElementById("context_menu_cb");
  context_menu_cb.checked = loadSettings["context_menu"];

  var toolbar_butt_cb = document.getElementById("toolbar_butt_cb");
  toolbar_butt_cb.checked = loadSettings["toolbar_butt"];
  
  var white_notice_cb = document.getElementById("white_notice_cb");
  white_notice_cb.checked = loadSettings["white_notice"];

  var black_notice_cb = document.getElementById("black_notice_cb");
  black_notice_cb.checked = loadSettings["black_notice"];

  var hide_pinned_cb = document.getElementById("hide_pinned_cb");
  hide_pinned_cb.checked = loadSettings["hide_pinned"];
  
  var auto_unpin_cb = document.getElementById("auto_unpin_cb");
  auto_unpin_cb.checked = loadSettings["auto_unpin"];
  
  for (var itemBlack in loadSettings["listBlack"]) {
    addInput("Black", loadSettings["listBlack"][itemBlack]);
  }
  
  for (var itemWhite in loadSettings["listWhite"]) {
    addInput("White", loadSettings["listWhite"][itemWhite]);
  }
  
  addInput("Black"); //prepare a blank input box.
  addInput("White"); //prepare a blank input box.
  
  var version_div = document.getElementById("version_div");
  version_div.innerHTML = "v"+defaultSettings["version"]; //use default so we're always showing current version regardless of what people have saved.

  if (typeof opera != "undefined") {
    var context_menu_div = document.getElementById("context_menu_div");
    context_menu_div.setAttribute("style", "display:none;");
    
    var browser_span = document.getElementById("browser_span");
    browser_span.innerHTML = "for Opera&trade;";
  }
  
  if (typeof chrome != "undefined" || typeof safari != "undefined") {
    var toolbar_butt_div = document.getElementById("toolbar_butt_div");
    toolbar_butt_div.setAttribute("style", "display:none;");
    
    var browser_span = document.getElementById("browser_span");
    browser_span.innerHTML = "for Chrome&trade;";          
  }
  
  if (typeof safari != "undefined") {
    var browser_span = document.getElementById("browser_span");
    browser_span.innerHTML = "for Safari&trade;";
  }
}

function addInput(whichList, itemValue) {
  if (itemValue == undefined) {
    itemValue = "";
  }
  var listDiv = document.getElementById("list"+whichList);
  var listAdd = document.getElementById("list"+whichList+"Add");

  optionInput = document.createElement("input");
  optionInput.value = itemValue;
  optionInput.name = "option"+whichList;
  currentLength = document.getElementsByTagName("input").length;
  optionInput.id = "option"+whichList+currentLength;
  optionAdd = document.createElement("a");
  optionAdd.href = "#";
//  optionAdd.setAttribute("onclick", "removeInput(\"option"+whichList+currentLength+"\"); return false;");
  optionAdd.addEventListener(
    "click",
    function (e) {
      removeInput(e.target);
      e.preventDefault();
      e.stopPropagation();
    },
    false
  );
  optionAdd.innerHTML = "<img src=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAHCAYAAADEUlfTAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAGFJREFUeNpiXLVmfTwDA8MEIHYICwm8COTrA9kHgLiAEch5D2QIAPEHkABUIZjPBNIBlQAJLEBS6MAEMgqqAxkUgMQZkewQQJKE6ESSAAkkIFlxgAlq5AeoaxciuaEAIMAAiDAi7M96B5wAAAAASUVORK5CYII=\" />&nbsp;";
  optionLinebreak = document.createElement("br");
  listDiv.insertBefore(optionAdd,listAdd);
  listDiv.insertBefore(optionInput,listAdd);
  listDiv.insertBefore(optionLinebreak,listAdd);
}

function removeInput(optionWhich) {
  var optionInput = optionWhich.parentNode
  optionInput.parentNode.removeChild(optionInput.nextSibling);
  optionInput.parentNode.removeChild(optionInput.nextSibling);
  optionInput.parentNode.removeChild(optionInput);
}

function saveOptions() {
  var oldSettings = parseSettings();
  var newSettings = {};

  var hide_source_cb = document.getElementById("hide_source_cb");
  newSettings["hide_source"] = hide_source_cb.checked;
  
  var show_notice_cb = document.getElementById("show_notice_cb");
  newSettings["show_notice"] = show_notice_cb.checked;
  
  var show_words_cb = document.getElementById("show_words_cb");
  newSettings["show_words"] = show_words_cb.checked;
  
  var pagetracker_cb = document.getElementById("pagetracker_cb");
  newSettings["no_pagetracker"] = pagetracker_cb.checked;
  
  var match_words_cb = document.getElementById("match_words_cb");
  newSettings["match_words"] = match_words_cb.checked;
  
  var promoted_tags_cb = document.getElementById("promoted_tags_cb");
  newSettings["promoted_tags"] = promoted_tags_cb.checked;
  
  var promoted_posts_cb = document.getElementById("promoted_posts_cb");
  newSettings["promoted_posts"] = promoted_posts_cb.checked;
  
  var context_menu_cb = document.getElementById("context_menu_cb");
  newSettings["context_menu"] = context_menu_cb.checked;
  
  var toolbar_butt_cb = document.getElementById("toolbar_butt_cb");
  newSettings["toolbar_butt"] = toolbar_butt_cb.checked;
  
  var white_notice_cb = document.getElementById("white_notice_cb");
  newSettings["white_notice"] = white_notice_cb.checked;
  
  var black_notice_cb = document.getElementById("black_notice_cb");
  newSettings["black_notice"] = black_notice_cb.checked;

  var hide_pinned_cb = document.getElementById("hide_pinned_cb");
  newSettings["hide_pinned"] = hide_pinned_cb.checked;
  
  var auto_unpin_cb = document.getElementById("auto_unpin_cb");
  newSettings["auto_unpin"] = auto_unpin_cb.checked;

  newSettings["listWhite"] = [];
  newSettings["listBlack"] = [];
  newSettings["version"] = defaultSettings["version"]; //always update version info from default.

  var options = document.getElementsByTagName("input");
  for (var i = 0; i< options.length; i++) {
    if (options[i].value != "") {
      if (options[i].name.substring(0,11) == "optionWhite") {
        newSettings["listWhite"].push(options[i].value);
      } else if (options[i].name.substring(0,11) == "optionBlack") {
        newSettings["listBlack"].push(options[i].value);
      }
    }
  }

  if (newSettings["context_menu"]){
    if (oldSettings["context_menu"]==false) {
      if (typeof chrome != "undefined") {
        var cmAddToBlackList = chrome.contextMenus.create({
          "type":"normal",
          "title":"Add '%s' to Tumblr Savior black list",
          "contexts": ["selection"],
          "documentUrlPatterns": ["http://*.tumblr.com/*"],
          "onclick": chromeAddToBlackList
        });
      }
    }
  } else {
    if (typeof chrome != "undefined") {
      chrome.contextMenus.removeAll();
    }
  }

  if (newSettings["toolbar_butt"]!=oldSettings["toolbar_butt"]) {
    if (typeof opera != "undefined") {
      opera.extension.postMessage("toolbar");
    }
  }

  localStorage["settings"] = JSON.stringify(newSettings);
  notifyBrowsers(newSettings);
  location.reload();
}

function eraseOptions() {
  localStorage["settings"] = JSON.stringify(defaultSettings);
  notifyBrowsers(defaultSettings);
  location.reload();
}

function notifyBrowsers(newSettings) {
  if (typeof chrome != "undefined") {
    chrome.tabs.getAllInWindow(null, chromeNotifyTumblr);
  }
  if (typeof opera != "undefined") {
    opera.extension.postMessage("refreshSettings");
  }
  if (typeof safari != "undefined") {
    safari.self.tab.dispatchMessage("refreshSettings", newSettings);
  }
}

function chromeNotifyTumblr(tabs) {
  for (tab in tabs) {
    if(checkurl(tabs[tab].url, ["http://*.tumblr.com/*"])) {
      chrome.tabs.sendMessage(tabs[tab].id, "refreshSettings");
    }
  }
}

function chromeAddToBlackList(info, tab) {
  var oldSettings = parseSettings();
  if(info.selectionText) {
    for(var v=0;v<oldSettings["listBlack"].length;v++){
      if(oldSettings.listBlack[v].toLowerCase()==info.selectionText.toLowerCase()) {
        alert("'"+info.selectionText+"' is already on your black list.");
        return;
      }
    }
    oldSettings.listBlack.push(info.selectionText.toLowerCase());
    localStorage["settings"] = JSON.stringify(oldSettings);
  }
  var chromeViews = chrome.extension.getViews();
  for(chromeView in chromeViews) {
    if(chromeViews[chromeView].location==chrome.extension.getURL("options.html")) {
      chromeViews[chromeView].location.reload();
    }
  }
  chrome.tabs.sendMessage(tab.id, "refreshSettings");
}

function safariMessageHandler(event) {
  switch (event.name) {
    case "reload":
      location.reload();
      break;
    case "updateSettings":
      localStorage["settings"] = event.message;
      location.reload();
      break;
  }
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

if (typeof safari != "undefined") {
  safari.self.addEventListener("message", safariMessageHandler, false);
}


