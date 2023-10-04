const checkingEditor = setInterval(getElement, 500);
var element;
var size = 15;

//find app labs code
function getElement(){
    const editor = document.getElementsByClassName("droplet-ace ace_editor ace-chrome");
    element = editor[0];
    if(element){
        clearInterval(checkingEditor);
        //load saved Size if it exists
        chrome.storage.local.get(["savedSize"], get);
    }
}

function get(items){
    if(typeof items.savedSize !== undefined){
        element.style.fontSize = items.savedSize+"px";
    }
}

//listen to messages from popup
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(element){
            if(request.type == "set"){
                size = request.value;
                element.style.fontSize = size+"px";
            }
            sendResponse({size: size});
        }else{
            sendResponse({error: "Only available on Code.org's App Lab"});
        }
        
    });