// React + ES6
(function(React, ReactDOM) {
	class ItemList extends React.Component {
		constructor() {
			super();
			this.state = {
				items: []
			};
		}

		render() {
			let rows = this.state.items.map(function(item, index) {
				return <Item key={item.id} title={item.title} subtitle={item.subtitle} />
			});

			return <tbody>{rows}</tbody>;
		}
	}

	class Item extends React.Component {
		render() {
			return (
				<tr className="ui-swooshTable-row">
					<td className="ui-swooshTable-cell ui-swooshTable-cell-title">{this.props.title}</td>
					<td className="ui-swooshTable-cell ui-swooshTable-cell-subtitle">{this.props.subtitle}</td>
				</tr>
			);
		}

		componentDidMount() {
			console.log('componentDidMount', this.props.title);
		}
		componentWillUnmount() {
			console.log('componentWillUnmount', this.props.title);
		}
	}

	class Form extends React.Component {
		render() {
			return (
				<button onClick={this.onClick.bind(this)}>Add A Row</button>
			);
		}

		onClick() {
			data.push({
				id: Math.random(),
				title: 'Fox ' + ++rowCount,
				subtitle: 'The quick brown fox jumps over the lazy dog'
			});
			itemList.setState({ data:data });
		}
	}

	// ----------------------------------------------------------------

	let data = JSON.parse(document.querySelector('#json-items').text);
	let rowCount = data.length;

	data.forEach((item)=>item.id=Math.random());

	let itemList = ReactDOM.render(
		<ItemList />,
		document.querySelector('.js-table')
	);
	itemList.setState({ items:data });

	ReactDOM.render(
		<Form />,
		document.querySelector('.js-form')
	);

	// test
	setTimeout(()=>{ data.pop(); itemList.setState({ items:data }) }, 1000);
	setTimeout(()=>{ data.shift(); itemList.setState({ items:data }) }, 2000);
	setTimeout(()=>{
		data.push({
			id: Math.random(),
			title: 'Fox ' + ++rowCount,
			subtitle: 'The quick brown fox jumps over the lazy dog'
		});
		itemList.setState({ items:data });
	}, 3000);
})(window.React, window.ReactDOM);
