/**
 * # Basic Example
 *
 * This example shows usage for following features and APIs:
 *
 * - Apply SwooshTable to existing rows
 *   - `row = UISwipe({ el })`
 * - Construct new rows, append it into the document and apply SwooshTable
 * - Delete rows with animation
 *   - `row.on("clickbutton", listener)`
 *   - `row.restore()`
 *   - `row.destroy()`
 */
(function() {
	var $list = $('.js-basicExample > tbody');
	var $rows = $list.children();
	var rowCount = $rows.length;

	// ----------------------------------------------------------------
	// manage existing rows
	$rows.each(function(i,el){
		apply(el);
	});

	function apply(el) {
		var row = new UISwipe({ el:el });
		row.on('clickbutton', onclickDevare.bind(null, row));
	}

	function onclickDevare(row) {
		console.log(row.$el.find('td:first').text(), 'has been deleted.');

		// Restore the row to original position
		row.restore();

		// Remove the row
		row.$el.slideUp(function(){
			row.destroy();
		});
	}

	// ----------------------------------------------------------------
	// add a new row
	$('.js-basicExample-add').on('click', function(event){
		// build a row element
		var $row = $(templateRow({ count:++rowCount }));

		// append the row into the document
		$list.append($row);

		// apply SwooshTable
		apply($row[0]);
	});

	function templateRow(data) {
		var html =
			'<tr class="ui-swooshTable-row">' +
				'<td class="ui-swooshTable-cell ui-swooshTable-cell-title">Fox ' + data.count + '</td>' +
				'<td class="ui-swooshTable-cell ui-swooshTable-cell-subtitle">The quick brown fox jumps over the lazy dog</td>' +
			'</tr>';

		return html;
	}
})();
