"use strict";

window.addEventListener("DOMContentLoaded", start);

const allStudents = [];

const settings = {
  currentFilter: 'all',
  currentSort: '',
  sortDir: 'desc'
}
// Student object for reference. Should be moved to the displayList function later

const Student = {
      // Student object template
      firstName: "",
      middleName: "",
      lastName: "",
      nickName: "Unknown",
      gender: "",
      imageFile: "",
      house: "",
    };


function start() {
  console.log("ready");
    // Add eventlisteners to buttons
  loadJSON();
}

function loadJSON() {
  fetch("https://petlatkea.dk/2021/hogwarts/students.json")
    .then((response) => response.json())
    .then((jsonData) => {
      // when loaded, prepare objects
      prepareObjects(jsonData);
    });
}

function prepareObjects(jsonData) {
    console.log(jsonData);
    // -> cleanData, return array of cleaned student objects
    // -> DisplayList
}

// CLEANING THE DATA

function cleanData() { // May require extra functions
    // Split string
    // -> capitalize each word
    // Copy the student object and populate it with cleaned data
    // return array of cleaned objects

}

function capitalize() {
    // Set first letter to upper case, the rest to lower case
    // return modified word
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