'use strict';

module.exports = function (grunt) {
  grunt.initConfig({
    jshint: {
      files: [
        '*.js', 'app/*.js', 'app/**/*.js', 'app/**/**/*.js', 'app/**/**/**/*.js'
      ],
      options: {
        "node": true,
        "undef": true,
        "unused": false,
        "globalstrict": true,
        "globals": {
          "angular": true,
          "app": true,
          "io": true
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
            socketUri: '//localhost:8000/'
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
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-ng-constant');

  grunt.registerTask('dev', ['jshint', 'ngconstant:dev']);
  grunt.registerTask('ui', ['ngconstant:ui']);
};
