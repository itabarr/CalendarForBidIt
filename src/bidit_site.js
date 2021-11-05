function get_data_from_bidit(){
    let biditDisplaySettingsCookie = localStorage.biditDisplaySettingsCookie;
    let biditScheduleInfoCookie = localStorage.biditScheduleInfoCookie;
    let biditGlobalEventsNames = bidit_globals.g_metaDatesDS.metaNames.flat();
    let biditGlobalEventsValues = bidit_globals.g_metaDatesDS.metaDates;

    return localStorage_json = {
        biditDisplaySettingsCookie : biditDisplaySettingsCookie,
        biditScheduleInfoCookie : biditScheduleInfoCookie,
        biditGlobalEventsNames: biditGlobalEventsNames,
        biditGlobalEventsValues: biditGlobalEventsValues
    }
}