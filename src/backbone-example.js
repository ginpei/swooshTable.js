(function($, _, Backbone) {
	var $list = $('.js-list');
	var data = JSON.parse($('#json-items').prop('text'));
	var templateRow = _.template($('#template-row').prop('text'));

	// ----------------------------------------------------------------

	var Item = Backbone.Model.extend({
		defaults: {
			title: null,
			subtitle: null
		}
	});

	var ItemCollection = Backbone.Collection.extend({
		model: Item
	});

	var ItemView = Backbone.View.extend({
		_rowButtons: [
			{ key:'edit', label:'Edit' },
			{ key:'delete', label:'Delete' }
		],

		initialize: function(options) {
			this.listenTo(this.model, 'change:title', this.model_onchange_title);
		},

		render: function() {
			var $el = $(templateRow(this.model.toJSON()));
			this.setElement($el);
			this.$title = this.$('.ui-swooshTable-cell-title');
			return this;
		},

		setElement: function() {
			var rv = this.constructor.__super__.setElement.apply(this, arguments);

			var row = new UISwipe({ el:this.el, buttons:this._rowButtons });
			row.on('clickbutton', this.row_onclick.bind(this));
			this.swooshRow = row;

			return rv;
		},

		updateTitle: function() {
			this.$title.text(this.model.get('title'));
		},

		restoreRowPosition: function() {
			this.swooshRow.restore();
		},

		edit: function() {
			var title = this.model.get('title');
			var newTitle = window.prompt('Input new title.', title);
			if (newTitle) {
				this.model.set('title', newTitle);
			}
			this.restoreRowPosition();
		},

		delete: function() {
			if (window.confirm('Are you sure to DELETE?')) {
				this.trigger('click_remove', this, this.model);
			}
			else {
				this.restoreRowPosition();
			}
		},

		doDelete: function() {
			var row = this.swooshRow;
			row.restore();
			row.$el.slideUp(function(){
				row.destroy();
				this.remove();
			}.bind(this));
		},

		model_onchange_title: function(model, title, options) {
			this.updateTitle();
		},

		row_onclick: function(event, data) {
			var key = data.key;
			if (key === 'edit') {
				this.edit();
			}
			else if (key === 'delete') {
				this.delete();
			}
		}
	});

	// ----------------------------------------------------------------

	var rowCount = data.length;
	var itemViews = {};
	var items = new ItemCollection();

	items.on('add', function(item, options) {
		var view = new ItemView({ model:item });
		view.render();
		itemViews[item.cid] = view;
		$list.append(view.$el);

		view.on('click_remove', function(view, item, options) {
			this.remove(item);
		}.bind(this));

		return view;
	});
	items.on('remove', function(item, items, options) {
		var view = itemViews[item.cid];
		view.doDelete();
	});

	$('.js-basicExample-add').on('click', function(event){
		items.add({
			title: 'Fox ' + ++rowCount,
			subtitle: 'The quick brown fox jumps over the lazy dog'
		});
	});

	items.set(data);

})(window.$, window._, window.Backbone);
