'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// React + ES6
// (I guess you can make these better than me!)

// # TL;TR
//
// - Create instance at `component.componentDidMount()`.
// - Destroy instance at `component.componentWillUnmount()`.
//
// ```
// componentDidMount() {
// 	var swoosh = new UISwipe({ el:this.refs.el, buttons:this._rowButtons });
// 	swoosh.on('clickbutton', this.onClick.bind(this));
// 	this.swoosh = swoosh;
// }
//
// componentWillUnmount() {
// 	this.swoosh.destroy({ removeDom:false });
// }
// ```

(function (React, ReactDOM) {
	var itemDataList = undefined;
	var idCount = undefined;
	var itemList = undefined;

	// ----------------------------------------------------------------
	// Define classes

	/**
  * A component which has multi rows of <Item>.
  * @class
  */

	var ItemList = function (_React$Component) {
		_inherits(ItemList, _React$Component);

		/**
   * The constructor.
   */

		function ItemList() {
			_classCallCheck(this, ItemList);

			var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ItemList).call(this));

			_this.state = {
				items: []
			};
			return _this;
		}

		/**
   * Render elements, including child rows.
   */

		_createClass(ItemList, [{
			key: 'render',
			value: function render() {
				var onChangeItemTitle = this.props.onChangeItemTitle;
				var onDeleteItem = this.props.onDeleteItem;

				// build child rows
				var rows = this.state.items.map(function (item) {
					return React.createElement(Item, { key: item.id, id: item.id, title: item.title, subtitle: item.subtitle,
						onChangeTitle: onChangeItemTitle,
						onDelete: onDeleteItem
					});
				});

				return React.createElement('tbody', null, rows);
			}
		}]);

		return ItemList;
	}(React.Component);

	/**
  * Belongs to <ItemList>.
  */

	var Item = function (_React$Component2) {
		_inherits(Item, _React$Component2);

		/**
   * The constructor.
   */

		function Item() {
			_classCallCheck(this, Item);

			var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(Item).call(this));

			_this2._rowButtons = [{ key: 'edit', label: 'Edit' }, { key: 'delete', label: 'Delete' }];
			return _this2;
		}

		/**
   * Render this elements.
   */

		_createClass(Item, [{
			key: 'render',
			value: function render() {
				return React.createElement('tr', { className: 'ui-swooshTable-row', ref: 'el' }, React.createElement('td', { className: 'ui-swooshTable-cell ui-swooshTable-cell-title' }, this.props.title), React.createElement('td', { className: 'ui-swooshTable-cell ui-swooshTable-cell-subtitle' }, this.props.subtitle));
			}

			/**
    * Restore the "swoosh"ed ros's position.
    */

		}, {
			key: 'restoreRowPosition',
			value: function restoreRowPosition() {
				this.swoosh.restore();
			}

			/**
    * Edit row's title.
    * @param {number} id
    */

		}, {
			key: 'edit',
			value: function edit(id) {
				var title = this.props.title;
				var newTitle = window.prompt('Input new title.', title);
				if (newTitle) {
					this.props.onChangeTitle({ id: id, title: newTitle });
				}
				this.restoreRowPosition();
			}

			/**
    * Delete the row.
    * @param {number} id
    * @see #doDelete
    */

		}, {
			key: 'delete',
			value: function _delete(id) {
				if (window.confirm('Are you sure to DELETE?')) {
					this.doDelete({ id: id });
				} else {
					this.restoreRowPosition();
				}
			}

			/**
    * Do delete.
    * @param {Object} data
    * @see #delete
    */

		}, {
			key: 'doDelete',
			value: function doDelete(data) {
				var _this3 = this;

				var swoosh = this.swoosh;
				this.restoreRowPosition();
				swoosh.$el.slideUp(function () {
					_this3.props.onDelete(data);
				});
			}

			/**
    * Called when the component's dom is appended to the page.
    */

		}, {
			key: 'componentDidMount',
			value: function componentDidMount() {
				var swoosh = new UISwipe({ el: this.refs.el, buttons: this._rowButtons });
				swoosh.on('clickbutton', this.onClick.bind(this));
				this.swoosh = swoosh;
			}

			/**
    * Called before the component's dom is going to be removed from the page.
    */

		}, {
			key: 'componentWillUnmount',
			value: function componentWillUnmount() {
				this.swoosh.destroy({ removeDom: false });
			}

			/**
    * Called when any button of SwooshTable is clicked.
    * @see #componentDidMount
    */

		}, {
			key: 'onClick',
			value: function onClick(event, data) {
				var id = this.props.id;

				// do something according to which button the user clicked
				var key = data.key;
				if (key === 'delete') {
					this.delete(id);
				} else if (key === 'edit') {
					this.edit(id);
				}
			}
		}]);

		return Item;
	}(React.Component);

	/**
  * A form to add an item to the list.
  * @class
  */

	var Form = function (_React$Component3) {
		_inherits(Form, _React$Component3);

		function Form() {
			_classCallCheck(this, Form);

			return _possibleConstructorReturn(this, Object.getPrototypeOf(Form).apply(this, arguments));
		}

		_createClass(Form, [{
			key: 'render',
			value: function render() {
				return React.createElement('button', { onClick: this.props.onClick }, 'Add A Row');
			}
		}]);

		return Form;
	}(React.Component);

	// ----------------------------------------------------------------
	// Controlling functions

	function start() {
		// get data, which is defined in HTML
		itemDataList = JSON.parse(document.querySelector('#json-items').text);
		idCount = itemDataList.length;

		// create IDs for each item data
		itemDataList.forEach(function (item) {
			return item.id = Math.random();
		});

		// the list component
		itemList = ReactDOM.render(React.createElement(ItemList, { onChangeItemTitle: onChangeItemTitle, onDeleteItem: onDeleteItem }), document.querySelector('.js-table'));
		itemList.setState({ items: itemDataList });

		// form component to add an item
		ReactDOM.render(React.createElement(Form, { onClick: onClickAdd }), document.querySelector('.js-form'));
	}

	/**
  * Called when the title is changed at <Item>.
  * @param {Object} data
  * @param {number} data.id
  * @param {string} data.title
  */
	function onChangeItemTitle(data) {
		// update the item's data
		var item = itemDataList.find(function (o) {
			return o.id === data.id;
		});
		item.title = data.title;

		// update this component's state
		itemList.setState({ items: itemDataList });
	}

	/**
  * Called when an user decided to delete an <Item>.
  * @param {Object} data
  * @param {number} data.id
  */
	function onDeleteItem(data) {
		// remove the item from the array
		var index = itemDataList.indexOf(itemDataList.find(function (o) {
			return o.id === data.id;
		}));
		var afters = itemDataList.splice(index);
		itemDataList = itemDataList.concat(afters.slice(1));

		// update this component's state
		itemList.setState({ items: itemDataList });
	}

	/**
  * Called when the user clicked "Add A Row".
  * @param {Event} event
  */
	function onClickAdd(event) {
		// add a new data to the array
		itemDataList.push({
			id: Math.random(),
			title: 'Fox ' + ++idCount,
			subtitle: 'The quick brown fox jumps over the lazy dog'
		});

		// update the component's state
		itemList.setState({ data: itemDataList });
	}

	// Let's rock!
	start();
})(window.React, window.ReactDOM);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlYWN0LWV4YW1wbGUucmVhY3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBb0JBLENBQUMsVUFBUyxLQUFLLEVBQUUsUUFBUSxFQUFFO0FBQzFCLEtBQUksWUFBWSxZQUFBLENBQUM7QUFDakIsS0FBSSxPQUFPLFlBQUEsQ0FBQztBQUNaLEtBQUksUUFBUSxZQUFBOzs7Ozs7Ozs7QUFBQTtLQVNOLFFBQVE7WUFBUixRQUFROzs7Ozs7QUFJYixXQUpLLFFBQVEsR0FJQzt5QkFKVCxRQUFROztzRUFBUixRQUFROztBQU1aLFNBQUssS0FBSyxHQUFHO0FBQ1osU0FBSyxFQUFFLEVBQUU7SUFDVCxDQUFDOztHQUNGOzs7OztBQUFBO2VBVEksUUFBUTs7NEJBY0o7QUFDUixRQUFJLGlCQUFpQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUM7QUFDckQsUUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZOzs7QUFBQSxBQUFDLFFBR3ZDLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBQSxJQUFLLEVBQUc7QUFDdkMsWUFBTyxLQUFBLENBQUEsYUFBQSxDQUFDLElBQUksRUFBQSxFQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtBQUNqRixtQkFBYSxFQUFFLGlCQUFpQjtBQUNoQyxjQUFRLEVBQUUsWUFBWTtNQUN0QixDQUFDLENBQUE7S0FDRixDQUFDLENBQUM7O0FBRUgsV0FBTyxLQUFBLENBQUEsYUFBQSxDQUNOLE9BQU8sRUFDUCxJQUFJLEVBRlUsSUFBSSxDQUFTLENBQUM7SUFDN0I7OztTQTNCSSxRQUFRO0dBQVMsS0FBSyxDQUFDLFNBQVM7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RCxDQUFDOzs7QUFBQSxBQUFDLFVBR0ssQ0FBQyxRQUFRLENBQUMsRUFBRSxJQUFJLEVBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztFQUN6Qzs7O0FBQUEsTUFHSSxFQUFFLENBQUM7Q0FDUixDQUFBLENBQUUsTUFBTSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMiLCJmaWxlIjoicmVhY3QtZXhhbXBsZS5yZWFjdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIFJlYWN0ICsgRVM2XG4vLyAoSSBndWVzcyB5b3UgY2FuIG1ha2UgdGhlc2UgYmV0dGVyIHRoYW4gbWUhKVxuXG4vLyAjIFRMO1RSXG4vL1xuLy8gLSBDcmVhdGUgaW5zdGFuY2UgYXQgYGNvbXBvbmVudC5jb21wb25lbnREaWRNb3VudCgpYC5cbi8vIC0gRGVzdHJveSBpbnN0YW5jZSBhdCBgY29tcG9uZW50LmNvbXBvbmVudFdpbGxVbm1vdW50KClgLlxuLy9cbi8vIGBgYFxuLy8gY29tcG9uZW50RGlkTW91bnQoKSB7XG4vLyBcdHZhciBzd29vc2ggPSBuZXcgVUlTd2lwZSh7IGVsOnRoaXMucmVmcy5lbCwgYnV0dG9uczp0aGlzLl9yb3dCdXR0b25zIH0pO1xuLy8gXHRzd29vc2gub24oJ2NsaWNrYnV0dG9uJywgdGhpcy5vbkNsaWNrLmJpbmQodGhpcykpO1xuLy8gXHR0aGlzLnN3b29zaCA9IHN3b29zaDtcbi8vIH1cbi8vXG4vLyBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbi8vIFx0dGhpcy5zd29vc2guZGVzdHJveSh7IHJlbW92ZURvbTpmYWxzZSB9KTtcbi8vIH1cbi8vIGBgYFxuXG4oZnVuY3Rpb24oUmVhY3QsIFJlYWN0RE9NKSB7XG5cdGxldCBpdGVtRGF0YUxpc3Q7XG5cdGxldCBpZENvdW50O1xuXHRsZXQgaXRlbUxpc3Q7XG5cblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQvLyBEZWZpbmUgY2xhc3Nlc1xuXG5cdC8qKlxuXHQgKiBBIGNvbXBvbmVudCB3aGljaCBoYXMgbXVsdGkgcm93cyBvZiA8SXRlbT4uXG5cdCAqIEBjbGFzc1xuXHQgKi9cblx0Y2xhc3MgSXRlbUxpc3QgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRcdC8qKlxuXHRcdCAqIFRoZSBjb25zdHJ1Y3Rvci5cblx0XHQgKi9cblx0XHRjb25zdHJ1Y3RvcigpIHtcblx0XHRcdHN1cGVyKCk7XG5cdFx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0XHRpdGVtczogW11cblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogUmVuZGVyIGVsZW1lbnRzLCBpbmNsdWRpbmcgY2hpbGQgcm93cy5cblx0XHQgKi9cblx0XHRyZW5kZXIoKSB7XG5cdFx0XHRsZXQgb25DaGFuZ2VJdGVtVGl0bGUgPSB0aGlzLnByb3BzLm9uQ2hhbmdlSXRlbVRpdGxlO1xuXHRcdFx0bGV0IG9uRGVsZXRlSXRlbSA9IHRoaXMucHJvcHMub25EZWxldGVJdGVtO1xuXG5cdFx0XHQvLyBidWlsZCBjaGlsZCByb3dzXG5cdFx0XHRsZXQgcm93cyA9IHRoaXMuc3RhdGUuaXRlbXMubWFwKChpdGVtKT0+e1xuXHRcdFx0XHRyZXR1cm4gPEl0ZW0ga2V5PXtpdGVtLmlkfSBpZD17aXRlbS5pZH0gdGl0bGU9e2l0ZW0udGl0bGV9IHN1YnRpdGxlPXtpdGVtLnN1YnRpdGxlfVxuXHRcdFx0XHRcdG9uQ2hhbmdlVGl0bGU9e29uQ2hhbmdlSXRlbVRpdGxlfVxuXHRcdFx0XHRcdG9uRGVsZXRlPXtvbkRlbGV0ZUl0ZW19XG5cdFx0XHRcdC8+XG5cdFx0XHR9KTtcblxuXHRcdFx0cmV0dXJuIDx0Ym9keT57cm93c308L3Rib2R5Pjtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogQmVsb25ncyB0byA8SXRlbUxpc3Q+LlxuXHQgKi9cblx0Y2xhc3MgSXRlbSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdFx0LyoqXG5cdFx0ICogVGhlIGNvbnN0cnVjdG9yLlxuXHRcdCAqL1xuXHRcdGNvbnN0cnVjdG9yKCkge1xuXHRcdFx0c3VwZXIoKTtcblx0XHRcdHRoaXMuX3Jvd0J1dHRvbnMgPSBbXG5cdFx0XHRcdHsga2V5OidlZGl0JywgbGFiZWw6J0VkaXQnIH0sXG5cdFx0XHRcdHsga2V5OidkZWxldGUnLCBsYWJlbDonRGVsZXRlJyB9XG5cdFx0XHRdO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFJlbmRlciB0aGlzIGVsZW1lbnRzLlxuXHRcdCAqL1xuXHRcdHJlbmRlcigpIHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDx0ciBjbGFzc05hbWU9XCJ1aS1zd29vc2hUYWJsZS1yb3dcIiByZWY9XCJlbFwiPlxuXHRcdFx0XHRcdDx0ZCBjbGFzc05hbWU9XCJ1aS1zd29vc2hUYWJsZS1jZWxsIHVpLXN3b29zaFRhYmxlLWNlbGwtdGl0bGVcIj57dGhpcy5wcm9wcy50aXRsZX08L3RkPlxuXHRcdFx0XHRcdDx0ZCBjbGFzc05hbWU9XCJ1aS1zd29vc2hUYWJsZS1jZWxsIHVpLXN3b29zaFRhYmxlLWNlbGwtc3VidGl0bGVcIj57dGhpcy5wcm9wcy5zdWJ0aXRsZX08L3RkPlxuXHRcdFx0XHQ8L3RyPlxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBSZXN0b3JlIHRoZSBcInN3b29zaFwiZWQgcm9zJ3MgcG9zaXRpb24uXG5cdFx0ICovXG5cdFx0cmVzdG9yZVJvd1Bvc2l0aW9uKCkge1xuXHRcdFx0dGhpcy5zd29vc2gucmVzdG9yZSgpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEVkaXQgcm93J3MgdGl0bGUuXG5cdFx0ICogQHBhcmFtIHtudW1iZXJ9IGlkXG5cdFx0ICovXG5cdFx0ZWRpdChpZCkge1xuXHRcdFx0bGV0IHRpdGxlID0gdGhpcy5wcm9wcy50aXRsZTtcblx0XHRcdGxldCBuZXdUaXRsZSA9IHdpbmRvdy5wcm9tcHQoJ0lucHV0IG5ldyB0aXRsZS4nLCB0aXRsZSk7XG5cdFx0XHRpZiAobmV3VGl0bGUpIHtcblx0XHRcdFx0dGhpcy5wcm9wcy5vbkNoYW5nZVRpdGxlKHsgaWQ6aWQsIHRpdGxlOm5ld1RpdGxlIH0pO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5yZXN0b3JlUm93UG9zaXRpb24oKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBEZWxldGUgdGhlIHJvdy5cblx0XHQgKiBAcGFyYW0ge251bWJlcn0gaWRcblx0XHQgKiBAc2VlICNkb0RlbGV0ZVxuXHRcdCAqL1xuXHRcdGRlbGV0ZShpZCkge1xuXHRcdFx0aWYgKHdpbmRvdy5jb25maXJtKCdBcmUgeW91IHN1cmUgdG8gREVMRVRFPycpKSB7XG5cdFx0XHRcdHRoaXMuZG9EZWxldGUoeyBpZDppZCB9KTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHR0aGlzLnJlc3RvcmVSb3dQb3NpdGlvbigpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIERvIGRlbGV0ZS5cblx0XHQgKiBAcGFyYW0ge09iamVjdH0gZGF0YVxuXHRcdCAqIEBzZWUgI2RlbGV0ZVxuXHRcdCAqL1xuXHRcdGRvRGVsZXRlKGRhdGEpIHtcblx0XHRcdGxldCBzd29vc2ggPSB0aGlzLnN3b29zaDtcblx0XHRcdHRoaXMucmVzdG9yZVJvd1Bvc2l0aW9uKCk7XG5cdFx0XHRzd29vc2guJGVsLnNsaWRlVXAoKCk9Pntcblx0XHRcdFx0dGhpcy5wcm9wcy5vbkRlbGV0ZShkYXRhKTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIENhbGxlZCB3aGVuIHRoZSBjb21wb25lbnQncyBkb20gaXMgYXBwZW5kZWQgdG8gdGhlIHBhZ2UuXG5cdFx0ICovXG5cdFx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0XHR2YXIgc3dvb3NoID0gbmV3IFVJU3dpcGUoeyBlbDp0aGlzLnJlZnMuZWwsIGJ1dHRvbnM6dGhpcy5fcm93QnV0dG9ucyB9KTtcblx0XHRcdHN3b29zaC5vbignY2xpY2tidXR0b24nLCB0aGlzLm9uQ2xpY2suYmluZCh0aGlzKSk7XG5cdFx0XHR0aGlzLnN3b29zaCA9IHN3b29zaDtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBDYWxsZWQgYmVmb3JlIHRoZSBjb21wb25lbnQncyBkb20gaXMgZ29pbmcgdG8gYmUgcmVtb3ZlZCBmcm9tIHRoZSBwYWdlLlxuXHRcdCAqL1xuXHRcdGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuXHRcdFx0dGhpcy5zd29vc2guZGVzdHJveSh7IHJlbW92ZURvbTpmYWxzZSB9KTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBDYWxsZWQgd2hlbiBhbnkgYnV0dG9uIG9mIFN3b29zaFRhYmxlIGlzIGNsaWNrZWQuXG5cdFx0ICogQHNlZSAjY29tcG9uZW50RGlkTW91bnRcblx0XHQgKi9cblx0XHRvbkNsaWNrKGV2ZW50LCBkYXRhKSB7XG5cdFx0XHRsZXQgaWQgPSB0aGlzLnByb3BzLmlkO1xuXG5cdFx0XHQvLyBkbyBzb21ldGhpbmcgYWNjb3JkaW5nIHRvIHdoaWNoIGJ1dHRvbiB0aGUgdXNlciBjbGlja2VkXG5cdFx0XHRsZXQga2V5ID0gZGF0YS5rZXk7XG5cdFx0XHRpZiAoa2V5ID09PSAnZGVsZXRlJykge1xuXHRcdFx0XHR0aGlzLmRlbGV0ZShpZCk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChrZXkgPT09ICdlZGl0Jykge1xuXHRcdFx0XHR0aGlzLmVkaXQoaWQpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBBIGZvcm0gdG8gYWRkIGFuIGl0ZW0gdG8gdGhlIGxpc3QuXG5cdCAqIEBjbGFzc1xuXHQgKi9cblx0Y2xhc3MgRm9ybSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdFx0cmVuZGVyKCkge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PGJ1dHRvbiBvbkNsaWNrPXt0aGlzLnByb3BzLm9uQ2xpY2t9PkFkZCBBIFJvdzwvYnV0dG9uPlxuXHRcdFx0KTtcblx0XHR9XG5cdH1cblxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdC8vIENvbnRyb2xsaW5nIGZ1bmN0aW9uc1xuXG5cdGZ1bmN0aW9uIHN0YXJ0KCkge1xuXHRcdC8vIGdldCBkYXRhLCB3aGljaCBpcyBkZWZpbmVkIGluIEhUTUxcblx0XHRpdGVtRGF0YUxpc3QgPSBKU09OLnBhcnNlKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNqc29uLWl0ZW1zJykudGV4dCk7XG5cdFx0aWRDb3VudCA9IGl0ZW1EYXRhTGlzdC5sZW5ndGg7XG5cblx0XHQvLyBjcmVhdGUgSURzIGZvciBlYWNoIGl0ZW0gZGF0YVxuXHRcdGl0ZW1EYXRhTGlzdC5mb3JFYWNoKChpdGVtKT0+aXRlbS5pZD1NYXRoLnJhbmRvbSgpKTtcblxuXHRcdC8vIHRoZSBsaXN0IGNvbXBvbmVudFxuXHRcdGl0ZW1MaXN0ID0gUmVhY3RET00ucmVuZGVyKFxuXHRcdFx0PEl0ZW1MaXN0IG9uQ2hhbmdlSXRlbVRpdGxlPXtvbkNoYW5nZUl0ZW1UaXRsZX0gb25EZWxldGVJdGVtPXtvbkRlbGV0ZUl0ZW19IC8+LFxuXHRcdFx0ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLXRhYmxlJylcblx0XHQpO1xuXHRcdGl0ZW1MaXN0LnNldFN0YXRlKHsgaXRlbXM6aXRlbURhdGFMaXN0IH0pO1xuXG5cdFx0Ly8gZm9ybSBjb21wb25lbnQgdG8gYWRkIGFuIGl0ZW1cblx0XHRSZWFjdERPTS5yZW5kZXIoXG5cdFx0XHQ8Rm9ybSBvbkNsaWNrPXtvbkNsaWNrQWRkfSAvPixcblx0XHRcdGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1mb3JtJylcblx0XHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENhbGxlZCB3aGVuIHRoZSB0aXRsZSBpcyBjaGFuZ2VkIGF0IDxJdGVtPi5cblx0ICogQHBhcmFtIHtPYmplY3R9IGRhdGFcblx0ICogQHBhcmFtIHtudW1iZXJ9IGRhdGEuaWRcblx0ICogQHBhcmFtIHtzdHJpbmd9IGRhdGEudGl0bGVcblx0ICovXG5cdGZ1bmN0aW9uIG9uQ2hhbmdlSXRlbVRpdGxlKGRhdGEpIHtcblx0XHQvLyB1cGRhdGUgdGhlIGl0ZW0ncyBkYXRhXG5cdFx0bGV0IGl0ZW0gPSBpdGVtRGF0YUxpc3QuZmluZCgobyk9Pm8uaWQ9PT1kYXRhLmlkKTtcblx0XHRpdGVtLnRpdGxlID0gZGF0YS50aXRsZTtcblxuXHRcdC8vIHVwZGF0ZSB0aGlzIGNvbXBvbmVudCdzIHN0YXRlXG5cdFx0aXRlbUxpc3Quc2V0U3RhdGUoeyBpdGVtczppdGVtRGF0YUxpc3QgfSk7XG5cdH1cblxuXHQvKipcblx0ICogQ2FsbGVkIHdoZW4gYW4gdXNlciBkZWNpZGVkIHRvIGRlbGV0ZSBhbiA8SXRlbT4uXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBkYXRhLmlkXG5cdCAqL1xuXHRmdW5jdGlvbiBvbkRlbGV0ZUl0ZW0oZGF0YSkge1xuXHRcdC8vIHJlbW92ZSB0aGUgaXRlbSBmcm9tIHRoZSBhcnJheVxuXHRcdGxldCBpbmRleCA9IGl0ZW1EYXRhTGlzdC5pbmRleE9mKGl0ZW1EYXRhTGlzdC5maW5kKChvKT0+by5pZD09PWRhdGEuaWQpKTtcblx0XHRsZXQgYWZ0ZXJzID0gaXRlbURhdGFMaXN0LnNwbGljZShpbmRleCk7XG5cdFx0aXRlbURhdGFMaXN0ID0gaXRlbURhdGFMaXN0LmNvbmNhdChhZnRlcnMuc2xpY2UoMSkpO1xuXG5cdFx0Ly8gdXBkYXRlIHRoaXMgY29tcG9uZW50J3Mgc3RhdGVcblx0XHRpdGVtTGlzdC5zZXRTdGF0ZSh7IGl0ZW1zOml0ZW1EYXRhTGlzdCB9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDYWxsZWQgd2hlbiB0aGUgdXNlciBjbGlja2VkIFwiQWRkIEEgUm93XCIuXG5cdCAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG5cdCAqL1xuXHRmdW5jdGlvbiBvbkNsaWNrQWRkKGV2ZW50KSB7XG5cdFx0Ly8gYWRkIGEgbmV3IGRhdGEgdG8gdGhlIGFycmF5XG5cdFx0aXRlbURhdGFMaXN0LnB1c2goe1xuXHRcdFx0aWQ6IE1hdGgucmFuZG9tKCksXG5cdFx0XHR0aXRsZTogJ0ZveCAnICsgKytpZENvdW50LFxuXHRcdFx0c3VidGl0bGU6ICdUaGUgcXVpY2sgYnJvd24gZm94IGp1bXBzIG92ZXIgdGhlIGxhenkgZG9nJ1xuXHRcdH0pO1xuXG5cdFx0Ly8gdXBkYXRlIHRoZSBjb21wb25lbnQncyBzdGF0ZVxuXHRcdGl0ZW1MaXN0LnNldFN0YXRlKHsgZGF0YTppdGVtRGF0YUxpc3QgfSk7XG5cdH1cblxuXHQvLyBMZXQncyByb2NrIVxuXHRzdGFydCgpO1xufSkod2luZG93LlJlYWN0LCB3aW5kb3cuUmVhY3RET00pO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
