'use strict';

app.directive('compile', ['$compile', function ($compile) {
  return {
    scope: true,
    link: function (scope, element, attrs) {

      attrs.$observe('template', function (template) {
        if (angular.isDefined(template)) {
          template = '<div>' + template + '</div>';
          var compiled = $compile(template)(scope);
          element.html('');
          element.append(compiled);
        }
      });

    }
  };
}]);
