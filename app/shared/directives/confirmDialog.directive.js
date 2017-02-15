'use strict';

app.directive('confirmDialog', function () {
  return {
    scope: true,
    template: '<button class="btn btn-default danger-btn" mwl-confirm message="مطمئنی که می خوای این تیم رو ترک کنی ؟" confirm-text="آره" cancel-text="نه، حواسم نبود" placement="bottom" on-confirm="leaveTeam()" confirm-button-type="danger" cancel-button-type="default">'
  };
});
