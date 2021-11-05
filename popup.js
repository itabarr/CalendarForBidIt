//TODO: (1) add second semester & automatic main days (first day of semester etc.) the info is in the global vars of bidit site (bidit_globals.g_metaDatesDS.metaNames.flat() + bidit_globals.g_metaDatesDS.metaDates )
//TODO: (1) add no events validation/notification (only tests?)
//TODO: (2) refactor + publish
//TODO: (3) future thoughts - add validation check for bidit hours/places


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
let btn = document.getElementById("download")
btn.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({active: true, currentWindow:true}) // Find current tab

    const script_ = await chrome.scripting.executeScript({ // Run the following script on our tab
        target: {tabId: tab.id},
        func: pass_localstorage
    });
    main(script_[0].result)

    //get_another_info(JSON.parse(script_[0].result.biditScheduleInfoCookie), "05091834" , '04');
})

function pass_localstorage(){
    let biditDisplaySettingsCookie = localStorage.biditDisplaySettingsCookie;
    let biditScheduleInfoCookie = localStorage.biditScheduleInfoCookie;
    let biditGlobalEventsNames = window.bidit_globals;
    let  biditGlobalEventsValues = window.bidit_globals;
    //console.log(window)
    localStorage_json = {
        biditDisplaySettingsCookie : biditDisplaySettingsCookie,
        biditScheduleInfoCookie : biditScheduleInfoCookie,
        biditGlobalEventsNames: biditGlobalEventsNames,
        biditGlobalEventsValues: biditGlobalEventsValues
    }
    //console.log(localStorage_json)
    return localStorage_json
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
function phrase_description_message(course_event_json){
    course_name_str = `שם קורס: ${course_event_json.Name} \\n`
    course_num_str = `מספר קורס: ${course_event_json.Num} \\n`
    course_group_str = `מספר קבוצה: ${course_event_json.Group} \\n`
    course_type_str = `סוג שיעור: ${course_event_json.Type} \\n`
    course_lecturer_str = `מרצה: ${course_event_json.Lecturer} \\n`
    course_bid_it_location_str = `מיקום לפי אתר bidit: ${course_event_json.bidit_Location} \\n`
    course_bid_it_time_str = `זמן לפי אתר bidit: ${course_event_json.bidit_StartHour}-${course_event_json.bidit_EndHour} \\n`
    course_url_str = `${course_event_json.tau_url}\\n`

    return course_name_str+course_num_str+course_group_str+course_type_str+course_lecturer_str+course_bid_it_location_str+course_bid_it_time_str+course_url_str
}

async function get_updated_data_from_tau_site(course_number, course_group,year){
    const response = await fetch(`https://www.ims.tau.ac.il/Tal/Syllabus/Syllabus_L.aspx?lang=HE&course=${course_number}${course_group}&year=${year}`);
    const reader = response.body.getReader();
    let undecoded_page;
    while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        undecoded_page = value;
    }
    //console.log('Page Received');
    page = new TextDecoder().decode(undecoded_page)

    var doc = new DOMParser().parseFromString(page,'text/html');
    data = doc.getElementsByClassName('data-table-row course-time-location')
    classes_ = doc.getElementsByClassName('data-table-row course-time-location');


    let arr = Array.from({length: classes_.length}, (v, i) => i);

    let classes_arr = [];
    for (const i in arr){
        elements_ = classes_[i].getElementsByClassName('data-table-cell');

        let data_json = {
          url: `https://www.ims.tau.ac.il/Tal/Syllabus/Syllabus_L.aspx?lang=HE&course=${course_number}${course_group}&year=${year}`
        };

        let arr_j = Array.from({length: elements_.length}, (v, i) => i);
        for (const j in arr_j){
            data = elements_[j].innerHTML.replace(/<\/?[^>]+(>|$)/g, " ");
            data = data.split(/\s{2}/);
            data = data.filter(function(entry) { return /\S/.test(entry); });
            data = data.map(function(str_){return str_.trim()});

            switch (data[0]) {
                case 'אופן ההוראה':
                    data_json.type = data[1];
                    break;
                case 'שעות סמסטריאליות':
                    data_json.semester_hours = data[1];
                    break;
                case 'סמסטר':
                    data_json.semester = data[1];
                    break;
                case 'יום':
                    data_json.day = data[1];
                    break;
                case 'שעות':
                    data_json.start_time = data[1].split('-')[0];
                    data_json.end_time = data[1].split('-')[1];
                    break;
                case 'בניין':
                    data_json.building = data[1];
                    break;
                case 'חדר':
                    data_json.room = data[1];
                    break;
                default:
                    break;
            }
        }
        classes_arr.push(data_json);
    }
    return classes_arr
}

//TODO: build validate data from multi sources to figure out relevant data
function validate_data_from_multi_sources(bidit_json,tau_json){

};


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
    return global_values
}


//TODO: fix location issues + add new data from tau
async function main(result){

    //console.log(get_global_events(result.biditGlobalEventsNames,result.biditGlobalEventsValues))
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
                    const course_updated_data = await get_updated_data_from_tau_site(course.cNum, group.gNum, '2021');

                    course_event = {
                        Name: course.cName,
                        Num: course.cNum,
                        Group: group.gNum,
                        Type: group.ofenHoraa,
                        Day: format_days_to_string(group.daysArr[i]),
                        tau_StartHour:'',
                        tau_EndHour:'',
                        tau_Location:``,
                        tau_url: course_updated_data[0].url,
                        bidit_StartHour: group.startHours[i],
                        bidit_EndHour: group.endHours[i],
                        bidit_Location: group.places[i],
                        Lecturer: another_info.lecturer,

                    };

                    console.log(course_event, course_updated_data , another_info)

                    first_day_of_course = get_first_day_of_course('10/09/2021',group.daysArr[i])
                    let formatted_start = `${first_day_of_course} ${course_event.bidit_StartHour}`
                    let formatted_end = `${first_day_of_course} ${course_event.bidit_EndHour}`

                    description_str = phrase_description_message(course_event)
                    //console.log(description_str)

                    //console.log(get_first_day_of_course('10/09/2021',group.daysArr[i]))

                    cal.addEvent(course_event.Name, description_str, course_event.bidit_Location, formatted_start ,formatted_end,{freq: 'WEEKLY', interval: 1, byday: [course_event.Day] , until:'01/09/2022'});
                };
            };

        }
    }
    var d = new Date();
    cal.download(d.toISOString())
}







