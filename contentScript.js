var extension_id = document.createElement('div');
extension_id.id = chrome.runtime.id;
extension_id.setAttribute('name','extension_id');


var s = document.createElement('script');
s.src = chrome.runtime.getURL('script.js');
s.onload = function() {
    this.remove();
};
(document.head || document.documentElement).appendChild(s);




