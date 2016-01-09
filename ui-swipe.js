"use strict";

(function (window, document, $) {
	/*! Osteoporosis.js v0.0.2 By TAKANASHI Ginpei */
	var Osteoporosis = function () {
		var t = {},
		    i = "prototype",
		    n = "extend",
		    e = "trigger",
		    o = "attributes",
		    r = "_listeners",
		    s = [].slice,
		    u = "undefined" == typeof _ ? $[n] : _[n],
		    a = function a() {};t[n] = function (e, o) {
			function r(t) {
				this.__osteoporosis__(t), this.initialize(t);
			}return r[n] = t[n], u(r[i], this[i], e), u(r, o), r;
		};var h = t.eventPrototype = { on: function on(t, i) {
				var n = this[r];n || (n = this[r] = {});var e = n[t];e || (e = n[t] = []), e.push(i);
			}, trigger: function trigger(t) {
				var i = this[r];if (i && i[t]) {
					var n = s.call(arguments, 1);i[t].forEach(function (t) {
						t.apply(null, n);
					});
				}
			} };return t.Model = function () {}, t.Model[n] = t[n], u(t.Model[i], { __osteoporosis__: function __osteoporosis__(t) {
				return this[o] = {}, this.set(t);
			},
			initialize: a, set: function set(t) {
				var i = this[o];for (var n in t) {
					var r = t[n],
					    s = i[n];r !== s && (i[n] = r, this[e]("change:" + n, this, r), this[e]("change", this));
				}return this;
			}, get: function get(t) {
				return this[o][t];
			},
			on: h.on, trigger: h[e] }), t.View = function () {}, t.View[n] = t[n], u(t.View[i], { __osteoporosis__: function __osteoporosis__(t) {
				t = t || {}, this.$el = $(t.el || document);
			}, initialize: a, $: function $(t) {
				return this.$el.find(t);
			},
			on: h.on, trigger: h[e] }), t;
	}();

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
	var Model_beforeInitialize = Osteoporosis.Model.prototype.__osteoporosis__;
	Osteoporosis.Model.prototype.__osteoporosis__ = function (attr) {
		Model_beforeInitialize.apply(this, arguments);
		this._initializeAttributes(attr);
	};

	/**
  * Set default values as own attributes
  * if the value is not specified in constructor.
  * @see #initialize
  * @see #defaults
  */
	Osteoporosis.Model.prototype._initializeAttributes = function (spec) {
		var attr = this.attributes;
		var def = this.defaults;
		for (var p in def) {
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
	Osteoporosis.View.prototype.listenTo = function (obj, type, listener) {
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
		} else {
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
		} else {
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
	var Status = Osteoporosis.Model.extend({
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
			fromX: NaN, // the origin of actions
			fromY: NaN,
			phase: null, // 'waiting', 'preaction', 'swiping', 'swipedOver'
			// premoving: false,  // whether user is flicking to do some action
			maxLeft: NaN,
			minLeft: NaN
		},

		// movingX: false,  // whether the element is moving horizontaly
		// movingY: false  // whether the element is moving vertically
		initialize: function initialize(attributes, options) {
			if (!this.get('phase')) {
				this.set({ phase: this.PHASE_WAITING });
			}
		},

		isWaiting: function isWaiting() {
			return this.attributes.phase === this.PHASE_WAITING;
		},

		isPreaction: function isPreaction() {
			return this.attributes.phase === this.PHASE_PREACTION;
		},

		isSwiping: function isSwiping() {
			return this.attributes.phase === this.PHASE_SWIPING;
		},

		isSwipedOver: function isSwipedOver() {
			return this.attributes.phase === this.PHASE_SWIPEDOVER;
		},

		/**
   * Whether specified positions overcome the threshold.
   * @see #THRESHOLD_X
   */
		isOverThresholdX: function isOverThresholdX() {
			var attr = this.attributes;
			var delta = attr.curX - attr.fromX;
			return delta > this.THRESHOLD_X || delta < -this.THRESHOLD_X;
		},

		/**
   * Whether specified positions overcome the threshold.
   * @see #THRESHOLD_Y
   */
		isOverThresholdY: function isOverThresholdY() {
			var attr = this.attributes;
			var delta = attr.curY - attr.fromY;
			return delta > this.THRESHOLD_Y || delta < -this.THRESHOLD_Y;
		}
	});

	// ----------------------------------------------------------------
	// UISwipe

	/**
  * UI for swiping.
  * @constructor
  */
	var UISwipe = Osteoporosis.View.extend({
		initialize: function initialize(options) {
			this.create$rowTools = options.create$rowTools;

			// prepare models
			this.status = new Status();

			// listen models
			var status = this.status;
			this.listenTo(status, 'change:phase', this.status_onchange_phase);
			this.listenTo(status, 'change:curX', this.status_onchange_curX);
			this.listenTo(status, 'change:deltaX', this.status_onchange_deltaX);

			// listen elements
			var $document = $(document);
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
		startPremoving: function startPremoving(positions) {
			this._setupTools();
			this.status.set({
				fromX: positions.x,
				fromY: positions.y
			});
			this.status.set({ premoving: true });
		},

		/**
   * Set up tool buttons.
   */
		_setupTools: function _setupTools() {
			var $row = this.$el;
			var $tools = this.$rowTools;

			if (!$tools) {
				this._initRowTools();
				var $tools = this.$rowTools;
			}

			$tools.css({ display: 'block' });

			var pos = $row.offset();
			var height = $row.outerHeight();
			var width = $row.outerWidth();
			$tools.css({
				height: height,
				lineHeight: height + 'px',
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
		_initRowTools: function _initRowTools() {
			var $tools = this.create$rowTools();
			this.$rowTools = $tools;
			this.elRowTools = $tools[0];

			this.listenTo($tools, 'click', this.rowTools_onclick);
		},

		/**
   * Update status before actual behaviours.
   * @param {Number} positions.x
   * @param {Number} positions.y
   */
		updatePremoving: function updatePremoving(positions) {
			if (this.status.isOverThresholdY(positions)) {
				this.status.set({ movingY: true });
			} else if (this.status.isOverThresholdX(positions)) {
				this.status.set({ movingX: true });
				this.status.set({
					fromX: positions.x,
					fromY: positions.y
				});
			}
		},

		/**
   * Reset moving flags.
   */
		stopMoving: function stopMoving() {
			this.status.set({
				movingX: false,
				movingY: false,
				premoving: false
			});
			this.$el.css({ transform: '' });
		},

		/**
   * Update element styles by phases.
   */
		_updatePhase: function _updatePhase() {
			var status = this.status;
			var $el = this.$el;

			$el.toggleClass('ui-swooshTable-row--swiping', status.isSwiping());
		},

		/**
   * Update element position by the origin and current positions.
   */
		_updateLeft: function _updateLeft() {
			var status = this.status;
			var minLeft = status.get('minLeft');
			var maxLeft = status.get('maxLeft');
			var dx = status.get('deltaX');
			var left = Math.min(Math.max(dx, minLeft), maxLeft);
			this.$el.css({ transform: 'translateX(' + left + 'px)' });
		},

		/**
   * Get pointer positions from specified pointer event.
   * @param {Number} positions.x
   * @param {Number} positions.y
   */
		getPositionsFromEvent: function getPositionsFromEvent(event) {
			event = event.originalEvent || event;

			var positions;
			if (event.touches) {
				positions = {
					x: event.touches[0].pageX,
					y: event.touches[0].pageY
				};
			} else {
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
		restore: function restore() {
			this.status.set({ phase: 'waiting' });
		},

		/**
   * Detach resources.
   */
		destroy: function destroy() {
			// Maybe not enough...

			this.$el.remove();
			this.$rowTools.remove();
		},

		/**
   * Return true if specified event is occured on tool element.
   * @param {Event} event
   * @returns {Boolean}
   */
		isEventOccuredOnRowTools: function isEventOccuredOnRowTools(event) {
			var elRowTools = this.elRowTools;
			var onTools = false;
			for (var el = event.target; el; el = el.parentElement) {
				if (el === elRowTools) {
					onTools = true;
					break;
				}
			}
			return onTools;
		},

		status_onchange_phase: function status_onchange_phase(status, phase) {
			var attr = status.attributes;

			if (phase === status.PHASE_WAITING) {
				status.set({
					curX: NaN,
					curY: NaN,
					deltaX: 0,
					fromX: NaN,
					fromY: NaN
				});
			} else if (phase === status.PHASE_PREACTION) {} else if (phase === status.PHASE_SWIPING) {
				this._setupTools();
				status.set({
					fromX: attr.curX,
					fromY: attr.curY
				});
			} else if (phase === status.PHASE_SWIPEDOVER) {}

			this._updatePhase();
		},

		status_onchange_curX: function status_onchange_curX(status, value) {
			if (status.isPreaction()) {
				if (status.isOverThresholdX()) {
					status.set({ phase: status.PHASE_SWIPING });
				} else if (status.isOverThresholdY()) {
					status.set({ phase: status.PHASE_WAITING });
				}
			} else if (status.isSwiping()) {
				var attr = status.attributes;
				var dx = attr.curX - attr.fromX;
				status.set({ deltaX: dx });
			}
		},

		status_onchange_deltaX: function status_onchange_deltaX(model, value) {
			this._updateLeft();

			if (value === 0) {
				if (this.$rowTools) {
					this.$rowTools.css({ display: 'none' });
				}
			}
		},

		el_onmousedown: function el_onmousedown(event) {
			event.preventDefault();
			var positions = this.getPositionsFromEvent(event);
			var status = this.status;

			status.set({
				fromX: positions.x,
				fromY: positions.y,
				phase: status.PHASE_PREACTION
			});
		},

		document_onmousedown: function document_onmousedown(event) {
			var status = this.status;

			if (!this.isEventOccuredOnRowTools(event) && status.isSwipedOver()) {
				status.set({ phase: status.PHASE_WAITING });
			}
		},

		document_onmousemove: function document_onmousemove(event) {
			var status = this.status;
			var positions;

			if (status.isPreaction() || status.isSwiping()) {
				positions = this.getPositionsFromEvent(event);
				status.set({
					curX: positions.x,
					curY: positions.y
				});
			}
		},

		document_onmouseup: function document_onmouseup(event) {
			var status = this.status;

			if (status.get('deltaX') < status.get('minLeft')) {
				status.set({ phase: status.PHASE_SWIPEDOVER });
			}

			if (!status.isSwipedOver()) {
				status.set({ phase: status.PHASE_WAITING });
			}
		},

		el_ontouchstart: function el_ontouchstart(event) {
			var positions = this.getPositionsFromEvent(event);
			var status = this.status;

			status.set({
				fromX: positions.x,
				fromY: positions.y,
				phase: status.PHASE_PREACTION
			});
		},

		document_ontouchstart: function document_ontouchstart(event) {
			var status = this.status;
			if (status.isSwipedOver()) {
				status.set({ phase: status.PHASE_WAITING });
			}
		},

		document_ontouchmove: function document_ontouchmove(event) {
			var status = this.status;
			var position;

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

		document_ontouchend: function document_ontouchend(event) {
			var status = this.status;

			if (status.get('deltaX') < status.get('minLeft')) {
				status.set({ phase: status.PHASE_SWIPEDOVER });
			}

			if (!status.isSwipedOver()) {
				status.set({ phase: status.PHASE_WAITING });
			}
		},

		rowTools_onclick: function rowTools_onclick(event) {
			var elButton = event.target.closest('.ui-swooshTable-toolButon');
			this.trigger('click', this, event, elButton);
		}
	});

	// ----------------------------------------------------------------
	// SwooshTable

	var SwooshTable = Osteoporosis.View.extend({
		/**
   * @type Array
   */
		subViews: null,

		initialize: function initialize(options) {
			if (typeof options === 'string') {
				var selector = options;
				options = {};
				this.$el = $(selector);
				this.el = this.$el[0];
			}

			if (options.$rowTools) {
				this.$rowTools = options.$rowTools;
			} else {
				this.$rowTools = this._create$rowTools();
			}

			this._initSubViews();
		},

		_initSubViews: function _initSubViews() {
			var views = this.subViews = [];
			var $rows = this.$('>tr, >tbody>tr');
			var $rowTools = this.$rowTools;
			var create$rowTools = this._create$rowTools.bind(this);
			$rows.each(function (index, elRow) {
				var view = new UISwipe({
					el: elRow,
					create$rowTools: create$rowTools
				});
				this.listenTo(view, 'click', this.subView_onclick);
				views.push(view);
			}.bind(this));
		},

		/**
   * Create an unique element which is provides buttons for each row.
   * @returns {Element}
   */
		_create$rowTools: function _create$rowTools() {
			var $rowTools = $(this._template$rowTools({}));
			$rowTools.appendTo(document.body);
			return $rowTools;
		},

		_template$rowTools: function _template$rowTools(data) {
			var html = '<div class="ui-swooshTable-rowTools">' + '<button class="ui-swooshTable-toolButon rowTools-item rowTools-item-delete">Delete</button>' + '<button class="ui-swooshTable-toolButon rowTools-item rowTools-item-move">Move</button>' + '</div>';
			var elFactory = document.createElement('div');
			elFactory.insertAdjacentHTML('afterbegin', html);
			var el = elFactory.firstChild;
			return el;
		},

		/**
   * Remove specified row and its resources.
   * @param {UISwipe|Element} row
   */
		removeRow: function removeRow(row) {
			if (!(row instanceof UISwipe)) {
				var elRow = row;
				row = findFromArray(this.subViews, function (view) {
					return view.$el[0] === elRow;
				});
			}
			row.destroy();
		},

		subView_onclick: function subView_onclick(view, event, elButton) {
			this.trigger('click', event, view, elButton);
		}
	});

	// ----------------------------------------------------------------
	// export

	UISwipe.Status = Status;
	window.UISwipe = UISwipe;
	window.SwooshTable = SwooshTable;
})(window, document, window.$);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInVpLXN3aXBlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsQ0FBQyxVQUFTLE1BQU0sRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFOztBQUU5QixLQUFJLFlBQVksR0FBQyxZQUFVO0FBQUMsTUFBSSxDQUFDLEdBQUMsRUFBRTtNQUFDLENBQUMsR0FBQyxXQUFXO01BQUMsQ0FBQyxHQUFDLFFBQVE7TUFBQyxDQUFDLEdBQy9ELFNBQVM7TUFBQyxDQUFDLEdBQUMsWUFBWTtNQUFDLENBQUMsR0FBQyxZQUFZO01BQUMsQ0FBQyxHQUFDLEVBQUUsQ0FBQyxLQUFLO01BQUMsQ0FBQyxHQUFDLFdBQVcsSUFDOUQsT0FBTyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7TUFBQyxDQUFDLEdBQUMsU0FBRixDQUFDLEdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxVQUFTLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxZQUN2RCxDQUFDLENBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxFQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUMvRCxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFBO0dBQUMsQ0FBQyxJQUFJLENBQUMsR0FBQyxDQUFDLENBQUMsY0FBYyxHQUFDLEVBQUMsRUFBRSxFQUN4RCxZQUFTLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxRQUFJLENBQUMsR0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFHLENBQUMsR0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsRUFBRSxDQUFBLEFBQUMsQ0FBQyxJQUFJLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFHLENBQUMsR0FBQyxDQUFDLENBQy9ELENBQUMsQ0FBQyxHQUFDLEVBQUUsQ0FBQSxBQUFDLEVBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUFDLEVBQUMsT0FBTyxFQUFDLGlCQUFTLENBQUMsRUFBQztBQUFDLFFBQUksQ0FBQyxHQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFHLENBQUMsSUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQy9EO0FBQUMsU0FBSSxDQUFDLEdBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLE9BQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUMvRCxDQUFDLENBQUMsQ0FBQTtNQUFDLENBQUMsQ0FBQTtLQUFDO0lBQUMsRUFBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssR0FBQyxZQUFVLEVBQUUsRUFBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQy9ELEVBQUMsRUFBQyxnQkFBZ0IsRUFBQywwQkFBUyxDQUFDLEVBQUM7QUFBQyxXQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxFQUFFLEVBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUFDO0FBQzlELGFBQVUsRUFBQyxDQUFDLEVBQUMsR0FBRyxFQUFDLGFBQVMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxDQUFDLEdBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFDO0FBQUMsU0FBSSxDQUFDLEdBQy9ELENBQUMsQ0FBQyxDQUFDLENBQUM7U0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBRyxDQUFDLEtBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxHQUFDLENBQUMsRUFBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDLEVBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUMvRCxRQUFRLEVBQUMsSUFBSSxDQUFDLENBQUEsQUFBQyxDQUFBO0tBQUMsT0FBTyxJQUFJLENBQUE7SUFBQyxFQUFDLEdBQUcsRUFBQyxhQUFTLENBQUMsRUFBQztBQUFDLFdBQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQUM7QUFDL0QsS0FBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLElBQUksR0FBQyxZQUFVLEVBQUUsRUFBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUM3RCxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUMsRUFBQyxnQkFBZ0IsRUFBQywwQkFBUyxDQUFDLEVBQUM7QUFBQyxLQUFDLEdBQUMsQ0FBQyxJQUFFLEVBQUUsRUFBQyxJQUFJLENBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUM3RCxRQUFRLENBQUMsQ0FBQTtJQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsV0FBUyxDQUFDLEVBQUM7QUFBQyxXQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQUM7QUFDOUQsS0FBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsT0FBTyxFQUFD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QzlCLFFBQUksS0FBSyxHQUFHLEdBQUcsQ0FBQztBQUNoQixPQUFHLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsVUFBUyxJQUFJLEVBQUU7QUFDakQsWUFBUSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBRTtLQUMvQixDQUFDLENBQUM7SUFDSDtBQUNELE1BQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztHQUNkOztBQUVELGlCQUFlLEVBQUUseUJBQVMsSUFBSSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUU7QUFDaEQsT0FBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztHQUM3QztFQUNELENBQUM7Ozs7O0FBQUMsQUFLSCxRQUFPLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztBQUN4QixPQUFNLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztBQUN6QixPQUFNLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztDQUNqQyxDQUFBLENBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMiLCJmaWxlIjoidWktc3dpcGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24od2luZG93LCBkb2N1bWVudCwgJCkge1xuXHQvKiEgT3N0ZW9wb3Jvc2lzLmpzIHYwLjAuMiBCeSBUQUtBTkFTSEkgR2lucGVpICovXG5cdHZhciBPc3Rlb3Bvcm9zaXM9ZnVuY3Rpb24oKXt2YXIgdD17fSxpPVwicHJvdG90eXBlXCIsbj1cImV4dGVuZFwiLGU9XG5cdFwidHJpZ2dlclwiLG89XCJhdHRyaWJ1dGVzXCIscj1cIl9saXN0ZW5lcnNcIixzPVtdLnNsaWNlLHU9XCJ1bmRlZmluZWRcIlxuXHQ9PXR5cGVvZiBfPyRbbl06X1tuXSxhPWZ1bmN0aW9uKCl7fTt0W25dPWZ1bmN0aW9uKGUsbyl7ZnVuY3Rpb25cblx0cih0KXt0aGlzLl9fb3N0ZW9wb3Jvc2lzX18odCksdGhpcy5pbml0aWFsaXplKHQpfXJldHVybiByW25dPXRbblxuXHRdLHUocltpXSx0aGlzW2ldLGUpLHUocixvKSxyfTt2YXIgaD10LmV2ZW50UHJvdG90eXBlPXtvbjpcblx0ZnVuY3Rpb24odCxpKXt2YXIgbj10aGlzW3JdO258fChuPXRoaXNbcl09e30pO3ZhciBlPW5bdF07ZXx8KGU9blxuXHRbdF09W10pLGUucHVzaChpKX0sdHJpZ2dlcjpmdW5jdGlvbih0KXt2YXIgaT10aGlzW3JdO2lmKGkmJmlbdF0pXG5cdHt2YXIgbj1zLmNhbGwoYXJndW1lbnRzLDEpO2lbdF0uZm9yRWFjaChmdW5jdGlvbih0KXt0LmFwcGx5KG51bGxcblx0LG4pfSl9fX07cmV0dXJuIHQuTW9kZWw9ZnVuY3Rpb24oKXt9LHQuTW9kZWxbbl09dFtuXSx1KHQuTW9kZWxbaVxuXHRdLHtfX29zdGVvcG9yb3Npc19fOmZ1bmN0aW9uKHQpe3JldHVybiB0aGlzW29dPXt9LHRoaXMuc2V0KHQpfSxcblx0aW5pdGlhbGl6ZTphLHNldDpmdW5jdGlvbih0KXt2YXIgaT10aGlzW29dO2Zvcih2YXIgbiBpbiB0KXt2YXIgclxuXHQ9dFtuXSxzPWlbbl07ciE9PXMmJihpW25dPXIsdGhpc1tlXShcImNoYW5nZTpcIituLHRoaXMsciksdGhpc1tlXShcblx0XCJjaGFuZ2VcIix0aGlzKSl9cmV0dXJuIHRoaXN9LGdldDpmdW5jdGlvbih0KXtyZXR1cm4gdGhpc1tvXVt0XX0sXG5cdG9uOmgub24sdHJpZ2dlcjpoW2VdfSksdC5WaWV3PWZ1bmN0aW9uKCl7fSx0LlZpZXdbbl09dFtuXSx1KHQuXG5cdFZpZXdbaV0se19fb3N0ZW9wb3Jvc2lzX186ZnVuY3Rpb24odCl7dD10fHx7fSx0aGlzLiRlbD0kKHQuZWx8fFxuXHRkb2N1bWVudCl9LGluaXRpYWxpemU6YSwkOmZ1bmN0aW9uKHQpe3JldHVybiB0aGlzLiRlbC5maW5kKHQpfSxcblx0b246aC5vbix0cmlnZ2VyOmhbZV19KSx0fSgpO1xuXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0Ly8gRXh0ZW5kIE9zdGVvcG9yb3Npc1xuXG5cdC8qKlxuXHQgKiBEZWZhdWx0IHZhbHVlcy5cblx0ICogQHR5cGUgT2JqZWN0XG5cdCAqIEBzZWUgI19pbml0aWFsaXplQXR0cmlidXRlc1xuXHQgKi9cblx0T3N0ZW9wb3Jvc2lzLk1vZGVsLnByb3RvdHlwZS5kZWZhdWx0cyA9IHt9O1xuXG5cdC8qKlxuXHQgKiBUaGUgY29uc3RydWN0b3IgZm9yIE1vZGVsLlxuXHQgKiBAb3ZlcndyaXRlIE9zdGVvcG9yb3Npcy5Nb2RlbCNfX29zdGVvcG9yb3Npc19fXG5cdCAqL1xuXHR2YXIgTW9kZWxfYmVmb3JlSW5pdGlhbGl6ZSA9IE9zdGVvcG9yb3Npcy5Nb2RlbC5wcm90b3R5cGUuX19vc3Rlb3Bvcm9zaXNfXztcblx0T3N0ZW9wb3Jvc2lzLk1vZGVsLnByb3RvdHlwZS5fX29zdGVvcG9yb3Npc19fID0gZnVuY3Rpb24oYXR0cikge1xuXHRcdE1vZGVsX2JlZm9yZUluaXRpYWxpemUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0XHR0aGlzLl9pbml0aWFsaXplQXR0cmlidXRlcyhhdHRyKTtcblx0fTtcblxuXHQvKipcblx0ICogU2V0IGRlZmF1bHQgdmFsdWVzIGFzIG93biBhdHRyaWJ1dGVzXG5cdCAqIGlmIHRoZSB2YWx1ZSBpcyBub3Qgc3BlY2lmaWVkIGluIGNvbnN0cnVjdG9yLlxuXHQgKiBAc2VlICNpbml0aWFsaXplXG5cdCAqIEBzZWUgI2RlZmF1bHRzXG5cdCAqL1xuXHRPc3Rlb3Bvcm9zaXMuTW9kZWwucHJvdG90eXBlLl9pbml0aWFsaXplQXR0cmlidXRlcyA9IGZ1bmN0aW9uKHNwZWMpIHtcblx0XHR2YXIgYXR0ciA9IHRoaXMuYXR0cmlidXRlcztcblx0XHR2YXIgZGVmID0gdGhpcy5kZWZhdWx0cztcblx0XHRmb3IgKHZhciBwIGluIGRlZikge1xuXHRcdFx0aWYgKCFzcGVjIHx8ICEocCBpbiBzcGVjKSkge1xuXHRcdFx0XHRhdHRyW3BdID0gZGVmW3BdO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcblxuXHQvKipcblx0ICogQmluZCBvd24gZXZlbnQgbGlzdGVuZXIgdG8gYW4gZXZlbnQuXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBvYmogV2hpY2ggaGFzIGAub24oKWAgbWV0aG9kLlxuXHQgKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBsaXN0ZW5lclxuXHQgKi9cblx0T3N0ZW9wb3Jvc2lzLlZpZXcucHJvdG90eXBlLmxpc3RlblRvID0gZnVuY3Rpb24ob2JqLCB0eXBlLCBsaXN0ZW5lcikge1xuXHRcdG9iai5vbih0eXBlLCBsaXN0ZW5lci5iaW5kKHRoaXMpKTtcblx0fTtcblxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdC8vIFV0aWxcblxuXHQvKipcblx0ICogUmV0dXJuIHRoZSBjbG9zZXN0IGVsZW1lbnQgZnJvbSBzcGVjaWZpZWQgZWxlbWVudC5cblx0ICogQHBhcmFtIHtFbGVtZW50fSBlbFxuXHQgKiBAcGFyYW0ge1N0cmluZ30gc2VsZWN0b3Jcblx0ICogQHJldHVybnMge0VsZW1lbnR9IE9yIGBudWxsYC5cblx0ICovXG5cdGZ1bmN0aW9uIGdldENsb3Nlc3QoZWwsIHNlbGVjdG9yKSB7XG5cdFx0aWYgKGVsLmNsb3Nlc3QpIHtcblx0XHRcdHJldHVybiBlbC5jbG9zZXN0KHNlbGVjdG9yKTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRyZXR1cm4gJChlbCkuY2xvc2VzdChzZWxlY3RvcilbMF07XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybiB0aGUgZWxlbWVudCB3aGljaCBpcyBtYXRjaGVkIHRvIHNwZWNpZmllZCBjb25kaXRpb24uXG5cdCAqIEBwYXJhbSB7QXJyYXl9IGFyclxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayhlbGVtZW50LCBpbmRleCwgYXJyYXkpXG5cdCAqL1xuXHRmdW5jdGlvbiBmaW5kRnJvbUFycmF5KGFyciwgY2FsbGJhY2spIHtcblx0XHRpZiAoYXJyLmZpbmQpIHtcblx0XHRcdHJldHVybiBhcnIuZmluZChjYWxsYmFjayk7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0cmV0dXJuICQuZ3JlcChhcnIsIGNhbGxiYWNrKVswXTtcblx0XHR9XG5cdH1cblxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdC8vIFN0YXR1c1xuXG5cdC8qKlxuXHQgKiBNYW5hZ2UgdXNlciBhY3Rpb24gc3RhdHVzLlxuXHQgKlxuXHQgKiAjIFN0YXR1c1xuXHQgKlxuXHQgKiAgIFdhaXRpbmcgLS0tPiBQcmVhY3Rpb24gLS0tPiBTd2lwaW5nIC0tLT4gU3dpcGVkT3ZlclxuXHQgKiAgICBeICAgICAgICAgICAgfCAgICAgICAgICAgICAgfCAgICAgICAgICAgIHxcblx0ICogICAgfCAgICAgICAgICAgIHYgICAgICAgICAgICAgIHYgICAgICAgICAgICB8XG5cdCAqICAgICstLS0tLS0tLS0tLS0rPC0tLS0tLS0tLS0tLS0rPC0tLS0tLS0tLS0tK1xuXHQgKlxuXHQgKiBAY29uc3RydWN0b3Jcblx0ICovXG5cdHZhciBTdGF0dXMgPSBPc3Rlb3Bvcm9zaXMuTW9kZWwuZXh0ZW5kKHtcblx0XHRUSFJFU0hPTERfWDogMzAsXG5cdFx0VEhSRVNIT0xEX1k6IDMwLFxuXG5cdFx0UEhBU0VfV0FJVElORzogJ3dhaXRpbmcnLFxuXHRcdFBIQVNFX1BSRUFDVElPTjogJ3ByZWFjdGlvbicsXG5cdFx0UEhBU0VfU1dJUElORzogJ3N3aXBpbmcnLFxuXHRcdFBIQVNFX1NXSVBFRE9WRVI6ICdzd2lwZWRPdmVyJyxcblxuXHRcdC8qKlxuXHRcdCAqIERlZmF1bHQgdmFsdWVzLlxuXHRcdCAqL1xuXHRcdGRlZmF1bHRzOiB7XG5cdFx0XHRmcm9tWDogTmFOLCAgLy8gdGhlIG9yaWdpbiBvZiBhY3Rpb25zXG5cdFx0XHRmcm9tWTogTmFOLFxuXHRcdFx0cGhhc2U6IG51bGwsICAvLyAnd2FpdGluZycsICdwcmVhY3Rpb24nLCAnc3dpcGluZycsICdzd2lwZWRPdmVyJ1xuXHRcdFx0Ly8gcHJlbW92aW5nOiBmYWxzZSwgIC8vIHdoZXRoZXIgdXNlciBpcyBmbGlja2luZyB0byBkbyBzb21lIGFjdGlvblxuXHRcdFx0bWF4TGVmdDogTmFOLFxuXHRcdFx0bWluTGVmdDogTmFOLFxuXHRcdFx0Ly8gbW92aW5nWDogZmFsc2UsICAvLyB3aGV0aGVyIHRoZSBlbGVtZW50IGlzIG1vdmluZyBob3Jpem9udGFseVxuXHRcdFx0Ly8gbW92aW5nWTogZmFsc2UgIC8vIHdoZXRoZXIgdGhlIGVsZW1lbnQgaXMgbW92aW5nIHZlcnRpY2FsbHlcblx0XHR9LFxuXG5cdFx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oYXR0cmlidXRlcywgb3B0aW9ucykge1xuXHRcdFx0aWYgKCF0aGlzLmdldCgncGhhc2UnKSkge1xuXHRcdFx0XHR0aGlzLnNldCh7IHBoYXNlOnRoaXMuUEhBU0VfV0FJVElORyB9KTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0aXNXYWl0aW5nOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiAodGhpcy5hdHRyaWJ1dGVzLnBoYXNlID09PSB0aGlzLlBIQVNFX1dBSVRJTkcpO1xuXHRcdH0sXG5cblx0XHRpc1ByZWFjdGlvbjogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gKHRoaXMuYXR0cmlidXRlcy5waGFzZSA9PT0gdGhpcy5QSEFTRV9QUkVBQ1RJT04pO1xuXHRcdH0sXG5cblx0XHRpc1N3aXBpbmc6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuICh0aGlzLmF0dHJpYnV0ZXMucGhhc2UgPT09IHRoaXMuUEhBU0VfU1dJUElORyk7XG5cdFx0fSxcblxuXHRcdGlzU3dpcGVkT3ZlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gKHRoaXMuYXR0cmlidXRlcy5waGFzZSA9PT0gdGhpcy5QSEFTRV9TV0lQRURPVkVSKTtcblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICogV2hldGhlciBzcGVjaWZpZWQgcG9zaXRpb25zIG92ZXJjb21lIHRoZSB0aHJlc2hvbGQuXG5cdFx0ICogQHNlZSAjVEhSRVNIT0xEX1hcblx0XHQgKi9cblx0XHRpc092ZXJUaHJlc2hvbGRYOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBhdHRyID0gdGhpcy5hdHRyaWJ1dGVzO1xuXHRcdFx0dmFyIGRlbHRhID0gYXR0ci5jdXJYIC0gYXR0ci5mcm9tWDtcblx0XHRcdHJldHVybiAoZGVsdGEgPiB0aGlzLlRIUkVTSE9MRF9YIHx8IGRlbHRhIDwgLXRoaXMuVEhSRVNIT0xEX1gpO1xuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBXaGV0aGVyIHNwZWNpZmllZCBwb3NpdGlvbnMgb3ZlcmNvbWUgdGhlIHRocmVzaG9sZC5cblx0XHQgKiBAc2VlICNUSFJFU0hPTERfWVxuXHRcdCAqL1xuXHRcdGlzT3ZlclRocmVzaG9sZFk6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGF0dHIgPSB0aGlzLmF0dHJpYnV0ZXM7XG5cdFx0XHR2YXIgZGVsdGEgPSBhdHRyLmN1clkgLSBhdHRyLmZyb21ZO1xuXHRcdFx0cmV0dXJuIChkZWx0YSA+IHRoaXMuVEhSRVNIT0xEX1kgfHwgZGVsdGEgPCAtdGhpcy5USFJFU0hPTERfWSk7XG5cdFx0fVxuXHR9KTtcblxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdC8vIFVJU3dpcGVcblxuXHQvKipcblx0ICogVUkgZm9yIHN3aXBpbmcuXG5cdCAqIEBjb25zdHJ1Y3RvclxuXHQgKi9cblx0dmFyIFVJU3dpcGUgPSBPc3Rlb3Bvcm9zaXMuVmlldy5leHRlbmQoe1xuXHRcdGluaXRpYWxpemU6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblx0XHRcdHRoaXMuY3JlYXRlJHJvd1Rvb2xzID0gb3B0aW9ucy5jcmVhdGUkcm93VG9vbHM7XG5cblx0XHRcdC8vIHByZXBhcmUgbW9kZWxzXG5cdFx0XHR0aGlzLnN0YXR1cyA9IG5ldyBTdGF0dXMoKTtcblxuXHRcdFx0Ly8gbGlzdGVuIG1vZGVsc1xuXHRcdFx0dmFyIHN0YXR1cyA9IHRoaXMuc3RhdHVzO1xuXHRcdFx0dGhpcy5saXN0ZW5UbyhzdGF0dXMsICdjaGFuZ2U6cGhhc2UnLCB0aGlzLnN0YXR1c19vbmNoYW5nZV9waGFzZSk7XG5cdFx0XHR0aGlzLmxpc3RlblRvKHN0YXR1cywgJ2NoYW5nZTpjdXJYJywgdGhpcy5zdGF0dXNfb25jaGFuZ2VfY3VyWCk7XG5cdFx0XHR0aGlzLmxpc3RlblRvKHN0YXR1cywgJ2NoYW5nZTpkZWx0YVgnLCB0aGlzLnN0YXR1c19vbmNoYW5nZV9kZWx0YVgpO1xuXG5cdFx0XHQvLyBsaXN0ZW4gZWxlbWVudHNcblx0XHRcdHZhciAkZG9jdW1lbnQgPSAkKGRvY3VtZW50KTtcblx0XHRcdHRoaXMubGlzdGVuVG8odGhpcy4kZWwsICdtb3VzZWRvd24nLCB0aGlzLmVsX29ubW91c2Vkb3duKTtcblx0XHRcdHRoaXMubGlzdGVuVG8oJGRvY3VtZW50LCAnbW91c2Vkb3duJywgdGhpcy5kb2N1bWVudF9vbm1vdXNlZG93bik7XG5cdFx0XHR0aGlzLmxpc3RlblRvKCRkb2N1bWVudCwgJ21vdXNlbW92ZScsIHRoaXMuZG9jdW1lbnRfb25tb3VzZW1vdmUpO1xuXHRcdFx0dGhpcy5saXN0ZW5UbygkZG9jdW1lbnQsICdtb3VzZXVwJywgdGhpcy5kb2N1bWVudF9vbm1vdXNldXApO1xuXHRcdFx0dGhpcy5saXN0ZW5Ubyh0aGlzLiRlbCwgJ3RvdWNoc3RhcnQnLCB0aGlzLmVsX29udG91Y2hzdGFydCk7XG5cdFx0XHR0aGlzLmxpc3RlblRvKCRkb2N1bWVudCwgJ3RvdWNoc3RhcnQnLCB0aGlzLmRvY3VtZW50X29udG91Y2hzdGFydCk7XG5cdFx0XHR0aGlzLmxpc3RlblRvKCRkb2N1bWVudCwgJ3RvdWNobW92ZScsIHRoaXMuZG9jdW1lbnRfb250b3VjaG1vdmUpO1xuXHRcdFx0dGhpcy5saXN0ZW5UbygkZG9jdW1lbnQsICd0b3VjaGVuZCcsIHRoaXMuZG9jdW1lbnRfb250b3VjaGVuZCk7XG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIFN0YXJ0IHdoYXRjaGluZyB1c2VyJ3Mgb3BlcmF0aW9uLlxuXHRcdCAqIEBwYXJhbSB7TnVtYmVyfSBwb3NpdGlvbnMueFxuXHRcdCAqIEBwYXJhbSB7TnVtYmVyfSBwb3NpdGlvbnMueVxuXHRcdCAqL1xuXHRcdHN0YXJ0UHJlbW92aW5nOiBmdW5jdGlvbihwb3NpdGlvbnMpIHtcblx0XHRcdHRoaXMuX3NldHVwVG9vbHMoKTtcblx0XHRcdHRoaXMuc3RhdHVzLnNldCh7XG5cdFx0XHRcdGZyb21YOiBwb3NpdGlvbnMueCxcblx0XHRcdFx0ZnJvbVk6IHBvc2l0aW9ucy55XG5cdFx0XHR9KTtcblx0XHRcdHRoaXMuc3RhdHVzLnNldCh7IHByZW1vdmluZzp0cnVlIH0pO1xuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBTZXQgdXAgdG9vbCBidXR0b25zLlxuXHRcdCAqL1xuXHRcdF9zZXR1cFRvb2xzOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciAkcm93ID0gdGhpcy4kZWw7XG5cdFx0XHR2YXIgJHRvb2xzID0gdGhpcy4kcm93VG9vbHM7XG5cblx0XHRcdGlmICghJHRvb2xzKSB7XG5cdFx0XHRcdHRoaXMuX2luaXRSb3dUb29scygpO1xuXHRcdFx0XHR2YXIgJHRvb2xzID0gdGhpcy4kcm93VG9vbHM7XG5cdFx0XHR9XG5cblx0XHRcdCR0b29scy5jc3MoeyBkaXNwbGF5OidibG9jaycgfSk7XG5cblx0XHRcdHZhciBwb3MgPSAkcm93Lm9mZnNldCgpO1xuXHRcdFx0dmFyIGhlaWdodCA9ICRyb3cub3V0ZXJIZWlnaHQoKTtcblx0XHRcdHZhciB3aWR0aCA9ICRyb3cub3V0ZXJXaWR0aCgpO1xuXHRcdFx0JHRvb2xzLmNzcyh7XG5cdFx0XHRcdGhlaWdodDogaGVpZ2h0LFxuXHRcdFx0XHRsaW5lSGVpZ2h0OiBoZWlnaHQrJ3B4Jyxcblx0XHRcdFx0dG9wOiBwb3MudG9wXG5cdFx0XHR9KTtcblxuXHRcdFx0dGhpcy5zdGF0dXMuc2V0KHtcblx0XHRcdFx0bWF4TGVmdDogMCxcblx0XHRcdFx0bWluTGVmdDogLSR0b29scy5vdXRlcldpZHRoKClcblx0XHRcdH0pO1xuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBJbml0aWFsaXplIHJvdyB0b29sIGJ1dHRvbnMuXG5cdFx0ICogUnVuIG9ubHkgZmlyc3QgdGltZS5cblx0XHQgKi9cblx0XHRfaW5pdFJvd1Rvb2xzOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciAkdG9vbHMgPSB0aGlzLmNyZWF0ZSRyb3dUb29scygpO1xuXHRcdFx0dGhpcy4kcm93VG9vbHMgPSAkdG9vbHM7XG5cdFx0XHR0aGlzLmVsUm93VG9vbHMgPSAkdG9vbHNbMF07XG5cblx0XHRcdHRoaXMubGlzdGVuVG8oJHRvb2xzLCAnY2xpY2snLCB0aGlzLnJvd1Rvb2xzX29uY2xpY2spO1xuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBVcGRhdGUgc3RhdHVzIGJlZm9yZSBhY3R1YWwgYmVoYXZpb3Vycy5cblx0XHQgKiBAcGFyYW0ge051bWJlcn0gcG9zaXRpb25zLnhcblx0XHQgKiBAcGFyYW0ge051bWJlcn0gcG9zaXRpb25zLnlcblx0XHQgKi9cblx0XHR1cGRhdGVQcmVtb3Zpbmc6IGZ1bmN0aW9uKHBvc2l0aW9ucykge1xuXHRcdFx0aWYgKHRoaXMuc3RhdHVzLmlzT3ZlclRocmVzaG9sZFkocG9zaXRpb25zKSkge1xuXHRcdFx0XHR0aGlzLnN0YXR1cy5zZXQoeyBtb3ZpbmdZOnRydWUgfSk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmICh0aGlzLnN0YXR1cy5pc092ZXJUaHJlc2hvbGRYKHBvc2l0aW9ucykpIHtcblx0XHRcdFx0dGhpcy5zdGF0dXMuc2V0KHsgbW92aW5nWDp0cnVlIH0pO1xuXHRcdFx0XHR0aGlzLnN0YXR1cy5zZXQoe1xuXHRcdFx0XHRcdGZyb21YOiBwb3NpdGlvbnMueCxcblx0XHRcdFx0XHRmcm9tWTogcG9zaXRpb25zLnlcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIFJlc2V0IG1vdmluZyBmbGFncy5cblx0XHQgKi9cblx0XHRzdG9wTW92aW5nOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuc3RhdHVzLnNldCh7XG5cdFx0XHRcdG1vdmluZ1g6IGZhbHNlLFxuXHRcdFx0XHRtb3ZpbmdZOiBmYWxzZSxcblx0XHRcdFx0cHJlbW92aW5nOiBmYWxzZVxuXHRcdFx0fSk7XG5cdFx0XHR0aGlzLiRlbC5jc3MoeyB0cmFuc2Zvcm06JycgfSk7XG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIFVwZGF0ZSBlbGVtZW50IHN0eWxlcyBieSBwaGFzZXMuXG5cdFx0ICovXG5cdFx0X3VwZGF0ZVBoYXNlOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBzdGF0dXMgPSB0aGlzLnN0YXR1cztcblx0XHRcdHZhciAkZWwgPSB0aGlzLiRlbDtcblxuXHRcdFx0JGVsLnRvZ2dsZUNsYXNzKCd1aS1zd29vc2hUYWJsZS1yb3ctLXN3aXBpbmcnLCBzdGF0dXMuaXNTd2lwaW5nKCkpO1xuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBVcGRhdGUgZWxlbWVudCBwb3NpdGlvbiBieSB0aGUgb3JpZ2luIGFuZCBjdXJyZW50IHBvc2l0aW9ucy5cblx0XHQgKi9cblx0XHRfdXBkYXRlTGVmdDogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgc3RhdHVzID0gdGhpcy5zdGF0dXM7XG5cdFx0XHR2YXIgbWluTGVmdCA9IHN0YXR1cy5nZXQoJ21pbkxlZnQnKTtcblx0XHRcdHZhciBtYXhMZWZ0ID0gc3RhdHVzLmdldCgnbWF4TGVmdCcpO1xuXHRcdFx0dmFyIGR4ID0gc3RhdHVzLmdldCgnZGVsdGFYJyk7XG5cdFx0XHR2YXIgbGVmdCA9IE1hdGgubWluKE1hdGgubWF4KGR4LCBtaW5MZWZ0KSwgbWF4TGVmdCk7XG5cdFx0XHR0aGlzLiRlbC5jc3MoeyB0cmFuc2Zvcm06J3RyYW5zbGF0ZVgoJyArIGxlZnQgKyAncHgpJyB9KTtcblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICogR2V0IHBvaW50ZXIgcG9zaXRpb25zIGZyb20gc3BlY2lmaWVkIHBvaW50ZXIgZXZlbnQuXG5cdFx0ICogQHBhcmFtIHtOdW1iZXJ9IHBvc2l0aW9ucy54XG5cdFx0ICogQHBhcmFtIHtOdW1iZXJ9IHBvc2l0aW9ucy55XG5cdFx0ICovXG5cdFx0Z2V0UG9zaXRpb25zRnJvbUV2ZW50OiBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0ZXZlbnQgPSBldmVudC5vcmlnaW5hbEV2ZW50IHx8IGV2ZW50O1xuXG5cdFx0XHR2YXIgcG9zaXRpb25zO1xuXHRcdFx0aWYgKGV2ZW50LnRvdWNoZXMpIHtcblx0XHRcdFx0cG9zaXRpb25zID0ge1xuXHRcdFx0XHRcdHg6IGV2ZW50LnRvdWNoZXNbMF0ucGFnZVgsXG5cdFx0XHRcdFx0eTogZXZlbnQudG91Y2hlc1swXS5wYWdlWVxuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdHBvc2l0aW9ucyA9IHtcblx0XHRcdFx0XHR4OiBldmVudC5wYWdlWCxcblx0XHRcdFx0XHR5OiBldmVudC5wYWdlWVxuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHBvc2l0aW9ucztcblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICogR2V0IGJhY2sgdG8gdGhlIG9yaWdpbmFsIHBvc2l0aW9uLlxuXHRcdCAqL1xuXHRcdHJlc3RvcmU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5zdGF0dXMuc2V0KHsgcGhhc2U6J3dhaXRpbmcnIH0pO1xuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBEZXRhY2ggcmVzb3VyY2VzLlxuXHRcdCAqL1xuXHRcdGRlc3Ryb3k6IGZ1bmN0aW9uKCkge1xuXHRcdFx0Ly8gTWF5YmUgbm90IGVub3VnaC4uLlxuXG5cdFx0XHR0aGlzLiRlbC5yZW1vdmUoKTtcblx0XHRcdHRoaXMuJHJvd1Rvb2xzLnJlbW92ZSgpO1xuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBSZXR1cm4gdHJ1ZSBpZiBzcGVjaWZpZWQgZXZlbnQgaXMgb2NjdXJlZCBvbiB0b29sIGVsZW1lbnQuXG5cdFx0ICogQHBhcmFtIHtFdmVudH0gZXZlbnRcblx0XHQgKiBAcmV0dXJucyB7Qm9vbGVhbn1cblx0XHQgKi9cblx0XHRpc0V2ZW50T2NjdXJlZE9uUm93VG9vbHM6IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHR2YXIgZWxSb3dUb29scyA9IHRoaXMuZWxSb3dUb29scztcblx0XHRcdHZhciBvblRvb2xzID0gZmFsc2U7XG5cdFx0XHRmb3IgKHZhciBlbD1ldmVudC50YXJnZXQ7IGVsOyBlbD1lbC5wYXJlbnRFbGVtZW50KSB7XG5cdFx0XHRcdGlmIChlbCA9PT0gZWxSb3dUb29scykge1xuXHRcdFx0XHRcdG9uVG9vbHMgPSB0cnVlO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gb25Ub29scztcblx0XHR9LFxuXG5cdFx0c3RhdHVzX29uY2hhbmdlX3BoYXNlOiBmdW5jdGlvbihzdGF0dXMsIHBoYXNlKSB7XG5cdFx0XHR2YXIgYXR0ciA9IHN0YXR1cy5hdHRyaWJ1dGVzO1xuXG5cdFx0XHRpZiAocGhhc2UgPT09IHN0YXR1cy5QSEFTRV9XQUlUSU5HKSB7XG5cdFx0XHRcdHN0YXR1cy5zZXQoe1xuXHRcdFx0XHRcdGN1clg6IE5hTixcblx0XHRcdFx0XHRjdXJZOiBOYU4sXG5cdFx0XHRcdFx0ZGVsdGFYOiAwLFxuXHRcdFx0XHRcdGZyb21YOiBOYU4sXG5cdFx0XHRcdFx0ZnJvbVk6IE5hTlxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHBoYXNlID09PSBzdGF0dXMuUEhBU0VfUFJFQUNUSU9OKSB7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChwaGFzZSA9PT0gc3RhdHVzLlBIQVNFX1NXSVBJTkcpIHtcblx0XHRcdFx0dGhpcy5fc2V0dXBUb29scygpO1xuXHRcdFx0XHRzdGF0dXMuc2V0KHtcblx0XHRcdFx0XHRmcm9tWDogYXR0ci5jdXJYLFxuXHRcdFx0XHRcdGZyb21ZOiBhdHRyLmN1cllcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChwaGFzZSA9PT0gc3RhdHVzLlBIQVNFX1NXSVBFRE9WRVIpIHtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5fdXBkYXRlUGhhc2UoKTtcblx0XHR9LFxuXG5cdFx0c3RhdHVzX29uY2hhbmdlX2N1clg6IGZ1bmN0aW9uKHN0YXR1cywgdmFsdWUpIHtcblx0XHRcdGlmIChzdGF0dXMuaXNQcmVhY3Rpb24oKSkge1xuXHRcdFx0XHRpZiAoc3RhdHVzLmlzT3ZlclRocmVzaG9sZFgoKSkge1xuXHRcdFx0XHRcdHN0YXR1cy5zZXQoeyBwaGFzZTpzdGF0dXMuUEhBU0VfU1dJUElORyB9KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIGlmIChzdGF0dXMuaXNPdmVyVGhyZXNob2xkWSgpKSB7XG5cdFx0XHRcdFx0c3RhdHVzLnNldCh7IHBoYXNlOnN0YXR1cy5QSEFTRV9XQUlUSU5HIH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChzdGF0dXMuaXNTd2lwaW5nKCkpIHtcblx0XHRcdFx0dmFyIGF0dHIgPSBzdGF0dXMuYXR0cmlidXRlcztcblx0XHRcdFx0dmFyIGR4ID0gYXR0ci5jdXJYIC0gYXR0ci5mcm9tWDtcblx0XHRcdFx0c3RhdHVzLnNldCh7IGRlbHRhWDpkeCB9KTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0c3RhdHVzX29uY2hhbmdlX2RlbHRhWDogZnVuY3Rpb24obW9kZWwsIHZhbHVlKSB7XG5cdFx0XHR0aGlzLl91cGRhdGVMZWZ0KCk7XG5cblx0XHRcdGlmICh2YWx1ZSA9PT0gMCkge1xuXHRcdFx0XHRpZiAodGhpcy4kcm93VG9vbHMpIHtcblx0XHRcdFx0XHR0aGlzLiRyb3dUb29scy5jc3MoeyBkaXNwbGF5Oidub25lJyB9KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRlbF9vbm1vdXNlZG93bjogZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHR2YXIgcG9zaXRpb25zID0gdGhpcy5nZXRQb3NpdGlvbnNGcm9tRXZlbnQoZXZlbnQpO1xuXHRcdFx0dmFyIHN0YXR1cyA9IHRoaXMuc3RhdHVzO1xuXG5cdFx0XHRzdGF0dXMuc2V0KHtcblx0XHRcdFx0ZnJvbVg6IHBvc2l0aW9ucy54LFxuXHRcdFx0XHRmcm9tWTogcG9zaXRpb25zLnksXG5cdFx0XHRcdHBoYXNlOiBzdGF0dXMuUEhBU0VfUFJFQUNUSU9OXG5cdFx0XHR9KTtcblx0XHR9LFxuXG5cdFx0ZG9jdW1lbnRfb25tb3VzZWRvd246IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHR2YXIgc3RhdHVzID0gdGhpcy5zdGF0dXM7XG5cblx0XHRcdGlmICghdGhpcy5pc0V2ZW50T2NjdXJlZE9uUm93VG9vbHMoZXZlbnQpICYmIHN0YXR1cy5pc1N3aXBlZE92ZXIoKSkge1xuXHRcdFx0XHRzdGF0dXMuc2V0KHsgcGhhc2U6c3RhdHVzLlBIQVNFX1dBSVRJTkcgfSk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdGRvY3VtZW50X29ubW91c2Vtb3ZlOiBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0dmFyIHN0YXR1cyA9IHRoaXMuc3RhdHVzO1xuXHRcdFx0dmFyIHBvc2l0aW9ucztcblxuXHRcdFx0aWYgKHN0YXR1cy5pc1ByZWFjdGlvbigpIHx8IHN0YXR1cy5pc1N3aXBpbmcoKSkge1xuXHRcdFx0XHRwb3NpdGlvbnMgPSB0aGlzLmdldFBvc2l0aW9uc0Zyb21FdmVudChldmVudCk7XG5cdFx0XHRcdHN0YXR1cy5zZXQoe1xuXHRcdFx0XHRcdGN1clg6IHBvc2l0aW9ucy54LFxuXHRcdFx0XHRcdGN1clk6IHBvc2l0aW9ucy55XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRkb2N1bWVudF9vbm1vdXNldXA6IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHR2YXIgc3RhdHVzID0gdGhpcy5zdGF0dXM7XG5cblx0XHRcdGlmIChzdGF0dXMuZ2V0KCdkZWx0YVgnKSA8IHN0YXR1cy5nZXQoJ21pbkxlZnQnKSkge1xuXHRcdFx0XHRzdGF0dXMuc2V0KHsgcGhhc2U6c3RhdHVzLlBIQVNFX1NXSVBFRE9WRVIgfSk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICghc3RhdHVzLmlzU3dpcGVkT3ZlcigpKSB7XG5cdFx0XHRcdHN0YXR1cy5zZXQoeyBwaGFzZTpzdGF0dXMuUEhBU0VfV0FJVElORyB9KTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0ZWxfb250b3VjaHN0YXJ0OiBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0dmFyIHBvc2l0aW9ucyA9IHRoaXMuZ2V0UG9zaXRpb25zRnJvbUV2ZW50KGV2ZW50KTtcblx0XHRcdHZhciBzdGF0dXMgPSB0aGlzLnN0YXR1cztcblxuXHRcdFx0c3RhdHVzLnNldCh7XG5cdFx0XHRcdGZyb21YOiBwb3NpdGlvbnMueCxcblx0XHRcdFx0ZnJvbVk6IHBvc2l0aW9ucy55LFxuXHRcdFx0XHRwaGFzZTogc3RhdHVzLlBIQVNFX1BSRUFDVElPTlxuXHRcdFx0fSk7XG5cdFx0fSxcblxuXHRcdGRvY3VtZW50X29udG91Y2hzdGFydDogZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdHZhciBzdGF0dXMgPSB0aGlzLnN0YXR1cztcblx0XHRcdGlmIChzdGF0dXMuaXNTd2lwZWRPdmVyKCkpIHtcblx0XHRcdFx0c3RhdHVzLnNldCh7IHBoYXNlOnN0YXR1cy5QSEFTRV9XQUlUSU5HIH0pO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRkb2N1bWVudF9vbnRvdWNobW92ZTogZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdHZhciBzdGF0dXMgPSB0aGlzLnN0YXR1cztcblx0XHRcdHZhciBwb3NpdGlvbjtcblxuXHRcdFx0aWYgKHN0YXR1cy5pc1ByZWFjdGlvbigpIHx8IHN0YXR1cy5pc1N3aXBpbmcoKSkge1xuXHRcdFx0XHRwb3NpdGlvbnMgPSB0aGlzLmdldFBvc2l0aW9uc0Zyb21FdmVudChldmVudCk7XG5cdFx0XHRcdHN0YXR1cy5zZXQoe1xuXHRcdFx0XHRcdGN1clg6IHBvc2l0aW9ucy54LFxuXHRcdFx0XHRcdGN1clk6IHBvc2l0aW9ucy55XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdGlmIChzdGF0dXMuaXNQcmVhY3Rpb24oKSB8fCBzdGF0dXMuaXNTd2lwaW5nKCkpIHtcblx0XHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdGRvY3VtZW50X29udG91Y2hlbmQ6IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHR2YXIgc3RhdHVzID0gdGhpcy5zdGF0dXM7XG5cblx0XHRcdGlmIChzdGF0dXMuZ2V0KCdkZWx0YVgnKSA8IHN0YXR1cy5nZXQoJ21pbkxlZnQnKSkge1xuXHRcdFx0XHRzdGF0dXMuc2V0KHsgcGhhc2U6c3RhdHVzLlBIQVNFX1NXSVBFRE9WRVIgfSk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICghc3RhdHVzLmlzU3dpcGVkT3ZlcigpKSB7XG5cdFx0XHRcdHN0YXR1cy5zZXQoeyBwaGFzZTpzdGF0dXMuUEhBU0VfV0FJVElORyB9KTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0cm93VG9vbHNfb25jbGljazogZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdHZhciBlbEJ1dHRvbiA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KCcudWktc3dvb3NoVGFibGUtdG9vbEJ1dG9uJyk7XG5cdFx0XHR0aGlzLnRyaWdnZXIoJ2NsaWNrJywgdGhpcywgZXZlbnQsIGVsQnV0dG9uKTtcblx0XHR9XG5cdH0pO1xuXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0Ly8gU3dvb3NoVGFibGVcblxuXHR2YXIgU3dvb3NoVGFibGUgPSBPc3Rlb3Bvcm9zaXMuVmlldy5leHRlbmQoe1xuXHRcdC8qKlxuXHRcdCAqIEB0eXBlIEFycmF5XG5cdFx0ICovXG5cdFx0c3ViVmlld3M6IG51bGwsXG5cblx0XHRpbml0aWFsaXplOiBmdW5jdGlvbihvcHRpb25zKSB7XG5cdFx0XHRpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdzdHJpbmcnKSB7XG5cdFx0XHRcdHZhciBzZWxlY3RvciA9IG9wdGlvbnM7XG5cdFx0XHRcdG9wdGlvbnMgPSB7fTtcblx0XHRcdFx0dGhpcy4kZWwgPSAkKHNlbGVjdG9yKTtcblx0XHRcdFx0dGhpcy5lbCA9IHRoaXMuJGVsWzBdO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAob3B0aW9ucy4kcm93VG9vbHMpIHtcblx0XHRcdFx0dGhpcy4kcm93VG9vbHMgPSBvcHRpb25zLiRyb3dUb29scztcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHR0aGlzLiRyb3dUb29scyA9IHRoaXMuX2NyZWF0ZSRyb3dUb29scygpO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLl9pbml0U3ViVmlld3MoKTtcblx0XHR9LFxuXG5cdFx0X2luaXRTdWJWaWV3czogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgdmlld3MgPSB0aGlzLnN1YlZpZXdzID0gW107XG5cdFx0XHR2YXIgJHJvd3MgPSB0aGlzLiQoJz50ciwgPnRib2R5PnRyJyk7XG5cdFx0XHR2YXIgJHJvd1Rvb2xzID0gdGhpcy4kcm93VG9vbHM7XG5cdFx0XHR2YXIgY3JlYXRlJHJvd1Rvb2xzID0gdGhpcy5fY3JlYXRlJHJvd1Rvb2xzLmJpbmQodGhpcyk7XG5cdFx0XHQkcm93cy5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbFJvdykge1xuXHRcdFx0XHR2YXIgdmlldyA9IG5ldyBVSVN3aXBlKHtcblx0XHRcdFx0XHRlbDogZWxSb3csXG5cdFx0XHRcdFx0Y3JlYXRlJHJvd1Rvb2xzOiBjcmVhdGUkcm93VG9vbHMsXG5cdFx0XHRcdH0pO1xuXHRcdFx0XHR0aGlzLmxpc3RlblRvKHZpZXcsICdjbGljaycsIHRoaXMuc3ViVmlld19vbmNsaWNrKTtcblx0XHRcdFx0dmlld3MucHVzaCh2aWV3KTtcblx0XHRcdH0uYmluZCh0aGlzKSk7XG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIENyZWF0ZSBhbiB1bmlxdWUgZWxlbWVudCB3aGljaCBpcyBwcm92aWRlcyBidXR0b25zIGZvciBlYWNoIHJvdy5cblx0XHQgKiBAcmV0dXJucyB7RWxlbWVudH1cblx0XHQgKi9cblx0XHRfY3JlYXRlJHJvd1Rvb2xzOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciAkcm93VG9vbHMgPSAkKHRoaXMuX3RlbXBsYXRlJHJvd1Rvb2xzKHt9KSk7XG5cdFx0XHQkcm93VG9vbHMuYXBwZW5kVG8oZG9jdW1lbnQuYm9keSk7XG5cdFx0XHRyZXR1cm4gJHJvd1Rvb2xzO1xuXHRcdH0sXG5cblx0XHRfdGVtcGxhdGUkcm93VG9vbHM6IGZ1bmN0aW9uKGRhdGEpIHtcblx0XHRcdHZhciBodG1sID1cblx0XHRcdFx0JzxkaXYgY2xhc3M9XCJ1aS1zd29vc2hUYWJsZS1yb3dUb29sc1wiPicgK1xuXHRcdFx0XHRcdCc8YnV0dG9uIGNsYXNzPVwidWktc3dvb3NoVGFibGUtdG9vbEJ1dG9uIHJvd1Rvb2xzLWl0ZW0gcm93VG9vbHMtaXRlbS1kZWxldGVcIj5EZWxldGU8L2J1dHRvbj4nICtcblx0XHRcdFx0XHQnPGJ1dHRvbiBjbGFzcz1cInVpLXN3b29zaFRhYmxlLXRvb2xCdXRvbiByb3dUb29scy1pdGVtIHJvd1Rvb2xzLWl0ZW0tbW92ZVwiPk1vdmU8L2J1dHRvbj4nICtcblx0XHRcdFx0JzwvZGl2Pic7XG5cdFx0XHR2YXIgZWxGYWN0b3J5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cdFx0XHRlbEZhY3RvcnkuaW5zZXJ0QWRqYWNlbnRIVE1MKCdhZnRlcmJlZ2luJywgaHRtbCk7XG5cdFx0XHR2YXIgZWwgPSBlbEZhY3RvcnkuZmlyc3RDaGlsZDtcblx0XHRcdHJldHVybiBlbDtcblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICogUmVtb3ZlIHNwZWNpZmllZCByb3cgYW5kIGl0cyByZXNvdXJjZXMuXG5cdFx0ICogQHBhcmFtIHtVSVN3aXBlfEVsZW1lbnR9IHJvd1xuXHRcdCAqL1xuXHRcdHJlbW92ZVJvdzogZnVuY3Rpb24ocm93KSB7XG5cdFx0XHRpZiAoIShyb3cgaW5zdGFuY2VvZiBVSVN3aXBlKSkge1xuXHRcdFx0XHR2YXIgZWxSb3cgPSByb3c7XG5cdFx0XHRcdHJvdyA9IGZpbmRGcm9tQXJyYXkodGhpcy5zdWJWaWV3cywgZnVuY3Rpb24odmlldykge1xuXHRcdFx0XHRcdHJldHVybiAodmlldy4kZWxbMF0gPT09IGVsUm93KTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHRyb3cuZGVzdHJveSgpO1xuXHRcdH0sXG5cblx0XHRzdWJWaWV3X29uY2xpY2s6IGZ1bmN0aW9uKHZpZXcsIGV2ZW50LCBlbEJ1dHRvbikge1xuXHRcdFx0dGhpcy50cmlnZ2VyKCdjbGljaycsIGV2ZW50LCB2aWV3LCBlbEJ1dHRvbik7XG5cdFx0fVxuXHR9KTtcblxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdC8vIGV4cG9ydFxuXG5cdFVJU3dpcGUuU3RhdHVzID0gU3RhdHVzO1xuXHR3aW5kb3cuVUlTd2lwZSA9IFVJU3dpcGU7XG5cdHdpbmRvdy5Td29vc2hUYWJsZSA9IFN3b29zaFRhYmxlO1xufSkod2luZG93LCBkb2N1bWVudCwgd2luZG93LiQpO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
