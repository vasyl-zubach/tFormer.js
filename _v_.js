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