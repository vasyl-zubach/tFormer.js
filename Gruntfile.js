module.exports = function ( grunt ) {

	grunt.initConfig( {
		pkg: grunt.file.readJSON( 'package.json' ),

		gcc: {
			tFormer: {
				options: {
					compilation_level: 'SIMPLE_OPTIMIZATIONS',
					banner           : '/* <%= pkg.name %> v<%= pkg.version %>*/',
					create_source_map: 'map/<%= pkg.name %>-<%= pkg.version %>.min.js.map'
				},
				src    : '<%= pkg.name %>.js',
				dest   : '<%= pkg.name %>.min.js'
			}
		},

		copy: {
			main: {
				files: [
					{
						src : '<%= pkg.name %>.min.js',
						dest: 'versions/<%= pkg.name %>-<%= pkg.version %>.min.js'
					}
				]
			},
			map: {
				files: [
					{
						src : 'map/<%= pkg.name %>-<%= pkg.version %>.min.js.map',
						dest: '<%= pkg.name %>.min.js.map'
					}
				]
			}
		}

	} );

	grunt.loadNpmTasks( 'grunt-contrib-concat' );
	grunt.loadNpmTasks( 'grunt-contrib-copy' );
	grunt.loadNpmTasks( 'grunt-gcc' );

	grunt.registerTask( 'default', ['gcc', 'copy'] );
};