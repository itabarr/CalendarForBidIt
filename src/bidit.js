


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
            return 7;
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
function get_global_events(biditGlobalEventsNames, biditGlobalEventsValues){
    let global_values = {};
    biditGlobalEventsNames.forEach((name , index) => {
            switch (name){
                case 'היום הראשון ללימודים':
                    global_values.first_day_of_school = biditGlobalEventsValues[index];
                    break;
                case 'היום האחרון לסמסטר הראשון':
                    global_values.last_day_of_semester_a = biditGlobalEventsValues[index];
                    break;
                case 'היום הראשון לסמסטר השני':
                    global_values.first_day_of_semester_b = biditGlobalEventsValues[index];
                    break;
                case 'היום האחרון לסמסטר השני':
                    global_values.last_day_of_semester_b = biditGlobalEventsValues[index];
                    break;
                default:
                    break;

            }
        }
    )

}
