if(typeof chrome != 'undefined') {
  chrome.extension.onMessage.addListener(
    function(message, sender, sendResponse) {
      if (message == 'getSettings')
        sendResponse({data: localStorage['settings']});
      else
        sendResponse({}); // snub them.
    });
  var settings = parseSettings();
  if(settings['context_menu']=='true'||settings['context_menu']==true) {
    var cmAddToBlackList = chrome.contextMenus.create({
      "type":"normal",
      "title":"Add '%s' to Tumblr Savior black list",
      "contexts": ["selection"],
      "documentUrlPatterns": ["http://*.tumblr.com/*"],
      "onclick": chromeAddToBlackList
    });
  }
}

if (typeof opera != "undefined") {
  opera.extension.onmessage = operaMessageHandler;
  operaToolbar();
}

if (typeof safari != "undefined") {
  safari.application.addEventListener("message", safariMessageHandler, false);
  safari.application.addEventListener("command", safariCommandHandler, false);
  safari.application.addEventListener("contextmenu", safariContextMenuHandler, false);
}

function parseSettings() {
  var parsedSettings;

  if (localStorage['settings'] == undefined || localStorage['settings'] == null) {
    parsedSettings = defaultSettings;
  } else {
    parsedSettings = JSON.parse(localStorage['settings']);
  }
  console.log(parsedSettings);
  return parsedSettings;
}

function chromeAddToBlackList(info, tab) {
  var theword = info.selectionText;
  
  if (typeof theword != 'undefined') {
    var success = addToBlackList(theword);

    if (success) {
      var chromeViews = chrome.extension.getViews();
      for(chromeView in chromeViews) {
        if(chromeViews[chromeView].location==chrome.extension.getURL('options.html')) {
          chromeViews[chromeView].location.reload();
        }
      }
      chrome.tabs.sendMessage(tab.id, "refreshSettings");
    }
  }
}

function operaMessageHandler(event) {
  switch (event.data) {
    case 'getSettings':
      event.source.postMessage({topic: 'settings', data: localStorage['settings']});
      break;
    case 'refreshSettings':
      opera.extension.broadcastMessage('refreshSettings');
      break;
    case 'toolbar':
      operaToolbar();
      break;
    default:
      event.source.postMessage({}); // snub them.
      break;
  }
}

function operaToolbar() {
  var settings = parseSettings();
  if(settings['toolbar_butt']) {
    var button = opera.contexts.toolbar.createItem({ 
      icon:'Icon-16.png',
      popup: {
                href: "options.html",
                width: 940,
                height: 610
            },
      title:'Tumblr Savior'
    });
    opera.contexts.toolbar.addItem(button);
  } else {
    opera.contexts.toolbar.removeItem(opera.contexts.toolbar.item(0));
  }
}

function safariMessageHandler(event) {
  if (event.name == "getSettings") {
    event.target.page.dispatchMessage("settings",{data: localStorage['settings']});
  } else if (event.name == "refreshSettings") {
    localStorage['settings'] = JSON.stringify(event.message);
    for (tab in safari.application.activeBrowserWindow.tabs) {
      if (checkurl(safari.application.activeBrowserWindow.tabs[tab].url, ['http://*.tumblr.com/*'])) {
        safari.application.activeBrowserWindow.tabs[tab].page.dispatchMessage("refreshSettings");
      }
    }
  } else {
    event.target.page.dispatchMessage({}); //snub them.
  }
}

function safariCommandHandler(event) {
  if (event.command == "options") {
    var tabAlreadyOpened;
    for (tab in safari.application.activeBrowserWindow.tabs) {
      if (safari.application.activeBrowserWindow.tabs[tab].url == safari.extension.baseURI + "options.html") {
        tabAlreadyOpened = tab;
      }
    }
    if (tabAlreadyOpened == undefined) {
      var newTab = safari.application.activeBrowserWindow.openTab();
      newTab.url = safari.extension.baseURI + "options.html";
    } else {
      safari.application.activeBrowserWindow.tabs[tab].activate();
    }
  } else if (event.command == "addToBlackList") {
    var theword = event.userInfo;
    if (typeof theword != 'undefined') {
      var success = addToBlackList(theword);
      if (success) {
        for (tab in safari.application.activeBrowserWindow.tabs) {
          if (checkurl(safari.application.activeBrowserWindow.tabs[tab].url, ['http://*.tumblr.com/*'])) {
            safari.application.activeBrowserWindow.tabs[tab].page.dispatchMessage("refreshSettings");
          } else if (safari.application.activeBrowserWindow.tabs[tab].url == safari.extension.baseURI + "options.html") {
            safari.application.activeBrowserWindow.tabs[tab].page.dispatchMessage("updateSettings", localStorage['settings']);
          }
        }
      }
    }
  }
}

function addToBlackList(theword) {
  var oldSettings = parseSettings();
  for(var v=0;v<oldSettings['listBlack'].length;v++){
    if(oldSettings.listBlack[v].toLowerCase()==theword.toLowerCase()) {
      alert('\''+theword+'\' is already on your black list.');
      return false;
    }
  }
  oldSettings.listBlack.push(theword.toLowerCase());
  localStorage['settings'] = JSON.stringify(oldSettings);
  return true;
}

function safariContextMenuHandler(event) {
  var wordBlack = event.userInfo;
  var settings = parseSettings();
  if(settings['context_menu'] && typeof wordBlack != 'undefined' && wordBlack != null) {
    if (wordBlack.length>25) {
      wordBlack = wordBlack.substr(0,25);
      wordBlack = wordBlack.replace(/^\s+|\s+$/g,"");
      wordBlack = wordBlack + "...";
    }
    event.contextMenu.appendContextMenuItem("addToBlackList", "Add '"+wordBlack+"' to Tumblr Savior black list");
  }
}

function checkurl(url, filter) {
  if (url == undefined || url == null) {
    return false;
  }
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