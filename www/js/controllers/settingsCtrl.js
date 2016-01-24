billTrack.controller('settingsCtrl', ['$scope', 'notify', 'settings', function($scope, notify, settings) {
    $scope.settings = {
        texts: {
            warning_limit: {
                label: 'Warning',
                value: settings.warning_limit,
                type: 'number',
                tip: 'warningTooltip'
            },
            alarm_limit: {
                label: 'Alarm',
                value: settings.alarm_limit,
                type: 'number',
                tip: 'alarmTooltip'
            }
        },
        ranges: {
            projected_months: {
                label: 'Projected Months',
                tip: 'Set how many months to plot on the timeline.',
                value: settings.projected_months,
                min: 1,
                max: 12,
                step: 1
            }
        },
        checkboxes: {
            show_empty_days: {
                label: 'Show Empty Days',
                tip: 'Enable days without income or bills to show up in timeline.',
                checked: settings.show_empty_days
            }
        },
        selects: {}
    };

    $scope.warningTooltip = notify.tooltip('Set the level of funds that indicate you are in danger of going overbudget.', 'warningTooltip', $scope);
    $scope.alarmTooltip = notify.tooltip('Set the level of funds that indicate you have gone overbudget (.e.g, 0 or less).', 'alarmTooltip', $scope);
    $scope.openTooltip = function(tooltip) {
        $scope[tooltip].show();
    };


    $scope.save = function() {
        settings.warning_limit = $scope.settings.texts.warning_limit.value;
        settings.alarm_limit = $scope.settings.texts.alarm_limit.value;
        settings.projected_months = $scope.settings.ranges.projected_months.value;
        settings.show_empty_days = $scope.settings.checkboxes.show_empty_days.checked;
        localStorage.setItem('bp_settings', JSON.stringify(settings));
    }
}]);