var misc = {
	log: function(x) { // log function
		console.log('### ' + x + ' ###');
	},
	warn: function(x) {
		console.log('>>> ' + x + ' <<<');
	},
	checkSystem: function() {
		// check if iOS7
		var IOS = /(iPad|iPhone|iPod)/g.test(navigator.userAgent), // return true, false
			IOS7 = /(iPad|iPhone);.*CPU.*OS 7_\d/i.test(navigator.userAgent), // return true, false
			ua = navigator.userAgent.toLowerCase(),
			ANDROID = ua.indexOf("android") > -1; // return true, false
		if (!IOS && !IOS7 && !ANDROID) {
			// return WEB
			return 'web';
		} else if (IOS7) {
			// return IOS7
			return 'ios7';
		} else if (!IOS7 && IOS) {
			// return IOS6
			return 'ios6';
		} else if (ANDROID) {
			// return ANDR
			return 'android';
		}
	},
	centerObj: function(a) {
		misc.warn('centering ' + a);
		$(a).css({
			position: 'fixed',
			top: app.h / 2 - $(a).height() / 2,
			left: app.w / 2 - $(a).width() / 2,
			'z-index': 9
		});
	},

	sortByKey: function(array, key) {
		return array.sort(function(a, b) {
			var x = a[key];
			var y = b[key];
			return ((x < y) ? -1 : ((x > y) ? 1 : 0));
		});
	},

	replaceAll: function(find, replace, str) {
		return str.replace(new RegExp(find, 'g'), replace);
	}
};

$(document).on('mobileinit', function() {
	// Setting #container div as a jqm pageContainer
	// $.mobile.pageContainer = $('#container');
	$.mobile.page.prototype.options.domCache = true;
	misc.log('### loading >>> jQUery Mobile');
});