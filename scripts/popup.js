async function increaseSize(){
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    const response = await chrome.tabs.sendMessage(tab.id, {type:"increase"});
    return response.size;
}
async function decreaseSize(){
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    const response = await chrome.tabs.sendMessage(tab.id, {type:"decrease"});
    return response.size;
}
async function getSize(){
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    const response = await chrome.tabs.sendMessage(tab.id, {type:"none"});
    return response.size;
}
document.getElementById("bigger").onclick=async ()=>{
    document.getElementById("sizeReport").textContent = await increaseSize();
};
document.getElementById("smaller").onclick=async ()=>{
    document.getElementById("sizeReport").textContent = await decreaseSize();
};
(async () => {
    document.getElementById("sizeReport").textContent = await getSize();
})();
