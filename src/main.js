(function(window, document) {
	// Example
	let swooshTable = new SwooshTable('.js-table');
	swooshTable.on('click', function(event, row, elButton) {
		if (elButton.classList.contains('rowTools-item-delete')) {
			row.restore();
			row.$el.slideUp(function() {
				swooshTable.removeRow(row);
			});
		}
	});

	// LiveReload
	if (location.search === '?live') {
		var elScript = document.createElement('script');
		elScript.src = '//' + location.hostname + ':35729/livereload.js';
		document.body.appendChild(elScript);
	}
})(window, document);
