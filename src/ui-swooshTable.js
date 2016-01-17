(function(window, document, $) {
	/*! Osteoporosis.js v0.0.2 By TAKANASHI Ginpei */
	var Osteoporosis=function(){var t={},i="prototype",n="extend",e=
	"trigger",o="attributes",r="_listeners",s=[].slice,u="undefined"
	==typeof _?$[n]:_[n],a=function(){};t[n]=function(e,o){function
	r(t){this.__osteoporosis__(t),this.initialize(t)}return r[n]=t[n
	],u(r[i],this[i],e),u(r,o),r};var h=t.eventPrototype={on:
	function(t,i){var n=this[r];n||(n=this[r]={});var e=n[t];e||(e=n
	[t]=[]),e.push(i)},trigger:function(t){var i=this[r];if(i&&i[t])
	{var n=s.call(arguments,1);i[t].forEach(function(t){t.apply(null
	,n)})}}};return t.Model=function(){},t.Model[n]=t[n],u(t.Model[i
	],{__osteoporosis__:function(t){return this[o]={},this.set(t)},
	initialize:a,set:function(t){var i=this[o];for(var n in t){var r
	=t[n],s=i[n];r!==s&&(i[n]=r,this[e]("change:"+n,this,r),this[e](
	"change",this))}return this},get:function(t){return this[o][t]},
	on:h.on,trigger:h[e]}),t.View=function(){},t.View[n]=t[n],u(t.
	View[i],{__osteoporosis__:function(t){t=t||{},this.$el=$(t.el||
	document)},initialize:a,$:function(t){return this.$el.find(t)},
	on:h.on,trigger:h[e]}),t}();

	// ----------------------------------------------------------------
	// Extend Osteoporosis

	/**
	 * Default values.
	 * @type Object
	 * @see #_initializeAttributes
	 */
	Osteoporosis.Model.prototype.defaults = {};

	/**
	 * The constructor for Model.
	 * @overwrite Osteoporosis.Model#__osteoporosis__
	 */
	let Model_beforeInitialize = Osteoporosis.Model.prototype.__osteoporosis__;
	Osteoporosis.Model.prototype.__osteoporosis__ = function(attr) {
		Model_beforeInitialize.apply(this, arguments);
		this._initializeAttributes(attr);
	};

	/**
	 * Set default values as own attributes
	 * if the value is not specified in constructor.
	 * @see #initialize
	 * @see #defaults
	 */
	Osteoporosis.Model.prototype._initializeAttributes = function(spec) {
		let attr = this.attributes;
		let def = this.defaults;
		for (let p in def) {
			if (!spec || !(p in spec)) {
				attr[p] = def[p];
			}
		}
	};

	/**
	 * Bind own event listener to an event.
	 * @param {Object} obj Which has `.on()` method.
	 * @param {String} type
	 * @param {Function} listener
	 */
	Osteoporosis.View.prototype.listenTo = function(obj, type, listener) {
		obj.on(type, listener.bind(this));
	};

	// ----------------------------------------------------------------
	// Util

	/**
	 * Return the closest element from specified element.
	 * @param {Element} el
	 * @param {String} selector
	 * @returns {Element} Or `null`.
	 */
	function getClosest(el, selector) {
		if (el.closest) {
			return el.closest(selector);
		}
		else {
			return $(el).closest(selector)[0];
		}
	}

	/**
	 * Return the element which is matched to specified condition.
	 * @param {Array} arr
	 * @param {Function} callback(element, index, array)
	 */
	function findFromArray(arr, callback) {
		if (arr.find) {
			return arr.find(callback);
		}
		else {
			return $.grep(arr, callback)[0];
		}
	}

	// ----------------------------------------------------------------
	// Status

	/**
	 * Manage user action status.
	 *
	 * # Status
	 *
	 *   Waiting ---> Preaction ---> Swiping ---> SwipedOver
	 *    ^            |              |            |
	 *    |            v              v            |
	 *    +------------+<-------------+<-----------+
	 *
	 * @constructor
	 */
	let Status = Osteoporosis.Model.extend({
		THRESHOLD_X: 30,
		THRESHOLD_Y: 30,

		PHASE_WAITING: 'waiting',
		PHASE_PREACTION: 'preaction',
		PHASE_SWIPING: 'swiping',
		PHASE_SWIPEDOVER: 'swipedOver',

		/**
		 * Default values.
		 */
		defaults: {
			fromX: NaN,  // the origin of actions
			fromY: NaN,
			phase: null,  // 'waiting', 'preaction', 'swiping', 'swipedOver'
			// premoving: false,  // whether user is flicking to do some action
			maxLeft: NaN,
			minLeft: NaN,
			// movingX: false,  // whether the element is moving horizontaly
			// movingY: false  // whether the element is moving vertically
		},

		initialize: function(attributes, options) {
			if (!this.get('phase')) {
				this.set({ phase:this.PHASE_WAITING });
			}
		},

		isWaiting: function() {
			return (this.attributes.phase === this.PHASE_WAITING);
		},

		isPreaction: function() {
			return (this.attributes.phase === this.PHASE_PREACTION);
		},

		isSwiping: function() {
			return (this.attributes.phase === this.PHASE_SWIPING);
		},

		isSwipedOver: function() {
			return (this.attributes.phase === this.PHASE_SWIPEDOVER);
		},

		/**
		 * Whether specified positions overcome the threshold.
		 * @see #THRESHOLD_X
		 */
		isOverThresholdX: function() {
			let attr = this.attributes;
			let delta = attr.curX - attr.fromX;
			return (delta > this.THRESHOLD_X || delta < -this.THRESHOLD_X);
		},

		/**
		 * Whether specified positions overcome the threshold.
		 * @see #THRESHOLD_Y
		 */
		isOverThresholdY: function() {
			let attr = this.attributes;
			let delta = attr.curY - attr.fromY;
			return (delta > this.THRESHOLD_Y || delta < -this.THRESHOLD_Y);
		}
	});

	// ----------------------------------------------------------------
	// UISwipe

	/**
	 * UI for swiping.
	 * @constructor
	 */
	let UISwipe = Osteoporosis.View.extend({
		defaults: {
			buttons: [ { key:'delete', label:'Delete' } ]
		},

		initialize: function(options) {
			this.options = {
				buttons: options.buttons || this.defaults.buttons
			};

			// prepare models
			this.status = new Status();

			// listen models
			let status = this.status;
			this.listenTo(status, 'change:phase', this.status_onchange_phase);
			this.listenTo(status, 'change:curX', this.status_onchange_curX);
			this.listenTo(status, 'change:deltaX', this.status_onchange_deltaX);

			// listen elements
			let $document = $(document);
			this.listenTo(this.$el, 'mousedown', this.el_onmousedown);
			this.listenTo($document, 'mousedown', this.document_onmousedown);
			this.listenTo($document, 'mousemove', this.document_onmousemove);
			this.listenTo($document, 'mouseup', this.document_onmouseup);
			this.listenTo(this.$el, 'touchstart', this.el_ontouchstart);
			this.listenTo($document, 'touchstart', this.document_ontouchstart);
			this.listenTo($document, 'touchmove', this.document_ontouchmove);
			this.listenTo($document, 'touchend', this.document_ontouchend);
		},

		/**
		 * Start whatching user's operation.
		 * @param {Number} positions.x
		 * @param {Number} positions.y
		 */
		startPremoving: function(positions) {
			this._setupTools();
			this.status.set({
				fromX: positions.x,
				fromY: positions.y
			});
			this.status.set({ premoving:true });
		},

		/**
		 * Set up tool buttons.
		 */
		_setupTools: function() {
			let $row = this.$el;
			let $tools = this.$rowTools;

			if (!$tools) {
				this._initRowTools();
				$tools = this.$rowTools;
			}

			$tools.css({ display:'block' });

			let pos = $row.offset();
			let height = $row.outerHeight();
			let width = $row.outerWidth();
			$tools.css({
				height: height,
				lineHeight: height+'px',
				top: pos.top
			});

			this.status.set({
				maxLeft: 0,
				minLeft: -$tools.outerWidth()
			});
		},

		/**
		 * Initialize row tool buttons.
		 * Run only first time.
		 */
		_initRowTools: function() {
			let $tools = $(this._create$rowTools());
			$tools.appendTo(document.body);

			this.$rowTools = $tools;
			this.elRowTools = $tools[0];

			this.listenTo($tools, 'click', this.rowTools_onclick);
		},

		/**
		 * Create elements of tool button along the options
		 * which are specified in the constructor.
		 * @return {Element}
		 */
		_create$rowTools: function() {
			let html = '<div class="ui-swooshTable-rowTools">';
			this.options.buttons.concat().reverse().forEach((data)=>{
				html += `<button class="ui-swooshTable-toolButon rowTools-item" data-swooshTable-key="${data.key}">${data.label}</button>`;
			});
			html += '</div>';

			let elFactory = document.createElement('div');
			elFactory.insertAdjacentHTML('afterbegin', html);
			let el = elFactory.firstChild;
			return el;
		},

		/**
		 * Update status before actual behaviours.
		 * @param {Number} positions.x
		 * @param {Number} positions.y
		 */
		updatePremoving: function(positions) {
			if (this.status.isOverThresholdY(positions)) {
				this.status.set({ movingY:true });
			}
			else if (this.status.isOverThresholdX(positions)) {
				this.status.set({ movingX:true });
				this.status.set({
					fromX: positions.x,
					fromY: positions.y
				});
			}
		},

		/**
		 * Reset moving flags.
		 */
		stopMoving: function() {
			this.status.set({
				movingX: false,
				movingY: false,
				premoving: false
			});
			this.$el.css({ transform:'' });
		},

		/**
		 * Update element styles by phases.
		 */
		_updatePhase: function() {
			let status = this.status;
			let $el = this.$el;

			$el.toggleClass('ui-swooshTable-row--swiping', status.isSwiping());
		},

		/**
		 * Update element position by the origin and current positions.
		 */
		_updateLeft: function() {
			let status = this.status;
			let minLeft = status.get('minLeft');
			let maxLeft = status.get('maxLeft');
			let dx = status.get('deltaX');
			let left = Math.min(Math.max(dx, minLeft), maxLeft);
			this.$el.css({ transform:'translateX(' + left + 'px)' });
		},

		/**
		 * Get pointer positions from specified pointer event.
		 * @param {Number} positions.x
		 * @param {Number} positions.y
		 */
		getPositionsFromEvent: function(event) {
			event = event.originalEvent || event;

			let positions;
			if (event.touches) {
				positions = {
					x: event.touches[0].pageX,
					y: event.touches[0].pageY
				};
			}
			else {
				positions = {
					x: event.pageX,
					y: event.pageY
				};
			}
			return positions;
		},

		/**
		 * Get back to the original position.
		 */
		restore: function() {
			this.status.set({ phase:'waiting' });
		},

		/**
		 * Detach resources.
		 */
		destroy: function() {
			// Maybe not enough...

			this.$el.remove();
			this.$rowTools.remove();
		},

		/**
		 * Return true if specified event is occured on tool element.
		 * @param {Event} event
		 * @returns {Boolean}
		 */
		isEventOccuredOnRowTools: function(event) {
			let elRowTools = this.elRowTools;
			let onTools = false;
			for (let el=event.target; el; el=el.parentElement) {
				if (el === elRowTools) {
					onTools = true;
					break;
				}
			}
			return onTools;
		},

		status_onchange_phase: function(status, phase) {
			let attr = status.attributes;

			if (phase === status.PHASE_WAITING) {
				status.set({
					curX: NaN,
					curY: NaN,
					deltaX: 0,
					fromX: NaN,
					fromY: NaN
				});
			}
			else if (phase === status.PHASE_PREACTION) {
			}
			else if (phase === status.PHASE_SWIPING) {
				this._setupTools();
				status.set({
					fromX: attr.curX,
					fromY: attr.curY
				});
			}
			else if (phase === status.PHASE_SWIPEDOVER) {
			}

			this._updatePhase();
		},

		status_onchange_curX: function(status, value) {
			if (status.isPreaction()) {
				if (status.isOverThresholdX()) {
					status.set({ phase:status.PHASE_SWIPING });
				}
				else if (status.isOverThresholdY()) {
					status.set({ phase:status.PHASE_WAITING });
				}
			}
			else if (status.isSwiping()) {
				let attr = status.attributes;
				let dx = attr.curX - attr.fromX;
				status.set({ deltaX:dx });
			}
		},

		status_onchange_deltaX: function(model, value) {
			this._updateLeft();

			if (value === 0) {
				if (this.$rowTools) {
					this.$rowTools.css({ display:'none' });
				}
			}
		},

		el_onmousedown: function(event) {
			event.preventDefault();
			let positions = this.getPositionsFromEvent(event);
			let status = this.status;

			status.set({
				fromX: positions.x,
				fromY: positions.y,
				phase: status.PHASE_PREACTION
			});
		},

		document_onmousedown: function(event) {
			let status = this.status;

			if (!this.isEventOccuredOnRowTools(event) && status.isSwipedOver()) {
				status.set({ phase:status.PHASE_WAITING });
			}
		},

		document_onmousemove: function(event) {
			let status = this.status;
			let positions;

			if (status.isPreaction() || status.isSwiping()) {
				positions = this.getPositionsFromEvent(event);
				status.set({
					curX: positions.x,
					curY: positions.y
				});
			}
		},

		document_onmouseup: function(event) {
			let status = this.status;

			if (status.get('deltaX') < status.get('minLeft')) {
				status.set({ phase:status.PHASE_SWIPEDOVER });
			}

			if (!status.isSwipedOver()) {
				status.set({ phase:status.PHASE_WAITING });
			}
		},

		el_ontouchstart: function(event) {
			let positions = this.getPositionsFromEvent(event);
			let status = this.status;

			status.set({
				fromX: positions.x,
				fromY: positions.y,
				phase: status.PHASE_PREACTION
			});
		},

		document_ontouchstart: function(event) {
			let status = this.status;
			if (status.isSwipedOver()) {
				status.set({ phase:status.PHASE_WAITING });
			}
		},

		document_ontouchmove: function(event) {
			let status = this.status;
			let position;

			if (status.isPreaction() || status.isSwiping()) {
				positions = this.getPositionsFromEvent(event);
				status.set({
					curX: positions.x,
					curY: positions.y
				});

				if (status.isPreaction() || status.isSwiping()) {
					event.preventDefault();
				}
			}
		},

		document_ontouchend: function(event) {
			let status = this.status;

			if (status.get('deltaX') < status.get('minLeft')) {
				status.set({ phase:status.PHASE_SWIPEDOVER });
			}

			if (!status.isSwipedOver()) {
				status.set({ phase:status.PHASE_WAITING });
			}
		},

		rowTools_onclick: function(event) {
			let elButton = getClosest(event.target, '.ui-swooshTable-toolButon');
			let data = {
				event,
				elButton,
				key: elButton.getAttribute('data-swooshTable-key')
			};
			this.trigger('clickbutton', this, data);
		}
	});

	// ----------------------------------------------------------------
	// SwooshTable

	let SwooshTable = Osteoporosis.View.extend({
		/**
		 * @type Array
		 */
		subViews: null,

		initialize: function(options) {
			if (typeof options === 'string') {
				let selector = options;
				options = {};
				this.$el = $(selector);
				this.el = this.$el[0];
			}

			if (options.$rowTools) {
				this.$rowTools = options.$rowTools;
			}
			else {
				this.$rowTools = this._create$rowTools();
			}

			this._initSubViews();
		},

		_initSubViews: function() {
			let views = this.subViews = [];
			let $rows = this.$('>tr, >tbody>tr');
			let $rowTools = this.$rowTools;
			let create$rowTools = this._create$rowTools.bind(this);
			$rows.each(function(index, elRow) {
				let view = new UISwipe({
					el: elRow,
					create$rowTools: create$rowTools,
				});
				this.listenTo(view, 'click', this.subView_onclick);
				views.push(view);
			}.bind(this));
		},

		/**
		 * Create an unique element which is provides buttons for each row.
		 * @returns {Element}
		 */
		_create$rowTools: function() {
			let $rowTools = $(this._template$rowTools({}));
			$rowTools.appendTo(document.body);
			return $rowTools;
		},

		_template$rowTools: function(data) {
			let html =
				'<div class="ui-swooshTable-rowTools">' +
					'<button class="ui-swooshTable-toolButon rowTools-item rowTools-item-delete">Delete</button>' +
				'</div>';
			let elFactory = document.createElement('div');
			elFactory.insertAdjacentHTML('afterbegin', html);
			let el = elFactory.firstChild;
			return el;
		},

		/**
		 * Remove specified row and its resources.
		 * @param {UISwipe|Element} row
		 */
		removeRow: function(row) {
			if (!(row instanceof UISwipe)) {
				let elRow = row;
				row = findFromArray(this.subViews, function(view) {
					return (view.$el[0] === elRow);
				});
			}
			row.destroy();
		},

		subView_onclick: function(view, event, elButton) {
			this.trigger('click', event, view, elButton);
		}
	});

	// ----------------------------------------------------------------
	// export

	UISwipe.Status = Status;
	window.UISwipe = UISwipe;
	window.SwooshTable = SwooshTable;
})(window, document, window.$);
