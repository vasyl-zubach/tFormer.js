module.exports = function ( grunt ) {

	// Project configuration.
	grunt.initConfig( {
		pkg: grunt.file.readJSON( 'package.json' ),
		concat: {
			dist   : {
				src : [
					'pages/header.html',
					'pages/about.html',
					'pages/discuss.html',
					'pages/examples.html',
					'pages/features.html',
					'pages/install.html',
					'pages/methods.html',
					'pages/options.html',
					'pages/rules.html',
					'pages/footer.html'
				],
				dest: 'index.html'
			}
		}
	} );

	grunt.loadNpmTasks( 'grunt-contrib-concat' );

	grunt.registerTask( 'default', ['concat'] );
};