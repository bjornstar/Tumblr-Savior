function chromeMessageHandler(message, sender, sendResponse) {
  if (message == "getSettings") {
    sendResponse({data: localStorage["settings"]});
  } else {
    sendResponse({}); // snub them.
  }
}

function parseSettings() {
  var parsedSettings;

  if (typeof localStorage == "undefined" || localStorage['settings'] == undefined || localStorage['settings'] == null) {
    parsedSettings = defaultSettings;
  } else {
    parsedSettings = JSON.parse(localStorage['settings']);
  }
  return parsedSettings;
}

function chromeAddToBlackList(info, tab) {
  var theword = info.selectionText;
  
  if (typeof theword != 'undefined') {
    var success = addToBlackList(theword);

    if (success) {
      var chromeViews = chrome.extension.getViews();
      for(chromeView in chromeViews) {
        if(chromeViews[chromeView].location==chrome.extension.getURL('data/options.html')) {
          chromeViews[chromeView].location.reload();
        }
      }
/*      if (typeof chrome.tabs.sendMessage != "undefined") {
        chrome.tabs.sendMessage(tab.id, "refreshSettings");
      } else */ if (typeof chrome.tabs.sendRequest != "undefined") {
        chrome.tabs.sendRequest(tab.id, "refreshSettings");
      }
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
      icon:'data/Icon-16.png',
      popup: {
                href: "data/options.html",
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
    for (var tab=0; tab < safari.application.activeBrowserWindow.tabs.length; tab++) {
      if (safari.application.activeBrowserWindow.tabs[tab].url == safari.extension.baseURI + "data/options.html") {
        tabAlreadyOpened = tab;
      }
    }
    if (tabAlreadyOpened == undefined) {
      var newTab = safari.application.activeBrowserWindow.openTab();
      newTab.url = safari.extension.baseURI + "data/options.html";
    } else {
      safari.application.activeBrowserWindow.tabs[tabAlreadyOpened].activate();
    }
  } else if (event.command == "addToBlackList") {
    var theword = event.userInfo;
    if (typeof theword != 'undefined') {
      var success = addToBlackList(theword);
      if (success) {
        for (tab in safari.application.activeBrowserWindow.tabs) {
          if (checkurl(safari.application.activeBrowserWindow.tabs[tab].url, ['http://*.tumblr.com/*'])) {
            safari.application.activeBrowserWindow.tabs[tab].page.dispatchMessage("refreshSettings");
          } else if (safari.application.activeBrowserWindow.tabs[tab].url == safari.extension.baseURI + "data/options.html") {
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

function firefoxMessageHandler(data) {
  optionsPanel.postMessage("getSettings");
}

function firefoxOptionsMessageHandler(data) {
  for (var worker in workers) {
    workers[worker].postMessage(data);
  }
}

var workers = new Array();

function detachWorker(worker) {
  var index = workers.indexOf(worker);
  if(index != -1) {
    workers.splice(index, 1);
  }
}

if (typeof chrome != "undefined") {
/*  if (typeof chrome.extension.onMessage != "undefined") {
    chrome.extension.onMessage.addListener(chromeMessageHandler);
  } else */
  if (typeof chrome.extension.onRequest != "undefined") {
    chrome.extension.onRequest.addListener(chromeMessageHandler);
  }

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
} else if (typeof opera != "undefined") {
  opera.extension.onmessage = operaMessageHandler;
  operaToolbar();
} else if (typeof safari != "undefined") {
  safari.application.addEventListener("message", safariMessageHandler, false);
  safari.application.addEventListener("command", safariCommandHandler, false);
  safari.application.addEventListener("contextmenu", safariContextMenuHandler, false);
} else { // You are firefox.
  var pageMod = require("page-mod");
  var self = require("self");
  var ss = require("simple-storage");
  var widgets = require("widget");
  var panels = require("panel");

//  var localStorage = ss.storage; // ew...

  pageMod.PageMod({
    include: ["http://www.tumblr.com/*"],
    contentScriptFile: self.data.url("script.js"),
    contentScriptWhen: "ready",
    onAttach: function onAttach(worker) {
      workers.push(worker);
      worker.on('message', firefoxMessageHandler);
      worker.on('detach', function() {
        detachWorker(this);
      });
    }
  });

  var optionsPanel = panels.Panel({
    width:720,
    height:600,
    contentURL: self.data.url("options.html")
  });

  optionsPanel.on("message", firefoxOptionsMessageHandler);

  var optionsWidget = widgets.Widget({
    id: "optionsWidget",
    label: "Tumblr Savior Options",
    panel: optionsPanel,
    content: "<img src=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAnNJREFUeNqMU09M02AU/8awC5vJsu2g4ExwkDgJQzfCEsWEgQxI1CVLvHDadYNE9IAm84KJ3EBPBjGe0ETw6AXmwRBPXhjTkjCTicvC+FPKZC1tt7brs1/JcIMY92val+977/3e7/v6HgIAVAtMJpPR4XA463Q6XeV+/f8SbTbbWY/bfT0QCAQpitI/m5wMV/p1WEElqcFgQFc7Ojq9Xm+Pt6vL53K5blxqbraZrVb0ZXk529Pbaz+loLHx/LmhwaHbnk5Pj/ua+2ZrS4vDpiYoiqKRK6AgmqJQU1OTiSCIelEU5WMGrODR+HhUtcCzLGxns3CYz4PAccCp63dzc/Di+TTs03s4BG719Q1UKqjDH5qmD7Cl9igE6rMUi6GJpxPoTuAu+pVOI5Ik0T5NawmRcHi06pKwgra2K66SLIEsiZBYjcOTaBRez87i3wNrJKlVpnZ3oAy73X6xigDjW2I1hZ07W1vAq/IxfD4fDA8Pw0m8mpl5c4pgdGTk/snAT7EYGI1GyGQy2rpQLGpWkiSwWiyWKgK9Xt/AsuwhDiiVSsckOMTv90OhUABeEIA5CoEHY2MPjy8R56tJwvTU1Eu8KBZFbTOZTKJgMIi6u7sRw7JIEiXE87zm6x8YvKcW1ZcVELipzGZzq8ALJVmW4fdBHtbXkyAIBa2irIqSlb/HI8m1PbW9G8qtLGEV+Xw+tfBh4XMoFOo/QxDI6bx8dEz1XY2vbDMMQ8Xj8ZVEIv41lfr5g+M4oUyAY7Tu+q4CK0xvbDCbm5sbuVxua37+/dulxcWPoiTxp4bl5DS2t7d3RcKRx1ar5UItU6qrdZz/hT8CDADaR5pMovP3DQAAAABJRU5ErkJggg==\" />"
  });
}