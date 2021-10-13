let btn = document.getElementById("download")

document.addEventListener('DOMContentLoaded', async () => {
    let [tab] = await chrome.tabs.query({active: true, currentWindow:true}) // Find current tab
    let domain = new URL(tab.url);
    let label = document.getElementById('label')
    label.innerText = domain.hostname;

    if (domain.hostname != 'bid-it.appspot.com'){
        let img = document.getElementById('validate');
        img.src = 'invalid.png';

        let btn = document.getElementById('download');
        btn.disabled = true;
    }
    });

function pass_localstorage(){
    let biditDisplaySettingsCookie = localStorage.biditDisplaySettingsCookie;
    return biditDisplaySettingsCookie
}

function format_days(day){
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
function parse_bidit_storage(biditDisplaySettingsCookie){
    let cal = ics();

    let data_ = JSON.parse(biditDisplaySettingsCookie)[0];
    console.log(Object.keys(data_));

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

            console.log(test_event);
            cal.addEvent(  'מועד ' + test_event.Moed +' '+ test_event.Name, test_event.Moed  , "", formatted_start ,formatted_end);


        }

        for (const group_key in groups){
            let group = groups[group_key]
            if (group['gChosen'] == true){
                const num_of_days = group.daysArr.length

                let arr = Array.from({length: num_of_days}, (v, i) => i);
                for (const i in arr){

                    course_event = {
                        Name: course.cName,
                        Type: group.ofenHoraa,
                        Day: format_days(group.daysArr[i]),
                        StartHour: group.startHours[i],
                        EndHour: group.endHours[i],
                        Location: group.places[i],
                    };

                    let formatted_start = `09/10/2021 ${course_event.StartHour}`
                    let formatted_end = `09/10/2021  ${course_event.EndHour}`



                    //{freq: 'WEEKLY', interval: 1, byday: [course_event.Day] }

                    cal.addEvent(course_event.Name, course_event.Type, course_event.Location, formatted_start ,formatted_end,{freq: 'WEEKLY', interval: 1, byday: [course_event.Day] , until:'01/09/2022'});
                };
            };

        }
    }
    var d = new Date();
    cal.download(d.toISOString())
}

// Run on click
btn.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({active: true, currentWindow:true}) // Find current tab

    const script_ = await chrome.scripting.executeScript({ // Run the following script on our tab
        target: {tabId: tab.id},
        func: pass_localstorage
    });
    parse_bidit_storage(script_[0].result)

})





