/**
 * Test tFormer Methods
 */

describe( 'tFormer.methods()', function () {


	describe( 'validateForm(event || show_errors)', function () {
		var f = tFormer( 'f' );
		it( 'validateForm() - validating without displaying errors', function () {
			f.setRules( '* @', 't_text', false );
			f.validateForm();
			expect( $( f.form.t_text ).hasClass( f.get( 'errorClass' ) ) ).toBe( false );
		} );

		it( 'validateForm( true ) - validate form with displaying errors', function () {
			f.setRules( '* @', 'test_input', false );
			f.validateForm( true );
			expect( $( f.form.t_text ).hasClass( f.get( 'errorClass' ) ) ).toBe( true );
		} );
	} );


	describe( 'validateField(that, showError, no_timeout)', function () {
		var f;
		beforeEach( function () {
			f = tFormer( 'f', {
				fields: {
					t_text: '*'
				}
			} );
		} );

		it( '`that` can be field name string', function () {
			f.form.t_text.value = 'tjrus.com';
			expect( f.validateField( 't_text', false, true ) ).toBeTruthy();
			f.setRules( '* @', 't_text', false );
			expect( f.validateField( 't_text', false, true ) ).toBeFalsy();
			f.form.t_text.value = 'tjrus.com';
			expect( f.validateField( f.form.t_text, false, true ) ).toBe( f.validateField( 't_text', false, true ) );
		} );

		it( '`that` can be HTML form field element', function () {
			f.form.t_text.value = 'i@tjrus.com';
			expect( f.validateField( f.form.t_text, false, true ) ).toBe( f.validateField( 't_text', false, true ) );
			f.setRules( '* @', 't_text', false );
			expect( f.validateField( f.form.t_text, false, true ) ).toBe( f.validateField( 't_text', false, true ) );
			f.form.t_text.value = 'tjrus.com';
			expect( f.validateField( f.form.t_text, false, true ) ).toBe( f.validateField( 't_text', false, true ) );
		} );


		it( '`showError == false` - validate without showing the error', function () {
			f.form.t_text.value = 'i@tjrus.com';
			f.setRules( '* @', 't_text', false );
			f.form.t_text.value = 'tjrus.com';
			expect( f.validateField( f.form.t_text, false, true ) ).toBe( false );
			expect( $( f.form.t_text ).hasClass( f.get( 'errorClass', 't_text' ) ) ).toBe( false );
		} );

		it( '`showError == true` - validate with displaying errors', function () {
			f.form.t_text.value = 'i@tjrus.com';
			f.setRules( '* @', 't_text', false );
			f.form.t_text.value = 'tjrus.com';
			expect( f.validateField( f.form.t_text, true, true ) ).toBe( false );
			expect( $( f.form.t_text ).hasClass( f.get( 'errorClass', 't_text' ) ) ).toBe( true );
		} );

		it( '`no_timeout == true` - disable request validation timeout', function () {
			var start = 0,
				end = 0,
				req = '';
			f = tFormer( 'f', {
				fields: {
					t_text: {
						requestTimeout: 500,
						rules         : '* request',
						start         : function () {
							start++;
						},
						url           : 'ajax.html',
						method        : 'get',
						end           : function ( result ) {
							req = (result) ? result.toString() : '';
							end++;
							return result;
						}
					}
				}
			} );
			var end_func = end;
			var requestTimeout = f.get( 'requestTimeout', 't_text' );
			var flag;
			runs( function () {
				f.validateField( f.form.t_text, true, true );
				flag = false;
				setTimeout( function () {
					flag = true;
				}, requestTimeout / 5 );
			} );
			waitsFor( function () {
				return flag;
			}, "The Value should be incremented", requestTimeout / 3 );
			runs( function () {
				expect( end_func + 1 ).toBe( end );
			} );
		} );
	} )


	describe( 'toObject()', function () {
		var f;
		beforeEach( function () {
			f = tFormer( 'f', {
				fields: {
					t_text: '*'
				}
			} );
		} );

		it( 'toObject()', function () {
			f.form.t_text.value = 'test_input_value';
			$( f.form.t_checkbox ).attr( 'checked', 'checked' );
			f.form.t_textarea.value = 'test_textarea_value';
			f.form.t_select.value = 'test_select_value';

			var obj = f.toObject();
			expect( obj.t_text ).toBe( 'test_input_value' );
			expect( obj.t_select ).toBe( 'test_select_value' );
			expect( obj.t_checkbox ).toBe( true );
			expect( obj.t_textarea ).toBe( 'test_textarea_value' );
		} );
	} );


	describe( 'get(*option_name, field_name)', function () {
		var f;
		beforeEach( function () {
			f = tFormer( 'f', {
				fields: {
					t_text: {
						rules         : '*',
						requestTimeout: 1234
					}
				}
			} );
		} );

		it( '`field_name == undefined` - return global option', function () {
			expect( f.get( 'requestTimeout' ) ).toBe( f.options.requestTimeout );
		} );

		it( '`field_name` defined - return fieldname option', function () {
			expect( f.get( 'requestTimeout', 't_text' ) ).toBe( f.fields.t_text.requestTimeout );
		} );

		it( 'is there is no such options if defined `field_name` - return global option', function () {
			expect( f.get( 'errorClass', 't_text' ) ).toBe( f.get( 'errorClass' ) );
		} );
	} );


	describe( 'set(*options, field_name)', function () {
		var f;
		beforeEach( function () {
			f = tFormer( 'f', {
				fields: {
					t_text: '*'
				}
			} );
		} );

		it( '`field_name == undefined` - set all options as global', function () {
			f.set( {'timeout': 1234} );
			expect( f.get( 'timeout' ) ).toBe( f.options.timeout );
			expect( f.get( 'timeout' ) ).toBe( 1234 );
		} );

		it( '`field_name` defined - set all options to fieldname', function () {
			f.set( {'errorClass': 'asdfasdfasd'}, 't_text' );
			expect( f.get( 'errorClass', 't_text' ) ).toBe( f.fields.t_text.errorClass );
			expect( f.get( 'errorClass', 't_text' ) ).toBe( 'asdfasdfasd' );
		} );

		it( 'defined unexisted properties in `*options` also can be set and get', function () {
			f.set( {'some_undefined_option': 'some_undefined_option_value'}, 't_text' );
			expect( f.get( 'some_undefined_option', 't_text' ) ).toBe( f.fields.t_text.some_undefined_option );
			expect( f.get( 'some_undefined_option', 't_text' ) ).toBe( 'some_undefined_option_value' );
			f.set( {'some_undefined_global_option': 'some_undefined_global_option_value'} );
			expect( f.get( 'some_undefined_global_option' ) ).toBe( f.options.some_undefined_global_option );
			expect( f.get( 'some_undefined_global_option' ) ).toBe( 'some_undefined_global_option_value' );
		} );
	} );


	describe( 'setRules(*rules, *field_name, show_errors)', function () {
		var f;
		beforeEach( function () {
			f = tFormer( 'f', {
				fields: {
					t_text: '*'
				}
			} );
		} );

		it( 'setting property `rules` to defined `field_name`', function () {
			f.setRules( '* @s', 't_text' );
			expect( f.get( 'rules', 't_text' ) ).toBe( '* @s' );
		} );

		it( '`show_errors == false` - setRules and validate form without displaying errors', function () {
			f.setRules( '* @s', 'test_input', false );
			expect( $( f.form.t_text ).hasClass( f.get( 'errorClass', 't_text' ) ) ).toBe( false );
		} );

		it( '`show_errors == true` - setRules, validate form and displaying errors', function () {
			f.setRules( '* @s', 't_text', true );
			expect( $( f.form.t_text ).hasClass( f.get( 'errorClass', 't_text' ) ) ).toBe( true );
		} );

		it( 'set empty `rules` to remove validation rules from `field_name`', function () {
			$( f.form.t_text ).val( 'test' );
			f.setRules( '* @', 't_text' );
			expect( f.validateField( f.form.t_text, true, true ) ).toBe( false );
			f.setRules( '', 't_text' );
			expect( f.validateField( f.form.t_text, true, true ) ).toBe( true );
			expect( f.get( 'rules', 't_text' ) ).toBeUndefined();
		} );
	} );


	describe( 'submitButtonControl( false || true )', function () {
		var f;
		beforeEach( function () {
			f = tFormer( 'f', {
				fields: {
					t_text: '*'
				}
			} );
		} );

		it( 'submitButtonControl(true) is equal to submitButtonOn()', function () {
			f.submitButtonControl( true );
			expect( $( f.get( 'submitButton' ) ).hasClass( f.get( 'disabledClass' ) ) ).toBe( false );
		} );
		it( 'submitButtonControl(false) is equal to submitButtonOff()', function () {
			f.submitButtonControl( false );
			expect( $( f.get( 'submitButton' ) ).hasClass( f.get( 'disabledClass' ) ) ).toBe( true );
		} );
		describe( 'submitButtonOn()', function () {
			it( 'turn on submit button', function () {
				f.submitButtonOn();
				expect( $( f.get( 'submitButton' ) ).hasClass( f.get( 'disabledClass' ) ) ).toBe( false );
			} );
		} );
		describe( 'submitButtonOff()', function () {
			it( 'turn off submit button', function () {
				f.submitButtonOff();
				expect( $( f.get( 'submitButton' ) ).hasClass( f.get( 'disabledClass' ) ) ).toBe( true );
			} );
		} );
	} );


	describe( 'processing(false || true)', function () {
		var f;
		beforeEach( function () {
			f = tFormer( 'f', {
				fields: {
					t_text: '*'
				}
			} );
		} );

		it( 'processing(true) is equal to processingOn()', function () {
			f.processing( true );
			expect( $( f.get( 'submitButton' ) ).hasClass( f.get( 'processingClass' ) ) ).toBe( true );
		} );
		it( 'processing(false) is equal to processingOff()', function () {
			f.processing( false );
			expect( $( f.get( 'submitButton' ) ).hasClass( f.get( 'processingClass' ) ) ).toBe( false );
		} );
		describe( 'processingOn()', function () {
			it( 'turn on processing', function () {
				f.processingOn();
				expect( $( f.get( 'submitButton' ) ).hasClass( f.get( 'processingClass' ) ) ).toBe( true );
			} );
		} );
		describe( 'processingOff()', function () {
			it( 'turn off processing', function () {
				f.processingOff();
				expect( $( f.get( 'submitButton' ) ).hasClass( f.get( 'processingClass' ) ) ).toBe( false );
			} );
		} );
	} );


	describe( 'errorControl( *field, *errors, show_error )', function () {
		var f;
		beforeEach( function () {
			f = tFormer( 'f', {
				fields: {
					t_text: '*'
				}
			} );
		} );

		it( '`errors == []`, no errors in array - field valid', function () {
			f.errorControl( f.form.t_text, [], false );
			expect( $( f.form.t_text ).hasClass( f.get( 'errorClass', 't_text' ) ) ).toBe( false );
			expect( $( f.form.t_text ).data( 'error' ) ).not.toBeDefined();
		} );

		it( '`errors.length > 0 ` - field invalid', function () {
			f.errorControl( f.form.t_text, ['some error'], false );
			expect( $( f.form.t_text ).data( 'error' ) ).toBeDefined();
		} );

		it( '`show_error == true` - displaying errors while validation', function () {
			f.errorControl( f.form.t_text, ['someerror'], true );
			expect( $( f.form.t_text ).hasClass( f.get( 'errorClass', 't_text' ) ) ).toBe( true );
		} );
	} );


	describe( 'execute(*function_name, *this_element, params)', function () {
		var start = 0,
			end = 0,
			req = '';
		var f;
		beforeEach( function () {
			start = 0;
			end = 0;
			req = '';
			f = tFormer( 'f', {
				fields: {
					t_text: {
						requestTimeout: 500,
						rules         : '* request',
						start         : function () {
							start++;
						},
						url           : 'ajax.html',
						method        : 'get',
						end           : function ( result ) {
							req = (result) ? result.toString() : '';
							end++;
							return result;
						}
					}
				}
			} );
		} );

		it( 'executing defined field (or global) function if exist and return it\'s result', function () {
			var result = f.execute( 'end', f.form.t_text, ['whatever'] )
			expect( result ).toBe( 'whatever' );
			expect( end ).toBe( 1 );
		} );
	} );


	describe( 'lock()', function () {
		var f;
		beforeEach( function () {
			f = tFormer( 'f', {
				fields: {
					t_text: '*'
				}
			} );
		} );

		it( 'increment lock parameter', function () {
			expect( f.locked ).toBe( 0 );
			f.lock();
			expect( f.locked ).toBe( 1 );
			f.lock();
			expect( f.locked ).toBe( 2 );
		} );

		it( 'add disabledClass to submit button', function () {
			expect( $( f.get( 'submitButton' ) ).hasClass( f.get( 'disabledClass' ) ) ).toBe( false );
			f.lock();
			expect( $( f.get( 'submitButton' ) ).hasClass( f.get( 'disabledClass' ) ) ).toBe( true );
		} );
	} );


	describe( 'unlock()', function () {
		var f;
		beforeEach( function () {
			f = tFormer( 'f', {
				fields: {
					t_text: '*'
				}
			} );
		} );

		it( 'decrement lock parameter', function () {
			expect( f.locked ).toBe( 0 );
			f.lock();
			expect( f.locked ).toBe( 1 );
			f.unlock();
			expect( f.locked ).toBe( 0 );
		} );

		it( 'remove disabledClass from submit button', function () {
			expect( $( f.get( 'submitButton' ) ).hasClass( f.get( 'disabledClass' ) ) ).toBe( false );
			f.lock();
			expect( $( f.get( 'submitButton' ) ).hasClass( f.get( 'disabledClass' ) ) ).toBe( true );
			f.unlock();
			expect( $( f.get( 'submitButton' ) ).hasClass( f.get( 'disabledClass' ) ) ).toBe( false );
		} );
	} );

	describe( 'init()', function () {
		var f,
			before = 0,
			onerror = 0,
			onvalid = 0;

		beforeEach( function () {
			before = 0;
			onerror = 0;
			onvalid = 0;
			f = tFormer( 'form_destroy', {
				before : function () {
					before++;
				},
				onerror: function () {
					onerror++;
				},
				onvalid: function () {
					onvalid++;
				}
			} );
		} );

		it( 'search check buttons', function () {
			expect( $( f.btn_events[0][0] ).data( 'check' ) ).toBeDefined();
		} );

		it( 'add events to buttons', function () {
			expect( f.btn_events.length ).toBeGreaterThan( 0 );
		} );

		it( 'search submit button', function () {
			expect( f.get( 'submitButton' ).type ).toBe( 'submit' );
		} );

		it( 'add events to fields', function () {
			expect( f.events.test.blur.length ).toBeGreaterThan( 0 );
			expect( f.events.test.keyup.length ).toBeGreaterThan( 0 );
		} );

		it( 'search submit button', function () {
			expect( f.get( 'submitButton' ).type ).toBe( 'submit' );
		} );

		it( 'add dependencyEvent', function () {
			expect( f.events.depended.keyup.length ).toBe( 2 );
			expect( f.events.parent_depender.keyup.length ).toBe( 3 );
		} );

		if ( 'validate form after init, without displaying errors', function () {
			expect( $( f.form.test ).hasClass( f.get( 'errorClass' ) ) ).toBe( false )
			expect( $( f.form.test ).data( 'error' ) ).toBeDefined();
		} );

		if ( 'add new onsubmit function', function () {
			expect( $( f.form.test ).hasClass( f.get( 'errorClass' ) ) ).toBe( false )
			expect( $( f.form.test ).data( 'error' ) ).toBeDefined();
			$( f.get( 'submitButton' ) ).trigger( 'click' );
			expect( $( f.form.test ).hasClass( f.get( 'errorClass' ) ) ).toBe( true );
			expect( $( f.form.test ).data( 'error' ) ).toBeDefined();
		} );
	} );

	describe( 'destroy()', function () {
		var f,
			before = 0,
			onerror = 0,
			onvalid = 0;

		beforeEach( function () {
			before = 0;
			onerror = 0;
			onvalid = 0;
			f = tFormer( 'form_destroy', {
				before : function () {
					before++;
				},
				onerror: function () {
					onerror++;
				},
				onvalid: function () {
					onvalid++;
				}
			} );
		} );

		it( 'Remove events from buttons', function () {
			var b = before;
			var el = f.btn_events[0][0];
			var evnt = f.btn_events[0][1];
			$( el ).trigger( evnt );
			expect( before ).toBe( b + 1 );
			f.destroy();
			$( el ).trigger( evnt );
			//			expect( before ).toBe( b + 1 );
			f.init();
		} );

		it( 'Remove events from fields', function () {
			var b = before;
			var el = f.btn_events[0][0];
			var evnt = f.btn_events[0][1];
			$( el ).trigger( evnt );
			expect( before ).toBe( b + 1 );
			f.destroy();
			$( el ).trigger( evnt );
			expect( before ).toBe( b + 1 );
			f.init();
		} );

		it( 'Remove classes from submitButton', function () {
			f.destroy();
			expect( $( f.get( 'submitButton' ) ).hasClass( f.get( 'disabledClass' ) ) ).toBe( false );
			expect( $( f.get( 'submitButton' ) ).hasClass( f.get( 'processingClass' ) ) ).toBe( false );
			f.init();
		} );

		it( 'Remore all timers', function () {
			f.set( {timeout: 8000} );
			f.fieldTimeout.t_text = setTimeout( function () {
				$( f.validateField( f.form.test, true, true ) );
			}, f.get( 'timeout', 't_text' ) );
			expect( f.fieldTimeout.t_text ).toBeDefined();
			f.destroy();
			expect( f.fieldTimeout.t_text ).toBeUndefined();
			f.init();
		} );

		// remove onsubmit validation function
		it( 'Remove onsubmit function', function () {
			expect( f.form.onsubmit ).toBeDefined();
			f.destroy();
			expect( !f.form.onsubmit ).toBe( true );
			f.init();
			expect( f.form.onsubmit ).toBeDefined();
		} )
	} );

} );