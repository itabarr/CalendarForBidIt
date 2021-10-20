let btn = document.getElementById("download")

document.addEventListener('DOMContentLoaded', async () => {
    let [tab] = await chrome.tabs.query({active: true, currentWindow:true}) // Find current tab
    let domain = new URL(tab.url);
    let label = document.getElementById('label')
    label.innerText = domain.hostname;

    if (domain.hostname != 'bid-it.appspot.com'){
        let label = document.getElementById('label')
        label.innerText = "Downloading calendar is not available because you're not in the Bid-It website."

        let btn = document.getElementById('download');
        btn.disabled = true;
    }
    else{
        let label = document.getElementById('label')
        label.innerText = "Great! You're in the Bid-It website. You can download your calendar if you wish."

        let btn = document.getElementById('download');
        btn.disabled = false;
    }
    });
btn.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({active: true, currentWindow:true}) // Find current tab

    const script_ = await chrome.scripting.executeScript({ // Run the following script on our tab
        target: {tabId: tab.id},
        func: pass_localstorage
    });
    main(script_[0].result)

    get_another_info(JSON.parse(script_[0].result.biditScheduleInfoCookie), "05091834" , '04');
})

function pass_localstorage(){
    let biditDisplaySettingsCookie = localStorage.biditDisplaySettingsCookie;
    let biditScheduleInfoCookie = localStorage.biditScheduleInfoCookie

    return localStorage_json = {
        biditDisplaySettingsCookie : biditDisplaySettingsCookie,
        biditScheduleInfoCookie : biditScheduleInfoCookie
    }
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
Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}
function get_first_day_of_course(first_day_of_school_string, course_day_of_the_week_hebrew){
    wanted_day_int = format_days_to_int(course_day_of_the_week_hebrew);

    d = new Date()
    month =parseInt(first_day_of_school_string.split('/')[0]);
    date = parseInt(first_day_of_school_string.split('/')[1]);
    year =  parseInt(first_day_of_school_string.split('/')[2]);
    d.setFullYear(year,month-1,date)

    current_day = d.getDay()

    days_diff = current_day - wanted_day_int -1

    d = d.addDays(days_diff)

    return d.toLocaleDateString()

}
function get_another_info(bid_it_json,course_id,group_id){
    courses = bid_it_json[0];
    num_of_courses = courses.length;
    let courses_index_array = Array.from({length: num_of_courses}, (v, i) => i);

    for (const i in courses_index_array){
        course = courses[i];

        if (course.cNum == course_id){
            groups = course.kvutzaData

            num_of_groups = groups.length;
            let groups_index_array = Array.from({length: num_of_groups}, (v, i) => i);

            for (const i in groups_index_array) {
                group = groups[i];

                if (group.gNum == group_id){

                    let info_json = {
                        havura : group.havura,
                        kind: group.kind,
                        lecturer: group.lecturer[0]
                    }
                    //console.log(info_json);

                    return info_json

                }
            }
        }
    }

    console.log('Didnt find anything');
    return


}

///TODO: add course number and group
function main(result){
    let cal = ics();

    let data_ = JSON.parse(result.biditDisplaySettingsCookie)[0];
    //console.log(Object.keys(data_));

    for (const course_key in data_){
        let course = data_[course_key]
        let groups = course['groups'];

        let num_of_tests = course.moeds.length;
        let arr_ = Array.from({length: num_of_tests}, (v, i) => i);


        for (const i in arr_){
            start_str = (course.startMoedHours[i]);
            start_int = parseInt(start_str.substring(0,2));
            let end_int = start_int + 3;
            d = new Date();
            d.setHours(end_int)
            end_hours_str = `${d.getHours().toString()}:00`

            dateString = course.dates[i];
            date_str = dateString.substr(3, 2)+"/"+dateString.substr(0, 2)+"/"+dateString.substr(6, 4);


            test_event ={
                Name: course.cName,
                Moed : course.moeds[i],
                Type : course.types[i],
                StartHour : course.startMoedHours[i],
                EndHour: end_hours_str,
                Day : date_str
            }

            let formatted_start =  `${test_event.Day} ${test_event.StartHour}`
            let formatted_end = `${test_event.Day} ${test_event.EndHour}`

            test_event.formatted_start = formatted_start;
            test_event.formatted_end = formatted_end;

            //console.log(test_event);
            cal.addEvent(  'מועד ' + test_event.Moed +' '+ test_event.Name, test_event.Moed  , "", formatted_start ,formatted_end);

        }

        for (const group_key in groups){
            let group = groups[group_key]
            if (group['gChosen'] == true){
                const num_of_days = group.daysArr.length

                let arr = Array.from({length: num_of_days}, (v, i) => i);
                for (const i in arr){

                    another_info = get_another_info(JSON.parse(result.biditScheduleInfoCookie) , course.cNum , group.gNum);

                    course_event = {
                        Name: course.cName,
                        Type: group.ofenHoraa,
                        Day: format_days_to_string(group.daysArr[i]),
                        StartHour: group.startHours[i],
                        EndHour: group.endHours[i],
                        Location: group.places[i],
                        Lecturer: another_info.lecturer,
                    };

                    first_day_of_course = get_first_day_of_course('10/09/2021',group.daysArr[i])
                    let formatted_start = `${first_day_of_course} ${course_event.StartHour}`
                    let formatted_end = `${first_day_of_course} ${course_event.EndHour}`

                    console.log(get_first_day_of_course('10/09/2021',group.daysArr[i]))

                    //{freq: 'WEEKLY', interval: 1, byday: [course_event.Day] }

                    cal.addEvent(course_event.Name, course_event.Lecturer +' '+ course_event.Type, course_event.Location, formatted_start ,formatted_end,{freq: 'WEEKLY', interval: 1, byday: [course_event.Day] , until:'01/09/2022'});
                };
            };

        }
    }
    var d = new Date();
    cal.download(d.toISOString())
}






