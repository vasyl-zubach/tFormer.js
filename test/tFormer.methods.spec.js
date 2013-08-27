/**
 * Test tFormer Methods
 */

describe( 'Methods : ', function () {


	describe( 'define `new tFormer(formID, options)`', function () {
		it( 'can be defined without new', function () {
			var f1 = new tFormer( 'f' );
			expect( f1 instanceof tFormer ).toBeTruthy();

			var f2 = tFormer( 'f' );
			expect( f2 instanceof tFormer ).toBeTruthy();
		} );

		it( 'caching all inited forms in tFormer.cache', function () {
			var f = tFormer( 'f' );
			expect( f.cache.length > 0 ).toBeTruthy();
		} );
	} );

	describe( 'init()', function () {
		var f = tFormer( 'f' );

		beforeEach( function () {
			f.drop();
		} );

		it( ' - initializing tFormer', function () {
			expect( f.inited ).toBeTruthy();
		} );
	} );


	describe( 'destroy()', function () {
		var f = tFormer( 'f' );
		var f_test = f.field( 't_text' );
		beforeEach( function () {
			f.drop();
			f_test = f.field( 't_text' );
		} );

		it( ' - remove errorClass (and data-error) from fields', function () {
			f_test.el.value = '';
			f_test.setRules( '*' );
			expect( f_test.hasClass( f_test.get( 'errorClass' ) ) ).toBeTruthy();
			expect( f_test.hasClass( f_test.get( 'errorClass' ) ) ).toBeTruthy();
			f.destroy();
			expect( f_test.hasClass( f_test.get( 'errorClass' ) ) ).not.toBeTruthy();
		} );

		it( ' - remove disabledClass from submit button', function () {
			f_test.el.value = '';
			f_test.setRules( '*' );
			expect( f_test.hasClass( f_test.get( 'errorClass' ) ) ).toBeTruthy();
			f.destroy();
			expect( f_test.hasClass( f_test.get( 'errorClass' ) ) ).not.toBeTruthy();
		} );
	} );


	describe( 'validate()', function () {
		var f = tFormer( 'f' );

		beforeEach( function () {
			f.destroy().init();
		} );

		it( 'validate() - whole form and returns is form valid or not', function () {
			expect( f.field( 't_text' ).setRules( '* @' ).validate() ).toBe( false );
		} );


		it( 'validate( field_name ) - whole defined field and returns is form valid or not', function () {
			expect( f.field( 't_text' ).setRules( '* @' ).validate() ).toBe( false );
		} );

		it( 'validate( { highlight: false } ) - validating whole form without displaying errors', function () {
			expect( $( f.field( 't_text' ).setRules( '* @', {highlight: false} ).field ).hasClass( f.field( 't_text' ).get( 'errorClass' ) ) ).toBe( false );
		} );
	} );


	describe( 'toObject()', function () {
		var f = tFormer( 'f' );
		beforeEach( function () {
			f.destroy().init();
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
		var f = tFormer( 'f' );
		beforeEach( function () {
			f.destroy().init();
		} );

		it( '`field_name == undefined` - return global option', function () {
			expect( f.get( 'requestTimeout' ) ).toBe( f.config.requestTimeout );
		} );

		it( '`field_name` defined - return fieldname option', function () {
			expect( f.get( 'requestTimeout', 't_text' ) ).toBe( f.field( 't_text' ).get( 'requestTimeout' ) );
		} );
	} );


	describe( 'set(*options, field_name)', function () {
		var f = tFormer( 'f' );
		beforeEach( function () {
			f.drop();
		} );

		it( '`field_name == undefined` - set all options as global', function () {
			f.set( { timeout: 1234, requestTimeout: 4321 } );
			expect( f.get( 'timeout' ) ).toBe( f.config.timeout );
			expect( f.get( 'timeout' ) ).toBe( 1234 );
			expect( f.get( 'requestTimeout' ) ).toBe( f.config.requestTimeout );
			expect( f.get( 'requestTimeout' ) ).toBe( 4321 );
		} );

		it( '`field_name` defined - set all options to fieldname', function () {
			f.field( 't_text' ).set( {'errorClass': 'asdfasdfasd'} );
			expect( f.field( 't_text' ).get( 'errorClass' ) ).toBe( f.field( 't_text' ).get( 'errorClass' ) );
			expect( f.field( 't_text' ).get( 'errorClass' ) ).toBe( 'asdfasdfasd' );
			f.field( 't_text' ).set( {'errorClass': 'error'} );
		} );

	} );


	describe( 'setRules(*rules, *field_name, options)', function () {
		var f = tFormer( 'f' );
		beforeEach( function () {
			f.drop();
		} );

		it( 'setting property `rules` to defined `field_name`', function () {
			f.field( 't_text' ).setRules( '* @s' );
			expect( f.field( 't_text' ).get( 'rules' ) ).toBe( '* @s' );
		} );

		it( '`options = {hoghlight: false}` - setRules and validate form without displaying errors', function () {
			f.field( 't_text' ).setRules( '* @s', {highlight: false} );
			expect( $( f.fields.t_text.field ).hasClass( f.field( 't_text' ).get( 'errorClass' ) ) ).toBe( false );
		} );

		it( '`{highlight: true}` - by default', function () {
			expect( f.field( 't_text' ).setRules( '* @s' ).hasClass( f.field( 't_text' ).get( 'errorClass' ) ) ).toBe( true );
		} );

		it( 'set empty `rules` to remove validation rules from `field_name`', function () {
			f.field( 't_text' ).el.value = 'test';
			expect( f.field( 't_text' ).setRules( '* @' ).valid ).toBe( false );
			expect( f.field( 't_text' ).setRules( '' ).valid ).toBe( true );
		} );
	} );


	describe( 'submit button control', function () {
		var f = tFormer( 'f' );
		var sb = f.button( 'submit' );
		beforeEach( function () {
			f.drop();
			sb = f.button( 'submit' );
		} );

		it( 'submitEnable() - turn on submit button', function () {
			f.submitEnable();
			expect( sb.hasClass( sb.get( 'disabledClass' ) ) ).toBe( false );
		} );

		it( 'submitControl(true) is equal to submitEnable()', function () {
			f.submitControl( true );
			expect( sb.hasClass( sb.get( 'disabledClass' ) ) ).toBe( false );
		} );

		it( 'submitDisable() - turn off submit button', function () {
			f.submitDisable();
			expect( sb.hasClass( sb.get( 'disabledClass' ) ) ).toBe( true );
		} );

		it( 'submitControl(false) is equal to submitDisable()', function () {
			f.submitControl( false );
			expect( sb.hasClass( sb.get( 'disabledClass' ) ) ).toBe( true );
		} );
	} );


	describe( 'processing( true / false )', function () {
		var f = tFormer( 'f' );
		var sb = f.button( 'submit' );
		var f_text = f.field( 't_text' );
		beforeEach( function () {
			f.drop();
			sb = f.button( 'submit' );
			f_text = f.field( 't_text' );
		} );

		it( 'processing( true ) - add processing class to button', function () {
			expect( sb.hasClass( sb.get( 'processingClass' ) ) ).toBe( false );
			sb.processing( true );
			expect( sb.hasClass( sb.get( 'processingClass' ) ) ).toBe( true );
		} );
		it( 'processing( true ) - add processing class to field', function () {
			expect( $( f_text.field ).hasClass( f_text.get( 'processingClass' ) ) ).toBe( false );
			f_text.processing( true );
			expect( f_text.hasClass( f_text.get( 'processingClass' ) ) ).toBe( true );
		} );

		it( 'processing( false ) - remove processing class from button', function () {
			sb.processing( true );
			expect( sb.hasClass( sb.get( 'processingClass' ) ) ).toBe( true );
			sb.processing( false );
			expect( sb.hasClass( sb.get( 'processingClass' ) ) ).toBe( false );
		} );
		it( 'processing( false ) - remove processing class from field', function () {
			f_text.processing( true );
			expect( f_text.hasClass( f_text.get( 'processingClass' ) ) ).toBe( true );
			f_text.processing( false );
			expect( f_text.hasClass( f_text.get( 'processingClass' ) ) ).toBe( false );
		} );
	} );


	describe( 'error control', function () {
		var f = tFormer( 'f' );
		var f_text = f.field( 't_text' );
		beforeEach( function () {
			f.drop();
			f_text = f.field( 't_text' );
		} );

		it( 'error( true ) add errorClass to field', function () {
			expect( f_text.error( true ).hasClass( f_text.get( 'errorClass' ) ) ).toBe( true );
			expect( f_text.error( false ).el.getAttribute( 'data-error' ) ).toBeDefined();
		} );

		it( 'error( false ) remove errorClass from field', function () {
			expect( f_text.error( false ).hasClass( f_text.get( 'errorClass' ) ) ).toBe( false );
			expect( f_text.error( false ).el.getAttribute( 'data-error' ) ).toBe( null );
		} );
	} );

	describe( 'lock()', function () {
		var f = tFormer( 'f' );
		var sb = f.button( 'submit' );
		beforeEach( function () {
			f.drop();
			sb = f.button( 'submit' );
		} );

		it( 'increment lock parameter', function () {
			expect( f.locked ).toBe( 0 );
			f.lock();
			expect( f.locked ).toBe( 1 );
			f.lock();
			expect( f.locked ).toBe( 2 );
		} );

		it( 'add disabledClass to submit button', function () {
			expect( f.locked ).toBe( 0 );
			expect( sb.enable().hasClass( sb.get( 'disabledClass' ) ) ).toBe( false );
			f.lock();
			expect( sb.hasClass( sb.get( 'disabledClass' ) ) ).toBe( true );
		} );
	} );

	describe( 'unlock()', function () {
		var f = tFormer( 'f' );
		var sb = f.button( 'submit' );
		beforeEach( function () {
			f.drop();
			sb = f.button( 'submit' );
		} );

		it( 'decrement lock parameter', function () {
			expect( f.locked ).toBe( 0 );
			f.lock();
			expect( f.locked ).toBe( 1 );
			f.unlock();
			expect( f.locked ).toBe( 0 );
		} );

		it( 'remove disabledClass from submit button', function () {
			expect( f.locked ).toBe( 0 );
			expect( sb.enable().hasClass( sb.get( 'disabledClass' ) ) ).toBe( false );
			f.lock();
			expect( sb.hasClass( sb.get( 'disabledClass' ) ) ).toBe( true );

			f.unlock();
			// TODO: valid form check
			//			expect( $( sb.button ).hasClass( sb.get( 'disabledClass' ) ) ).toBe( false );
		} );
	} );


	xdescribe( 'init()', function () {
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

		it( 'validate form after init, without displaying errors', function () {
			expect( $( f.form.test ).hasClass( f.get( 'errorClass' ) ) ).toBe( false )
			expect( $( f.form.test ).data( 'error' ) ).toBeDefined();
		} );

		it( 'add new onsubmit function', function () {
			expect( $( f.form.test ).hasClass( f.get( 'errorClass' ) ) ).toBe( false )
			expect( $( f.form.test ).data( 'error' ) ).toBeDefined();
			$( f.get( 'submitButton' ) ).trigger( 'click' );
			expect( $( f.form.test ).hasClass( f.get( 'errorClass' ) ) ).toBe( true );
			expect( $( f.form.test ).data( 'error' ) ).toBeDefined();
		} );
	} );

	xdescribe( 'destroy()', function () {
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