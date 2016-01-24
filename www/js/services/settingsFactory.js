billTrack.factory('settings', function() {
    var stored_settings = JSON.parse(localStorage.getItem('bp_settings'));
    return stored_settings || {
        warning_limit: 500,
        alarm_limit: 0,
        projected_months: 3,
        show_empty_days: false
    };
});