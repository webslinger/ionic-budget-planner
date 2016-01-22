billTrack.controller('budgetCtrl', ['$scope', 'timeline', function($scope, timeline) {
    $scope.days = timeline.timeline;
    $scope.alarm = alarm_watch();
    $scope.warn = alarm_watch();

    $scope.$watch('$routeChangeSuccess', function() {
        timeline.processData();
        $scope.days = timeline.timeline;
        $scope.alarm = alarm_watch(0);
        $scope.warn = alarm_watch(500)
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

billTrack.controller('fundCtrl', ['$scope', 'balance', '$ionicPopover', function($scope, balance, $ionicPopover) {
    $scope.funds = balance.current;
    $scope.tip = {
        message: "Manually enter the funds you have in your checking account."
    };

    $ionicPopover.fromTemplateUrl('partials/snippets/tooltip.html', {
        scope: $scope
    }).then(function(popover) {
        $scope.popover = popover;
    });

    $scope.openPopover = function($event) {
        console.log('lalala');
        $scope.popover.show($event);
    };

    $scope.closePopover = function() {
        $scope.popover.hide();
    };
}]);

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

billTrack.controller('billCtrl', ['$scope', 'dues', '$ionicPopover', function($scope, dues, $ionicPopover) {
    $scope.dues = dues.list;
    $scope.form = {};
    $scope.editmode = false;

    // .fromTemplateUrl() method
    $ionicPopover.fromTemplateUrl('partials/snippets/addBill.html', {
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

    for (var due in $scope.dues) {
        if ($scope.dues.hasOwnProperty(due)) {
            $scope.dues[due].editmode = false;
        }
    }

    $scope.edit = function(due) {
        if (due.editmode) {
            due.editmode = false;
            dues.update();
        } else {
            due.editmode = true;
        }
    };

    $scope.add = function() {
        var new_bill = {
            label: $scope.form.label,
            amount: $scope.form.amount,
            day_of_month: $scope.form.day_of_month,
            editmode: false
        };
        dues.add(new_bill);
        dues.update();
        $scope.form = {};
        $scope.closePopover();
    };

    $scope.remove = function(source) {
        dues.remove(source);
        dues.update();
    };
}]);