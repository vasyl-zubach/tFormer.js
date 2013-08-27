/**
 * Test Validation Process stuff
 */
describe( 'UI, UX', function (){


	it( 'timeout works fine', function (){
		var f = tFormer( 'f', {
			timeout: 2000
		} );
		// console.log(f.get('timeout'));
	} );

	// TODO: blur validation without timeout

	// TODO: validation with timeout still disable the submit button

	// TODO: request validation

	describe( 'Events:', function (){
		var f = tFormer( 'f' );
		it( f.get( 'eventBefore' ), function (){
			var eventBefore_count = 0;
			$( f.field( 't_text' ).el ).on( f.field( 't_text' ).get( 'eventBefore' ), function (){
				eventBefore_count++;
			} );
			f.field( 't_text' ).setRules( '*' );
			expect( eventBefore_count ).not.toBe( 0 );
			$( f.field( 't_text' ).el ).off( f.field( 't_text' ).get( 'eventBefore' ) )
		} );

		it( f.get( 'eventValid' ), function (){
			var eventValid_count = 0;
			$( f.field( 't_text' ).el ).on( f.field( 't_text' ).get( 'eventValid' ), function (){
				eventValid_count++;
			} );
			f.field( 't_text' ).setRules( '*' );
			expect( eventValid_count ).not.toBe( 0 );
			$( f.field( 't_text' ).el ).off( f.field( 't_text' ).get( 'eventValid' ) )
		} );

		it( f.get( 'eventError' ), function (){
			var eventError_count = 0;
			$( f.field( 't_text' ).el ).on( f.field( 't_text' ).get( 'eventError' ), function (){
				eventError_count++;
			} );
			var test = f.field( 't_text' ).el.value;
			f.field( 't_text' ).el.value = '';
			f.field( 't_text' ).setRules( '*' );
			expect( eventError_count ).not.toBe( 0 );
			f.field( 't_text' ).el.value = test;
			$( f.field( 't_text' ).el ).off( f.field( 't_text' ).get( 'eventError' ) )
		} );
	} );

	describe( 'Event functions:', function (){

		describe( 'before', function (){
			var f = tFormer( 'f' ),
				order = [],
				before_this;

			f.field( 't_text' ).set( {
				before: function (){
					order.push( 'before' );
					before_this = this;
				},
				own   : function (){
					order.push( 'validate' );
					return 'own_changed';
				}
			} );
			order = [];
			f.validate();

			it( ' - executed just before field validation function', function (){
				expect( order[0] ).toBe( 'before' );
			} );

			it( ' - context is [object HTMLInputElement] ', function (){
				f.validate();
				expect( before_this ).toBe( f.field( 't_text' ).el );
			} );
		} );

		describe( 'onerror', function (){
			var onerror_counter = 0,
				onerror_this,
				f = tFormer( 'f' );

			beforeEach( function (){
				onerror_counter = 0;
			} );

			it( ' - executed when field validation fails ', function (){
				expect( onerror_counter ).toBe( 0 );

				f.field( 't_text' ).set( {
					rules  : '* @',
					onerror: function (){
						onerror_this = this;
						return onerror_counter++;
					}
				} );

				f.validate();
				expect( onerror_counter ).toBe( 1 );
				f.validate();
				expect( onerror_counter ).toBe( 2 );
			} );

			it( ' - if field is valid - function would not be executed', function (){
				expect( onerror_counter ).toBe( 0 );
				f.field( 't_text' ).el.value = 'asdf';
				f.field( 't_text' ).set( {
					rules  : '*',
					onerror: function (){
						onerror_this = this;
						return onerror_counter++;
					}
				} );
				expect( onerror_counter ).toBe( 0 );
			} );

			it( ' - context is [object HTMLInputElement] ', function (){
				expect( onerror_this ).toBe( f.field( 't_text' ).el );
			} );
		} );

		describe( 'onvalid', function (){
			var onvalid_counter = 0,
				onvalid_this,
				f = tFormer( 'f' );

			beforeEach( function (){
				f.drop();
				onvalid_counter = 0;
			} );

			it( ' - executed when validation passed', function (){
				expect( onvalid_counter ).toBe( 0 );

				f.field( 't_text' ).el.value = 'asdf';
				f.field( 't_text' ).set( {
					rules  : '*',
					onvalid: function (){
						onvalid_this = this;
						onvalid_counter++;
					}
				} );
				f.validate();
				expect( onvalid_counter ).toBe( 1 );
				f.validate();
				expect( onvalid_counter ).toBe( 2 );
			} );

			it( ' - if field is not valid - function would not be executed', function (){
				expect( onvalid_counter ).toBe( 0 );
				f.field( 't_text' ).set( {
					rules  : '* @',
					onvalid: function (){
						onvalid_this = this;
						return onvalid_counter++;
					}
				} );
				f.validate();
				expect( onvalid_counter ).toBe( 0 );
			} );

			it( ' - context is [object HTMLInputElement] ', function (){
				expect( onvalid_this ).toBe( f.field( 't_text' ).el );
			} );
		} );
	} );


	describe( 'submit button', function (){
		it( ' - find submit button if not defined in options', function (){
			var f = tFormer( 'f' );
			expect( f.button( 'submit' ) ).toBeDefined();
		} );

		it( ' - if submit button defined in options or later by set() method', function (){
			var f_sb_not_button = tFormer( 'f_sb_not_button', {
				submitButton: $( '#f_sb_not_button .submit' )[0]
			} );
			expect( f_sb_not_button.button( 'submit' ).el ).toBe( $( '#f_sb_not_button .submit' )[0] );
		} );

		it( ' - if form has no submit button by default, it still works fine', function (){
			var f_no_sb = tFormer( 'f_no_sb' );
			expect( f_no_sb.button( 'submit' ) ).not.toBeDefined();
		} );
	} );

	describe( 'check buttons', function (){
		var f = tFormer( 'f' ),
			check = f.button( 't_checkbox' );

		it( ' - find automatically by data-check attribute', function (){
			expect( check ).toBeDefined();
		} );

		it( ' - validate depended field by click', function (){
			var test = 0;
			f.field( 't_checkbox' ).set( {
				rules : '*',
				before: function (){
					test++;
				}
			} );
			test = 0;
			check.trigger( 'click' );
			expect( test ).toBe( 1 );
		} );
	} );
} );
