// Basic Example
let swooshTable = new SwooshTable('.js-basicExample');
swooshTable.on('click', function(event, row, elButton) {
	// Restore the row to original position
	row.restore();

	// Remove the row
	row.$el.slideUp(function() {
		swooshTable.removeRow(row);
	});
});
