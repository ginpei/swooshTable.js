// React + ES6
// (I guess you can make these better than me!)
(function(React, ReactDOM) {
	let itemDataList;
	let rowCount;
	let itemList;

	// ----------------------------------------------------------------
	// Define classes

	/**
	 * A component which has multi rows of <Item>.
	 * @class
	 */
	class ItemList extends React.Component {
		/**
		 * The constructor.
		 */
		constructor() {
			super();
			this.state = {
				items: []
			};
		}

		/**
		 * Render elements, including child rows.
		 */
		render() {
			let onChangeItemTitle = this.onChangeItemTitle.bind(this);
			let onDeleteItem = this.onDeleteItem.bind(this);

			// build child rows
			let rows = this.state.items.map(function(item, index) {
				return <Item key={item.id} id={item.id} title={item.title} subtitle={item.subtitle}
					onChangeTitle={onChangeItemTitle}
					onDelete={onDeleteItem}
				/>
			});

			return <tbody>{rows}</tbody>;
		}

		/**
		 * Called when the title is changed at <Item>.
		 * @param {Object} data
		 * @param {number} data.index Where the data is aligned on the array.
		 * @param {string} data.title
		 */
		onChangeItemTitle(data) {
			// update the item's data
			itemDataList[data.index].title = data.title;

			// update this component's state
			this.setState({ items:itemDataList });
		}

		/**
		 * Called when an user decided to delete an <Item>.
		 * @param {Object} data
		 * @param {number} data.index Where the data is aligned on the array.
		 */
		onDeleteItem(data) {
			// remove the item from the array
			let afters = itemDataList.splice(data.index);
			let l2 = itemDataList.concat(afters.slice(1));
			itemDataList = l2;

			// update this component's state
			this.setState({ items:itemDataList });
		}
	}

	/**
	 * Belongs to <ItemList>.
	 */
	class Item extends React.Component {
		/**
		 * The constructor.
		 */
		constructor() {
			super();
			this._rowButtons = [
				{ key:'edit', label:'Edit' },
				{ key:'delete', label:'Delete' }
			];
		}

		/**
		 * Render this elements.
		 */
		render() {
			return (
				<tr className="ui-swooshTable-row" ref="el">
					<td className="ui-swooshTable-cell ui-swooshTable-cell-title">{this.props.title}</td>
					<td className="ui-swooshTable-cell ui-swooshTable-cell-subtitle">{this.props.subtitle}</td>
				</tr>
			);
		}

		/**
		 * Restore the "swoosh"ed ros's position.
		 */
		restoreRowPosition() {
			this.swoosh.restore();
		}

		/**
		 * Edit row's title.
		 * @param {number} index Where the data is aligned on the array.
		 */
		edit(index) {
			let title = this.props.title;
			let newTitle = window.prompt('Input new title.', title);
			if (newTitle) {
				this.props.onChangeTitle({ index:index, title:newTitle });
			}
			this.restoreRowPosition();
		}

		/**
		 * Delete the row.
		 * @param {number} index Where the data is aligned on the array.
		 * @see #doDelete
		 */
		delete(index) {
			if (window.confirm('Are you sure to DELETE?')) {
				this.doDelete(index);
			}
			else {
				this.restoreRowPosition();
			}
		}

		/**
		 * Do delete.
		 * @param {number} index Where the data is aligned on the array.
		 * @see #delete
		 */
		doDelete(index) {
			let swoosh = this.swoosh;
			this.restoreRowPosition();
			swoosh.$el.slideUp(function(){
				this.props.onDelete({ index:index });
			}.bind(this));
		}

		/**
		 * Called when the component's dom is appended to the page.
		 */
		componentDidMount() {
			var swoosh = new UISwipe({ el:this.refs.el, buttons:this._rowButtons });
			swoosh.on('clickbutton', this.onClick.bind(this));
			this.swoosh = swoosh;
		}

		/**
		 * Called before the component's dom is going to be removed from the page.
		 */
		componentWillUnmount() {
			this.swoosh.destroy({ removeDom:false });
		}

		/**
		 * Called when any button of SwooshTable is clicked.
		 * @see #componentDidMount
		 */
		onClick(event, data) {
			// find where the data is aligned on the array.
			let id = this.props.id;
			let index = itemDataList.indexOf(itemDataList.find((item)=>item.id===id));

			// do something according to which button the user clicked
			let key = data.key;
			if (key === 'delete') {
				this.delete(index);
			}
			else if (key === 'edit') {
				this.edit(index);
			}
		}
	}

	/**
	 * A form to add an item to the list.
	 * @class
	 */
	class Form extends React.Component {
		render() {
			return (
				<button onClick={this.onClick.bind(this)}>Add A Row</button>
			);
		}

		onClick() {
			// add a new data to the array
			itemDataList.push({
				id: Math.random(),
				title: 'Fox ' + ++rowCount,
				subtitle: 'The quick brown fox jumps over the lazy dog'
			});

			// update the component's state
			itemList.setState({ data:itemDataList });
		}
	}

	// ----------------------------------------------------------------
	// Let's rock!

	// get data, which defined in HTML
	itemDataList = JSON.parse(document.querySelector('#json-items').text);
	rowCount = itemDataList.length;

	// create IDs for each item data
	itemDataList.forEach((item)=>item.id=Math.random());

	// the list component
	itemList = ReactDOM.render(
		<ItemList />,
		document.querySelector('.js-table')
	);
	itemList.setState({ items:itemDataList });

	// form component to add an item
	ReactDOM.render(
		<Form />,
		document.querySelector('.js-form')
	);

})(window.React, window.ReactDOM);
