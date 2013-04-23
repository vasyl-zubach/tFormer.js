module.exports = function ( grunt ) {

	// Project configuration.
	grunt.initConfig( {
		pkg: grunt.file.readJSON( 'package.json' ),

		//		autoprefixer: {
		//			options: {
		//				browsers: ['last 2 version', '> 1%', 'ie 8', 'ie 7']
		//			},
		//			files  : {
		//				'css/styles.build.css': ['css/page.css', 'css/prettify.css', 'css/form.css', 'css/examples.css']
		//			}
		//		},

		concat: {
			dist   : {
				src : [
					'header.html',
					'pages/*.html',
					'footer.html'
				],
				dest: 'index.html'
			}
		},


		gcc: {
			dist: {
				options: {
					compilation_level: 'SIMPLE_OPTIMIZATIONS',
					banner           : '/* <%= pkg.name %> v<%= pkg.version %>*/',
					create_source_map: 'build/<%= pkg.name %>.min.js.map'
				},
				src    : 'src/<%= pkg.name %>.src.js',
				dest   : 'build/<%= pkg.name %>.min.js'
			}
		}
	} );

	// Load the plugin that provides the "uglify" task.
	//	grunt.loadNpmTasks( 'grunt-contrib-uglify' );
	grunt.loadNpmTasks( 'grunt-contrib-concat' );

	grunt.loadNpmTasks( 'grunt-gcc' );
	//	grunt.loadNpmTasks( 'grunt-autoprefixer' );

	// Default task(s).
	grunt.registerTask( 'default', ['concat', 'gcc'] );

	grunt.registerTask( 'min', ['gcc'] );

//	grunt.registerTask( 'concat', ['concat'] );

	//	grunt.registerTask( 'prefix', ['autoprefixer'] );
};