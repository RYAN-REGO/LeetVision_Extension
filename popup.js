// As soon as the popup is opened communicate with content script to get the name of the problem
let cachedTestCases = null;
let parsedTestCases = null;

function parseTestCase(testCases) {
  const parsedCases = testCases.map((testcase) => {
    const parts = testcase.split("/");

    const input = parts[0];
    const output = parts[1];
    const tip = parts[2] || "";
    return { input, output, tip };
  });

  return parsedCases;
  //we are creating an array of objects, each object has input and output as keys
  // {
  //   {input:input: "1 2", output:output: "3", tip:tip: "Add the two numbers"},
  //   {input:input: "2 3", output:output: "5", tip:tip: "Add the two numbers"}
  // }
}

document.getElementById("embed").addEventListener("click", () => {
  console.log("Embed button clicked");


  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;

    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: async () => {

        //Watch out for the case when the div is already embedded
        if( document.getElementsByClassName("newDiv")[0] ){
          console.log("Already embedded mf");
          return;
        }

        const nameProblem = localStorage.getItem("problemName");
        console.log("Problem Name: ", nameProblem);

        //GO FOR THE API CALL
        //In here the context is of the webpage so cannot use any outside variable function

        const response = await fetch(
          `http://localhost:5000/problem/${encodeURIComponent(nameProblem)}`
        );

        const reqData = await response.json();
        console.log("this is the fetched data", reqData);

        const targetElement = document.getElementsByClassName("elfjS")[0];

        const newDiv = document.createElement("div");
        newDiv.classList.add("newDiv");
        newDiv.style = `
            min-height: 30vh;
            width: 528px;
            border-left: 1px solid grey;
            background-color: #222325;
            display: flex;
            flex-direction: column;
            gap: 20px;
            overflow-x: auto;
            `;

        const parsedCases = reqData.prblmTestCases.map((testcase) => {
          const parts = testcase.split("/");

          const input = parts[0];
          const output = parts[1];
          const tip = parts[2] || "";
          return { input, output, tip };
        });

        parsedCases.forEach((testCase, index) => {
          const test_case = `
              <div class="test_case">
                <div class="input">
                  <pre>${testCase.input}</pre>
                </div>
                <div class="output">
                  <pre>${testCase.output}</pre>
                </div>
                <div class="tip">
                  <pre>${testCase.tip}</pre>
                </div>
              </div>
              `;

          const testCaseNew = document.createElement("div");
          testCaseNew.classList.add("test_case_new");
          testCaseNew.innerHTML = test_case;

          newDiv.appendChild(testCaseNew);
        });

        targetElement.appendChild(newDiv);

        const alertDiv = `
          <div class="alertDiv">
            Scroll Down ⇩
          </div>
          `;
        const alertDivNew = document.createElement("div");
        alertDivNew.classList.add("alertDivNew");
        alertDivNew.style = `
            display: flex;
            position: absolute;
            top: 12%;
            left: 15%;
            height: 50px;
            width: 150px;
            color: #1cb33d;
            background-color: #222325;
            font-size: 17px;
            border-radius: 10px;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            letter-spacing: 1px;
          `;
        alertDivNew.innerHTML = alertDiv;
        document.body.appendChild(alertDivNew);
        // alertDivNew.style.display = "block";
        const intervalId = setInterval(() => {
          document.body.removeChild(alertDivNew);
          // alertDivNew.style.display = "none";
          console.log("Hiding the alert div now.");
          clearInterval(intervalId); // Clear interval after it runs once
        }, 4000);
      },
    });
  });
});

async function fetchData(problemName) {
  const loader = document.getElementsByClassName("loader")[0];
  try {
    loader.style.display = "block";
    console.log("Fetching data for the problem", problemName);
    const response = await fetch(
      `http://localhost:5000/problem/${encodeURIComponent(problemName)}`
    );

    const data = await response.json();

    loader.style.display = "none";
    // prbmlName spelling mistake
    document.getElementById("problemDisplay").innerHTML =
      data.prbmlName.charAt(0).toUpperCase() + data.prbmlName.slice(1);

    //now time for the description of the problem
    const descPoints = data.prblmDesc.split("/");

    const descList = `
            ${descPoints
              .map((point) => `<div>&nbsp;&nbsp;${point}</div>`)
              .join("")}
      `;
    document.getElementById("descriptionHold").innerHTML = descList;

    ///handle the test cases
    const testCases = data.prblmTestCases;
    parsedTestCases = parseTestCase(testCases);
    // cachedTestCases = parsedTestCases;

    console.log("Parsed Test Cases: ", parsedTestCases);
    parsedTestCases.forEach((testCase, index) => {
      const test_case = `
      <div class="test_case">
        <div class="input">
          <pre>${testCase.input}</pre>
        </div>
        <div class="output">
          <pre>${testCase.output}</pre>
        </div>
        <div class="tip">
          <pre>${testCase.tip}</pre>
        </div>
      </div>
      `;

      const complete_testcase = document.createElement("div");
      complete_testcase.classList.add("test_cases_data");
      complete_testcase.innerHTML = test_case;

      const test_case_section =
        document.getElementsByClassName("addTestcases")[0];
      //getElementsByClassName returns an array of elements, not a single element so we need to use [0]
      test_case_section.appendChild(complete_testcase);
    });

    //appendChild() to append a dom element to another dom element
    //innerHTML not a method, used to get or get the HTML content of an element as a string
    console.log("Fetched data : ", data);
  } catch (error) {
    console.log("Error fetching data: ", error);
  }
}

async function FetchInit() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(
      tabs[0].id,
      {
        action: "requestProblemName",
      },
      function (response) {
        // Handle the response from the content script
        if (response.status === "success") {
          fetchData(response.data);
        } else {
          console.log("Error fetching data");
        }
      }
    );
  });
}

FetchInit();
