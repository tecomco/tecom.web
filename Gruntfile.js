'use strict';

module.exports = function (grunt) {

  var SRC_FILES = [
    '*.js', 'app/*.js', 'app/**/*.js', 'app/**/**/*.js', 'app/**/**/**/*.js'
  ];

  var UGLIFY_SRC_FILES = [
    'app/*.js', 'app/**/*.js', 'app/**/**/*.js', 'app/**/**/**/*.js'
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
        'validthis': true,
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
      // Environment targets
      local: {
        options: {
          dest: 'app/app.config.js'
        },
        constants: {
          ENV: {
            name: 'local',
            socketUri: 'ws.localhost:4000/'
          }
        }
      },
      dev: {
        options: {
          dest: 'app/app.config.js'
        },
        constants: {
          ENV: {
            name: 'dev',
            socketUri: 'ws.tecomdev.ir:4000/'
          }
        }
      },
      stage: {
        options: {
          dest: 'app/app.config.js'
        },
        constants: {
          ENV: {
            name: 'stage',
            socketUri: 'ws.tecomstage.ir/'
          }
        }
      },
      prod: {
        options: {
          dest: 'app/app.config.js'
        },
        constants: {
          ENV: {
            name: 'prod',
            socketUri: 'ws.tecom.me/'
          }
        }
      }
    },
    uglify: {
      my_target: {
        options: {
          mangle: false,
          beautify: true
        },
        files: {
          'app/tecom.min.js': UGLIFY_SRC_FILES
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
