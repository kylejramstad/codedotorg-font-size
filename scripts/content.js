const checkingEditor = setInterval(getElement, 500);
var element;
var size = 15;

function getElement(){
    const editor = document.getElementsByClassName("droplet-ace ace_editor ace-chrome");
    element = editor[0];
    if(element){
        clearInterval(checkingEditor);
        console.log("Extension loaded!!!");
    }
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(element){
            if(request.type == "increase"){
                size += 2;
            }else if(request.type == "decrease"){
                size -= 2;
            }
            element.style.fontSize = size+"px";
            sendResponse({size: size+"px"});
        }else{
            sendResponse({error: "Cannot change Code.org size"});
        }
        
    });