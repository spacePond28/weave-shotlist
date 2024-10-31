const { ipcRenderer } = require('electron');

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
ipcRenderer.on('amend-project-details-response', (event, response) => {
  ipcRenderer.send('show-message-box', response.message);
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
  const shotRows = document.querySelectorAll('#shot-list .shot-row');
  const miscRows = document.querySelectorAll('#shot-list .misc-row');
  let totalRows = shotRows.length + miscRows.length;
  let processedRows = 0;

  function checkCompletion() {
    processedRows++;
    if (processedRows === totalRows) {
      ipcRenderer.send('show-message-box', 'Shot data saved successfully!');
    }
  }

  shotRows.forEach(row => {
    const cells = row.querySelectorAll('td');
    const shotData = {
      project_id: projectId,
      time: cells[0].innerText,
      shot_number: cells[1].innerText,
      scene_number: cells[2].innerText,
      take_number: cells[3].innerText,
      description: cells[4].innerText,
      equipment: cells[5].innerText,
      movement: cells[6].innerText,
      angle: cells[7].innerText,
      framing: cells[8].innerText,
      lens: cells[9].innerText,
      audio: cells[10].innerText,
      sound: cells[11].innerText,
      duration: cells[12].innerText,
      actors: cells[13].innerText,
      notes: cells[14].innerText,
      data_value: row.dataset.value
    };
    ipcRenderer.send('save-shot-data', shotData);
  });

  miscRows.forEach(row => {
    const cells = row.querySelectorAll('td');
    const miscData = {
      project_id: projectId,
      time: cells[0].innerText,
      description: cells[1].innerText,
      data_value: row.dataset.value
    };
    ipcRenderer.send('save-misc-data', miscData);
  });

  ipcRenderer.once('save-complete', checkCompletion);
}


// Function to load the table data
function loadTableData(projectId) {
  ipcRenderer.send('load-table-data', projectId);
}

ipcRenderer.on('shots-loaded', (event, shots) => {
  shots.forEach(shot => {
    addShotRow(shot);
  });
});

ipcRenderer.on('misc-times-loaded', (event, miscTimes) => {
  miscTimes.forEach(misc => {
    addMiscRow(misc);
  });
});

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
      <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06Zm6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528ZM8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5"></path>
    </svg></button></td>
  `;
  tableBody.appendChild(row);
  row.querySelector('.delete-button').addEventListener('click', () => row.remove());
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
      <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06Zm6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528ZM8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5"></path>
    </svg></button></td>
  `;
  tableBody.appendChild(row);
  row.querySelector('.delete-button').addEventListener('click', () => row.remove());
}


document.getElementById('save-button').addEventListener('click', () => {
  const projectId = getProjectId(); // Function to get the current project ID
  saveTableData(projectId);
});

document.addEventListener('DOMContentLoaded', () => {
  const projectId = getProjectId(); // Function to get the current project ID
  loadTableData(projectId);
});

function getProjectId() {
  // Example: Extract project ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('projectId');
}

// Listen for response from main process for saving shot data
ipcRenderer.on('save-shot-data-response', (event, response) => {
  ipcRenderer.send('show-message-box', response.message);
});
