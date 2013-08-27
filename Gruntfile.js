module.exports = function ( grunt ){

	grunt.initConfig( {
		pkg: grunt.file.readJSON( 'package.json' ),

		'curl-dir': {
			tFormers: {
				src : [
					'http://master.tformer.js/tFormer.js',
					'http://master.tformer.js/tFormer.min.js'
				],
				dest: '.'
			},
			tests: {
				src: [
					'http://master.tformer.js/test/ajax.html',
					'http://master.tformer.js/test/index.html',
					'http://master.tformer.js/test/tFormer.html5.spec.js',
					'http://master.tformer.js/test/tFormer.methods.spec.js',
					'http://master.tformer.js/test/tFormer.options.spec.js',
					'http://master.tformer.js/test/tFormer.ui.spec.js'
				],
				dest: './test/'
			},
			testjs: {
				src: [
					'http://master.tformer.js/test/js/jquery.min.js',
					'http://master.tformer.js/test/js/run_tests.js'
				],
				dest: './test/js/'
			},
			testjs_jasmine: {
				src: [
					'http://master.tformer.js/test/js/jasmine/jasmine.js',
					'http://master.tformer.js/test/js/jasmine/jasmine.css',
					'http://master.tformer.js/test/js/jasmine/jasmine-html.js',
					'http://master.tformer.js/test/js/jasmine/MIT.LICENSE'
				],
				dest: './test/js/jasmine'
			}
		}
	} );

	grunt.loadNpmTasks( 'grunt-curl' );

	grunt.registerTask( 'curl', ['curl-dir'] );
	grunt.registerTask( 'default', ['curl'] );
};