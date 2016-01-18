// React + ES6
(function(React, ReactDOM) {
	let itemDataList;
	let rowCount;
	let itemList;

	// ----------------------------------------------------------------

	class ItemList extends React.Component {
		constructor() {
			super();
			this.state = {
				items: []
			};
		}

		render() {
			let onChangeItemTitle = this.onChangeItemTitle.bind(this);
			let onDeleteItem = this.onDeleteItem.bind(this);

			let rows = this.state.items.map(function(item, index) {
				return <Item key={item.id} id={item.id} title={item.title} subtitle={item.subtitle}
					onChangeTitle={onChangeItemTitle}
					onDelete={onDeleteItem}
				/>
			});

			return <tbody>{rows}</tbody>;
		}

		onChangeItemTitle(data) {
			itemDataList[data.index].title = data.title;
			this.setState({ items:itemDataList });
		}

		onDeleteItem(data) {
			let afters = itemDataList.splice(data.index);
			let l2 = itemDataList.concat(afters.slice(1));
			itemDataList = l2;
			this.setState({ items:itemDataList });
		}
	}

	class Item extends React.Component {
		constructor() {
			super();
			this._rowButtons = [
				{ key:'edit', label:'Edit' },
				{ key:'delete', label:'Delete' }
			];
		}

		render() {
			return (
				<tr className="ui-swooshTable-row" ref="el">
					<td className="ui-swooshTable-cell ui-swooshTable-cell-title">{this.props.title}</td>
					<td className="ui-swooshTable-cell ui-swooshTable-cell-subtitle">{this.props.subtitle}</td>
				</tr>
			);
		}

		restoreRowPosition() {
			this.swoosh.restore();
		}

		edit(index) {
			let title = this.props.title;
			let newTitle = window.prompt('Input new title.', title);
			if (newTitle) {
				this.props.onChangeTitle({ index:index, title:newTitle });
			}
			this.restoreRowPosition();
		}

		delete(index) {
			if (window.confirm('Are you sure to DELETE?')) {
				this.doDelete(index);
			}
			else {
				this.restoreRowPosition();
			}
		}

		doDelete(index) {
			let swoosh = this.swoosh;
			this.restoreRowPosition();
			swoosh.$el.slideUp(function(){
				this.props.onDelete({ index:index });
			}.bind(this));
		}

		componentDidMount() {
			var swoosh = new UISwipe({ el:this.refs.el, buttons:this._rowButtons });
			swoosh.on('clickbutton', this.onClick.bind(this));
			this.swoosh = swoosh;
		}

		componentWillUnmount() {
			this.swoosh.destroy({ removeDom:false });
		}

		onClick(event, data) {
			let id = this.props.id;
			let index = itemDataList.indexOf(itemDataList.find((item)=>item.id===id));

			let key = data.key;
			if (key === 'delete') {
				this.delete(index);
			}
			else if (key === 'edit') {
				this.edit(index);
			}
		}
	}

	class Form extends React.Component {
		render() {
			return (
				<button onClick={this.onClick.bind(this)}>Add A Row</button>
			);
		}

		onClick() {
			itemDataList.push({
				id: Math.random(),
				title: 'Fox ' + ++rowCount,
				subtitle: 'The quick brown fox jumps over the lazy dog'
			});
			itemList.setState({ data:itemDataList });
		}
	}

	// ----------------------------------------------------------------

	itemDataList = JSON.parse(document.querySelector('#json-items').text);
	rowCount = itemDataList.length;

	itemDataList.forEach((item)=>item.id=Math.random());

	itemList = ReactDOM.render(
		<ItemList />,
		document.querySelector('.js-table')
	);
	itemList.setState({ items:itemDataList });

	ReactDOM.render(
		<Form />,
		document.querySelector('.js-form')
	);

})(window.React, window.ReactDOM);
