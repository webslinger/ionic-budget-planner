// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var billTrack = angular.module('starter', ['ui.router', 'ionic']);

billTrack.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        if(window.cordova && window.cordova.plugins.Keyboard) {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

            // Don't remove this line unless you know what you are doing. It stops the viewport
            // from snapping when text inputs are focused. Ionic handles this internally for
            // a much nicer keyboard experience.
            cordova.plugins.Keyboard.disableScroll(true);
        }
        if(window.StatusBar) {
            StatusBar.styleDefault();
        }
    });
});

billTrack.constant('projectedMonths', 3);

billTrack.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/");
    $stateProvider
        .state('home', {
            url: "/",
            templateUrl: "partials/main-app.html",
            controller: 'budgetCtrl'
        })
        .state('bills', {
            url: "/manage/bills",
            templateUrl: "partials/manage-outgoing.html",
            controller: 'billCtrl'
        })
        .state('income', {
            url: "/manage/income",
            templateUrl: "partials/manage-incoming.html",
            controller: 'incomeCtrl'
        })
        .state('banked', {
            url: "/manage/funds",
            templateUrl: "partials/manage-funds.html",
            controller: 'fundCtrl'
        })
        .state('settings', {
            url: "/settings",
            templateUrl: "partials/settings.html",
            controller: 'settingsCtrl'
        });
});
billTrack.factory('balance', function() {
    var balance = {};
    balance.current = parseFloat(localStorage.getItem('bp_balance')) || 0;
    balance.trend = {
        banked: [],
        outgoing: [],
        incoming: []
    };
    balance.add = function(data) {
        balance.trend.series.push(data);
    };
    balance.update = function(value) {
        balance.current = value;
        localStorage.setItem('bp_balance', balance.current);
    };

    return balance;
});
billTrack.factory('dues', function() {
    var dues = {};
    dues.list = JSON.parse(localStorage.getItem('bp_dues')) || [];
    dues.add = function(bill) {
        dues.list.push(bill);
    };
    dues.remove = function(bill) {
        if (dues.list.indexOf(bill) !== -1) {
            dues.list.splice(dues.list.indexOf(bill),1);
        }
    };
    dues.update = function() {
        for (var d = 0; d < dues.list.length; d++) {
            try {
                dues.list[d].amount = parseFloat(dues.list[d].amount);
                dues.list[d].day_of_month = parseInt(dues.list[d].day_of_month);
                dues.list[d].showContents = false;
            } catch(e) {
                dues.list.splice(d,1);
            }
        }
        localStorage.setItem('bp_dues', JSON.stringify(dues.list));
    };
    dues.update();
    return dues;
});
billTrack.factory('budgets', function() {
    var budgets = JSON.parse(localStorage.getItem('bp_budgets')) || [
       {
           label: 'Groceries',
           min: 0,
           max: 1000,
           step: 25,
           value: 0,
           interval: "2"
       },
       {
           label: 'Gasoline',
           min: 0,
           max: 1000,
           step: 25,
           value: 0,
           interval: "2"
       },
       {
           label: 'Coffee',
           min: 0,
           max: 500,
           step: 5,
           value: 0,
           interval: "1"
       },
       {
           label: 'Fun',
           min: 0,
           max: 1000,
           step: 25,
           value: 0,
           interval: "2"
       }
    ];
    return budgets;
});
billTrack.factory('income', function() {
    var income = {};
    income.list = JSON.parse(localStorage.getItem('bp_income')) || [];
    income.add = function(pay) {
        income.list.push(pay);
        return income.list;
    };
    income.remove = function(pay) {
        if (income.list.indexOf(pay) !== -1) {
            income.list.splice(income.list.indexOf(pay),1);
        }
    };
    income.update = function() {
        for (var i = 0; i < income.list.length; i++) {
            try {
                income.list[i].amount = parseFloat(income.list[i].amount);
                income.list[i].next_pay = false;
                income.list[i].showContents = false;
                if (income.list[i].frequency == "2") {
                    income.list[i].frequency_options = new Date(income.list[i].frequency_options);
                    income.list[i].registered_date = new Date(income.list[i].day_of_month);
                    while (income.list[i].registered_date < new Date()) {
                        income.list[i].registered_date = new Date(
                            income.list[i].registered_date.getFullYear(),
                            income.list[i].registered_date.getMonth(),
                            income.list[i].registered_date.getDate() + 14
                        );
                    }
                    income.list[i].day_of_month = income.list[i].registered_date;
                }
            } catch(e) {
                income.list.splice(i,1);
            }
        }
        localStorage.setItem('bp_income', JSON.stringify(income.list));
    };
    income.update();
    return income;
});
billTrack.factory('notify', ['$ionicPopover', function($ionicPopover) {
   return {
       hide: {
           warning: false,
           alarm: false
       },
       tooltip: function(message, tooltip, $scope) {
           $scope['close'+tooltip] = function() {
               $scope[tooltip].hide();
           };
           return $ionicPopover.fromTemplate(
               '<p class="tip">' +
                    message +
                '<button class="button button-block button-stable" ng-click="close'+tooltip+'()">Okay</button>' +
               '</p>',
               {
                scope: $scope
           });
       }
    }
}]);
billTrack.factory('settings', function() {
    var stored_settings = JSON.parse(localStorage.getItem('bp_settings'));
    return stored_settings || {
        warning_limit: 500,
        alarm_limit: 0,
        projected_months: 3,
        show_empty_days: false
    };
});
billTrack.factory('timeline', ['settings', 'income', 'dues', 'balance', 'budgets', function(settings, income, dues, balance, budgets) {
    var service = {
        timeline: [],
        processData: function() {
            var start, end, current, banked, billed, received, unpaid, day, payday, count, expenses;
            service.timeline = [];
            start = new Date();
            end = new Date(start.getFullYear(), start.getMonth() + settings.projected_months, start.getDate());
            current = new Date(start.getFullYear(), start.getMonth(), start.getDate());
            banked = balance.current;
            billed = false;
            received = false;
            unpaid = [];
            day = null;
            payday = null;
            count = 0;
            expenses = budgets;

            /* Reset Next Pay for Biweekly */
            for (var inc = 0; inc < income.list.length; inc++) {
                if (income.list[inc].frequency == '2') {
                    income.list[inc].next_pay = null;
                }
            }

            /* Plot out the Days in the Projected Period */
            while (current <= end) {
                received = 0;
                billed = 0;
                day = {
                    date: current,
                    incoming: [],
                    outgoing: [],
                    balance: 0,
                    income: 0,
                    dues: 0
                };
                for (var i = 0; i < income.list.length; i++) {
                    switch (income.list[i].frequency) {
                        case "1":
                            if (income.list[i].day_of_month[0] == current.getDate() ||
                                income.list[i].day_of_month[1] == current.getDate()) {
                                day.incoming.push({
                                    label:  income.list[i].label,
                                    amount: income.list[i].amount,
                                    received: false
                                });
                                banked += income.list[i].amount;
                                received += income.list[i].amount;
                            }
                            break;
                        case "2":
                            payday = income.list[i].next_pay || income.list[i].day_of_month;
                            if (payday.toDateString() == current.toDateString()) {
                                day.incoming.push({
                                    label:  income.list[i].label,
                                    amount: income.list[i].amount,
                                    received: false
                                });
                                banked += income.list[i].amount;
                                received += income.list[i].amount;
                                income.list[i].next_pay = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 14);
                            }
                            break;
                    }
                }
                for (var d = 0; d < dues.list.length; d++) {
                    if (dues.list[d].day_of_month == current.getDate()) {
                        day.outgoing.push({
                            label:  dues.list[d].label,
                            amount: dues.list[d].amount,
                            paid: false
                        });
                        banked -= dues.list[d].amount;
                        billed += dues.list[d].amount;
                    }
                }
                for (var e = 0; e < expenses.length; e++) {
                    if (expenses[e].value) {
                        switch (expenses[e].interval) {
                            case "1":
                                banked -= parseInt(expenses[e].value); break;
                            case "2":
                                banked -= parseInt(expenses[e].value) / 7; break;
                            case "3":
                                banked -= parseInt(expenses[e].value) / 14; break;
                            case "4":
                                banked -= parseInt(expenses[e].value) / new Date(current.getFullYear(), current.getMonth() + 1, -1).getDate(); break;
                        }
                    }
                }
                if (billed || received) {
                    day.balance = banked;
                    service.timeline.push(day);
                    count++;
                }
                current = new Date(current.getFullYear(), current.getMonth(), current.getDate()+1);
            }
        }
    };

    service.processData();
    return service;
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
billTrack.controller('fundCtrl', ['$scope', 'balance', 'budgets', 'notify', function($scope, balance, budgets, notify) {
    $scope.funds = balance.current;
    $scope.save = function() {
        balance.current = $scope.funds;
        balance.budgets = $scope.budgets;
        localStorage.setItem('bp_balance', JSON.stringify($scope.funds));
        localStorage.setItem('bp_budgets', JSON.stringify($scope.budgets));
    };

    $scope.budgets = budgets;

    $scope.helpTooltip = notify.tooltip('Manually enter the funds you have in your checking account.', 'helpTooltip', $scope);
    $scope.openTooltip = function(tooltip) {
        $scope[tooltip].show();
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