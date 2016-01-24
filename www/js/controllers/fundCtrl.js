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