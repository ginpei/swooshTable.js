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

		handlePointingStart: function handlePointingStart(event) {
			var status = this.status;

			if (!this.isEventOccuredOnRowTools(event) && status.isSwipedOver()) {
				status.set({ phase: status.PHASE_WAITING });
			}
		},

		handlePointerMovement: function handlePointerMovement(event) {
			var status = this.status;
			var positions = undefined;

			if (status.isPreaction() || status.isSwiping()) {
				positions = this.getPositionsFromEvent(event);
				status.set({
					curX: positions.x,
					curY: positions.y
				});

				// prevent scrolling while swiping
				if (event.type === 'touchmove' && status.isPreaction() || status.isSwiping()) {
					event.preventDefault();
				}
			}
		},

		handlePointingStop: function handlePointingStop(event) {
			var status = this.status;

			if (status.get('deltaX') < status.get('minLeft')) {
				status.set({ phase: status.PHASE_SWIPEDOVER });
			}

			if (!status.isSwipedOver()) {
				status.set({ phase: status.PHASE_WAITING });
			}
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
			this.handlePointingStart(event);
		},

		document_onmousemove: function document_onmousemove(event) {
			this.handlePointerMovement(event);
		},

		document_onmouseup: function document_onmouseup(event) {
			this.handlePointingStop(event);
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
			this.handlePointingStart(event);
		},

		document_ontouchmove: function document_ontouchmove(event) {
			this.handlePointerMovement(event);
		},

		document_ontouchend: function document_ontouchend(event) {
			this.handlePointingStop(event);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInVpLXN3b29zaFRhYmxlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsQ0FBQyxVQUFTLE1BQU0sRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFOztBQUU5QixLQUFJLFlBQVksR0FBQyxZQUFVO0FBQUMsTUFBSSxDQUFDLEdBQUMsRUFBRTtNQUFDLENBQUMsR0FBQyxXQUFXO01BQUMsQ0FBQyxHQUFDLFFBQVE7TUFBQyxDQUFDLEdBQy9ELFNBQVM7TUFBQyxDQUFDLEdBQUMsWUFBWTtNQUFDLENBQUMsR0FBQyxZQUFZO01BQUMsQ0FBQyxHQUFDLEVBQUUsQ0FBQyxLQUFLO01BQUMsQ0FBQyxHQUFDLFdBQVcsSUFDOUQsT0FBTyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7TUFBQyxDQUFDLEdBQUMsU0FBRixDQUFDLEdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxVQUFTLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxZQUN2RCxDQUFDLENBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxFQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUMvRCxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFBO0dBQUMsQ0FBQyxJQUFJLENBQUMsR0FBQyxDQUFDLENBQUMsY0FBYyxHQUFDLEVBQUMsRUFBRSxFQUN4RCxZQUFTLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxRQUFJLENBQUMsR0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFHLENBQUMsR0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUMsRUFBRSxDQUFBLEFBQUMsQ0FBQyxJQUFJLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFHLENBQUMsR0FBQyxDQUFDLENBQy9ELENBQUMsQ0FBQyxHQUFDLEVBQUUsQ0FBQSxBQUFDLEVBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUFDLEVBQUMsT0FBTyxFQUFDLGlCQUFTLENBQUMsRUFBQztBQUFDLFFBQUksQ0FBQyxHQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFHLENBQUMsSUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQy9EO0FBQUMsU0FBSSxDQUFDLEdBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLE9BQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUMvRCxDQUFDLENBQUMsQ0FBQTtNQUFDLENBQUMsQ0FBQTtLQUFDO0lBQUMsRUFBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssR0FBQyxZQUFVLEVBQUUsRUFBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQy9ELEVBQUMsRUFBQyxnQkFBZ0IsRUFBQywwQkFBUyxDQUFDLEVBQUM7QUFBQyxXQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBQyxFQUFFLEVBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUFDO0FBQzlELGFBQVUsRUFBQyxDQUFDLEVBQUMsR0FBRyxFQUFDLGFBQVMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxDQUFDLEdBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFDO0FBQUMsU0FBSSxDQUFDLEdBQy9ELENBQUMsQ0FBQyxDQUFDLENBQUM7U0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBRyxDQUFDLEtBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxHQUFDLENBQUMsRUFBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDLEVBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUMvRCxRQUFRLEVBQUMsSUFBSSxDQUFDLENBQUEsQUFBQyxDQUFBO0tBQUMsT0FBTyxJQUFJLENBQUE7SUFBQyxFQUFDLEdBQUcsRUFBQyxhQUFTLENBQUMsRUFBQztBQUFDLFdBQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQUM7QUFDL0QsS0FBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLElBQUksR0FBQyxZQUFVLEVBQUUsRUFBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUM3RCxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUMsRUFBQyxnQkFBZ0IsRUFBQywwQkFBUyxDQUFDLEVBQUM7QUFBQyxLQUFDLEdBQUMsQ0FBQyxJQUFFLEVBQUUsRUFBQyxJQUFJLENBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUM3RCxRQUFRLENBQUMsQ0FBQTtJQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsV0FBUyxDQUFDLEVBQUM7QUFBQyxXQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQUM7QUFDOUQsS0FBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsT0FB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LENBQUMsQ0FBQztHQUM3QztFQUNELENBQUM7Ozs7O0FBQUMsQUFLSCxRQUFPLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztBQUN4QixPQUFNLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztBQUN6QixPQUFNLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztDQUNqQyxDQUFBLENBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMiLCJmaWxlIjoidWktc3dvb3NoVGFibGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24od2luZG93LCBkb2N1bWVudCwgJCkge1xuXHQvKiEgT3N0ZW9wb3Jvc2lzLmpzIHYwLjAuMiBCeSBUQUtBTkFTSEkgR2lucGVpICovXG5cdHZhciBPc3Rlb3Bvcm9zaXM9ZnVuY3Rpb24oKXt2YXIgdD17fSxpPVwicHJvdG90eXBlXCIsbj1cImV4dGVuZFwiLGU9XG5cdFwidHJpZ2dlclwiLG89XCJhdHRyaWJ1dGVzXCIscj1cIl9saXN0ZW5lcnNcIixzPVtdLnNsaWNlLHU9XCJ1bmRlZmluZWRcIlxuXHQ9PXR5cGVvZiBfPyRbbl06X1tuXSxhPWZ1bmN0aW9uKCl7fTt0W25dPWZ1bmN0aW9uKGUsbyl7ZnVuY3Rpb25cblx0cih0KXt0aGlzLl9fb3N0ZW9wb3Jvc2lzX18odCksdGhpcy5pbml0aWFsaXplKHQpfXJldHVybiByW25dPXRbblxuXHRdLHUocltpXSx0aGlzW2ldLGUpLHUocixvKSxyfTt2YXIgaD10LmV2ZW50UHJvdG90eXBlPXtvbjpcblx0ZnVuY3Rpb24odCxpKXt2YXIgbj10aGlzW3JdO258fChuPXRoaXNbcl09e30pO3ZhciBlPW5bdF07ZXx8KGU9blxuXHRbdF09W10pLGUucHVzaChpKX0sdHJpZ2dlcjpmdW5jdGlvbih0KXt2YXIgaT10aGlzW3JdO2lmKGkmJmlbdF0pXG5cdHt2YXIgbj1zLmNhbGwoYXJndW1lbnRzLDEpO2lbdF0uZm9yRWFjaChmdW5jdGlvbih0KXt0LmFwcGx5KG51bGxcblx0LG4pfSl9fX07cmV0dXJuIHQuTW9kZWw9ZnVuY3Rpb24oKXt9LHQuTW9kZWxbbl09dFtuXSx1KHQuTW9kZWxbaVxuXHRdLHtfX29zdGVvcG9yb3Npc19fOmZ1bmN0aW9uKHQpe3JldHVybiB0aGlzW29dPXt9LHRoaXMuc2V0KHQpfSxcblx0aW5pdGlhbGl6ZTphLHNldDpmdW5jdGlvbih0KXt2YXIgaT10aGlzW29dO2Zvcih2YXIgbiBpbiB0KXt2YXIgclxuXHQ9dFtuXSxzPWlbbl07ciE9PXMmJihpW25dPXIsdGhpc1tlXShcImNoYW5nZTpcIituLHRoaXMsciksdGhpc1tlXShcblx0XCJjaGFuZ2VcIix0aGlzKSl9cmV0dXJuIHRoaXN9LGdldDpmdW5jdGlvbih0KXtyZXR1cm4gdGhpc1tvXVt0XX0sXG5cdG9uOmgub24sdHJpZ2dlcjpoW2VdfSksdC5WaWV3PWZ1bmN0aW9uKCl7fSx0LlZpZXdbbl09dFtuXSx1KHQuXG5cdFZpZXdbaV0se19fb3N0ZW9wb3Jvc2lzX186ZnVuY3Rpb24odCl7dD10fHx7fSx0aGlzLiRlbD0kKHQuZWx8fFxuXHRkb2N1bWVudCl9LGluaXRpYWxpemU6YSwkOmZ1bmN0aW9uKHQpe3JldHVybiB0aGlzLiRlbC5maW5kKHQpfSxcblx0b246aC5vbix0cmlnZ2VyOmhbZV19KSx0fSgpO1xuXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0Ly8gRXh0ZW5kIE9zdGVvcG9yb3Npc1xuXG5cdC8qKlxuXHQgKiBEZWZhdWx0IHZhbHVlcy5cblx0ICogQHR5cGUgT2JqZWN0XG5cdCAqIEBzZWUgI19pbml0aWFsaXplQXR0cmlidXRlc1xuXHQgKi9cblx0T3N0ZW9wb3Jvc2lzLk1vZGVsLnByb3RvdHlwZS5kZWZhdWx0cyA9IHt9O1xuXG5cdC8qKlxuXHQgKiBUaGUgY29uc3RydWN0b3IgZm9yIE1vZGVsLlxuXHQgKiBAb3ZlcndyaXRlIE9zdGVvcG9yb3Npcy5Nb2RlbCNfX29zdGVvcG9yb3Npc19fXG5cdCAqL1xuXHRsZXQgTW9kZWxfYmVmb3JlSW5pdGlhbGl6ZSA9IE9zdGVvcG9yb3Npcy5Nb2RlbC5wcm90b3R5cGUuX19vc3Rlb3Bvcm9zaXNfXztcblx0T3N0ZW9wb3Jvc2lzLk1vZGVsLnByb3RvdHlwZS5fX29zdGVvcG9yb3Npc19fID0gZnVuY3Rpb24oYXR0cikge1xuXHRcdE1vZGVsX2JlZm9yZUluaXRpYWxpemUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0XHR0aGlzLl9pbml0aWFsaXplQXR0cmlidXRlcyhhdHRyKTtcblx0fTtcblxuXHQvKipcblx0ICogU2V0IGRlZmF1bHQgdmFsdWVzIGFzIG93biBhdHRyaWJ1dGVzXG5cdCAqIGlmIHRoZSB2YWx1ZSBpcyBub3Qgc3BlY2lmaWVkIGluIGNvbnN0cnVjdG9yLlxuXHQgKiBAc2VlICNpbml0aWFsaXplXG5cdCAqIEBzZWUgI2RlZmF1bHRzXG5cdCAqL1xuXHRPc3Rlb3Bvcm9zaXMuTW9kZWwucHJvdG90eXBlLl9pbml0aWFsaXplQXR0cmlidXRlcyA9IGZ1bmN0aW9uKHNwZWMpIHtcblx0XHRsZXQgYXR0ciA9IHRoaXMuYXR0cmlidXRlcztcblx0XHRsZXQgZGVmID0gdGhpcy5kZWZhdWx0cztcblx0XHRmb3IgKGxldCBwIGluIGRlZikge1xuXHRcdFx0aWYgKCFzcGVjIHx8ICEocCBpbiBzcGVjKSkge1xuXHRcdFx0XHRhdHRyW3BdID0gZGVmW3BdO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcblxuXHQvKipcblx0ICogQmluZCBvd24gZXZlbnQgbGlzdGVuZXIgdG8gYW4gZXZlbnQuXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBvYmogV2hpY2ggaGFzIGAub24oKWAgbWV0aG9kLlxuXHQgKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBsaXN0ZW5lclxuXHQgKi9cblx0T3N0ZW9wb3Jvc2lzLlZpZXcucHJvdG90eXBlLmxpc3RlblRvID0gZnVuY3Rpb24ob2JqLCB0eXBlLCBsaXN0ZW5lcikge1xuXHRcdG9iai5vbih0eXBlLCBsaXN0ZW5lci5iaW5kKHRoaXMpKTtcblx0fTtcblxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdC8vIFV0aWxcblxuXHQvKipcblx0ICogUmV0dXJuIHRoZSBjbG9zZXN0IGVsZW1lbnQgZnJvbSBzcGVjaWZpZWQgZWxlbWVudC5cblx0ICogQHBhcmFtIHtFbGVtZW50fSBlbFxuXHQgKiBAcGFyYW0ge1N0cmluZ30gc2VsZWN0b3Jcblx0ICogQHJldHVybnMge0VsZW1lbnR9IE9yIGBudWxsYC5cblx0ICovXG5cdGZ1bmN0aW9uIGdldENsb3Nlc3QoZWwsIHNlbGVjdG9yKSB7XG5cdFx0aWYgKGVsLmNsb3Nlc3QpIHtcblx0XHRcdHJldHVybiBlbC5jbG9zZXN0KHNlbGVjdG9yKTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRyZXR1cm4gJChlbCkuY2xvc2VzdChzZWxlY3RvcilbMF07XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybiB0aGUgZWxlbWVudCB3aGljaCBpcyBtYXRjaGVkIHRvIHNwZWNpZmllZCBjb25kaXRpb24uXG5cdCAqIEBwYXJhbSB7QXJyYXl9IGFyclxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayhlbGVtZW50LCBpbmRleCwgYXJyYXkpXG5cdCAqL1xuXHRmdW5jdGlvbiBmaW5kRnJvbUFycmF5KGFyciwgY2FsbGJhY2spIHtcblx0XHRpZiAoYXJyLmZpbmQpIHtcblx0XHRcdHJldHVybiBhcnIuZmluZChjYWxsYmFjayk7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0cmV0dXJuICQuZ3JlcChhcnIsIGNhbGxiYWNrKVswXTtcblx0XHR9XG5cdH1cblxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdC8vIFN0YXR1c1xuXG5cdC8qKlxuXHQgKiBNYW5hZ2UgdXNlciBhY3Rpb24gc3RhdHVzLlxuXHQgKlxuXHQgKiAjIFN0YXR1c1xuXHQgKlxuXHQgKiAgIFdhaXRpbmcgLS0tPiBQcmVhY3Rpb24gLS0tPiBTd2lwaW5nIC0tLT4gU3dpcGVkT3ZlclxuXHQgKiAgICBeICAgICAgICAgICAgfCAgICAgICAgICAgICAgfCAgICAgICAgICAgIHxcblx0ICogICAgfCAgICAgICAgICAgIHYgICAgICAgICAgICAgIHYgICAgICAgICAgICB8XG5cdCAqICAgICstLS0tLS0tLS0tLS0rPC0tLS0tLS0tLS0tLS0rPC0tLS0tLS0tLS0tK1xuXHQgKlxuXHQgKiBAY29uc3RydWN0b3Jcblx0ICovXG5cdGxldCBTdGF0dXMgPSBPc3Rlb3Bvcm9zaXMuTW9kZWwuZXh0ZW5kKHtcblx0XHRUSFJFU0hPTERfWDogMzAsXG5cdFx0VEhSRVNIT0xEX1k6IDMwLFxuXG5cdFx0UEhBU0VfV0FJVElORzogJ3dhaXRpbmcnLFxuXHRcdFBIQVNFX1BSRUFDVElPTjogJ3ByZWFjdGlvbicsXG5cdFx0UEhBU0VfU1dJUElORzogJ3N3aXBpbmcnLFxuXHRcdFBIQVNFX1NXSVBFRE9WRVI6ICdzd2lwZWRPdmVyJyxcblxuXHRcdC8qKlxuXHRcdCAqIERlZmF1bHQgdmFsdWVzLlxuXHRcdCAqL1xuXHRcdGRlZmF1bHRzOiB7XG5cdFx0XHRmcm9tWDogTmFOLCAgLy8gdGhlIG9yaWdpbiBvZiBhY3Rpb25zXG5cdFx0XHRmcm9tWTogTmFOLFxuXHRcdFx0cGhhc2U6IG51bGwsICAvLyAnd2FpdGluZycsICdwcmVhY3Rpb24nLCAnc3dpcGluZycsICdzd2lwZWRPdmVyJ1xuXHRcdFx0Ly8gcHJlbW92aW5nOiBmYWxzZSwgIC8vIHdoZXRoZXIgdXNlciBpcyBmbGlja2luZyB0byBkbyBzb21lIGFjdGlvblxuXHRcdFx0bWF4TGVmdDogTmFOLFxuXHRcdFx0bWluTGVmdDogTmFOLFxuXHRcdFx0Ly8gbW92aW5nWDogZmFsc2UsICAvLyB3aGV0aGVyIHRoZSBlbGVtZW50IGlzIG1vdmluZyBob3Jpem9udGFseVxuXHRcdFx0Ly8gbW92aW5nWTogZmFsc2UgIC8vIHdoZXRoZXIgdGhlIGVsZW1lbnQgaXMgbW92aW5nIHZlcnRpY2FsbHlcblx0XHR9LFxuXG5cdFx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oYXR0cmlidXRlcywgb3B0aW9ucykge1xuXHRcdFx0aWYgKCF0aGlzLmdldCgncGhhc2UnKSkge1xuXHRcdFx0XHR0aGlzLnNldCh7IHBoYXNlOnRoaXMuUEhBU0VfV0FJVElORyB9KTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0aXNXYWl0aW5nOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiAodGhpcy5hdHRyaWJ1dGVzLnBoYXNlID09PSB0aGlzLlBIQVNFX1dBSVRJTkcpO1xuXHRcdH0sXG5cblx0XHRpc1ByZWFjdGlvbjogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gKHRoaXMuYXR0cmlidXRlcy5waGFzZSA9PT0gdGhpcy5QSEFTRV9QUkVBQ1RJT04pO1xuXHRcdH0sXG5cblx0XHRpc1N3aXBpbmc6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuICh0aGlzLmF0dHJpYnV0ZXMucGhhc2UgPT09IHRoaXMuUEhBU0VfU1dJUElORyk7XG5cdFx0fSxcblxuXHRcdGlzU3dpcGVkT3ZlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gKHRoaXMuYXR0cmlidXRlcy5waGFzZSA9PT0gdGhpcy5QSEFTRV9TV0lQRURPVkVSKTtcblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICogV2hldGhlciBzcGVjaWZpZWQgcG9zaXRpb25zIG92ZXJjb21lIHRoZSB0aHJlc2hvbGQuXG5cdFx0ICogQHNlZSAjVEhSRVNIT0xEX1hcblx0XHQgKi9cblx0XHRpc092ZXJUaHJlc2hvbGRYOiBmdW5jdGlvbigpIHtcblx0XHRcdGxldCBhdHRyID0gdGhpcy5hdHRyaWJ1dGVzO1xuXHRcdFx0bGV0IGRlbHRhID0gYXR0ci5jdXJYIC0gYXR0ci5mcm9tWDtcblx0XHRcdHJldHVybiAoZGVsdGEgPiB0aGlzLlRIUkVTSE9MRF9YIHx8IGRlbHRhIDwgLXRoaXMuVEhSRVNIT0xEX1gpO1xuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBXaGV0aGVyIHNwZWNpZmllZCBwb3NpdGlvbnMgb3ZlcmNvbWUgdGhlIHRocmVzaG9sZC5cblx0XHQgKiBAc2VlICNUSFJFU0hPTERfWVxuXHRcdCAqL1xuXHRcdGlzT3ZlclRocmVzaG9sZFk6IGZ1bmN0aW9uKCkge1xuXHRcdFx0bGV0IGF0dHIgPSB0aGlzLmF0dHJpYnV0ZXM7XG5cdFx0XHRsZXQgZGVsdGEgPSBhdHRyLmN1clkgLSBhdHRyLmZyb21ZO1xuXHRcdFx0cmV0dXJuIChkZWx0YSA+IHRoaXMuVEhSRVNIT0xEX1kgfHwgZGVsdGEgPCAtdGhpcy5USFJFU0hPTERfWSk7XG5cdFx0fVxuXHR9KTtcblxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdC8vIFVJU3dpcGVcblxuXHQvKipcblx0ICogVUkgZm9yIHN3aXBpbmcuXG5cdCAqIEBjb25zdHJ1Y3RvclxuXHQgKi9cblx0bGV0IFVJU3dpcGUgPSBPc3Rlb3Bvcm9zaXMuVmlldy5leHRlbmQoe1xuXHRcdGRlZmF1bHRzOiB7XG5cdFx0XHRidXR0b25zOiBbIHsga2V5OidkZWxldGUnLCBsYWJlbDonRGVsZXRlJyB9IF1cblx0XHR9LFxuXG5cdFx0aW5pdGlhbGl6ZTogZnVuY3Rpb24ob3B0aW9ucykge1xuXHRcdFx0dGhpcy5vcHRpb25zID0ge1xuXHRcdFx0XHRidXR0b25zOiBvcHRpb25zLmJ1dHRvbnMgfHwgdGhpcy5kZWZhdWx0cy5idXR0b25zXG5cdFx0XHR9O1xuXG5cdFx0XHQvLyBwcmVwYXJlIG1vZGVsc1xuXHRcdFx0dGhpcy5zdGF0dXMgPSBuZXcgU3RhdHVzKCk7XG5cblx0XHRcdC8vIGxpc3RlbiBtb2RlbHNcblx0XHRcdGxldCBzdGF0dXMgPSB0aGlzLnN0YXR1cztcblx0XHRcdHRoaXMubGlzdGVuVG8oc3RhdHVzLCAnY2hhbmdlOnBoYXNlJywgdGhpcy5zdGF0dXNfb25jaGFuZ2VfcGhhc2UpO1xuXHRcdFx0dGhpcy5saXN0ZW5UbyhzdGF0dXMsICdjaGFuZ2U6Y3VyWCcsIHRoaXMuc3RhdHVzX29uY2hhbmdlX2N1clgpO1xuXHRcdFx0dGhpcy5saXN0ZW5UbyhzdGF0dXMsICdjaGFuZ2U6ZGVsdGFYJywgdGhpcy5zdGF0dXNfb25jaGFuZ2VfZGVsdGFYKTtcblxuXHRcdFx0Ly8gbGlzdGVuIGVsZW1lbnRzXG5cdFx0XHRsZXQgJGRvY3VtZW50ID0gJChkb2N1bWVudCk7XG5cdFx0XHR0aGlzLmxpc3RlblRvKHRoaXMuJGVsLCAnbW91c2Vkb3duJywgdGhpcy5lbF9vbm1vdXNlZG93bik7XG5cdFx0XHR0aGlzLmxpc3RlblRvKCRkb2N1bWVudCwgJ21vdXNlZG93bicsIHRoaXMuZG9jdW1lbnRfb25tb3VzZWRvd24pO1xuXHRcdFx0dGhpcy5saXN0ZW5UbygkZG9jdW1lbnQsICdtb3VzZW1vdmUnLCB0aGlzLmRvY3VtZW50X29ubW91c2Vtb3ZlKTtcblx0XHRcdHRoaXMubGlzdGVuVG8oJGRvY3VtZW50LCAnbW91c2V1cCcsIHRoaXMuZG9jdW1lbnRfb25tb3VzZXVwKTtcblx0XHRcdHRoaXMubGlzdGVuVG8odGhpcy4kZWwsICd0b3VjaHN0YXJ0JywgdGhpcy5lbF9vbnRvdWNoc3RhcnQpO1xuXHRcdFx0dGhpcy5saXN0ZW5UbygkZG9jdW1lbnQsICd0b3VjaHN0YXJ0JywgdGhpcy5kb2N1bWVudF9vbnRvdWNoc3RhcnQpO1xuXHRcdFx0dGhpcy5saXN0ZW5UbygkZG9jdW1lbnQsICd0b3VjaG1vdmUnLCB0aGlzLmRvY3VtZW50X29udG91Y2htb3ZlKTtcblx0XHRcdHRoaXMubGlzdGVuVG8oJGRvY3VtZW50LCAndG91Y2hlbmQnLCB0aGlzLmRvY3VtZW50X29udG91Y2hlbmQpO1xuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBTdGFydCB3aGF0Y2hpbmcgdXNlcidzIG9wZXJhdGlvbi5cblx0XHQgKiBAcGFyYW0ge051bWJlcn0gcG9zaXRpb25zLnhcblx0XHQgKiBAcGFyYW0ge051bWJlcn0gcG9zaXRpb25zLnlcblx0XHQgKi9cblx0XHRzdGFydFByZW1vdmluZzogZnVuY3Rpb24ocG9zaXRpb25zKSB7XG5cdFx0XHR0aGlzLl9zZXR1cFRvb2xzKCk7XG5cdFx0XHR0aGlzLnN0YXR1cy5zZXQoe1xuXHRcdFx0XHRmcm9tWDogcG9zaXRpb25zLngsXG5cdFx0XHRcdGZyb21ZOiBwb3NpdGlvbnMueVxuXHRcdFx0fSk7XG5cdFx0XHR0aGlzLnN0YXR1cy5zZXQoeyBwcmVtb3Zpbmc6dHJ1ZSB9KTtcblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICogU2V0IHVwIHRvb2wgYnV0dG9ucy5cblx0XHQgKi9cblx0XHRfc2V0dXBUb29sczogZnVuY3Rpb24oKSB7XG5cdFx0XHRsZXQgJHJvdyA9IHRoaXMuJGVsO1xuXHRcdFx0bGV0ICR0b29scyA9IHRoaXMuJHJvd1Rvb2xzO1xuXG5cdFx0XHRpZiAoISR0b29scykge1xuXHRcdFx0XHR0aGlzLl9pbml0Um93VG9vbHMoKTtcblx0XHRcdFx0JHRvb2xzID0gdGhpcy4kcm93VG9vbHM7XG5cdFx0XHR9XG5cblx0XHRcdCR0b29scy5jc3MoeyBkaXNwbGF5OidibG9jaycgfSk7XG5cblx0XHRcdGxldCBwb3MgPSAkcm93Lm9mZnNldCgpO1xuXHRcdFx0bGV0IGhlaWdodCA9ICRyb3cub3V0ZXJIZWlnaHQoKTtcblx0XHRcdGxldCB3aWR0aCA9ICRyb3cub3V0ZXJXaWR0aCgpO1xuXHRcdFx0JHRvb2xzLmNzcyh7XG5cdFx0XHRcdGhlaWdodDogaGVpZ2h0LFxuXHRcdFx0XHRsaW5lSGVpZ2h0OiBoZWlnaHQrJ3B4Jyxcblx0XHRcdFx0dG9wOiBwb3MudG9wXG5cdFx0XHR9KTtcblxuXHRcdFx0dGhpcy5zdGF0dXMuc2V0KHtcblx0XHRcdFx0bWF4TGVmdDogMCxcblx0XHRcdFx0bWluTGVmdDogLSR0b29scy5vdXRlcldpZHRoKClcblx0XHRcdH0pO1xuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBJbml0aWFsaXplIHJvdyB0b29sIGJ1dHRvbnMuXG5cdFx0ICogUnVuIG9ubHkgZmlyc3QgdGltZS5cblx0XHQgKi9cblx0XHRfaW5pdFJvd1Rvb2xzOiBmdW5jdGlvbigpIHtcblx0XHRcdGxldCAkdG9vbHMgPSAkKHRoaXMuX2NyZWF0ZSRyb3dUb29scygpKTtcblx0XHRcdCR0b29scy5hcHBlbmRUbyhkb2N1bWVudC5ib2R5KTtcblxuXHRcdFx0dGhpcy4kcm93VG9vbHMgPSAkdG9vbHM7XG5cdFx0XHR0aGlzLmVsUm93VG9vbHMgPSAkdG9vbHNbMF07XG5cblx0XHRcdHRoaXMubGlzdGVuVG8oJHRvb2xzLCAnY2xpY2snLCB0aGlzLnJvd1Rvb2xzX29uY2xpY2spO1xuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBDcmVhdGUgZWxlbWVudHMgb2YgdG9vbCBidXR0b24gYWxvbmcgdGhlIG9wdGlvbnNcblx0XHQgKiB3aGljaCBhcmUgc3BlY2lmaWVkIGluIHRoZSBjb25zdHJ1Y3Rvci5cblx0XHQgKiBAcmV0dXJuIHtFbGVtZW50fVxuXHRcdCAqL1xuXHRcdF9jcmVhdGUkcm93VG9vbHM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0bGV0IGh0bWwgPSAnPGRpdiBjbGFzcz1cInVpLXN3b29zaFRhYmxlLXJvd1Rvb2xzXCI+Jztcblx0XHRcdHRoaXMub3B0aW9ucy5idXR0b25zLmNvbmNhdCgpLnJldmVyc2UoKS5mb3JFYWNoKChkYXRhKT0+e1xuXHRcdFx0XHRodG1sICs9IGA8YnV0dG9uIGNsYXNzPVwidWktc3dvb3NoVGFibGUtdG9vbEJ1dG9uIHJvd1Rvb2xzLWl0ZW1cIiBkYXRhLXN3b29zaFRhYmxlLWtleT1cIiR7ZGF0YS5rZXl9XCI+JHtkYXRhLmxhYmVsfTwvYnV0dG9uPmA7XG5cdFx0XHR9KTtcblx0XHRcdGh0bWwgKz0gJzwvZGl2Pic7XG5cblx0XHRcdGxldCBlbEZhY3RvcnkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblx0XHRcdGVsRmFjdG9yeS5pbnNlcnRBZGphY2VudEhUTUwoJ2FmdGVyYmVnaW4nLCBodG1sKTtcblx0XHRcdGxldCBlbCA9IGVsRmFjdG9yeS5maXJzdENoaWxkO1xuXHRcdFx0cmV0dXJuIGVsO1xuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBVcGRhdGUgc3RhdHVzIGJlZm9yZSBhY3R1YWwgYmVoYXZpb3Vycy5cblx0XHQgKiBAcGFyYW0ge051bWJlcn0gcG9zaXRpb25zLnhcblx0XHQgKiBAcGFyYW0ge051bWJlcn0gcG9zaXRpb25zLnlcblx0XHQgKi9cblx0XHR1cGRhdGVQcmVtb3Zpbmc6IGZ1bmN0aW9uKHBvc2l0aW9ucykge1xuXHRcdFx0aWYgKHRoaXMuc3RhdHVzLmlzT3ZlclRocmVzaG9sZFkocG9zaXRpb25zKSkge1xuXHRcdFx0XHR0aGlzLnN0YXR1cy5zZXQoeyBtb3ZpbmdZOnRydWUgfSk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmICh0aGlzLnN0YXR1cy5pc092ZXJUaHJlc2hvbGRYKHBvc2l0aW9ucykpIHtcblx0XHRcdFx0dGhpcy5zdGF0dXMuc2V0KHsgbW92aW5nWDp0cnVlIH0pO1xuXHRcdFx0XHR0aGlzLnN0YXR1cy5zZXQoe1xuXHRcdFx0XHRcdGZyb21YOiBwb3NpdGlvbnMueCxcblx0XHRcdFx0XHRmcm9tWTogcG9zaXRpb25zLnlcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIFJlc2V0IG1vdmluZyBmbGFncy5cblx0XHQgKi9cblx0XHRzdG9wTW92aW5nOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuc3RhdHVzLnNldCh7XG5cdFx0XHRcdG1vdmluZ1g6IGZhbHNlLFxuXHRcdFx0XHRtb3ZpbmdZOiBmYWxzZSxcblx0XHRcdFx0cHJlbW92aW5nOiBmYWxzZVxuXHRcdFx0fSk7XG5cdFx0XHR0aGlzLiRlbC5jc3MoeyB0cmFuc2Zvcm06JycgfSk7XG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIFVwZGF0ZSBlbGVtZW50IHN0eWxlcyBieSBwaGFzZXMuXG5cdFx0ICovXG5cdFx0X3VwZGF0ZVBoYXNlOiBmdW5jdGlvbigpIHtcblx0XHRcdGxldCBzdGF0dXMgPSB0aGlzLnN0YXR1cztcblx0XHRcdGxldCAkZWwgPSB0aGlzLiRlbDtcblxuXHRcdFx0JGVsLnRvZ2dsZUNsYXNzKCd1aS1zd29vc2hUYWJsZS1yb3ctLXN3aXBpbmcnLCBzdGF0dXMuaXNTd2lwaW5nKCkpO1xuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBVcGRhdGUgZWxlbWVudCBwb3NpdGlvbiBieSB0aGUgb3JpZ2luIGFuZCBjdXJyZW50IHBvc2l0aW9ucy5cblx0XHQgKi9cblx0XHRfdXBkYXRlTGVmdDogZnVuY3Rpb24oKSB7XG5cdFx0XHRsZXQgc3RhdHVzID0gdGhpcy5zdGF0dXM7XG5cdFx0XHRsZXQgbWluTGVmdCA9IHN0YXR1cy5nZXQoJ21pbkxlZnQnKTtcblx0XHRcdGxldCBtYXhMZWZ0ID0gc3RhdHVzLmdldCgnbWF4TGVmdCcpO1xuXHRcdFx0bGV0IGR4ID0gc3RhdHVzLmdldCgnZGVsdGFYJyk7XG5cdFx0XHRsZXQgbGVmdCA9IE1hdGgubWluKE1hdGgubWF4KGR4LCBtaW5MZWZ0KSwgbWF4TGVmdCk7XG5cdFx0XHR0aGlzLiRlbC5jc3MoeyB0cmFuc2Zvcm06J3RyYW5zbGF0ZVgoJyArIGxlZnQgKyAncHgpJyB9KTtcblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICogR2V0IHBvaW50ZXIgcG9zaXRpb25zIGZyb20gc3BlY2lmaWVkIHBvaW50ZXIgZXZlbnQuXG5cdFx0ICogQHBhcmFtIHtOdW1iZXJ9IHBvc2l0aW9ucy54XG5cdFx0ICogQHBhcmFtIHtOdW1iZXJ9IHBvc2l0aW9ucy55XG5cdFx0ICovXG5cdFx0Z2V0UG9zaXRpb25zRnJvbUV2ZW50OiBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0ZXZlbnQgPSBldmVudC5vcmlnaW5hbEV2ZW50IHx8IGV2ZW50O1xuXG5cdFx0XHRsZXQgcG9zaXRpb25zO1xuXHRcdFx0aWYgKGV2ZW50LnRvdWNoZXMpIHtcblx0XHRcdFx0cG9zaXRpb25zID0ge1xuXHRcdFx0XHRcdHg6IGV2ZW50LnRvdWNoZXNbMF0ucGFnZVgsXG5cdFx0XHRcdFx0eTogZXZlbnQudG91Y2hlc1swXS5wYWdlWVxuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdHBvc2l0aW9ucyA9IHtcblx0XHRcdFx0XHR4OiBldmVudC5wYWdlWCxcblx0XHRcdFx0XHR5OiBldmVudC5wYWdlWVxuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHBvc2l0aW9ucztcblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICogR2V0IGJhY2sgdG8gdGhlIG9yaWdpbmFsIHBvc2l0aW9uLlxuXHRcdCAqL1xuXHRcdHJlc3RvcmU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5zdGF0dXMuc2V0KHsgcGhhc2U6J3dhaXRpbmcnIH0pO1xuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBEZXRhY2ggcmVzb3VyY2VzLlxuXHRcdCAqL1xuXHRcdGRlc3Ryb3k6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblx0XHRcdC8vIE1heWJlIG5vdCBlbm91Z2guLi5cblxuXHRcdFx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cdFx0XHRvcHRpb25zLnJlbW92ZURvbSA9IChvcHRpb25zLnJlbW92ZURvbSAhPT0gZmFsc2UpO1xuXG5cdFx0XHRpZiAob3B0aW9ucy5yZW1vdmVEb20pIHtcblx0XHRcdFx0dGhpcy4kZWwucmVtb3ZlKCk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICh0aGlzLiRyb3dUb29scykge1xuXHRcdFx0XHR0aGlzLiRyb3dUb29scy5yZW1vdmUoKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICogUmV0dXJuIHRydWUgaWYgc3BlY2lmaWVkIGV2ZW50IGlzIG9jY3VyZWQgb24gdG9vbCBlbGVtZW50LlxuXHRcdCAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG5cdFx0ICogQHJldHVybnMge0Jvb2xlYW59XG5cdFx0ICovXG5cdFx0aXNFdmVudE9jY3VyZWRPblJvd1Rvb2xzOiBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0bGV0IGVsUm93VG9vbHMgPSB0aGlzLmVsUm93VG9vbHM7XG5cdFx0XHRsZXQgb25Ub29scyA9IGZhbHNlO1xuXHRcdFx0Zm9yIChsZXQgZWw9ZXZlbnQudGFyZ2V0OyBlbDsgZWw9ZWwucGFyZW50RWxlbWVudCkge1xuXHRcdFx0XHRpZiAoZWwgPT09IGVsUm93VG9vbHMpIHtcblx0XHRcdFx0XHRvblRvb2xzID0gdHJ1ZTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIG9uVG9vbHM7XG5cdFx0fSxcblxuXHRcdGhhbmRsZVBvaW50aW5nU3RhcnQ6IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRsZXQgc3RhdHVzID0gdGhpcy5zdGF0dXM7XG5cblx0XHRcdGlmICghdGhpcy5pc0V2ZW50T2NjdXJlZE9uUm93VG9vbHMoZXZlbnQpICYmIHN0YXR1cy5pc1N3aXBlZE92ZXIoKSkge1xuXHRcdFx0XHRzdGF0dXMuc2V0KHsgcGhhc2U6c3RhdHVzLlBIQVNFX1dBSVRJTkcgfSk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdGhhbmRsZVBvaW50ZXJNb3ZlbWVudDogZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGxldCBzdGF0dXMgPSB0aGlzLnN0YXR1cztcblx0XHRcdGxldCBwb3NpdGlvbnM7XG5cblx0XHRcdGlmIChzdGF0dXMuaXNQcmVhY3Rpb24oKSB8fCBzdGF0dXMuaXNTd2lwaW5nKCkpIHtcblx0XHRcdFx0cG9zaXRpb25zID0gdGhpcy5nZXRQb3NpdGlvbnNGcm9tRXZlbnQoZXZlbnQpO1xuXHRcdFx0XHRzdGF0dXMuc2V0KHtcblx0XHRcdFx0XHRjdXJYOiBwb3NpdGlvbnMueCxcblx0XHRcdFx0XHRjdXJZOiBwb3NpdGlvbnMueVxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHQvLyBwcmV2ZW50IHNjcm9sbGluZyB3aGlsZSBzd2lwaW5nXG5cdFx0XHRcdGlmIChldmVudC50eXBlID09PSAndG91Y2htb3ZlJyAmJiBzdGF0dXMuaXNQcmVhY3Rpb24oKSB8fCBzdGF0dXMuaXNTd2lwaW5nKCkpIHtcblx0XHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdGhhbmRsZVBvaW50aW5nU3RvcDogZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGxldCBzdGF0dXMgPSB0aGlzLnN0YXR1cztcblxuXHRcdFx0aWYgKHN0YXR1cy5nZXQoJ2RlbHRhWCcpIDwgc3RhdHVzLmdldCgnbWluTGVmdCcpKSB7XG5cdFx0XHRcdHN0YXR1cy5zZXQoeyBwaGFzZTpzdGF0dXMuUEhBU0VfU1dJUEVET1ZFUiB9KTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCFzdGF0dXMuaXNTd2lwZWRPdmVyKCkpIHtcblx0XHRcdFx0c3RhdHVzLnNldCh7IHBoYXNlOnN0YXR1cy5QSEFTRV9XQUlUSU5HIH0pO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRzdGF0dXNfb25jaGFuZ2VfcGhhc2U6IGZ1bmN0aW9uKHN0YXR1cywgcGhhc2UpIHtcblx0XHRcdGxldCBhdHRyID0gc3RhdHVzLmF0dHJpYnV0ZXM7XG5cblx0XHRcdGlmIChwaGFzZSA9PT0gc3RhdHVzLlBIQVNFX1dBSVRJTkcpIHtcblx0XHRcdFx0c3RhdHVzLnNldCh7XG5cdFx0XHRcdFx0Y3VyWDogTmFOLFxuXHRcdFx0XHRcdGN1clk6IE5hTixcblx0XHRcdFx0XHRkZWx0YVg6IDAsXG5cdFx0XHRcdFx0ZnJvbVg6IE5hTixcblx0XHRcdFx0XHRmcm9tWTogTmFOXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAocGhhc2UgPT09IHN0YXR1cy5QSEFTRV9QUkVBQ1RJT04pIHtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHBoYXNlID09PSBzdGF0dXMuUEhBU0VfU1dJUElORykge1xuXHRcdFx0XHR0aGlzLl9zZXR1cFRvb2xzKCk7XG5cdFx0XHRcdHN0YXR1cy5zZXQoe1xuXHRcdFx0XHRcdGZyb21YOiBhdHRyLmN1clgsXG5cdFx0XHRcdFx0ZnJvbVk6IGF0dHIuY3VyWVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHBoYXNlID09PSBzdGF0dXMuUEhBU0VfU1dJUEVET1ZFUikge1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLl91cGRhdGVQaGFzZSgpO1xuXHRcdH0sXG5cblx0XHRzdGF0dXNfb25jaGFuZ2VfY3VyWDogZnVuY3Rpb24oc3RhdHVzLCB2YWx1ZSkge1xuXHRcdFx0aWYgKHN0YXR1cy5pc1ByZWFjdGlvbigpKSB7XG5cdFx0XHRcdGlmIChzdGF0dXMuaXNPdmVyVGhyZXNob2xkWCgpKSB7XG5cdFx0XHRcdFx0c3RhdHVzLnNldCh7IHBoYXNlOnN0YXR1cy5QSEFTRV9TV0lQSU5HIH0pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgaWYgKHN0YXR1cy5pc092ZXJUaHJlc2hvbGRZKCkpIHtcblx0XHRcdFx0XHRzdGF0dXMuc2V0KHsgcGhhc2U6c3RhdHVzLlBIQVNFX1dBSVRJTkcgfSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHN0YXR1cy5pc1N3aXBpbmcoKSkge1xuXHRcdFx0XHRsZXQgYXR0ciA9IHN0YXR1cy5hdHRyaWJ1dGVzO1xuXHRcdFx0XHRsZXQgZHggPSBhdHRyLmN1clggLSBhdHRyLmZyb21YO1xuXHRcdFx0XHRzdGF0dXMuc2V0KHsgZGVsdGFYOmR4IH0pO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRzdGF0dXNfb25jaGFuZ2VfZGVsdGFYOiBmdW5jdGlvbihtb2RlbCwgdmFsdWUpIHtcblx0XHRcdHRoaXMuX3VwZGF0ZUxlZnQoKTtcblxuXHRcdFx0aWYgKHZhbHVlID09PSAwKSB7XG5cdFx0XHRcdGlmICh0aGlzLiRyb3dUb29scykge1xuXHRcdFx0XHRcdHRoaXMuJHJvd1Rvb2xzLmNzcyh7IGRpc3BsYXk6J25vbmUnIH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdGVsX29ubW91c2Vkb3duOiBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdGxldCBwb3NpdGlvbnMgPSB0aGlzLmdldFBvc2l0aW9uc0Zyb21FdmVudChldmVudCk7XG5cdFx0XHRsZXQgc3RhdHVzID0gdGhpcy5zdGF0dXM7XG5cblx0XHRcdHN0YXR1cy5zZXQoe1xuXHRcdFx0XHRmcm9tWDogcG9zaXRpb25zLngsXG5cdFx0XHRcdGZyb21ZOiBwb3NpdGlvbnMueSxcblx0XHRcdFx0cGhhc2U6IHN0YXR1cy5QSEFTRV9QUkVBQ1RJT05cblx0XHRcdH0pO1xuXHRcdH0sXG5cblx0XHRkb2N1bWVudF9vbm1vdXNlZG93bjogZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdHRoaXMuaGFuZGxlUG9pbnRpbmdTdGFydChldmVudCk7XG5cdFx0fSxcblxuXHRcdGRvY3VtZW50X29ubW91c2Vtb3ZlOiBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0dGhpcy5oYW5kbGVQb2ludGVyTW92ZW1lbnQoZXZlbnQpO1xuXHRcdH0sXG5cblx0XHRkb2N1bWVudF9vbm1vdXNldXA6IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHR0aGlzLmhhbmRsZVBvaW50aW5nU3RvcChldmVudCk7XG5cdFx0fSxcblxuXHRcdGVsX29udG91Y2hzdGFydDogZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGxldCBwb3NpdGlvbnMgPSB0aGlzLmdldFBvc2l0aW9uc0Zyb21FdmVudChldmVudCk7XG5cdFx0XHRsZXQgc3RhdHVzID0gdGhpcy5zdGF0dXM7XG5cblx0XHRcdHN0YXR1cy5zZXQoe1xuXHRcdFx0XHRmcm9tWDogcG9zaXRpb25zLngsXG5cdFx0XHRcdGZyb21ZOiBwb3NpdGlvbnMueSxcblx0XHRcdFx0cGhhc2U6IHN0YXR1cy5QSEFTRV9QUkVBQ1RJT05cblx0XHRcdH0pO1xuXHRcdH0sXG5cblx0XHRkb2N1bWVudF9vbnRvdWNoc3RhcnQ6IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHR0aGlzLmhhbmRsZVBvaW50aW5nU3RhcnQoZXZlbnQpO1xuXHRcdH0sXG5cblx0XHRkb2N1bWVudF9vbnRvdWNobW92ZTogZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdHRoaXMuaGFuZGxlUG9pbnRlck1vdmVtZW50KGV2ZW50KTtcblx0XHR9LFxuXG5cdFx0ZG9jdW1lbnRfb250b3VjaGVuZDogZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdHRoaXMuaGFuZGxlUG9pbnRpbmdTdG9wKGV2ZW50KTtcblx0XHR9LFxuXG5cdFx0cm93VG9vbHNfb25jbGljazogZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGxldCBlbEJ1dHRvbiA9IGdldENsb3Nlc3QoZXZlbnQudGFyZ2V0LCAnLnVpLXN3b29zaFRhYmxlLXRvb2xCdXRvbicpO1xuXHRcdFx0bGV0IGRhdGEgPSB7XG5cdFx0XHRcdGV2ZW50LFxuXHRcdFx0XHRlbEJ1dHRvbixcblx0XHRcdFx0a2V5OiBlbEJ1dHRvbi5nZXRBdHRyaWJ1dGUoJ2RhdGEtc3dvb3NoVGFibGUta2V5Jylcblx0XHRcdH07XG5cdFx0XHR0aGlzLnRyaWdnZXIoJ2NsaWNrYnV0dG9uJywgdGhpcywgZGF0YSk7XG5cdFx0fVxuXHR9KTtcblxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdC8vIFN3b29zaFRhYmxlXG5cblx0bGV0IFN3b29zaFRhYmxlID0gT3N0ZW9wb3Jvc2lzLlZpZXcuZXh0ZW5kKHtcblx0XHQvKipcblx0XHQgKiBAdHlwZSBBcnJheVxuXHRcdCAqL1xuXHRcdHN1YlZpZXdzOiBudWxsLFxuXG5cdFx0aW5pdGlhbGl6ZTogZnVuY3Rpb24ob3B0aW9ucykge1xuXHRcdFx0aWYgKHR5cGVvZiBvcHRpb25zID09PSAnc3RyaW5nJykge1xuXHRcdFx0XHRsZXQgc2VsZWN0b3IgPSBvcHRpb25zO1xuXHRcdFx0XHRvcHRpb25zID0ge307XG5cdFx0XHRcdHRoaXMuJGVsID0gJChzZWxlY3Rvcik7XG5cdFx0XHRcdHRoaXMuZWwgPSB0aGlzLiRlbFswXTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKG9wdGlvbnMuJHJvd1Rvb2xzKSB7XG5cdFx0XHRcdHRoaXMuJHJvd1Rvb2xzID0gb3B0aW9ucy4kcm93VG9vbHM7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0dGhpcy4kcm93VG9vbHMgPSB0aGlzLl9jcmVhdGUkcm93VG9vbHMoKTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5faW5pdFN1YlZpZXdzKCk7XG5cdFx0fSxcblxuXHRcdF9pbml0U3ViVmlld3M6IGZ1bmN0aW9uKCkge1xuXHRcdFx0bGV0IHZpZXdzID0gdGhpcy5zdWJWaWV3cyA9IFtdO1xuXHRcdFx0bGV0ICRyb3dzID0gdGhpcy4kKCc+dHIsID50Ym9keT50cicpO1xuXHRcdFx0bGV0ICRyb3dUb29scyA9IHRoaXMuJHJvd1Rvb2xzO1xuXHRcdFx0bGV0IGNyZWF0ZSRyb3dUb29scyA9IHRoaXMuX2NyZWF0ZSRyb3dUb29scy5iaW5kKHRoaXMpO1xuXHRcdFx0JHJvd3MuZWFjaChmdW5jdGlvbihpbmRleCwgZWxSb3cpIHtcblx0XHRcdFx0bGV0IHZpZXcgPSBuZXcgVUlTd2lwZSh7XG5cdFx0XHRcdFx0ZWw6IGVsUm93LFxuXHRcdFx0XHRcdGNyZWF0ZSRyb3dUb29sczogY3JlYXRlJHJvd1Rvb2xzLFxuXHRcdFx0XHR9KTtcblx0XHRcdFx0dGhpcy5saXN0ZW5Ubyh2aWV3LCAnY2xpY2snLCB0aGlzLnN1YlZpZXdfb25jbGljayk7XG5cdFx0XHRcdHZpZXdzLnB1c2godmlldyk7XG5cdFx0XHR9LmJpbmQodGhpcykpO1xuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBDcmVhdGUgYW4gdW5pcXVlIGVsZW1lbnQgd2hpY2ggaXMgcHJvdmlkZXMgYnV0dG9ucyBmb3IgZWFjaCByb3cuXG5cdFx0ICogQHJldHVybnMge0VsZW1lbnR9XG5cdFx0ICovXG5cdFx0X2NyZWF0ZSRyb3dUb29sczogZnVuY3Rpb24oKSB7XG5cdFx0XHRsZXQgJHJvd1Rvb2xzID0gJCh0aGlzLl90ZW1wbGF0ZSRyb3dUb29scyh7fSkpO1xuXHRcdFx0JHJvd1Rvb2xzLmFwcGVuZFRvKGRvY3VtZW50LmJvZHkpO1xuXHRcdFx0cmV0dXJuICRyb3dUb29scztcblx0XHR9LFxuXG5cdFx0X3RlbXBsYXRlJHJvd1Rvb2xzOiBmdW5jdGlvbihkYXRhKSB7XG5cdFx0XHRsZXQgaHRtbCA9XG5cdFx0XHRcdCc8ZGl2IGNsYXNzPVwidWktc3dvb3NoVGFibGUtcm93VG9vbHNcIj4nICtcblx0XHRcdFx0XHQnPGJ1dHRvbiBjbGFzcz1cInVpLXN3b29zaFRhYmxlLXRvb2xCdXRvbiByb3dUb29scy1pdGVtIHJvd1Rvb2xzLWl0ZW0tZGVsZXRlXCI+RGVsZXRlPC9idXR0b24+JyArXG5cdFx0XHRcdCc8L2Rpdj4nO1xuXHRcdFx0bGV0IGVsRmFjdG9yeSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXHRcdFx0ZWxGYWN0b3J5Lmluc2VydEFkamFjZW50SFRNTCgnYWZ0ZXJiZWdpbicsIGh0bWwpO1xuXHRcdFx0bGV0IGVsID0gZWxGYWN0b3J5LmZpcnN0Q2hpbGQ7XG5cdFx0XHRyZXR1cm4gZWw7XG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIFJlbW92ZSBzcGVjaWZpZWQgcm93IGFuZCBpdHMgcmVzb3VyY2VzLlxuXHRcdCAqIEBwYXJhbSB7VUlTd2lwZXxFbGVtZW50fSByb3dcblx0XHQgKi9cblx0XHRyZW1vdmVSb3c6IGZ1bmN0aW9uKHJvdykge1xuXHRcdFx0aWYgKCEocm93IGluc3RhbmNlb2YgVUlTd2lwZSkpIHtcblx0XHRcdFx0bGV0IGVsUm93ID0gcm93O1xuXHRcdFx0XHRyb3cgPSBmaW5kRnJvbUFycmF5KHRoaXMuc3ViVmlld3MsIGZ1bmN0aW9uKHZpZXcpIHtcblx0XHRcdFx0XHRyZXR1cm4gKHZpZXcuJGVsWzBdID09PSBlbFJvdyk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0cm93LmRlc3Ryb3koKTtcblx0XHR9LFxuXG5cdFx0c3ViVmlld19vbmNsaWNrOiBmdW5jdGlvbih2aWV3LCBldmVudCwgZWxCdXR0b24pIHtcblx0XHRcdHRoaXMudHJpZ2dlcignY2xpY2snLCBldmVudCwgdmlldywgZWxCdXR0b24pO1xuXHRcdH1cblx0fSk7XG5cblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQvLyBleHBvcnRcblxuXHRVSVN3aXBlLlN0YXR1cyA9IFN0YXR1cztcblx0d2luZG93LlVJU3dpcGUgPSBVSVN3aXBlO1xuXHR3aW5kb3cuU3dvb3NoVGFibGUgPSBTd29vc2hUYWJsZTtcbn0pKHdpbmRvdywgZG9jdW1lbnQsIHdpbmRvdy4kKTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
