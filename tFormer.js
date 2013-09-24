/**
 * tFormer.js - empower your forms
 * http://tjrus.com/tFormer
 * (c) 2013 Vasiliy Zubach (aka TjRus) - http://tjrus.com/
 * tFormer may be freely distributed under the MIT license.
 */

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
					prevent = self.valid && s_func;

				// disable double submit
				if ( (processing && sb.hasClass( processing )) || self.locked ) {
					__prevent( event );
					return false;
				}

				if ( prevent ) {
					__prevent( event );
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
					if ( !self.valid && !self.validate( { no_timeout: true } ) ) {
						__prevent( event );
						sb.processing( false );
						return false;
					}

					if ( s_func ) {
						__prevent( event );
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
			fields = self.form,
			obj = {};

		for ( var i = 0, f_l = fields.length; i < f_l; i++ ) {
			var el = fields[i],
				name = __getAttr( el, 'name' );
			if ( el.type == 'checkbox' ) {
				obj[name] = el.checked;
			} else if ( el.type == 'radio' ) {
				if ( !obj[name] ) {
					obj[name] = '';
				}
				if ( el.checked ) {
					obj[name] = el.value;
				}
			} else if (el.type !== 'submit' && el.type !== 'button'){
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
		if ( !self.config ) {
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
			} else if ( el.attachEvent ) { // IE DOM
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
		var self = this,
			el = self.el,
			evt;

		if ( self.silence ) {
			return;
		}

		try {// every browser except IE8 and below works here
			evt = document.createEvent( "HTMLEvents" );
			evt.initEvent( evnt, true, true );
			return !el.dispatchEvent( evt );
		} catch ( err ) {
			try {
				return el.fireEvent( 'on' + evnt );
			} catch ( error ) {
			}
		}
		return self;
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
				if ( !(self.valid && self.hasRules( 'request' ) ) ) {
					self.validate( {
						no_timeout: true
					} );
				}
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
			value = self.el.value,
			request = self.get( 'request' ),
			check_btn = self.parent.button( __getAttr( self.el, 'name' ) ),
			method = request.method.toLowerCase() == 'post' ? 'POST' : 'GET',
			data = request.data || {},
			success = request.success,
			url = (function (){
				var url = request.url || window.location.href;
				if ( method == 'GET' ) {
					url += (~url.indexOf( '?' )) ? '&' : '?';
					url += name + '=' + value;
				} else {
					data[name] = value;
				}
				return url;
			})(),

			timeout = options.no_timeout ? 0 : (request.timeout || 0),

			readyStateChange = function (){
				var xhr = self.xhr;

				if ( xhr.readyState == 1 ) {
					self.execute( request.start, [xhr] );
				}

				if ( xhr.readyState == 4 ) {
					// TODO: handle other errors (maybe with switch);
					if ( xhr.status == 200 ) {
						var result = (self.execute( request.end, [xhr.response] ) === true) ? true : false;
						self['__validation' + (result ? 'Success' : 'Error')]();
					}
				}
				if ( xhr.readyState == 4 || xhr.readystate == 0 ) {
					self.processing( false ).hold( false );
					if ( check_btn ) {
						check_btn.processing( false );
					}
				}
			},

			makeRequest = function (){
				self.processing( true ).hold( true );
				if ( check_btn ) {
					check_btn.processing( true );
				}
				var xhr = HTTP.newRequest();
				self.xhr = xhr;
				xhr.onreadystatechange = readyStateChange;
				xhr.open( method, url, true );
				xhr.setRequestHeader( "Accept-Language", "en" );
				if ( method == 'POST' ) {
					xhr.setRequestHeader( "Content-type", "application/x-www-form-urlencoded; charset=UTF-8" );
					xhr.send( __serialize( data ) );
				} else {
					xhr.send( null );
				}
			};

		if ( self.xhr && (self.xhr.readyState !== 0 || self.xhr.readyState !== 4) ) {
			self.xhr.abort();
			self.processing( false ).hold( false );
			if ( check_btn ) {
				check_btn.processing( false );
			}
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
				__prevent( e );
				parent.form.onsubmit( e );
				return false;
			} );
		} else {
			self.on( 'click', function (){
				var field = parent.field( self.data( 'check' ) );
				if ( field ) {
					field.validate( {no_timeout: true} );
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
	 * Method for preventing default events
	 * @param e
	 * @private
	 */
	var __prevent = function ( e ){
		if ( e.preventDefault ) {
			e.preventDefault();
		} else {
			event.returnValue = false;
		}
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
		return obj && obj.nodeName === 'FORM';
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
/**
 * _v_.js - validator
 * http://github.com/TjRus/_v_.js
 * (c) 2013 Vasiliy Zubach (aka TjRus) - http://tjrus.com/
 * _v_ may be freely distributed under the MIT license.
 */
"use strict";

(function ( window, document, undefined ){

	/**
	 * Validator constructor
	 *
	 * @constructor
	 * @param {!string} value
	 * @returns {*}
	 * @private
	 */
	var _v_ = function ( value ){
		if ( !(this instanceof _v_) ) {
			return new _v_( value );
		}
		this.value = value || '';
		this.separator = ' ';
		this.rule = '';

		this.parsedRules = [];

		return this;
	};
	var _v_proto = _v_.prototype;

	/**
	 * sets rules separator
	 * @param separator
	 * @returns {*}
	 */
	_v_proto.separate = function ( separator ){
		this.separator = separator;
		this.rules( this.rule ); // pars rules again
		return this;
	};

	/**
	 * set rules to validator
	 * @param rules
	 * @returns {*}
	 */
	_v_proto.rules = function ( rules ){
		this.rule = rules || '';
		this.parseRules();
		return this;
	};

	/**
	 * add rules to existed rules str
	 * @param rule
	 * @returns {*}
	 */
	_v_proto.addRule = function ( rule ){
		var parsed = this.parsedRules;
		var rule_v_ = _v_().rules( rule ).parsedRules;

		for ( var key in rule_v_ ) {
			var rule = rule_v_[key];
			if ( !rule ) {
				parsed[key] = rule;
				continue;
			}
			// has params and is in defined rules
			if ( rule && parsed.hasOwnProperty( key ) ) {
				// params is array
				parsed[key] = __toArray( parsed[key] );
				rule = __toArray( rule );
				for ( var i = 0, r_v_l = rule.length; i < r_v_l; i++ ) {
					if ( __inArray( parsed[key], rule[i] ) !== -1 ) {
						continue;
					}
					parsed[key].push( rule[i] );
				}
			} else {
				parsed[key] = rule;
			}
		}

		this.rule = __rulesStr( this.parsedRules, this.separator );
		return this;
	};

	/**
	 * Delete rule from validator rules
	 * @param rule
	 * @returns {*}
	 */
	_v_proto.delRule = function ( rule ){
		var parsed = this.parsedRules;
		var rule_v_ = _v_().rules( rule ).parsedRules;
		for ( var key in rule_v_ ) {
			var rules = rule_v_[key];
			if (!parsed.hasOwnProperty(key)) {
				continue;
			}
			if ( rules === undefined) {
				delete parsed[key];
				continue;
			}

			parsed[key] = __toArray( parsed[key] );
			rules = __toArray( rules );
			for ( var i = 0, r_l = rules.length; i < r_l; i++ ) {
				var index = __inArray( parsed[key], rules[i] );
				if ( ~index ) {
					parsed[key].splice( index, 1 );
				}
			}
			if ( parsed[key].length === 0 ) {
				delete parsed[key];
			} else if ( parsed[key].length === 1 ) {
				parsed[key] = parsed[key][0];
			}
		}
		this.rule = __rulesStr( this.parsedRules, this.separator );
		return this;
	};

	/**
	 * check has validator such rule or not
	 * @param rules
	 * @returns {boolean}
	 */
	_v_proto.hasRule = function ( rules ){
		var rule_v_ = _v_().rules( rules ).parsedRules;
		var parsed = this.parsedRules;
		for ( var key in rule_v_ ) {
			var rule = rule_v_[key];
			if ( !rule ) {
				if ( !parsed.hasOwnProperty( key ) ) {
					return false;
				} else {
					continue;
				}
			}
			parsed[key] = __toArray( parsed[key] );
			rule = __toArray( rule );
			for ( var i = 0, r_l = rule.length; i < r_l; i++ ) {
				if ( __inArray( parsed[key], rule[i] ) === -1 ) {
					return false;
				}
			}
		}
		return true;
	};


	/**
	 * parse validator rules and return object with rule keys and their values
	 * @returns {{}}
	 */
	_v_proto.parseRules = function (){
		var rules = this.rule.split( this.separator );
		var parsed = {};
		var keys = this.keys;

		for ( var i = 0, rules_length = rules.length; i < rules_length; i++ ) {
			var option = rules[i], func, rule, params = undefined;
			if ( keys[ option ] ) {
				func = keys[ option ];
				rule = option;
			} else {
				var keys_order = this.keys_order;
				for ( var j = 0, koLength = keys_order.length; j < koLength; j++ ) {
					var key = keys_order[j];
					if ( option.indexOf( key ) === 0 ) {
						rule = key;
						params = option.replace( key, '' );
						var paramArray = (/^\[(.+)\]$/).exec( params );
						if ( paramArray ) params = paramArray[1].split( ',' ); // TODO: params separator
						func = this.keys[rule];
						break;
					}
				}
			}
			if ( func ) {
				parsed[rule] = params;
			}
		}
		this.parsedRules = parsed;
		this.rule = __rulesStr( parsed, this.separator );
		return parsed;
	};

	/**
	 * main validate function.
	 * @param rules
	 * @returns {boolean}
	 */
	_v_proto.validate = function ( rules ){
		if ( rules ) {
			this.rules( rules );
		}
		var parsed = this.parsedRules;
		for ( var rule in parsed ) {
			try {
			if ( !this.keys[rule].call( this, parsed[rule] ) ) {
				return false;
			}
		} catch (e) {
			return false;
		}
		}
		return true;
	};


	/**
	 * method for extending _v_ with new rules and validate functions
	 * @param rule
	 * @param func
	 */
	_v_proto.extend = function ( rule, func ){
		_v_proto.keys[rule] = func
		_v_proto.keys_order.push( rule );

		_v_proto.keys_order = this.keys_order.sort( function ( a, b ){
			return b.length - a.length;
		} );
		return this;
	};

	_v_proto.keys = {}; // object with rules
	_v_proto.keys_order = []; // array with ordered rules

	window._v_ = _v_;


	/**
	 * Rules extends
	 * ---------- ---------- ---------- ---------- ----------
	 */
	var rules = {

		// required
		'*'   : function (){
			return this.value.length !== 0;
		},

		// alpha
		'a'   : function (){
			return (/^[a-z]+$/i).test( this.value );
		},

		// alpha numeric
		'a1'  : function (){
			return (/^[a-z0-9]+$/i).test( this.value );
		},

		// alpha dash
		'a_'  : function (){
			return (/^[a-z_-]+$/i).test( this.value );
		},

		// alpha numeric dash
		'a1_' : function (){
			return (/^[a-z0-9_-]+$/i).test( this.value );
		},

		// email
		'@'   : function (){
			var mail_regexp = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
			return mail_regexp.test( this.value );
		},

		// emails
		'@s'  : function (){
			var emails = this.value.split( ',' );
			for ( var i = 0; i < emails.length; i++ ) {
				if ( !_v_( emails[i] ).validate( '@' ) ) {
					return false;
				}
			}
			return true;
		},

		// ip address
		'ip'  : function (){
			return (/^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/i).test( this.value );
		},

		// base65 string
		'b64' : function (){
			return (/^(?:[A-Za-z0-9+\/]{4})*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=|[A-Za-z0-9+\/]{4})$/).test( this.value );
		},

		// URL
		'url' : function (){
			return (/^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i).test( this.value );
		},

		// integer
		'int' : function (){
			return (/^\-?[0-9]+$/).test( this.value );
		},

		// Numeric
		'num' : function (){
			return (/^[0-9]+$/).test( this.value );
		},

		// Decimal
		'dec' : function (){
			return (/^\-?[0-9]*\.?[0-9]+$/).test( this.value );
		},

		// Natural
		'nat' : function (){
			return (/^[0-9]+$/i).test( this.value );
		},

		// length equals to
		'l='  : function ( length ){
			if ( typeof(length) == 'number' || typeof(length) == 'string' ) {
				return this.value.length == length;
			} else {
				for ( var key in length ) {
					if ( this.value.length == length[key] ) return true;
				}
			}
			return false;
		},

		// length more than
		'l>'  : function ( length ){
			return this.value.length > length;
		},

		// length more or equals to
		'l>=' : function ( length ){
			return this.value.length >= length;
		},

		// length less than
		'l<'  : function ( length ){
			return this.value.length < length;
		},

		// length less or equals to
		'l<=' : function ( length ){
			return this.value.length <= length;
		},

		// length is in range
		'lr=' : function ( range ){
			return (this.value.length >= range[0] && this.value.length <= range[1]);
		},

		// is greater than
		'>'   : function ( value ){
			var test = this.value;
			return (_v_( test ).validate( 'dec' ) && parseFloat( test ) > parseFloat( value ));
		},

		// is greater or equals to
		'>='  : function ( value ){
			var test = this.value;
			return (_v_( test ).validate( 'dec' ) && parseFloat( test ) >= parseFloat( value ));
		},

		// is less than
		'<'   : function ( value ){
			var test = this.value;
			return (_v_( test ).validate( 'dec' ) && parseFloat( test ) < parseFloat( value ));
		},

		// is less or equals to
		'<='  : function ( value ){
			var test = this.value;
			return (_v_( test ).validate( 'dec' ) && parseFloat( test ) <= parseFloat( value ));
		},

		// is in range
		'r='  : function ( value ){
			var test = this.value;
			return (_v_( test ).validate( 'dec' ) && parseFloat( test ) >= parseFloat( value[0] ) && parseFloat( test ) <= parseFloat( value[1] ));
		},

		// regular expression validation
		'reg=': function ( regExpression ){
			var reg = new RegExp( regExpression, 'i' );
			return reg.test( this.value );
		},

		// matches to
		'='   : function ( value ){
			var test = this.value;
			if ( typeof value == 'string' || typeof value == 'number' ) {
				return test == value;
			} else {
				for ( var i = 0, valueLength = value.length; i < valueLength; i++ ) {
					if ( value[i].indexOf( '#' ) === 0 ) {
						var el = __getElById( value[i].replace( '#', '' ) );
						if ( !el ) {
							return false;
						}
						if ( test == el.value ) return true;
					} else {
						if ( test == value[i] ) return true;
					}
				}
			}
			return false;
		},

		// matches to id
		'=#'  : function ( value ){
			var test = this.value;
			if ( typeof value == 'string' || typeof value == 'number' ) {
				value = value.split( ' ' );
				var el = __getElById( value );
				if ( !el ) {
					return false;
				}
				return test == el.value;
			} else {
				for ( var i = 0; i < value.length; i++ ) {
					var el = __getElById( value[i] );
					if ( el && test == el.value ) {
						return true;
					}
				}
			}
			return false;
		},

		// not matches to
		'!='  : function ( value ){
			value = (__isArray( value )) ? '[' + value.join( ',' ) + ']' : value; // TODO: value separator
			return !(_v_( this.value ).validate( '=' + value ));
		},

		// not contain
		'!'   : function ( value ){
			if ( typeof value == 'string' || typeof value == 'number' ) {
				return (this.value).toString().indexOf( value.toString() ) === -1;
			} else {
				for ( var key in value ) {
					if ( ~(this.value).toString().indexOf( value[key].toString() ) ) {
						return false;
					}
				}
			}
			return true;
		},

		// credit card (all cards type)
		'c'   : function ( value ){
			return (/^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/).test( this.value );
		},

		// visa card
		'cv'  : function ( value ){
			return (/^4[0-9]{12}(?:[0-9]{3})?$/).test( this.value );
		},

		// master card
		'cm'  : function ( value ){
			return (/^5[1-5][0-9]{14}$/).test( this.value );
		},

		// american express card
		'ca'  : function ( value ){
			return (/^3[47][0-9]{13}$/).test( this.value );
		},

		// discover card
		'cd'  : function ( value ){
			return (/^6(?:011|5[0-9]{2})[0-9]{12}$/).test( this.value );
		},

		// date format validation
		'D='  : function ( format ){
			return !!(__toDate( this.value, format ));
		}
	};

	// add extends
	for ( var key in rules ) {
		_v_().extend( key, rules[key] );
	}


	/**
	 * Helpers
	 * ---------- ---------- ---------- ---------- ----------
	 */

	// Date functions
	var __dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	var __shortDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	var __dayChars = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

	// Full, short and single character names for the months.  Override these to provide multi-language support.
	var __monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	var __shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	var __monthChars = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

	var __daysInMonth = function ( month, year ){
		// If February, check for leap year
		if ( (month == 1) && (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0)) ) {
			return 29;
		}
		else {
			var days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
			return days[month];
		}
	};

	/**
	 * Attempts to convert a string into a date based on a given format.  Fields will
	 * match either the long or short form, except in the case of the year, where the
	 * string must match either a 2-digit or 4-digit format.  Ranges are checked.  Day
	 * names are expected if they are included in the format string, but are otherwise
	 * ignored.  Use ^ to force the use of a literal character. In other words, to
	 * have the character Y appear instead of the actual year, use ^Y.
	 *
	 * Field        | Full Form           | Short Form
	 * -------------+---------------------+-------------------
	 * Year         | Y (4 digits)        | y (2 digits)
	 * Month        | M (1 or 2 digits)   | m (1 or 2 digits)
	 * Month Name   | N (full name)       | n (abbr)
	 * Day of Month | D (1 or 2 digits)   | d (1 or 2 digits)
	 * Day Name     | W (full name)       | w (abbr)
	 * Hour (1-12)  | H (1 or 2 digits)   | h (1 or 2 digits)
	 * Hour (0-23)  | R (1 or 2 digits)   | r (1 or 2 digits)
	 * Minute       | I (1 or 2 digits)   | i (1 or 2 digits)
	 * Second       | S (1 or 2 digits)   | s (1 or 2 digits)
	 * AM/PM        | A (upper case)      | a (lower case)
	 *
	 * @param {Date} date Date that we should transform.
	 * @param {string} format The basic format of the string.
	 * @return {Date} The string as a date object.
	 */
	var __toDate = function ( date, format ){
		// Default values set to midnight Jan 1 of the current year.
		var year = new Date().getFullYear(),
			month = 0,
			day = 1,
			hours = 0,
			minutes = 0,
			seconds = 0;

		// Positions of each date element within the source string.  Use to know
		// which backreference to check after a successful match.
		var yearPos = -1,
			monthPos = -1,
			dayPos = -1,
			hoursPos = -1,
			minutesPos = -1,
			secondsPos = -1,
			amPmPos = -1;

		var monthStyle = 'm',       // How we interpret the month, digits (M/m) or names (N/n)
			hoursStyle = 'h';       // How we interpret the hours, 12-hour (h) or 24-hour (r)

		var position = 1,           // Position of the current date element (year, month, day, etc.) in the source string
			pattern = '';           // Date pattern to be matched.

		// Remove extraneous whitespace from source string and format string.
		var str = date.replace( /\s+/g, ' ' );
		format = format.replace( /\s+/g, ' ' );

		// Loop throught the format string, and build the regex pattern
		// for extracting the date elements.
		for ( var i = 0, len = format.length; i < len; i++ ) {
			var c = format.charAt( i );
			switch ( c ) {
				case 'Y' :
					pattern += '(\\d{4})';
					yearPos = position++;
					break;
				case 'y' :
					pattern += '(\\d{2})';
					yearPos = position++;
					break;
				case 'M' :
				case 'm' :
					pattern += '(\\d{1,2})';
					monthPos = position++;
					monthStyle = 'm';
					break;
				case 'N' :
					pattern += '(' + __monthNames.join( '|' ) + ')';
					monthPos = position++;
					monthStyle = 'N';
					break;
				case 'n' :
					pattern += '(' + __shortMonthNames.join( '|' ) + ')';
					monthPos = position++;
					monthStyle = 'n';
					break;
				case 'D' :
				case 'd' :
					pattern += '(\\d{1,2})';
					dayPos = position++;
					break;
				case 'W' : // We'll match W, but won't do anything with it.
					pattern += '(' + __dayNames.join( '|' ) + ')';
					position++;
					break;
				case 'w' : // We'll match w, but won't do anything with it.
					pattern += '(' + __shortDayNames.join( '|' ) + ')';
					position++;
					break;
				case 'H' :
				case 'h' :
					pattern += '(\\d{1,2})';
					hoursPos = position++;
					hoursStyle = 'h';
					break;
				case 'R' :
				case 'r' :
					pattern += '(\\d{1,2})';
					hoursPos = position++;
					hoursStyle = 'r';
					break;
				case 'I' :
				case 'i' :
					pattern += '(\\d{1,2})';
					minutesPos = position++;
					break;
				case 'S' :
				case 's' :
					pattern += '(\\d{1,2})';
					secondsPos = position++;
					break;
				case 'A' :
				case 'a' :
					pattern += '(AM|am|PM|pm)';
					amPmPos = position++;
					break;
				default :
					pattern += (c == '^' ? format.charAt( ++i ) : c);
			}
		}

		// Pull out the date elements from the input string
		var matches = str.match( new RegExp( pattern ) );
		if ( !matches ) {
			return null;
		}

		// Now we have to interpret each of those parts...

		if ( yearPos > -1 ) {
			year = parseInt( matches[yearPos], 10 );
			year = (year < 50 ? year + 2000 : (year < 100 ? year + 1900 : year));
		}

		if ( monthPos > -1 ) {
			switch ( monthStyle ) {
				case 'm':
					month = parseInt( matches[monthPos], 10 ) - 1;    // JavaScript months are zero based, user input generally is not.
					if ( month > 11 )
						return null;
					break;
				case 'N':
					month = parseInt( __monthNumbers[matches[monthPos]], 10 );
					if ( isNaN( month ) )
						return null;
					break;
				case 'n':
					month = parseInt( __shortMonthNumbers[matches[monthPos]], 10 );
					if ( isNaN( month ) )
						return null;
					break;
			}
		}

		if ( dayPos > -1 ) {
			day = parseInt( matches[dayPos], 10 );
			if ( (day < 1) || (day > __daysInMonth( month, year )) )
				return null;
		}

		if ( hoursPos > -1 ) {
			hours = parseInt( matches[hoursPos], 10 );
			if ( hoursStyle == 'h' && (hours === 0 || hours > 12) )
				return null;
			else if ( hours > 23 )
				return null;
		}

		if ( minutesPos > -1 ) {
			minutes = parseInt( matches[minutesPos], 10 );
			if ( minutes > 59 )
				return null;
		}

		if ( secondsPos > -1 ) {
			seconds = parseInt( matches[secondsPos], 10 );
			if ( seconds > 59 )
				return null;
		}

		// Convert 12-hour time, if used, to 24-hour time.
		if ( amPmPos > -1 ) {
			var amPm = matches[amPmPos];
			if ( (amPm == 'pm' || amPm == 'PM') && (hours < 12) )
				hours += 12;
		}

		return new Date( year, month, day, hours, minutes, seconds );
	};


	/**
	 * Simple getElementByID function
	 * @param {string} id - id of HTML element
	 * @returns {HTMLElement}
	 * @private
	 */
	var __getElById = function ( id ){
		return document.getElementById( id );
	}

	/**
	 * Check is obj is array or not
	 * @param obj - element we should check
	 * @returns {boolean}
	 * @private
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
	window.__inArray = __inArray;


	/**
	 * convert item to Array.
	 * @param el
	 * @returns {Array}
	 * @private
	 */
	var __toArray = function ( el ){
		return (!__isArray( el )) ? [el] : el;
	}

	/**
	 * convert rules object to string
	 * @param obj
	 * @param separator
	 * @returns {string}
	 * @private
	 */
	var __rulesStr = function ( obj, separator ){
		separator = separator || ' ';
		var str = separator;
		for ( var key in obj ) {
			var rules = obj[key];
			if ( __isArray( rules )){
				rules = __clearArray(rules);
			}
			if ( !rules ) {
				str += key + separator;
			} else if ( __isArray( rules ) ) {
				str += key + '[' + rules.join( ',' ) + ']' + separator; // TODO: rule values separator
			} else {
				str += key + rules + separator;
			}
		}
		str = str.substr( separator.length, str.length - separator.length * 2 );
		return str;
	};

	var __clearArray = function(arr){
		var new_arr = [];
		for (var i = 0, a_l = arr.length; i < a_l; i++) {
			if (arr[i]) {
				new_arr.push(arr[i]);
			}
		}
		return (new_arr && new_arr.length > 1) ? new_arr : new_arr[0];
	}

})( window, document );