var DEV = ~window.location.href.indexOf( 'dev.html' ) ? true : false;

$( document ).ready( function () {
	for ( var page in page_func ) {
		if ( typeof page_func[page] == 'function' && page != 'after_all' ) {
			page_func[page]();
		}
	}
	page_func.after_all();
} );

$( document ).on( 'click', '.permalink', function () {
	goto_permalink();
} );

var hash;
setInterval( function () {
	var new_hash = window.location.hash
	if ( hash != new_hash ) {
		hash = new_hash;
		onpopstate();
	}
}, 30 );


//$( window ).on( 'popstate', function () {
//	onpopstate();
//} );


/**
 *
 * @type {{current: string, arr: Array, get: Function, set: Function, gether: Function}}
 */
var url = {
	current: '',
	arr    : [],
	page   : [],

	get: function ( num ) {
		var hash = window.location.hash;
		if ( url.current != hash ) {
			url.current = hash;
			url.arr = hash.replace( '#', '' ).split( '/' );
		}
		return url.arr[num - 1] || '';
	},

	set: function ( obj ) {
		for ( var key in obj ) {
			url.arr[key - 1] = obj[key];
		}
		var url_str = url.gether();
		window.location.hash = url_str;
	},

	gether: function () {
		return url.arr.join( '/' );
	}
}


var goto_permalink = function () {
	var $main = $( '.main' );
	var hash_2 = url.get( 2 );
	var hash_3 = url.get( 3 );

	var permalink = hash_2;
	permalink += (hash_3) ? '/' + hash_3 : '';

	var $permalink = $( '[data-permalink="' + permalink + '"]' );
	if ( permalink && $permalink.length > 0 ) {
		$main.stop().animate( {
			scrollTop: $permalink[0].offsetTop - 65
		}, 200 );
	} else {
		$main.stop().animate( {
			scrollTop: 0
		}, 100 );
	}
};

var onpopstate = function onpopstate() {
	var page = url.get( 1 );

	var $main = $( '.main' );

	var update = function ( response, page ) {
		url.page[page] = response;

		if ( url.current_page !== url.get( 1 ) ) {
			url.current_page = url.get( 1 );
			$main.html( response );
			if ( typeof page_func[page] == 'function' ) {
				page_func[page]();
			}
			page_func.after_all();
		}
		goto_permalink();
	};

	if ( !page ) {
		page = 'about';
	}

	$( '.sidebar a' ).removeClass( 'on' );
	$( '#menu_' + page ).addClass( 'on' );

	if ( DEV ) {
		if ( !url.page[page] ) {
			$.ajax( {
				url    : 'pages/' + page + '.html',
				cache  : false,
				success: function ( response ) {
					update( response, page );
				}
			} );
		} else {
			update( url.page[page], page );
		}
	} else {
		$( '[data-section]' ).hide();
		$( '[data-section="' + page + '"]' ).show();
		goto_permalink();
	}
};


var page_func = {
		about  : function () {
		},
		methods: function () {
		},

		options: function () {
		},

		discuss: function () {
		},

		install: function () {
			var my_form_id_1 = new tFormer( 'my_form_id_1', {
				fields: {
					zip  : 'a1 l=5',
					email: {
						rules  : '* @',
						timeout: 500
					}
				}
			} );
		},

		examples: function () {
			var login_example = tFormer( 'login_example', {
				onerror: function () {
					$( this ).removeClass( 'ok' );
					$( this ).next( '.result_block' ).removeClass( 'ok' ).addClass( 'error' );
				},
				onvalid: function () {
					$( this ).addClass( 'ok' );
					$( this ).next( '.result_block' ).removeClass( 'error' ).addClass( 'ok' );
				},
				submit : function ( event ) {
					if ( event.preventDefault ) {
						event.preventDefault();
					} else {
						event.returnValue = false;
					}
					// rewriting default submit code
					alert( 'Your form passed all validations and submit core executed.' );
					login_example.processingOff();
					return false;
				}
			} );

			var visa_example = tFormer( 'visa_example', {
				onerror: function () {
					$( '#visa_example .card' ).removeClass( 'ok' ).addClass( 'error' );
				},
				onvalid: function () {
					if ( visa_example.valid ) {
						$( '#visa_example .card' ).removeClass( 'error' ).addClass( 'ok' );
					}
				},
				submit : function ( event ) {
					if ( event.preventDefault ) {
						event.preventDefault();
					} else {
						event.returnValue = false;
					}
					// rewriting default submit code
					alert( 'Your card verified successfully.' );
					visa_example.processingOff();
					return false;
				}
			} );

			var request_example = tFormer( 'request_example', {
				fields: {
					field_name: {
						url   : 'ajax.html',
						data  : {
							custom_param: 'custom value',
							twitter     : '@TjRus'
						},
						method: 'post',
						start : function () {
							console.log( 'request validation started' );
						},
						end   : function ( result ) {
							console.log( 'request validation ended' );
							return false;
						}
					}
				},
				submit: function ( event ) {
					if ( event.preventDefault ) {
						event.preventDefault();
					} else {
						event.returnValue = false;
					}
					// rewriting default submit code
					alert( 'Your request form verified successfully.' );
					request_example.processingOff();
					return false;
				}
			} );


			var check_button_example = tFormer( 'check_button_example', {
				fields: {
					field_name: '* l>=10'
				},
				submit: function ( event ) {
					if ( event.preventDefault ) {
						event.preventDefault();
					} else {
						event.returnValue = false;
					}
					// rewriting default submit code
					alert( 'Your form verified successfully.' );
					check_button_example.processingOff();
					return false;
				}
			} );

			var date_example = tFormer( 'date_example', {
				fields: {
					date_hard: {
						rules: '*',
						own: function(){
							return _v_(this.value).validateWithRules({rules: '*|D=Y-M-D R:I:S', rule_separator: '|'});
						}
					}
				},
				submit: function ( event ) {
					if ( event.preventDefault ) {
						event.preventDefault();
					} else {
						event.returnValue = false;
					}
					// rewriting default submit code
					alert( 'Your form verified successfully.' );
					date_example.processingOff();
					return false;
				}
			} );

		},

		after_all: function () {
			$( 'code:not(.prettyprint)' ).addClass( 'prettyprint' ).addClass( 'linenums' );
			prettyPrint();

			$( '.code_tabs .tab' ).off().on( 'click', function () {
				$( this ).parents( '.details' ).find( 'pre' ).hide()
				if ( $( this ).hasClass( 'on' ) ) {
					$( this ).removeClass( 'on' );
				} else {
					$( this ).parents( '.code_tabs' ).find( '.tab' ).removeClass( 'on' );
					var type = $( this ).data( 'type' );
					$( this ).addClass( 'on' );
					$( this ).parents( '.details' ).find( 'pre[data-type="' + type + '"]' ).show();
				}
			} )
		}
	}
	;