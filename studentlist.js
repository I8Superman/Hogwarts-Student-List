"use strict";

window.addEventListener("DOMContentLoaded", start);

const qs = (s) => document.querySelector(s);
const qsA = (s) => document.querySelectorAll(s);

let studentList = [];
let currentList = [];

const settings = {
  currentFilter: "all",
  currentFilterKey: "house",
  currentSort: "",
  sortDir: "desc",
};

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
  blood: "",
  prefect: false,
  quidditch: "", // 'player' or 'captain' here, if on the team
  inquisition: false,
  expelled: false,
};

function start() {
  console.log("ready");
  // Add eventlisteners to buttons and filters
  const filButts = qsA(".filter");
  filButts.forEach((button) => {
    button.addEventListener("click", filterClicked);
  });
  const sortButts = qsA('[data-action="sort"]');
  sortButts.forEach((button) => {
    button.addEventListener("click", sortingClicked);
  });
  // Add listener to search input field - triggers searchList functon below
  qs("#search_field").addEventListener("input", searchList);

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
  studentList = cleanedData; // Updates the studenList array
  displayList(studentList);
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
  const nrOfNames = trimFullName.split(" "); // Counting names
  const firstSpace = trimFullName.indexOf(" ");
  const lastSpace = trimFullName.lastIndexOf(" ");
  // Seperate words and capitalize
  let firstName = capitalize(trimFullName.substring(0, firstSpace));
  let middleName = capitalize(
    trimFullName.substring(firstSpace + 1, lastSpace)
  );
  let lastName = capitalize(trimFullName.substring(lastSpace + 1));
  let nickName = "";
  // Fix no middlename, hyphens, no lastname etc.
  if (middleName.includes('"')) {
    // Sort nicknames from middle names
    middleName = "";
    nickName = capitalize(
      trimFullName.substring(firstSpace + 2, lastSpace - 1)
    );
  }
  if (middleName === " ") {
    // Set no middlename to empty str
    middleName = "";
  }
  if (nrOfNames.length === 1) {
    // Puts Leannes name in the firstName
    firstName = lastName; // instead of in the lastName
    lastName = "";
  }
  if (lastName.includes("-")) {
    lastName = lastName.split("-");
    lastName[1] =
      lastName[1].charAt(0).toUpperCase() +
      lastName[1].substring(1).toLowerCase();
    lastName = lastName.join("-");
  }
  return { firstName, middleName, lastName, nickName };
}

function capitalize(string) {
  // Set first letter to upper case, the rest to lower case
  const capName =
    string.substring(0, 1).toUpperCase() + string.substring(1).toLowerCase();
  return capName; // return modified word
}

// FILTERING

function filterClicked(event) {
  console.log("A filter was clicked!");
  const filButt = event.target.dataset.filter; // Get data attr from event elem
  const filType = event.target.dataset.key;
  setFilter(filButt, filType); // Pass data attr (the button clicked) to this func
}

function setFilter(filButt, filType) {
  console.log(filType, filButt);
  settings.currentFilter = filButt; // Set current filter
  settings.currentFilterKey = filType;
  //console.log(settings);
  buildList();
}

function filterList(studentList) {
  const filter = settings.currentFilter;
  const filterKey = settings.currentFilterKey;
  // Filter the array BUT use arrow function to also pass filter name to applyFilter function
  const filApplied = studentList.filter((student) => {
    if (filter === "all") {
      // If 'all', return all objects
      return true;
    } else if (student[filterKey] === filter || student[filterKey] === true) {
      return true; // Return object with keys of the filtered value
    } else {
      return false;
    }
  });
  return filApplied;
}

// SORTING

function sortingClicked(event) {
  console.log("A sorting was clicked!");
  const sortButt = event.target.dataset.sort; // Get data attr from event elem
  const dir = event.target.dataset.direction;
  const sortElemClicked = event.target;

  setSort(sortButt, dir, sortElemClicked); // Pass data attr (the button clicked) to sortingSet func
}

function setSort(sortButt, dir, sortElemClicked) {
  console.log(sortButt, dir, sortElemClicked);
  settings.currentSort = sortButt;
  settings.sortDir = dir; // Set sort direction in settings object
  // Set data-direction attr to the opposite of what it is now:
  sortElemClicked.setAttribute(
    "data-direction",
    dir === "desc" ? "asc" : "desc"
  );

  buildList();
}

function sortList(filteredList) {
  const sortType = settings.currentSort;
  const dir = settings.sortDir; // Get sort direction from settings object
  console.log(dir);

  const sortApplied = filteredList.sort(function (a, b) {
    if (a[sortType] < b[sortType]) {
      // The square brackets tells JS that I'm calling a variable, not a property!
      return dir === "desc" ? -1 : 1;
    } else {
      return dir === "desc" ? 1 : -1;
    }
  });
  return sortApplied;
}

// SEARCH FUNCTION (a cool and simple one I'd say!)

function searchList(event) {
  console.log("search updated!");
  const input = event.target.value;
  const searchList = studentList.filter((student) => {
    if (
      student.firstName.toLowerCase().includes(input.toLowerCase()) ||
      student.lastName.toLowerCase().includes(input.toLowerCase()) ||
      student.middleName.toLowerCase().includes(input.toLowerCase()) ||
      student.nickName.toLowerCase().includes(input.toLowerCase()) ||
      student.house.toLowerCase().includes(input.toLowerCase())
    ) {
      return true; // Search for input string in student objects different keys - ad to filtered arr if true
    } else {
      return false;
    }
  });
  displayList(searchList); // Display the filtered list directly. buildList() wouldn't work, as it filters from the full studentList again, erasing this searchList
}

// DISPLAYING THINGS

function buildList() {
  const filteredList = filterList(studentList);
  const sortedList = sortList(filteredList);
  currentList = sortedList; // Update the currently displayed array

  displayList(sortedList); // Send result to displayList()
}

function displayList(allStudents) {
  qs("#list tbody").innerHTML = "";

  allStudents.forEach(displayStudent);
}

function displayStudent(oneStudent) {
  // Clone the student template, populate it with a studen object and append to the list
  const clone = qs("#student").content.cloneNode(true);
  // set clone data
  clone.querySelector("[data-field=firstName]").textContent =
    oneStudent.firstName;
  clone.querySelector("[data-field=middleName]").textContent =
    oneStudent.middleName;
  clone.querySelector("[data-field=lastName]").textContent =
    oneStudent.lastName;
  clone.querySelector("[data-field=nickName]").textContent =
    oneStudent.nickName;
  clone.querySelector("[data-field=house]").textContent = oneStudent.house;
  clone.querySelector("[data-field=gender]").textContent = oneStudent.gender;
  clone.querySelector("[data-field=prefect]").textContent = oneStudent.prefect;

  clone
    .querySelector("tr")
    .addEventListener("click", (e) => showDetails(oneStudent));
  // append clone to list
  qs("#list tbody").appendChild(clone);
}

function showDetails(student) {
  console.log(student);

  const template = qs("template.modal").content;
  const myModal = template.cloneNode(true);

  const modalBox = myModal.querySelector(".modal_box");
  const content = myModal.querySelector(".modal_content");
  const shield = myModal.querySelector(".house_shield");
  const editButton = myModal.querySelector(".edit_info");
  const image = myModal.querySelector(".modal_header img");
  const dataArea = myModal.querySelector(".modal_data");
  const extraInfo = myModal.querySelector(".optional_info");

  modalBox.classList.remove("hide"); // Remove hide class and display modal box

  // Get image URL -> createImgUrl
  // Get shield image
  // Get names, gender etc.
  // Display img, data and shield

  // Add click event to button -> editStudent() (edit prefect, team (standard or captain), inquisitor, EXPELL)
  myModal.querySelector(".modal_box").addEventListener("click", () => {
    document.querySelector(".modal_box").remove(); // Click outside modal_content to remove modal from DOM again
  });

  qs("#screen").appendChild(myModal);
}
