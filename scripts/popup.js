async function setSize(size){
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    const response = await chrome.tabs.sendMessage(tab.id, {type:"set", value:size});
    return response.size;
}
async function getSize(){
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    const response = await chrome.tabs.sendMessage(tab.id, {type:"none"});
    return response.size;
}
(async () => {
    try{
        document.getElementById("sizeReport").value = await getSize();
    }catch(e){
        document.getElementById("sizeReport").style.display = "none";
        document.getElementById("error").style.display = "inline";
    }
})();

document.getElementById("sizeReport").oninput =
    async function() {
        await setSize(document.getElementById("sizeReport").value);
    };