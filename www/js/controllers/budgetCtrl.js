billTrack.controller('budgetCtrl', ['$scope', 'timeline', 'settings', function($scope, timeline, settings) {
    $scope.days = timeline.timeline;
    $scope.alarm = alarm_watch(settings.alarm_limit);
    $scope.warn = alarm_watch(settings.warning_limit);

    $scope.$watch('$routeChangeSuccess', function() {
        $scope.alarm = alarm_watch(settings.alarm_limit);
        $scope.warn = alarm_watch(settings.warning_limit)
        timeline.processData();
        $scope.days = timeline.timeline;
    });

    function alarm_watch(cutoff) {
        for (var i = 0; i < $scope.days.length; i++) {
            if ($scope.days[i].balance <= cutoff) {
                return true;
            }
        }
        return false;
    }
}]);