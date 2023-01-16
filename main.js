const axios = require("axios");
const cheerio = require("cheerio");
require("dotenv").config();

let workDir = __dirname + "/dbWorker.js";
const { Worker } = require("worker_threads");
const url = "https://www.iban.com/exchange-rates";

async function fetchData(url) {
  console.log("Crawling Data");
  let response = await axios(url).catch((err) => console.log(err));
  if (response.status !== 200) {
    console.log("Error from fetching data");
    return;
  }
  return response;
}

const mainFunc = async () => {
  let res = await fetchData(url);
  if (!res.data) {
    console.log("Invalid");
  }
  let html = res.data;
  let dataObj = new Object();

  const $ = cheerio.load(html);
  const statsTable = $(
    ".table.table-bordered.table-hover.downloads > tbody > tr"
  );
  statsTable.each(function () {
    let title = $(this).find("td").text(); // get the text in all the td elements
    let newStr = title.split("\t"); // convert text (string) into an array
    newStr.shift(); // strip off empty array element at index 0
    formatStr(newStr, dataObj); // format array string and store in an object
  });
  return dataObj;
};

mainFunc().then((res) => {
  const worker = new Worker(workDir);
  console.log("sending crawled data to dbWorker");
  // send formatted data to worker thread
  worker.postMessage(res);
  //listen msg from worker thread
  worker.on("message", (message) => {
    console.log(message);
  });
});

function formatStr(arr, dataObj) {
  // regex to match all the words before the first digit
  let regExp = /[^A-Z]*(^\D+)/;
  let newArr = arr[0].split(regExp); // split array element 0 using the regExp rule
  dataObj[newArr[1]] = newArr[2]; // store object
}
