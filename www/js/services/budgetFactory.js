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