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

			var row = new UISwipe({ el:this.el });
			row.on('clickbutton', this.row_onclick.bind(this));
			this.swooshRow = row;

			return rv;
		},

		updateTitle: function() {
			this.$title.text(this.model.get('title'));
		},

		deleteRow: function() {
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
			this.deleteRow();
		}
	});

	// ----------------------------------------------------------------

	var items = new ItemCollection(data);
	var itemViews = items.map(function(item) {
		var view = new ItemView({ model:item });
		view.render();
		$list.append(view.$el);
		return view;
	});
})(window.$, window._, window.Backbone);
