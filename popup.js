// Snag our button

let btn = document.getElementById("download")

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

        for (const group_key in groups){
            let group = groups[group_key]
            if (group['gChosen'] == true){
                const num_of_days = group.daysArr.length

                let arr = Array.from({length: num_of_days}, (v, i) => i);
                for (const i in arr){

                    let course_event = {
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

                    cal.addEvent(course_event.Name, course_event.Type, course_event.Location, formatted_start ,formatted_end,{freq: 'WEEKLY', interval: 1, byday: [course_event.Day] , until:'09/01/2022'});
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

    let domain = new URL(tab.url);
    if (domain.hostname == 'bid-it.appspot.com'){
        alert("You're in the BidIt website!")
    }
    else{
        alert("You're NOT in the BidIt website!")
        return
    }
    const script_ = await chrome.scripting.executeScript({ // Run the following script on our tab
        target: {tabId: tab.id},
        func: pass_localstorage
    });
    parse_bidit_storage(script_[0].result)

})


