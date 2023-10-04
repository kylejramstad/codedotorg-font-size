const checkingEditor = setInterval(getElement, 500);
var element;
var size = 15;

function getElement(){
    const editor = document.getElementsByClassName("droplet-ace ace_editor ace-chrome");
    element = editor[0];
    if(element){
        clearInterval(checkingEditor);
    }
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(element){
            if(request.type == "set"){
                size = request.value;
                element.style.fontSize = size+"px";
            }else if(request.type == "get"){
                size = Number(element.style.fontSize);
            }
            sendResponse({size: size});
        }else{
            sendResponse({error: "Only available on Code.org's App Lab"});
        }
        
    });