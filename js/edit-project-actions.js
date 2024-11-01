const { ipcRenderer, remote } = require('electron');

// Function to load project details
function loadProjectDetails(projectId) {
  ipcRenderer.send('get-project-details', projectId);
}

// Prepopulate the form with project details
ipcRenderer.on('project-details-loaded', (event, project) => {
  document.getElementById('project-title').value = project.title;
  document.getElementById('filming-date-details').value = project.filming_date;
  document.getElementById('start-time-details').value = project.start_time;
});

// Handle form submission to amend project details
document.getElementById('amend-project-details-submit').addEventListener('click', () => {
  const projectId = new URLSearchParams(window.location.search).get('projectId');
  const projectDetails = {
    id: projectId,
    title: document.getElementById('project-title').value,
    filmingDate: document.getElementById('filming-date-details').value,
    startTime: document.getElementById('start-time-details').value,
  };

  ipcRenderer.send('amend-project-details', projectDetails);
});

// Listen for response from main process
ipcRenderer.on('amend-project-details-response', async (event, response) => {
  recalculateTimes();
  await remote.dialog.showMessageBox({
    message: response.message,
    buttons: ['OK']
  });
  // Refocus the first input field after the dialog closes with a slight delay
  setTimeout(() => {
    document.getElementById('project-title').focus();
  }, 100);
});

// Add a hidden field with project id (so we can reference it in other scripts)
function addProjectId(projectId) {
  var hiddenField = document.createElement("input");
  hiddenField.setAttribute("type", "hidden");
  hiddenField.setAttribute("id", "projectId");
  hiddenField.setAttribute("value", projectId);
}

// Load project details on page load
window.onload = () => {
  const projectId = new URLSearchParams(window.location.search).get('projectId');
  if (projectId) {
    loadProjectDetails(projectId);
    addProjectId(projectId);
  }
};

// Save and load shots and misc data
// Function to save the table data
function saveTableData(projectId) {
  const tableBody = document.querySelector('#shot-list tbody');
  const tableHTML = tableBody.innerHTML;

  ipcRenderer.send('save-table-html', { projectId, tableHTML });
}

// Function to load the table data
function loadTableData(projectId) {
  ipcRenderer.send('load-table-data', projectId);
}

ipcRenderer.on('table-html-loaded', (event, tableHTML) => {
  const tableBody = document.querySelector('#shot-list tbody');
  tableBody.innerHTML = tableHTML;

  deleteRowButton();

});

// Delete row button functionality
function deleteRowButton() {
  // Reattach event listeners if necessary
  const tableBody = document.querySelector('#shot-list tbody');
  tableBody.querySelectorAll('.delete-button').forEach(button => {
    button.addEventListener('click', () => {
      showModal('Are you sure you want to perform this action?', () => {
        button.closest('tr').remove();
        console.log('Action confirmed!');
      });
    });
  });
}

// Function to add a shot row to the table
function addShotRow(shot) {
  const tableBody = document.querySelector('#shot-list tbody');
  const row = document.createElement('tr');
  row.classList.add('shot-row', 'handle');
  row.dataset.value = shot.data_value;
  row.innerHTML = `
    <td class="table-info fw-bold">${shot.time}</td>
    <td>${shot.shot_number}</td>
    <td>${shot.scene_number}</td>
    <td>${shot.take_number}</td>
    <td>${shot.description}</td>
    <td>${shot.equipment}</td>
    <td>${shot.movement}</td>
    <td>${shot.angle}</td>
    <td>${shot.framing}</td>
    <td>${shot.lens}</td>
    <td>${shot.audio}</td>
    <td>${shot.sound}</td>
    <td>${shot.duration}</td>
    <td>${shot.actors}</td>
    <td>${shot.notes}</td>
    <td><button class="btn btn-danger btn-sm delete-button"><svg class="bi bi-trash3-fill fs-5 text-center" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16">
      <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06Zm6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528ZM8 4.5a.5.5 0 0 0-.5.5"></path>
    </svg></button></td>
  `;
  tableBody.appendChild(row);
  deleteRowButton();
  //row.querySelector('.delete-button').addEventListener('click', () => row.remove());
}

// Function to add a miscellaneous row to the table
function addMiscRow(misc) {
  const tableBody = document.querySelector('#shot-list tbody');
  const row = document.createElement('tr');
  row.classList.add('misc-row', 'table-warning', 'handle');
  row.dataset.value = misc.data_value;
  row.innerHTML = `
    <td class="fw-bold">${misc.time}</td>
    <td class="fw-bold text-center" colspan="14">${misc.description}</td>
    <td><button class="btn btn-danger btn-sm delete-button"><svg class="bi bi-trash3-fill fs-5 text-center" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16">
      <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06Zm6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528ZM8 4.5a.5.5 0 0 0-.5.5"></path>
    </svg></button></td>
  `;
  tableBody.appendChild(row);
  deleteRowButton();
  //row.querySelector('.delete-button').addEventListener('click', () => row.remove());
}

document.getElementById('save-button').addEventListener('click', () => {
  const projectId = getProjectId(); // Function to get the current project ID
  saveTableData(projectId);
});

document.addEventListener('DOMContentLoaded', () => {
  const projectId = getProjectId(); // Function to get the current project ID
  loadTableData(projectId);

  // Listen for the message-box-closed event to refocus the input field
  ipcRenderer.on('message-box-closed', () => {
    setTimeout(() => {
      document.getElementById('project-title').focus();
    }, 100);
  });
});

function getProjectId() {
  // Example: Extract project ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('projectId');
}

// Listen for response from main process for saving shot data
ipcRenderer.on('save-shot-data-response', async (event, response) => {
  await remote.dialog.showMessageBox({
    message: response.message,
    buttons: ['OK']
  });
  // Refocus the first input field after the dialog closes with a slight delay
  setTimeout(() => {
    document.getElementById('project-title').focus();
  }, 100);
});

//Add a New Shot Function 
document.getElementById('add-shot-submit').addEventListener('click', async function (event) {
  event.preventDefault();

  // Capture form data for the shot 
  const duration = document.getElementById('duration').value;
  const startTimeDetails = document.getElementById('start-time-details').value;
  const shotListBody = document.querySelector('#shot-list tbody');
  const formData = {
    time: startTimeDetails,
    scene: document.getElementById('scene').value,
    description: document.getElementById('description').value,
    setup: document.getElementById('setup').value,
    equipment: document.getElementById('equipment').value,
    movement: document.getElementById('movement').value,
    angle: document.getElementById('angle').value,
    shotType: document.getElementById('shotType').value,
    lens: document.getElementById('lens').value,
    camera: document.getElementById('camera').value,
    sound: document.getElementById('sound').value,
    duration: duration,
    actor: document.getElementById('cast').value || '', // Default to empty string if blank
    notes: document.getElementById('notes').value || '' // Default to empty string if blank
  };

  // Calculate time for the new row
  let newTime;
  let shotNumber = shotListBody.rows.length + 1; // Sequential shot number
  if (shotListBody.rows.length === 0) {
    newTime = startTimeDetails;
  } else {
    const lastRow = shotListBody.rows[shotListBody.rows.length - 1];
    const lastTime = lastRow.cells[0].innerText; // Adjusted to use the correct cell index
    const lastDuration = parseInt(lastRow.getAttribute('data-value'), 10);
    newTime = calculateNewTime(lastTime, lastDuration);
  }

  // Create new row for a shot 
  const newRow = document.createElement('tr');
  newRow.setAttribute('data-value', convertToMinutes(duration));
  newRow.classList.add('handle');
  newRow.classList.add('shot-row');
  newRow.innerHTML = `
      <td class="table-info fw-bold">${newTime}</td>
      <td>${shotNumber}</td>
      <td>${formData.scene}</td>
      <td>${formData.setup}</td>
      <td>${formData.description}</td>
      <td>${formData.equipment}</td>
      <td>${formData.movement}</td>
      <td>${formData.angle}</td>
      <td>${formData.shotType}</td>
      <td>${formData.lens}</td>
      <td>${formData.camera}</td>
      <td>${formData.sound}</td>
      <td>${formData.duration}</td>
      <td>${formData.actor}</td>
      <td>${formData.notes}</td>
      <td><button class="btn btn-danger btn-sm delete-button"><svg class="bi bi-trash3-fill fs-5 text-center" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16">
          <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06Zm6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528ZM8 4.5a.5.5 0 0 0-.5.5"></path>
      </svg></button></td>
      
  `;

  // Append new row to the table body
  shotListBody.appendChild(newRow);

  // Add event listener to the delete button
  deleteRowButton();
  recalculateTimes(); // Recalculate times after adding a new row
});


//Add a misc row function

document.getElementById('misc-time-submit').addEventListener('click', async function (event) {
  event.preventDefault();
  // Capture form data from misc Form
  const miscDuration = document.getElementById('misc-duration-field').value;
  const miscDesc = document.getElementById('misc-desc-field').value;
  const shotListBody = document.querySelector('#shot-list tbody');

  // Convert miscDuration to minutes
  const miscDurationInMinutes = convertToMinutes(miscDuration);

  // Calculate time for the new row
  let newTime;
  if (shotListBody.rows.length === 0) {
    newTime = document.getElementById('start-time-details').value;
  } else {
    const lastRow = shotListBody.rows[shotListBody.rows.length - 1];
    const lastTime = lastRow.cells[0].innerText; // Adjusted to use the correct cell index
    const lastDuration = parseInt(lastRow.getAttribute('data-value'), 10);
    newTime = calculateNewTime(lastTime, lastDuration);
  }

  // Create new row for Misc Field
  const miscNewRow = document.createElement('tr');
  miscNewRow.classList.add('table-warning');
  miscNewRow.classList.add('handle');
  miscNewRow.classList.add('misc-row');
  miscNewRow.setAttribute('data-value', miscDurationInMinutes);
  miscNewRow.innerHTML = `
      <td class="fw-bold">${newTime}</td>
      <td class="fw-bold text-center" colspan="14">${miscDesc} - ${miscDuration}</td>
      <td><button class="btn btn-danger btn-sm delete-button"><svg class="bi bi-trash3-fill fs-5 text-center" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16">
          <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06Zm6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528ZM8 4.5a.5.5 0 0 0-.5.5"></path>
      </svg></button></td>
  `;

  // Append new row to the table body
  shotListBody.appendChild(miscNewRow);

  // Add event listener to the delete button
  deleteRowButton();
  recalculateTimes(); // Recalculate times after adding a new row
});

// Initialize Sortable.js on the shot list table
new Sortable(document.querySelector('#shot-list tbody'), {
  animation: 150,
  handle: '.handle', // Add a handle class to make specific elements draggable
  onEnd: function (evt) {
    console.log('Item moved', evt);
    recalculateTimes(); // Recalculate times after reordering
  }
});

function convertToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function calculateNewTime(lastTime, duration) {
  const [lastHours, lastMinutes] = lastTime.split(':').map(Number);
  const totalMinutes = lastHours * 60 + lastMinutes + duration;
  const newHours = Math.floor(totalMinutes / 60);
  const newMinutes = totalMinutes % 60;
  return `${newHours}:${newMinutes < 10 ? '0' : ''}${newMinutes}`;
}

function recalculateTimes() {
  const shotListBody = document.querySelector('#shot-list tbody');
  let currentTime = document.getElementById('start-time-details').value;

  for (let i = 0; i < shotListBody.rows.length; i++) {
    const row = shotListBody.rows[i];
    const duration = parseInt(row.getAttribute('data-value'), 10);
    row.cells[0].innerText = currentTime; // Adjusted to use the correct cell index
    currentTime = calculateNewTime(currentTime, duration);
  }
}

