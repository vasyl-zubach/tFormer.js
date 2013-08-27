$( document ).on( 'click', '.permalink', function () {
	goto_permalink();
} );

var log_c = [];
var log = function ( id, value, descr ) {
	var $el = $( '#log_' + id );
	if ( !$el.length ) {
		$( 'body' ).append( '<div class="log" id="log_' + id + '" style="top: ' + 30 * id + 'px"></div>' );
	}
	var $el = $( '#log_' + id );
	$el.html( ((descr) ? descr + ': ' : '') + value );
};
var clearLog = function () {
	for ( var i = log_c.length; i > 0; i-- ) {
		clearInterval( log_c[i] );
	}
	log_c = [];
}


var hash;
setInterval( function () {
	var new_hash = window.location.hash
	if ( hash != new_hash ) {
		hash = new_hash;
		onpopstate();
	}
}, 30 );


var goto_permalink = function () {
	var $main = $( '.main' );

	var $permalink = $( '[data-url="' + hash.replace( '#', '' ) + '"]' );
	if ( hash && $permalink.length > 0 ) {
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
	var page = hash;
	$( '.sidebar a' ).removeClass( 'on' );
	$( '.sidebar a[href$="' + page + '"]' ).addClass( 'on' );
	goto_permalink();
};
