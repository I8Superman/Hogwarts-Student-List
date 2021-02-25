"use strict";

window.addEventListener("DOMContentLoaded", start);

let studentList = [];

const settings = {
  currentFilter: 'all',
  currentSort: '',
  sortDir: 'desc'
}

// Student object for reference. Should be moved to the displayList function later
const StudentObj = {
      // Student object template
      firstName: "",
      middleName: "",
      lastName: "",
      nickName: "Unknown",
      gender: "",
      imageFile: "",
      house: "",
      prefect: false,
      quidditch: "", // 'player' or 'captain' here, if on the team
      expelled: false,
    };


function start() {
  console.log("ready");
    // Add eventlisteners to buttons
  loadJSON();
}

function loadJSON() {
  fetch("https://petlatkea.dk/2021/hogwarts/students.json")
    .then((response) => response.json())
    .then((dirtyData) => {
      // when loaded, prepare objects
      prepareObjects(dirtyData);
    });
}

function prepareObjects(dirtyData) {
    // -> cleanData, return array of cleaned student objects
    const cleanedData = dirtyData.map(cleanData);
    studentList = cleanedData;
    console.table(cleanedData);
    // DisplayList
}

// CLEANING THE DATA

// Clean each student obj
function cleanData(dirtyObject) { 
    // FIRST, MIDDLE, NICK AND LAST NAMES (send to seperate function)
    const cleanedNames = cleanFullname(dirtyObject.fullname);
    // HOUSE NAME - clean it here
    const trimHouseName = dirtyObject.house.trim();
    const houseName = capitalize(trimHouseName);
    // GENDER 
    const studentGender = dirtyObject.gender;

    // QUIDDITCH, PREFECTS, INQUISITORS, EXPELLED
    // Send to individual functions who set these parameters

    // Copy the student object and populate it with cleaned data
    const oneStudent = Object.create(StudentObj); // 'Clone' the object
    
    oneStudent.firstName = cleanedNames.firstName; // 'Populate' the object
    oneStudent.middleName = cleanedNames.middleName;
    oneStudent.lastName = cleanedNames.lastName;
    oneStudent.nickName = cleanedNames.nickName;
    oneStudent.house = houseName;
    oneStudent.gender = studentGender;

    return oneStudent;
}

function cleanFullname(fullName) {
    const trimFullName = fullName.trim(); // Remove spaces before and after fullname
    const nrOfNames = trimFullName.split(' '); // Counting names
    const firstSpace = trimFullName.indexOf(' ');
    const lastSpace = trimFullName.lastIndexOf(' ');
    // Seperate words and capitalize
    let firstName = capitalize(trimFullName.substring(0, firstSpace));
    let middleName = capitalize(trimFullName.substring(firstSpace + 1, lastSpace));
    let lastName = capitalize(trimFullName.substring(lastSpace +1));
    let nickName = '';
    // Fix no middlename, hyphens, no lastname etc.
    if (middleName.includes('"')) { // Sort nicknames from middle names
        middleName = '';
        nickName = capitalize(trimFullName.substring(firstSpace + 2, lastSpace - 1));
    }
    if (middleName === " ") { // Set no middlename to empty str
    middleName = "";
    }
    if (nrOfNames.length === 1) { // Puts Leannes name in the firstName
        firstName = lastName;     // instead of in the lastName
        lastName = '';
    }
    if (lastName.includes("-")) {
    lastName = lastName.split("-");
    lastName[1] =
      lastName[1].charAt(0).toUpperCase() +
      lastName[1].substring(1).toLowerCase();
    lastName = lastName.join("-");
    }
    return { firstName, middleName, lastName, nickName}
}

function capitalize(word) {
    // Set first letter to upper case, the rest to lower case
    const capName =
    word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase();
    return capName;  // return modified word
}

// FILTERING

function filterClicked() {
    // Call setFilter with event data
}

function setFilter(eventData) {
    // Set currentFilter to clicked button (eventData)
    // -> buildList()
}

function filterList() {
    // Where the actual filterig takes place
    // return array of filtered students
}

// SORTING

function sortingClicked() {
    // Call setSort with event data
}

function setSort(eventData) {
    // Set currentSort to clicked button (eventData)
    // -> buildList()
}

function sortList() {
    // Where the actual sorting takes place
    // return array of sorted students
}


// DISPLAYING THINGS

function buildList() {
    // call filiterList and sortList
    // Send result to displayList()
}

function displayList() {
    // allStudents.forEach -> displayStudent
}

function displayStudent() {
    // Clone the student template, populate it with a studen object and append to the list
}