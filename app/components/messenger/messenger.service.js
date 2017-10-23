/*jshint esversion: 6 */

'use strict';

app.service('messengerService', ['$http', '$log', '$q', '$templateCache', 'ENV',
  function ($http, $log, $q, $templateCache, ENV) {

    function cacheMessagesTemplates() {
      $http.get(
        ENV.staticUri +
        '/app/components/messenger/messages/messages.view.html?v=1.1.2', {
          cache: $templateCache
        });
      $http.get(ENV.staticUri +
        '/app/components/messenger/header/header.view.html?v=1.0.5', {
          cache: $templateCache
        });
      $http.get(ENV.staticUri + '/app/components/files/files.view.html?v=1.0.6', {
        cache: $templateCache
      });
      $http.get(ENV.staticUri +
        '/app/components/files/filemanager-files.view.html?v=1.0.3', {
          cache: $templateCache
        });
    }

    function checkForAppUpdate() {
      var deferred = $q.defer();
      var appVersion = require('./package.json').version;
      var os = require('os').platform();
      $http.get(ENV.updateUri + os + '/' + appVersion)
        .then(function (updateData) {
          if (updateData.data.name &&
            updateData.data.name.split('.').join('') >
            appVersion.split('.').join(''))
            deferred.resolve(true);
          else
            deferred.resolve(false);
        })
        .catch(function (err) {
          deferred.reject();
          $log.info('Checing new updates failed.', err);
        });
      return deferred.promise;
    }

    function updateApplication() {
      const {
        ipcRenderer
      } = require('electron');
      ipcRenderer.send('start:update');
    }

    return {
      cacheMessagesTemplates: cacheMessagesTemplates,
      checkForAppUpdate: checkForAppUpdate,
      updateApplication: updateApplication,
    };
  }

]);
