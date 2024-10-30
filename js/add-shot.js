document.getElementById('add-shot-submit').addEventListener('click', function(event) {
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
  newRow.classList.add('shotRow');
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
      <td><button class="btn btn-danger btn-sm delete-btn"><svg class="bi bi-trash3-fill fs-5 text-center" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16">
          <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06Zm6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528ZM8 4.5a.5.5 0 0 0-.5.5"></path>
      </svg></button></td>
  `;

  // Append new row to the table body
  shotListBody.appendChild(newRow);

  // Add event listener to the delete button
  newRow.querySelector('.delete-btn').addEventListener('click', function() {
      if (confirm('Are you sure you want to delete this row?')) {
          newRow.remove();
          recalculateTimes(); // Recalculate times after deletion
      }
  });

  recalculateTimes(); // Recalculate times after adding a new row
});

document.getElementById('misc-time-submit').addEventListener('click', function(event) {
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
  miscNewRow.classList.add('table-danger');
  miscNewRow.classList.add('handle');
  newRow.classList.add('misc-row');
  miscNewRow.setAttribute('data-value', miscDurationInMinutes);
  miscNewRow.innerHTML = `
      <td class="fw-bold">${newTime}</td>
      <td class="fw-bold text-center" colspan="14">${miscDesc} - ${miscDuration}</td>
      <td><button class="btn btn-danger btn-sm delete-btn"><svg class="bi bi-trash3-fill fs-5 text-center" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16">
          <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06Zm6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528ZM8 4.5a.5.5 0 0 0-.5.5"></path>
      </svg></button></td>
  `;

  // Append new row to the table body
  shotListBody.appendChild(miscNewRow);

  // Add event listener to the delete button
  miscNewRow.querySelector('.delete-btn').addEventListener('click', function() {
      if (confirm('Are you sure you want to delete this row?')) {
          miscNewRow.remove();
          recalculateTimes(); // Recalculate times after deletion
      }
  });

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


//Saving functionality
// js/add-shot.js

function extractTableData() {
  const table = document.getElementById('shot-list');
  const rows = table.querySelectorAll('tbody tr');
  const data = [];

  rows.forEach(row => {
      if (row.classList.contains('table-danger')) {
          // Miscellaneous Time row
          const miscData = {
              type: 'misc',
              time: row.cells[0].innerText,
              description: row.cells[1].innerText,
              dataValue: row.getAttribute('data-value')
          };
          data.push(miscData);
      } else {
          // Shot row
          const shotData = {
              type: 'shot',
              time: row.cells[0].innerText,
              shotNumber: row.cells[1].innerText,
              sceneNumber: row.cells[2].innerText,
              takeNumber: row.cells[3].innerText,
              description: row.cells[4].innerText,
              equipment: row.cells[5].innerText,
              movement: row.cells[6].innerText,
              angle: row.cells[7].innerText,
              framing: row.cells[8].innerText,
              lens: row.cells[9].innerText,
              audio: row.cells[10].innerText,
              sound: row.cells[11].innerText,
              duration: row.cells[12].innerText,
              actors: row.cells[13].innerText,
              notes: row.cells[14].innerText,
              dataValue: row.getAttribute('data-value')
          };
          data.push(shotData);
      }
  });

  return data;
}

function saveShots() {
  const projectId = document.getElementById('projectId').value;
  const shots = extractTableData();
  window.api.send('save-shots', { projectId, shots });
}

function loadShots() {
  const projectId = document.getElementById('projectId').value;
  window.api.send('load-shots', projectId);
}

window.api.receive('load-shots-response', (response) => {
  if (response.success) {
      populateTable(response.shots, response.miscTimes);
  } else {
      console.error('Failed to load shots:', response.message);
  }
});

function populateTable(shots, miscTimes) {
  const tableBody = document.querySelector('#shot-list tbody');
  tableBody.innerHTML = ''; // Clear existing rows

  shots.forEach(shot => {
      const row = document.createElement('tr');
      row.setAttribute('data-value', shot.dataValue);

      const timeCell = document.createElement('td');
      timeCell.classList.add('table-info', 'fw-bold');
      timeCell.innerText = shot.time;
      row.appendChild(timeCell);

      // Add other cells for shot data
      // ...

      tableBody.appendChild(row);
  });

  miscTimes.forEach(misc => {
      const row = document.createElement('tr');
      row.classList.add('table-danger');
      row.setAttribute('data-value', misc.dataValue);

      const timeCell = document.createElement('td');
      timeCell.classList.add('fw-bold');
      timeCell.innerText = misc.time;
      row.appendChild(timeCell);

      const descriptionCell = document.createElement('td');
      descriptionCell.classList.add('fw-bold', 'text-center');
      descriptionCell.setAttribute('colspan', '14');
      descriptionCell.innerText = misc.description;
      row.appendChild(descriptionCell);

      tableBody.appendChild(row);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadShots();

  const saveButton = document.getElementById('save-button');
  saveButton.addEventListener('click', saveShots);
});
