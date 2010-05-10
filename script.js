function needstobesaved(theStr){
  var blackList = settings['listBlack'];
  var whiteList = settings['listWhite'];
  var blacklisted = false;
  var whitelisted = false;
  
  for(var i=0;i<=whiteList.length;i++) {
    if(theStr.toLowerCase().indexOf(whiteList[i])>=0) {
      whitelisted = true;
    }
  }

  if (!whitelisted) {
    for(var i=0;i<=blackList.length;i++) {
      if(theStr.toLowerCase().indexOf(blackList[i])>=0) {
        blacklisted = true;
      }
    }
  }
  return blacklisted;
}

var liPosts = document.getElementsByTagName('li');
var last_check = 0;
var settings;

function loadSettings() {
  var defaultSettings = { 'listBlack': ['iphone', 'nfl'], 'listWhite': ['bjorn', 'octopus'] }; //initialize default values.
	chrome.extension.sendRequest('getSettings', function(response) {
    savedSettings = response.settings;
    if (savedSettings == undefined) {
			settings = defaultSettings;
    } else {
			settings = JSON.parse(savedSettings);
    }
    console.log(settings);
    setInterval(check_for_saving, 200);
	});
}
  
function check_for_saving() {
	for (var i=last_check;i<liPosts.length;i++) {
		if (liPosts[i].id.substring(0,4)=='post' && liPosts[i].className.indexOf('not_mine') >= 0) {
			var savedfrom = needstobesaved(liPosts[i].innerHTML);
			if (savedfrom) {
				var div_filtered = document.createElement('div');
				div_filtered.style.display = 'none';

				while (liPosts[i].childNodes.length > 1) {
					div_filtered.appendChild(liPosts[i].childNodes[0]);
				}

				var div_notice = document.createElement('div');
				div_notice.className = 'post_info';
				div_notice.innerHTML = 'You have been saved from this post, it had something you didn\'t want to see in it. <a onclick="this.parentNode.style.display=\'none\'; this.parentNode.nextSibling.style.display=\'\'; return false;" href="#"><i>Click here</i></a> if you cannot resist the temptation.';

				liPosts[i].appendChild(div_notice);
				liPosts[i].appendChild(div_filtered);
			}
		}
	}
	last_check = liPosts.length;
}

loadSettings();