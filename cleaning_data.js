"use strict";

window.addEventListener("DOMContentLoaded", start);

const allStudents = [];

function start() {
  //console.log("ready");

  loadJSON();
}

function loadJSON() {
  fetch("https://petlatkea.dk/2021/hogwarts/students.json")
    .then((response) => response.json())
    .then((jsonData) => {
      // when loaded, prepare objects
      cleanStudentData(jsonData);
      //console.table(jsonData);
    });
}

function cleanStudentData(jsonData) {
  jsonData.forEach((jsonObject) => {
    const Student = {
      // Student object template
      firstName: "",
      middleName: "",
      lastName: "",
      nickName: "Unknown",
      imageFile: "",
      house: "",
    };
    // Variables to store cleaned strings
    let firstName;
    let lastName;
    let middleName;
    let nickName;

    // Start cleaning the data
    const oneStudent = Object.create(Student); // "Cloning" the template object, ready for population
    const fullName = jsonObject.fullname.trim(); // Get and trim the fullname string from the json:
    const nrOfNames = fullName.split(" "); // Get the number of words in fullName as array
    // Get and clean the FIRST NAME
    firstName =
      fullName[0].toUpperCase() + // Get the first name + set to lower case + capitalize first letter
      fullName.slice(1, fullName.indexOf(" ")).toLowerCase();
    // Get and clean the LAST NAME - IF there is a last name!
    if (nrOfNames.length > 1) { // Check if there is only one name in the fullname (i.e. no last name)
      const lastWord =
        fullName.charAt(fullName.lastIndexOf(" ") + 1).toUpperCase() +
        fullName.slice(fullName.lastIndexOf(" ") + 2).toLowerCase();
        lastName = lastWord;
    }
    if (lastName.includes("-")) {  // Capitalize name after hyphen("-"):
        const capAfterHyph = 
        lastName.charAt(lastName.lastIndexOf(" ") + 1).toUpperCase() +
        lastName.substring(lastName.lastIndexOf(" ") + 2, lastName.indexOf("-")).toLowerCase() + '-' +
        lastName.charAt(lastName.indexOf("-") + 1).toUpperCase() +
        lastName.substring(lastName.lastIndexOf("-") + 2).toLowerCase();
        console.log(capAfterHyph);
    }

    console.log(lastName);

    // Let's clean the MIDDLE NAME(S)
    const allMiddleNames = fullName.slice(
      fullName.indexOf(" ") + 1, // Gets everything between first and last " "
      fullName.lastIndexOf(" ")
    );
    if (!allMiddleNames.includes('"')) { // Check if the word includes " - if not, treat it a a middle name
      middleName = // Set upper and lower case of the middle name
        allMiddleNames.substring(0, 1).toUpperCase() +
        allMiddleNames.substring(1).toLowerCase();
      //console.log(middleName);
    } else { // If the word includes " - treat it as a nickname instead
      nickName = 
        allMiddleNames.substring(1, 2).toUpperCase() +
        allMiddleNames.substring(2, allMiddleNames.lastIndexOf('"')).toLowerCase();
    }
    // console.log('hi');
    // Set the values of the cloned object to their 'cleaned' namesakes
    oneStudent.firstName = firstName;

    allStudents.push(oneStudent);
  });
  // console.log(allStudents);

  // displayList();
}

function displayList() {
  // clear the list
  document.querySelector("#list tbody").innerHTML = "";

  // build a new list
  allAnimals.forEach(displayAnimal);
}

function displayAnimal(animal) {
  // create clone
  const clone = document
    .querySelector("template#animal")
    .content.cloneNode(true);

  // set clone data
  clone.querySelector("[data-field=name]").textContent = animal.name;
  clone.querySelector("[data-field=desc]").textContent = animal.desc;
  clone.querySelector("[data-field=type]").textContent = animal.type;
  clone.querySelector("[data-field=age]").textContent = animal.age;

  // append clone to list
  document.querySelector("#list tbody").appendChild(clone);
}
