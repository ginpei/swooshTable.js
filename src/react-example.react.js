// React + ES6
(function(React, ReactDOM) {
	let data = JSON.parse(document.querySelector('#json-items').text);
	let rowCount = data.length;

	// ----------------------------------------------------------------

	class ItemList extends React.Component {
		constructor() {
			super();
			this.state = {
				items: []
			};
		}

		render() {
			let rows = this.state.items.map(function(item, index) {
				item.id = item.id || Math.random();
				return (
					<tr className="ui-swooshTable-row" key={item.id}>
						<td className="ui-swooshTable-cell ui-swooshTable-cell-title">{item.title}</td>
						<td className="ui-swooshTable-cell ui-swooshTable-cell-subtitle">{item.subtitle}</td>
					</tr>
				);
			});

			return <tbody>{rows}</tbody>;
		}
	}

	// ----------------------------------------------------------------

	class Form extends React.Component {
		render() {
			return (
				<button onClick={this.onClick.bind(this)}>Add A Row</button>
			);
		}

		onClick() {
			data.push({
				title: 'Fox ' + ++rowCount,
				subtitle: 'The quick brown fox jumps over the lazy dog'
			});
			itemList.setState({ data:data });
		}
	}

	// ----------------------------------------------------------------

	let itemList = ReactDOM.render(
		<ItemList />,
		document.querySelector('.js-table')
	);
	itemList.setState({ items:data });

	ReactDOM.render(
		<Form />,
		document.querySelector('.js-form')
	);

})(window.React, window.ReactDOM);
