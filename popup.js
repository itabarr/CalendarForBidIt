//TODO: (1) Better identify global events
//TODO: (3) refactor + publish
//TODO: (4) future thoughts - add validation check for bidit hours/places
import * as utils from './utils.js';
import * as bidit from './bidit.js'

//Event listeners
document.addEventListener('DOMContentLoaded', async () => {
    let [tab] = await chrome.tabs.query({active: true, currentWindow:true}) // Find current tab
    let domain = new URL(tab.url);
    let label = document.getElementById('label')
    label.innerText = domain.hostname;

    if (domain.hostname != 'bid-it.appspot.com'){
        let label = document.getElementById('label')
        label.innerText = "Downloading calendar is not available because you're not in the bid-It website."

        let btn = document.getElementById('download');
        btn.disabled = true;
    }
    else{

        //Run script on page when loaded
        const script_ = await chrome.scripting.executeScript({ // Run the following script on our tab
            target: {tabId: tab.id},
            func: bidit.get_main_from_bidit_page
        });
        var result = script_[0].result;
        var courses_info = JSON.parse(result.biditDisplaySettingsCookie);
        var num_of_courses = bidit.get_number_of_active_courses(courses_info)
        console.log(num_of_courses)

        let label = document.getElementById('label')

        if (num_of_courses == 0){
            label.innerText = "Can't download calendar because you have no courses chosen."
            let btn = document.getElementById('download');
            btn.disabled = true;
        }
        else {

            if (num_of_courses == 1){
                label.innerText = `You have one chosen course. Click on button to download calendar.`
            }
            else{
                label.innerText = `You have ${num_of_courses} chosen courses. Click on button to download calendar.`
            }
            let btn = document.getElementById('download');
            btn.disabled = false;
        }

    }
    });
let btn = document.getElementById("download")
btn.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({active: true, currentWindow:true}) // Find current tab

    const script_ = await chrome.scripting.executeScript({ // Run the following script on our tab
        target: {tabId: tab.id},
        func: bidit.get_main_from_bidit_page
    });
    main(script_[0].result)

    //get_another_info(JSON.parse(script_[0].result.biditScheduleInfoCookie), "05091834" , '04');
});
window.addEventListener("message",(event)=> {
    console.log(event)
});


async function main(result){

    let cal = ics();

    let global_events = bidit.parse_global_bidit_json_data(result.Global_Json)['global_events']
    let first_day_of_sem_A = global_events[0][1];
    let first_day_of_sem_B =global_events[5][1];
    let last_day_of_sem_A = global_events[2][1]
    let last_day_of_sem_B = global_events[11][1]

    for (var i = 0; i < JSON.parse(result.biditDisplaySettingsCookie).length; i++) {
        let semester_num = i;
        if (i ==0){
            var first_day = first_day_of_sem_A
            var last_day = last_day_of_sem_A
        }
        else{
            var first_day =first_day_of_sem_B
            var last_day = last_day_of_sem_B
        }

        //Semester A and B loop
        let data_ = JSON.parse(result.biditDisplaySettingsCookie)[i];
        for (const course_key in data_){
            let course = data_[course_key]
            let groups = course['groups'];

            let num_of_tests = course.moeds.length;
            let arr_ = Array.from({length: num_of_tests}, (v, i) => i);

            //Add test event loop
            for (const i in arr_){
                let start_str = (course.startMoedHours[i]);
                let start_int = parseInt(start_str.substring(0,2));
                let end_int = start_int + 3;
                d = new Date();
                d.setHours(end_int)
                let end_hours_str = `${d.getHours().toString()}:00`

                let dateString = course.dates[i];
                let date_str = utils.swap_days_month(dateString)


                let test_event ={
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

                        let another_info = bidit.get_another_info(JSON.parse(result.biditScheduleInfoCookie) , course.cNum , group.gNum ,semester_num);
                        const course_updated_data = await bidit.get_updated_data_from_tau_site(course.cNum, group.gNum, '2021');

                        let course_event = {
                            Name: course.cName,
                            Num: course.cNum,
                            Group: group.gNum,
                            Type: group.ofenHoraa,
                            Day: utils.format_days_to_string(group.daysArr[i]),
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

                        let first_day_of_course = utils.get_first_day_of_course(first_day,group.daysArr[i])
                        let formatted_start = `${first_day_of_course} ${course_event.bidit_StartHour}`
                        let formatted_end = `${first_day_of_course} ${course_event.bidit_EndHour}`

                        let description_str = bidit.phrase_description_message(course_event)

                        cal.addEvent(course_event.Name, description_str, course_event.bidit_Location, formatted_start ,formatted_end,{freq: 'WEEKLY', interval: 1, byday: [course_event.Day] , until: last_day});
                    };
                };

            }
        }
    }
    var d = new Date();
    cal.download(d.toISOString())
};









