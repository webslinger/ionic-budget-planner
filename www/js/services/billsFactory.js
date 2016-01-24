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