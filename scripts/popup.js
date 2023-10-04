async function setSize(size){
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    const response = await chrome.tabs.sendMessage(tab.id, {type:"set", value:size});
    return response.size;
}
async function check(){
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    const response = await chrome.tabs.sendMessage(tab.id, {type:"none"});
}
(async () => {
    //used to check if code.org app lab
    try{
        await check(); //checking to see if connected to app lab

        //load savedSize
        chrome.storage.local.get(["savedSize"], async function(items){
            var size;
            if(typeof items.savedSize !== undefined){
                size = items.savedSize;
            }else{
                size = 15;
            }
            document.getElementById("sizeReport").value = await setSize(size);
        });
        
    }catch(e){
        //display error that it isn't app lab
        document.getElementById("sizeReport").style.display = "none";
        document.getElementById("error").style.display = "inline";
    }
})();

document.getElementById("sizeReport").oninput =
    async function() {
        chrome.storage.local.set({ "savedSize": document.getElementById("sizeReport").value},async function(){
            await setSize(document.getElementById("sizeReport").value);
        }); 
    };