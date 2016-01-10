(function(window, document) {
	let swooshTable = new SwooshTable('.js-table');
	swooshTable.on('click', function(event, row, elButton) {
		if (elButton.classList.contains('rowTools-item-delete')) {
			row.restore();
			row.$el.slideUp(function() {
				swooshTable.removeRow(row);
			});
		}
	});
})(window, document);
