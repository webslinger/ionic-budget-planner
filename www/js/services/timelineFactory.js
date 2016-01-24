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