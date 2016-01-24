billTrack.controller('incomeCtrl', ['$scope', 'income', '$ionicPopover', function($scope, income, $ionicPopover) {
    $scope.incomes = income.list;
    $scope.form = {};
    $scope.editmode = false;

    $ionicPopover.fromTemplateUrl('partials/snippets/addIncome.html', {
        scope: $scope
    }).then(function(popover) {
        $scope.popover = popover;
    });

    $scope.openPopover = function($event) {
        $scope.popover.show($event);
    };

    $scope.closePopover = function() {
        $scope.popover.hide();
    };

    //Cleanup the popover when we're done with it!
    $scope.$on('$destroy', function() {
        $scope.popover.remove();
    });

    for (var inc in $scope.incomes) {
        if ($scope.incomes.hasOwnProperty(inc)) {
            $scope.incomes[inc].editmode = false;
        }
    }

    $scope.edit = function(inc) {
        if (inc.editmode) {
            inc.editmode = false;
            income.update();
        } else {
            inc.editmode = true;
        }
    };

    $scope.add = function() {
        var new_income = {
            label: $scope.form.label,
            amount: $scope.form.amount,
            frequency: $scope.form.frequency,
            frequency_options: $scope.form.frequency_options
        };
        switch ($scope.form.frequency) {
            case "1":
                new_income.frequency_label = 'Semi-Monthly';
                new_income.day_of_month = $scope.form.frequency_options.split(',');
                break;
            case "2":
                new_income.frequency_label = 'Bi-Weekly';
                new_income.day_of_month = $scope.form.frequency_options;
                new_income.registered_payday = function() {
                    if (today.getDate() > new_income.day_of_month) {
                        return new Date(today.getFullYear(), today.getMonth() + 1, new_income.day_of_month);
                    } else {
                        return new Date(today.getFullYear(), today.getMonth(), new_income.day_of_month);
                    }
                };
                break;
        }
        income.add(new_income);
        income.update();
        $scope.form = {};
        $scope.closePopover();
    };

    $scope.remove = function(source) {
        income.remove(source);
        income.update();
    };
}]);