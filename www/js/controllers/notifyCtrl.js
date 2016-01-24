billTrack.controller('notifyCtrl', ['$scope', 'timeline', 'notify', 'settings', function($scope, timeline, notify, settings) {
    $scope.days = timeline.timeline;
    $scope.alarm = {
        msg: "It looks like you've run overbudget.",
        active: alarm_watch(settings.alarm_limit)
    };
    $scope.warning = {
        msg: "It looks like you're at risk of going overbudget.",
        active: alarm_watch(settings.warning_limit)
    };

    $scope.hidden = notify.hide;

    $scope.hide = function(notification) {
        notify.hide[notification] = true;
    };

    $scope.$watch('$routeChangeSuccess', function() {
        $scope.days = timeline.timeline;
        $scope.alarm.active = alarm_watch(settings.alarm_limit);
        $scope.warning.active = alarm_watch(settings.warning_limit);
    });

    function alarm_watch(cutoff) {
        for (var i = 0; i < $scope.days.length; i++) {
            $scope.days[i]['limit'] = {};
            $scope.days[i].limit.alarm = settings.alarm_limit;
            $scope.days[i].limit.warning = settings.warning_limit;
            if ($scope.days[i].balance <= cutoff) {
                return true;
            }
        }
        return false;
    }
}]);