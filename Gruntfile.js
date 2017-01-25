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
            socketUri: 'localhost:8000/'
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
            socketUri: 'tecom.me/'
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
  grunt.registerTask('ui', ['ngconstant:ui']);
  grunt.registerTask('lint', ['jshint']);
};
