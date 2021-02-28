"use strict";

window.addEventListener("DOMContentLoaded", start);

const qs = (s) => document.querySelector(s);
const qsA = (s) => document.querySelectorAll(s);

let studentList = [];
let currentList = [];

let bloodTypeData;

const settings = {
  currentFilter: "all",
  currentFilterKey: "house",
  currentSort: "",
  sortDir: "desc",
};

// Student object for reference. Should be moved to the displayList function later
const StudentObj = {
  // Student object template
  id: 0,
  firstName: "",
  middleName: "",
  lastName: "",
  nickName: "Unknown",
  gender: "",
  imageFile: "",
  house: "",
  blood: "muggle",
  prefect: false,
  quidditch: "", // 'player' or 'captain' here, if on the team
  inquisitor: false,
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

// Get da data!

async function loadJSON() {
  // Trying this async stuff. Still not sure how the details work
  const response = await fetch(
    "https://petlatkea.dk/2021/hogwarts/students.json"
  );
  const dirtyData = await response.json();

  const responseBlood = await fetch(
    // Fetching the blood status data
    "https://petlatkea.dk/2021/hogwarts/families.json"
  );
  const bloodData = await responseBlood.json();
  prepareBloodData(bloodData);
  prepareObjects(dirtyData);
}

function prepareBloodData(bloodData) {
  bloodTypeData = bloodData; // Put data in global variable to be accessed later
}

function prepareObjects(dirtyData) {
  // -> cleanData, return array of cleaned student objects
  const cleanedData = dirtyData.map(cleanData);
  const bloodTypesAdded = cleanedData.map(getBloodType); // Add blood type here, AFTER student JSON data has been handled
  studentList = bloodTypesAdded; // Updates the studenList array
  currentList = bloodTypesAdded; // Also set currentList (so search works on the initial list)
  displayList(studentList);
}

function getBloodType(student) {
  const data = bloodTypeData; // Shorthand var for blood array data
  // Check if match between lastName and blood type data json:
  if (
    data.half.includes(student.lastName) &&
    data.pure.includes(student.lastName)
  ) {
    student.blood = "half/pure";
  } else if (student.lastName === "") {
    student.blood = "unknown";
  } else if (data.half.includes(student.lastName)) {
    student.blood = "half";
  } else if (data.pure.includes(student.lastName)) {
    student.blood = "pure";
  } else {
    student.blood = "muggle";
  }
  return student; // Puts the modified object back in the new array
}

// CLEANING THE DATA & BUILDING NEW ARRAY FROM DATA :

// Clean each student obj
function cleanData(dirtyObject, index) {
  // FIRST, MIDDLE, NICK AND LAST NAMES (send to seperate function)
  const cleanedNames = cleanFullname(dirtyObject.fullname);
  // HOUSE NAME - clean it here
  const trimHouseName = dirtyObject.house.trim();
  const houseName = capitalize(trimHouseName);
  // GENDER
  const studentGender = dirtyObject.gender;

  const oneStudent = Object.create(StudentObj); // 'Clone' the object

  // 'Populate' the new object with the cleaned data
  oneStudent.id = index; // Add ID to object for quick calling
  oneStudent.firstName = cleanedNames.firstName; // 'Populate' the object
  oneStudent.middleName = cleanedNames.middleName;
  oneStudent.lastName = cleanedNames.lastName;
  oneStudent.nickName = cleanedNames.nickName;
  oneStudent.house = houseName;
  oneStudent.gender = studentGender;

  return oneStudent;
}

// Functions for cleaning and getting data for each student object:

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
    const lastNames = lastName.split("-");
    lastNames[1] = capitalize(lastNames[1]);
    lastName = lastNames.join("-");
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
// Pass event data to setFilter()
function filterClicked(event) {
  console.log("A filter was clicked!");
  const filButt = event.target.dataset.filter; // Get data attr from event elem
  const filType = event.target.dataset.key;
  setFilter(filButt, filType); // Pass data attr (the button clicked) to this func
}
// Update currentFilter & currentFilterKey in setings obj
function setFilter(filButt, filType) {
  console.log(filType, filButt);
  settings.currentFilter = filButt; // Set current filter
  settings.currentFilterKey = filType;
  //console.log(settings);
  buildList();
}
// Filter data based on current filter and key values in settings obj
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

// Pass event data to setSort()
function sortingClicked(event) {
  console.log("A sorting was clicked!");
  const sortButt = event.target.dataset.sort; // Get data attr from event elem
  const dir = event.target.dataset.direction;
  const sortElemClicked = event.target;

  setSort(sortButt, dir, sortElemClicked); // Pass data attr (the button clicked) to sortingSet func
}
// Update currentSort & sortDir in settings obj - Set data-direction attr to opposite (asc/desc)
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
// Sort based on currentSort and sortDir in settings obj
function sortList(filteredList) {
  const sortType = settings.currentSort;
  const dir = settings.sortDir; // Get sort direction from settings object
  // console.log(dir);
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

// SEARCH FUNCTION

function searchList(event) {
  const input = event.target.value;
  const searchList = currentList.filter((student) => {
    if (
      // Look through every key value of every student obj for input match
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

// Get updated filter and sort data before displaying list
function buildList() {
  const filteredList = filterList(studentList);
  const sortedList = sortList(filteredList);
  currentList = sortedList; // Update the currently displayed array

  displayList(sortedList); // Send result to displayList()
}
// Display list of students based on filter/sort criteria
function displayList(allStudents) {
  qs("#list tbody").innerHTML = "";

  allStudents.forEach(displayStudent);
}
// Get data for one student to diplay in displauList(allStudents) above
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

  const bloodSymbol = getBloodSymbol(oneStudent.blood); // Get blood type symbol
  // if (oneStudent.blood === 'half') {
  //   bloodSymbol = '\u25D2';
  // }
  // if (oneStudent.blood === 'full') {
  //   bloodSymbol = '\u2B24';
  // } // Display blood sybol in list:
  clone.querySelector("[data-field=blood]").textContent = bloodSymbol;

  clone // Add event to call shwDetails
    .querySelector("tr")
    .addEventListener("click", (e) => showDetails(oneStudent));

  qs("#list tbody").appendChild(clone); // append clone to list
}
// Display single student in modal
function showDetails(student) {
  const template = qs("template.modal").content;
  const myModal = template.cloneNode(true);

  const modalBox = myModal.querySelector(".modal_box");
  const content = myModal.querySelector(".modal_content");
  const shield = myModal.querySelector(".house_shield");
  const editButton = myModal.querySelector(".edit_info");
  const image = myModal.querySelector(".modal_header img");
  const dataArea = myModal.querySelector(".modal_data");

  // Get image URL -> createImgUrl
  if (student.lastName && student.firstName) {
    // Both names mus be available to create img URL
    let tempLastName = student.lastName;
    if (student.lastName.includes("-")) {
      // Get name part after hyphen in lastName
      tempLastName = student.lastName.slice(student.lastName.indexOf("-") + 1);
    } // Create the img URL string:
    const imgUrl = `./student_img/${tempLastName.toLowerCase()}_${student.firstName
      .substring(0, 1)
      .toLowerCase()}.png`;
    image.setAttribute("src", imgUrl);
  } else {
    // If one of the names are not available, default to this URL
    image.setAttribute("src", "./student_img/no_img.png");
  }

  // Get shield image
  // Get names, gender etc.
  // Populate template with img, data and shield

  if (student.firstName) {
    // Add the names IF they exist
    const firstName = document.createElement("h4");
    firstName.innerHTML = `First name: ${student.firstName.bold()}`;
    myModal.querySelector(".modal_data").appendChild(firstName);
  }
  if (student.middleName) {
    const middleName = document.createElement("h4");
    middleName.innerHTML = `Middle name: ${student.middleName.bold()}`;
    myModal.querySelector(".modal_data").appendChild(middleName);
  }
  if (student.lastName) {
    const lastName = document.createElement("h4");
    lastName.innerHTML = `Last name: ${student.lastName.bold()}`;
    myModal.querySelector(".modal_data").appendChild(lastName);
  }
  if (student.nickName) {
    const nickName = document.createElement("h4");
    nickName.innerHTML = `Nickname: "${student.nickName.bold()}"`;
    myModal.querySelector(".modal_data").appendChild(nickName);
  }

  const bloodSymbol = getBloodSymbol(student.blood); // Get blood type symbol
  const bloodType = document.createElement("h4"); // Display blood type
  bloodType.innerHTML = `Blood type: ${capitalize(
    student.blood
  ).bold()} ${bloodSymbol}`;
  myModal.querySelector(".modal_data").appendChild(bloodType);

  // Add click event to button -> editStudent() (edit prefect, team (standard or captain), inquisitor, EXPELL)  
  myModal.querySelector('.edit_student').addEventListener("click", () => openEditDialogue(student));
  // Click outside modal_content to remove modal from DOM
  myModal.querySelector(".go_back").addEventListener("click", () => {
    console.log('Modal was removed!')
    document.querySelector(".modal_box").remove(); 
  });

  qs("#screen").appendChild(myModal);
}

// Sub functions related to the modal :

// Get blood type symbol to display
function getBloodSymbol(bloodType) {
  // Get unicode symbol to go with blood str!
  if (bloodType === "half") {
    return "h";
  } else if (bloodType === "pure") {
    return "p";
  } else if (bloodType === "half/pure") {
    return "h/p";
  } else if (bloodType === "unknown") {
    return "?";
  } else {
    return "m";
  }
}

// EDIT DIALOGUE

function openEditDialogue(student) {

  const template = qs(".dialogue").content;
  const dialogue = template.cloneNode(true);

  console.log('Prefect status is now ' + student.prefect)
  console.log('Inquisitor status is now ' + student.inquisitor)
  // Temporarely remove click events from modal so it doesn't close while editing student):
  qs('.modal_buttons').style.pointerEvents = 'none';
  dialogue.querySelector('.edit_dialogue').classList.remove('hide'); // Un-hide the dialogue box

  // Summary txt here
  // 'Name is a prefect and member of the inquisitorial squas'

  // PREFECT STATUS
  // Set button txt depending on prefect status
  if (student.prefect === false) {
    dialogue.querySelector('.prefect_toggle').textContent = 'Appoint Prefect';
  } else {
    dialogue.querySelector('.prefect_toggle').textContent = 'Strip of Prefect title';
  } // Change prefect status click event
  dialogue.querySelector('.prefect_toggle').addEventListener('click', () => changePrefectStatus(student));



  // INQUISITOR STATUS
  // Set button txt depending on inquisitor status
  if (student.inquisitor === false) {
    dialogue.querySelector('.inquisitor_toggle').textContent = 'Appoint Inquisitor';
  } else {
    dialogue.querySelector('.inquisitor_toggle').textContent = 'Remove from inquisitorial squad';
  }
  dialogue.querySelector('.inquisitor_toggle').addEventListener('click', () => changeInquisitorStatus(student));
  // Close dialogue again
  dialogue.querySelector('.go_back').addEventListener('click', () => closeDialogue(student));
  qs('#screen').appendChild(dialogue);
}

function closeDialogue(student) {
  qs('.edit_dialogue').remove();
  qs('.modal_box').remove();
  buildList();
  showDetails(student);
}

// INQUISITOR SUB FUNCTIONS

function changeInquisitorStatus(student) {
  if (student.inquisitor === true) {
    student.inquisitor = false;
    resetAndRebuild(student);
  } else {
    tryToMakeInquisitor(student);
  }
}

// Check if student can be made inquisitor
function tryToMakeInquisitor(selectedStudent) {

  const house = selectedStudent.house;
  const bloodType = selectedStudent.blood;
  const popup = qs(".no_inquisitor");

  if (house.toLowerCase() === 'slytherine' || bloodType === 'pure') {
    makeInquisitor();
  } else {
    appointNotPossible();
  }

  function appointNotPossible() {
    popup.classList.remove("hide");
    qs(".no_inquisitor .cancel").addEventListener("click", closePopup);
  }

  function closePopup() {
      popup.classList.add("hide");
      qs(".no_inquisitor .cancel").removeEventListener("click", closePopup);
    }

  function makeInquisitor() {
    selectedStudent.inquisitor = true;
    resetAndRebuild(selectedStudent);
  }
}

// PREFECT SUB FUNCTIONS

function changePrefectStatus(student) {
  if (student.prefect === true) {
    student.prefect = false;
    resetAndRebuild(student);
  } else {
    tryToMakePrefect(student);
  }
}
// Check if student can be made prefect
function tryToMakePrefect(selectedStudent) {
  // Get all prefects in Hogwarts
  const allPrefects = studentList.filter((student) => student.prefect === true);
  // Get prefects from same house as selectedStudent
  const fromThisHouse = allPrefects.filter(
    (student) => student.house === selectedStudent.house
  );
  // Look for existing prefects from this house of the same sex. Use .shift() to return the first elem found (doesn't matter how many found)
  const ofSameGender = fromThisHouse
    .filter((student) => student.gender === selectedStudent.gender)
    .shift();
  const nrPrefInHouse = fromThisHouse.length + 1; // Counting prefects in this house

  if (nrPrefInHouse > 2) { // If theres already 2 prefects from this house
    console.log(`A maximum of 2 students from each house can be made prefects!`);
    removeAorB(fromThisHouse[0], fromThisHouse[1]);
  } else if (ofSameGender) { // If theres already a prefect of this gender
    console.log(`Only one ${selectedStudent.gender} can be made prefect!`);
    removeOtherStudent(ofSameGender);
  } else { // removeOtherPefect(ofSameGender)
    makePrefect(selectedStudent);
  }

  // Show popup with remove and cancel button
  function removeOtherStudent(student) {
    const popup = qs(".removeOther");
    popup.classList.remove("hide");
    qs(".removeOther .alert").textContent = `You can only appoint one ${student.gender} from each house!`;
    qs(".removeOther .cancel").addEventListener("click", closePopup);
    qs(".remove_other").addEventListener("click", clickRemoveOther);
    // Show names on button
    qs(".remove_other").textContent = `Remove ${student.firstName} ${student.lastName}`;
    // Close popup if cancel button clicked
    function closePopup() {
      popup.classList.add("hide");
      qs(".removeOther .cancel").removeEventListener("click", closePopup);
      qs(".remove_a").removeEventListener("click", clickRemoveOther);
    }

    function clickRemoveOther() {
      removePrefect(student);
      makePrefect(selectedStudent);
      closePopup();
      resetAndRebuild(selectedStudent);
    }
  }

  // Show popup with remove A or B and cancel buttons
  function removeAorB(studA, studB) {
    const popup = qs(".removeAorB");
    popup.classList.remove("hide");
    qs(".removeAorB .cancel").addEventListener("click", closePopup);
    qs(".remove_a").addEventListener("click", clickRemoveA);
    qs(".remove_b").addEventListener("click", clickRemoveB);
    // Show names on buttons
    qs(".remove_a").textContent = `Remove ${studA.firstName} ${studA.lastName}`;
    qs(".remove_b").textContent = `Remove ${studB.firstName} ${studB.lastName}`;
    // Close popup if cancel button clicked
    function closePopup() {
      popup.classList.add("hide");
      qs(".removeAorB .cancel").removeEventListener("click", closePopup);
      qs(".remove_a").removeEventListener("click", clickRemoveA);
      qs(".remove_b").removeEventListener("click", clickRemoveB);
    }

    function clickRemoveA() {
      removePrefect(studA);
      makePrefect(selectedStudent);
      closePopup();
      resetAndRebuild(selectedStudent);
    }

    function clickRemoveB() {
      removePrefect(studB);
      makePrefect(selectedStudent);
      closePopup();
      resetAndRebuild(selectedStudent);
    }
  }
  // Generic make prefect function
  function makePrefect(student) {
    student.prefect = true;
    resetAndRebuild(selectedStudent);
  }
  // Generic remove prefect function
  function removePrefect(student) {
    student.prefect = false;
  }
}

// Call this after clicking button in dialogue box to update everything
function resetAndRebuild(student) {
  console.log('Resetting...')
  qs('.edit_dialogue').remove(); // Removes dialogue and modal completely
  qs('.modal_box').remove(); 
  buildList(); // Updates the current list with any changes
  showDetails(student); // Clones modal again
  openEditDialogue(student); // Clones dialogue again
}