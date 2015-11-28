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
	var Model_beforeInitialize = Osteoporosis.Model.prototype.__osteoporosis__;
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
	Osteoporosis.View.prototype.listenTo = function(obj, type, listener) {
		obj.on(type, listener.bind(this));
	};

	// ----------------------------------------------------------------

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
			var attr = this.attributes;
			var delta = attr.curX - attr.fromX;
			return (delta > this.THRESHOLD_X || delta < -this.THRESHOLD_X);
		},

		/**
		 * Whether specified positions overcome the threshold.
		 * @see #THRESHOLD_Y
		 */
		isOverThresholdY: function() {
			var attr = this.attributes;
			var delta = attr.curY - attr.fromY;
			return (delta > this.THRESHOLD_Y || delta < -this.THRESHOLD_Y);
		}
	});

	// ----------------------------------------------------------------

	/**
	 * UI for swiping.
	 * @constructor
	 */
	UISwipe = Osteoporosis.View.extend({
		initialize: function(options) {
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
		startPremoving: function(positions) {
			this._initDelete();
			this.status.set({
				fromX: positions.x,
				fromY: positions.y
			});
			this.status.set({ premoving:true });
		},

		_initDelete: function() {
			this.$rowTools = $('.ui-tableView-rowTools');

			var $row = this.$el;
			var pos = $row.offset();
			var height = $row.outerHeight();
			var width = $row.outerWidth();
			this.$rowTools.css({
				height: height,
				lineHeight: height+'px',
				top: pos.top
			});

			this.status.set({
				maxLeft: 0,
				minLeft: -this.$rowTools.outerWidth()
			});
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
			var status = this.status;
			var $el = this.$el;

			$el.toggleClass('ui-tableView-row--swiping', status.isSwiping());
		},

		/**
		 * Update element position by the origin and current positions.
		 */
		_updateLeft: function() {
			var status = this.status;
			var minLeft = status.get('minLeft');
			var maxLeft = status.get('maxLeft');
			var dx = status.get('deltaX');
			var left = Math.min(Math.max(dx, minLeft), maxLeft);
			this.$el.css({ transform:'translateX(' + left + 'px)' });
		},

		/**
		 * Get pointer positions from specified pointer event.
		 * @param {Number} positions.x
		 * @param {Number} positions.y
		 */
		getPositionsFromEvent: function(event) {
			event = event.originalEvent || event;

			var positions;
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

		status_onchange_phase: function(status, phase) {
			var attr = status.attributes;

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
				this._initDelete();
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
				var attr = status.attributes;
				var dx = attr.curX - attr.fromX;
				status.set({ deltaX:dx });
			}
		},

		status_onchange_deltaX: function(model, value) {
			this._updateLeft();
		},

		el_onmousedown: function(event) {
			event.preventDefault();
			var positions = this.getPositionsFromEvent(event);
			var status = this.status;

			status.set({
				fromX: positions.x,
				fromY: positions.y,
				phase: status.PHASE_PREACTION
			});
		},

		document_onmousedown: function(event) {
			var status = this.status;

			if (status.isSwipedOver()) {
				status.set({ phase:status.PHASE_WAITING });
			}
		},

		document_onmousemove: function(event) {
			var status = this.status;
			var position;

			if (status.isPreaction() || status.isSwiping()) {
				positions = this.getPositionsFromEvent(event);
				status.set({
					curX: positions.x,
					curY: positions.y
				});
			}
		},

		document_onmouseup: function(event) {
			var status = this.status;

			if (status.get('deltaX') < status.get('minLeft')) {
				status.set({ phase:status.PHASE_SWIPEDOVER });
			}

			if (!status.isSwipedOver()) {
				status.set({ phase:status.PHASE_WAITING });
			}
		},

		el_ontouchstart: function(event) {
			var positions = this.getPositionsFromEvent(event);
			var status = this.status;

			status.set({
				fromX: positions.x,
				fromY: positions.y,
				phase: status.PHASE_PREACTION
			});
		},

		document_ontouchstart: function(event) {
			var status = this.status;
			if (status.isSwipedOver()) {
				status.set({ phase:status.PHASE_WAITING });
			}
		},

		document_ontouchmove: function(event) {
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

		document_ontouchend: function(event) {
			var status = this.status;

			if (status.get('deltaX') < status.get('minLeft')) {
				status.set({ phase:status.PHASE_SWIPEDOVER });
			}

			if (!status.isSwipedOver()) {
				status.set({ phase:status.PHASE_WAITING });
			}
		}
	});

	// ----------------------------------------------------------------
	// export

	UISwipe.Status = Status;
	window.UISwipe = UISwipe;
})(window, document, window.$);
