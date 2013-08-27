var hash;

$( document ).ready( function (){
	$( 'code:not(.prettyprint)' ).addClass( 'prettyprint' ).addClass( 'linenums' );
	prettyPrint();

	$( '[data-tab]' ).off( 'click' ).on( 'click', function (){
		var $self = $( this ),
			tab = $self.data( 'tab' ),
			$permalink = $( $self.parents( '[data-permalink]' ).get( 0 ) );

		$permalink.find( 'pre[data-tab]' ).hide();
		if ( $self.hasClass( 'on' ) ) {
			$self.removeClass( 'on' );
			$permalink.find( 'pre[data-tab="' + tab + '"]' ).hide();
		} else {
			$permalink.find( '.tab' ).removeClass( 'on' );
			$self.addClass( 'on' );
			$permalink.find( 'pre[data-tab="' + tab + '"]' ).show();
		}
	} );

	$( '.sidebar a' ).on( 'click', function (){
		onpopstate();
	} );

	$( '.item-name' ).on( 'click', function (){
		var $this = $( this ),
			$block = $this.parents( '[data-permalink]' ),
			hash = $block.data( 'permalink' );
		window.location.hash = hash;
	} );

	examples();
} );

setInterval( function (){
	var new_hash = window.location.hash
	if ( hash != new_hash ) {
		hash = new_hash;
		onpopstate();
	}
}, 30 );



var url = {
	current: '',
	arr    : [],
	page   : [],

	get: function ( num ){
		var hash = window.location.hash;
		if ( url.current != hash ) {
			url.current = hash;
			url.arr = hash.replace( '#', '' ).split( '/' );
		}
		return url.arr[num - 1] || '';
	},

	set: function ( obj ){
		for ( var key in obj ) {
			url.arr[key - 1] = obj[key];
		}
		var url_str = url.gether();
		window.location.hash = url_str;
	},

	gether: function (){
		return url.arr.join( '/' );
	}
};

var onpopstate = function onpopstate (){
	var $main = $( '.main' ),
		page = url.get( 1 ),
		hash_2 = url.get( 2 ),
		hash_3 = url.get( 3 ),
		permalink = page + (hash_2 ? '/' + hash_2 : '') + ((hash_3) ? '/' + hash_3 : ''),
		$permalink = $( '[data-permalink="' + permalink + '"]' );

	$( '.sidebar a' ).removeClass( 'on' );
	$( '[data-menu="' + page + '"]' ).addClass( 'on' );

	if ( permalink && $permalink.length > 0 ) {
		$main.scrollTop( $permalink[0].offsetTop - 65 );
	} else {
		$main.scrollTop( 0 );
	}
};




var examples = function (){
	var my_form_id = new tFormer( 'my_form_id_1', {
		fields: {
			zip  : 'a1 l=5', // define only rules
			email: { //defining rules and other options
				rules  : '* @',
				timeout: 500
			}
		}
	} );


	var login_example = tFormer( 'login_example', {
		onerror: function (){
			console.log( 'onerror' );
			$( this ).removeClass( 'ok' );
			$( this ).next( '.result_block' ).removeClass( 'ok' ).addClass( 'error' );
		},
		onvalid: function (){
			console.log( 'onvalid' );
			$( this ).addClass( 'ok' );
			$( this ).next( '.result_block' ).removeClass( 'error' ).addClass( 'ok' );
		}
	} ).submit( function (){
			alert( 'Your form passed all validations and submit core executed.' );
			console.log( login_example.processing( false ).toObject() );
		} );


	var visa_example = tFormer( 'visa_example', {
		onerror: function (){
			$( '#visa_example .card' ).removeClass( 'ok' ).addClass( 'error' );
		},
		onvalid: function (){
			if ( visa_example.valid ) {
				$( '#visa_example .card' ).removeClass( 'error' ).addClass( 'ok' );
			}
		}
	} ).submit( function (){
			// rewriting default submit code
			alert( 'Your card verified successfully.' );
			visa_example.processing( false );
		} );


	var request_example = tFormer( 'request_example', {
		fields: {
			field_name: {
				request: {
					url   : 'ajax.html',
					method: 'post',
					data  : {
						custom_param: 'custom value',
						twitter     : '@TjRus'
					},
					start : function (){
						console.log( 'request validation started' );
					},
					end   : function ( result ){
						console.log( 'request validation ended' );
						return this.value == 'true';
					}
				}
			}
		}
	} ).submit( function (){
			// rewriting default submit code
			alert( 'Your request form verified successfully.' );
			request_example.processing( false );
		} );


	var check_button_example = tFormer( 'check_button_example', {
		fields: {
			field_name: '* l>=10'
		}
	} ).submit( function (){
			// rewriting default submit code
			alert( 'Your form verified successfully.' );
			check_button_example.processing( false );
		} );





};
