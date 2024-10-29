//const { ipcRenderer } = require('electron');

// Function to format time as HH:MM
function formatTime(date) {
  return date.toTimeString().split(' ')[0].substring(0, 5);
}

// Function to add a new row to the table
function addShotToTable(shot, shotNumber, startTime) {
  const table = document.getElementById('shotListTable').getElementsByTagName('tbody')[0];
  const newRow = table.insertRow();

  const timeCell = newRow.insertCell(0);
  const moveCell = newRow.insertCell(1);
  const shotCell = newRow.insertCell(2);
  const sceneCell = newRow.insertCell(3);
  const setupCell = newRow.insertCell(4);
  const descriptionCell = newRow.insertCell(5);
  const equipmentCell = newRow.insertCell(6);
  const movementCell = newRow.insertCell(7);
  const angleCell = newRow.insertCell(8);
  const shotSizeCell = newRow.insertCell(9);
  const lensCell = newRow.insertCell(10);
  const timeEstCell = newRow.insertCell(11);
  const notesCell = newRow.insertCell(12);
  const cameraCell = newRow.insertCell(13);
  const soundCell = newRow.insertCell(14);
  const castCell = newRow.insertCell(15);
  const travelTimeCell = newRow.insertCell(16);
  const deleteCell = newRow.insertCell(17);

  timeCell.textContent = formatTime(startTime);
  moveCell.innerHTML = `<svg class="bi bi-arrows-move fs-3 text-center" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16">
                          <path fill-rule="evenodd" d="M7.646.146a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L8.5 1.707V5.5a.5.5 0 0 1-1 0V1.707L6.354 2.854a.5.5 0 1 1-.708-.708l2-2zM8 10a.5.5 0 0 1 .5.5v3.793l1.146-1.147a.5.5 0 0 1 .708.708l-2 2a.5.5 0 0 1-.708 0l-2-2a.5.5 0 0 1-.708-.708L7.5 14.293V10.5A.5.5 0 0 1 8 10M.146 8.354a.5.5 0 0 1 0-.708l2-2a.5.5 0 1 1 .708.708L1.707 7.5H5.5a.5.5 0 0 1 0 1H1.707l1.147 1.146a.5.5 0 0 1-.708.708l-2-2zM10 8a.5.5 0 0 1 .5-.5h3.793l-1.147-1.146a.5.5 0 0 1 .708-.708l2 2a.5.5 0 0 1 0 .708l-2 2a.5.5 0 0 1-.708-.708L14.293 8.5H10.5A.5.5 0 0 1 10 8"></path>
                        </svg>`;
  shotCell.textContent = shotNumber;
  sceneCell.textContent = shot.scene;
  setupCell.textContent = shot.setup;
  descriptionCell.textContent = shot.description;
  equipmentCell.textContent = shot.equipment;
  movementCell.textContent = shot.movement;
  angleCell.textContent = shot.angle;
  shotSizeCell.textContent = shot.shotSize;
  lensCell.textContent = shot.lens;
  timeEstCell.textContent = `${shot.timeEst} min`;
  notesCell.textContent = shot.notes;
  cameraCell.textContent = shot.camera;
  soundCell.textContent = shot.sound;
  castCell.textContent = shot.cast;
  travelTimeCell.textContent = `${shot.travelTime} min`;
  deleteCell.innerHTML = `<button class="btn btn-danger btn-sm"><svg class="bi bi-trash3-fill fs-5 text-center" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06Zm6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528ZM8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5"></path>
                          </svg></button>`;
}

// Handle form submission to add a new shot
document.getElementById('shot-form-submit').addEventListener('click', () => {
  const projectId = new URLSearchParams(window.location.search).get('projectId');
  const shotDetails = {
    projectId: projectId,
    scene: document.getElementById('scene').value,
    setup: document.getElementById('setup').value,
    description: document.getElementById('description').value,
    equipment: document.getElementById('equipment').value,
    movement: document.getElementById('movement').value,
    angle: document.getElementById('angle').value,
    shotSize: document.getElementById('shotSize').value,
    lens: document.getElementById('lens').value,
    camera: document.getElementById('camera').value,
    sound: document.getElementById('sound').value,
    timeEst: parseInt(document.getElementById('timeEst').value, 10) || 0,
    travelTime: parseInt(document.getElementById('travelTime').value, 10) || 0,
    manualStartTime: document.getElementById('manual-start-time').value,
    cast: document.getElementById('cast').value,
    notes: document.getElementById('notes').value
  };

  ipcRenderer.send('add-shot', shotDetails);
});

// Listen for response from main process
ipcRenderer.on('add-shot-response', (event, response) => {
  if (response.success) {
    alert('Shot added successfully.');

    // Get the current shots from the table
    const table = document.getElementById('shotListTable').getElementsByTagName('tbody')[0];
    const rows = Array.from(table.rows);
    let lastEndTime = new Date(`1970-01-01T${document.getElementById('start-time-details').value}:00`);
    let shotNumber = rows.length + 1;

    // Calculate the new shot's start time
    if (rows.length > 0) {
      const lastRow = rows[rows.length - 1];
      const lastTime = lastRow.cells[0].textContent;
      lastEndTime = new Date(`1970-01-01T${lastTime}:00`);
      lastEndTime.setMinutes(lastEndTime.getMinutes() + parseInt(lastRow.cells[11].textContent, 10) + parseInt(lastRow.cells[16].textContent, 10));
    }

    let newStartTime = lastEndTime;
    if (response.shot.manualStartTime) {
      newStartTime = new Date(`1970-01-01T${response.shot.manualStartTime}:00`);
    }

    // Add the new shot to the table
    addShotToTable(response.shot, shotNumber, newStartTime);
  } else {
    alert('Failed to add shot: ' + response.message);
  }
});

// Load existing shots on page load
document.addEventListener('DOMContentLoaded', () => {
  const projectId = new URLSearchParams(window.location.search).get('projectId');
  ipcRenderer.send('get-shots', projectId);
});

// Listen for response from main process to load existing shots
ipcRenderer.on('get-shots-response', (event, response) => {
  if (response.success) {
    const shots = response.shots;
    const table = document.getElementById('shotListTable').getElementsByTagName('tbody')[0];
    let lastEndTime = new Date(`1970-01-01T${document.getElementById('start-time-details').value}:00`);
    let shotNumber = 1;

    shots.forEach(shot => {
      let startTime = lastEndTime;
      if (shot.manual_start_time) {
        startTime = new Date(`1970-01-01T${shot.manual_start_time}:00`);
      }

      addShotToTable(shot, shotNumber, startTime);

      lastEndTime = new Date(startTime);
      lastEndTime.setMinutes(lastEndTime.getMinutes() + (shot.time_est || 0) + (shot.travel_time || 0));
      shotNumber++;
    });
  } else {
    alert('Failed to load shots: ' + response.message);
  }
});

