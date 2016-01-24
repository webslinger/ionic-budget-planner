billTrack.directive('alarm', function() {
   return {
       restrict: 'E',
       template:
        "<div class='item item-icon-left alarm' ng-show='alarm.active && !hidden.alarm'>" +
            "<i class='icon ion-alert-circled'></i>" +
            "<i class='icon ion-trash-a' ng-click='hide(\"alarm\")'></i>" +
            "{{ alarm.msg }}" +
        "</div>"
   }
});

billTrack.directive('warning', function() {
    return {
        restrict: 'E',
        template:
        "<div class='item item-icon-left warn' ng-show='warning.active && !alarm.active && !hidden.warning'>" +
            "<i class='icon ion-information-circled'></i>" +
            "<i class='icon ion-trash-a' ng-click='hide(\"warning\")'></i>" +
            "{{ warning.msg }}" +
        "</div>"
    }
});