'use strict';

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
(function ($) {
	var $list = $('.js-basicExample > tbody');
	var $rows = $list.children();
	var rowCount = $rows.length;

	// ----------------------------------------------------------------
	// manage existing rows
	$rows.each(function (i, el) {
		apply(el);
	});

	function apply(el) {
		var row = new UISwipe({ el: el });
		row.on('clickbutton', onclickDevare.bind(null, row));
	}

	function onclickDevare(row) {
		console.log(row.$el.find('td:first').text(), 'has been deleted.');

		// Restore the row to original position
		row.restore();

		// Remove the row
		row.$el.slideUp(function () {
			row.destroy();
		});
	}

	// ----------------------------------------------------------------
	// add a new row
	$('.js-basicExample-add').on('click', function (event) {
		// build a row element
		var $row = $(templateRow({ count: ++rowCount }));

		// append the row into the document
		$list.append($row);

		// apply SwooshTable
		apply($row[0]);
	});

	function templateRow(data) {
		var html = '<tr class="ui-swooshTable-row">' + '<td class="ui-swooshTable-cell ui-swooshTable-cell-title">Fox ' + data.count + '</td>' + '<td class="ui-swooshTable-cell ui-swooshTable-cell-subtitle">The quick brown fox jumps over the lazy dog</td>' + '</tr>';

		return html;
	}
})(window.jQuery);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJhc2ljLWV4YW1wbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBYUEsQ0FBQyxVQUFTLENBQUMsRUFBRTtBQUNaLEtBQUksS0FBSyxHQUFHLENBQUMsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0FBQzFDLEtBQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUM3QixLQUFJLFFBQVEsR0FBRyxLQUFLLENBQUMsTUFBTTs7OztBQUFDLEFBSTVCLE1BQUssQ0FBQyxJQUFJLENBQUMsVUFBUyxDQUFDLEVBQUMsRUFBRSxFQUFDO0FBQ3hCLE9BQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztFQUNWLENBQUMsQ0FBQzs7QUFFSCxVQUFTLEtBQUssQ0FBQyxFQUFFLEVBQUU7QUFDbEIsTUFBSSxHQUFHLEdBQUcsSUFBSSxPQUFPLENBQUMsRUFBRSxFQUFFLEVBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUNqQyxLQUFHLENBQUMsRUFBRSxDQUFDLGFBQWEsRUFBRSxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0VBQ3JEOztBQUVELFVBQVMsYUFBYSxDQUFDLEdBQUcsRUFBRTtBQUMzQixTQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLG1CQUFtQixDQUFDOzs7QUFBQyxBQUdsRSxLQUFHLENBQUMsT0FBTyxFQUFFOzs7QUFBQyxBQUdkLEtBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFlBQVU7QUFDekIsTUFBRyxDQUFDLE9BQU8sRUFBRSxDQUFDO0dBQ2QsQ0FBQyxDQUFDO0VBQ0g7Ozs7QUFBQSxBQUlELEVBQUMsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsVUFBUyxLQUFLLEVBQUM7O0FBRXBELE1BQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxXQUFXLENBQUMsRUFBRSxLQUFLLEVBQUMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDOzs7QUFBQyxBQUdoRCxPQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQzs7O0FBQUMsQUFHbkIsT0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ2YsQ0FBQyxDQUFDOztBQUVILFVBQVMsV0FBVyxDQUFDLElBQUksRUFBRTtBQUMxQixNQUFJLElBQUksR0FDUCxpQ0FBaUMsR0FDaEMsZ0VBQWdFLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxPQUFPLEdBQ3ZGLCtHQUErRyxHQUNoSCxPQUFPLENBQUM7O0FBRVQsU0FBTyxJQUFJLENBQUM7RUFDWjtDQUNELENBQUEsQ0FBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMiLCJmaWxlIjoiYmFzaWMtZXhhbXBsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogIyBCYXNpYyBFeGFtcGxlXG4gKlxuICogVGhpcyBleGFtcGxlIHNob3dzIHVzYWdlIGZvciBmb2xsb3dpbmcgZmVhdHVyZXMgYW5kIEFQSXM6XG4gKlxuICogLSBBcHBseSBTd29vc2hUYWJsZSB0byBleGlzdGluZyByb3dzXG4gKiAgIC0gYHJvdyA9IFVJU3dpcGUoeyBlbCB9KWBcbiAqIC0gQ29uc3RydWN0IG5ldyByb3dzLCBhcHBlbmQgaXQgaW50byB0aGUgZG9jdW1lbnQgYW5kIGFwcGx5IFN3b29zaFRhYmxlXG4gKiAtIERlbGV0ZSByb3dzIHdpdGggYW5pbWF0aW9uXG4gKiAgIC0gYHJvdy5vbihcImNsaWNrYnV0dG9uXCIsIGxpc3RlbmVyKWBcbiAqICAgLSBgcm93LnJlc3RvcmUoKWBcbiAqICAgLSBgcm93LmRlc3Ryb3koKWBcbiAqL1xuKGZ1bmN0aW9uKCQpIHtcblx0dmFyICRsaXN0ID0gJCgnLmpzLWJhc2ljRXhhbXBsZSA+IHRib2R5Jyk7XG5cdHZhciAkcm93cyA9ICRsaXN0LmNoaWxkcmVuKCk7XG5cdHZhciByb3dDb3VudCA9ICRyb3dzLmxlbmd0aDtcblxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdC8vIG1hbmFnZSBleGlzdGluZyByb3dzXG5cdCRyb3dzLmVhY2goZnVuY3Rpb24oaSxlbCl7XG5cdFx0YXBwbHkoZWwpO1xuXHR9KTtcblxuXHRmdW5jdGlvbiBhcHBseShlbCkge1xuXHRcdHZhciByb3cgPSBuZXcgVUlTd2lwZSh7IGVsOmVsIH0pO1xuXHRcdHJvdy5vbignY2xpY2tidXR0b24nLCBvbmNsaWNrRGV2YXJlLmJpbmQobnVsbCwgcm93KSk7XG5cdH1cblxuXHRmdW5jdGlvbiBvbmNsaWNrRGV2YXJlKHJvdykge1xuXHRcdGNvbnNvbGUubG9nKHJvdy4kZWwuZmluZCgndGQ6Zmlyc3QnKS50ZXh0KCksICdoYXMgYmVlbiBkZWxldGVkLicpO1xuXG5cdFx0Ly8gUmVzdG9yZSB0aGUgcm93IHRvIG9yaWdpbmFsIHBvc2l0aW9uXG5cdFx0cm93LnJlc3RvcmUoKTtcblxuXHRcdC8vIFJlbW92ZSB0aGUgcm93XG5cdFx0cm93LiRlbC5zbGlkZVVwKGZ1bmN0aW9uKCl7XG5cdFx0XHRyb3cuZGVzdHJveSgpO1xuXHRcdH0pO1xuXHR9XG5cblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQvLyBhZGQgYSBuZXcgcm93XG5cdCQoJy5qcy1iYXNpY0V4YW1wbGUtYWRkJykub24oJ2NsaWNrJywgZnVuY3Rpb24oZXZlbnQpe1xuXHRcdC8vIGJ1aWxkIGEgcm93IGVsZW1lbnRcblx0XHR2YXIgJHJvdyA9ICQodGVtcGxhdGVSb3coeyBjb3VudDorK3Jvd0NvdW50IH0pKTtcblxuXHRcdC8vIGFwcGVuZCB0aGUgcm93IGludG8gdGhlIGRvY3VtZW50XG5cdFx0JGxpc3QuYXBwZW5kKCRyb3cpO1xuXG5cdFx0Ly8gYXBwbHkgU3dvb3NoVGFibGVcblx0XHRhcHBseSgkcm93WzBdKTtcblx0fSk7XG5cblx0ZnVuY3Rpb24gdGVtcGxhdGVSb3coZGF0YSkge1xuXHRcdHZhciBodG1sID1cblx0XHRcdCc8dHIgY2xhc3M9XCJ1aS1zd29vc2hUYWJsZS1yb3dcIj4nICtcblx0XHRcdFx0Jzx0ZCBjbGFzcz1cInVpLXN3b29zaFRhYmxlLWNlbGwgdWktc3dvb3NoVGFibGUtY2VsbC10aXRsZVwiPkZveCAnICsgZGF0YS5jb3VudCArICc8L3RkPicgK1xuXHRcdFx0XHQnPHRkIGNsYXNzPVwidWktc3dvb3NoVGFibGUtY2VsbCB1aS1zd29vc2hUYWJsZS1jZWxsLXN1YnRpdGxlXCI+VGhlIHF1aWNrIGJyb3duIGZveCBqdW1wcyBvdmVyIHRoZSBsYXp5IGRvZzwvdGQ+JyArXG5cdFx0XHQnPC90cj4nO1xuXG5cdFx0cmV0dXJuIGh0bWw7XG5cdH1cbn0pKHdpbmRvdy5qUXVlcnkpO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
