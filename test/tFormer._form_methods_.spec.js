/**
 * Test tFormer Methods
 */

describe( 'tFormer.methods()', function () {


	describe( 'validateForm(event || show_errors)', function () {
		it( 'validateForm() - validating without displaying errors', function () {
			form__validate.setRules( '* @', 'test_input', false );
			form__validate.validateForm();
			expect( $( form__validate.form.test_input ).hasClass( form__validate.get( 'errorClass' ) ) ).toBe( false );
		} );

		it( 'validateForm( true ) - validate form with displaying errors', function () {
			form__validate.setRules( '* @', 'test_input', false );
			form__validate.validateForm( true );
			expect( $( form__validate.form.test_input ).hasClass( form__validate.get( 'errorClass' ) ) ).toBe( true );
		} );
	} );


	describe( 'validateField(that, showError, no_timeout)', function () {
		it( '`that` can be field name string', function () {
			form__validate.form.test_input.value = 'i@tjrus.com';
			expect( form__validate.validateField( form__validate.form.test_input, false, true ) ).toBe( form__validate.validateField( 'test_input', false, true ) );
			form__validate.setRules( '* @', 'test_input', false );
			expect( form__validate.validateField( form__validate.form.test_input, false, true ) ).toBe( form__validate.validateField( 'test_input', false, true ) );
			form__validate.form.test_input.value = 'tjrus.com';
			expect( form__validate.validateField( form__validate.form.test_input, false, true ) ).toBe( form__validate.validateField( 'test_input', false, true ) );
		} );

		it( '`showError == false` - validate without showing the error', function () {
			form__validate.form.test_input.value = 'i@tjrus.com';
			form__validate.setRules( '* @', 'test_input', false );
			form__validate.form.test_input.value = 'tjrus.com';
			expect( form__validate.validateField( form__validate.form.test_input, false, true ) ).toBe( false );
			expect( $( form__validate.form.test_input ).hasClass( form__validate.get( 'errorClass', 'test_input' ) ) ).toBe( false );
		} );

		it( '`showError == true` - validate with displaying errors', function () {
			form__validate.form.test_input.value = 'i@tjrus.com';
			form__validate.setRules( '* @', 'test_input', false );
			form__validate.form.test_input.value = 'tjrus.com';
			expect( form__validate.validateField( form__validate.form.test_input, true, true ) ).toBe( false );
			expect( $( form__validate.form.test_input ).hasClass( form__validate.get( 'errorClass', 'test_input' ) ) ).toBe( true );
		} );

		it( '`no_timeout == true` - disable request validation timeout', function () {
			var end_func = form__request_results.request_end;
			var requestTimeout = form__request.get( 'requestTimeout', 'request' );
			var flag;
			runs( function () {
				form__request.validateField( form__request.form.request, true, true );
				flag = false;
				setTimeout( function () {
					flag = true;
				}, requestTimeout / 5 );
			} );
			waitsFor( function () {
				return flag;
			}, "The Value should be incremented", requestTimeout / 3 );
			runs( function () {
				expect( end_func + 1 ).toBe( form__request_results.request_end );
			} );
		} );
	} )


	describe( 'toObject()', function () {
		it( 'toObject()', function () {
			form__toobject.form.test_input.value = 'test_input_tjrus';
			$( form__toobject.form.test_checkbox ).attr( 'checked', 'checked' );
			form__toobject.form.test_textarea.value = 'test_textarea_tjrus';
			form__toobject.form.test_select.value = 'test_select2';

			var obj = form__toobject.toObject();
			expect( obj.test_input ).toBe( 'test_input_tjrus' );
			expect( obj.test_select ).toBe( 'test_select2' );
			expect( obj.test_checkbox ).toBe( true );
			expect( obj.test_textarea ).toBe( 'test_textarea_tjrus' );
		} );
	} );


	describe( 'get(*option_name, field_name)', function () {
		it( '`field_name == undefined` - return global option', function () {
			expect( form__get.get( 'requestTimeout' ) ).toBe( form__get.options.requestTimeout );
		} );

		it( '`field_name` defined - return fieldname option', function () {
			expect( form__get.get( 'requestTimeout', 'test' ) ).toBe( form__get.fields.test.requestTimeout );
		} );

		it( 'is there is no such options if defined `field_name` - return global option', function () {
			expect( form__get.get( 'errorClass', 'test' ) ).toBe( form__get.get( 'errorClass' ) );
		} );
	} );


	describe( 'set(*options, field_name)', function () {
		it( '`field_name == undefined` - set all options as global', function () {
			form__get.set( {'timeout': 1234} );
			expect( form__get.get( 'timeout' ) ).toBe( form__get.options.timeout );
			expect( form__get.get( 'timeout' ) ).toBe( 1234 );
		} );

		it( '`field_name` defined - set all options to fieldname', function () {
			form__get.set( {'errorClass': 'asdfasdfasd'}, 'test' );
			expect( form__get.get( 'errorClass', 'test' ) ).toBe( form__get.fields.test.errorClass );
			expect( form__get.get( 'errorClass', 'test' ) ).toBe( 'asdfasdfasd' );
		} );

		it( 'defined unexisted properties in `*options` also can be set and get', function () {
			form__get.set( {'some_undefined_option': 'some_undefined_option_value'}, 'test' );
			expect( form__get.get( 'some_undefined_option', 'test' ) ).toBe( form__get.fields.test.some_undefined_option );
			expect( form__get.get( 'some_undefined_option', 'test' ) ).toBe( 'some_undefined_option_value' );
			form__get.set( {'some_undefined_global_option': 'some_undefined_global_option_value'} );
			expect( form__get.get( 'some_undefined_global_option' ) ).toBe( form__get.options.some_undefined_global_option );
			expect( form__get.get( 'some_undefined_global_option' ) ).toBe( 'some_undefined_global_option_value' );
		} );
	} );


	describe( 'setRules(*rules, *field_name, show_errors)', function () {
		it( 'setting property `rules` to defined `field_name`', function () {
			form__toobject.setRules( '* @s', 'test_input' );
			expect( form__toobject.get( 'rules', 'test_input' ) ).toBe( '* @s' );
		} );

		it( '`show_errors == false` - setRules and validate form without displaying errors', function () {
			form__toobject.setRules( '* @s', 'test_input', false );
			expect( $( form__toobject.form.test_input ).hasClass( form__toobject.get( 'errorClass', 'test_input' ) ) ).toBe( false );
		} );

		it( '`show_errors == true` - setRules, validate form and displaying errors', function () {
			form__toobject.setRules( '* @s', 'test_input', true );
			expect( $( form__toobject.form.test_input ).hasClass( form__toobject.get( 'errorClass', 'test_input' ) ) ).toBe( true );
		} );

		it( 'set empty `rules` to remove validation rules from `field_name`', function () {
			$( form__toobject.form.test_input ).val( 'test' );
			form__toobject.setRules( '* @', 'test_input' );
			expect( form__toobject.validateField( form__toobject.form.test_input, true, true ) ).toBe( false );
			form__toobject.setRules( '', 'test_input' );
			expect( form__toobject.validateField( form__toobject.form.test_input, true, true ) ).toBe( true );
			expect( form__toobject.get( 'rules', 'test_input' ) ).toBeUndefined();
		} );
	} );


	describe( 'submitButtonControl( false || true )', function () {
		it( 'submitButtonControl(true) is equal to submitButtonOn()', function () {
			form__request.submitButtonControl( true );
			expect( $( form__request.get( 'submitButton' ) ).hasClass( form__request.get( 'disabledClass' ) ) ).toBe( false );
		} );
		it( 'submitButtonControl(false) is equal to submitButtonOff()', function () {
			form__request.submitButtonControl( false );
			expect( $( form__request.get( 'submitButton' ) ).hasClass( form__request.get( 'disabledClass' ) ) ).toBe( true );
		} );
		describe( 'submitButtonOn()', function () {
			it( 'turn on submit button', function () {
				form__request.submitButtonOn();
				expect( $( form__request.get( 'submitButton' ) ).hasClass( form__request.get( 'disabledClass' ) ) ).toBe( false );
			} );
		} );
		describe( 'submitButtonOff()', function () {
			it( 'turn off submit button', function () {
				form__request.submitButtonOff();
				expect( $( form__request.get( 'submitButton' ) ).hasClass( form__request.get( 'disabledClass' ) ) ).toBe( true );
			} );
		} );
	} );


	describe( 'processing(false || true)', function () {
		it( 'processing(true) is equal to processingOn()', function () {
			form__request.processing( true );
			expect( $( form__request.get( 'submitButton' ) ).hasClass( form__request.get( 'processingClass' ) ) ).toBe( true );
		} );
		it( 'processing(false) is equal to processingOff()', function () {
			form__request.processing( false );
			expect( $( form__request.get( 'submitButton' ) ).hasClass( form__request.get( 'processingClass' ) ) ).toBe( false );
		} );
		describe( 'processingOn()', function () {
			it( 'turn on processing', function () {
				form__request.processingOn();
				expect( $( form__request.get( 'submitButton' ) ).hasClass( form__request.get( 'processingClass' ) ) ).toBe( true );
			} );
		} );
		describe( 'processingOff()', function () {
			it( 'turn off processing', function () {
				form__request.processingOff();
				expect( $( form__request.get( 'submitButton' ) ).hasClass( form__request.get( 'processingClass' ) ) ).toBe( false );
			} );
		} );
	} );


	describe( 'errorControl( *field, *errors, show_error )', function () {
		it( '`errors == []`, no errors in array - field valid', function () {
			form__toobject.errorControl( form__toobject.form.test_input, [], false );
			expect( $( form__toobject.form.test_input ).hasClass( form__toobject.get( 'errorClass', 'test_input' ) ) ).toBe( false );
			expect( $( form__toobject.form.test_input ).data( 'error' ) ).not.toBeDefined();
		} );

		it( '`errors.length > 0 ` - field invalid', function () {
			form__toobject.errorControl( form__toobject.form.test_input, ['some error'], false );
			expect( $( form__toobject.form.test_input ).data( 'error' ) ).toBeDefined();
		} );

		it( '`show_error == true` - displaying errors while validation', function () {
			form__toobject.errorControl( form__toobject.form.test_input, ['someerror'], true );
			expect( $( form__toobject.form.test_input ).hasClass( form__toobject.get( 'errorClass', 'test_input' ) ) ).toBe( true );
		} );
	} );


	describe( 'execute(*function_name, *this_element, params)', function () {
		it( 'executing defined field (or global) function if exist and return it\'s result', function () {
			var stats_request = form__request_results.request_end;
			var result = form__request.execute( 'end', form__request.form.request, ['whatever'] )
			expect( result ).toBe( 'whatever' );
			expect( stats_request + 1 ).toBe( form__request_results.request_end );
		} );
	} );


	describe( 'lock()', function () {
		it( 'increment lock parameter', function () {
			expect( form__request.locked ).toBe( 0 );
			form__request.lock();
			expect( form__request.locked ).toBe( 1 );
			form__request.lock();
			expect( form__request.locked ).toBe( 2 );
			form__request.unlock();
			form__request.unlock();
		} );

		it( 'add disabledClass to submit button', function () {
			expect( $( form__request.get( 'submitButton' ) ).hasClass( form__request.get( 'disabledClass' ) ) ).toBe( false );
			form__request.lock();
			expect( $( form__request.get( 'submitButton' ) ).hasClass( form__request.get( 'disabledClass' ) ) ).toBe( true );
			form__request.unlock();
		} );
	} );


	describe( 'unlock()', function () {
		it( 'decrement lock parameter', function () {
			expect( form__request.locked ).toBe( 0 );
			form__request.lock();
			expect( form__request.locked ).toBe( 1 );
			form__request.unlock();
			expect( form__request.locked ).toBe( 0 );
		} );

		it( 'remove disabledClass from submit button', function () {
			expect( $( form__request.get( 'submitButton' ) ).hasClass( form__request.get( 'disabledClass' ) ) ).toBe( false );
			form__request.lock();
			expect( $( form__request.get( 'submitButton' ) ).hasClass( form__request.get( 'disabledClass' ) ) ).toBe( true );
			form__request.unlock();
			expect( $( form__request.get( 'submitButton' ) ).hasClass( form__request.get( 'disabledClass' ) ) ).toBe( false );
		} );
	} );

	describe( 'init()', function () {
		it( 'search check buttons', function () {
			expect( $( form__destroy.btn_events[0][0] ).data( 'check' ) ).toBeDefined();
		} );

		it( 'add events to buttons', function () {
			expect( form__destroy.btn_events.length ).toBeGreaterThan( 0 );
		} );

		it( 'search submit button', function () {
			expect( form__destroy.get( 'submitButton' ).type ).toBe( 'submit' );
		} );

		it( 'add events to fields', function () {
			expect( form__destroy.events.test.blur.length ).toBeGreaterThan( 0 );
			expect( form__destroy.events.test.keyup.length ).toBeGreaterThan( 0 );
		} );

		it( 'search submit button', function () {
			expect( form__destroy.get( 'submitButton' ).type ).toBe( 'submit' );
		} );

		it( 'add dependencyEvent', function () {
			expect( form__destroy.events.depended.keyup.length ).toBe( 2 );
			expect( form__destroy.events.parent_depender.keyup.length ).toBe( 3 );
		} );

		if ( 'validate form after init, without displaying errors', function () {
			expect( $( form__destroy.form.test ).hasClass( form__destroy.get( 'errorClass' ) ) ).toBe( false )
			expect( $( form__destroy.form.test ).data( 'error' ) ).toBeDefined();
		} );

		if ( 'add new onsubmit function', function () {
			expect( $( form__destroy.form.test ).hasClass( form__destroy.get( 'errorClass' ) ) ).toBe( false )
			expect( $( form__destroy.form.test ).data( 'error' ) ).toBeDefined();
			$( form__destroy.get( 'submitButton' ) ).trigger( 'click' );
			expect( $( form__destroy.form.test ).hasClass( form__destroy.get( 'errorClass' ) ) ).toBe( true );
			expect( $( form__destroy.form.test ).data( 'error' ) ).toBeDefined();
		} );
	} );

	describe( 'destroy()', function () {
		it( 'Remove events from buttons', function () {
			var before = form__destroy_results.before;
			var el = form__destroy.btn_events[0][0];
			var evnt = form__destroy.btn_events[0][1];
			$( el ).trigger( evnt );
			expect( form__destroy_results.before ).toBe( before + 1 );
			form__destroy.destroy();
			$( el ).trigger( evnt );
			form__destroy.init();
		} );

		it( 'Remove events from fields', function () {
			var before = form__destroy_results.before;
			var el = form__destroy.btn_events[0][0];
			var evnt = form__destroy.btn_events[0][1];
			$( el ).trigger( evnt );
			expect( form__destroy_results.before ).toBe( before + 1 );
			form__destroy.destroy();
			$( el ).trigger( evnt );
			expect( form__destroy_results.before ).toBe( before + 1 );
			form__destroy.init();
		} );

		it( 'Remove classes from submitButton', function () {
			form__destroy.destroy();
			expect( $( form__destroy.get( 'submitButton' ) ).hasClass( form__destroy.get( 'disabledClass' ) ) ).toBe( false );
			expect( $( form__destroy.get( 'submitButton' ) ).hasClass( form__destroy.get( 'processingClass' ) ) ).toBe( false );
			form__destroy.init();
		} );

		it( 'Remore all timers', function () {
			form__destroy.set( {timeout: 8000} );
			form__destroy.fieldTimeout.test = setTimeout( function () {
				$( form__destroy.validateField( form__destroy.form.test, true, true ) );
			}, form__destroy.get( 'timeout', 'test' ) );
			expect( form__destroy.fieldTimeout.test ).toBeDefined();
			form__destroy.destroy();
			expect( form__destroy.fieldTimeout.test ).toBeUndefined();
			form__destroy.init();
		} );

		// remove onsubmit validation function
		it( 'Remove onsubmit function', function () {
			expect( form__destroy.form.onsubmit ).toBeDefined();
			form__destroy.destroy();
			expect( !form__destroy.form.onsubmit ).toBe(true);
			form__destroy.init();
			expect( form__destroy.form.onsubmit ).toBeDefined();
		} )
	} );

} )
;