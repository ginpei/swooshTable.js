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

(function(React, ReactDOM) {
	let itemDataList;
	let idCount;
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
			let onChangeItemTitle = this.props.onChangeItemTitle;
			let onDeleteItem = this.props.onDeleteItem;

			// build child rows
			let rows = this.state.items.map(function(item) {
				return <Item key={item.id} id={item.id} title={item.title} subtitle={item.subtitle}
					onChangeTitle={onChangeItemTitle}
					onDelete={onDeleteItem}
				/>
			});

			return <tbody>{rows}</tbody>;
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
		 * @param {number} id
		 */
		edit(id) {
			let title = this.props.title;
			let newTitle = window.prompt('Input new title.', title);
			if (newTitle) {
				this.props.onChangeTitle({ id:id, title:newTitle });
			}
			this.restoreRowPosition();
		}

		/**
		 * Delete the row.
		 * @param {number} id
		 * @see #doDelete
		 */
		delete(id) {
			if (window.confirm('Are you sure to DELETE?')) {
				this.doDelete({ id:id });
			}
			else {
				this.restoreRowPosition();
			}
		}

		/**
		 * Do delete.
		 * @param {Object} data
		 * @see #delete
		 */
		doDelete(data) {
			let swoosh = this.swoosh;
			this.restoreRowPosition();
			swoosh.$el.slideUp(function(){
				this.props.onDelete(data);
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
			let id = this.props.id;

			// do something according to which button the user clicked
			let key = data.key;
			if (key === 'delete') {
				this.delete(id);
			}
			else if (key === 'edit') {
				this.edit(id);
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
				<button onClick={this.props.onClick}>Add A Row</button>
			);
		}
	}

	// ----------------------------------------------------------------
	// Let's rock!

	function start() {
		// get data, which is defined in HTML
		itemDataList = JSON.parse(document.querySelector('#json-items').text);
		idCount = itemDataList.length;

		// create IDs for each item data
		itemDataList.forEach((item)=>item.id=Math.random());

		// the list component
		itemList = ReactDOM.render(
			<ItemList onChangeItemTitle={onChangeItemTitle} onDeleteItem={onDeleteItem} />,
			document.querySelector('.js-table')
		);
		itemList.setState({ items:itemDataList });

		// form component to add an item
		ReactDOM.render(
			<Form onClick={onClickAdd} />,
			document.querySelector('.js-form')
		);
	}

	/**
	 * Called when the title is changed at <Item>.
	 * @param {Object} data
	 * @param {number} data.id
	 * @param {string} data.title
	 */
	function onChangeItemTitle(data) {
		// update the item's data
		let item = itemDataList.find((o)=>o.id===data.id);
		item.title = data.title;

		// update this component's state
		itemList.setState({ items:itemDataList });
	}

	/**
	 * Called when an user decided to delete an <Item>.
	 * @param {Object} data
	 * @param {number} data.id
	 */
	function onDeleteItem(data) {
		// remove the item from the array
		let index = itemDataList.indexOf(itemDataList.find((o)=>o.id===data.id));
		let afters = itemDataList.splice(index);
		itemDataList = itemDataList.concat(afters.slice(1));

		// update this component's state
		itemList.setState({ items:itemDataList });
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
		itemList.setState({ data:itemDataList });
	}

	start();
})(window.React, window.ReactDOM);
