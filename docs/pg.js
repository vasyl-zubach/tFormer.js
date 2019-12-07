var PG = {
	el       : {},
	form     : {},
	tpl_arrs : {
		input   : ['text', 'email'],
		textarea: ['textarea'],
		checkbox: ['checkbox'],
		select  : ['select-one'],
		button  : ['button']
	},
	intervals: {},
	tpls     : {
		input   : '<input type="{{type}}" name="{{name}}" {{required}} />',
		textarea: '<textarea name="{{name}}" {{required}}></textarea>',
		checkbox: '<input type="checkbox" name="{{name}}" {{required}} />',
		button  : '<input type="button" data-check="{{name}}" value="Check button for \'{{name}}\' field" />',
		select  : '<select name="{{name}}" {{required}}>{{options}}</select>'
	},
	init     : function () {
		var self = PG;

		self.el.$form_pg = $( '#form_pg' );
		self.el.$sidebar = $( '.sidebar' );

		self.tpls.item = $( '#_tpl_item' ).html();
		self.tpls.info = $( '#_tpl_info' ).html();
		self.tpls.info_button = $( '#_tpl_info_button' ).html();
		self.tpls.info_form = $( '#_tpl_info_form' ).html();

		self.addInit();
		self.pgFormInit();
		self.selectInit();
	},

	addInit: function () {
		var self = PG,
			$type_select = $( '#form_add' ).find( 'select[name="field_type"]' );

		self.form.add = tFormer( 'form_add', {
			fields: {
				field_name: {
					rules: '*',
					own  : function () {
						var type = $type_select.val();
						var is_exist = $( self.el.$form_pg ).find( 'input[name="' + this.value + '"]' ).length > 0,
							is_nospaced = _v_( this.value ).separate( '|' ).validate( '*|! ' );
						if ( type == "button" ) {
							if ( $( self.el.$form_pg ).find( 'input[name="' + this.value + '"]' ).length === 0 || $( self.el.$form_pg ).find( 'input[data-check="' + this.value + '"]' ).length > 0 ) {
								return false;
							}
							return true;
						}

						if ( is_exist || !is_nospaced ) {
							return false;
						}
						return true;
					}
				}
			}
		} ).submit( function ( e, tf ) {
				self.addField( tf.toObject() );
				tf.form.reset();
				tf.button( 'submit' ).processingOff();
				tf.validate( {highlight: false} );
			} );

		$type_select.on( 'change', function () {
			self.form.add.field( 'field_name' ).validate( {highlight: false} );
			$( self.form.add.field( 'field_name' ).field ).focus();
		} );
	},

	addField: function ( obj ) {
		var self = PG,
			tpl = '',
			tpl_key = '';
		for ( var key in self.tpls ) {
			if ( ~$.inArray( obj.field_type, self.tpl_arrs[key] ) ) {
				tpl = self.tpls[key];
				tpl_key = key;
			}
		}
		if ( !tpl ) {
			return;
		}

		tpl = self.tpls.item.replace( new RegExp( '{{el}}', 'g' ), tpl );
		tpl = tpl.replace( new RegExp( '{{name}}', 'g' ), obj.field_name );
		tpl = tpl.replace( new RegExp( '{{type}}', 'g' ), obj.field_type );

		tpl = tpl.replace( new RegExp( '{{required}}', 'g' ), obj.field_required ? 'required' : '' );

		self.el.$form_pg.append( tpl );

		self.pgFormInit();
	},

	pgFormInit: function () {
		var self = PG;
		self.form.pg = tFormer( 'form_pg', {
			submitButton       : $( '#form_pg_submit' )[0],
			onerror            : function () {
				console.log( 'onerror: ' + this.name );
			},
			onvalid            : function () {
				console.log( 'onvalid: ' + this.name );
			},
			submitButtonControl: true
		} ).submit( function ( e, tf ) {
				console.log( tf.toObject() );
				tf.button( 'submit' ).processingOff();
			} );

		if ( self.intervals.form_pg_stats ) {
			clearInterval( self.intervals.form_pg_stats );
		}
		self.intervals.form_pg_stats = setInterval( function () {
			$( '#form_pg_valid' ).html( self.form.pg.valid.toString() );
			$( '#form_pg_invalid' ).html( self.form.pg.invalid );
		}, 50 );
	},

	selectInit: function () {
		var self = PG;
		$( document ).on( 'click', '.item-select', function () {
			$( '.item-select' ).parent().removeClass( 'on' );
			var $parent = $( this ).parent();
			$parent.addClass( 'on' );
			self.reloadFieldInfo( $parent.data( 'name' ), $parent.data( 'type' ) );
		} );
	},

	reloadFieldInfo: function ( name, type ) {
		var self = PG,
			info,
			el;
		if ( type == 'button' ) {
			info = self.tpls.info_button;
			el = self.form.pg.button( name );
		} else if ( type == "form" ) {
			info = self.tpls.info_form;
			el = self.form.pg;
		} else {
			info = self.tpls.info;
			el = self.form.pg.field( name );
		}

		info = info.replace( new RegExp( '{{name}}', 'g' ), name );

		info = info.replace( new RegExp( '{{errorClass}}', 'g' ), el.get( 'errorClass' ) );
		info = info.replace( new RegExp( '{{disabledClass}}', 'g' ), el.get( 'disabledClass' ) );
		info = info.replace( new RegExp( '{{processingClass}}', 'g' ), el.get( 'processingClass' ) );
		info = info.replace( new RegExp( '{{timeout}}', 'g' ), el.get( 'timeout' ) );
		info = info.replace( new RegExp( '{{requestTimeout}}', 'g' ), el.get( 'requestTimeout' ) );
		info = info.replace( new RegExp( '{{validateEvent}}', 'g' ), el.get( 'validateEvent' ) );
		info = info.replace( new RegExp( '{{rules}}', 'g' ), el.get( 'rules' ) );

		self.el.$sidebar.html( info );

		self.el.$sidebar.find( '.btn' ).find( '[contenteditable]' ).off( 'keypress' ).on( 'keypress', function ( e ) {
			if ( e.keyCode == 13 ) {
				e.preventDefault();
				$( this ).parents( '.btn' ).trigger( 'click' );
				return false;
			}
		} );

		self.el.$sidebar.find( '.btn' ).off( 'click' ).on( 'click', function ( e ) {
			if ( e.target.isContentEditable ) {
				return;
			}
			var method = $( this ).data( 'method' ),
				option = $( this ).data( 'option' ),
				action = $( this ).data( 'action' );

			switch ( method ) {
				case 'init' :
				case 'destroy' :
				case 'drop' :
				case 'validate' :
					el[method]();
					break;

				case 'errorOn':
				case 'errorOff':
				case 'holdOn':
				case 'holdOff':
				case 'processingOn':
				case 'processingOff':
				case 'submitDisable':
				case 'submitEnable':
					el[method]();
					method = false;
					break;

				case 'get':
					console.log( el[method]( $( this ).find( 'span' ).text() ) );
					method = false;
					break;

				case 'set':
					el[method]( $.parseJSON( $( this ).find( 'span' ).text() ) );
					break;

				case 'setRules':
				case 'addRules':
				case 'delRule':
				case 'execute':
					el[method]( $( this ).find( 'span' ).text() );
					break;

				case 'hasRules':
					console.log( 'hasRule: ' + el[method]( $( this ).find( 'span' ).text() ).toString() );
					method = false;
					break;

				case 'error':
				case 'hold':
				case 'processing':
					el[method]( $( this ).find( 'span' ).text() === 'true' );
					method = false;
					break;

				case 'button':
				case 'field':
					console.log( el[method]( $( this ).find( 'span' ).text() ) );
					method = false;
					break;
			}

			if ( option ) {
				var options = {}
				options[option] = $( this ).find( 'span' ).text();
				el.set( options );
			}

			switch ( action ) {
				case 'field_object' :
					console.log( el );
					break;
			}

			if ( method || option ) {
				self.reloadFieldInfo( name, type );
			}

		} );
	}

};

$( document ).ready( function () {
	PG.init();
} );
