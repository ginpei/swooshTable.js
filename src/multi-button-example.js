/**
 * # Multi-Button Example
 *
 * This example shows usage for following features and APIs:
 *
 * - Customize tool buttons
 *   - `row.on("clickbutton", listener)`
 */
(function($) {
	var $list = $('.js-multiButtonExample > tbody');
	var $rows = $list.children();
	var rowCount = $rows.length;

	// ----------------------------------------------------------------
	// manage existing rows
	$rows.each(function(i,el){
		apply(el);
	});

	function apply(el) {
		var row = new UISwipe({
			el:el,
			buttons: [
				{ key:'edit', label:'Edit' },
				{ key:'poke', label:'<em>Hello?</em>' }
			]
		});
		row.on('clickbutton', onclickToolButton);
	}

	function onclickToolButton(row, data) {
		var key = data.key;
		if (key === 'edit') {
			var lastName = row.$el.find('td:first').text();
			var name = prompt('Input new name', lastName);
			if (name) {
				row.$el.find('.ui-swooshTable-cell-title').text(name);
			}
		}
		else if (key === 'poke') {
			var name = row.$el.find('td:first').text();
			alert('Hi! I am ' + name +'. How are you?');
		}

		row.restore();
	}
})(window.jQuery);
