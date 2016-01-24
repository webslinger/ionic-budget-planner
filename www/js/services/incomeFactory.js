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