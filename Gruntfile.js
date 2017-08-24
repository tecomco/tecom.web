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
    ngAnnotate: {
      options: {
        singleQuotes: true
      },
      app: {
        files: {
          'dist/min-safe/app.js': ['app/app.module.js',
            'app/app.routes.js',
            'app/app.config.js'
          ],
          'dist/min-safe/shared.js': ['app/shared/utils/array.util.js',
            'app/shared/utils/text.util.js',
            'app/shared/utils/domain.util.js',
            'app/shared/utils/validation.util.js',
            'app/shared/utils/date.util.js',
            'app/shared/utils/file.util.js',
            'app/shared/directives/compile.directive.js',
            'app/shared/directives/confirmDialog.directive.js',
            'app/shared/socket/socket.service.js',
            'app/shared/auth/user.model.js',
            'app/shared/auth/team.model.js',
            'app/shared/auth/team.service.js',
            'app/shared/auth/current-member.model.js',
            'app/shared/auth/member.model.js',
            'app/shared/auth/auth.service.js',
            'app/shared/db/db.service.js',
            'app/shared/cache/cache.js',
            'app/shared/cache/cache.service.js',
            'app/shared/exceptions/exception-handler.js',
            'app/shared/http/http.interceptors.js'
          ],
          'dist/min-safe/components.js': [
            'app/components/messenger/messenger.ctrl.js',
            'app/components/messenger/channels/channel.model.js',
            'app/components/messenger/channels/channels.ctrl.js',
            'app/components/messenger/channels/channel-create.ctrl.js',
            'app/components/messenger/channels/channel-details.ctrl.js',
            'app/components/messenger/channels/channels.service.js',
            'app/components/messenger/channels/channel-member-item.model.js',
            'app/components/messenger/header/header.ctrl.js',
            'app/components/messenger/messages/message.model.js',
            'app/components/messenger/messages/messages.ctrl.js',
            'app/components/messenger/messages/messages.service.js',
            'app/components/files/files.ctrl.js',
            'app/components/files/filemanager-files.ctrl.js',
            'app/components/files/files.service.js',
            'app/components/files/file.model.js',
            'app/components/files/filemanager-file.model.js',
            'app/components/profile/user.profile.ctrl.js',
            'app/components/profile/team.profile.ctrl.js',
            'app/components/profile/profile.service.js'
          ],
        }
      }
    },
    concat: {
      js: {
        src: ['dist/min-safe/app.js',
          'dist/min-safe/shared.js',
          'dist/min-safe/components.js'
        ],
        dest: 'dist/tecom.concat.js'
      }
    },
    uglify: {
      js: {
        src: ['dist/tecom.concat.js'],
        dest: 'dist/tecom.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-ng-constant');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-ng-annotate');
  grunt.registerTask('dev', ['jshint', 'ngconstant:dev']);
  grunt.registerTask('stage', ['jshint', 'ngconstant:stage', 'minify']);
  grunt.registerTask('prod', ['jshint', 'ngconstant:prod', 'minify']);
  grunt.registerTask('lint', ['jshint']);
  grunt.registerTask('minify', ['ngAnnotate', 'concat', 'uglify']);
};
