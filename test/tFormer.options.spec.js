describe( "tFormer options: ", function () {

	describe( 'Defaults', function () {
		var f = tFormer( 'f_no_sb' );
		it( 'timeout = 0', function () {
			expect( f.get( 'timeout' ) ).toBe( 0 );
		} );
		it( 'requestTimeout = 2000', function () {
			expect( f.get( 'requestTimeout' ) ).toBe( 2000 );
		} );
		it( 'errorClass = "error"', function () {
			expect( f.get( 'errorClass' ) ).toBe( 'error' );
		} );
		it( 'processingClass = "processing"', function () {
			expect( f.get( 'processingClass' ) ).toBe( 'processing' );
		} );
		it( 'disabledClass = "disabled"', function () {
			expect( f.get( 'disabledClass' ) ).toBe( 'disabled' );
		} );
		it( 'validateEvent = "input keyup"', function () {
			expect( f.get( 'validateEvent' ) ).toBe( 'input keyup' );
		} );
		it( 'submitButtonControl = true', function () {
			expect( f.get( 'submitButtonControl' ) ).toBeTruthy();
		} );
		it( 'submitButton = null', function () {
			expect( f.get( 'submitButton' ) ).toBeNull();
		} );
		it( 'submit() = undefined', function () {
			expect( f.get( 'submit' ) ).not.toBeDefined();
		} );
		it( 'before() = undefined', function () {
			expect( f.get( 'before' ) ).not.toBeDefined();
		} );
		it( 'onvalid() = undefined', function () {
			expect( f.get( 'onvalid' ) ).not.toBeDefined();
		} );
		it( 'onerror() = undefined', function () {
			expect( f.get( 'onerror' ) ).not.toBeDefined();
		} );

		it( 'fields: rules = undefined', function () {
			expect( !!f.field( 't_text' ).get( 'rules' ) ).toBe( false );
		} );
		it( 'fields: url = undefined', function () {
			expect( (f.field( 't_text' ).get( 'request' ) || {}).url ).not.toBeDefined();
		} );
		it( 'fields: method = undefined', function () {
			expect( (f.field( 't_text' ).get( 'request' ) || {}).method ).not.toBeDefined();
		} );
		it( 'fields: data = undefined', function () {
			expect( (f.field( 't_text' ).get( 'request' ) || {}).data ).not.toBeDefined();
		} );
		it( 'fields: start() = undefined', function () {
			expect( (f.field( 't_text' ).get( 'request' ) || {}).start ).not.toBeDefined();
		} );
		it( 'fields: end() = undefined', function () {
			expect( (f.field( 't_text' ).get( 'request' ) || {}).end ).not.toBeDefined();
		} );
		it( 'fields: own() = undefined', function () {
			expect( f.field( 't_text' ).get( 'own' ) ).not.toBeDefined();
		} );
	} );

	describe( 'Changed', function () {
		var f = tFormer( 'f', {
			timeout            : 123,
			requestTimeout     : 123,
			errorClass         : '_error',
			processingClass    : '_processing',
			disabledClass      : '_disabled',
			validateEvent      : 'blur',
			submitButtonControl: false,
			submitButton       : $( '.f_sb_not_button' ).find( '.submit' )[0],
			before             : function () {
				return 'before_changed';
			},
			onerror            : function () {
				return 'onerror_changed';
			},
			onvalid            : function () {
				return 'onvalid_changed';
			},
			submit             : function () {
				return 'submit_changed';
			},
			fields             : {
				t_text: {
					timeout        : 123123,
					requestTimeout : 123123,
					errorClass     : '_error123',
					processingClass: '_processing123',
					validateEvent  : 'blur keyup',
					before         : function () {
						return 'before_changed';
					},
					onerror        : function () {
						return 'onerror_changed';
					},
					onvalid        : function () {
						return 'onvalid_changed';
					},
					own            : function () {
						return 'own_changed';
					},
					rules          : '*',
					request        : {
						url   : 'ajax.html',
						data  : {
							some: 'value'
						},
						method: 'post',
						start : function () {
							return 'start_changed';
						},
						end   : function () {
							return 'end_changed';
						}
					}
				}
			}
		} );
		describe( 'through options while defining new tFormer object', function () {
			it( 'timeout changed', function () {
				expect( f.get( 'timeout' ) ).not.toBe( 0 );
			} );
			it( 'requestTimeout changed', function () {
				expect( f.get( 'requestTimeout' ) ).not.toBe( 2000 );
			} );
			it( 'errorClass changed', function () {
				expect( f.get( 'errorClass' ) ).not.toBe( 'error' );
			} );
			it( 'processingClass changed', function () {
				expect( f.get( 'processingClass' ) ).not.toBe( 'processing' );
			} );
			it( 'disabledClass changed', function () {
				expect( f.get( 'disabledClass' ) ).not.toBe( 'disabled' );
			} );
			it( 'validateEvent changed', function () {
				expect( f.get( 'validateEvent' ) ).not.toBe( 'input keyup' );
			} );
			it( 'submitButtonControl changed', function () {
				expect( f.get( 'submitButtonControl' ) ).toBe( false );
			} );
			it( 'submitButton changed', function () {
				expect( f.get( 'submitButton' ) ).not.toBeNull();
			} );
			it( 'submit() changed', function () {
				expect( f.get( 'submit' )() ).toBe( 'submit_changed' );
			} );
			it( 'before() changed', function () {
				expect( f.get( 'before' )() ).toBe( 'before_changed' );
			} );
			it( 'onvalid() changed', function () {
				expect( f.get( 'onvalid' )() ).toBe( 'onvalid_changed' );
			} );
			it( 'onerror() changed', function () {
				expect( f.get( 'onerror' )() ).toBe( 'onerror_changed' );
			} );

			it( 'fields: rules changed', function () {
				expect( f.field( 't_text' ).get( 'rules' ) ).toBe( '*' );
			} );
			it( 'fields: url changed', function () {
				expect( f.field( 't_text' ).get( 'request' ).url ).toBe( 'ajax.html' );
			} );
			it( 'fields: method changed', function () {
				expect( f.field( 't_text' ).get( 'request' ).method ).toBe( 'post' );
			} );
			it( 'fields: data changed', function () {
				expect( f.field( 't_text' ).get( 'request' ).data.some ).toBe( 'value' );
			} );
			it( 'fields: start() changed', function () {
				expect( f.field( 't_text' ).get( 'request' ).start() ).toBe( 'start_changed' );
			} );
			it( 'fields: end() changed', function () {
				expect( f.field( 't_text' ).get( 'request' ).end() ).toBe( 'end_changed' );
			} );
			it( 'fields: own() changed', function () {
				expect( f.field( 't_text' ).get( 'own' )() ).toBe( 'own_changed' );
			} );
		} );
	} );
} );