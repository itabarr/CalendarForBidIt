Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}
function mod(n, m) {
    return ((n % m) + m) % m;
}
function format_days_to_string(day){
    switch (day) {
        case 'א':
            return 'SU';
        case 'ב':
            return 'MO';
        case 'ג':
            return 'TU';
        case 'ד':
            return 'WE';
        case 'ה':
            return 'TH';
        case 'ו':
            return 'FR';
        case 'ז':
            return 'SA';
        default:
            throw('It seems like BidIt used incorrect day format. The day format is: ' + day);
    }
}
function format_days_to_int(day){
    switch (day) {
        case 'א':
            return 0;
        case 'ב':
            return 1;
        case 'ג':
            return 2;
        case 'ד':
            return 3;
        case 'ה':
            return 4;
        case 'ו':
            return 5;
        case 'ז':
            return 6;
        default:
            throw('It seems like BidIt used incorrect day format. The day format is: ' + day);
    }
}
function get_first_day_of_course(first_day_of_school_string, course_day_of_the_week_hebrew){
    let wanted_day_int = format_days_to_int(course_day_of_the_week_hebrew);

    let d = new Date()
    let month =parseInt(first_day_of_school_string.split('/')[0]);
    let date = parseInt(first_day_of_school_string.split('/')[1]);
    let year =  parseInt(first_day_of_school_string.split('/')[2]);
    d.setFullYear(year,month-1,date)

    let current_day = d.getDay()
    let days_diff = mod(wanted_day_int-current_day,7)

    d = d.addDays(days_diff)

    return d.toLocaleDateString()
}
function swap_days_month(date){
    return date.substr(3, 2)+"/"+date.substr(0, 2)+"/"+date.substr(6, 4);
};

export{mod,format_days_to_string,format_days_to_int,get_first_day_of_course,swap_days_month}