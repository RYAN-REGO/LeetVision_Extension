function fetchUrl(){
    let url = window.location.href;
    console.log("name of the problem = ", url.split("/")[4]);
    let problemName = url.split("/")[4];
    localStorage.setItem("problemName", problemName);
    return problemName;
}


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "requestProblemName") {
        
        let problemName = fetchUrl();
        
        let dataToSend = {
            data: problemName,
            status: "success"
        };

        sendResponse(dataToSend);
    }
    
    // IMPORTANT: Return true to indicate you want to send an async response
    return true;
});

//PROBLEMS : 
// 1. Local Storage Acessing issue for the popup
// 2. Embedding the data into webpage since the api call was done in the context of the popup
// 3. Multiple embedding being called on multiple clicks on embed button


// Baaki:

// Link for google form
// Better Extension logo
// Github Link