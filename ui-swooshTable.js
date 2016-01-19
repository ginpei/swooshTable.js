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
		defaults: {
			buttons: [{ key: 'delete', label: 'Delete' }]
		},

		initialize: function initialize(options) {
			this.options = {
				buttons: options.buttons || this.defaults.buttons
			};

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
			var $tools = $(this._create$rowTools());
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
		_create$rowTools: function _create$rowTools() {
			var html = '<div class="ui-swooshTable-rowTools">';
			this.options.buttons.concat().reverse().forEach(function (data) {
				html += "<button class=\"ui-swooshTable-toolButon rowTools-item\" data-swooshTable-key=\"" + data.key + "\">" + data.label + "</button>";
			});
			html += '</div>';

			var elFactory = document.createElement('div');
			elFactory.insertAdjacentHTML('afterbegin', html);
			var el = elFactory.firstChild;
			return el;
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
		destroy: function destroy(options) {
			// Maybe not enough...

			options = options || {};
			options.removeDom = options.removeDom !== false;

			if (options.removeDom) {
				this.$el.remove();
			}

			if (this.$rowTools) {
				this.$rowTools.remove();
			}
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

			if (!this.isEventOccuredOnRowTools(event) && status.isSwipedOver()) {
				status.set({ phase: status.PHASE_WAITING });
			}
		},

		document_ontouchmove: function document_ontouchmove(event) {
			var status = this.status;
			var positions = undefined;

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
			var elButton = getClosest(event.target, '.ui-swooshTable-toolButon');
			var data = {
				event: event,
				elButton: elButton,
				key: elButton.getAttribute('data-swooshTable-key')
			};
			this.trigger('clickbutton', this, data);
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
			var html = '<div class="ui-swooshTable-rowTools">' + '<button class="ui-swooshTable-toolButon rowTools-item rowTools-item-delete">Delete</button>' + '</div>';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInVpLXN3b29zaFRhYmxlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsQ0FBQyxVQUFTLE1BQU0sRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFOztBQUU5QixLQUFJLFlBQVksR0FBQyxZQUFVO0FBQUMsTUFBSSxDQUFDLEdBQUMsRUFBRTtNQUFDLENBQUMsR0FBQyxXQUFXO01BQUMsQ0FBQyxHQUFDLFFBQVE7TUFBQyxDQUFDLEdBQy9ELFNBQVM7TUFBQyxDQUFDLEdBQUMsWUFBWTtNQUFDLENBQUMsR0FBQyxZQUFZO01BQUMsQ0FBQyxHQUFDLEVBQUUsQ0FBQyxLQUFLO01BQUMsQ0FBQyxHQUFDLFdBQVcsSUFDOUQsT0FBTyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7TUFBQyxDQUFDLEdBQUMsU0FBRixDQUFDLEdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxVQUFTLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxZQUN2RCxDQUFDLENBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxFQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUMvRCxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFBO0dBQUMsQ0FBQyxJQUFJLENBQUMsR0FBQyxDQUFDLENBQUMsY0FBYyxHQUFDLEVBQUMsRUFBRSxFQUN4RCxZQUFTLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxRQUFJLENBQUMsR0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFHLENBQUMsR0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsRUFBRSxDQUFBLEFBQUMsQ0FBQyxJQUFJLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFHLENBQUMsR0FBQyxDQUFDLENBQy9ELENBQUMsQ0FBQyxHQUFDLEVBQUUsQ0FBQSxBQUFDLEVBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUFDLEVBQUMsT0FBTyxFQUFDLGlCQUFTLENBQUMsRUFBQztBQUFDLFFBQUksQ0FBQyxHQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFHLENBQUMsSUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQy9EO0FBQUMsU0FBSSxDQUFDLEdBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLE9BQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUMvRCxDQUFDLENBQUMsQ0FBQTtNQUFDLENBQUMsQ0FBQTtLQUFDO0lBQUMsRUFBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssR0FBQyxZQUFVLEVBQUUsRUFBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQy9ELEVBQUMsRUFBQyxnQkFBZ0IsRUFBQywwQkFBUyxDQUFDLEVBQUM7QUFBQyxXQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxFQUFFLEVBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUFDO0FBQzlELGFBQVUsRUFBQyxDQUFDLEVBQUMsR0FBRyxFQUFDLGFBQVMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxDQUFDLEdBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFDO0FBQUMsU0FBSSxDQUFDLEdBQy9ELENBQUMsQ0FBQyxDQUFDLENBQUM7U0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBRyxDQUFDLEtBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxHQUFDLENBQUMsRUFBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDLEVBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUMvRCxRQUFRLEVBQUMsSUFBSSxDQUFDLENBQUEsQUFBQyxDQUFBO0tBQUMsT0FBTyxJQUFJLENBQUE7SUFBQyxFQUFDLEdBQUcsRUFBQyxhQUFTLENBQUMsRUFBQztBQUFDLFdBQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQUM7QUFDL0QsS0FBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLElBQUksR0FBQyxZQUFVLEVBQUUsRUFBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUM3RCxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUMsRUFBQyxnQkFBZ0IsRUFBQywwQkFBUyxDQUFDLEVBQUM7QUFBQyxLQUFDLEdBQUMsQ0FBQyxJQUFFLEVBQUUsRUFBQyxJQUFJLENBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUM3RCxRQUFRLENBQUMsQ0FBQTtJQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsV0FBUyxDQUFDLEVBQUM7QUFBQyxXQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQUM7QUFDOUQsS0FBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsT0FB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O0FBTUQsV0FBUyxFQUFFLG1CQUFTLEdBQUcsRUFBRTs7O0FBQ3hCLE9BQUksRUFBRSxHQUFHLFlBQVksT0FBTyxDQUFBLEFBQUMsRUFBRTs7QUFDOUIsU0FBSSxLQUFLLEdBQUcsR0FBRyxDQUFDO0FBQ2hCLFFBQUcsR0FBRyxhQUFhLENBQUMsTUFBSyxRQUFRLEVBQUUsVUFBUyxJQUFJLEVBQUU7QUFDakQsYUFBUSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBRTtNQUMvQixDQUFDLENBQUM7O0lBQ0g7QUFDRCxNQUFHLENBQUMsT0FBTyxFQUFFLENBQUM7R0FDZDs7QUFFRCxpQkFBZSxFQUFFLHlCQUFTLElBQUksRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFO0FBQ2hELE9BQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7R0FDN0M7RUFDRCxDQUFDOzs7OztBQUFDLEFBS0gsUUFBTyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7QUFDeEIsT0FBTSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7QUFDekIsT0FBTSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7Q0FDakMsQ0FBQSxDQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDIiwiZmlsZSI6InVpLXN3b29zaFRhYmxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKHdpbmRvdywgZG9jdW1lbnQsICQpIHtcblx0LyohIE9zdGVvcG9yb3Npcy5qcyB2MC4wLjIgQnkgVEFLQU5BU0hJIEdpbnBlaSAqL1xuXHR2YXIgT3N0ZW9wb3Jvc2lzPWZ1bmN0aW9uKCl7dmFyIHQ9e30saT1cInByb3RvdHlwZVwiLG49XCJleHRlbmRcIixlPVxuXHRcInRyaWdnZXJcIixvPVwiYXR0cmlidXRlc1wiLHI9XCJfbGlzdGVuZXJzXCIscz1bXS5zbGljZSx1PVwidW5kZWZpbmVkXCJcblx0PT10eXBlb2YgXz8kW25dOl9bbl0sYT1mdW5jdGlvbigpe307dFtuXT1mdW5jdGlvbihlLG8pe2Z1bmN0aW9uXG5cdHIodCl7dGhpcy5fX29zdGVvcG9yb3Npc19fKHQpLHRoaXMuaW5pdGlhbGl6ZSh0KX1yZXR1cm4gcltuXT10W25cblx0XSx1KHJbaV0sdGhpc1tpXSxlKSx1KHIsbykscn07dmFyIGg9dC5ldmVudFByb3RvdHlwZT17b246XG5cdGZ1bmN0aW9uKHQsaSl7dmFyIG49dGhpc1tyXTtufHwobj10aGlzW3JdPXt9KTt2YXIgZT1uW3RdO2V8fChlPW5cblx0W3RdPVtdKSxlLnB1c2goaSl9LHRyaWdnZXI6ZnVuY3Rpb24odCl7dmFyIGk9dGhpc1tyXTtpZihpJiZpW3RdKVxuXHR7dmFyIG49cy5jYWxsKGFyZ3VtZW50cywxKTtpW3RdLmZvckVhY2goZnVuY3Rpb24odCl7dC5hcHBseShudWxsXG5cdCxuKX0pfX19O3JldHVybiB0Lk1vZGVsPWZ1bmN0aW9uKCl7fSx0Lk1vZGVsW25dPXRbbl0sdSh0Lk1vZGVsW2lcblx0XSx7X19vc3Rlb3Bvcm9zaXNfXzpmdW5jdGlvbih0KXtyZXR1cm4gdGhpc1tvXT17fSx0aGlzLnNldCh0KX0sXG5cdGluaXRpYWxpemU6YSxzZXQ6ZnVuY3Rpb24odCl7dmFyIGk9dGhpc1tvXTtmb3IodmFyIG4gaW4gdCl7dmFyIHJcblx0PXRbbl0scz1pW25dO3IhPT1zJiYoaVtuXT1yLHRoaXNbZV0oXCJjaGFuZ2U6XCIrbix0aGlzLHIpLHRoaXNbZV0oXG5cdFwiY2hhbmdlXCIsdGhpcykpfXJldHVybiB0aGlzfSxnZXQ6ZnVuY3Rpb24odCl7cmV0dXJuIHRoaXNbb11bdF19LFxuXHRvbjpoLm9uLHRyaWdnZXI6aFtlXX0pLHQuVmlldz1mdW5jdGlvbigpe30sdC5WaWV3W25dPXRbbl0sdSh0LlxuXHRWaWV3W2ldLHtfX29zdGVvcG9yb3Npc19fOmZ1bmN0aW9uKHQpe3Q9dHx8e30sdGhpcy4kZWw9JCh0LmVsfHxcblx0ZG9jdW1lbnQpfSxpbml0aWFsaXplOmEsJDpmdW5jdGlvbih0KXtyZXR1cm4gdGhpcy4kZWwuZmluZCh0KX0sXG5cdG9uOmgub24sdHJpZ2dlcjpoW2VdfSksdH0oKTtcblxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdC8vIEV4dGVuZCBPc3Rlb3Bvcm9zaXNcblxuXHQvKipcblx0ICogRGVmYXVsdCB2YWx1ZXMuXG5cdCAqIEB0eXBlIE9iamVjdFxuXHQgKiBAc2VlICNfaW5pdGlhbGl6ZUF0dHJpYnV0ZXNcblx0ICovXG5cdE9zdGVvcG9yb3Npcy5Nb2RlbC5wcm90b3R5cGUuZGVmYXVsdHMgPSB7fTtcblxuXHQvKipcblx0ICogVGhlIGNvbnN0cnVjdG9yIGZvciBNb2RlbC5cblx0ICogQG92ZXJ3cml0ZSBPc3Rlb3Bvcm9zaXMuTW9kZWwjX19vc3Rlb3Bvcm9zaXNfX1xuXHQgKi9cblx0bGV0IE1vZGVsX2JlZm9yZUluaXRpYWxpemUgPSBPc3Rlb3Bvcm9zaXMuTW9kZWwucHJvdG90eXBlLl9fb3N0ZW9wb3Jvc2lzX187XG5cdE9zdGVvcG9yb3Npcy5Nb2RlbC5wcm90b3R5cGUuX19vc3Rlb3Bvcm9zaXNfXyA9IGZ1bmN0aW9uKGF0dHIpIHtcblx0XHRNb2RlbF9iZWZvcmVJbml0aWFsaXplLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdFx0dGhpcy5faW5pdGlhbGl6ZUF0dHJpYnV0ZXMoYXR0cik7XG5cdH07XG5cblx0LyoqXG5cdCAqIFNldCBkZWZhdWx0IHZhbHVlcyBhcyBvd24gYXR0cmlidXRlc1xuXHQgKiBpZiB0aGUgdmFsdWUgaXMgbm90IHNwZWNpZmllZCBpbiBjb25zdHJ1Y3Rvci5cblx0ICogQHNlZSAjaW5pdGlhbGl6ZVxuXHQgKiBAc2VlICNkZWZhdWx0c1xuXHQgKi9cblx0T3N0ZW9wb3Jvc2lzLk1vZGVsLnByb3RvdHlwZS5faW5pdGlhbGl6ZUF0dHJpYnV0ZXMgPSBmdW5jdGlvbihzcGVjKSB7XG5cdFx0bGV0IGF0dHIgPSB0aGlzLmF0dHJpYnV0ZXM7XG5cdFx0bGV0IGRlZiA9IHRoaXMuZGVmYXVsdHM7XG5cdFx0Zm9yIChsZXQgcCBpbiBkZWYpIHtcblx0XHRcdGlmICghc3BlYyB8fCAhKHAgaW4gc3BlYykpIHtcblx0XHRcdFx0YXR0cltwXSA9IGRlZltwXTtcblx0XHRcdH1cblx0XHR9XG5cdH07XG5cblx0LyoqXG5cdCAqIEJpbmQgb3duIGV2ZW50IGxpc3RlbmVyIHRvIGFuIGV2ZW50LlxuXHQgKiBAcGFyYW0ge09iamVjdH0gb2JqIFdoaWNoIGhhcyBgLm9uKClgIG1ldGhvZC5cblx0ICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gbGlzdGVuZXJcblx0ICovXG5cdE9zdGVvcG9yb3Npcy5WaWV3LnByb3RvdHlwZS5saXN0ZW5UbyA9IGZ1bmN0aW9uKG9iaiwgdHlwZSwgbGlzdGVuZXIpIHtcblx0XHRvYmoub24odHlwZSwgbGlzdGVuZXIuYmluZCh0aGlzKSk7XG5cdH07XG5cblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQvLyBVdGlsXG5cblx0LyoqXG5cdCAqIFJldHVybiB0aGUgY2xvc2VzdCBlbGVtZW50IGZyb20gc3BlY2lmaWVkIGVsZW1lbnQuXG5cdCAqIEBwYXJhbSB7RWxlbWVudH0gZWxcblx0ICogQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yXG5cdCAqIEByZXR1cm5zIHtFbGVtZW50fSBPciBgbnVsbGAuXG5cdCAqL1xuXHRmdW5jdGlvbiBnZXRDbG9zZXN0KGVsLCBzZWxlY3Rvcikge1xuXHRcdGlmIChlbC5jbG9zZXN0KSB7XG5cdFx0XHRyZXR1cm4gZWwuY2xvc2VzdChzZWxlY3Rvcik7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0cmV0dXJuICQoZWwpLmNsb3Nlc3Qoc2VsZWN0b3IpWzBdO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm4gdGhlIGVsZW1lbnQgd2hpY2ggaXMgbWF0Y2hlZCB0byBzcGVjaWZpZWQgY29uZGl0aW9uLlxuXHQgKiBAcGFyYW0ge0FycmF5fSBhcnJcblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2soZWxlbWVudCwgaW5kZXgsIGFycmF5KVxuXHQgKi9cblx0ZnVuY3Rpb24gZmluZEZyb21BcnJheShhcnIsIGNhbGxiYWNrKSB7XG5cdFx0aWYgKGFyci5maW5kKSB7XG5cdFx0XHRyZXR1cm4gYXJyLmZpbmQoY2FsbGJhY2spO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdHJldHVybiAkLmdyZXAoYXJyLCBjYWxsYmFjaylbMF07XG5cdFx0fVxuXHR9XG5cblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQvLyBTdGF0dXNcblxuXHQvKipcblx0ICogTWFuYWdlIHVzZXIgYWN0aW9uIHN0YXR1cy5cblx0ICpcblx0ICogIyBTdGF0dXNcblx0ICpcblx0ICogICBXYWl0aW5nIC0tLT4gUHJlYWN0aW9uIC0tLT4gU3dpcGluZyAtLS0+IFN3aXBlZE92ZXJcblx0ICogICAgXiAgICAgICAgICAgIHwgICAgICAgICAgICAgIHwgICAgICAgICAgICB8XG5cdCAqICAgIHwgICAgICAgICAgICB2ICAgICAgICAgICAgICB2ICAgICAgICAgICAgfFxuXHQgKiAgICArLS0tLS0tLS0tLS0tKzwtLS0tLS0tLS0tLS0tKzwtLS0tLS0tLS0tLStcblx0ICpcblx0ICogQGNvbnN0cnVjdG9yXG5cdCAqL1xuXHRsZXQgU3RhdHVzID0gT3N0ZW9wb3Jvc2lzLk1vZGVsLmV4dGVuZCh7XG5cdFx0VEhSRVNIT0xEX1g6IDMwLFxuXHRcdFRIUkVTSE9MRF9ZOiAzMCxcblxuXHRcdFBIQVNFX1dBSVRJTkc6ICd3YWl0aW5nJyxcblx0XHRQSEFTRV9QUkVBQ1RJT046ICdwcmVhY3Rpb24nLFxuXHRcdFBIQVNFX1NXSVBJTkc6ICdzd2lwaW5nJyxcblx0XHRQSEFTRV9TV0lQRURPVkVSOiAnc3dpcGVkT3ZlcicsXG5cblx0XHQvKipcblx0XHQgKiBEZWZhdWx0IHZhbHVlcy5cblx0XHQgKi9cblx0XHRkZWZhdWx0czoge1xuXHRcdFx0ZnJvbVg6IE5hTiwgIC8vIHRoZSBvcmlnaW4gb2YgYWN0aW9uc1xuXHRcdFx0ZnJvbVk6IE5hTixcblx0XHRcdHBoYXNlOiBudWxsLCAgLy8gJ3dhaXRpbmcnLCAncHJlYWN0aW9uJywgJ3N3aXBpbmcnLCAnc3dpcGVkT3Zlcidcblx0XHRcdC8vIHByZW1vdmluZzogZmFsc2UsICAvLyB3aGV0aGVyIHVzZXIgaXMgZmxpY2tpbmcgdG8gZG8gc29tZSBhY3Rpb25cblx0XHRcdG1heExlZnQ6IE5hTixcblx0XHRcdG1pbkxlZnQ6IE5hTixcblx0XHRcdC8vIG1vdmluZ1g6IGZhbHNlLCAgLy8gd2hldGhlciB0aGUgZWxlbWVudCBpcyBtb3ZpbmcgaG9yaXpvbnRhbHlcblx0XHRcdC8vIG1vdmluZ1k6IGZhbHNlICAvLyB3aGV0aGVyIHRoZSBlbGVtZW50IGlzIG1vdmluZyB2ZXJ0aWNhbGx5XG5cdFx0fSxcblxuXHRcdGluaXRpYWxpemU6IGZ1bmN0aW9uKGF0dHJpYnV0ZXMsIG9wdGlvbnMpIHtcblx0XHRcdGlmICghdGhpcy5nZXQoJ3BoYXNlJykpIHtcblx0XHRcdFx0dGhpcy5zZXQoeyBwaGFzZTp0aGlzLlBIQVNFX1dBSVRJTkcgfSk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdGlzV2FpdGluZzogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gKHRoaXMuYXR0cmlidXRlcy5waGFzZSA9PT0gdGhpcy5QSEFTRV9XQUlUSU5HKTtcblx0XHR9LFxuXG5cdFx0aXNQcmVhY3Rpb246IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuICh0aGlzLmF0dHJpYnV0ZXMucGhhc2UgPT09IHRoaXMuUEhBU0VfUFJFQUNUSU9OKTtcblx0XHR9LFxuXG5cdFx0aXNTd2lwaW5nOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiAodGhpcy5hdHRyaWJ1dGVzLnBoYXNlID09PSB0aGlzLlBIQVNFX1NXSVBJTkcpO1xuXHRcdH0sXG5cblx0XHRpc1N3aXBlZE92ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuICh0aGlzLmF0dHJpYnV0ZXMucGhhc2UgPT09IHRoaXMuUEhBU0VfU1dJUEVET1ZFUik7XG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIFdoZXRoZXIgc3BlY2lmaWVkIHBvc2l0aW9ucyBvdmVyY29tZSB0aGUgdGhyZXNob2xkLlxuXHRcdCAqIEBzZWUgI1RIUkVTSE9MRF9YXG5cdFx0ICovXG5cdFx0aXNPdmVyVGhyZXNob2xkWDogZnVuY3Rpb24oKSB7XG5cdFx0XHRsZXQgYXR0ciA9IHRoaXMuYXR0cmlidXRlcztcblx0XHRcdGxldCBkZWx0YSA9IGF0dHIuY3VyWCAtIGF0dHIuZnJvbVg7XG5cdFx0XHRyZXR1cm4gKGRlbHRhID4gdGhpcy5USFJFU0hPTERfWCB8fCBkZWx0YSA8IC10aGlzLlRIUkVTSE9MRF9YKTtcblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICogV2hldGhlciBzcGVjaWZpZWQgcG9zaXRpb25zIG92ZXJjb21lIHRoZSB0aHJlc2hvbGQuXG5cdFx0ICogQHNlZSAjVEhSRVNIT0xEX1lcblx0XHQgKi9cblx0XHRpc092ZXJUaHJlc2hvbGRZOiBmdW5jdGlvbigpIHtcblx0XHRcdGxldCBhdHRyID0gdGhpcy5hdHRyaWJ1dGVzO1xuXHRcdFx0bGV0IGRlbHRhID0gYXR0ci5jdXJZIC0gYXR0ci5mcm9tWTtcblx0XHRcdHJldHVybiAoZGVsdGEgPiB0aGlzLlRIUkVTSE9MRF9ZIHx8IGRlbHRhIDwgLXRoaXMuVEhSRVNIT0xEX1kpO1xuXHRcdH1cblx0fSk7XG5cblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQvLyBVSVN3aXBlXG5cblx0LyoqXG5cdCAqIFVJIGZvciBzd2lwaW5nLlxuXHQgKiBAY29uc3RydWN0b3Jcblx0ICovXG5cdGxldCBVSVN3aXBlID0gT3N0ZW9wb3Jvc2lzLlZpZXcuZXh0ZW5kKHtcblx0XHRkZWZhdWx0czoge1xuXHRcdFx0YnV0dG9uczogWyB7IGtleTonZGVsZXRlJywgbGFiZWw6J0RlbGV0ZScgfSBdXG5cdFx0fSxcblxuXHRcdGluaXRpYWxpemU6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblx0XHRcdHRoaXMub3B0aW9ucyA9IHtcblx0XHRcdFx0YnV0dG9uczogb3B0aW9ucy5idXR0b25zIHx8IHRoaXMuZGVmYXVsdHMuYnV0dG9uc1xuXHRcdFx0fTtcblxuXHRcdFx0Ly8gcHJlcGFyZSBtb2RlbHNcblx0XHRcdHRoaXMuc3RhdHVzID0gbmV3IFN0YXR1cygpO1xuXG5cdFx0XHQvLyBsaXN0ZW4gbW9kZWxzXG5cdFx0XHRsZXQgc3RhdHVzID0gdGhpcy5zdGF0dXM7XG5cdFx0XHR0aGlzLmxpc3RlblRvKHN0YXR1cywgJ2NoYW5nZTpwaGFzZScsIHRoaXMuc3RhdHVzX29uY2hhbmdlX3BoYXNlKTtcblx0XHRcdHRoaXMubGlzdGVuVG8oc3RhdHVzLCAnY2hhbmdlOmN1clgnLCB0aGlzLnN0YXR1c19vbmNoYW5nZV9jdXJYKTtcblx0XHRcdHRoaXMubGlzdGVuVG8oc3RhdHVzLCAnY2hhbmdlOmRlbHRhWCcsIHRoaXMuc3RhdHVzX29uY2hhbmdlX2RlbHRhWCk7XG5cblx0XHRcdC8vIGxpc3RlbiBlbGVtZW50c1xuXHRcdFx0bGV0ICRkb2N1bWVudCA9ICQoZG9jdW1lbnQpO1xuXHRcdFx0dGhpcy5saXN0ZW5Ubyh0aGlzLiRlbCwgJ21vdXNlZG93bicsIHRoaXMuZWxfb25tb3VzZWRvd24pO1xuXHRcdFx0dGhpcy5saXN0ZW5UbygkZG9jdW1lbnQsICdtb3VzZWRvd24nLCB0aGlzLmRvY3VtZW50X29ubW91c2Vkb3duKTtcblx0XHRcdHRoaXMubGlzdGVuVG8oJGRvY3VtZW50LCAnbW91c2Vtb3ZlJywgdGhpcy5kb2N1bWVudF9vbm1vdXNlbW92ZSk7XG5cdFx0XHR0aGlzLmxpc3RlblRvKCRkb2N1bWVudCwgJ21vdXNldXAnLCB0aGlzLmRvY3VtZW50X29ubW91c2V1cCk7XG5cdFx0XHR0aGlzLmxpc3RlblRvKHRoaXMuJGVsLCAndG91Y2hzdGFydCcsIHRoaXMuZWxfb250b3VjaHN0YXJ0KTtcblx0XHRcdHRoaXMubGlzdGVuVG8oJGRvY3VtZW50LCAndG91Y2hzdGFydCcsIHRoaXMuZG9jdW1lbnRfb250b3VjaHN0YXJ0KTtcblx0XHRcdHRoaXMubGlzdGVuVG8oJGRvY3VtZW50LCAndG91Y2htb3ZlJywgdGhpcy5kb2N1bWVudF9vbnRvdWNobW92ZSk7XG5cdFx0XHR0aGlzLmxpc3RlblRvKCRkb2N1bWVudCwgJ3RvdWNoZW5kJywgdGhpcy5kb2N1bWVudF9vbnRvdWNoZW5kKTtcblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICogU3RhcnQgd2hhdGNoaW5nIHVzZXIncyBvcGVyYXRpb24uXG5cdFx0ICogQHBhcmFtIHtOdW1iZXJ9IHBvc2l0aW9ucy54XG5cdFx0ICogQHBhcmFtIHtOdW1iZXJ9IHBvc2l0aW9ucy55XG5cdFx0ICovXG5cdFx0c3RhcnRQcmVtb3Zpbmc6IGZ1bmN0aW9uKHBvc2l0aW9ucykge1xuXHRcdFx0dGhpcy5fc2V0dXBUb29scygpO1xuXHRcdFx0dGhpcy5zdGF0dXMuc2V0KHtcblx0XHRcdFx0ZnJvbVg6IHBvc2l0aW9ucy54LFxuXHRcdFx0XHRmcm9tWTogcG9zaXRpb25zLnlcblx0XHRcdH0pO1xuXHRcdFx0dGhpcy5zdGF0dXMuc2V0KHsgcHJlbW92aW5nOnRydWUgfSk7XG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIFNldCB1cCB0b29sIGJ1dHRvbnMuXG5cdFx0ICovXG5cdFx0X3NldHVwVG9vbHM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0bGV0ICRyb3cgPSB0aGlzLiRlbDtcblx0XHRcdGxldCAkdG9vbHMgPSB0aGlzLiRyb3dUb29scztcblxuXHRcdFx0aWYgKCEkdG9vbHMpIHtcblx0XHRcdFx0dGhpcy5faW5pdFJvd1Rvb2xzKCk7XG5cdFx0XHRcdCR0b29scyA9IHRoaXMuJHJvd1Rvb2xzO1xuXHRcdFx0fVxuXG5cdFx0XHQkdG9vbHMuY3NzKHsgZGlzcGxheTonYmxvY2snIH0pO1xuXG5cdFx0XHRsZXQgcG9zID0gJHJvdy5vZmZzZXQoKTtcblx0XHRcdGxldCBoZWlnaHQgPSAkcm93Lm91dGVySGVpZ2h0KCk7XG5cdFx0XHRsZXQgd2lkdGggPSAkcm93Lm91dGVyV2lkdGgoKTtcblx0XHRcdCR0b29scy5jc3Moe1xuXHRcdFx0XHRoZWlnaHQ6IGhlaWdodCxcblx0XHRcdFx0bGluZUhlaWdodDogaGVpZ2h0KydweCcsXG5cdFx0XHRcdHRvcDogcG9zLnRvcFxuXHRcdFx0fSk7XG5cblx0XHRcdHRoaXMuc3RhdHVzLnNldCh7XG5cdFx0XHRcdG1heExlZnQ6IDAsXG5cdFx0XHRcdG1pbkxlZnQ6IC0kdG9vbHMub3V0ZXJXaWR0aCgpXG5cdFx0XHR9KTtcblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICogSW5pdGlhbGl6ZSByb3cgdG9vbCBidXR0b25zLlxuXHRcdCAqIFJ1biBvbmx5IGZpcnN0IHRpbWUuXG5cdFx0ICovXG5cdFx0X2luaXRSb3dUb29sczogZnVuY3Rpb24oKSB7XG5cdFx0XHRsZXQgJHRvb2xzID0gJCh0aGlzLl9jcmVhdGUkcm93VG9vbHMoKSk7XG5cdFx0XHQkdG9vbHMuYXBwZW5kVG8oZG9jdW1lbnQuYm9keSk7XG5cblx0XHRcdHRoaXMuJHJvd1Rvb2xzID0gJHRvb2xzO1xuXHRcdFx0dGhpcy5lbFJvd1Rvb2xzID0gJHRvb2xzWzBdO1xuXG5cdFx0XHR0aGlzLmxpc3RlblRvKCR0b29scywgJ2NsaWNrJywgdGhpcy5yb3dUb29sc19vbmNsaWNrKTtcblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICogQ3JlYXRlIGVsZW1lbnRzIG9mIHRvb2wgYnV0dG9uIGFsb25nIHRoZSBvcHRpb25zXG5cdFx0ICogd2hpY2ggYXJlIHNwZWNpZmllZCBpbiB0aGUgY29uc3RydWN0b3IuXG5cdFx0ICogQHJldHVybiB7RWxlbWVudH1cblx0XHQgKi9cblx0XHRfY3JlYXRlJHJvd1Rvb2xzOiBmdW5jdGlvbigpIHtcblx0XHRcdGxldCBodG1sID0gJzxkaXYgY2xhc3M9XCJ1aS1zd29vc2hUYWJsZS1yb3dUb29sc1wiPic7XG5cdFx0XHR0aGlzLm9wdGlvbnMuYnV0dG9ucy5jb25jYXQoKS5yZXZlcnNlKCkuZm9yRWFjaCgoZGF0YSk9Pntcblx0XHRcdFx0aHRtbCArPSBgPGJ1dHRvbiBjbGFzcz1cInVpLXN3b29zaFRhYmxlLXRvb2xCdXRvbiByb3dUb29scy1pdGVtXCIgZGF0YS1zd29vc2hUYWJsZS1rZXk9XCIke2RhdGEua2V5fVwiPiR7ZGF0YS5sYWJlbH08L2J1dHRvbj5gO1xuXHRcdFx0fSk7XG5cdFx0XHRodG1sICs9ICc8L2Rpdj4nO1xuXG5cdFx0XHRsZXQgZWxGYWN0b3J5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cdFx0XHRlbEZhY3RvcnkuaW5zZXJ0QWRqYWNlbnRIVE1MKCdhZnRlcmJlZ2luJywgaHRtbCk7XG5cdFx0XHRsZXQgZWwgPSBlbEZhY3RvcnkuZmlyc3RDaGlsZDtcblx0XHRcdHJldHVybiBlbDtcblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICogVXBkYXRlIHN0YXR1cyBiZWZvcmUgYWN0dWFsIGJlaGF2aW91cnMuXG5cdFx0ICogQHBhcmFtIHtOdW1iZXJ9IHBvc2l0aW9ucy54XG5cdFx0ICogQHBhcmFtIHtOdW1iZXJ9IHBvc2l0aW9ucy55XG5cdFx0ICovXG5cdFx0dXBkYXRlUHJlbW92aW5nOiBmdW5jdGlvbihwb3NpdGlvbnMpIHtcblx0XHRcdGlmICh0aGlzLnN0YXR1cy5pc092ZXJUaHJlc2hvbGRZKHBvc2l0aW9ucykpIHtcblx0XHRcdFx0dGhpcy5zdGF0dXMuc2V0KHsgbW92aW5nWTp0cnVlIH0pO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAodGhpcy5zdGF0dXMuaXNPdmVyVGhyZXNob2xkWChwb3NpdGlvbnMpKSB7XG5cdFx0XHRcdHRoaXMuc3RhdHVzLnNldCh7IG1vdmluZ1g6dHJ1ZSB9KTtcblx0XHRcdFx0dGhpcy5zdGF0dXMuc2V0KHtcblx0XHRcdFx0XHRmcm9tWDogcG9zaXRpb25zLngsXG5cdFx0XHRcdFx0ZnJvbVk6IHBvc2l0aW9ucy55XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBSZXNldCBtb3ZpbmcgZmxhZ3MuXG5cdFx0ICovXG5cdFx0c3RvcE1vdmluZzogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLnN0YXR1cy5zZXQoe1xuXHRcdFx0XHRtb3ZpbmdYOiBmYWxzZSxcblx0XHRcdFx0bW92aW5nWTogZmFsc2UsXG5cdFx0XHRcdHByZW1vdmluZzogZmFsc2Vcblx0XHRcdH0pO1xuXHRcdFx0dGhpcy4kZWwuY3NzKHsgdHJhbnNmb3JtOicnIH0pO1xuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBVcGRhdGUgZWxlbWVudCBzdHlsZXMgYnkgcGhhc2VzLlxuXHRcdCAqL1xuXHRcdF91cGRhdGVQaGFzZTogZnVuY3Rpb24oKSB7XG5cdFx0XHRsZXQgc3RhdHVzID0gdGhpcy5zdGF0dXM7XG5cdFx0XHRsZXQgJGVsID0gdGhpcy4kZWw7XG5cblx0XHRcdCRlbC50b2dnbGVDbGFzcygndWktc3dvb3NoVGFibGUtcm93LS1zd2lwaW5nJywgc3RhdHVzLmlzU3dpcGluZygpKTtcblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICogVXBkYXRlIGVsZW1lbnQgcG9zaXRpb24gYnkgdGhlIG9yaWdpbiBhbmQgY3VycmVudCBwb3NpdGlvbnMuXG5cdFx0ICovXG5cdFx0X3VwZGF0ZUxlZnQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0bGV0IHN0YXR1cyA9IHRoaXMuc3RhdHVzO1xuXHRcdFx0bGV0IG1pbkxlZnQgPSBzdGF0dXMuZ2V0KCdtaW5MZWZ0Jyk7XG5cdFx0XHRsZXQgbWF4TGVmdCA9IHN0YXR1cy5nZXQoJ21heExlZnQnKTtcblx0XHRcdGxldCBkeCA9IHN0YXR1cy5nZXQoJ2RlbHRhWCcpO1xuXHRcdFx0bGV0IGxlZnQgPSBNYXRoLm1pbihNYXRoLm1heChkeCwgbWluTGVmdCksIG1heExlZnQpO1xuXHRcdFx0dGhpcy4kZWwuY3NzKHsgdHJhbnNmb3JtOid0cmFuc2xhdGVYKCcgKyBsZWZ0ICsgJ3B4KScgfSk7XG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIEdldCBwb2ludGVyIHBvc2l0aW9ucyBmcm9tIHNwZWNpZmllZCBwb2ludGVyIGV2ZW50LlxuXHRcdCAqIEBwYXJhbSB7TnVtYmVyfSBwb3NpdGlvbnMueFxuXHRcdCAqIEBwYXJhbSB7TnVtYmVyfSBwb3NpdGlvbnMueVxuXHRcdCAqL1xuXHRcdGdldFBvc2l0aW9uc0Zyb21FdmVudDogZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGV2ZW50ID0gZXZlbnQub3JpZ2luYWxFdmVudCB8fCBldmVudDtcblxuXHRcdFx0bGV0IHBvc2l0aW9ucztcblx0XHRcdGlmIChldmVudC50b3VjaGVzKSB7XG5cdFx0XHRcdHBvc2l0aW9ucyA9IHtcblx0XHRcdFx0XHR4OiBldmVudC50b3VjaGVzWzBdLnBhZ2VYLFxuXHRcdFx0XHRcdHk6IGV2ZW50LnRvdWNoZXNbMF0ucGFnZVlcblx0XHRcdFx0fTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRwb3NpdGlvbnMgPSB7XG5cdFx0XHRcdFx0eDogZXZlbnQucGFnZVgsXG5cdFx0XHRcdFx0eTogZXZlbnQucGFnZVlcblx0XHRcdFx0fTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBwb3NpdGlvbnM7XG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIEdldCBiYWNrIHRvIHRoZSBvcmlnaW5hbCBwb3NpdGlvbi5cblx0XHQgKi9cblx0XHRyZXN0b3JlOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuc3RhdHVzLnNldCh7IHBoYXNlOid3YWl0aW5nJyB9KTtcblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICogRGV0YWNoIHJlc291cmNlcy5cblx0XHQgKi9cblx0XHRkZXN0cm95OiBmdW5jdGlvbihvcHRpb25zKSB7XG5cdFx0XHQvLyBNYXliZSBub3QgZW5vdWdoLi4uXG5cblx0XHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXHRcdFx0b3B0aW9ucy5yZW1vdmVEb20gPSAob3B0aW9ucy5yZW1vdmVEb20gIT09IGZhbHNlKTtcblxuXHRcdFx0aWYgKG9wdGlvbnMucmVtb3ZlRG9tKSB7XG5cdFx0XHRcdHRoaXMuJGVsLnJlbW92ZSgpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAodGhpcy4kcm93VG9vbHMpIHtcblx0XHRcdFx0dGhpcy4kcm93VG9vbHMucmVtb3ZlKCk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIFJldHVybiB0cnVlIGlmIHNwZWNpZmllZCBldmVudCBpcyBvY2N1cmVkIG9uIHRvb2wgZWxlbWVudC5cblx0XHQgKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuXHRcdCAqIEByZXR1cm5zIHtCb29sZWFufVxuXHRcdCAqL1xuXHRcdGlzRXZlbnRPY2N1cmVkT25Sb3dUb29sczogZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGxldCBlbFJvd1Rvb2xzID0gdGhpcy5lbFJvd1Rvb2xzO1xuXHRcdFx0bGV0IG9uVG9vbHMgPSBmYWxzZTtcblx0XHRcdGZvciAobGV0IGVsPWV2ZW50LnRhcmdldDsgZWw7IGVsPWVsLnBhcmVudEVsZW1lbnQpIHtcblx0XHRcdFx0aWYgKGVsID09PSBlbFJvd1Rvb2xzKSB7XG5cdFx0XHRcdFx0b25Ub29scyA9IHRydWU7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiBvblRvb2xzO1xuXHRcdH0sXG5cblx0XHRzdGF0dXNfb25jaGFuZ2VfcGhhc2U6IGZ1bmN0aW9uKHN0YXR1cywgcGhhc2UpIHtcblx0XHRcdGxldCBhdHRyID0gc3RhdHVzLmF0dHJpYnV0ZXM7XG5cblx0XHRcdGlmIChwaGFzZSA9PT0gc3RhdHVzLlBIQVNFX1dBSVRJTkcpIHtcblx0XHRcdFx0c3RhdHVzLnNldCh7XG5cdFx0XHRcdFx0Y3VyWDogTmFOLFxuXHRcdFx0XHRcdGN1clk6IE5hTixcblx0XHRcdFx0XHRkZWx0YVg6IDAsXG5cdFx0XHRcdFx0ZnJvbVg6IE5hTixcblx0XHRcdFx0XHRmcm9tWTogTmFOXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAocGhhc2UgPT09IHN0YXR1cy5QSEFTRV9QUkVBQ1RJT04pIHtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHBoYXNlID09PSBzdGF0dXMuUEhBU0VfU1dJUElORykge1xuXHRcdFx0XHR0aGlzLl9zZXR1cFRvb2xzKCk7XG5cdFx0XHRcdHN0YXR1cy5zZXQoe1xuXHRcdFx0XHRcdGZyb21YOiBhdHRyLmN1clgsXG5cdFx0XHRcdFx0ZnJvbVk6IGF0dHIuY3VyWVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHBoYXNlID09PSBzdGF0dXMuUEhBU0VfU1dJUEVET1ZFUikge1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLl91cGRhdGVQaGFzZSgpO1xuXHRcdH0sXG5cblx0XHRzdGF0dXNfb25jaGFuZ2VfY3VyWDogZnVuY3Rpb24oc3RhdHVzLCB2YWx1ZSkge1xuXHRcdFx0aWYgKHN0YXR1cy5pc1ByZWFjdGlvbigpKSB7XG5cdFx0XHRcdGlmIChzdGF0dXMuaXNPdmVyVGhyZXNob2xkWCgpKSB7XG5cdFx0XHRcdFx0c3RhdHVzLnNldCh7IHBoYXNlOnN0YXR1cy5QSEFTRV9TV0lQSU5HIH0pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgaWYgKHN0YXR1cy5pc092ZXJUaHJlc2hvbGRZKCkpIHtcblx0XHRcdFx0XHRzdGF0dXMuc2V0KHsgcGhhc2U6c3RhdHVzLlBIQVNFX1dBSVRJTkcgfSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHN0YXR1cy5pc1N3aXBpbmcoKSkge1xuXHRcdFx0XHRsZXQgYXR0ciA9IHN0YXR1cy5hdHRyaWJ1dGVzO1xuXHRcdFx0XHRsZXQgZHggPSBhdHRyLmN1clggLSBhdHRyLmZyb21YO1xuXHRcdFx0XHRzdGF0dXMuc2V0KHsgZGVsdGFYOmR4IH0pO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRzdGF0dXNfb25jaGFuZ2VfZGVsdGFYOiBmdW5jdGlvbihtb2RlbCwgdmFsdWUpIHtcblx0XHRcdHRoaXMuX3VwZGF0ZUxlZnQoKTtcblxuXHRcdFx0aWYgKHZhbHVlID09PSAwKSB7XG5cdFx0XHRcdGlmICh0aGlzLiRyb3dUb29scykge1xuXHRcdFx0XHRcdHRoaXMuJHJvd1Rvb2xzLmNzcyh7IGRpc3BsYXk6J25vbmUnIH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdGVsX29ubW91c2Vkb3duOiBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdGxldCBwb3NpdGlvbnMgPSB0aGlzLmdldFBvc2l0aW9uc0Zyb21FdmVudChldmVudCk7XG5cdFx0XHRsZXQgc3RhdHVzID0gdGhpcy5zdGF0dXM7XG5cblx0XHRcdHN0YXR1cy5zZXQoe1xuXHRcdFx0XHRmcm9tWDogcG9zaXRpb25zLngsXG5cdFx0XHRcdGZyb21ZOiBwb3NpdGlvbnMueSxcblx0XHRcdFx0cGhhc2U6IHN0YXR1cy5QSEFTRV9QUkVBQ1RJT05cblx0XHRcdH0pO1xuXHRcdH0sXG5cblx0XHRkb2N1bWVudF9vbm1vdXNlZG93bjogZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGxldCBzdGF0dXMgPSB0aGlzLnN0YXR1cztcblxuXHRcdFx0aWYgKCF0aGlzLmlzRXZlbnRPY2N1cmVkT25Sb3dUb29scyhldmVudCkgJiYgc3RhdHVzLmlzU3dpcGVkT3ZlcigpKSB7XG5cdFx0XHRcdHN0YXR1cy5zZXQoeyBwaGFzZTpzdGF0dXMuUEhBU0VfV0FJVElORyB9KTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0ZG9jdW1lbnRfb25tb3VzZW1vdmU6IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRsZXQgc3RhdHVzID0gdGhpcy5zdGF0dXM7XG5cdFx0XHRsZXQgcG9zaXRpb25zO1xuXG5cdFx0XHRpZiAoc3RhdHVzLmlzUHJlYWN0aW9uKCkgfHwgc3RhdHVzLmlzU3dpcGluZygpKSB7XG5cdFx0XHRcdHBvc2l0aW9ucyA9IHRoaXMuZ2V0UG9zaXRpb25zRnJvbUV2ZW50KGV2ZW50KTtcblx0XHRcdFx0c3RhdHVzLnNldCh7XG5cdFx0XHRcdFx0Y3VyWDogcG9zaXRpb25zLngsXG5cdFx0XHRcdFx0Y3VyWTogcG9zaXRpb25zLnlcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdGRvY3VtZW50X29ubW91c2V1cDogZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGxldCBzdGF0dXMgPSB0aGlzLnN0YXR1cztcblxuXHRcdFx0aWYgKHN0YXR1cy5nZXQoJ2RlbHRhWCcpIDwgc3RhdHVzLmdldCgnbWluTGVmdCcpKSB7XG5cdFx0XHRcdHN0YXR1cy5zZXQoeyBwaGFzZTpzdGF0dXMuUEhBU0VfU1dJUEVET1ZFUiB9KTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCFzdGF0dXMuaXNTd2lwZWRPdmVyKCkpIHtcblx0XHRcdFx0c3RhdHVzLnNldCh7IHBoYXNlOnN0YXR1cy5QSEFTRV9XQUlUSU5HIH0pO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRlbF9vbnRvdWNoc3RhcnQ6IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRsZXQgcG9zaXRpb25zID0gdGhpcy5nZXRQb3NpdGlvbnNGcm9tRXZlbnQoZXZlbnQpO1xuXHRcdFx0bGV0IHN0YXR1cyA9IHRoaXMuc3RhdHVzO1xuXG5cdFx0XHRzdGF0dXMuc2V0KHtcblx0XHRcdFx0ZnJvbVg6IHBvc2l0aW9ucy54LFxuXHRcdFx0XHRmcm9tWTogcG9zaXRpb25zLnksXG5cdFx0XHRcdHBoYXNlOiBzdGF0dXMuUEhBU0VfUFJFQUNUSU9OXG5cdFx0XHR9KTtcblx0XHR9LFxuXG5cdFx0ZG9jdW1lbnRfb250b3VjaHN0YXJ0OiBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0bGV0IHN0YXR1cyA9IHRoaXMuc3RhdHVzO1xuXG5cdFx0XHRpZiAoIXRoaXMuaXNFdmVudE9jY3VyZWRPblJvd1Rvb2xzKGV2ZW50KSAmJiBzdGF0dXMuaXNTd2lwZWRPdmVyKCkpIHtcblx0XHRcdFx0c3RhdHVzLnNldCh7IHBoYXNlOnN0YXR1cy5QSEFTRV9XQUlUSU5HIH0pO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRkb2N1bWVudF9vbnRvdWNobW92ZTogZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGxldCBzdGF0dXMgPSB0aGlzLnN0YXR1cztcblx0XHRcdGxldCBwb3NpdGlvbnM7XG5cblx0XHRcdGlmIChzdGF0dXMuaXNQcmVhY3Rpb24oKSB8fCBzdGF0dXMuaXNTd2lwaW5nKCkpIHtcblx0XHRcdFx0cG9zaXRpb25zID0gdGhpcy5nZXRQb3NpdGlvbnNGcm9tRXZlbnQoZXZlbnQpO1xuXHRcdFx0XHRzdGF0dXMuc2V0KHtcblx0XHRcdFx0XHRjdXJYOiBwb3NpdGlvbnMueCxcblx0XHRcdFx0XHRjdXJZOiBwb3NpdGlvbnMueVxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRpZiAoc3RhdHVzLmlzUHJlYWN0aW9uKCkgfHwgc3RhdHVzLmlzU3dpcGluZygpKSB7XG5cdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRkb2N1bWVudF9vbnRvdWNoZW5kOiBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0bGV0IHN0YXR1cyA9IHRoaXMuc3RhdHVzO1xuXG5cdFx0XHRpZiAoc3RhdHVzLmdldCgnZGVsdGFYJykgPCBzdGF0dXMuZ2V0KCdtaW5MZWZ0JykpIHtcblx0XHRcdFx0c3RhdHVzLnNldCh7IHBoYXNlOnN0YXR1cy5QSEFTRV9TV0lQRURPVkVSIH0pO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIXN0YXR1cy5pc1N3aXBlZE92ZXIoKSkge1xuXHRcdFx0XHRzdGF0dXMuc2V0KHsgcGhhc2U6c3RhdHVzLlBIQVNFX1dBSVRJTkcgfSk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdHJvd1Rvb2xzX29uY2xpY2s6IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRsZXQgZWxCdXR0b24gPSBnZXRDbG9zZXN0KGV2ZW50LnRhcmdldCwgJy51aS1zd29vc2hUYWJsZS10b29sQnV0b24nKTtcblx0XHRcdGxldCBkYXRhID0ge1xuXHRcdFx0XHRldmVudCxcblx0XHRcdFx0ZWxCdXR0b24sXG5cdFx0XHRcdGtleTogZWxCdXR0b24uZ2V0QXR0cmlidXRlKCdkYXRhLXN3b29zaFRhYmxlLWtleScpXG5cdFx0XHR9O1xuXHRcdFx0dGhpcy50cmlnZ2VyKCdjbGlja2J1dHRvbicsIHRoaXMsIGRhdGEpO1xuXHRcdH1cblx0fSk7XG5cblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQvLyBTd29vc2hUYWJsZVxuXG5cdGxldCBTd29vc2hUYWJsZSA9IE9zdGVvcG9yb3Npcy5WaWV3LmV4dGVuZCh7XG5cdFx0LyoqXG5cdFx0ICogQHR5cGUgQXJyYXlcblx0XHQgKi9cblx0XHRzdWJWaWV3czogbnVsbCxcblxuXHRcdGluaXRpYWxpemU6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblx0XHRcdGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ3N0cmluZycpIHtcblx0XHRcdFx0bGV0IHNlbGVjdG9yID0gb3B0aW9ucztcblx0XHRcdFx0b3B0aW9ucyA9IHt9O1xuXHRcdFx0XHR0aGlzLiRlbCA9ICQoc2VsZWN0b3IpO1xuXHRcdFx0XHR0aGlzLmVsID0gdGhpcy4kZWxbMF07XG5cdFx0XHR9XG5cblx0XHRcdGlmIChvcHRpb25zLiRyb3dUb29scykge1xuXHRcdFx0XHR0aGlzLiRyb3dUb29scyA9IG9wdGlvbnMuJHJvd1Rvb2xzO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdHRoaXMuJHJvd1Rvb2xzID0gdGhpcy5fY3JlYXRlJHJvd1Rvb2xzKCk7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuX2luaXRTdWJWaWV3cygpO1xuXHRcdH0sXG5cblx0XHRfaW5pdFN1YlZpZXdzOiBmdW5jdGlvbigpIHtcblx0XHRcdGxldCB2aWV3cyA9IHRoaXMuc3ViVmlld3MgPSBbXTtcblx0XHRcdGxldCAkcm93cyA9IHRoaXMuJCgnPnRyLCA+dGJvZHk+dHInKTtcblx0XHRcdGxldCAkcm93VG9vbHMgPSB0aGlzLiRyb3dUb29scztcblx0XHRcdGxldCBjcmVhdGUkcm93VG9vbHMgPSB0aGlzLl9jcmVhdGUkcm93VG9vbHMuYmluZCh0aGlzKTtcblx0XHRcdCRyb3dzLmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsUm93KSB7XG5cdFx0XHRcdGxldCB2aWV3ID0gbmV3IFVJU3dpcGUoe1xuXHRcdFx0XHRcdGVsOiBlbFJvdyxcblx0XHRcdFx0XHRjcmVhdGUkcm93VG9vbHM6IGNyZWF0ZSRyb3dUb29scyxcblx0XHRcdFx0fSk7XG5cdFx0XHRcdHRoaXMubGlzdGVuVG8odmlldywgJ2NsaWNrJywgdGhpcy5zdWJWaWV3X29uY2xpY2spO1xuXHRcdFx0XHR2aWV3cy5wdXNoKHZpZXcpO1xuXHRcdFx0fS5iaW5kKHRoaXMpKTtcblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICogQ3JlYXRlIGFuIHVuaXF1ZSBlbGVtZW50IHdoaWNoIGlzIHByb3ZpZGVzIGJ1dHRvbnMgZm9yIGVhY2ggcm93LlxuXHRcdCAqIEByZXR1cm5zIHtFbGVtZW50fVxuXHRcdCAqL1xuXHRcdF9jcmVhdGUkcm93VG9vbHM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0bGV0ICRyb3dUb29scyA9ICQodGhpcy5fdGVtcGxhdGUkcm93VG9vbHMoe30pKTtcblx0XHRcdCRyb3dUb29scy5hcHBlbmRUbyhkb2N1bWVudC5ib2R5KTtcblx0XHRcdHJldHVybiAkcm93VG9vbHM7XG5cdFx0fSxcblxuXHRcdF90ZW1wbGF0ZSRyb3dUb29sczogZnVuY3Rpb24oZGF0YSkge1xuXHRcdFx0bGV0IGh0bWwgPVxuXHRcdFx0XHQnPGRpdiBjbGFzcz1cInVpLXN3b29zaFRhYmxlLXJvd1Rvb2xzXCI+JyArXG5cdFx0XHRcdFx0JzxidXR0b24gY2xhc3M9XCJ1aS1zd29vc2hUYWJsZS10b29sQnV0b24gcm93VG9vbHMtaXRlbSByb3dUb29scy1pdGVtLWRlbGV0ZVwiPkRlbGV0ZTwvYnV0dG9uPicgK1xuXHRcdFx0XHQnPC9kaXY+Jztcblx0XHRcdGxldCBlbEZhY3RvcnkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblx0XHRcdGVsRmFjdG9yeS5pbnNlcnRBZGphY2VudEhUTUwoJ2FmdGVyYmVnaW4nLCBodG1sKTtcblx0XHRcdGxldCBlbCA9IGVsRmFjdG9yeS5maXJzdENoaWxkO1xuXHRcdFx0cmV0dXJuIGVsO1xuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBSZW1vdmUgc3BlY2lmaWVkIHJvdyBhbmQgaXRzIHJlc291cmNlcy5cblx0XHQgKiBAcGFyYW0ge1VJU3dpcGV8RWxlbWVudH0gcm93XG5cdFx0ICovXG5cdFx0cmVtb3ZlUm93OiBmdW5jdGlvbihyb3cpIHtcblx0XHRcdGlmICghKHJvdyBpbnN0YW5jZW9mIFVJU3dpcGUpKSB7XG5cdFx0XHRcdGxldCBlbFJvdyA9IHJvdztcblx0XHRcdFx0cm93ID0gZmluZEZyb21BcnJheSh0aGlzLnN1YlZpZXdzLCBmdW5jdGlvbih2aWV3KSB7XG5cdFx0XHRcdFx0cmV0dXJuICh2aWV3LiRlbFswXSA9PT0gZWxSb3cpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdHJvdy5kZXN0cm95KCk7XG5cdFx0fSxcblxuXHRcdHN1YlZpZXdfb25jbGljazogZnVuY3Rpb24odmlldywgZXZlbnQsIGVsQnV0dG9uKSB7XG5cdFx0XHR0aGlzLnRyaWdnZXIoJ2NsaWNrJywgZXZlbnQsIHZpZXcsIGVsQnV0dG9uKTtcblx0XHR9XG5cdH0pO1xuXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0Ly8gZXhwb3J0XG5cblx0VUlTd2lwZS5TdGF0dXMgPSBTdGF0dXM7XG5cdHdpbmRvdy5VSVN3aXBlID0gVUlTd2lwZTtcblx0d2luZG93LlN3b29zaFRhYmxlID0gU3dvb3NoVGFibGU7XG59KSh3aW5kb3csIGRvY3VtZW50LCB3aW5kb3cuJCk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
