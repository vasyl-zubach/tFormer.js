module.exports = function ( grunt ){

	grunt.initConfig( {
		pkg: grunt.file.readJSON( 'package.json' ),

		'curl-dir': {
			dash_v_dash: {
				src : [
					'http://rawgithub.com/TjRus/_v_.js/master/_v_.js',
					'http://rawgithub.com/TjRus/_v_.js/master/_v_.min.js'
				],
				dest: '.'
			}
		},

		concat: {
			src: {
				src : [
					'tFormer.dev.js',
					'_v_.js'
				],
				dest: 'tFormer.js'
			},
			min: {
				src : [
					'tFormer.gcc.js',
					'_v_.min.js'
				],
				dest: 'tFormer.min.js'
			}


		},

		gcc: {
			tFormer: {
				options: {
					compilation_level: 'SIMPLE_OPTIMIZATIONS',
					banner           : '/* <%= pkg.name %> v<%= pkg.version %>*/'
				},
				src    : '<%= pkg.name %>.dev.js',
				dest   : '<%= pkg.name %>.gcc.js'
			}
		}
	} );

	grunt.loadNpmTasks( 'grunt-contrib-concat' );
	grunt.loadNpmTasks( 'grunt-gcc' );
	grunt.loadNpmTasks( 'grunt-curl' );

	grunt.registerTask( 'curl', ['curl-dir'] );
	grunt.registerTask( 'default', ['curl', 'gcc', 'concat'] );
};