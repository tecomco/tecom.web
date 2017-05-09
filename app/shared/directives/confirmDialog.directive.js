'use strict';

app.directive('confirmDialog', function () {

  function getTemplate(element, attrs) {
    var elementName = attrs.isAnchor ? 'a' : 'button';
    var templateString = '<' + elementName + ' class="{{class}}" ' +
      'mwl-confirm message="{{message}}" confirm-text="{{ok}}" ' +
      ' animation="true" cancel-text="{{cancel}}" placement="bottom" ' +
      ' on-confirm="callUpdate()" confirm-button-type="{{confirmButton}}" ' +
      ' cancel-button-type="default">';
    if (attrs.icon)
      templateString += '<span class="{{icon}}"></span>';
    else
      templateString += '{{buttonName}}';
    templateString += '</' + elementName + '>';
    return templateString;
  }
  return {
    scope: {
      class: '@',
      icon: '@',
      buttonName: '@',
      message: '@',
      cancel: '@',
      ok: '@',
      confirmButton: '@',
      isAnchor: '@',
      confirmFunc: '&',
      args: '=',
    },
    replace: true,
    template: getTemplate,
    link: function (scope, elm, attrs) {
      scope.callUpdate = function () {
        var fn = scope.confirmFunc();
        if (!scope.args)
          fn();
        else
          fn.apply(null, scope.args);
      };
    }
  };
});
