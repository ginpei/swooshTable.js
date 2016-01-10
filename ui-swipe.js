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
				$tools = this.$rowTools;
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

			var positions = undefined;
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
			var positions = undefined;

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
			var position = undefined;

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
			var _this = this;

			if (!(row instanceof UISwipe)) {
				(function () {
					var elRow = row;
					row = findFromArray(_this.subViews, function (view) {
						return view.$el[0] === elRow;
					});
				})();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInVpLXN3aXBlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsQ0FBQyxVQUFTLE1BQU0sRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFOztBQUU5QixLQUFJLFlBQVksR0FBQyxZQUFVO0FBQUMsTUFBSSxDQUFDLEdBQUMsRUFBRTtNQUFDLENBQUMsR0FBQyxXQUFXO01BQUMsQ0FBQyxHQUFDLFFBQVE7TUFBQyxDQUFDLEdBQy9ELFNBQVM7TUFBQyxDQUFDLEdBQUMsWUFBWTtNQUFDLENBQUMsR0FBQyxZQUFZO01BQUMsQ0FBQyxHQUFDLEVBQUUsQ0FBQyxLQUFLO01BQUMsQ0FBQyxHQUFDLFdBQVcsSUFDOUQsT0FBTyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7TUFBQyxDQUFDLEdBQUMsU0FBRixDQUFDLEdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxVQUFTLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxZQUN2RCxDQUFDLENBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxFQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUMvRCxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFBO0dBQUMsQ0FBQyxJQUFJLENBQUMsR0FBQyxDQUFDLENBQUMsY0FBYyxHQUFDLEVBQUMsRUFBRSxFQUN4RCxZQUFTLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxRQUFJLENBQUMsR0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFHLENBQUMsR0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsRUFBRSxDQUFBLEFBQUMsQ0FBQyxJQUFJLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFHLENBQUMsR0FBQyxDQUFDLENBQy9ELENBQUMsQ0FBQyxHQUFDLEVBQUUsQ0FBQSxBQUFDLEVBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUFDLEVBQUMsT0FBTyxFQUFDLGlCQUFTLENBQUMsRUFBQztBQUFDLFFBQUksQ0FBQyxHQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFHLENBQUMsSUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQy9EO0FBQUMsU0FBSSxDQUFDLEdBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLE9BQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUMvRCxDQUFDLENBQUMsQ0FBQTtNQUFDLENBQUMsQ0FBQTtLQUFDO0lBQUMsRUFBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssR0FBQyxZQUFVLEVBQUUsRUFBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQy9ELEVBQUMsRUFBQyxnQkFBZ0IsRUFBQywwQkFBUyxDQUFDLEVBQUM7QUFBQyxXQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxFQUFFLEVBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUFDO0FBQzlELGFBQVUsRUFBQyxDQUFDLEVBQUMsR0FBRyxFQUFDLGFBQVMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxDQUFDLEdBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFDO0FBQUMsU0FBSSxDQUFDLEdBQy9ELENBQUMsQ0FBQyxDQUFDLENBQUM7U0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBRyxDQUFDLEtBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxHQUFDLENBQUMsRUFBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDLEVBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUMvRCxRQUFRLEVBQUMsSUFBSSxDQUFDLENBQUEsQUFBQyxDQUFBO0tBQUMsT0FBTyxJQUFJLENBQUE7SUFBQyxFQUFDLEdBQUcsRUFBQyxhQUFTLENBQUMsRUFBQztBQUFDLFdBQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQUM7QUFDL0QsS0FBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLElBQUksR0FBQyxZQUFVLEVBQUUsRUFBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUM3RCxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUMsRUFBQyxnQkFBZ0IsRUFBQywwQkFBUyxDQUFDLEVBQUM7QUFBQyxLQUFDLEdBQUMsQ0FBQyxJQUFFLEVBQUUsRUFBQyxJQUFJLENBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUM3RCxRQUFRLENBQUMsQ0FBQTtJQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsV0FBUyxDQUFDLEVBQUM7QUFBQyxXQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQUM7QUFDOUQsS0FBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFBO0VBQUMsRUFBRTs7Ozs7Ozs7OztBQUFDLEFBVTVCLGFBQVksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyxFQUFFOzs7Ozs7QUFBQyxBQU0zQyxLQUFJLHNCQUFzQixHQUFHLFlBQVksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDO0FBQzNFLGFBQVksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLGdCQUFnQixHQUFHLFVBQVMsSUFBSSxFQUFFO0FBQzlELHdCQUFzQixDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFDOUMsTUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFDO0VBQ2pDOzs7Ozs7OztBQUFDLEFBUUYsYUFBWSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMscUJBQXFCLEdBQUcsVUFBUyxJQUFJLEVBQUU7QUFDbkUsTUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztBQUMzQixNQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO0FBQ3hCLE9BQUssSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFO0FBQ2xCLE9BQUksQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLElBQUksSUFBSSxDQUFBLEFBQUMsRUFBRTtBQUMxQixRQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2pCO0dBQ0Q7RUFDRDs7Ozs7Ozs7QUFBQyxBQVFGLGFBQVksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyxVQUFTLEdBQUcsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFO0FBQ3BFLEtBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztFQUNsQzs7Ozs7Ozs7Ozs7QUFBQyxBQVdGLFVBQVMsVUFBVSxDQUFDLEVBQUUsRUFBRSxRQUFRLEVBQUU7QUFDakMsTUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFO0FBQ2YsVUFBTyxFQUFFLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0dBQzVCLE1BQ0k7QUFDSixVQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDbEM7RUFDRDs7Ozs7OztBQUFBLEFBT0QsVUFBUyxhQUFhLENBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRTtBQUNyQyxNQUFJLEdBQUcsQ0FBQyxJQUFJLEVBQUU7QUFDYixVQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7R0FDMUIsTUFDSTtBQUNKLFVBQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDaEM7RUFDRDs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxBQWlCRCxLQUFJLE1BQU0sR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztBQUN0QyxhQUFXLEVBQUUsRUFBRTtBQUNmLGFBQVcsRUFBRSxFQUFFOztBQUVmLGVBQWEsRUFBRSxTQUFTO0FBQ3hCLGlCQUFlLEVBQUUsV0FBVztBQUM1QixlQUFhLEVBQUUsU0FBUztBQUN4QixrQkFBZ0IsRUFBRSxZQUFZOzs7OztBQUs5QixVQUFRLEVBQUU7QUFDVCxRQUFLLEVBQUUsR0FBRztBQUNWLFFBQUssRUFBRSxHQUFHO0FBQ1YsUUFBSyxFQUFFLElBQUk7O0FBRVgsVUFBTyxFQUFFLEdBQUc7QUFDWixVQUFPLEVBQUUsR0FBRztHQUdaOzs7O0FBRUQsWUFBVSxFQUFFLG9CQUFTLFVBQVUsRUFBRSxPQUFPLEVBQUU7QUFDekMsT0FBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDdkIsUUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBQyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQztJQUN2QztHQUNEOztBQUVELFdBQVMsRUFBRSxxQkFBVztBQUNyQixVQUFRLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxLQUFLLElBQUksQ0FBQyxhQUFhLENBQUU7R0FDdEQ7O0FBRUQsYUFBVyxFQUFFLHVCQUFXO0FBQ3ZCLFVBQVEsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEtBQUssSUFBSSxDQUFDLGVBQWUsQ0FBRTtHQUN4RDs7QUFFRCxXQUFTLEVBQUUscUJBQVc7QUFDckIsVUFBUSxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssS0FBSyxJQUFJLENBQUMsYUFBYSxDQUFFO0dBQ3REOztBQUVELGNBQVksRUFBRSx3QkFBVztBQUN4QixVQUFRLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxLQUFLLElBQUksQ0FBQyxnQkFBZ0IsQ0FBRTtHQUN6RDs7Ozs7O0FBTUQsa0JBQWdCLEVBQUUsNEJBQVc7QUFDNUIsT0FBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztBQUMzQixPQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDbkMsVUFBUSxLQUFLLEdBQUcsSUFBSSxDQUFDLFdBQVcsSUFBSSxLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFFO0dBQy9EOzs7Ozs7QUFNRCxrQkFBZ0IsRUFBRSw0QkFBVztBQUM1QixPQUFJLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO0FBQzNCLE9BQUksS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUNuQyxVQUFRLEtBQUssR0FBRyxJQUFJLENBQUMsV0FBVyxJQUFJLEtBQUssR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUU7R0FDL0Q7RUFDRCxDQUFDOzs7Ozs7Ozs7QUFBQyxBQVNILEtBQUksT0FBTyxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO0FBQ3RDLFlBQVUsRUFBRSxvQkFBUyxPQUFPLEVBQUU7QUFDN0IsT0FBSSxDQUFDLGVBQWUsR0FBRyxPQUFPLENBQUMsZUFBZTs7O0FBQUMsQUFHL0MsT0FBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLE1BQU0sRUFBRTs7O0FBQUMsQUFHM0IsT0FBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztBQUN6QixPQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxjQUFjLEVBQUUsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUM7QUFDbEUsT0FBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsYUFBYSxFQUFFLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0FBQ2hFLE9BQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLGVBQWUsRUFBRSxJQUFJLENBQUMsc0JBQXNCLENBQUM7OztBQUFDLEFBR3BFLE9BQUksU0FBUyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM1QixPQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUMxRCxPQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxXQUFXLEVBQUUsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7QUFDakUsT0FBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0FBQ2pFLE9BQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUM3RCxPQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsWUFBWSxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUM1RCxPQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxZQUFZLEVBQUUsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUM7QUFDbkUsT0FBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0FBQ2pFLE9BQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztHQUMvRDs7Ozs7OztBQU9ELGdCQUFjLEVBQUUsd0JBQVMsU0FBUyxFQUFFO0FBQ25DLE9BQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUNuQixPQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQztBQUNmLFNBQUssRUFBRSxTQUFTLENBQUMsQ0FBQztBQUNsQixTQUFLLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDbEIsQ0FBQyxDQUFDO0FBQ0gsT0FBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxTQUFTLEVBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztHQUNwQzs7Ozs7QUFLRCxhQUFXLEVBQUUsdUJBQVc7QUFDdkIsT0FBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztBQUNwQixPQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDOztBQUU1QixPQUFJLENBQUMsTUFBTSxFQUFFO0FBQ1osUUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO0FBQ3JCLFVBQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQ3hCOztBQUVELFNBQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxPQUFPLEVBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQzs7QUFFaEMsT0FBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ3hCLE9BQUksTUFBTSxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUNoQyxPQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDOUIsU0FBTSxDQUFDLEdBQUcsQ0FBQztBQUNWLFVBQU0sRUFBRSxNQUFNO0FBQ2QsY0FBVSxFQUFFLE1BQU0sR0FBQyxJQUFJO0FBQ3ZCLE9BQUcsRUFBRSxHQUFHLENBQUMsR0FBRztJQUNaLENBQUMsQ0FBQzs7QUFFSCxPQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQztBQUNmLFdBQU8sRUFBRSxDQUFDO0FBQ1YsV0FBTyxFQUFFLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRTtJQUM3QixDQUFDLENBQUM7R0FDSDs7Ozs7O0FBTUQsZUFBYSxFQUFFLHlCQUFXO0FBQ3pCLE9BQUksTUFBTSxHQUFHLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztBQUNwQyxPQUFJLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQztBQUN4QixPQUFJLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFNUIsT0FBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0dBQ3REOzs7Ozs7O0FBT0QsaUJBQWUsRUFBRSx5QkFBUyxTQUFTLEVBQUU7QUFDcEMsT0FBSSxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxFQUFFO0FBQzVDLFFBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsT0FBTyxFQUFDLElBQUksRUFBRSxDQUFDLENBQUM7SUFDbEMsTUFDSSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLEVBQUU7QUFDakQsUUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxPQUFPLEVBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUNsQyxRQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQztBQUNmLFVBQUssRUFBRSxTQUFTLENBQUMsQ0FBQztBQUNsQixVQUFLLEVBQUUsU0FBUyxDQUFDLENBQUM7S0FDbEIsQ0FBQyxDQUFDO0lBQ0g7R0FDRDs7Ozs7QUFLRCxZQUFVLEVBQUUsc0JBQVc7QUFDdEIsT0FBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUM7QUFDZixXQUFPLEVBQUUsS0FBSztBQUNkLFdBQU8sRUFBRSxLQUFLO0FBQ2QsYUFBUyxFQUFFLEtBQUs7SUFDaEIsQ0FBQyxDQUFDO0FBQ0gsT0FBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxTQUFTLEVBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztHQUMvQjs7Ozs7QUFLRCxjQUFZLEVBQUUsd0JBQVc7QUFDeEIsT0FBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztBQUN6QixPQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDOztBQUVuQixNQUFHLENBQUMsV0FBVyxDQUFDLDZCQUE2QixFQUFFLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO0dBQ25FOzs7OztBQUtELGFBQVcsRUFBRSx1QkFBVztBQUN2QixPQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0FBQ3pCLE9BQUksT0FBTyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDcEMsT0FBSSxPQUFPLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNwQyxPQUFJLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzlCLE9BQUksSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDcEQsT0FBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxTQUFTLEVBQUMsYUFBYSxHQUFHLElBQUksR0FBRyxLQUFLLEVBQUUsQ0FBQyxDQUFDO0dBQ3pEOzs7Ozs7O0FBT0QsdUJBQXFCLEVBQUUsK0JBQVMsS0FBSyxFQUFFO0FBQ3RDLFFBQUssR0FBRyxLQUFLLENBQUMsYUFBYSxJQUFJLEtBQUssQ0FBQzs7QUFFckMsT0FBSSxTQUFTLFlBQUEsQ0FBQztBQUNkLE9BQUksS0FBSyxDQUFDLE9BQU8sRUFBRTtBQUNsQixhQUFTLEdBQUc7QUFDWCxNQUFDLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLO0FBQ3pCLE1BQUMsRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUs7S0FDekIsQ0FBQztJQUNGLE1BQ0k7QUFDSixhQUFTLEdBQUc7QUFDWCxNQUFDLEVBQUUsS0FBSyxDQUFDLEtBQUs7QUFDZCxNQUFDLEVBQUUsS0FBSyxDQUFDLEtBQUs7S0FDZCxDQUFDO0lBQ0Y7QUFDRCxVQUFPLFNBQVMsQ0FBQztHQUNqQjs7Ozs7QUFLRCxTQUFPLEVBQUUsbUJBQVc7QUFDbkIsT0FBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztHQUNyQzs7Ozs7QUFLRCxTQUFPLEVBQUUsbUJBQVc7OztBQUduQixPQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ2xCLE9BQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7R0FDeEI7Ozs7Ozs7QUFPRCwwQkFBd0IsRUFBRSxrQ0FBUyxLQUFLLEVBQUU7QUFDekMsT0FBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztBQUNqQyxPQUFJLE9BQU8sR0FBRyxLQUFLLENBQUM7QUFDcEIsUUFBSyxJQUFJLEVBQUUsR0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUMsRUFBRSxDQUFDLGFBQWEsRUFBRTtBQUNsRCxRQUFJLEVBQUUsS0FBSyxVQUFVLEVBQUU7QUFDdEIsWUFBTyxHQUFHLElBQUksQ0FBQztBQUNmLFdBQU07S0FDTjtJQUNEO0FBQ0QsVUFBTyxPQUFPLENBQUM7R0FDZjs7QUFFRCx1QkFBcUIsRUFBRSwrQkFBUyxNQUFNLEVBQUUsS0FBSyxFQUFFO0FBQzlDLE9BQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUM7O0FBRTdCLE9BQUksS0FBSyxLQUFLLE1BQU0sQ0FBQyxhQUFhLEVBQUU7QUFDbkMsVUFBTSxDQUFDLEdBQUcsQ0FBQztBQUNWLFNBQUksRUFBRSxHQUFHO0FBQ1QsU0FBSSxFQUFFLEdBQUc7QUFDVCxXQUFNLEVBQUUsQ0FBQztBQUNULFVBQUssRUFBRSxHQUFHO0FBQ1YsVUFBSyxFQUFFLEdBQUc7S0FDVixDQUFDLENBQUM7SUFDSCxNQUNJLElBQUksS0FBSyxLQUFLLE1BQU0sQ0FBQyxlQUFlLEVBQUUsRUFDMUMsTUFDSSxJQUFJLEtBQUssS0FBSyxNQUFNLENBQUMsYUFBYSxFQUFFO0FBQ3hDLFFBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUNuQixVQUFNLENBQUMsR0FBRyxDQUFDO0FBQ1YsVUFBSyxFQUFFLElBQUksQ0FBQyxJQUFJO0FBQ2hCLFVBQUssRUFBRSxJQUFJLENBQUMsSUFBSTtLQUNoQixDQUFDLENBQUM7SUFDSCxNQUNJLElBQUksS0FBSyxLQUFLLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxFQUMzQzs7QUFFRCxPQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7R0FDcEI7O0FBRUQsc0JBQW9CLEVBQUUsOEJBQVMsTUFBTSxFQUFFLEtBQUssRUFBRTtBQUM3QyxPQUFJLE1BQU0sQ0FBQyxXQUFXLEVBQUUsRUFBRTtBQUN6QixRQUFJLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFO0FBQzlCLFdBQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUM7S0FDM0MsTUFDSSxJQUFJLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFO0FBQ25DLFdBQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUM7S0FDM0M7SUFDRCxNQUNJLElBQUksTUFBTSxDQUFDLFNBQVMsRUFBRSxFQUFFO0FBQzVCLFFBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUM7QUFDN0IsUUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQ2hDLFVBQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxNQUFNLEVBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUMxQjtHQUNEOztBQUVELHdCQUFzQixFQUFFLGdDQUFTLEtBQUssRUFBRSxLQUFLLEVBQUU7QUFDOUMsT0FBSSxDQUFDLFdBQVcsRUFBRSxDQUFDOztBQUVuQixPQUFJLEtBQUssS0FBSyxDQUFDLEVBQUU7QUFDaEIsUUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO0FBQ25CLFNBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQUUsT0FBTyxFQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7S0FDdkM7SUFDRDtHQUNEOztBQUVELGdCQUFjLEVBQUUsd0JBQVMsS0FBSyxFQUFFO0FBQy9CLFFBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUN2QixPQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDbEQsT0FBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQzs7QUFFekIsU0FBTSxDQUFDLEdBQUcsQ0FBQztBQUNWLFNBQUssRUFBRSxTQUFTLENBQUMsQ0FBQztBQUNsQixTQUFLLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFDbEIsU0FBSyxFQUFFLE1BQU0sQ0FBQyxlQUFlO0lBQzdCLENBQUMsQ0FBQztHQUNIOztBQUVELHNCQUFvQixFQUFFLDhCQUFTLEtBQUssRUFBRTtBQUNyQyxPQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDOztBQUV6QixPQUFJLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLEtBQUssQ0FBQyxJQUFJLE1BQU0sQ0FBQyxZQUFZLEVBQUUsRUFBRTtBQUNuRSxVQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxFQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDO0lBQzNDO0dBQ0Q7O0FBRUQsc0JBQW9CLEVBQUUsOEJBQVMsS0FBSyxFQUFFO0FBQ3JDLE9BQUksTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7QUFDekIsT0FBSSxTQUFTLFlBQUEsQ0FBQzs7QUFFZCxPQUFJLE1BQU0sQ0FBQyxXQUFXLEVBQUUsSUFBSSxNQUFNLENBQUMsU0FBUyxFQUFFLEVBQUU7QUFDL0MsYUFBUyxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM5QyxVQUFNLENBQUMsR0FBRyxDQUFDO0FBQ1YsU0FBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0FBQ2pCLFNBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztLQUNqQixDQUFDLENBQUM7SUFDSDtHQUNEOztBQUVELG9CQUFrQixFQUFFLDRCQUFTLEtBQUssRUFBRTtBQUNuQyxPQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDOztBQUV6QixPQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRTtBQUNqRCxVQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxFQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7SUFDOUM7O0FBRUQsT0FBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsRUFBRTtBQUMzQixVQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxFQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDO0lBQzNDO0dBQ0Q7O0FBRUQsaUJBQWUsRUFBRSx5QkFBUyxLQUFLLEVBQUU7QUFDaEMsT0FBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2xELE9BQUksTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7O0FBRXpCLFNBQU0sQ0FBQyxHQUFHLENBQUM7QUFDVixTQUFLLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFDbEIsU0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0FBQ2xCLFNBQUssRUFBRSxNQUFNLENBQUMsZUFBZTtJQUM3QixDQUFDLENBQUM7R0FDSDs7QUFFRCx1QkFBcUIsRUFBRSwrQkFBUyxLQUFLLEVBQUU7QUFDdEMsT0FBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztBQUN6QixPQUFJLE1BQU0sQ0FBQyxZQUFZLEVBQUUsRUFBRTtBQUMxQixVQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxFQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDO0lBQzNDO0dBQ0Q7O0FBRUQsc0JBQW9CLEVBQUUsOEJBQVMsS0FBSyxFQUFFO0FBQ3JDLE9BQUksTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7QUFDekIsT0FBSSxRQUFRLFlBQUEsQ0FBQzs7QUFFYixPQUFJLE1BQU0sQ0FBQyxXQUFXLEVBQUUsSUFBSSxNQUFNLENBQUMsU0FBUyxFQUFFLEVBQUU7QUFDL0MsYUFBUyxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM5QyxVQUFNLENBQUMsR0FBRyxDQUFDO0FBQ1YsU0FBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0FBQ2pCLFNBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztLQUNqQixDQUFDLENBQUM7O0FBRUgsUUFBSSxNQUFNLENBQUMsV0FBVyxFQUFFLElBQUksTUFBTSxDQUFDLFNBQVMsRUFBRSxFQUFFO0FBQy9DLFVBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztLQUN2QjtJQUNEO0dBQ0Q7O0FBRUQscUJBQW1CLEVBQUUsNkJBQVMsS0FBSyxFQUFFO0FBQ3BDLE9BQUksTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7O0FBRXpCLE9BQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFO0FBQ2pELFVBQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUMsTUFBTSxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQztJQUM5Qzs7QUFFRCxPQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxFQUFFO0FBQzNCLFVBQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUM7SUFDM0M7R0FDRDs7QUFFRCxrQkFBZ0IsRUFBRSwwQkFBUyxLQUFLLEVBQUU7QUFDakMsT0FBSSxRQUFRLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsMkJBQTJCLENBQUMsQ0FBQztBQUNqRSxPQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0dBQzdDO0VBQ0QsQ0FBQzs7Ozs7QUFBQyxBQUtILEtBQUksV0FBVyxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDOzs7O0FBSTFDLFVBQVEsRUFBRSxJQUFJOztBQUVkLFlBQVUsRUFBRSxvQkFBUyxPQUFPLEVBQUU7QUFDN0IsT0FBSSxPQUFPLE9BQU8sS0FBSyxRQUFRLEVBQUU7QUFDaEMsUUFBSSxRQUFRLEdBQUcsT0FBTyxDQUFDO0FBQ3ZCLFdBQU8sR0FBRyxFQUFFLENBQUM7QUFDYixRQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN2QixRQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdEI7O0FBRUQsT0FBSSxPQUFPLENBQUMsU0FBUyxFQUFFO0FBQ3RCLFFBQUksQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQztJQUNuQyxNQUNJO0FBQ0osUUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztJQUN6Qzs7QUFFRCxPQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7R0FDckI7O0FBRUQsZUFBYSxFQUFFLHlCQUFXO0FBQ3pCLE9BQUksS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO0FBQy9CLE9BQUksS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUNyQyxPQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO0FBQy9CLE9BQUksZUFBZSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdkQsUUFBSyxDQUFDLElBQUksQ0FBQyxVQUFTLEtBQUssRUFBRSxLQUFLLEVBQUU7QUFDakMsUUFBSSxJQUFJLEdBQUcsSUFBSSxPQUFPLENBQUM7QUFDdEIsT0FBRSxFQUFFLEtBQUs7QUFDVCxvQkFBZSxFQUFFLGVBQWU7S0FDaEMsQ0FBQyxDQUFDO0FBQ0gsUUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUNuRCxTQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2pCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7R0FDZDs7Ozs7O0FBTUQsa0JBQWdCLEVBQUUsNEJBQVc7QUFDNUIsT0FBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQy9DLFlBQVMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2xDLFVBQU8sU0FBUyxDQUFDO0dBQ2pCOztBQUVELG9CQUFrQixFQUFFLDRCQUFTLElBQUksRUFBRTtBQUNsQyxPQUFJLElBQUksR0FDUCx1Q0FBdUMsR0FDdEMsNkZBQTZGLEdBQzdGLHlGQUF5RixHQUMxRixRQUFRLENBQUM7QUFDVixPQUFJLFNBQVMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzlDLFlBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDakQsT0FBSSxFQUFFLEdBQUcsU0FBUyxDQUFDLFVBQVUsQ0FBQztBQUM5QixVQUFPLEVBQUUsQ0FBQztHQUNWOzs7Ozs7QUFNRCxXQUFTLEVBQUUsbUJBQVMsR0FBRyxFQUFFOzs7QUFDeEIsT0FBSSxFQUFFLEdBQUcsWUFBWSxPQUFPLENBQUEsQUFBQyxFQUFFOztBQUM5QixTQUFJLEtBQUssR0FBRyxHQUFHLENBQUM7QUFDaEIsUUFBRyxHQUFHLGFBQWEsQ0FBQyxNQUFLLFFBQVEsRUFBRSxVQUFTLElBQUksRUFBRTtBQUNqRCxhQUFRLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFFO01BQy9CLENBQUMsQ0FBQzs7SUFDSDtBQUNELE1BQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztHQUNkOztBQUVELGlCQUFlLEVBQUUseUJBQVMsSUFBSSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUU7QUFDaEQsT0FBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztHQUM3QztFQUNELENBQUM7Ozs7O0FBQUMsQUFLSCxRQUFPLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztBQUN4QixPQUFNLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztBQUN6QixPQUFNLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztDQUNqQyxDQUFBLENBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMiLCJmaWxlIjoidWktc3dpcGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24od2luZG93LCBkb2N1bWVudCwgJCkge1xuXHQvKiEgT3N0ZW9wb3Jvc2lzLmpzIHYwLjAuMiBCeSBUQUtBTkFTSEkgR2lucGVpICovXG5cdHZhciBPc3Rlb3Bvcm9zaXM9ZnVuY3Rpb24oKXt2YXIgdD17fSxpPVwicHJvdG90eXBlXCIsbj1cImV4dGVuZFwiLGU9XG5cdFwidHJpZ2dlclwiLG89XCJhdHRyaWJ1dGVzXCIscj1cIl9saXN0ZW5lcnNcIixzPVtdLnNsaWNlLHU9XCJ1bmRlZmluZWRcIlxuXHQ9PXR5cGVvZiBfPyRbbl06X1tuXSxhPWZ1bmN0aW9uKCl7fTt0W25dPWZ1bmN0aW9uKGUsbyl7ZnVuY3Rpb25cblx0cih0KXt0aGlzLl9fb3N0ZW9wb3Jvc2lzX18odCksdGhpcy5pbml0aWFsaXplKHQpfXJldHVybiByW25dPXRbblxuXHRdLHUocltpXSx0aGlzW2ldLGUpLHUocixvKSxyfTt2YXIgaD10LmV2ZW50UHJvdG90eXBlPXtvbjpcblx0ZnVuY3Rpb24odCxpKXt2YXIgbj10aGlzW3JdO258fChuPXRoaXNbcl09e30pO3ZhciBlPW5bdF07ZXx8KGU9blxuXHRbdF09W10pLGUucHVzaChpKX0sdHJpZ2dlcjpmdW5jdGlvbih0KXt2YXIgaT10aGlzW3JdO2lmKGkmJmlbdF0pXG5cdHt2YXIgbj1zLmNhbGwoYXJndW1lbnRzLDEpO2lbdF0uZm9yRWFjaChmdW5jdGlvbih0KXt0LmFwcGx5KG51bGxcblx0LG4pfSl9fX07cmV0dXJuIHQuTW9kZWw9ZnVuY3Rpb24oKXt9LHQuTW9kZWxbbl09dFtuXSx1KHQuTW9kZWxbaVxuXHRdLHtfX29zdGVvcG9yb3Npc19fOmZ1bmN0aW9uKHQpe3JldHVybiB0aGlzW29dPXt9LHRoaXMuc2V0KHQpfSxcblx0aW5pdGlhbGl6ZTphLHNldDpmdW5jdGlvbih0KXt2YXIgaT10aGlzW29dO2Zvcih2YXIgbiBpbiB0KXt2YXIgclxuXHQ9dFtuXSxzPWlbbl07ciE9PXMmJihpW25dPXIsdGhpc1tlXShcImNoYW5nZTpcIituLHRoaXMsciksdGhpc1tlXShcblx0XCJjaGFuZ2VcIix0aGlzKSl9cmV0dXJuIHRoaXN9LGdldDpmdW5jdGlvbih0KXtyZXR1cm4gdGhpc1tvXVt0XX0sXG5cdG9uOmgub24sdHJpZ2dlcjpoW2VdfSksdC5WaWV3PWZ1bmN0aW9uKCl7fSx0LlZpZXdbbl09dFtuXSx1KHQuXG5cdFZpZXdbaV0se19fb3N0ZW9wb3Jvc2lzX186ZnVuY3Rpb24odCl7dD10fHx7fSx0aGlzLiRlbD0kKHQuZWx8fFxuXHRkb2N1bWVudCl9LGluaXRpYWxpemU6YSwkOmZ1bmN0aW9uKHQpe3JldHVybiB0aGlzLiRlbC5maW5kKHQpfSxcblx0b246aC5vbix0cmlnZ2VyOmhbZV19KSx0fSgpO1xuXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0Ly8gRXh0ZW5kIE9zdGVvcG9yb3Npc1xuXG5cdC8qKlxuXHQgKiBEZWZhdWx0IHZhbHVlcy5cblx0ICogQHR5cGUgT2JqZWN0XG5cdCAqIEBzZWUgI19pbml0aWFsaXplQXR0cmlidXRlc1xuXHQgKi9cblx0T3N0ZW9wb3Jvc2lzLk1vZGVsLnByb3RvdHlwZS5kZWZhdWx0cyA9IHt9O1xuXG5cdC8qKlxuXHQgKiBUaGUgY29uc3RydWN0b3IgZm9yIE1vZGVsLlxuXHQgKiBAb3ZlcndyaXRlIE9zdGVvcG9yb3Npcy5Nb2RlbCNfX29zdGVvcG9yb3Npc19fXG5cdCAqL1xuXHRsZXQgTW9kZWxfYmVmb3JlSW5pdGlhbGl6ZSA9IE9zdGVvcG9yb3Npcy5Nb2RlbC5wcm90b3R5cGUuX19vc3Rlb3Bvcm9zaXNfXztcblx0T3N0ZW9wb3Jvc2lzLk1vZGVsLnByb3RvdHlwZS5fX29zdGVvcG9yb3Npc19fID0gZnVuY3Rpb24oYXR0cikge1xuXHRcdE1vZGVsX2JlZm9yZUluaXRpYWxpemUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0XHR0aGlzLl9pbml0aWFsaXplQXR0cmlidXRlcyhhdHRyKTtcblx0fTtcblxuXHQvKipcblx0ICogU2V0IGRlZmF1bHQgdmFsdWVzIGFzIG93biBhdHRyaWJ1dGVzXG5cdCAqIGlmIHRoZSB2YWx1ZSBpcyBub3Qgc3BlY2lmaWVkIGluIGNvbnN0cnVjdG9yLlxuXHQgKiBAc2VlICNpbml0aWFsaXplXG5cdCAqIEBzZWUgI2RlZmF1bHRzXG5cdCAqL1xuXHRPc3Rlb3Bvcm9zaXMuTW9kZWwucHJvdG90eXBlLl9pbml0aWFsaXplQXR0cmlidXRlcyA9IGZ1bmN0aW9uKHNwZWMpIHtcblx0XHRsZXQgYXR0ciA9IHRoaXMuYXR0cmlidXRlcztcblx0XHRsZXQgZGVmID0gdGhpcy5kZWZhdWx0cztcblx0XHRmb3IgKGxldCBwIGluIGRlZikge1xuXHRcdFx0aWYgKCFzcGVjIHx8ICEocCBpbiBzcGVjKSkge1xuXHRcdFx0XHRhdHRyW3BdID0gZGVmW3BdO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcblxuXHQvKipcblx0ICogQmluZCBvd24gZXZlbnQgbGlzdGVuZXIgdG8gYW4gZXZlbnQuXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBvYmogV2hpY2ggaGFzIGAub24oKWAgbWV0aG9kLlxuXHQgKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBsaXN0ZW5lclxuXHQgKi9cblx0T3N0ZW9wb3Jvc2lzLlZpZXcucHJvdG90eXBlLmxpc3RlblRvID0gZnVuY3Rpb24ob2JqLCB0eXBlLCBsaXN0ZW5lcikge1xuXHRcdG9iai5vbih0eXBlLCBsaXN0ZW5lci5iaW5kKHRoaXMpKTtcblx0fTtcblxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdC8vIFV0aWxcblxuXHQvKipcblx0ICogUmV0dXJuIHRoZSBjbG9zZXN0IGVsZW1lbnQgZnJvbSBzcGVjaWZpZWQgZWxlbWVudC5cblx0ICogQHBhcmFtIHtFbGVtZW50fSBlbFxuXHQgKiBAcGFyYW0ge1N0cmluZ30gc2VsZWN0b3Jcblx0ICogQHJldHVybnMge0VsZW1lbnR9IE9yIGBudWxsYC5cblx0ICovXG5cdGZ1bmN0aW9uIGdldENsb3Nlc3QoZWwsIHNlbGVjdG9yKSB7XG5cdFx0aWYgKGVsLmNsb3Nlc3QpIHtcblx0XHRcdHJldHVybiBlbC5jbG9zZXN0KHNlbGVjdG9yKTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRyZXR1cm4gJChlbCkuY2xvc2VzdChzZWxlY3RvcilbMF07XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybiB0aGUgZWxlbWVudCB3aGljaCBpcyBtYXRjaGVkIHRvIHNwZWNpZmllZCBjb25kaXRpb24uXG5cdCAqIEBwYXJhbSB7QXJyYXl9IGFyclxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayhlbGVtZW50LCBpbmRleCwgYXJyYXkpXG5cdCAqL1xuXHRmdW5jdGlvbiBmaW5kRnJvbUFycmF5KGFyciwgY2FsbGJhY2spIHtcblx0XHRpZiAoYXJyLmZpbmQpIHtcblx0XHRcdHJldHVybiBhcnIuZmluZChjYWxsYmFjayk7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0cmV0dXJuICQuZ3JlcChhcnIsIGNhbGxiYWNrKVswXTtcblx0XHR9XG5cdH1cblxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdC8vIFN0YXR1c1xuXG5cdC8qKlxuXHQgKiBNYW5hZ2UgdXNlciBhY3Rpb24gc3RhdHVzLlxuXHQgKlxuXHQgKiAjIFN0YXR1c1xuXHQgKlxuXHQgKiAgIFdhaXRpbmcgLS0tPiBQcmVhY3Rpb24gLS0tPiBTd2lwaW5nIC0tLT4gU3dpcGVkT3ZlclxuXHQgKiAgICBeICAgICAgICAgICAgfCAgICAgICAgICAgICAgfCAgICAgICAgICAgIHxcblx0ICogICAgfCAgICAgICAgICAgIHYgICAgICAgICAgICAgIHYgICAgICAgICAgICB8XG5cdCAqICAgICstLS0tLS0tLS0tLS0rPC0tLS0tLS0tLS0tLS0rPC0tLS0tLS0tLS0tK1xuXHQgKlxuXHQgKiBAY29uc3RydWN0b3Jcblx0ICovXG5cdGxldCBTdGF0dXMgPSBPc3Rlb3Bvcm9zaXMuTW9kZWwuZXh0ZW5kKHtcblx0XHRUSFJFU0hPTERfWDogMzAsXG5cdFx0VEhSRVNIT0xEX1k6IDMwLFxuXG5cdFx0UEhBU0VfV0FJVElORzogJ3dhaXRpbmcnLFxuXHRcdFBIQVNFX1BSRUFDVElPTjogJ3ByZWFjdGlvbicsXG5cdFx0UEhBU0VfU1dJUElORzogJ3N3aXBpbmcnLFxuXHRcdFBIQVNFX1NXSVBFRE9WRVI6ICdzd2lwZWRPdmVyJyxcblxuXHRcdC8qKlxuXHRcdCAqIERlZmF1bHQgdmFsdWVzLlxuXHRcdCAqL1xuXHRcdGRlZmF1bHRzOiB7XG5cdFx0XHRmcm9tWDogTmFOLCAgLy8gdGhlIG9yaWdpbiBvZiBhY3Rpb25zXG5cdFx0XHRmcm9tWTogTmFOLFxuXHRcdFx0cGhhc2U6IG51bGwsICAvLyAnd2FpdGluZycsICdwcmVhY3Rpb24nLCAnc3dpcGluZycsICdzd2lwZWRPdmVyJ1xuXHRcdFx0Ly8gcHJlbW92aW5nOiBmYWxzZSwgIC8vIHdoZXRoZXIgdXNlciBpcyBmbGlja2luZyB0byBkbyBzb21lIGFjdGlvblxuXHRcdFx0bWF4TGVmdDogTmFOLFxuXHRcdFx0bWluTGVmdDogTmFOLFxuXHRcdFx0Ly8gbW92aW5nWDogZmFsc2UsICAvLyB3aGV0aGVyIHRoZSBlbGVtZW50IGlzIG1vdmluZyBob3Jpem9udGFseVxuXHRcdFx0Ly8gbW92aW5nWTogZmFsc2UgIC8vIHdoZXRoZXIgdGhlIGVsZW1lbnQgaXMgbW92aW5nIHZlcnRpY2FsbHlcblx0XHR9LFxuXG5cdFx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oYXR0cmlidXRlcywgb3B0aW9ucykge1xuXHRcdFx0aWYgKCF0aGlzLmdldCgncGhhc2UnKSkge1xuXHRcdFx0XHR0aGlzLnNldCh7IHBoYXNlOnRoaXMuUEhBU0VfV0FJVElORyB9KTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0aXNXYWl0aW5nOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiAodGhpcy5hdHRyaWJ1dGVzLnBoYXNlID09PSB0aGlzLlBIQVNFX1dBSVRJTkcpO1xuXHRcdH0sXG5cblx0XHRpc1ByZWFjdGlvbjogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gKHRoaXMuYXR0cmlidXRlcy5waGFzZSA9PT0gdGhpcy5QSEFTRV9QUkVBQ1RJT04pO1xuXHRcdH0sXG5cblx0XHRpc1N3aXBpbmc6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuICh0aGlzLmF0dHJpYnV0ZXMucGhhc2UgPT09IHRoaXMuUEhBU0VfU1dJUElORyk7XG5cdFx0fSxcblxuXHRcdGlzU3dpcGVkT3ZlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gKHRoaXMuYXR0cmlidXRlcy5waGFzZSA9PT0gdGhpcy5QSEFTRV9TV0lQRURPVkVSKTtcblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICogV2hldGhlciBzcGVjaWZpZWQgcG9zaXRpb25zIG92ZXJjb21lIHRoZSB0aHJlc2hvbGQuXG5cdFx0ICogQHNlZSAjVEhSRVNIT0xEX1hcblx0XHQgKi9cblx0XHRpc092ZXJUaHJlc2hvbGRYOiBmdW5jdGlvbigpIHtcblx0XHRcdGxldCBhdHRyID0gdGhpcy5hdHRyaWJ1dGVzO1xuXHRcdFx0bGV0IGRlbHRhID0gYXR0ci5jdXJYIC0gYXR0ci5mcm9tWDtcblx0XHRcdHJldHVybiAoZGVsdGEgPiB0aGlzLlRIUkVTSE9MRF9YIHx8IGRlbHRhIDwgLXRoaXMuVEhSRVNIT0xEX1gpO1xuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBXaGV0aGVyIHNwZWNpZmllZCBwb3NpdGlvbnMgb3ZlcmNvbWUgdGhlIHRocmVzaG9sZC5cblx0XHQgKiBAc2VlICNUSFJFU0hPTERfWVxuXHRcdCAqL1xuXHRcdGlzT3ZlclRocmVzaG9sZFk6IGZ1bmN0aW9uKCkge1xuXHRcdFx0bGV0IGF0dHIgPSB0aGlzLmF0dHJpYnV0ZXM7XG5cdFx0XHRsZXQgZGVsdGEgPSBhdHRyLmN1clkgLSBhdHRyLmZyb21ZO1xuXHRcdFx0cmV0dXJuIChkZWx0YSA+IHRoaXMuVEhSRVNIT0xEX1kgfHwgZGVsdGEgPCAtdGhpcy5USFJFU0hPTERfWSk7XG5cdFx0fVxuXHR9KTtcblxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdC8vIFVJU3dpcGVcblxuXHQvKipcblx0ICogVUkgZm9yIHN3aXBpbmcuXG5cdCAqIEBjb25zdHJ1Y3RvclxuXHQgKi9cblx0bGV0IFVJU3dpcGUgPSBPc3Rlb3Bvcm9zaXMuVmlldy5leHRlbmQoe1xuXHRcdGluaXRpYWxpemU6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblx0XHRcdHRoaXMuY3JlYXRlJHJvd1Rvb2xzID0gb3B0aW9ucy5jcmVhdGUkcm93VG9vbHM7XG5cblx0XHRcdC8vIHByZXBhcmUgbW9kZWxzXG5cdFx0XHR0aGlzLnN0YXR1cyA9IG5ldyBTdGF0dXMoKTtcblxuXHRcdFx0Ly8gbGlzdGVuIG1vZGVsc1xuXHRcdFx0bGV0IHN0YXR1cyA9IHRoaXMuc3RhdHVzO1xuXHRcdFx0dGhpcy5saXN0ZW5UbyhzdGF0dXMsICdjaGFuZ2U6cGhhc2UnLCB0aGlzLnN0YXR1c19vbmNoYW5nZV9waGFzZSk7XG5cdFx0XHR0aGlzLmxpc3RlblRvKHN0YXR1cywgJ2NoYW5nZTpjdXJYJywgdGhpcy5zdGF0dXNfb25jaGFuZ2VfY3VyWCk7XG5cdFx0XHR0aGlzLmxpc3RlblRvKHN0YXR1cywgJ2NoYW5nZTpkZWx0YVgnLCB0aGlzLnN0YXR1c19vbmNoYW5nZV9kZWx0YVgpO1xuXG5cdFx0XHQvLyBsaXN0ZW4gZWxlbWVudHNcblx0XHRcdGxldCAkZG9jdW1lbnQgPSAkKGRvY3VtZW50KTtcblx0XHRcdHRoaXMubGlzdGVuVG8odGhpcy4kZWwsICdtb3VzZWRvd24nLCB0aGlzLmVsX29ubW91c2Vkb3duKTtcblx0XHRcdHRoaXMubGlzdGVuVG8oJGRvY3VtZW50LCAnbW91c2Vkb3duJywgdGhpcy5kb2N1bWVudF9vbm1vdXNlZG93bik7XG5cdFx0XHR0aGlzLmxpc3RlblRvKCRkb2N1bWVudCwgJ21vdXNlbW92ZScsIHRoaXMuZG9jdW1lbnRfb25tb3VzZW1vdmUpO1xuXHRcdFx0dGhpcy5saXN0ZW5UbygkZG9jdW1lbnQsICdtb3VzZXVwJywgdGhpcy5kb2N1bWVudF9vbm1vdXNldXApO1xuXHRcdFx0dGhpcy5saXN0ZW5Ubyh0aGlzLiRlbCwgJ3RvdWNoc3RhcnQnLCB0aGlzLmVsX29udG91Y2hzdGFydCk7XG5cdFx0XHR0aGlzLmxpc3RlblRvKCRkb2N1bWVudCwgJ3RvdWNoc3RhcnQnLCB0aGlzLmRvY3VtZW50X29udG91Y2hzdGFydCk7XG5cdFx0XHR0aGlzLmxpc3RlblRvKCRkb2N1bWVudCwgJ3RvdWNobW92ZScsIHRoaXMuZG9jdW1lbnRfb250b3VjaG1vdmUpO1xuXHRcdFx0dGhpcy5saXN0ZW5UbygkZG9jdW1lbnQsICd0b3VjaGVuZCcsIHRoaXMuZG9jdW1lbnRfb250b3VjaGVuZCk7XG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIFN0YXJ0IHdoYXRjaGluZyB1c2VyJ3Mgb3BlcmF0aW9uLlxuXHRcdCAqIEBwYXJhbSB7TnVtYmVyfSBwb3NpdGlvbnMueFxuXHRcdCAqIEBwYXJhbSB7TnVtYmVyfSBwb3NpdGlvbnMueVxuXHRcdCAqL1xuXHRcdHN0YXJ0UHJlbW92aW5nOiBmdW5jdGlvbihwb3NpdGlvbnMpIHtcblx0XHRcdHRoaXMuX3NldHVwVG9vbHMoKTtcblx0XHRcdHRoaXMuc3RhdHVzLnNldCh7XG5cdFx0XHRcdGZyb21YOiBwb3NpdGlvbnMueCxcblx0XHRcdFx0ZnJvbVk6IHBvc2l0aW9ucy55XG5cdFx0XHR9KTtcblx0XHRcdHRoaXMuc3RhdHVzLnNldCh7IHByZW1vdmluZzp0cnVlIH0pO1xuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBTZXQgdXAgdG9vbCBidXR0b25zLlxuXHRcdCAqL1xuXHRcdF9zZXR1cFRvb2xzOiBmdW5jdGlvbigpIHtcblx0XHRcdGxldCAkcm93ID0gdGhpcy4kZWw7XG5cdFx0XHRsZXQgJHRvb2xzID0gdGhpcy4kcm93VG9vbHM7XG5cblx0XHRcdGlmICghJHRvb2xzKSB7XG5cdFx0XHRcdHRoaXMuX2luaXRSb3dUb29scygpO1xuXHRcdFx0XHQkdG9vbHMgPSB0aGlzLiRyb3dUb29scztcblx0XHRcdH1cblxuXHRcdFx0JHRvb2xzLmNzcyh7IGRpc3BsYXk6J2Jsb2NrJyB9KTtcblxuXHRcdFx0bGV0IHBvcyA9ICRyb3cub2Zmc2V0KCk7XG5cdFx0XHRsZXQgaGVpZ2h0ID0gJHJvdy5vdXRlckhlaWdodCgpO1xuXHRcdFx0bGV0IHdpZHRoID0gJHJvdy5vdXRlcldpZHRoKCk7XG5cdFx0XHQkdG9vbHMuY3NzKHtcblx0XHRcdFx0aGVpZ2h0OiBoZWlnaHQsXG5cdFx0XHRcdGxpbmVIZWlnaHQ6IGhlaWdodCsncHgnLFxuXHRcdFx0XHR0b3A6IHBvcy50b3Bcblx0XHRcdH0pO1xuXG5cdFx0XHR0aGlzLnN0YXR1cy5zZXQoe1xuXHRcdFx0XHRtYXhMZWZ0OiAwLFxuXHRcdFx0XHRtaW5MZWZ0OiAtJHRvb2xzLm91dGVyV2lkdGgoKVxuXHRcdFx0fSk7XG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIEluaXRpYWxpemUgcm93IHRvb2wgYnV0dG9ucy5cblx0XHQgKiBSdW4gb25seSBmaXJzdCB0aW1lLlxuXHRcdCAqL1xuXHRcdF9pbml0Um93VG9vbHM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0bGV0ICR0b29scyA9IHRoaXMuY3JlYXRlJHJvd1Rvb2xzKCk7XG5cdFx0XHR0aGlzLiRyb3dUb29scyA9ICR0b29scztcblx0XHRcdHRoaXMuZWxSb3dUb29scyA9ICR0b29sc1swXTtcblxuXHRcdFx0dGhpcy5saXN0ZW5UbygkdG9vbHMsICdjbGljaycsIHRoaXMucm93VG9vbHNfb25jbGljayk7XG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIFVwZGF0ZSBzdGF0dXMgYmVmb3JlIGFjdHVhbCBiZWhhdmlvdXJzLlxuXHRcdCAqIEBwYXJhbSB7TnVtYmVyfSBwb3NpdGlvbnMueFxuXHRcdCAqIEBwYXJhbSB7TnVtYmVyfSBwb3NpdGlvbnMueVxuXHRcdCAqL1xuXHRcdHVwZGF0ZVByZW1vdmluZzogZnVuY3Rpb24ocG9zaXRpb25zKSB7XG5cdFx0XHRpZiAodGhpcy5zdGF0dXMuaXNPdmVyVGhyZXNob2xkWShwb3NpdGlvbnMpKSB7XG5cdFx0XHRcdHRoaXMuc3RhdHVzLnNldCh7IG1vdmluZ1k6dHJ1ZSB9KTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHRoaXMuc3RhdHVzLmlzT3ZlclRocmVzaG9sZFgocG9zaXRpb25zKSkge1xuXHRcdFx0XHR0aGlzLnN0YXR1cy5zZXQoeyBtb3ZpbmdYOnRydWUgfSk7XG5cdFx0XHRcdHRoaXMuc3RhdHVzLnNldCh7XG5cdFx0XHRcdFx0ZnJvbVg6IHBvc2l0aW9ucy54LFxuXHRcdFx0XHRcdGZyb21ZOiBwb3NpdGlvbnMueVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICogUmVzZXQgbW92aW5nIGZsYWdzLlxuXHRcdCAqL1xuXHRcdHN0b3BNb3Zpbmc6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5zdGF0dXMuc2V0KHtcblx0XHRcdFx0bW92aW5nWDogZmFsc2UsXG5cdFx0XHRcdG1vdmluZ1k6IGZhbHNlLFxuXHRcdFx0XHRwcmVtb3Zpbmc6IGZhbHNlXG5cdFx0XHR9KTtcblx0XHRcdHRoaXMuJGVsLmNzcyh7IHRyYW5zZm9ybTonJyB9KTtcblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICogVXBkYXRlIGVsZW1lbnQgc3R5bGVzIGJ5IHBoYXNlcy5cblx0XHQgKi9cblx0XHRfdXBkYXRlUGhhc2U6IGZ1bmN0aW9uKCkge1xuXHRcdFx0bGV0IHN0YXR1cyA9IHRoaXMuc3RhdHVzO1xuXHRcdFx0bGV0ICRlbCA9IHRoaXMuJGVsO1xuXG5cdFx0XHQkZWwudG9nZ2xlQ2xhc3MoJ3VpLXN3b29zaFRhYmxlLXJvdy0tc3dpcGluZycsIHN0YXR1cy5pc1N3aXBpbmcoKSk7XG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIFVwZGF0ZSBlbGVtZW50IHBvc2l0aW9uIGJ5IHRoZSBvcmlnaW4gYW5kIGN1cnJlbnQgcG9zaXRpb25zLlxuXHRcdCAqL1xuXHRcdF91cGRhdGVMZWZ0OiBmdW5jdGlvbigpIHtcblx0XHRcdGxldCBzdGF0dXMgPSB0aGlzLnN0YXR1cztcblx0XHRcdGxldCBtaW5MZWZ0ID0gc3RhdHVzLmdldCgnbWluTGVmdCcpO1xuXHRcdFx0bGV0IG1heExlZnQgPSBzdGF0dXMuZ2V0KCdtYXhMZWZ0Jyk7XG5cdFx0XHRsZXQgZHggPSBzdGF0dXMuZ2V0KCdkZWx0YVgnKTtcblx0XHRcdGxldCBsZWZ0ID0gTWF0aC5taW4oTWF0aC5tYXgoZHgsIG1pbkxlZnQpLCBtYXhMZWZ0KTtcblx0XHRcdHRoaXMuJGVsLmNzcyh7IHRyYW5zZm9ybTondHJhbnNsYXRlWCgnICsgbGVmdCArICdweCknIH0pO1xuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBHZXQgcG9pbnRlciBwb3NpdGlvbnMgZnJvbSBzcGVjaWZpZWQgcG9pbnRlciBldmVudC5cblx0XHQgKiBAcGFyYW0ge051bWJlcn0gcG9zaXRpb25zLnhcblx0XHQgKiBAcGFyYW0ge051bWJlcn0gcG9zaXRpb25zLnlcblx0XHQgKi9cblx0XHRnZXRQb3NpdGlvbnNGcm9tRXZlbnQ6IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRldmVudCA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQgfHwgZXZlbnQ7XG5cblx0XHRcdGxldCBwb3NpdGlvbnM7XG5cdFx0XHRpZiAoZXZlbnQudG91Y2hlcykge1xuXHRcdFx0XHRwb3NpdGlvbnMgPSB7XG5cdFx0XHRcdFx0eDogZXZlbnQudG91Y2hlc1swXS5wYWdlWCxcblx0XHRcdFx0XHR5OiBldmVudC50b3VjaGVzWzBdLnBhZ2VZXG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0cG9zaXRpb25zID0ge1xuXHRcdFx0XHRcdHg6IGV2ZW50LnBhZ2VYLFxuXHRcdFx0XHRcdHk6IGV2ZW50LnBhZ2VZXG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcG9zaXRpb25zO1xuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBHZXQgYmFjayB0byB0aGUgb3JpZ2luYWwgcG9zaXRpb24uXG5cdFx0ICovXG5cdFx0cmVzdG9yZTogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLnN0YXR1cy5zZXQoeyBwaGFzZTond2FpdGluZycgfSk7XG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIERldGFjaCByZXNvdXJjZXMuXG5cdFx0ICovXG5cdFx0ZGVzdHJveTogZnVuY3Rpb24oKSB7XG5cdFx0XHQvLyBNYXliZSBub3QgZW5vdWdoLi4uXG5cblx0XHRcdHRoaXMuJGVsLnJlbW92ZSgpO1xuXHRcdFx0dGhpcy4kcm93VG9vbHMucmVtb3ZlKCk7XG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIFJldHVybiB0cnVlIGlmIHNwZWNpZmllZCBldmVudCBpcyBvY2N1cmVkIG9uIHRvb2wgZWxlbWVudC5cblx0XHQgKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuXHRcdCAqIEByZXR1cm5zIHtCb29sZWFufVxuXHRcdCAqL1xuXHRcdGlzRXZlbnRPY2N1cmVkT25Sb3dUb29sczogZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGxldCBlbFJvd1Rvb2xzID0gdGhpcy5lbFJvd1Rvb2xzO1xuXHRcdFx0bGV0IG9uVG9vbHMgPSBmYWxzZTtcblx0XHRcdGZvciAobGV0IGVsPWV2ZW50LnRhcmdldDsgZWw7IGVsPWVsLnBhcmVudEVsZW1lbnQpIHtcblx0XHRcdFx0aWYgKGVsID09PSBlbFJvd1Rvb2xzKSB7XG5cdFx0XHRcdFx0b25Ub29scyA9IHRydWU7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiBvblRvb2xzO1xuXHRcdH0sXG5cblx0XHRzdGF0dXNfb25jaGFuZ2VfcGhhc2U6IGZ1bmN0aW9uKHN0YXR1cywgcGhhc2UpIHtcblx0XHRcdGxldCBhdHRyID0gc3RhdHVzLmF0dHJpYnV0ZXM7XG5cblx0XHRcdGlmIChwaGFzZSA9PT0gc3RhdHVzLlBIQVNFX1dBSVRJTkcpIHtcblx0XHRcdFx0c3RhdHVzLnNldCh7XG5cdFx0XHRcdFx0Y3VyWDogTmFOLFxuXHRcdFx0XHRcdGN1clk6IE5hTixcblx0XHRcdFx0XHRkZWx0YVg6IDAsXG5cdFx0XHRcdFx0ZnJvbVg6IE5hTixcblx0XHRcdFx0XHRmcm9tWTogTmFOXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAocGhhc2UgPT09IHN0YXR1cy5QSEFTRV9QUkVBQ1RJT04pIHtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHBoYXNlID09PSBzdGF0dXMuUEhBU0VfU1dJUElORykge1xuXHRcdFx0XHR0aGlzLl9zZXR1cFRvb2xzKCk7XG5cdFx0XHRcdHN0YXR1cy5zZXQoe1xuXHRcdFx0XHRcdGZyb21YOiBhdHRyLmN1clgsXG5cdFx0XHRcdFx0ZnJvbVk6IGF0dHIuY3VyWVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHBoYXNlID09PSBzdGF0dXMuUEhBU0VfU1dJUEVET1ZFUikge1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLl91cGRhdGVQaGFzZSgpO1xuXHRcdH0sXG5cblx0XHRzdGF0dXNfb25jaGFuZ2VfY3VyWDogZnVuY3Rpb24oc3RhdHVzLCB2YWx1ZSkge1xuXHRcdFx0aWYgKHN0YXR1cy5pc1ByZWFjdGlvbigpKSB7XG5cdFx0XHRcdGlmIChzdGF0dXMuaXNPdmVyVGhyZXNob2xkWCgpKSB7XG5cdFx0XHRcdFx0c3RhdHVzLnNldCh7IHBoYXNlOnN0YXR1cy5QSEFTRV9TV0lQSU5HIH0pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgaWYgKHN0YXR1cy5pc092ZXJUaHJlc2hvbGRZKCkpIHtcblx0XHRcdFx0XHRzdGF0dXMuc2V0KHsgcGhhc2U6c3RhdHVzLlBIQVNFX1dBSVRJTkcgfSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHN0YXR1cy5pc1N3aXBpbmcoKSkge1xuXHRcdFx0XHRsZXQgYXR0ciA9IHN0YXR1cy5hdHRyaWJ1dGVzO1xuXHRcdFx0XHRsZXQgZHggPSBhdHRyLmN1clggLSBhdHRyLmZyb21YO1xuXHRcdFx0XHRzdGF0dXMuc2V0KHsgZGVsdGFYOmR4IH0pO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRzdGF0dXNfb25jaGFuZ2VfZGVsdGFYOiBmdW5jdGlvbihtb2RlbCwgdmFsdWUpIHtcblx0XHRcdHRoaXMuX3VwZGF0ZUxlZnQoKTtcblxuXHRcdFx0aWYgKHZhbHVlID09PSAwKSB7XG5cdFx0XHRcdGlmICh0aGlzLiRyb3dUb29scykge1xuXHRcdFx0XHRcdHRoaXMuJHJvd1Rvb2xzLmNzcyh7IGRpc3BsYXk6J25vbmUnIH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdGVsX29ubW91c2Vkb3duOiBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdGxldCBwb3NpdGlvbnMgPSB0aGlzLmdldFBvc2l0aW9uc0Zyb21FdmVudChldmVudCk7XG5cdFx0XHRsZXQgc3RhdHVzID0gdGhpcy5zdGF0dXM7XG5cblx0XHRcdHN0YXR1cy5zZXQoe1xuXHRcdFx0XHRmcm9tWDogcG9zaXRpb25zLngsXG5cdFx0XHRcdGZyb21ZOiBwb3NpdGlvbnMueSxcblx0XHRcdFx0cGhhc2U6IHN0YXR1cy5QSEFTRV9QUkVBQ1RJT05cblx0XHRcdH0pO1xuXHRcdH0sXG5cblx0XHRkb2N1bWVudF9vbm1vdXNlZG93bjogZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGxldCBzdGF0dXMgPSB0aGlzLnN0YXR1cztcblxuXHRcdFx0aWYgKCF0aGlzLmlzRXZlbnRPY2N1cmVkT25Sb3dUb29scyhldmVudCkgJiYgc3RhdHVzLmlzU3dpcGVkT3ZlcigpKSB7XG5cdFx0XHRcdHN0YXR1cy5zZXQoeyBwaGFzZTpzdGF0dXMuUEhBU0VfV0FJVElORyB9KTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0ZG9jdW1lbnRfb25tb3VzZW1vdmU6IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRsZXQgc3RhdHVzID0gdGhpcy5zdGF0dXM7XG5cdFx0XHRsZXQgcG9zaXRpb25zO1xuXG5cdFx0XHRpZiAoc3RhdHVzLmlzUHJlYWN0aW9uKCkgfHwgc3RhdHVzLmlzU3dpcGluZygpKSB7XG5cdFx0XHRcdHBvc2l0aW9ucyA9IHRoaXMuZ2V0UG9zaXRpb25zRnJvbUV2ZW50KGV2ZW50KTtcblx0XHRcdFx0c3RhdHVzLnNldCh7XG5cdFx0XHRcdFx0Y3VyWDogcG9zaXRpb25zLngsXG5cdFx0XHRcdFx0Y3VyWTogcG9zaXRpb25zLnlcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdGRvY3VtZW50X29ubW91c2V1cDogZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGxldCBzdGF0dXMgPSB0aGlzLnN0YXR1cztcblxuXHRcdFx0aWYgKHN0YXR1cy5nZXQoJ2RlbHRhWCcpIDwgc3RhdHVzLmdldCgnbWluTGVmdCcpKSB7XG5cdFx0XHRcdHN0YXR1cy5zZXQoeyBwaGFzZTpzdGF0dXMuUEhBU0VfU1dJUEVET1ZFUiB9KTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCFzdGF0dXMuaXNTd2lwZWRPdmVyKCkpIHtcblx0XHRcdFx0c3RhdHVzLnNldCh7IHBoYXNlOnN0YXR1cy5QSEFTRV9XQUlUSU5HIH0pO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRlbF9vbnRvdWNoc3RhcnQ6IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRsZXQgcG9zaXRpb25zID0gdGhpcy5nZXRQb3NpdGlvbnNGcm9tRXZlbnQoZXZlbnQpO1xuXHRcdFx0bGV0IHN0YXR1cyA9IHRoaXMuc3RhdHVzO1xuXG5cdFx0XHRzdGF0dXMuc2V0KHtcblx0XHRcdFx0ZnJvbVg6IHBvc2l0aW9ucy54LFxuXHRcdFx0XHRmcm9tWTogcG9zaXRpb25zLnksXG5cdFx0XHRcdHBoYXNlOiBzdGF0dXMuUEhBU0VfUFJFQUNUSU9OXG5cdFx0XHR9KTtcblx0XHR9LFxuXG5cdFx0ZG9jdW1lbnRfb250b3VjaHN0YXJ0OiBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0bGV0IHN0YXR1cyA9IHRoaXMuc3RhdHVzO1xuXHRcdFx0aWYgKHN0YXR1cy5pc1N3aXBlZE92ZXIoKSkge1xuXHRcdFx0XHRzdGF0dXMuc2V0KHsgcGhhc2U6c3RhdHVzLlBIQVNFX1dBSVRJTkcgfSk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdGRvY3VtZW50X29udG91Y2htb3ZlOiBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0bGV0IHN0YXR1cyA9IHRoaXMuc3RhdHVzO1xuXHRcdFx0bGV0IHBvc2l0aW9uO1xuXG5cdFx0XHRpZiAoc3RhdHVzLmlzUHJlYWN0aW9uKCkgfHwgc3RhdHVzLmlzU3dpcGluZygpKSB7XG5cdFx0XHRcdHBvc2l0aW9ucyA9IHRoaXMuZ2V0UG9zaXRpb25zRnJvbUV2ZW50KGV2ZW50KTtcblx0XHRcdFx0c3RhdHVzLnNldCh7XG5cdFx0XHRcdFx0Y3VyWDogcG9zaXRpb25zLngsXG5cdFx0XHRcdFx0Y3VyWTogcG9zaXRpb25zLnlcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0aWYgKHN0YXR1cy5pc1ByZWFjdGlvbigpIHx8IHN0YXR1cy5pc1N3aXBpbmcoKSkge1xuXHRcdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0ZG9jdW1lbnRfb250b3VjaGVuZDogZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGxldCBzdGF0dXMgPSB0aGlzLnN0YXR1cztcblxuXHRcdFx0aWYgKHN0YXR1cy5nZXQoJ2RlbHRhWCcpIDwgc3RhdHVzLmdldCgnbWluTGVmdCcpKSB7XG5cdFx0XHRcdHN0YXR1cy5zZXQoeyBwaGFzZTpzdGF0dXMuUEhBU0VfU1dJUEVET1ZFUiB9KTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCFzdGF0dXMuaXNTd2lwZWRPdmVyKCkpIHtcblx0XHRcdFx0c3RhdHVzLnNldCh7IHBoYXNlOnN0YXR1cy5QSEFTRV9XQUlUSU5HIH0pO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRyb3dUb29sc19vbmNsaWNrOiBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0bGV0IGVsQnV0dG9uID0gZXZlbnQudGFyZ2V0LmNsb3Nlc3QoJy51aS1zd29vc2hUYWJsZS10b29sQnV0b24nKTtcblx0XHRcdHRoaXMudHJpZ2dlcignY2xpY2snLCB0aGlzLCBldmVudCwgZWxCdXR0b24pO1xuXHRcdH1cblx0fSk7XG5cblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQvLyBTd29vc2hUYWJsZVxuXG5cdGxldCBTd29vc2hUYWJsZSA9IE9zdGVvcG9yb3Npcy5WaWV3LmV4dGVuZCh7XG5cdFx0LyoqXG5cdFx0ICogQHR5cGUgQXJyYXlcblx0XHQgKi9cblx0XHRzdWJWaWV3czogbnVsbCxcblxuXHRcdGluaXRpYWxpemU6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblx0XHRcdGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ3N0cmluZycpIHtcblx0XHRcdFx0bGV0IHNlbGVjdG9yID0gb3B0aW9ucztcblx0XHRcdFx0b3B0aW9ucyA9IHt9O1xuXHRcdFx0XHR0aGlzLiRlbCA9ICQoc2VsZWN0b3IpO1xuXHRcdFx0XHR0aGlzLmVsID0gdGhpcy4kZWxbMF07XG5cdFx0XHR9XG5cblx0XHRcdGlmIChvcHRpb25zLiRyb3dUb29scykge1xuXHRcdFx0XHR0aGlzLiRyb3dUb29scyA9IG9wdGlvbnMuJHJvd1Rvb2xzO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdHRoaXMuJHJvd1Rvb2xzID0gdGhpcy5fY3JlYXRlJHJvd1Rvb2xzKCk7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuX2luaXRTdWJWaWV3cygpO1xuXHRcdH0sXG5cblx0XHRfaW5pdFN1YlZpZXdzOiBmdW5jdGlvbigpIHtcblx0XHRcdGxldCB2aWV3cyA9IHRoaXMuc3ViVmlld3MgPSBbXTtcblx0XHRcdGxldCAkcm93cyA9IHRoaXMuJCgnPnRyLCA+dGJvZHk+dHInKTtcblx0XHRcdGxldCAkcm93VG9vbHMgPSB0aGlzLiRyb3dUb29scztcblx0XHRcdGxldCBjcmVhdGUkcm93VG9vbHMgPSB0aGlzLl9jcmVhdGUkcm93VG9vbHMuYmluZCh0aGlzKTtcblx0XHRcdCRyb3dzLmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsUm93KSB7XG5cdFx0XHRcdGxldCB2aWV3ID0gbmV3IFVJU3dpcGUoe1xuXHRcdFx0XHRcdGVsOiBlbFJvdyxcblx0XHRcdFx0XHRjcmVhdGUkcm93VG9vbHM6IGNyZWF0ZSRyb3dUb29scyxcblx0XHRcdFx0fSk7XG5cdFx0XHRcdHRoaXMubGlzdGVuVG8odmlldywgJ2NsaWNrJywgdGhpcy5zdWJWaWV3X29uY2xpY2spO1xuXHRcdFx0XHR2aWV3cy5wdXNoKHZpZXcpO1xuXHRcdFx0fS5iaW5kKHRoaXMpKTtcblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICogQ3JlYXRlIGFuIHVuaXF1ZSBlbGVtZW50IHdoaWNoIGlzIHByb3ZpZGVzIGJ1dHRvbnMgZm9yIGVhY2ggcm93LlxuXHRcdCAqIEByZXR1cm5zIHtFbGVtZW50fVxuXHRcdCAqL1xuXHRcdF9jcmVhdGUkcm93VG9vbHM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0bGV0ICRyb3dUb29scyA9ICQodGhpcy5fdGVtcGxhdGUkcm93VG9vbHMoe30pKTtcblx0XHRcdCRyb3dUb29scy5hcHBlbmRUbyhkb2N1bWVudC5ib2R5KTtcblx0XHRcdHJldHVybiAkcm93VG9vbHM7XG5cdFx0fSxcblxuXHRcdF90ZW1wbGF0ZSRyb3dUb29sczogZnVuY3Rpb24oZGF0YSkge1xuXHRcdFx0bGV0IGh0bWwgPVxuXHRcdFx0XHQnPGRpdiBjbGFzcz1cInVpLXN3b29zaFRhYmxlLXJvd1Rvb2xzXCI+JyArXG5cdFx0XHRcdFx0JzxidXR0b24gY2xhc3M9XCJ1aS1zd29vc2hUYWJsZS10b29sQnV0b24gcm93VG9vbHMtaXRlbSByb3dUb29scy1pdGVtLWRlbGV0ZVwiPkRlbGV0ZTwvYnV0dG9uPicgK1xuXHRcdFx0XHRcdCc8YnV0dG9uIGNsYXNzPVwidWktc3dvb3NoVGFibGUtdG9vbEJ1dG9uIHJvd1Rvb2xzLWl0ZW0gcm93VG9vbHMtaXRlbS1tb3ZlXCI+TW92ZTwvYnV0dG9uPicgK1xuXHRcdFx0XHQnPC9kaXY+Jztcblx0XHRcdGxldCBlbEZhY3RvcnkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblx0XHRcdGVsRmFjdG9yeS5pbnNlcnRBZGphY2VudEhUTUwoJ2FmdGVyYmVnaW4nLCBodG1sKTtcblx0XHRcdGxldCBlbCA9IGVsRmFjdG9yeS5maXJzdENoaWxkO1xuXHRcdFx0cmV0dXJuIGVsO1xuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBSZW1vdmUgc3BlY2lmaWVkIHJvdyBhbmQgaXRzIHJlc291cmNlcy5cblx0XHQgKiBAcGFyYW0ge1VJU3dpcGV8RWxlbWVudH0gcm93XG5cdFx0ICovXG5cdFx0cmVtb3ZlUm93OiBmdW5jdGlvbihyb3cpIHtcblx0XHRcdGlmICghKHJvdyBpbnN0YW5jZW9mIFVJU3dpcGUpKSB7XG5cdFx0XHRcdGxldCBlbFJvdyA9IHJvdztcblx0XHRcdFx0cm93ID0gZmluZEZyb21BcnJheSh0aGlzLnN1YlZpZXdzLCBmdW5jdGlvbih2aWV3KSB7XG5cdFx0XHRcdFx0cmV0dXJuICh2aWV3LiRlbFswXSA9PT0gZWxSb3cpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdHJvdy5kZXN0cm95KCk7XG5cdFx0fSxcblxuXHRcdHN1YlZpZXdfb25jbGljazogZnVuY3Rpb24odmlldywgZXZlbnQsIGVsQnV0dG9uKSB7XG5cdFx0XHR0aGlzLnRyaWdnZXIoJ2NsaWNrJywgZXZlbnQsIHZpZXcsIGVsQnV0dG9uKTtcblx0XHR9XG5cdH0pO1xuXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0Ly8gZXhwb3J0XG5cblx0VUlTd2lwZS5TdGF0dXMgPSBTdGF0dXM7XG5cdHdpbmRvdy5VSVN3aXBlID0gVUlTd2lwZTtcblx0d2luZG93LlN3b29zaFRhYmxlID0gU3dvb3NoVGFibGU7XG59KSh3aW5kb3csIGRvY3VtZW50LCB3aW5kb3cuJCk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
