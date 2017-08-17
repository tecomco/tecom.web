'use strict';

module.exports = function (grunt) {

  var SRC_FILES = [
    '*.js', 'app/*.js', 'app/**/*.js', 'app/**/**/*.js', 'app/**/**/**/*.js'
  ];

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
          'Promise': true,
          'FileReader': true
        }
      }
    },
    ngconstant: {
      // Options for all targets
      options: {
        space: '  ',
        wrap: '\'use strict\';\n\n {\%= __ngModule %}',
        name: 'config',
      },
      // Environment targets
      dev: {
        options: {
          dest: 'app/app.config.js'
        },
        constants: {
          ENV: {
            name: 'dev',
            socketUri: 'ws.localhost:4000/'
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
      },
      ui: {
        options: {
          dest: 'app/app.config.js'
        },
        constants: {
          ENV: {
            name: 'ui',
            socketUri: ''
          }
        }
      }
    },
    jsdoc: {
      dist: {
        src: SRC_FILES,
        options: {
          destination: 'docs'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-ng-constant');
  grunt.loadNpmTasks('grunt-jsdoc');

  grunt.registerTask('dev', ['jshint', 'ngconstant:dev', 'jsdoc']);
  grunt.registerTask('stage', ['jshint', 'ngconstant:stage']);
  grunt.registerTask('prod', ['jshint', 'ngconstant:prod']);
  grunt.registerTask('ui', ['ngconstant:ui']);
  grunt.registerTask('lint', ['jshint']);
};
