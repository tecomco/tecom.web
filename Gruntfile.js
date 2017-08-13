'use strict';

module.exports = function (grunt) {

  var SRC_FILES = [
    '*.js', 'app/*.js', 'app/**/*.js', 'app/**/**/*.js', 'app/**/**/**/*.js'
  ];

  var ENV_CONFIG_PATH = 'app/app.config.js';

  grunt.initConfig({
    jshint: {
      files: SRC_FILES,
      options: {
        'node': true,
        'undef': true,
        'unused': false,
        'globalstrict': true,
        '-W100': true,
        'globals': {
          'angular': true,
          'app': true,
          'io': true,
          'document': true,
          'window': true,
          'Promise': true
        }
      }
    },
    ngconstant: {
      options: {
        space: '  ',
        wrap: '\'use strict\';\n\n {\%= __ngModule %}',
        name: 'config',
        dest: ENV_CONFIG_PATH
      },
      dev: {
        constants: {
          ENV: {
            name: 'dev',
            socketUri: 'ws.localhost:4000/'
          }
        }
      },
      stage: {
        constants: {
          ENV: {
            name: 'stage',
            socketUri: 'ws.tecomstage.ir:4000/'
          }
        }
      },
      prod: {
        constants: {
          ENV: {
            name: 'prod',
            socketUri: 'ws.tecom.me:4000/'
          }
        }
      }
    },
    uglify: {
      my_target: {
        files: {
          'dist/tecom.min.js': SRC_FILES
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-ng-constant');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.registerTask('dev', ['jshint', 'ngconstant:dev']);
  grunt.registerTask('stage', ['jshint', 'ngconstant:stage']);
  grunt.registerTask('prod', ['jshint', 'ngconstant:prod']);
  grunt.registerTask('lint', ['jshint']);
};
