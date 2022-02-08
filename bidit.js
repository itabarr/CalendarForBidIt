function get_main_from_bidit_page(){
    let Global_Json = JSON.parse(document.getElementById('Global_Vars').innerText);
    let biditDisplaySettingsCookie = localStorage.biditDisplaySettingsCookie;
    let biditScheduleInfoCookie = localStorage.biditScheduleInfoCookie;
    let biditGlobalEventsNames = window.bidit_globals;
    let  biditGlobalEventsValues = window.bidit_globals;
    //console.log(window)
    let localStorage_json = {
        Global_Json : Global_Json,
        biditDisplaySettingsCookie : biditDisplaySettingsCookie,
        biditScheduleInfoCookie : biditScheduleInfoCookie,
        biditGlobalEventsNames: biditGlobalEventsNames,
        biditGlobalEventsValues: biditGlobalEventsValues
    }
    //console.log(localStorage_json)
    return localStorage_json
};
function get_another_info(bid_it_json,course_id,group_id,semester){
    let courses = bid_it_json[semester];
    let num_of_courses = courses.length;
    let courses_index_array = Array.from({length: num_of_courses}, (v, i) => i);

    for (const i in courses_index_array){
        let course = courses[i];

        if (course.cNum == course_id){
            let groups = course.kvutzaData

            let num_of_groups = groups.length;
            let groups_index_array = Array.from({length: num_of_groups}, (v, i) => i);

            for (const i in groups_index_array) {
                let group = groups[i];

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
function parse_global_bidit_json_data(global_bidit_json){

    let merged_names_dates = [];
    let global_dates_names = global_bidit_json["bidit_globals"]['g_metaDatesDS']['metaNames'].flat();
    let global_dates_dates = global_bidit_json["bidit_globals"]['g_metaDatesDS']['metaDates'].flat();
    for (var i = 0; i < global_dates_names.length; i++) {
        merged_names_dates.push([global_dates_names[i],global_dates_dates[i]])
    }
    let parsed_json= {
        global_events: merged_names_dates,
    }
    return parsed_json
};
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
    let page = new TextDecoder().decode(undecoded_page)

    var doc = new DOMParser().parseFromString(page,'text/html');
    let data = doc.getElementsByClassName('data-table-row course-time-location')
    let classes_ = doc.getElementsByClassName('data-table-row course-time-location');


    let arr = Array.from({length: classes_.length}, (v, i) => i);

    let classes_arr = [];
    for (const i in arr){
        let elements_ = classes_[i].getElementsByClassName('data-table-cell');

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
};
function phrase_description_message(course_event_json){
    let course_name_str = `שם קורס: ${course_event_json.Name} \\n`
    let course_num_str = `מספר קורס: ${course_event_json.Num} \\n`
    let course_group_str = `מספר קבוצה: ${course_event_json.Group} \\n`
    let course_type_str = `סוג שיעור: ${course_event_json.Type} \\n`
    let course_lecturer_str = `מרצה: ${course_event_json.Lecturer} \\n`
    //let course_bid_it_location_str = `מיקום לפי אתר bidit: ${course_event_json.bidit_Location} \\n`
    //let course_bid_it_time_str = `זמן לפי אתר bidit: ${course_event_json.bidit_StartHour}-${course_event_json.bidit_EndHour} \\n`
    let course_url_str = `${course_event_json.tau_url}\\n`
    return course_name_str+course_num_str+course_group_str+course_type_str+course_lecturer_str+course_url_str
};
function get_number_of_active_courses(courses_info_json){
    var active_sem_A = Object.keys(courses_info_json[0]).filter(k => courses_info_json[0][k].cChosen);
    var active_sem_B = Object.keys(courses_info_json[1]).filter(k => courses_info_json[1][k].cChosen);
    return active_sem_A.length + active_sem_B.length
}
export {get_main_from_bidit_page,get_another_info,parse_global_bidit_json_data,get_updated_data_from_tau_site,phrase_description_message,get_number_of_active_courses}