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