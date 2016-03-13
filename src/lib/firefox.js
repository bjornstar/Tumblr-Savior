var buttons = require('sdk/ui/button/action');
var pageMod = require('sdk/page-mod');
var panels = require('sdk/panel');
var self = require('sdk/self');

// I think we require this to allow localStorage to work.
require('sdk/simple-storage');

var workers = [];

var optionsPanel = panels.Panel({
	width: 720,
	height: 600,
	contentURL: self.data.url('options.html')
});

function messageHandler(data) {
	optionsPanel.postMessage('getSettings');
}

function sendToWorkers(data) {
	for (var worker = 0; worker < workers.length; worker +=1 ) {
		workers[worker].postMessage(data);
	}
}

optionsPanel.on('message', sendToWorkers);

function workerDetached() {
	var worker = this;

	var index = workers.indexOf(worker);

	if (index !== -1) {
		workers.splice(index, 1);
	}
}

pageMod.PageMod({
	include: ['http://www.tumblr.com/*', 'https://www.tumblr.com/*'],
	contentScriptFile: self.data.url('script.js'),
	contentScriptWhen: 'start',
	onAttach: function onAttach(worker) {
		workers.push(worker);
		worker.on('message', messageHandler);
		worker.on('detach', workerDetached);
	}
});

var button = buttons.ActionButton({
	id: 'options-button',
	label: 'Tumblr Savior Options',
	icon: {
		16: './Icon-16.png',
		32: './Icon-32.png',
		64: './Icon-64.png'
	},
	onClick: function () {
		optionsPanel.show();
	}
});
