module.exports = function ( grunt ) {

	// Project configuration.
	grunt.initConfig( {
		pkg: grunt.file.readJSON( 'package.json' ),
		concat: {
			dist   : {
				src : [
					'pages/header.html',
					'pages/*.html',
					'pages/footer.html'
				],
				dest: 'index.html'
			}
		}
	} );

	grunt.loadNpmTasks( 'grunt-contrib-concat' );

	grunt.registerTask( 'default', ['concat'] );
};