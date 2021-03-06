/* Global Variables */
// API URL/Key
const baseURL = "https://api.openweathermap.org/data/2.5/weather?q=";
// in metric and then converted to farenheit later
const APIKey = ",us&units=metric&appid=f0e2f2fd5311df4ea9bdff1d071ad35e";

// DOM Elements

// content
const locationDiv = document.getElementById("location");
const temperatureDiv = document.getElementById("temp");
const generateButton = document.getElementById("generate");
const entryDiv = document.querySelector("entry");
const humidityDiv = document.getElementById("humidity");
const weatherDiv = document.getElementById("weather");
const iconDiv = document.getElementById("icon-div");
const clothingtDiv = document.getElementById("clothing");
const feelsLikeDiv = document.getElementById("feelslike");

// helper functions

//santize the input
function sanitize(string) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };
  const reg = /[&<>"'/]/gi;
  return string.replace(reg, (match) => map[match]);
}

// Get weather info from API

async function getWeatherData(baseURL, zipcode, APIKey) {
  // makes a fetch request to the api url and saves the response (await means it doesn"t move on till it is complete)
  const response = await fetch(baseURL + zipcode + APIKey);
  // save that response as a json file
  const data = await response.json();
  // then tries to return that data to be used in the web app and catches if it doesnt work
  try {
    console.log("returned the data from the data JSON");

    return {
      // uses the json file and finds some data from that using dot notation
      city: data.name,
      country: data.sys.country,
      temp: data.main.temp,
      humidity: data.main.humidity,
      feelsLike: data.main.feels_like,
      // gets the main info which is shorter than .description
      description: data.weather[0].main,
      icon: data.weather[0].icon,
      cloudiness: data.clouds,
    };
  } catch (error) {
    console.log("Error. Could not return data JSON file", error);
  }
}

// POST weather data to server.js
async function postData(url = "", data = {}) {
  // awaits the url to be fetched and saves everything as the response to give to the server
  const res = await fetch(url, {
    // POST Method
    method: "POST",
    // default value (not safe)
    credentials: "same-origin",
    // what will be posted
    headers: {
      "Content-Type": "application/json",
    },
    // what the body that the server.js will read
    body: JSON.stringify(data),
  });
  try {
    // try to return the response
    const getData = await res.json();
    return getData;
  } catch {
    console.log("Error:could not post anything to server.js");
  }
}

// GET the data back from the server.js
async function useServerData() {
  // remove past info
  locationDiv.innerHTML = "";
  temperatureDiv.innerHTML = "";
  humidityDiv.innerHTML = "";
  weatherDiv.innerHTML = "";
  iconDiv.innerHTML = "";
  clothingtDiv.innerHTML = "";
  feelsLikeDiv.innerHTML = "";

  const req = await fetch("/server_data");

  try {
    // weather info
    let Data = await req.json();
    // dataLength makes so the data that is added is only the latest object (count starts at 0)
    let dataLength = Data.length - 1;
    let data = Data[dataLength].data;
    // farrenheit
    let fahrenheit = Math.floor(data.temp * 1.8) + 32;
    // feels like temp to fahrenheit
    let feelsLikeFahreneheit = Math.floor(data.feelsLike * 1.8) + 32;

    // clothing check taking into account personal temp
    clothingCheck(fahrenheit);
    // update UI
    // add geography
    locationDiv.innerHTML = `<h3> the weather in ${data.city}, ${data.country} is: </h3> `;
    // temp
    temperatureDiv.innerHTML = `<p>${fahrenheit} degrees fahrenheit or ${data.temp} degrees celsius. </p`;
    // feels like temp
    feelsLikeDiv.innerHTML = `<p> The 'feels like' temperature is ${feelsLikeFahreneheit} degrees fahrenheit.</p>`;
    // add humidity
    humidityDiv.innerHTML = `<p> The humidity level is ${data.humidity}%. </p>`;
    // weather info (data.main aka data.descripting comes as an uppercase first letter)
    weatherDiv.innerHTML = `<p> We're looking at ${data.description.toLowerCase()} today. <br>${rainCheck(
      data.description
    )}</p>`;
    iconDiv.innerHTML = `<img src="http://openweathermap.org/img/wn/${data.icon}@2x.png">`;
  } catch (error) {
    console.log("couldn't get the data back from the server", error);
    locationDiv.innerHTML = "<h1> Couldn't find that. Sorry </h1>";
    temperatureDiv.innerHTML = "";
    humidityDiv.innerHTML = "";
    weatherDiv.innerHTML = "";
    iconDiv.innerHTML = "";
    clothingtDiv.innerHTML = "";
    feelsLikeDiv.innerHTML = "";
  }
}

// function testing for rain

function rainCheck(weatherDescription) {
  if (weatherDescription == "Drizzle") {
    return "Might want to hava an umbrella handy.";
  } else if (weatherDescription == "Rain") {
    return "Might want to grab a umbrella.";
  } else {
    return "";
  }
}

// functions testing for shirt/jacket/ or coat

function coatCheck(finalTemp) {
  if (finalTemp <= 25) {
    return true;
  }
}

function heavyJacketCheck(finalTemp) {
  if (finalTemp > 25 || finalTemp < 44) {
    return true;
  }
}

function lightJacketCheck(finalTemp) {
  if (finalTemp >= 44 || finalTemp < 65) {
    return true;
  }
}

function tshirtCheck(finalTemp) {
  if (finalTemp >= 65) {
    return true;
  }
}

function clothingCheck(farenheitTemp) {
  if (tshirtCheck(farenheitTemp) === true) {
    clothingtDiv.innerHTML =
      "<h1> ...Nope! </h1> <p> You'll be fine with a tshirt! </p>";
  } else if (lightJacketCheck(farenheitTemp) === true) {
    clothingtDiv.innerHTML =
      "<h1> ...YES! </h1> <p> Best grab a light jacket or fleece.</p> ";
  } else if (heavyJacketCheck(farenheitTemp) === true) {
    clothingtDiv.innerHTML =
      "<h1> ...YES! </h1> <p> Better grab a heavy jacket or light coat. </p> ";
  } else if (coatCheck(farenheitTemp) === true) {
    clothingtDiv.innerHTML =
      "<h1> ...Nope! </h1> <p> It's too cold for a Jacket silly!  It's winter coat weather! </p";
  }
}

// test

// main functions

// adds a event listner to start getting the data as soon as the user enters 5 characters in the zipcode form

let zipcodeForm = document.getElementById("zip");
zipcodeForm.addEventListener("keyup", function () {
  //test to see if the user has entered 5 numbers(no characters allowed)
  if (
    document.getElementById("zip").value.length === 5 &&
    document.getElementById("zip").value.match(/^[0-9]+$/)
  ) {
    runProgram();
  } else if (!document.getElementById("zip").value.match(/^[0-9]+$/)) {
    locationDiv.innerHTML = "<h1> Please enter only numbers. </h1>";
    temperatureDiv.innerHTML = "";
    humidityDiv.innerHTML = "";
    weatherDiv.innerHTML = "";
    iconDiv.innerHTML = "";
    clothingtDiv.innerHTML = "";
    feelsLikeDiv.innerHTML = "";
  }
});

// add event listner to remove data on any requests less than 5 characters
generateButton.addEventListener("click", function () {
  if (document.getElementById("zip").value.length !== 5) {
    locationDiv.innerHTML = "<h1> Couldn't find that. Sorry </h1>";
    temperatureDiv.innerHTML = "";
    humidityDiv.innerHTML = "";
    weatherDiv.innerHTML = "";
    iconDiv.innerHTML = "";
    clothingtDiv.innerHTML = "";
    feelsLikeDiv.innerHTML = "";
  }
});

function runProgram() {
  // input
  let enteredZipcode = document.getElementById("zip").value;
  //santize input
  enteredZipcode = sanitize(enteredZipcode);
  // test zip code
  if (enteredZipcode.length !== 5) {
    locationDiv.innerHTML = "<h1> Couldn't find that. Sorry </h1>";
    temperatureDiv.innerHTML = "";
    humidityDiv.innerHTML = "";
    weatherDiv.innerHTML = "";
    iconDiv.innerHTML = "";
    clothingtDiv.innerHTML = "";
    feelsLikeDiv.innerHTML = "";
  } else {
    // post the weather to the server
    getWeatherData(baseURL, enteredZipcode, APIKey).then((data) => {
      postData("/add", {
        // weather data
        data: data,
      });
      // get the server data back and use it
      useServerData();
    });
  }
}
