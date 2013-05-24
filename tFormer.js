/**
 * tFormer.js - empower your forms
 * http://tjrus.com/tFormer
 * (c) 2013 Vasiliy Zubach (aka TjRus) - http://tjrus.com/
 * tFormer may be freely distributed under the MIT license.
 */
"use strict";

(function ( window, document, undefined ) {

	var TYPES = [
		'submit',
		'text',
		'password',
		'select-one',
		'checkbox',
		'textarea',
		'range',
		'number',
		'email',
		'hidden',
		'file',
		'date',
		'datetime-local',
		'search',
		'tel',
		'time',
		'url',
		'month',
		'week'
	];
	var CHANGE_DEFAULT = [
		'checkbox',
		'select-one',
		'range',
		'number',
		'file',
		'time',
		'date',
		'datetime-local',
		'month',
		'week'
	];
	var CHANGE_ALSO = [
		'number',
		'date',
		'datetime-local',
		'time',
		'month',
		'week'
	];

	// default options
	var defaults = {
		errorClass         : 'error', // error class
		processingClass    : 'processing', // processing class
		disabledClass      : 'disabled', // disabled class for submit button
		//
		timeout            : 0, // timeout for validation on keyup
		requestTimeout     : 2000, // timeout for request field
		//
		validateEvent      : 'input keyup',
		//
		submitButtonControl: true, // submit button controll
		submitButton       : null // defining submit button
	};

	/**
	 * Adds validation event to fields ( 'keyup' by default )
	 * @param field - HTML element to add event
	 * @private
	 */
	var _addElementEvent = function ( field ) {
		var self = this;
		var validate_event = self.get( 'validateEvent' );
		var event_keyword = validate_event;
		if ( !event_keyword ) {
			return;
		}

		// Disable submit button on field change (field should be validated again)
		__on( field, 'input keyup', function () {
			if ( field.value != self.get( 'value', field.name ) ) {
				self.valid = false;
				self.submitButtonOff();
			}
		}, this );


		var validationTimeout = self.get( 'timeout', field.name );

		if ( ~__inArray( CHANGE_DEFAULT, field.type ) ) {
			event_keyword = 'change';
			validationTimeout = 0;
		}

		if ( ~__inArray( CHANGE_ALSO, field.type ) && validate_event !== 'change' ) {
			event_keyword += ' ' + validate_event;
		}

		__on( field, event_keyword, function ( e ) {
			// if not changed - no need to validate again
			if ( field.value == self.get( 'value', field.name ) && field.type !== 'checkbox' ) {
				return;
			}
			__removeClass( field, self.get( 'errorClass', field.name ) );
			__removeClass( field, self.get( 'processingClass', field.name ) );

			if ( validationTimeout && (~validate_event.indexOf( 'keyup' ) || ~validate_event.indexOf( 'input' )) ) {
				clearTimeout( self.fieldTimeout[field.name] );
				clearTimeout( self.xhrTimeout[field.name] );
				self.fieldTimeout[field.name] = setTimeout( function () {
					self.validateField( field );
				}, validationTimeout );
			} else {
				self.validateField( field );
			}
		}, this );

		// add onblur validation
		if ( ~__inArray( event_keyword, 'blur' ) ) {
			return;
		}
		__on( field, 'blur', function () {
			// if not changed - no need to validate again
			if ( (field.value != self.get( 'value', field.name ) && !__hasClass( field, self.get( 'errorClass' ) )) || __data( field, 'holded' ) ) {
				self.validateField( field, true, true );
			}
		}, this );
	};

	/**
	 * add dependency event
	 * @param field
	 * @private
	 */
	var _dependencyEvent = function ( field ) {
		var self = this;
		var rules = self.get( 'rules', field.name );
		if ( !rules || rules.indexOf( '=' ) === -1 ) {
			return;
		}
		var options = _v_( rules ).parseValidateOptions();
		for ( var i = 0, options_length = options.length; i < options_length; i++ ) {
			if ( options[i][0] != 'matchesTo' && options[i][0] != 'matchesToId' ) {
				continue;
			}

			var param = options[i][1];
			var paramArray = regex.ruleArray.exec( param );
			param = (( paramArray ) ? paramArray[1] : param ).split( ',' );

			for ( var j = 0, param_length = param.length; j < param_length; j++ ) {
				if ( param[j].indexOf( '#' ) === 0 || options[i][0] == 'matchesToId' ) {
					var el = document.getElementById( (options[i][0] == 'matchesToId') ? param : param[j].replace( '#', '' ) );
					if ( el ) {
						__on( el, 'keyup', function ( e ) {
							var error = __data( field, 'error' );
							var has_error_class = __hasClass( field, self.get( 'errorClass', field.name ) );
							if ( !(error && !has_error_class ) ) {
								self.validateField( field );
							}
						}, self )
					}
				}
			}
		}

	};

	/**
	 * Adds `validation by click` to check buttons
	 *
	 * @param element - HTML element to add click event
	 * @private
	 */
	var _addCheckButtonEvent = function ( element ) {
		var self = this;
		var check = __data( element, 'check' );
		var field = self.form[check];
		if ( !check || !field ) {
			return;
		}

		__on( element, 'click', function () {
			clearTimeout( self.fieldTimeout[field.name] );
			self.validateField( field, true, 'no_timeout' );
		}, this );
	};

	/**
	 * find Submit button (if not defined);
	 *
	 * @param field - HTML element to add click event
	 * @private
	 */
	var _findSubmitButton = function ( field ) {
		if ( !this.get( 'submitButton' ) && field.type == 'submit' ) {
			this.options.submitButton = field;
		}
	};

	/**
	 * Get field options
	 *
	 * @param field
	 * @private
	 */
	var _getFieldOptions = function ( field ) {
		this.fields[field.name] = __extend( this.fields[field.name] || {}, {
			name   : field.name,
			type   : field.type,
			value  : '',
			checked: null,
			rules  : (this.fields[field.name] || {}).rules || __data( field, 'rules' )
		} );
	};

	/**
	 * Ads submit event on click;
	 *
	 * @private
	 */
	var _submitButtonEvent = function () {
		var self = this;
		var submit_button = self.get( 'submitButton' );
		if ( submit_button && submit_button.type != 'submit' ) {
			__on( submit_button, 'click', function ( e ) {
				self.form.onsubmit( e );
			}, self );
		}
	};


	/**
	 * Hidden form validate
	 * validate form without showing the errors
	 * @private
	 */
	var _hidenFormValidate = function () {
		this.validateForm();
	};

	/**
	 * Submit function
	 * @private
	 */
	var _submitFunction = function () {
		this.form.onsubmit = (function ( self ) {
			return function ( event ) {
				event = event || window.event;
				// disable double submit
				var processing = self.get( 'processingClass' ),
					submit_btn = self.get( 'submitButton' ),
					submit_processing = ~submit_btn.className.indexOf( processing );

				if ( ( processing && submit_processing ) || self.locked ) {
					if ( event.preventDefault ) {
						event.preventDefault();
					} else {
						event.returnValue = false;
					}
					return false;
				}

				self.processing( true );

				if ( self.get( 'submitButtonControl' ) && self.valid && typeof(self.get( 'submit' )) == 'function' ) {
					if ( event.preventDefault ) {
						event.preventDefault();
					} else {
						event.returnValue = false;
					}
					self.execute( 'submit', self.form, [event] );
					return false;
				} else {
					self.processing( false );
				}

				try {
					if ( !self.validateForm( event, true ) ) {
						if ( event.preventDefault ) {
							event.preventDefault();
						} else {
							event.returnValue = false;
						}
						self.processing( false );
						return false;
					}

					if ( typeof self.options.submit == 'function' ) {
						if ( event.preventDefault ) {
							event.preventDefault();
						} else {
							event.returnValue = false;
						}
						self.execute( 'submit', self.form, [event] );
						return false;
					}
					return true;

				} catch ( e ) {
				}
			};
		})( this );
	};


	/**
	 *
	 * @param field
	 * @param {boolean} showError
	 * @param {boolean} no_timeout
	 * @private
	 */
	var _request = function ( field, showError, no_timeout ) {

		var self = this,
			method = this.get( 'method', field.name ) || 'GET',
			data = this.get( 'data', field.name ) || {},
			url = this.get( 'url', field.name ) || window.location.href;

		if ( method.toLowerCase() == 'get' ) {
			url += (~url.indexOf( '?' ) ) ? '&' : '?';
			url += field.name + '=' + field.value;
		} else {
			data[field.name] = field.value;
		}

		var readyStateChange = function () {
			var xhr = self.xhr[field.name];

			// run start request function
			if ( xhr.readyState == 1 ) {
				self.execute( 'start', field );
			}

			if ( xhr.readyState == 4 ) {
				if ( xhr.status == 200 ) {
					var errors = [];
					//					var validation = endFunction.call( field, xhr.response );
					var validation = self.execute( 'end', field, [xhr.response] );
					__removeClass( field, self.get( 'processingClass' ) );
					__mark_field( field, 'h', 0, self );
					if ( !validation ) {
						errors = ['request', ''];
					}
					self.errorControl( field, errors, true );
				}
			}
		};

		var makeRequest = function () {
			// self.xhr[field.name] = new XMLHttpRequest();
			self.xhr[field.name] = HTTP.newRequest();

			var xhr = self.xhr[field.name];

			xhr.onreadystatechange = readyStateChange;

			// TODO: ajax start function should be here (fix bug in IE);
			__addClass( field, self.get( 'processingClass' ) );

			xhr.open( method.toUpperCase(), url, true );
			xhr.setRequestHeader( "Accept-Language", "en" );
			if ( method.toLowerCase() == 'post' ) {
				xhr.setRequestHeader( "Content-type", "application/x-www-form-urlencoded; charset=UTF-8" );
				xhr.send( __serialize( data ) );
			} else {
				xhr.send( null );
			}
		};

		if ( self.xhr[field.name] ) {
			self.xhr[field.name].abort();
		}

		clearTimeout( self.xhrTimeout[field.name] );
		__mark_field( field, 'h', 1, self );

		var requestTimeout = (function () {
			var timeout = self.get( 'timeout', field.name );
			var requestTimeout = self.get( 'requestTimeout', field.name );
			return requestTimeout - timeout;
		})();

		if ( !no_timeout && requestTimeout > 0 ) {
			self.xhrTimeout[field.name] = setTimeout( function () {
				makeRequest();
			}, requestTimeout );
		} else {
			makeRequest();
		}
	};

	var __check_cache = function ( our_form ) {
		var cache = window.tFormer_cache;
		var finded;
		for ( var i = 0, cache_l = cache.length; i < cache_l; i++ ) {
			if ( cache[i].form == our_form ) {
				return cache[i];
			}
		}
		return null;
	};

	/**
	 * @constructor
	 * @param formId
	 * @param options
	 * @returns {*}
	 */
	var tFormer = function ( formId, options ) {

		// check is this a new object;
		if ( !(this instanceof tFormer) ) {
			return new tFormer( formId, options );
		}

		// our form
		var our_form;
		if ( typeof(formId) === 'string' ) { // this it is selector
			our_form = document.forms[formId];
		} else if ( typeof(formId) === 'object' && formId.nodeName.toLowerCase() == 'form' ) { // lets hope it is DOM Object
			our_form = formId;
		}

		if ( !our_form ) {
			return;
		}

		// check is tFormer was allready inited for current form
		if ( !__data( our_form, 'empowered' ) ) {
			__data( our_form, 'empowered', 1 )
		} else {
			var cached = __check_cache( our_form );
			if ( cached ) {
				var inited = cached.inited;
				if ( inited ) {
					cached.destroy();
				}
				cached.options = __extend( __clone( defaults ), options );
				cached.fields = cached.options.fields || {};
				for ( var f in cached.fields ) {
					if ( typeof cached.fields[f] == 'string' ) {
						cached.fields[f] = {
							rules: cached.fields[f]
						}
					}
				}
				if ( inited ) {
					cached.init();
				}
				return cached;
			}
			return;
		}
		this.form = our_form;

		this.options = __extend( __clone( defaults ), options );
		// default options
		this.fields = this.options.fields || {};
		for ( var f in this.fields ) {
			if ( typeof this.fields[f] == 'string' ) {
				this.fields[f] = {
					rules: this.fields[f]
				}
			}
		}
		this.events = {};
		this.btn_events = [];

		// timeouts for fields
		this.fieldTimeout = {};

		// Errors stuff
		this.errors = {};
		this.errorsArray = []; // current errors Array
		this.errorsCount = 0; // current fields with errors count

		// Counter for fields holded for validation
		this.holdedCount = 0; // current holded fields count

		// XHR stuff
		this.xhr = {};
		this.xhrTimeout = {};

		// fully valid
		this.valid = true;

		this.locked = 0;


		var tf = this.init();
		window.tFormer_cache.push( tf );
		return tf;
	};

	var tFormer_proto = tFormer.prototype;

	/**
	 * init tFormer()
	 *
	 * @returns {*}
	 */
	tFormer_proto.init = function () {

		if ( this.inited ) {
			return this;
		}

		for ( var i = 0, fieldLength = this.form.length; i < fieldLength; i++ ) {
			var field = this.form[i];

			_addCheckButtonEvent.call( this, field );
			_findSubmitButton.call( this, field );
			// If passed in incorrectly, we need to skip the field.
			if ( !field.name ) {
				continue;
			}
			_getFieldOptions.call( this, field ); // get all field stuff
			_addElementEvent.call( this, field ); // add eventListener to form element
			_dependencyEvent.call( this, field ); // check dependency field
		}
		_submitButtonEvent.call( this ); // add submit button event
		_hidenFormValidate.call( this ); // hidden validate without error showing
		_submitFunction.call( this ); // Add formSubmit validation event

		this.inited = true;

		return this;
	};


	/**
	 * Get field options (default or custom)
	 *
	 * @param {string} option_name
	 * @param {!string} field_name
	 * @returns {*}
	 */
	tFormer_proto.get = function ( option_name, field_name ) {
		if ( field_name && this.fields[field_name][option_name] !== null && this.fields[field_name][option_name] !== undefined ) {
			return this.fields[field_name][option_name];
		} else {
			return this.options[option_name];
		}
		//		return (!field_name) ? this.options[option_name] : (this.fields[field_name][option_name] || this.options[option_name]);
	};


	/**
	 * set options to the field (if field_name os defined)
	 *
	 * @param options
	 * @param field_name
	 */
	tFormer_proto.set = function ( options, field_name ) {
		for ( var key in options ) {
			if ( !field_name ) {
				this.options[key] = options[key];
			} else {
				this.fields[field_name] = this.fields[field_name] || {};
				this.fields[field_name][key] = options[key];
			}
		}
		this.destroy();
		this.init();
	};


	/**
	 * setRules and revalidate form without showing the errors
	 *
	 * @param rules - string with rules
	 * @param field_name
	 * @param {boolean} show_errors
	 */
	tFormer_proto.setRules = function ( rules, field_name, show_errors ) {

		this.set( {rules: rules}, field_name );
		this.validateForm( show_errors ? true : false );
	};


	/**
	 * Execute custom eventFunction (default or custom)
	 *
	 * @param func_name
	 * @param this_el
	 * @param {Array} params
	 */
	tFormer_proto.execute = function ( func_name, this_el, params ) {
		var func = this.get( func_name, (this_el.name || null) );
		if ( typeof func == 'function' ) {
			return func.apply( this_el, (params || []) );
		}
	};


	/**
	 * Control processing class of submit button
	 *
	 * @param {boolean} processing
	 */
	tFormer_proto.processing = function ( processing ) {
		if ( !this.get( 'submitButtonControl' ) ) {
			return;
		}
		var sb = this.get( 'submitButton' );
		var pc = this.get( 'processingClass' );
		if ( processing ) {
			__addClass( sb, pc );
		} else {
			__removeClass( sb, pc );
		}
		return this;
	};
	tFormer_proto.processingOn = function () {
		return this.processing( true );
	};
	tFormer_proto.processingOff = function () {
		return this.processing( false );
	};


	/**
	 * validateForm - function for validating field
	 *
	 * @param event - form submit event
	 * @param {!boolean} no_timeout - no request timeout - immediately validate the field
	 * @returns {boolean}
	 * @private
	 */
	tFormer_proto.validateForm = function ( event, no_timeout ) {
		//empty errors
		this.errorsArray = [];
		// go through all fields and validate them
		for ( var key in this.fields ) {
			if ( !this.fields.hasOwnProperty( key ) ) {
				continue;
			}
			var field = this.form[key];
			var show_errors = (event) ? true : false;
			this.validateField( field, show_errors, no_timeout );
		}
		return !(this.errorsCount > 0 || this.holdedCount > 0);
	};


	/**
	 * validateField - function for validating field
	 *
	 * @param that - HTML element to test
	 * @param {!boolean} showError - show error for field or not
	 * @param {!boolean} no_timeout - validate with/without timeout
	 * @returns {*}
	 * @private
	 */
	tFormer_proto.validateField = function ( that, showError, no_timeout ) {
		if ( typeof that == 'string' && this.form ) {
			that = this.form[that];
		}
		if ( !that || __inArray( TYPES, that.type ) === -1 ) {
			return;
		}
		var field = this.fields[that.name];
		field.value = that.value;
		field.checked = that.checked;

		var errors = [];
		var own_func = this.get( 'own', that.name );

		if ( !field.rules ) {
			this.errorControl( that, errors, true );
			return true;
		}
		showError = !(showError === false);

		this.execute( 'before', that );

		if ( own_func && typeof(own_func) == "function" ) {
			var validate_result = own_func.call( that );
			if ( !validate_result ) {
				errors.push( ['own', ''] );
			}
			this.errorControl( that, errors, showError );
			return validate_result;
		}

		var request = ~field.rules.indexOf( 'request' );

		clearTimeout( this.xhrTimeout[that.name] );
		clearTimeout( this.fieldTimeout[that.name] );

		// check if empty and not required
		if ( field.rules.indexOf( '*' ) !== 0 && field.value === '' ) {
			if ( request ) {
				clearTimeout( this.xhrTimeout[that.name] );
				__removeClass( that, this.get( 'processingClass' ) );
				__mark_field( that, 'h', 0, this );
			}
			this.errorControl( that, errors, true );
			return true;
		}

		// check if field is checkbox
		if ( field.type == 'checkbox' ) {
			var checkbox_checked = field.checked;
			if ( !checkbox_checked ) {
				errors.push( ['required', ''] );
			}
			this.errorControl( that, errors, showError );
			return checkbox_checked;
		}

		errors = _v_( field.value ).validateWithRules( {rules: field.rules, result: 'array' } );

		// run request if needed and other rules validated successfully;
		if ( request && errors.length === 0 ) {
			_request.call( this, that, showError, no_timeout );
		} else {
			__mark_field( that, 'h', 0, this );
		}


		// controll all errors
		this.errorControl( that, errors, showError );

		return (errors && errors.length > 0) ? false : true;
	};


	/**
	 * controllSubmitButton - method for adding disable status to submit button when some field is invalid
	 *
	 * @param {!boolean} is_valid  - shows is form valid or not
	 * @private
	 */
	tFormer_proto.submitButtonControl = function ( is_valid ) {
		var submit_button_controll = this.get( 'submitButtonControl' ),
			submit_button = this.get( 'submitButton' );
		if ( !submit_button_controll || !submit_button ) {
			return;
		}
		if ( is_valid ) {
			if ( this.locked === 0 ) {
				__removeClass( submit_button, this.get( 'disabledClass' ) );
			}
		} else {
			__addClass( submit_button, this.get( 'disabledClass' ) );
		}
	};
	tFormer_proto.submitButtonOn = function () {
		this.submitButtonControl( true );
	};
	tFormer_proto.submitButtonOff = function () {
		this.submitButtonControl( false );
	};


	/**
	 * toObject - Form -> object
	 * get all for fields and theirs values to single Object
	 *
	 * @returns {{}}
	 */
	tFormer_proto.toObject = function () {
		var obj = {};
		for ( var i = 0, formLength = this.form.length; i < formLength; i++ ) {
			var el = this.form[i];
			if ( !el.name ) {
				continue;
			}
			if ( el.type == 'checkbox' ) {
				obj[el.name] = el.checked;
			} else if ( el.type == 'radio' ) {
				if ( !obj[el.name] ) {
					obj[el.name] = '';
				}
				if ( el.checked ) {
					obj[el.name] = el.value;
				}
			} else {
				obj[el.name] = el.value;
			}
		}
		return obj;
	};


	/**
	 * Controll error classNames
	 *
	 * @param field - currently validating HTML element
	 * @param errors - errors in validating @that element
	 * @param {!boolean} showError - show error on the field or not
	 * @private
	 */
	tFormer_proto.errorControl = function ( field, errors, showError ) {
		// show || hide error
		var with_errors = errors.length > 0;

		if ( this.get( 'errorClass' ) ) {
			if ( with_errors && showError ) {
				__addClass( field, this.get( 'errorClass' ) );
			} else {
				__removeClass( field, this.get( 'errorClass' ) );
			}
		}

		// add errors to this object and to field dataset
		if ( errors && with_errors ) {
			this.errors[field.name] = errors;
			__mark_field( field, 'e', 1, this );
		} else {
			delete this.errors[field.name];
			__mark_field( field, 'e', 0, this );
		}

		this.valid = !(this.holdedCount > 0 || this.errorsCount > 0 );

		if ( showError && !__data( field, 'holded' ) ) {
			// Execute error/valid functions
			this.execute( (with_errors) ? 'onerror' : 'onvalid', field );
		}

		this.submitButtonControl( this.valid );
	};

	/**
	 * Destroy tFormer
	 */
	tFormer_proto.lock = function () {
		this.locked += 1;
		this.submitButtonOff();
	}

	tFormer_proto.unlock = function () {
		this.locked -= 1;
		if ( this.locked === 0 ) {
			this.submitButtonControl( !(this.errorsCount > 0 || this.holdedCount > 0) );
		}
	}

	/**
	 * Destroy tFormer
	 */
	tFormer_proto.destroy = function () {
		// remove events from buttons
		var el = this.btn_events;
		for ( var key = 0; key < el.length; key++ ) {
			__off( el[key][0], el[key][1], el[key][2] );
		}
		this.btn_events = [];

		var sb = this.get( 'submitButton' );
		if ( sb ) {
			__removeClass( sb, this.get( 'processingClass' ) );
			__removeClass( sb, this.get( 'disabledClass' ) );
		}

		// remove events from fields
		if ( !this.form ) {
			return;
		}

		el = this.events;
		for ( var key in el ) {
			var field = this.form[key];
			if ( !field ) {
				continue;
			}
			__removeClass( field, this.get( 'errorClass', field.name ) );
			__removeClass( field, this.get( 'processingClass', field.name ) );
			for ( var e in el[key] ) {
				for ( var i = 0; i < el[key][e].length; i++ ) {
					__off( this.form[key], e, el[key][e][i] );
				}
			}
		}
		this.events = {};

		// remove timers
		for ( var key in this.fields ) {
			if ( this.fieldTimeout[key] ) {
				clearTimeout( this.fieldTimeout[key] );
				delete this.fieldTimeout[key];
			}
			if ( this.fieldTimeout[key] ) {
				clearTimeout( this.xhrTimeout[key] );
				delete this.xhrTimeout[key];
			}
			if ( this.xhr[key] ) {
				this.xhr[key].abort();
			}
		}

		// remove onsubmit validation function
		this.form.onsubmit = null;


		//		this.fields = this.options.fields || {};
		//		this.events = {};
		//		this.btn_events = [];
		//
		//		// timeouts for fields
		//		this.fieldTimeout = {};
		//
		//		// Errors stuff
		//		this.errors = {};
		//		this.errorsArray = []; // current errors Array
		//		this.errorsCount = 0; // current fields with errors count
		//
		//		// Counter for fields holded for validation
		//		this.holdedCount = 0; // current holded fields count
		//
		//		// XHR stuff
		//		this.xhr = {};
		//		this.xhrTimeout = {};
		//
		//		// fully valid
		//		this.valid = true;
		//
		//		this.locked = 0;
		//

		this.inited = false;

	};
	window.tFormer = tFormer;
	window.tFormer_cache = [];


	/**
	 * _v_ - Validator
	 */
	var regex = {
		ruleArray   : /^\[(.+)\]$/,
		email       : /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i,
		url         : /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i,
		alpha       : /^[a-z]+$/i,
		alphaNumeric: /^[a-z0-9]+$/i,
		alphaDash   : /^[a-z_-]+$/i,
		alphaNumDash: /^[a-z0-9_-]+$/i,
		ip          : /^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/i,
		base64      : /^(?:[A-Za-z0-9+\/]{4})*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=|[A-Za-z0-9+\/]{4})$/,
		integer     : /^\-?[0-9]+$/,
		numeric     : /^[0-9]+$/,
		natural     : /^[0-9]+$/i,
		decimal     : /^\-?[0-9]*\.?[0-9]+$/,

		card                 : /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/,
		card_visa            : /^4[0-9]{12}(?:[0-9]{3})?$/,
		card_mastercard      : /^5[1-5][0-9]{14}$/,
		card_american_express: /^3[47][0-9]{13}$/,
		card_discover        : /^6(?:011|5[0-9]{2})[0-9]{12}$/,
		card_jcb             : /^(?:2131|1800|35\d{3})\d{11}$/
	};

	var keys = {
		'*'  : 'required',
		'@'  : 'isValidEmail',
		'@s' : 'isValidEmails',
		'ip' : 'isValidIP',
		'b64': 'isValidBase64',

		'url': 'isValidUrl',

		'c' : 'isValidCard',
		'cv': 'isValidVisa',
		'cm': 'isValidMastercard',
		'ca': 'isValidAmex',
		'cd': 'isValidDiscover',

		'a'  : 'isAlpha',
		'a1' : 'isAlphaNumeric',
		'a1_': 'isAlphaNumDash',
		'a_' : 'isAlphaDash',

		'num': 'isNumeric',
		'int': 'isInteger',
		'dec': 'isDecimal',
		'nat': 'isNatural',

		'l=' : 'lengthEq',
		'l>' : 'lengthMore',
		'l>=': 'lengthEqOrMore',
		'l<' : 'lengthLess',
		'l<=': 'lengthEqOrLess',

		'lr=': 'lengthInRange',

		'reg=': 'validateRegular',

		'r=': 'inRange',

		'>=': 'greaterOrEq',
		'<=': 'lessOrEq',
		'>' : 'greaterThen',
		'<' : 'lessThen',
		'=#': 'matchesToId',
		'=' : 'matchesTo',

		'!=': 'notMatches',
		'!' : 'notContain',

		'D=': 'isValidDate'
	};
	var rules_order = ['lr=', 'l=', 'l>=', 'l<=', 'l>', 'l<', 'reg=', 'r=', '>=', '<=', '>', '<', '=#', '=', '!=', '!', 'D='];

	/**
	 * Validator constructor
	 *
	 * @constructor
	 * @param value
	 * @returns {*}
	 * @private
	 */
	var _v_ = function ( value ) {
		if ( !(this instanceof _v_) ) {
			return new _v_( value );
		}
		this.value = value;
		return this;
	};
	var _v_proto = _v_.prototype;

	_v_proto.required = function () {
		return (this.value.length !== 0) ? true : false;
	};
	_v_proto.validateRegular = function ( regExpression ) {
		var reg = new RegExp( regExpression, 'i' );
		return reg.test( this.value );
	};

	_v_proto.isValidUrl = function () {
		return regex.url.test( this.value );
	};

	_v_proto.isValidEmail = function () {
		return regex.email.test( this.value.replace( /^\s+|\s+$/g, '' ) );
	};

	_v_proto.isValidEmails = function ( separator ) {
		var emails = this.value.split( separator || ',' );
		for ( var i = 0; i < emails.length; i++ ) {
			if ( !_v_( emails[i] ).isValidEmail() ) {
				return false;
			}
		}
		return true;
	};

	_v_proto.isValidCard = function () {
		return regex.card.test( this.value );
	};

	_v_proto.isValidVisa = function () {
		return regex.card_visa.test( this.value );
	};

	_v_proto.isValidMastercard = function () {
		return regex.card_mastercard.test( this.value );
	};

	_v_proto.isValidAmex = function () {
		return regex.card_american_express.test( this.value );
	};

	_v_proto.isValidDiscover = function () {
		return regex.card_discover.test( this.value );
	};

	_v_proto.isAlpha = function () {
		return regex.alpha.test( this.value );
	};

	_v_proto.isAlphaNumeric = function () {
		return regex.alphaNumeric.test( this.value );
	};

	_v_proto.isAlphaDash = function () {
		return regex.alphaDash.test( this.value );
	};

	_v_proto.isAlphaNumDash = function () {
		return regex.alphaNumDash.test( this.value );
	};

	_v_proto.isValidIP = function () {
		return regex.ip.test( this.value );
	};

	_v_proto.isValidBase64 = function () {
		return regex.base64.test( this.value );
	};

	_v_proto.isInteger = function () {
		return regex.integer.test( this.value );
	};

	_v_proto.isDecimal = function () {
		return regex.decimal.test( this.value );
	};

	_v_proto.isNumeric = function () {
		return regex.numeric.test( this.value );
	};

	_v_proto.isNatural = function () {
		return regex.natural.test( this.value );
	};

	_v_proto.lengthEq = function ( length ) {
		if ( typeof(length) == 'number' || typeof(length) == 'string' ) {
			return this.value.length == length;
		} else {
			for ( var key in length ) {
				if ( this.value.length == length[key] ) return true;
			}
		}
		return false;
	};

	_v_proto.lengthMore = function ( length ) {
		return this.value.length > length;
	};

	_v_proto.lengthEqOrMore = function ( length ) {
		return this.value.length >= length;
	};

	_v_proto.lengthLess = function ( length ) {
		return this.value.length < length;
	};

	_v_proto.lengthEqOrLess = function ( length ) {
		return this.value.length <= length;
	};

	_v_proto.lengthInRange = function ( range ) {
		return (this.value.length >= range[0] && this.value.length <= range[1]);
	};

	_v_proto.greaterThen = function ( value ) {
		return (_v_( this.value.toString() ).isDecimal() && parseFloat( this.value ) > parseFloat( value )) ? true : false;
	};

	_v_proto.greaterOrEq = function ( value ) {
		return (_v_( this.value.toString() ).isDecimal() && parseFloat( this.value ) >= parseFloat( value )) ? true : false;
	};

	_v_proto.lessThen = function ( value ) {
		return (_v_( this.value.toString() ).isDecimal() && parseFloat( this.value ) < parseFloat( value )) ? true : false;
	};

	_v_proto.lessOrEq = function ( value ) {
		return (_v_( this.value.toString() ).isDecimal() && parseFloat( this.value ) <= parseFloat( value )) ? true : false;
	};

	_v_proto.inRange = function ( value ) {
		return (_v_( this.value.toString() ).isDecimal() && parseFloat( this.value ) >= parseFloat( value[0] ) && parseFloat( this.value ) <= parseFloat( value[1] )) ? true : false;
	};

	_v_proto.matchesToId = function ( value ) {
		if ( typeof value == 'string' || typeof value == 'number' ) {
			value = value.split( ' ' );
			var el = document.getElementById( value );
			if ( !el ) {
				return false;
			}
			return this.value == el.value;
		} else {
			for ( var i = 0; i < value.length; i++ ) {
				var el = document.getElementById( value[i] );
				if ( el && this.value == el.value ) {
					return true;
				}
			}
		}
		return false;
	};

	_v_proto.matchesTo = function ( value ) {
		if ( typeof value == 'string' || typeof value == 'number' ) {
			return this.value == value;
		} else {
			for ( var i = 0, valueLength = value.length; i < valueLength; i++ ) {
				if ( value[i].indexOf( '#' ) === 0 ) {
					var el = document.getElementById( value[i].replace( '#', '' ) );
					if ( !el ) {
						return false;
					}
					if ( this.value == el.value ) return true;
				} else {
					if ( this.value == value[i] ) return true;
				}
			}
		}
		return false;
	};

	_v_proto.notMatches = function ( value ) {
		return !(_v_( this.value ).matchesTo( value ));
	};

	_v_proto.notContain = function ( value ) {
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
	};

	_v_proto.isValidDate = function ( date_formar ) {
		return (__toDate( this.value, date_formar )) ? true : false;
	};

	_v_proto.validateMethods = function ( separator ) {
		var validate_options = _v_( this.value ).parseValidateOptions( separator );
		var validate_methods = [];
		for ( var i = 0, vo_length = validate_options.length; i < vo_length; i++ ) {
			validate_methods[i] = validate_options[i][0];
		}
		return validate_methods;
	};

	_v_proto.parseValidateOptions = function ( separator ) {
		var options = this.value.split( separator || ' ' ),
			parsed_options = [];

		for ( var i = 0; i < options.length; i++ ) {
			var option = options[i],
				func = '',
				param = '';

			if ( keys[ option ] ) {
				func = keys[ option ];
			} else {
				for ( var j = 0, roLength = rules_order.length; j < roLength; j++ ) {
					if ( option.indexOf( rules_order[j] ) === 0 ) {
						param = option.replace( rules_order[j], '' );
						func = keys[rules_order[j]];
						break;
					}
				}
			}
			if ( func ) {
				parsed_options.push( [func, param] );
			}
		}
		return parsed_options;
	};

	/**
	 *
	 * @param options
	 * options.value_separator
	 * options.rule_separator
	 * options.result
	 * @returns {*}
	 */
	_v_proto.validateWithRules = function ( options ) {
		var rules = (typeof options == 'string') ? options : options.rules;
		var value_separator = options.value_separator || ',';
		var rule_separator = options.rule_separator || ' ';
		var result = options.result;
		if ( !rules ) {
			return true;
		}
		var parsedRules = _v_( rules ).parseValidateOptions( rule_separator );
		var errors = [];

		for ( var i = 0, rulesLength = parsedRules.length; i < rulesLength; i++ ) {
			// request goes in the end
			if ( parsedRules[i][0] == 'request' || !parsedRules[i][0] ) {
				continue;
			}

			var method = parsedRules[i][0],
				param = parsedRules[i][1];

			// get param options as array
			var paramArray = regex.ruleArray.exec( param );
			if ( paramArray ) param = paramArray[1].split( ',' );

			if ( !_v_( (this.value).toString() )[method]( param || value_separator ) ) {
				errors.push( [method, param] );
			}
		}

		if ( result == 'array' ) {
			return errors;
		}
		return (errors.length > 0) ? false : true;
	};

	window._v_ = _v_;


	// private stuff and helper functions


	// Date functions
	var __dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	var __shortDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	var __dayChars = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

	// Full, short and single character names for the months.  Override these to provide multi-language support.
	var __monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	var __shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	var __monthChars = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

	var __daysInMonth = function ( month, year ) {
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
	var __toDate = function ( date, format ) {
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


	// AJAX Request functionality
	var HTTP = {};

	HTTP._factories = [
		function () {
			return new XMLHttpRequest();
		},
		function () {
			return new ActiveXObject( "Msxml2.XMLHTTP" );
		},
		function () {
			return new ActiveXObject( "Microsoft.XMLHTTP" );
		}
	];

	HTTP._factory = null;

	HTTP.newRequest = function () {
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

		HTTP._factory = function () {
			throw new Error( 'Object XMLHttpRequest not supported' );
		};
		HTTP._factory();
	};


	/**
	 * Add event to element
	 *
	 * @param {object} element
	 * @param {string} evnt - event key
	 * @param {function} func - function that will be executed on event
	 * @param {!object} that - tFormer object for registering event
	 */
	var __on = function ( element, evnt, func, that ) {

		var events = evnt.split( ' ' );
		for ( var i = 0, events_length = events.length; i < events_length; i++ ) {
			if ( element.addEventListener ) { // W3C DOM
				element.addEventListener( events[i], func, false );
			} else if ( element.attachEvent ) { // IE DOM
				element.attachEvent( "on" + events[i], func );
			} else { // No much to do
				element[events[i]] = func;
			}
			// register event to tFormer object
			if ( that ) {
				__regOn( element, events[i], func, that );
			}
		}
	};


	/**
	 * Register event in tFormer object
	 *
	 * @param {object} element
	 * @param {string} evnt - event key
	 * @param {function} func - function that will be executed on event
	 * @param {!object} that - tFormer object for registering event
	 */
	var __regOn = function ( element, evnt, func, that ) {
		switch ( element.type ) {
			case 'button':
			case 'submit':
			case undefined:
				that.btn_events.push( [element, evnt, func] )
				break;
			default:
				var name = element.name;
				if ( !that.events[name] ) {
					that.events[name] = {};
				}
				if ( !that.events[name][evnt] ) {
					that.events[name][evnt] = []
				}
				that.events[name][evnt].push( func );
				break;
		}
	};


	/**
	 * Remove event from element
	 *
	 * @param {object} element
	 * @param {string} evnt - event key
	 * @param {function} func - function that will be executed on event
	 */
	var __off = function ( element, evnt, func ) {
		if ( element.removeEventListener ) { // W3C DOM
			element.removeEventListener( evnt, func, false );
		} else if ( element.detachEvent ) { // IE DOM
			element.detachEvent( "on" + evnt, func );
		} else { // No much to do
			element[evnt] = null;
		}
	};


	/**
	 * Fire event from element
	 *
	 * @param {object} element - element
	 * @param {string} evnt - event key
	 */
	var __fire = function ( element, evnt ) {
		var evt;
		if ( document.createEventObject ) {
			// dispatch for IE
			evt = document.createEventObject();
			return element.fireEvent( 'on' + evnt, evt );
		} else {
			// dispatch for firefox + others
			evt = document.createEvent( "HTMLEvents" );
			evt.initEvent( evnt, true, true ); // event type,bubbling,cancelable
			return !element.dispatchEvent( evt );
		}
	};


	/**
	 * Method for adding custom class to element
	 *
	 * @param element
	 * @param new_class
	 * @returns {object}
	 */
	var __addClass = function ( element, new_class ) {
		var class_name = element.className;
		if ( class_name.indexOf( new_class ) === -1 ) {
			class_name += " " + new_class;
			element.className = class_name.replace( /\s{2,}/g, ' ' );
		}
		return this;
	};


	/**
	 * Method for removing custom class from element
	 * @param element
	 * @param old_class
	 * @returns {*}
	 */
	var __removeClass = function ( element, old_class ) {
		if ( element.length ) {
			for ( var i = 0; i < element.length; i++ ) {
				__removeClass( element[i], old_class );
			}
		} else {
			var class_name = element.className;
			if ( ~class_name.indexOf( old_class ) ) {
				var re = new RegExp( '(\\s|^)' + old_class + '(\\s|$)' );
				element.className = class_name.replace( re, ' ' );
			}
		}
		return this;
	};


	/**
	 * Method for checking custom class in element
	 * @param element
	 * @param class_name
	 * @returns {boolean}
	 */
	var __hasClass = function ( element, class_name ) {
		return !!(( ~(' ' + element.className + ' ').indexOf( ' ' + class_name + ' ' ) ));
	};


	/**
	 * Object extend
	 * @param object
	 * @param new_obj
	 * @returns {object}
	 */
	var __extend = function ( object, new_obj ) {
		for ( var key in new_obj ) {
			if ( new_obj.hasOwnProperty( key ) )
				object[key] = new_obj[key];
		}
		return object;
	};


	/**
	 * Object clone
	 * @returns {*|array|string}
	 */
	var __clone = function ( obj ) {
		return __isArray( obj ) ? obj.slice() : __extend( {}, obj );
	};


	/**
	 * is array function
	 * @returns {boolean}
	 */
	var __isArray = function ( obj ) {
		return Object.prototype.toString.call( obj ) == '[object Array]';
	};


	/**
	 * detects is defined array has some value
	 * @param array
	 * @param value
	 * @returns {number}
	 * @private
	 */
	var __inArray = function ( array, value ) {
		var index = -1,
			length = array ? array.length : 0;
		while ( ++index < length ) {
			if ( array[index] === value ) {
				return index;
			}
		}
		return -1;
	};

	/**
	 * is array function
	 * @returns {boolean}
	 */
	var __isObject = function ( obj ) {
		return toString.call( obj ) == '[object Object]';
	};


	/**
	 * Serrialize data for request
	 * @param {object} data - object to serialize
	 * @returns {string}
	 */
	var __serialize = function ( data ) {
		var pairs = [];
		var regexp = /%20/g;
		for ( var name in data ) {
			var pair = encodeURIComponent( name ).replace( regexp, '+' ) + '=';
			pair += encodeURIComponent( data[ name ].toString() ).replace( regexp, '+' );
			pairs.push( pair );
		}
		return pairs.join( '&' );
	};

	/**
	 * Work with data-attributes
	 *
	 * @param {object} element - element
	 * @param {string} attr - data-attribute
	 * @param {!string|number} value - new attribute value. [null - delete attr, undefined - return attr value, defined - set new value]
	 * @returns {*}
	 */
	var __data = function ( element, attr, value ) {
		switch ( value ) {
			case null:
				// delete
				try {
					delete element.dataset[attr];
				} catch ( e ) {
					element.removeAttribute( 'data-' + attr );
				}

				break;
			case undefined:
				// get
				var data;
				try {
					data = element.dataset[attr];
				} catch ( e ) {
					data = element.getAttribute( 'data-' + attr );
				}
				return data;
				break;
			default:
				// set
				try {
					element.dataset[attr] = value;
				} catch ( e ) {
					element.setAttribute( 'data-' + attr, value );
				}
				break;
		}
	};


	/**
	 *
	 * @param {object} element - current element for marking
	 * @param {string} marker = 'h' || 'e' - 'holded' || 'error'
	 * @param {boolean|number} add
	 * @param {object} tf - tFormer object
	 * @returns {*}
	 * @private
	 */
	var __mark_field = function ( element, marker, add, tf ) {
		var counter = (marker == 'h') ? 'holded' : 'errors';
		marker = (marker == 'h') ? 'holded' : 'error';
		var option = counter + 'Count';
		if ( add && !__data( element, marker ) ) {
			__data( element, marker, add ? 1 : null );
			tf[option] += 1;
		}
		if ( !add && __data( element, marker ) ) {
			__data( element, marker, add ? 1 : null );
			tf[option] = ( tf[option] === 1 ) ? 0 : tf[option] - 1;
		}
		return tf;
	}


})( window, document );