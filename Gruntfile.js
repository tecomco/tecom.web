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
      webLocal: {
        constants: {
          ENV: {
            name: 'web-local',
            socketUri: 'ws://ws.localhost:4000/',
            apiUri: 'http://api.localhost:8080',
            staticUri: 'http://static.localhost:8080',
            updateUri: '',
            isWeb: true
          }
        }
      },
      webProd: {
        constants: {
          ENV: {
            name: 'web-prod',
            socketUri: 'ws://ws.tecom.me/',
            apiUri: 'http://api.tecom.me',
            staticUri: 'http://static.tecom.me',
            updateUri: '',
            isWeb: true
          }
        }
      },
      webDev: {
        constants: {
          ENV: {
            name: 'web-dev',
            socketUri: 'ws://ws.tecomdev.ir:4000/',
            apiUri: 'http://api.tecomdev.ir',
            staticUri: 'http://static.tecomdev.ir',
            updateUri: '',
            isWeb: true
          }
        }
      },
      webStage: {
        constants: {
          ENV: {
            name: 'web-stage',
            socketUri: 'ws://ws.tecomstage.ir/',
            apiUri: 'http://api.tecomstage.ir',
            staticUri: 'http://static.tecomstage.ir',
            updateUri: '',
            isWeb: true
          }
        }
      },
      desktopLocal: {
        constants: {
          ENV: {
            name: 'desktop-local',
            socketUri: 'ws://ws.localhost:4000/',
            apiUri: 'http://api.localhost:8080',
            staticUri: 'http://static.localhost:8080',
            updateUri: '',
            isWeb: false
          }
        }
      },
      desktopProd: {
        constants: {
          ENV: {
            name: 'desktop-prod',
            socketUri: 'ws://ws.tecom.me/',
            apiUri: 'http://api.tecom.me',
            staticUri: 'http://static.tecom.me',
            updateUri: 'http://updates.tecom.me/update/',
            isWeb: false
          }
        }
      },
      desktopDev: {
        constants: {
          ENV: {
            name: 'desktop-dev',
            socketUri: 'ws://ws.tecomdev.ir:4000/',
            apiUri: 'http://api.tecomdev.ir',
            staticUri: 'http://static.tecomdev.ir',
            updateUri: 'http://updates.tecomdev.ir/update/',
            isWeb: false
          }
        }
      },
      desktopStage: {
        constants: {
          ENV: {
            name: 'desktop-stage',
            socketUri: 'ws://ws.tecomstage.ir/',
            apiUri: 'http://api.tecomstage.ir',
            staticUri: 'http://static.tecomstage.ir',
            updateUri: 'http://updates.tecomstage.ir/update/',
            isWeb: false
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
          'dist/min-safe/app.js': [
            'app/app.module.js',
            'app/app.routes.js',
            'app/app.config.js'
          ],
          'dist/min-safe/shared.js': [
            'app/shared/utils/array.util.js',
            'app/shared/utils/text.util.js',
            'app/shared/utils/domain.util.js',
            'app/shared/utils/validation.util.js',
            'app/shared/utils/date.util.js',
            'app/shared/utils/file.util.js',
            'app/shared/directives/compile.directive.js',
            'app/shared/directives/confirmDialog.directive.js',
            'app/shared/socket/socket.service.js',
            'app/shared/notification/notification.js',
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
            'app/components/messenger/messenger.service.js',
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
        src: [
          'dist/min-safe/app.js',
          'dist/min-safe/shared.js',
          'dist/min-safe/components.js'
        ],
        dest: 'dist/tecom.js'
      }
    },
    uglify: {
      js: {
        src: ['dist/tecom.js'],
        dest: 'dist/tecom.min.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-ng-constant');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-ng-annotate');
  grunt.registerTask('minify', ['ngAnnotate', 'concat', 'uglify']);
  grunt.registerTask('web-local', ['ngconstant:webLocal']);
  grunt.registerTask('web-dev', ['jshint', 'ngconstant:webDev']);
  grunt.registerTask('web-stage', ['jshint', 'ngconstant:webStage', 'minify']);
  grunt.registerTask('web-prod', ['jshint', 'ngconstant:webProd', 'minify']);
  grunt.registerTask('desktop-local', ['ngconstant:desktopLocal']);
  grunt.registerTask('desktop-dev', ['jshint', 'ngconstant:desktopDev']);
  grunt.registerTask('desktop-stage', ['jshint', 'ngconstant:desktopStage', 'minify']);
  grunt.registerTask('desktop-prod', ['jshint', 'ngconstant:desktopProd', 'minify']);
  grunt.registerTask('lint', ['jshint']);
  grunt.registerTask('minify', ['ngAnnotate', 'concat', 'uglify']);
};
