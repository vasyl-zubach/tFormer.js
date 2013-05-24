describe( "Test Validator (_v_) methods", function () {


	describe( '`*`, Required', function () {
		it( 'field should not be empty', function () {
			expect( new _v_( '1' ).validateWithRules( '*' ) ).toBe( true );
			expect( new _v_( '' ).validateWithRules( '*' ) ).toBe( false );
		} );
	} );


	describe( '`a`, isAlpha():', function () {
		it( 'should contain only a-zA-Z symbols', function () {
			var test = ('ABCDEFGHIJKLMNOPQRSTUVWXYZ' + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.toLowerCase()).split( '' );

			for ( var i = 0; i < 100; i++ ) {
				var length = Math.floor( Math.random() * 100 );
				var str = 'A';
				for ( var j = 0; j < length; j++ ) {
					var symbol = Math.floor( Math.random() * test.length - 5 );
					str += test[symbol];
				}
				expect( new _v_( str ).isAlpha() ).toBe( true );
				expect( new _v_( str ).validateWithRules( 'a' ) ).toBe( true );
			}
		} );
	} );


	describe( '`a1`, isAlphaNumeric():', function () {
		it( 'can contain symbols and numbers', function () {
			var test = ('ABCDEFGHIJKLMNOPQRSTUVWXYZ' + '0123456789' + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.toLowerCase()).split( '' );

			for ( var i = 0; i < 100; i++ ) {
				var length = Math.floor( Math.random() * 100 );
				var str = 'A';
				for ( var j = 0; j < length; j++ ) {
					var symbol = Math.floor( Math.random() * test.length - 5 );
					str += test[symbol];
				}
				expect( new _v_( str ).isAlphaNumeric() ).toBe( true );
				expect( new _v_( str ).validateWithRules( 'a1' ) ).toBe( true );
			}
		} );
	} );


	describe( '`a_`, isAlphaDash():', function () {
		it( 'can contain A-Za-z and _ symbol', function () {
			var test = ('ABCDEFGHIJKLMNOPQRSTUVWXYZ' + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.toLowerCase()).split( '' ).join( '_' ).split( '' );

			for ( var i = 0; i < 100; i++ ) {
				var length = Math.floor( Math.random() * 100 );
				var str = 'A';
				for ( var j = 0; j < length; j++ ) {
					var symbol = Math.floor( Math.random() * test.length - 5 );
					str += test[symbol];
				}
				expect( new _v_( str ).isAlphaDash() ).toBe( true );
				expect( new _v_( str ).validateWithRules( 'a_' ) ).toBe( true );
			}
		} );
	} );


	describe( '`a1_`, isAlphaNumDash():', function () {
		it( 'can contain A-Za-z and _ symbol', function () {
			var test = ('ABCDEFGHIJKLMNOPQRSTUVWXYZ' + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.toLowerCase()).split( '' ).join( '_' ).split( '' );

			for ( var i = 0; i < 100; i++ ) {
				var length = Math.floor( Math.random() * 100 );
				var str = 'A';
				for ( var j = 0; j < length; j++ ) {
					var symbol = Math.floor( Math.random() * test.length - 5 );
					str += test[symbol];
				}
				expect( new _v_( str ).isAlphaNumDash() ).toBe( true );
				expect( new _v_( str ).validateWithRules( 'a1_' ) ).toBe( true );
			}
		} );
	} );


	describe( "`@`, isValidEmail():", function () {
		it( "should contain only 1 '@' symbol", function () {
			var test1 = 'i@@macpaw.com',
				test2 = 'i@tjrus.com';
			expect( new _v_( test1 ).isValidEmail() ).not.toBe( true );
			expect( new _v_( test2 ).isValidEmail() ).toBe( true );
			expect( new _v_( test1 ).validateWithRules( '@' ) ).not.toBe( true );
			expect( new _v_( test2 ).validateWithRules( '@' ) ).toBe( true );
		} );
	} );


	describe( "`@s`, isValidEmails():", function () {
		it( "separated with ',' by default", function () {
			var test = 'tjrus@macpaw.com,i@tjrus.com';
			expect( new _v_( test ).isValidEmails() ).toBe( true );
			expect( new _v_( test ).validateWithRules( '@s' ) ).toBe( true );
		} );

		it( "can be separated with any other symbol by using isValidEmails(separator)", function () {
			var test = 'tjrus@macpaw.com|i@tjrus.com';
			expect( new _v_( test ).isValidEmails( '|' ) ).toBe( true );
			expect( new _v_( test ).validateWithRules( {rules: '@s', value_separator: '|' } ) ).toBe( true );
		} );
	} );


	describe( "`ip`, isValidIP():", function () {
		it( "should be valid IP address", function () {
			var test = '123.123.123.123';
			expect( new _v_( test ).isValidIP() ).toBe( true );
			expect( new _v_( test ).validateWithRules( 'ip' ) ).toBe( true );
		} );
	} );


	describe( "`b64`, isValidBase64():", function () {
		it( "should be valid Base64 string", function () {
			var test = 'YmFzZTY0IHRlc3QgaXM=';
			expect( new _v_( test ).isValidBase64() ).toBe( true );
			expect( new _v_( test ).validateWithRules( 'b64' ) ).toBe( true );
		} );
	} );


	describe( "`url`, isValidUrl()", function () {
		it( "should be valid URL string", function () {
			expect( new _v_( 'http://tjrus.com' ).isValidUrl() ).toBe( true );
			expect( new _v_( 'http://tjrus.com' ).validateWithRules( 'url' ) ).toBe( true );
		} );
	} );

	describe( "`int`, isInteger(): ", function () {
		it( "should contain only digits", function () {
			var test = ['123', 123, '0000123'];
			for ( var i = 0; i < test.length; i++ ) {
				expect( new _v_( test[i] ).isInteger() ).toBe( true );
				expect( new _v_( test[i] ).validateWithRules( 'int' ) ).toBe( true );
			}
		} );
	} );

	describe( "`dec`, isDecimal()", function () {
		it( "should contain only digits", function () {
			var test = ['123', 123, '0000123'];
			for ( var i = 0; i < test.length; i++ ) {
				expect( new _v_( test[i] ).isDecimal() ).toBe( true );
				expect( new _v_( test[i] ).validateWithRules( 'dec' ) ).toBe( true );
			}
		} );
	} );

	describe( "`nat`, isNatural()", function () {
		it( "should contain", function () {
			var test = ['123', 123, '0000123'];
			for ( var i = 0; i < test.length; i++ ) {
				expect( new _v_( test[i] ).isNatural() ).toBe( true );
				expect( new _v_( test[i] ).validateWithRules( 'nat' ) ).toBe( true );
			}
		} );
	} );

	describe( "`num`, isNumeric()", function () {
		it( "should contain", function () {
			var test = ['123', 123, '0000123'];
			for ( var i = 0; i < test.length; i++ ) {
				expect( new _v_( test[i] ).isNatural() ).toBe( true );
				expect( new _v_( test[i] ).validateWithRules( 'num' ) ).toBe( true );
			}
		} );
	} );

	describe( '`l=`, lengthEq( value )', function () {
		it( 'length should be equal to some value', function () {
			expect( new _v_( 'ololo' ).lengthEq( 5 ) ).toBe( true );
			expect( new _v_( 'ololo' ).validateWithRules( 'l=5' ) ).toBe( true );
		} );
	} );

	describe( '`l>`, lengthMore( value )', function () {
		it( 'length should be more then some value', function () {
			expect( new _v_( 'olol11234o' ).lengthMore( 5 ) ).toBe( true );
			expect( new _v_( 'olol11234o' ).validateWithRules( 'l>5' ) ).toBe( true );
		} );
	} );

	describe( '`l>=`, lengthEqOrMore( value )', function () {
		it( 'length should be equal or more then some value', function () {
			expect( new _v_( 'ololo' ).lengthEqOrMore( 5 ) ).toBe( true );
			expect( new _v_( 'olol11234o' ).lengthEqOrMore( 5 ) ).toBe( true );
			expect( new _v_( 'olo' ).lengthEqOrMore( 5 ) ).not.toBe( true );

			expect( new _v_( 'ololo' ).validateWithRules( 'l>=5' ) ).toBe( true );
			expect( new _v_( 'olol11234o' ).validateWithRules( 'l>=5' ) ).toBe( true );
			expect( new _v_( 'olo' ).validateWithRules( 'l>=5' ) ).not.toBe( true );
		} );
	} );

	describe( '`l<`, lengthLess( value )', function () {
		it( 'length should be less then some value', function () {
			expect( new _v_( 'olol11234o' ).lengthLess( 5 ) ).not.toBe( true );
			expect( new _v_( 'olol' ).lengthLess( 5 ) ).toBe( true );

			expect( new _v_( 'olol11234o' ).validateWithRules( 'l<5' ) ).not.toBe( true );
			expect( new _v_( 'olol' ).validateWithRules( 'l<5' ) ).toBe( true );
		} );
	} );

	describe( '`l<=`, lengthEqOrLess( value )', function () {
		it( 'length should be equal or less then some value', function () {
			expect( new _v_( 'ololo' ).lengthEqOrLess( 5 ) ).toBe( true );
			expect( new _v_( 'olol' ).lengthEqOrLess( 5 ) ).toBe( true );
			expect( new _v_( 'olol11234o' ).lengthEqOrLess( 5 ) ).not.toBe( true );

			expect( new _v_( 'olol11234o' ).validateWithRules( 'l<=5' ) ).not.toBe( true );
			expect( new _v_( 'ololo' ).validateWithRules( 'l<=5' ) ).toBe( true );
			expect( new _v_( 'olol' ).validateWithRules( 'l<=5' ) ).toBe( true );
		} );
	} );


	describe( '`>`, greaterThen( value )', function () {
		it( 'length should be greater then some value', function () {
			expect( new _v_( '10' ).greaterThen( 5 ) ).toBe( true );
			expect( new _v_( '6' ).greaterThen( 5 ) ).toBe( true );
			expect( new _v_( '1' ).greaterThen( 5 ) ).not.toBe( true );
			expect( new _v_( '10' ).validateWithRules( '>5' ) ).toBe( true );
			expect( new _v_( '6' ).validateWithRules( '>5' ) ).toBe( true );
			expect( new _v_( 1 ).validateWithRules( '>5' ) ).not.toBe( true );
		} );
	} );

	describe( '`>=`, greaterOrEq( value )', function () {
		it( 'length should be greater or equal to some value', function () {
			expect( new _v_( '10' ).greaterOrEq( 5 ) ).toBe( true );
			expect( new _v_( '5' ).greaterOrEq( 5 ) ).toBe( true );
			expect( new _v_( '1' ).greaterOrEq( 5 ) ).not.toBe( true );
			expect( new _v_( '10' ).validateWithRules( '>=5' ) ).toBe( true );
			expect( new _v_( '5' ).validateWithRules( '>=5' ) ).toBe( true );
			expect( new _v_( 1 ).validateWithRules( '>=5' ) ).not.toBe( true );
		} );
	} );

	describe( '`<`, lessThen( value )', function () {
		it( 'length should be less or equal to some value', function () {
			expect( new _v_( '4' ).lessThen( 5 ) ).toBe( true );
			expect( new _v_( '5' ).lessThen( 5 ) ).not.toBe( true );
			expect( new _v_( '10' ).lessThen( 5 ) ).not.toBe( true );
			expect( new _v_( '10' ).validateWithRules( '<5' ) ).not.toBe( true );
			expect( new _v_( '5' ).validateWithRules( '<5' ) ).not.toBe( true );
			expect( new _v_( 4 ).validateWithRules( '<5' ) ).toBe( true );
		} );
	} );

	describe( '`<=`, lessOrEq( value )', function () {
		it( 'length should be less or equal to some value', function () {
			expect( new _v_( '4' ).lessOrEq( 5 ) ).toBe( true );
			expect( new _v_( '5' ).lessOrEq( 5 ) ).toBe( true );
			expect( new _v_( '10' ).lessOrEq( 5 ) ).not.toBe( true );
			expect( new _v_( '10' ).validateWithRules( '<=5' ) ).not.toBe( true );
			expect( new _v_( '5' ).validateWithRules( '<=5' ) ).toBe( true );
			expect( new _v_( 4 ).validateWithRules( '<=5' ) ).toBe( true );
		} );
	} );

	describe( '`reg=`, validateRegular( regexp )', function () {
		it( 'validation with regular expression', function () {
			expect( new _v_( 'kjdh.asdf.asd' ).validateRegular( '^([a-z]{2,4})(((\\.)([A-Za-z0-9-]+))+)$' ) ).toBe( true );
			expect( new _v_( 'kjsddh.asdf.asd' ).validateRegular( '^([a-z]{2,4})(((\\.)([A-Za-z0-9-]+))+)$' ) ).toBe( false );
			expect( new _v_( 'kjdh.asdf.asd.' ).validateRegular( '^([a-z]{2,4})(((\\.)([A-Za-z0-9-]+))+)$' ) ).toBe( false );
			expect( new _v_( 'kjdh.asdf.asd' ).validateWithRules( 'reg=^([a-z]{2,4})(((\\.)([A-Za-z0-9-]+))+)$' ) ).toBe( true );
			expect( new _v_( 'kjsddh.asdf.asd' ).validateWithRules( 'reg=^([a-z]{2,4})(((\\.)([A-Za-z0-9-]+))+)$' ) ).toBe( false );
			expect( new _v_( 'kjdh.asdf.asd.' ).validateWithRules( 'reg=^([a-z]{2,4})(((\\.)([A-Za-z0-9-]+))+)$' ) ).toBe( false );
		} );
	} );


	describe( '`lr=`, lengthInRange( range_array )', function () {
		it( 'length is in defined range', function () {
			expect( new _v_( 'asdf' ).lengthInRange( [3, 5] ) ).toBe( true );
			expect( new _v_( 'asdf' ).lengthInRange( [4, 4] ) ).toBe( true );
			expect( new _v_( 'asdf' ).lengthInRange( [5, 6] ) ).toBe( false );
			expect( new _v_( 'asdf' ).lengthInRange( [1, 3] ) ).toBe( false );
			expect( new _v_( 'asdf' ).validateWithRules( 'lr=[3,5]' ) ).toBe( true );
			expect( new _v_( 'asdf' ).validateWithRules( 'lr=[4,4]' ) ).toBe( true );
			expect( new _v_( 'asdf' ).validateWithRules( 'lr=[5,6]' ) ).toBe( false );
			expect( new _v_( 'asdf' ).validateWithRules( 'lr=[1,3]' ) ).toBe( false );
		} );
	} );


	describe( '`r=`, inRange( range_array )', function () {
		it( 'value is in defined range', function () {
			expect( new _v_( 12 ).inRange( [10, 100] ) ).toBe( true );
			expect( new _v_( 10 ).inRange( [10, 100] ) ).toBe( true );
			expect( new _v_( 9 ).inRange( [10, 100] ) ).toBe( false );
			expect( new _v_( 101 ).inRange( [10, 100] ) ).toBe( false );

			expect( new _v_( 12 ).validateWithRules( 'r=[10,100]' ) ).toBe( true );
			expect( new _v_( 10 ).validateWithRules( 'r=[10,100]' ) ).toBe( true );
			expect( new _v_( 9 ).validateWithRules( 'r=[10,100]' ) ).toBe( false );
			expect( new _v_( 101 ).validateWithRules( 'r=[10,100]' ) ).toBe( false );
		} );
	} );


	describe( '`=`, matchesTo( value )', function () {
		it( 'matches to defined value (string or number)', function () {
			expect( new _v_( 12 ).matchesTo( 12 ) ).toBe( true );
			expect( new _v_( 11 ).matchesTo( 12 ) ).toBe( false );
			expect( new _v_( 12 ).matchesTo( '12' ) ).toBe( true );
			expect( new _v_( 11 ).matchesTo( '12' ) ).toBe( false );
			expect( new _v_( 'absasd' ).matchesTo( 'ba' ) ).toBe( false );
			expect( new _v_( 'ba' ).matchesTo( 'ba' ) ).toBe( true );

			expect( new _v_( 12 ).validateWithRules( '=12' ) ).toBe( true );
			expect( new _v_( 11 ).validateWithRules( '=12' ) ).toBe( false );
			expect( new _v_( '12' ).validateWithRules( '=12' ) ).toBe( true );
			expect( new _v_( 11 ).validateWithRules( '=12' ) ).toBe( false );
			expect( new _v_( 'absasd' ).validateWithRules( '=ba' ) ).toBe( false );
			expect( new _v_( 'ba' ).validateWithRules( '=ba' ) ).toBe( true );
		} );

		it( 'value can be array of elements', function () {
			expect( new _v_( 'asdf' ).matchesTo( ['asdf', 'asdfasdfasd'] ) ).toBe( true );
			expect( new _v_( 'asdfasdfasd' ).matchesTo( ['asdf', 'asdfasdfasd'] ) ).toBe( true );
			expect( new _v_( 'asdfasdfasd' ).matchesTo( ['asdf', 'as'] ) ).toBe( false );

			expect( new _v_( 'asdf' ).validateWithRules( '=[asdf,asdfasdfasd]' ) ).toBe( true );
			expect( new _v_( 'asdfasdfasd' ).validateWithRules( '=[asdf,asdfasdfasd]' ) ).toBe( true );
			expect( new _v_( 'asdfasdfasd' ).validateWithRules( '=[asdf,as]' ) ).toBe( false );
		} );

		it( 'included \'#element_id\' to compare with some element value', function () {
			$( '#unique_test_id' ).val( 'asdf' );
			expect( new _v_( 'asdf' ).matchesTo( ['#unique_test_id', 'asd'] ) ).toBe( true );
			expect( new _v_( 'asd' ).matchesTo( ['#unique_test_id', 'asd'] ) ).toBe( true );
			expect( new _v_( 'assd' ).matchesTo( ['#unique_test_id', 'asd'] ) ).toBe( false );

			expect( new _v_( 'asdf' ).validateWithRules( '=[#unique_test_id,asd]' ) ).toBe( true );
			expect( new _v_( 'asd' ).validateWithRules( '=[#unique_test_id,asd]' ) ).toBe( true );
			expect( new _v_( 'assd' ).validateWithRules( '=[#unique_test_id,asd]' ) ).toBe( false );
		} );
	} );


	describe( '`=#`, matchesToId ( id )', function () {
		it( 'matches to defined element (id) value', function () {
			$( '#unique_test_id' ).val( '' );
			expect( new _v_( '' ).matchesToId( 'unique_test_id' ) ).toBe( true );
			expect( new _v_( '' ).validateWithRules( '=#unique_test_id' ) ).toBe( true );

			$( '#unique_test_id' ).val( '1234' );
			expect( new _v_( '' ).matchesToId( 'unique_test_id' ) ).toBe( false );
			expect( new _v_( '1234' ).matchesToId( 'unique_test_id' ) ).toBe( true );
			expect( new _v_( 1234 ).matchesToId( 'unique_test_id' ) ).toBe( true );
			expect( new _v_( 1234 ).matchesToId( 'unique_test_id' ) ).toBe( true );

			expect( new _v_( '' ).validateWithRules( '=#unique_test_id' ) ).toBe( false );
			expect( new _v_( '1234' ).validateWithRules( '=#unique_test_id' ) ).toBe( true );
			expect( new _v_( 1234 ).validateWithRules( '=#unique_test_id' ) ).toBe( true );
			expect( new _v_( 1234 ).validateWithRules( '=#unique_test_id' ) ).toBe( true );
		} );

		it( 'id can be array of ids', function () {
			$( '#unique_test_id' ).val( '' );
			$( '#unique_test_id2' ).val( '1234' );
			expect( new _v_( '' ).matchesToId( ['unique_test_id', 'unique_test_id2'] ) ).toBe( true );
			expect( new _v_( '1234' ).matchesToId( ['unique_test_id', 'unique_test_id2'] ) ).toBe( true );
			expect( new _v_( '34' ).matchesToId( ['unique_test_id', 'unique_test_id2'] ) ).toBe( false );

			expect( new _v_( '' ).validateWithRules( '=[#unique_test_id,#unique_test_id2]' ) ).toBe( true );
			expect( new _v_( '1234' ).validateWithRules( '=[#unique_test_id,#unique_test_id2]' ) ).toBe( true );
			expect( new _v_( '34' ).validateWithRules( '=[#unique_test_id,#unique_test_id2]' ) ).toBe( false );
		} );
	} );


	describe( '`!=`, notMatches', function () {
		it( 'not matches to defined value (string or number)', function () {
			expect( new _v_( 12 ).notMatches( 12 ) ).not.toBe( true );
			expect( new _v_( 11 ).notMatches( 12 ) ).not.toBe( false );
			expect( new _v_( 12 ).notMatches( '12' ) ).not.toBe( true );
			expect( new _v_( 11 ).notMatches( '12' ) ).not.toBe( false );
			expect( new _v_( 'absasd' ).notMatches( 'ba' ) ).not.toBe( false );
			expect( new _v_( 'ba' ).notMatches( 'ba' ) ).not.toBe( true );

			expect( new _v_( 12 ).validateWithRules( '!=12' ) ).not.toBe( true );
			expect( new _v_( 11 ).validateWithRules( '!=12' ) ).not.toBe( false );
			expect( new _v_( '12' ).validateWithRules( '!=12' ) ).not.toBe( true );
			expect( new _v_( 11 ).validateWithRules( '!=12' ) ).not.toBe( false );
			expect( new _v_( 'absasd' ).validateWithRules( '!=ba' ) ).not.toBe( false );
			expect( new _v_( 'ba' ).validateWithRules( '!=ba' ) ).not.toBe( true );
		} );

		it( 'value can be array of elements', function () {
			expect( new _v_( 'asdf' ).notMatches( ['asdf', 'asdfasdfasd'] ) ).not.toBe( true );
			expect( new _v_( 'asdfasdfasd' ).notMatches( ['asdf', 'asdfasdfasd'] ) ).not.toBe( true );
			expect( new _v_( 'asdfasdfasd' ).notMatches( ['asdf', 'as'] ) ).not.toBe( false );

			expect( new _v_( 'asdf' ).validateWithRules( '!=[asdf,asdfasdfasd]' ) ).not.toBe( true );
			expect( new _v_( 'asdfasdfasd' ).validateWithRules( '!=[asdf,asdfasdfasd]' ) ).not.toBe( true );
			expect( new _v_( 'asdfasdfasd' ).validateWithRules( '!=[asdf,as]' ) ).not.toBe( false );
		} );

		it( 'included \'#element_id\' to compare with some element value', function () {
			$( '#unique_test_id' ).val( 'asdf' );
			expect( new _v_( 'asdf' ).notMatches( ['#unique_test_id', 'asd'] ) ).not.toBe( true );
			expect( new _v_( 'asd' ).notMatches( ['#unique_test_id', 'asd'] ) ).not.toBe( true );
			expect( new _v_( 'assd' ).notMatches( ['#unique_test_id', 'asd'] ) ).not.toBe( false );

			expect( new _v_( 'asdf' ).validateWithRules( '!=[#unique_test_id,asd]' ) ).not.toBe( true );
			expect( new _v_( 'asd' ).validateWithRules( '!=[#unique_test_id,asd]' ) ).not.toBe( true );
			expect( new _v_( 'assd' ).validateWithRules( '!=[#unique_test_id,asd]' ) ).not.toBe( false );
		} );
	} );


	describe( '`!`, notContain()', function () {
		it( 'not contain defined value (string or number)', function () {
			expect( new _v_( 12 ).notContain( 12 ) ).toBe( false );
			expect( new _v_( 11 ).notContain( 12 ) ).toBe( true );
			expect( new _v_( 11 ).notContain( '12' ) ).toBe( true );
			expect( new _v_( 'absasd' ).notContain( 'ba' ) ).toBe( true );
			expect( new _v_( 11 ).notContain( 1 ) ).toBe( false );
			expect( new _v_( 11 ).notContain( '1' ) ).toBe( false );
			expect( new _v_( '11' ).notContain( '1' ) ).toBe( false );

			expect( new _v_( 12 ).validateWithRules( '!12' ) ).toBe( false );
			expect( new _v_( '11' ).validateWithRules( '!12' ) ).toBe( true );
			expect( new _v_( 11 ).validateWithRules( '!12' ) ).toBe( true );
			expect( new _v_( 'absasd' ).validateWithRules( '!ba' ) ).toBe( true );
			expect( new _v_( 11 ).validateWithRules( '!1' ) ).toBe( false );
			expect( new _v_( 11 ).validateWithRules( '!1' ) ).toBe( false );
			expect( new _v_( '11' ).validateWithRules( '!1' ) ).toBe( false );
		} );

		it( 'not contain defined values in array', function () {
			expect( new _v_( 12 ).notContain( [12, 32] ) ).toBe( false );
			expect( new _v_( '12' ).notContain( ['12', 32] ) ).toBe( false );
			expect( new _v_( 11 ).notContain( [12, 32] ) ).toBe( true );
			expect( new _v_( 11 ).notContain( [1] ) ).toBe( false );

			expect( new _v_( 12 ).validateWithRules( '![12,32]' ) ).toBe( false );
			expect( new _v_( '12' ).validateWithRules( '![12,32]' ) ).toBe( false );
			expect( new _v_( 11 ).validateWithRules( '![12,32]' ) ).toBe( true );
			expect( new _v_( 11 ).validateWithRules( '![1]' ) ).toBe( false );
		} );
	} );


	describe( '`c`, isValidCard() - should be valid card (all types)', function () {
		it( 'All Visa card numbers start with a 4. New cards have 16 digits. Old cards have 13', function () {
			for ( var i = 0; i < 100; i++ ) {
				var value = '4' + (Math.random() * 1).toString().substr( 2, 15 );
				if ( value.length == 16 ) {
					expect( new _v_( value ).isValidCard() ).toBe( true );
					expect( new _v_( value ).validateWithRules( 'c' ) ).toBe( true );
				}
			}
		} );

		it( 'All MasterCard numbers start with the numbers 51 through 55. All have 16 digits', function () {
			for ( var i = 0; i < 100; i++ ) {
				var value = (Math.random() * 1).toString().substr( 2, 14 );
				if ( value.length == 14 ) {
					expect( new _v_( '51' + value ).isValidCard() ).toBe( true );
					expect( new _v_( '52' + value ).isValidCard() ).toBe( true );
					expect( new _v_( '53' + value ).isValidCard() ).toBe( true );
					expect( new _v_( '54' + value ).isValidCard() ).toBe( true );
					expect( new _v_( '55' + value ).isValidCard() ).toBe( true );

					expect( new _v_( '51' + value ).validateWithRules( 'c' ) ).toBe( true );
					expect( new _v_( '52' + value ).validateWithRules( 'c' ) ).toBe( true );
					expect( new _v_( '53' + value ).validateWithRules( 'c' ) ).toBe( true );
					expect( new _v_( '54' + value ).validateWithRules( 'c' ) ).toBe( true );
					expect( new _v_( '55' + value ).validateWithRules( 'c' ) ).toBe( true );
				}
			}
		} );

		it( 'American Express card numbers start with 34 or 37 and have 15 digits', function () {
			for ( var i = 0; i < 100; i++ ) {
				var value = (Math.random() * 1).toString().substr( 2, 13 );
				if ( value.length == 14 ) {
					expect( new _v_( '34' + value ).isValidCard() ).toBe( true );
					expect( new _v_( '37' + value ).isValidCard() ).toBe( true );

					expect( new _v_( '34' + value ).validateWithRules( 'c' ) ).toBe( true );
					expect( new _v_( '37' + value ).validateWithRules( 'c' ) ).toBe( true );
				}
			}
		} );

		it( 'Discover card numbers begin with 6011 or 65. All have 16 digits', function () {
			for ( var i = 0; i < 100; i++ ) {
				var value = (Math.random() * 1).toString().substr( 2, 14 );
				if ( value.length == 14 ) {
					expect( new _v_( '65' + value ).isValidCard() ).toBe( true );
					expect( new _v_( '6011' + value.substr( 0, 12 ) ).isValidCard() ).toBe( true );

					expect( new _v_( '65' + value ).validateWithRules( 'c' ) ).toBe( true );
					expect( new _v_( '6011' + value.substr( 0, 12 ) ).validateWithRules( 'c' ) ).toBe( true );
				}
			}
		} );
	} );


	describe( '`cv`, isValidVisa()', function () {
		it( 'All Visa card numbers start with a 4. New cards have 16 digits. Old cards have 13', function () {
			for ( var i = 0; i < 100; i++ ) {
				var value = '4' + (Math.random() * 1).toString().substr( 2, 15 );
				if ( value.length == 16 ) {
					expect( new _v_( value ).isValidVisa() ).toBe( true );
					expect( new _v_( value.substr( 0, 13 ) ).isValidVisa() ).toBe( true );

					expect( new _v_( value ).validateWithRules( 'cv' ) ).toBe( true );
					expect( new _v_( value.substr( 0, 13 ) ).validateWithRules( 'cv' ) ).toBe( true );
				}
			}
			for ( var i = 0; i < 100; i++ ) {
				var value = (Math.random() * 1).toString().substr( 2, 16 );
				if ( parseInt( value[0] ) != 4 ) {
					expect( new _v_( value ).isValidVisa() ).not.toBe( true );
					expect( new _v_( value.substr( 0, 13 ) ).isValidVisa() ).not.toBe( true );

					expect( new _v_( value ).validateWithRules( 'cv' ) ).not.toBe( true );
					expect( new _v_( value.substr( 0, 13 ) ).validateWithRules( 'cv' ) ).not.toBe( true );
				}
			}
		} );
	} );


	describe( '`cm`, isValidMastercard()', function () {
		it( 'All MasterCard numbers start with the numbers 51 through 55. All have 16 digits', function () {
			for ( var i = 0; i < 100; i++ ) {
				var value = (Math.random() * 1).toString().substr( 2, 14 );
				if ( value.length == 14 ) {
					expect( new _v_( '51' + value ).isValidMastercard() ).toBe( true );
					expect( new _v_( '52' + value ).isValidMastercard() ).toBe( true );
					expect( new _v_( '53' + value ).isValidMastercard() ).toBe( true );
					expect( new _v_( '54' + value ).isValidMastercard() ).toBe( true );
					expect( new _v_( '55' + value ).isValidMastercard() ).toBe( true );

					expect( new _v_( '51' + value ).validateWithRules( 'cm' ) ).toBe( true );
					expect( new _v_( '52' + value ).validateWithRules( 'cm' ) ).toBe( true );
					expect( new _v_( '53' + value ).validateWithRules( 'cm' ) ).toBe( true );
					expect( new _v_( '54' + value ).validateWithRules( 'cm' ) ).toBe( true );
					expect( new _v_( '55' + value ).validateWithRules( 'cm' ) ).toBe( true );

					var v2 = (Math.random() * 1).toString().substr( 2, 2 );
					if ( parseInt( v2, 10 ) < 51 || parseInt( v2, 10 ) > 55 ) {
						expect( new _v_( v2 + value ).isValidMastercard() ).not.toBe( true );
						expect( new _v_( v2 + value ).validateWithRules( 'cm' ) ).not.toBe( true );
					}
				}
			}
		} );
	} );


	describe( '`ca`, isValidAmex()', function () {
		it( 'American Express card numbers start with 34 or 37 and have 15 digits', function () {
			for ( var i = 0; i < 100; i++ ) {
				var value = (Math.random() * 1).toString().substr( 2, 13 );
				if ( value.length == 14 ) {
					expect( new _v_( '34' + value ).isValidAmex() ).toBe( true );
					expect( new _v_( '37' + value ).isValidAmex() ).toBe( true );

					expect( new _v_( '34' + value ).validateWithRules( 'ca' ) ).toBe( true );
					expect( new _v_( '37' + value ).validateWithRules( 'ca' ) ).toBe( true );

					var v2 = (Math.random() * 1).toString().substr( 2, 2 );
					if ( parseInt( v2, 10 ) < 51 || parseInt( v2, 10 ) > 55 ) {
						expect( new _v_( v2 + value ).isValidAmex() ).not.toBe( true );
						expect( new _v_( v2 + value ).validateWithRules( 'ca' ) ).not.toBe( true );
					}
				}
			}
		} );
	} );


	describe( '`cd`, isValidDiscover()', function () {
		it( 'Discover card numbers begin with 6011 or 65. All have 16 digits', function () {
			for ( var i = 0; i < 100; i++ ) {
				var value = (Math.random() * 1).toString().substr( 2, 14 );
				if ( value.length == 14 ) {
					expect( new _v_( '65' + value ).isValidDiscover() ).toBe( true );
					expect( new _v_( '6011' + value.substr( 0, 12 ) ).isValidDiscover() ).toBe( true );

					expect( new _v_( '65' + value ).validateWithRules( 'cd' ) ).toBe( true );
					expect( new _v_( '6011' + value.substr( 0, 12 ) ).validateWithRules( 'cd' ) ).toBe( true );

					var v2 = (Math.random() * 1).toString().substr( 2, 4 );
					if ( parseInt( v2, 10 ) != 6011 ) {
						expect( new _v_( v2 + value ).isValidDiscover() ).not.toBe( true );
						expect( new _v_( v2 + value ).validateWithRules( 'cd' ) ).not.toBe( true );
					}
					if ( parseInt( v2.substr( 0, 2 ), 10 ) != 65 ) {
						expect( new _v_( v2 + value.substr( 0, 2 ) ).isValidDiscover() ).not.toBe( true );
						expect( new _v_( v2 + value.substr( 0, 2 ) ).validateWithRules( 'cd' ) ).not.toBe( true );
					}
				}
			}
		} );
	} );


	describe( '`D=`, isValidDate', function () {
		it( '`D=Y-M-D R:I:S` - maximum example', function () {
			for ( var i = 0; i < 100; i++ ) {
				var YYYY = (parseInt( (Math.random() * 1).toString().substr( 2, 4 ), 10 )).toString();
				var MM = parseInt( (Math.random() * 12).toString().split( '.' )[0], 10 ) + 1;
				var DD = parseInt( (Math.random() * 28).toString().split( '.' )[0], 10 ) + 1;
				var RR = parseInt( (Math.random() * 24).toString().split( '.' )[0], 10 );
				var II = parseInt( (Math.random() * 60).toString().split( '.' )[0], 10 );
				var SS = parseInt( (Math.random() * 60).toString().split( '.' )[0], 10 );
				if ( YYYY.length == 4 ) {
					expect( new _v_( YYYY + '-' + MM + '-' + DD + ' ' + RR + ':' + II + ':' + SS ).isValidDate( 'Y-M-D R:I:S' ) ).toBe( true );
					expect( new _v_( YYYY + '-' + MM + '-' + DD + ' ' + RR + ':' + II + ':' + SS ).validateWithRules( {rule: 'D=Y-M-D R:I:S', rule_separator: '|'} ) ).toBe( true );
				}
			}
		} )

		it( '`D=Y-M-D H:I:S A` - maximum example', function () {
			for ( var i = 0; i < 100; i++ ) {
				var YYYY = (parseInt( (Math.random() * 1).toString().substr( 2, 4 ), 10 )).toString();
				var MM = parseInt( (Math.random() * 12).toString().split( '.' )[0], 10 ) + 1;
				var DD = parseInt( (Math.random() * 28).toString().split( '.' )[0], 10 ) + 1;
				var HH = parseInt( (Math.random() * 12).toString().split( '.' )[0], 10 ) + 1;
				var II = parseInt( (Math.random() * 60).toString().split( '.' )[0], 10 );
				var SS = parseInt( (Math.random() * 60).toString().split( '.' )[0], 10 );
				var AA = (Math.random() * 2 > 1) ? 'PM' : 'AM';
				if ( YYYY.length == 4 ) {
					expect( new _v_( YYYY + '-' + MM + '-' + DD + ' ' + HH + ':' + II + ':' + SS + ' ' + AA ).isValidDate( 'Y-M-D H:I:S A' ) ).toBe( true );
					expect( new _v_( YYYY + '-' + MM + '-' + DD + ' ' + HH + ':' + II + ':' + SS + ' ' + AA ).validateWithRules( {rule: 'D=Y-M-D H:I:S A', rule_separator: '|'} ) ).toBe( true );
				}
			}
		} )


		it( 'and other combinations of `Y`,`y`,`M`,`m`,`N`,`n`,`W`,`w`,`H`,`h`,`R`,`r`,`I`,`i`,`S`,`s`,`A`,`a` and their separators', function () {
			expect( new _v_( '2012-1-1 1:1:1 PM' ).isValidDate( 'Y-M-D H:I:S A' ) ).toBe( true );
			expect( new _v_( '2012-1-1 1:1:1 pm' ).isValidDate( 'Y-M-D H:I:S a' ) ).toBe( true );
			expect( new _v_( '2012-1-1 10:01:01 pm' ).isValidDate( 'Y-M-D h:i:s a' ) ).toBe( true );
			expect( new _v_( '2012-1-1 1:1:1 pm' ).isValidDate( 'Y-M-D h:i:s a' ) ).toBe( true );

			expect( new _v_( '2012-1-1 1:1:1 PM' ).validateWithRules( {rule: 'D=Y-M-D H:I:S A', rule_separator: '|'} ) ).toBe( true );
			expect( new _v_( '2012-1-1 1:1:1 pm' ).validateWithRules( {rule: 'D=Y-M-D H:I:S a', rule_separator: '|'} ) ).toBe( true );
			expect( new _v_( '2012-1-1 10:01:01 pm' ).validateWithRules( {rule: 'D=Y-M-D h:i:s A', rule_separator: '|'} ) ).toBe( true );
			expect( new _v_( '2012-1-1 1:1:1 pm' ).validateWithRules( {rule: 'D=Y-M-D h:i:s A', rule_separator: '|'} ) ).toBe( true );

			// TODO: add more tests here. but everything is working fine :)
		} );

	} );
} );



