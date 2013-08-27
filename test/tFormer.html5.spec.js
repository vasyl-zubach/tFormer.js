/**
 * Test HTML5 attributes support
 */
describe( 'HTML5 attributes and types support', function () {

	var f = tFormer( 'f_html5' );

	it( 'required', function () {
		expect( f.field( 't_required' ).hasRules( '*' ) ).toBe( true );
	} );

	it( 'type="email"', function () {
		expect( f.field( 't_email' ).hasRules( '@' ) ).toBe( true );
	} );

	it( 'type="number"', function () {
		expect( f.field( 't_number' ).hasRules( 'num' ) ).toBe( true );
	} );

	it( 'type="number" and attribute min', function () {
		expect( f.field( 't_number_min' ).hasRules( 'num' ) ).toBe( true );
		expect( f.field( 't_number_min' ).hasRules( '>' + $( f.field( 't_number_min' ).el ).attr( 'min' ) ) ).toBe( true );
	} );
	it( 'type="number" and attribute max', function () {
		expect( f.field( 't_number_max' ).hasRules( 'num' ) ).toBe( true );
		expect( f.field( 't_number_max' ).hasRules( '<' + $( f.field( 't_number_max' ).el ).attr( 'max' ) ) ).toBe( true );
	} );
	it( 'type="number" and attributes max amd min', function () {
		expect( f.field( 't_number_min_max' ).hasRules( 'num' ) ).toBe( true );
		expect( f.field( 't_number_min_max' ).hasRules( '<' + $( f.field( 't_number_min_max' ).el ).attr( 'max' ) ) ).toBe( true );
		expect( f.field( 't_number_min_max' ).hasRules( '>' + $( f.field( 't_number_min_max' ).el ).attr( 'min' ) ) ).toBe( true );
	} );

	it( 'type="url"', function () {
		expect( f.field( 't_url' ).hasRules( 'url' ) ).toBe( true );
	} );

} );
