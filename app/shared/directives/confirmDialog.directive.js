'use strict';

app.directive('confirmDialog', function () {
  return {
    scope: {
      buttonName:'@',
      message:'@',
      cancel:'@',
      ok:'@',
      confirmFunc:'&',
    },
    template: '<button class="danger-btn" mwl-confirm message="{{message}}" confirm-text="{{ok}}" cancel-text="{{cancel}}" placement="bottom" on-confirm="callUpdate()" confirm-button-type="danger" cancel-button-type="default">{{buttonName}}</button>',
    replace: true,
    link: function(scope, elm, attrs){
      scope.callUpdate = function() {
        scope.confirmFunc()();
      };
    }
  };
});
