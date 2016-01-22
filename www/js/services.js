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

billTrack.factory('savings', function() {

});

billTrack.factory('timeline', ['projectedMonths', 'income', 'dues', 'balance', function(projectedMonths, income, dues, balance) {
    var service = {
        timeline: [],
        processData: function() {
            var start, end, current, banked, billed, received, unpaid, day, payday, count;
            service.timeline = [];
            start = new Date();
            end = new Date(start.getFullYear(), start.getMonth() + projectedMonths, start.getDate());
            current = new Date(start.getFullYear(), start.getMonth(), start.getDate());
            banked = balance.current;
            billed = false;
            received = false;
            unpaid = [];
            day = null;
            payday = null;
            count = 0;

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