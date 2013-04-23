/**
 * Test Validation Process stuff
 */
describe( 'Validation process stuff', function () {

	it( 'fields with errors in validation receives errorClass in their className', function () {
		form__process.setRules( '* @', 'test', true );
		expect( $( form__process.form.test ).hasClass( form__process.get( 'errorClass', 'test' ) ) ).toBe( true );
	} );

	it( 'before function executed every time before validation', function () {
		expect( form__process_results.before[0] ).not.toBe( 0 );
	} );

	it( '`this` in before function is current validating field', function () {
		form__process.validateField( 'test', true, true );
		expect( form__process.form.test ).toBe( form__process_results.before[1] );
	} );

	it( 'onerror function executed every time when field fails validation', function () {
		expect( form__process_results.onerror[0] ).not.toBe( 0 );
	} );

	it( '`this` in onerror function is current validating field', function () {
		form__process.validateField( 'test', true, true );
		expect( form__process.form.test ).toBe( form__process_results.onerror[1] );
	} );


	it( 'onvalid function executed every time when field passes validation', function () {
		$( form__process.form.test ).val( 'some@value.com' );
		form__process.setRules( '*', 'test', true );
		form__process.validateField( form__process.form.test, true, true );
		expect( form__process_results.onvalid[0] ).not.toBe( 0 );
	} );

	it( '`this` in onvalid function is current validating field', function () {
		expect( form__process.form.test ).toBe( form__process_results.onvalid[1] );
	} );

	it( 'on `blur` event field will be validated immediately without `timeout` and `requestTimeout`', function () {
		form__process.set( {'timeout': 2000, requestTimeout: 8000 } );
		$( form__process.form.test ).focus().val( '12' ).trigger( 'keyup' ).blur();
		expect( $( form__process.form.test ).hasClass( form__process.get( 'errorClass' ) ) ).toBe( false );
		$( form__process.form.test ).focus().val( '' ).trigger( 'keyup' ).blur();
		expect( $( form__process.form.test ).hasClass( form__process.get( 'errorClass' ) ) ).toBe( true );
		form__process.set( {'timeout': 0} );
	} );


	describe( 'Request validation: ', function () {

		it( 'fields with request validation is holded for validation (data-holded="1")', function () {
			var flag = false;
			runs( function () {
				setTimeout( function () {
					flag = true;
				}, 250 );
			} )
			waitsFor( function () {
				return flag;
			} )
			runs( function () {
				expect( $( form__process.form.request ).data( 'holded' ) ).not.toBeDefined();
				form__process.form.request.value = 'request_value';
				form__process.setRules( '* request', 'request', true );
				expect( $( form__process.form.request ).data( 'holded' ) ).toBe( 1 );
			} );
		} );

		it( 'request start function called', function () {
			expect( form__process_results.fields.request.start[0] ).not.toBe( 0 );
		} );

		it( 'request end function called', function () {
			var test = null;
			waitsFor( function () {
				test = (form__process_results.fields.request.end[0]) ? true : false;
				return test;
			}, "The result should be returned", 750 );
			runs( function () {
				expect( test ).toBe( true );
			} );
		} );

		it( '`this` in request end function is current field', function () {
			expect( form__process.form.request ).toBe( form__process_results.fields.request.end[1] );
		} );

		it( 'validation result depends on what request function returns', function () {
			var end_executed = false;
			runs( function () {
				form__process.set( {
					end: function ( result ) {
						end_executed = true;
						return true;
					}
				}, 'request' );
				form__process.validateField( 'request', true, true );
			} );
			waitsFor( function () {
				return end_executed;
			}, "end should be executed", 500 );
			runs( function () {
				expect( $( form__process.form.request ).hasClass( form__process.get( 'errorClass' ) ) ).toBe( false );
			} );

			var end_executed2 = false;
			runs( function () {
				form__process.set( {
					end: function ( result ) {
						end_executed2 = true;
						return false;
					}
				}, 'request' );
				form__process.validateField( 'request', true, true );
			} );
			waitsFor( function () {
				return end_executed2;
			}, "end should be executed", 500 );
			runs( function () {
				expect( $( form__process.form.request ).hasClass( form__process.get( 'errorClass' ) ) ).toBe( true );
			} );

		} );
	} );
} );