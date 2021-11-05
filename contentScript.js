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



console.log(chrome.runtime.id)