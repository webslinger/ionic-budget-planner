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