Global_Json = {
    bidit_globals: window.bidit_globals
}
var Global_Vars = document.createElement('div');
Global_Vars.setAttribute('id','Global_Vars');
Global_Vars.innerText = JSON.stringify(Global_Json);
(document.head || document.documentElement).appendChild(Global_Vars);






