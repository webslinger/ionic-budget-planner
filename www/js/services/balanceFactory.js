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