describe( "tFormer options: ", function () {


	describe( 'timeout', function () {
		it( '`timeout = 0` by default', function () {
			expect( form__defaults.get( 'timeout' ) ).toBe( 0 );
		} );

		it( 'can be changed with options when defining form', function () {
			expect( form__defaults_edited.get( 'timeout' ) ).not.toBe( form__defaults.get( 'timeout' ) );
		} );

		it( 'can be changed with set() function', function () {
			form__defaults_edited.set( {'timeout': 123} );
			expect( form__defaults_edited.get( 'timeout' ) ).toBe( 123 );
		} );
	} );


	describe( 'requestTimeout', function () {
		it( '`requestTimeout = 2000` by default', function () {
			expect( form__defaults.get( 'requestTimeout' ) ).toBe( 2000 );
		} );

		it( 'can be changed with options when defining form', function () {
			expect( form__defaults_edited.get( 'requestTimeout' ) ).not.toBe( form__defaults.get( 'requestTimeout' ) );
		} );

		it( 'can be changed with set() function', function () {
			form__defaults_edited.set( {'requestTimeout': 1223} );
			expect( form__defaults_edited.get( 'requestTimeout' ) ).toBe( 1223 );
		} );
	} );


	describe( 'errorClass', function () {
		it( '`errorClass = \'error\'` by default', function () {
			expect( form__defaults.get( 'errorClass' ) ).toBe( 'error' );
		} );

		it( 'can be changed with options when defining form', function () {
			expect( form__defaults_edited.get( 'errorClass' ) ).not.toBe( form__defaults.get( 'errorClass' ) );
		} );

		it( 'can be changed with set() function', function () {
			form__defaults_edited.set( {'errorClass': 'asdf'} );
			expect( form__defaults_edited.get( 'errorClass' ) ).toBe( 'asdf' );
		} );
	} );


	describe( 'processingClass', function () {
		it( '`processingClass = \'processing\'` by default', function () {
			expect( form__defaults.get( 'processingClass' ) ).toBe( 'processing' );
		} );

		it( 'can be changed with options when defining form', function () {
			expect( form__defaults_edited.get( 'processingClass' ) ).not.toBe( form__defaults.get( 'processingClass' ) );
		} );

		it( 'can be changed with set() function', function () {
			form__defaults_edited.set( {'processingClass': 'asdf'} );
			expect( form__defaults_edited.get( 'processingClass' ) ).toBe( 'asdf' );
		} );
	} );


	describe( 'disabledClass', function () {
		it( '`disabledClass = \'disabled\'` by default', function () {
			expect( form__defaults.get( 'disabledClass' ) ).toBe( 'disabled' );
		} );

		it( 'can be changed with options when defining form', function () {
			expect( form__defaults_edited.get( 'disabledClass' ) ).not.toBe( form__defaults.get( 'disabledClass' ) );
		} );

		it( 'can be changed with set() function', function () {
			form__defaults_edited.set( {'disabledClass': 'asdf'} );
			expect( form__defaults_edited.get( 'disabledClass' ) ).toBe( 'asdf' );
		} );
	} );


	describe( 'validateEvent', function () {
		it( '`validateEvent = \'input keyup\'` by default', function () {
			expect( form__defaults.get( 'validateEvent' ) ).toBe( 'input keyup' );
		} );

		it( 'can be changed with options when defining form', function () {
			expect( form__defaults_edited.get( 'validateEvent' ) ).not.toBe( form__defaults.get( 'validateEvent' ) );
		} );

		it( 'can be changed with set() function', function () {
			form__defaults_edited.set( {'validateEvent': 'change'} );
			expect( form__defaults_edited.get( 'validateEvent' ) ).toBe( 'change' );
		} );
	} );


	describe( 'submitButtonControl', function () {
		it( '`submitButtonControl = true` by default', function () {
			expect( form__defaults.get( 'submitButtonControl' ) ).toBe( true );
		} );

		it( 'can be changed with options when defining form', function () {
			expect( form__defaults_edited.get( 'submitButtonControl' ) ).not.toBe( form__defaults.get( 'validateEvent' ) );
		} );

		it( 'can be changed with set() function', function () {
			form__defaults_edited.set( {'submitButtonControl': true} );
			expect( form__defaults_edited.get( 'submitButtonControl' ) ).toBe( true );
		} );
	} );


	describe( 'submitButton', function () {
		it( '`submitButton == null` by default', function () {
			expect( form__defaults.get( 'submitButton' ) ).toBe( null );
		} );

		it( 'can be changed with options when defining form', function () {
			expect( form__defaults_edited.get( 'submitButton' ) ).not.toBe( null );
		} );

		it( 'if not defined in options - tFormer will try to find it inside the form', function () {
			expect( form__submit_button.get( 'submitButton' ) ).toBeDefined();
			expect( form__submit_button.get( 'submitButton' ).type ).toBe( 'submit' );
		} );
	} );


	describe( 'fields', function () {
		it( '`{}`, empty object by default', function () {
			var key_it = 0;
			var fields = form__defaults.fields;
			for ( var key in fields ) {
				if ( fields.hasOwnProperty( key ) ) {
					key_it++;
				}
			}
			expect( key_it ).toBe( 0 );
		} );
		it( 'filled with options.fields', function () {
			var fields = form__toobject.fields;
			for ( var key in fields ) {
				if ( fields.hasOwnProperty( key ) ) {
					expect( form__toobject.form[key] ).toBeDefined();
				}
			}
		} );
		it( 'and also filled with more options in cycle', function () {
			var fields = form__toobject.fields;
			for ( var key in fields ) {
				if ( fields.hasOwnProperty( key ) ) {
					expect( fields[key].name ).toBeDefined();
					expect( fields[key].type ).toBeDefined();
				}
			}
		} );
	} );

} );