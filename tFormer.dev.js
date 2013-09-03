/**
 * tFormer.js - empower your forms
 * http://tjrus.com/tFormer
 * (c) 2013 Vasiliy Zubach (aka TjRus) - http://tjrus.com/
 * tFormer may be freely distributed under the MIT license.
 */
"use strict";

(function ( window, document, undefined ){

	// button types
	var BUTTON_TYPES = ['button', 'submit'];
	// all field types that can be empowered with tFormer
	var FIELD_TYPES = ['text', 'password', 'select-one', 'checkbox', 'textarea', 'range', 'number', 'email', 'hidden', 'file', 'date', 'datetime-local', 'search', 'tel', 'time', 'url', 'month', 'week'];
	// fields that has only 'change' event
	var HAS_CHANGE_EVENT = ['checkbox', 'select-one', 'select', 'file'];
	// fields that has also 'change' event
	var CHANGE_ALSO = ['number', 'date', 'datetime-local', 'time', 'month', 'week', 'range'];

	// tFormer options
	var TF_OPTIONS = ['timeout', 'requestTimeout', 'errorClass', 'disabledClass', 'processingClass', 'validateEvent', 'submitButtonControl', 'submitButton', 'submit', 'before', 'onerror', 'onvalid', 'eventBefore', 'eventError', 'eventValid'];
	var FIELD_OPTIONS = ['timeout', 'requestTimeout', 'request', 'validClass', 'errorClass', 'disabledClass', 'processingClass', 'rules', 'validateEvent', 'before', 'onerror', 'onvalid', 'own', 'eventBefore', 'eventError', 'eventValid'];
	var BUTTON_OPTIONS = ['disabledClass', 'processingClass'];


	var EMPOWERED = 'empowered';

	var defaults = {
		errorClass     : 'error',
		processingClass: 'processing',
		disabledClass  : 'disabled',
		validClass     : 'valid',

		eventBefore: 'tFormer:before',
		eventError : 'tFormer:error',
		eventValid : 'tFormer:valid',

		timeout       : 0,
		requestTimeout: 2000,

		validateEvent: 'input keyup',

		fields : {},
		buttons: {},

		submitButtonControl: true,
		submitButton       : null
	};

	/**
	 * Main tFormer constructor
	 * @param form_el - our form that should be empowered
	 * @param options - tFormer options
	 * @returns {tFormer}
	 */
	var tFormer = function ( form_el, options ){
		if ( !(this instanceof tFormer) ) {
			return new tFormer( form_el, options );
		}

		var self = this;
		// our main form DOM element
		self.form = (function ( form_el ){
			form_el = typeof(form_el) === 'string' ? document.forms[form_el] : form_el;
			return __isForm( form_el ) ? form_el : null;
		})( form_el );

		var my_form = self.form;
		if ( self.form === null ) {
			return null;
		}

		if ( !__getAttr( my_form, EMPOWERED ) ) {
			__setAttr( my_form, EMPOWERED, 1 );
			__setAttr( my_form, 'novalidate', 'novalidate' );
		} else {
			var cached = (function (){
				for ( var i = 0, c_l = self.cache.length; i < c_l; i++ ) {
					if ( self.cache[i].form == my_form ) {
						return self.cache[i];
					}
				}
				return null;
			})();
			if ( cached ) {
				var initialized = cached.inited;
				cached.set( options );
				return cached;
			}
		}
		self.config = (self.config || __clone( defaults ));
		self.set( options );

		self.init();
		self.cache.push( self );
		return self;
	};
	var tf_proto = tFormer.prototype;
	tf_proto.cache = [];


	tf_proto.init = function (){
		var self = this;
		if ( self.inited ) {
			return self;
		}

		self.fields = {};
		self.buttons = {};

		self.inited = true;

		self.locked = 0;
		self.holded = 0;
		self.invalid = 0;
		self.valid = true;

		self.fields = {};
		self.buttons = {};

		// XHR stuff
		self.xhr = {};
		self.xhrTimeout = {};

		var sb = self.get( 'submitButton' );
		if ( sb ) {
			self.buttons['submit'] = new tButton( self, sb );
		}

		for ( var i = 0, f_l = self.form.length; i < f_l; i++ ) {
			var el = self.form[i],
				type = el.type,
				name = type !== 'button' ? __getAttr( el, 'name' ) : __data( el, 'check' );

			if ( __inArray( FIELD_TYPES, type ) !== -1 && name ) {
				self.fields[name] = new tField( self, el );
			}

			if ( __inArray( BUTTON_TYPES, type ) !== -1 ) {
				name = (type == 'submit') ? type : name;
				if ( name && !(name == 'submit' && self.button[name]) ) {
					self.buttons[name] = new tButton( self, el );
				}
			}
		}

		self.form.onsubmit = (function ( self ){
			return function ( event ){
				event = event || window.event;

				var sb = self.button( 'submit' ),
					sb_control = self.get( 'submitButtonControl' ),
					s_func = typeof self.get( 'submit' ) == 'function',
					processing = sb.get( 'processingClass' ),
					prevent = self.valid && s_func,
					e_prevent = function ( event ){
						if ( event.preventDefault ) {
							event.preventDefault();
						} else {
							event.returnValue = false;
						}
					};

				// disable double submit
				if ( (processing && sb.hasClass( processing )) || self.locked ) {
					e_prevent( event );
					return false;
				}

				if ( prevent ) {
					e_prevent( event );
				}
				if ( self.valid ) {
					if ( sb_control ) {
						sb.processing( true );
					}
					if ( s_func ) {
						self.execute( self.form, 'submit', [event, self] );
					}
				}
				if ( prevent ) {
					return false;
				}

				try {
					if ( !self.valid && !self.validate() ) {
						e_prevent( event );
						sb.processing( false );
						return false;
					}

					if ( s_func ) {
						e_prevent( event );
						self.execute( self.form, 'submit', [event, self] );
						return false;
					}
					self.form.submit();
					return true;

				} catch ( e ) {
				}
			};
		})( self );


		self.validate( {
			highlight : false,
			fire_event: false,

			silence: true
		} );
		return self.submitControl();
	};


	tf_proto.destroy = function (){
		var self = this;
		for ( var name in self.fields ) {
			self.fields[name].destroy();
		}
		for ( var name in this.buttons ) {
			self.buttons[name].destroy();
		}
		self.inited = false;
		return self;
	};

	//	function for dropping options
	tf_proto.drop = function (){
		var self = this,
			fields = self.fields,
			buttons = self.buttons;
		self.destroy();
		self.set( __clone( defaults ) );
		for ( var name in fields ) {
			fields[name].drop();
		}
		for ( var name in buttons ) {
			buttons[name].drop();
		}
		self.locked = 0;
		return self.init();
	};

	tf_proto.validate = function ( options ){
		var self = this,
			fields = self.fields,
			errors = 0;

		for ( var key in fields ) {
			errors += (fields[key].validate( options || {} )) ? 0 : 1;
		}
		self.invalid = errors;
		self.valid = errors === 0;
		return errors === 0;
	};


	tf_proto.toObject = function (){
		var self = this,
			fields = self.fields,
			obj = {};
		for ( var name in fields ) {
			var el = fields[name].el;
			if ( el.type == 'checkbox' ) {
				obj[name] = el.checked;
			} else if ( el.type == 'radio' ) {
				if ( !obj[name] ) {
					obj[name] = '';
				}
				if ( el.checked ) {
					obj[name] = el.value;
				}
			} else {
				obj[name] = el.value;
			}
		}
		return obj;
	};

	tf_proto.get = function ( option ){
		return this.config[option];
	};

	tf_proto.set = function ( options ){
		var self = this,
			is_inited = self.inited;
		if ( is_inited ) {
			self.destroy();
		}
		self.config = __extend( self.config, options );
		if ( is_inited ) {
			self.init();
		}
		return self;
	};

	/**
	 * Get field object to work with
	 * @param {string} name - field name
	 * @returns {*} - field Object
	 */
	tf_proto.field = function ( name ){
		return this.fields[name];
	};

	/**
	 * Get button object to work with
	 * @param {string} name - button name
	 * @returns {*} - button Object
	 */
	tf_proto.button = function ( name ){
		return this.buttons[name];
	};

	/**
	 * Rewrite default form submit function with current one
	 * (default HTML form submit function will be prevented)
	 * @param {function} func - function that should be executed on form submit
	 * @returns {*}
	 */
	tf_proto.submit = function ( func ){
		var self = this;
		if( !self.config) {
			return self;
		}
		if ( typeof func == 'function' ) {
			self.config.submit = func;
		}
		return self;
	};

	/**
	 * Form Submit button control function
	 * (enabling/disabling while validating)
	 * @param {!boolean} valid - is current form valid or not?
	 * @returns {*}
	 */
	tf_proto.submitControl = function ( valid ){
		var self = this,
			sb = self.button( 'submit' ),
			sb_control = self.get( 'submitButtonControl' );

		self.valid = (self.invalid === 0 && self.holded === 0 && self.locked === 0);
		valid = (valid === false || valid === true) ? valid : self.valid;

		if ( sb && sb_control ) {
			sb[(valid) ? 'enable' : 'disable']();
		}
		return self;
	};
	/**
	 * Submit button disable
	 * @returns {*}
	 */
	tf_proto.submitDisable = function (){
		return this.submitControl( false );
	};
	/**
	 * Submit button enable
	 * @returns {*}
	 */
	tf_proto.submitEnable = function (){
		return this.submitControl( true );
	};

	/**
	 * Submit button processing control
	 * @returns {*}
	 */
	tf_proto.processing = function ( action ){
		var self = this,
			sb = self.button( 'submit' );
		if ( sb ) {
			sb.processing( action );
		}
		return self;
	};

	/**
	 * Lock form
	 * @returns {*}
	 */
	tf_proto.lock = function ( num ){
		var self = this;
		self.locked += num || 1;
		return self.submitControl( false );
	};

	/**
	 * Unlock form
	 * @returns {*}
	 */
	tf_proto.unlock = function ( num ){
		var self = this;
		self.locked -= num || 1;
		return self.submitControl();
	};

	/**
	 * Execute function
	 * @param context
	 * @param func
	 * @param params
	 * @returns {*}
	 */
	tf_proto.execute = function ( context, func, params ){
		var self = this;
		if ( typeof func == 'string' ) {
			func = self.get( func );
		}
		if ( typeof func == 'function' ) {
			return func.apply( context, (params || []) );
		}
		return null;
	};

	window.tFormer = tFormer;


	/**
	 * Form element constructor
	 * @returns {*}
	 * @constructor
	 */
	var Element = function (){
	};
	var El_p = Element.prototype;
	El_p.destroy = function (){
		var self = this,
			el = this.el,
			events = self.events;

		for ( var i = 0, e_l = events.length; i < e_l; i++ ) {
			self.off( events[0][0], events[0][1] );
		}

		self.removeClass( self.get( 'errorClass' ) );
		self.removeClass( self.get( 'desabledClass' ) );
		self.removeClass( self.get( 'processignClass' ) );

		__data( el, 'holded', null );
		__data( el, 'error', null );
		// remove hold attributes

		if ( self.timer ) {
			clearTimeout( self.timer );
		}
		if ( self.xhr ) {
			self.xhr.abort();
		}
		if ( self.xhrTimeout ) {
			clearTimeout( self.xhrTimeout );
		}

		if ( !self.valid ) {
			self.parent.invalid = self.parent.invalid !== 0 ? self.parent.invalid - 1 : 0;
		}

		self.parent.submitControl();

		self.inited = false;
		return self;
	};

	El_p.drop = function (){
		return this.set( __clone( defaults ) );
	};

	El_p.set = function ( options ){
		var self = this,
			name = __getAttr( self.el, 'name' ),
			_set = function ( key, value ){
				self.config[key] = value;
				if ( !self.parent.config.fields[name] ) {
					self.parent.config.fields[name] = __clone( defaults );
				}
				self.parent.config.fields[name][key] = value;
			},
			is_inited = self.inited;

		if ( is_inited ) {
			self.destroy();
		}
		for ( var key in options ) {
			if ( ~__inArray( FIELD_OPTIONS, key ) ) {
				_set( key, options[key] );
			}
		}
		if ( is_inited ) {
			self.init();
		}
		return self;
	};

	El_p.get = function ( option ){
		return this.config[option];
	};

	/**
	 * subscribe this.el to some event
	 * @param {string} evnt - event name
	 * @param {function} func - function that should be executed on event
	 * @param {object} el - element to attach event
	 * @returns {*}
	 */
	El_p.on = function ( evnt, func, el ){
		var self = this,
			el = el || self.el,
			events = evnt.split( ' ' );

		for ( var i = 0, e_l = events.length; i < e_l; i++ ) {
			if ( el.addEventListener ) { // W3C DOM
				el.addEventListener( events[i], func, false );
			} else if ( element.attachEvent ) { // IE DOM
				el.attachEvent( "on" + events[i], func );
			} else { // No much to do
				el[events[i]] = func;
			}
			self.events.push( [events[i], func] );
		}
		return self;
	};

	/**
	 * unsubscribe this.el (Button || Field) from some event
	 * @param {string} evnt - event name
	 * @param {function} func - function that should be executed on event
	 * @returns {*}
	 */
	El_p.off = function ( evnt, func ){
		var self = this,
			el = self.el,
			events = self.events;

		evnt = evnt.split( ' ' );
		if ( !func ) {
			for ( var i = 0, e_l = events.length; i < e_l; i++ ) {
				if ( __inArray( evnt, events[i][0] ) !== -1 ) {
					events.splice( i, 1 );
				}
			}
			return self;
		}

		if ( el.removeEventListener ) { // W3C DOM
			el.removeEventListener( evnt, func, false );
		} else if ( el.detachEvent ) { // IE DOM
			el.detachEvent( "on" + evnt, func );
		} else { // No much to do
			el[evnt] = null;
		}

		for ( var i = 0, e_l = events.length; i < e_l; i++ ) {
			if ( __inArray( evnt, events[i][0] ) !== -1 && events[i][1] == func ) {
				events.splice( i, 1 );
				return self;
			}
		}
		return self;
	};

	/**
	 * fire some event for this.field
	 * @param {string} evnt - event name
	 * @returns {*}
	 */
	El_p.trigger = function ( evnt ){
		var el = this.el,
			evt;

		if ( this.silence ) {
			return;
		}

		if ( document.createEventObject ) { // dispatch for IE
			evt = document.createEventObject();
			return el.fireEvent( 'on' + evnt, evt );
		} else { // dispatch for firefox + others
			evt = document.createEvent( "HTMLEvents" );
			evt.initEvent( evnt, true, true ); // event type,bubbling,cancelable
			return !el.dispatchEvent( evt );
		}
	};


	El_p.addClass = function ( new_class ){
		var self = this,
			el = self.el,
			class_names = el.className.split( ' ' ) || [];

		if ( __inArray( class_names, new_class ) === -1 ) {
			class_names.push( new_class );
			class_names = __clear( class_names );
			el.className = (class_names.length > 0) ? class_names.join( ' ' ) : '';
		}
		return self;
	};

	El_p.removeClass = function ( old_class ){
		var self = this,
			el = self.el;

		if ( self.hasClass( old_class ) ) {
			var re = new RegExp( '(\\s|^)' + old_class + '(\\s|$)' );
			el.className = el.className.replace( re, ' ' );
		}
		return self;
	}

	El_p.hasClass = function ( name ){
		return !!((~(' ' + this.el.className + ' ').indexOf( ' ' + name + ' ' )));
	};

	El_p.data = function ( attr, value ){
		var self = this,
			el = self.el,
			result = __data( el, attr, value );

		if ( value === undefined ) {
			return result;
		}
		return self;
	};

	El_p.attr = function ( attr, value ){
		var self = this,
			el = self.el;
		switch ( value ) {
			case null:
				__delAttr( el, attr );
				break;
			case undefined:
				return __getAttr( el, attr );
				break;
			default:
				__setAttr( el, attr, value );
				break;
		}
	};

	El_p.processing = function ( action ){
		var self = this,
			processingClass = self.get( 'processingClass' ),
			is_processing = self.hasClass( processingClass );

		if ( action === false || (action === null && is_processing) ) {
			self.removeClass( processingClass );
		} else if ( action === true || (action === null && is_processing) ) {
			self.addClass( processingClass );
		}
		return this;
	};


	/** extent subclass with superclass prototype */
	var __extend_proto = function ( Child, Parent ){
		var F = function (){
		}
		F.prototype = Parent.prototype
		Child.prototype = new F()
		Child.prototype.constructor = Child
		Child.superclass = Parent.prototype
	};



	var tField = function ( parent, el ){
		var self = this,
			type = el.type,
			name, rules,
			attr_required, attr_min, attr_max,
			rules2add = [],
			config;

		self.parent = parent;
		self.el = el;
		self.config = {};

		self.events = [];
		name = self.attr( 'name' );
		attr_required = self.attr( 'required' ) !== null;
		attr_min = self.attr( 'min' );
		attr_max = self.attr( 'max' );

		config = parent.config.fields ? parent.config.fields[name] : {};
		if ( typeof config == 'string' ) {
			config = {
				rules: config
			};
		}
		self.set( __extend( __clone( parent.config ), __clone( config ) ) );
		self.config.rules = self.config.rules || self.data( 'rules' );

		if ( attr_required ) {
			rules2add.push( '*' );
		}

		if ( type == 'email' ) {
			rules2add.push( '@' );
		}

		if ( type == 'url' ) {
			rules2add.push( 'url' );
		}

		if ( type == 'number' ) {
			rules2add.push( 'num' )

			if ( attr_min !== null ) {
				rules2add.push( '>' + attr_min );
			}
			if ( attr_max !== null ) {
				rules2add.push( '<' + attr_max );
			}
		}


		if ( rules2add.length > 0 ) {
			self.config.rules = _v_( '' ).rules( self.config.rules || self.data( 'rules' ) ).addRule( rules2add.join( ' ' ) ).rule;
		}

		self.value = el.value;

		// validate after init
		self.validationStart = 'v_start';
		self.validationSuccess = 'v_success';
		self.validationError = 'v_error';

		self.highlight = true;
		self.fire_event = true;
		self.silence = false;

		return self.init();
	};
	__extend_proto( tField, Element );
	var tField_p = tField.prototype;

	tField_p.init = function (){
		var self = this,
			field = self.el,
			value = field.value,
			type = self.attr( 'type' ),
			is_checkbox = type == 'checkbox';

		if ( self.inited ) {
			return self;
		}

		self.events = [];

		self.valid = true;
		self.holded = false;

		self.value = value;

		// adding validate event to the field;
		var validate_event = self.get( 'validateEvent' );

		if ( ~__inArray( CHANGE_ALSO, type ) && validate_event.indexOf( 'change' ) === -1 ) {
			validate_event = validate_event.split( ' ' );
			validate_event.push( 'change' );
			validate_event = validate_event.join( ' ' );
		}
		if ( ~__inArray( HAS_CHANGE_EVENT, type ) ) {
			validate_event = 'change';
		}

		self.set( {
			validateEvent: validate_event
		} );

		self.on( validate_event, function (){
			if ( !self.get( 'rules' ) ) {
				return;
			}
			if ( self.value != self.el.value || is_checkbox ) {
				self.value = self.el.value;

				// clear field before validation
				self.removeClass( self.get( 'errorClass' ) );
				self.removeClass( self.get( 'processingClass' ) );

				// disable submit button before validation
				self.parent.invalid += (self.valid) ? 1 : 0;
				self.valid = false;
				self.removeClass( self.get( 'errorClass' ) );
				self.parent.submitControl();

				var timeout = self.get( 'timeout' );
				if ( self.get( 'timeout' ) > 0 ) {
					if ( self.timer ) {
						clearTimeout( self.timer );
					}
					self.timer = setTimeout( function (){
						self.validate();
					}, timeout );
				} else {
					self.validate();
				}
			}
		} );



		if ( self.hasRules( '=#' ) ) {
			var self_v_ = _v_().rules( self.config.rules ),
				depended_id = self_v_.parsedRules['=#'],
				el = document.getElementById( depended_id );

			if ( el ) {
				self.on( 'input keyup', function ( e ){
					self.validate( {
						highlight: !!self.value
					} );
				}, el )
			}
		}

		// blur validation without timeout
		if ( !~validate_event.indexOf( 'blur' ) && validate_event !== 'change' ) {
			self.on( 'blur', function (){
				if ( !self.get( 'rules' ) ) {
					return;
				}
				if ( self.timer ) {
					clearTimeout( self.timer );
				}
				self.validate( {
					no_timeout: true
				} );
			} );
		}

		self.validate( { silence: true } );

		self.inited = true;
		return self;
	};
	tField_p.setRules = function ( rules, options ){
		var self = this;
		self.set( {
			rules: rules
		}, options );
		self.validate( options );
		return self;
	};

	tField_p.hasRules = function ( rules ){
		return _v_().rules( this.get( 'rules' ) ).hasRule( rules );
	};

	tField_p.addRules = function ( rules, options ){
		var self = this;
		return self.setRules( _v_().rules( self.get( 'rules' ) ).addRule( rules ).rule, options );
	};

	tField_p.delRule = function ( rules, options ){
		var self = this;
		return self.setRules( _v_().rules( self.get( 'rules' ) ).delRule( rules ).rule, options );
	};

	/**
	 * Highlight field with errorClass
	 * @param valid
	 * @returns {*}
	 */
	tField_p.error = function ( valid ){
		var self = this;
		self.valid = (!valid) ? true : false;

		if ( !self.highlight && !self.valid ) {
			return this;
		}

		var field = self.el,
			errorClass = self.get( 'errorClass' );

		if ( self.valid ) {
			self.removeClass( errorClass );
			self.data( 'error', null );
		} else {
			self.addClass( errorClass );
			self.data( 'error', '1' );
		}
		return self;
	};

	/**
	 * Hold field for a while
	 * @param {!boolean} hold
	 * @returns {*}
	 */
	tField_p.hold = function ( hold ){
		var self = this,
			is_holded = self.data( 'holded' );

		if ( hold === undefined ) {
			self.holded = !self.holded;
		} else {
			self.holded = (hold === true) ? true : false
		}
		self.data( 'holded', (self.holded ? 1 : null) );
		if ( !is_holded && self.holded === true ) {
			self.parent.holded++;
		} else if ( is_holded && self.holded === false ) {
			self.parent.holded--;
		}
		self.parent.submitControl();
		return self;
	};

	/**
	 * Here is the main field validation process
	 * @param {object} options
	 * @returns {boolean}
	 */
	tField_p.validate = function ( options ){
		var self = this,
			field = self.el,
			type = self.attr( 'type' ),
			result = true,
			own = self.get( 'own' ),
			request = self.get( 'request' ),
			rules = self.get( 'rules' ),
			_v_check = _v_( self.el.value || '' ).rules( rules ),
			is_checkbox = type == 'checkbox',
			is_required = _v_check.hasRule( '*' );

		if ( !rules ) {
			return result;
		}

		options = options || {};
		self.silence = (options.silence === true) ? true : false;

		self.highlight = (options.highlight === false || options.silence === true) ? false : true;
		self.fire_event = (options.fire_event === false || options.silence === true) ? false : true;

		if ( !self.silence ) {
			self.execute( 'before' );
			self.trigger( self.get( 'eventBefore' ) );
			self.trigger( self.validationStart );
		}

		if ( typeof own == 'function' ) {
			result = own.call( self.el );
		} else {
			if ( is_checkbox ) {
				var is_checked = field.checked;
				if ( !is_checked && is_required ) {
					result = false;
				}
			} else {
				// check request validation
				if ( is_required || self.el.value.length > 0 ) {
					result = _v_check.validate();
				}

				if ( request && result ) {
					self.requestValidate( options );
					self.highlight = true;
					return null;
				}
			}
		}

		if ( result ) {
			self.__validationSuccess();
		} else {
			self.__validationError();
		}

		self.highlight = true;
		self.fire_event = true;
		self.silence = false;
		return result;
	};

	tField_p.__validationStart = function (){

	};

	tField_p.__validationError = function (){
		var self = this;
		self.trigger( self.get( 'eventError' ) );
		self.parent.invalid += (self.valid) ? 1 : 0;
		self.parent.submitControl();
		self.error( true );
		self.execute( 'onerror' );
	};
	tField_p.__validationSuccess = function (){
		var self = this;
		self.trigger( self.get( 'eventValid' ) );
		self.parent.invalid -= (!self.valid) ? 1 : 0;
		self.parent.submitControl();
		self.error( false );
		self.execute( 'onvalid' );
	};



	tField_p.requestValidate = function ( options ){

		var self = this,
			name = self.attr( 'name' ),
			value = self.value,
			request = self.get( 'request' );

		var method = request.method.toLowerCase() == 'post' ? 'POST' : 'GET';
		var data = request.data || {};

		var success = request.success;

		var url = (function (){
			var url = request.url || window.location.href;
			if ( method == 'GET' ) {
				url += (~url.indexOf( '?' )) ? '&' : '?';
				url += name + '=' + value;
			} else {
				data[name] = value;
			}
			return url;
		})();

		var timeout = options.no_timeout ? 0 : (request.timeout || 0);

		var readyStateChange = function (){
			var xhr = self.xhr;
			if ( xhr.readyState == 1 ) {
				self.execute( request.start, [xhr] );
			}

			if ( xhr.readyState == 4 ) {
				// TODO: handle other errors (maybe with switch);
				if ( xhr.status == 200 ) {
					var result = (self.execute( request.end, [xhr.response] ) === true) ? true : false;
					self.processing( false ).hold( false );
					self['__validation' + (result ? 'Success' : 'Error')]();
				}
			}
		};

		var makeRequest = function (){
			var xhr = HTTP.newRequest();
			self.xhr = xhr;
			xhr.onreadystatechange = readyStateChange;
			self.processing( true ).hold( true );
			xhr.open( method, url, true );
			xhr.setRequestHeader( "Accept-Language", "en" );
			if ( method == 'POST' ) {
				xhr.setRequestHeader( "Content-type", "application/x-www-form-urlencoded; charset=UTF-8" );
				xhr.send( __serialize( data ) );
			} else {
				xhr.send( null );
			}
		};

		if ( self.xhr ) {
			self.xhr.abort();
		}

		if ( self.xhrTimeout ) {
			clearTimeout( self.xhrTimeout );
		}
		self.hold( false );

		if ( timeout > 0 && options.no_timeout !== true ) {
			self.xhrTimeout = setTimeout( function (){
				makeRequest();
			}, timeout );
		} else {
			makeRequest();
		}
	};

	tField_p.execute = function ( func, params ){
		var self = this;
		if ( self.silence ) {
			return;
		}

		if ( typeof func == 'string' ) {
			func = self.get( func );
		}
		return self.parent.execute( self.el, func, params );
	};


	/*
	 * Test tButton created by Element constructor
	 */
	var tButton = function ( parent, el ){
		var self = this,
			type = self.attr( 'type' ),
			name;

		self.parent = parent;
		self.el = el;
		self.config = {};

		self.events = [];

		name = type === 'submit' ? type : self.data( 'check' );
		self.name = name;
		self.set( __extend( __clone( parent.config ), __clone( (parent.config.buttons ? parent.config.buttons[name] : {}) ) ) );

		return self.init();
	};
	__extend_proto( tButton, Element );
	var tButton_p = tButton.prototype;

	tButton_p.init = function (){
		var self = this,
			el = self.el,
			parent = self.parent;

		if ( self.inited ) {
			self.destroy();
		}
		if ( el.type == 'submit' || el == parent.get( 'submitButton' ) ) {
			self.on( 'click', function ( e ){
				e.preventDefault();
				parent.form.onsubmit( e );
				return false;
			} );
		} else {
			self.on( 'click', function (){
				var field = parent.field( self.data( 'check' ) );
				if ( field ) {
					field.validate({no_timeout: true});
				}
			} );
		}
		this.inited = true;
		return this;
	};

	tButton_p.disable = function (){
		var self = this;
		self.addClass( self.get( 'disabledClass' ) );
		return self;
	};

	tButton_p.enable = function (){
		var self = this;
		self.removeClass( self.get( 'disabledClass' ) );
		return self;
	};



	/*
	 * Helpers
	 * ----- ----- ----- ----- ----- ----- ----- ----- ----- -----
	 */
	/**
	 * Object extend
	 * @param object
	 * @param new_obj
	 * @returns {object}
	 */
	var __extend = function ( object, new_obj ){
		for ( var key in new_obj ) {
			if ( new_obj.hasOwnProperty( key ) ) {
				object[key] = new_obj[key];
			}
		}
		return object;
	};

	/**
	 * Object clone
	 * @returns {*|array|string}
	 */
	var __clone = function ( obj ){
		return __isArray( obj ) ? obj.slice() : __extend( {}, obj );
	};


	/**
	 * is array function
	 * @returns {boolean}
	 */
	var __isObject = function ( obj ){
		return toString.call( obj ) == '[object Object]';
	};


	var __isForm = function ( obj ){
		return toString.call( obj ) == '[object HTMLFormElement]';
	};

	/**
	 * is array function
	 * @returns {boolean}
	 */
	var __isArray = function ( obj ){
		return Object.prototype.toString.call( obj ) == '[object Array]';
	};


	/**
	 * detects is defined array has some value
	 * @param array
	 * @param value
	 * @returns {number}
	 * @private
	 */
	var __inArray = function ( array, value ){
		var index = -1,
			length = array ? array.length : 0;
		while ( ++index < length ) {
			if ( array[index] === value ) {
				return index;
			}
		}
		return -1;
	};

	var __clear = function ( arr ){
		if ( __isArray( arr ) ) {
			var new_arr = [];
			for ( var i = 0, a_l = arr.length; i < a_l; i++ ) {
				if ( arr[i] !== '' ) {
					new_arr.push( arr[i] );
				}
			}
			return new_arr;
		}
	};


	/**
	 * Work with data-attributes
	 *
	 * @param {object} element - element
	 * @param {string} attr - data-attribute
	 * @param {!string|number} value - new attribute value. [null - delete attr, undefined - return attr value, defined - set new value]
	 * @returns {*}
	 */
	var __data = function ( element, attr, value ){
		switch ( value ) {
			case null:
				__delAttr( element, 'data-' + attr );
				break;
			case undefined:
				return __getAttr( element, 'data-' + attr );
				break;
			default:
				__setAttr( element, 'data-' + attr, value );
				break;
		}
	};

	var __getAttr = function ( el, attr ){
		if ( !el ) {
			return null;
		}
		return el.getAttribute( attr );
	};
	var __setAttr = function ( el, attr, value ){
		if ( !el ) {
			return null;
		}
		el.setAttribute( attr, value );
	};
	var __delAttr = function ( el, attr ){
		if ( !el ) {
			return null;
		}
		el.removeAttribute( attr );
	};



	// AJAX Request functionality
	var HTTP = {};
	HTTP._factories = [
		function (){
			return new XMLHttpRequest();
		},
		function (){
			return new ActiveXObject( "Msxml2.XMLHTTP" );
		},
		function (){
			return new ActiveXObject( "Microsoft.XMLHTTP" );
		}
	];
	HTTP._factory = null;
	HTTP.newRequest = function (){
		if ( HTTP._factory !== null ) {
			return HTTP._factory();
		}
		for ( var i = 0; i < HTTP._factories.length; i++ ) {
			try {
				var factory = HTTP._factories[i];
				var request = factory();
				if ( request !== null ) {
					HTTP._factory = factory;
					return request;
				}
			} catch ( e ) {
				continue;
			}
		}
		HTTP._factory = function (){
			throw new Error( 'Object XMLHttpRequest not supported' );
		};
		HTTP._factory();
	};


	/**
	 * Serrialize data for request
	 * @param {object} data - object to serialize
	 * @returns {string}
	 */
	var __serialize = function ( data ){
		var pairs = [];
		var regexp = /%20/g;
		for ( var name in data ) {
			var pair = encodeURIComponent( name ).replace( regexp, '+' ) + '=';
			pair += encodeURIComponent( data[name].toString() ).replace( regexp, '+' );
			pairs.push( pair );
		}
		return pairs.join( '&' );
	};

})( window, document );