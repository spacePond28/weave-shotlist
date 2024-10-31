
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
        const shotNumberCell = document.createElement('td');
        shotNumberCell.innerText = shot.shotNumber;
        row.appendChild(shotNumberCell);
  
        const sceneNumberCell = document.createElement('td');
        sceneNumberCell.innerText = shot.sceneNumber;
        row.appendChild(sceneNumberCell);
  
        const takeNumberCell = document.createElement('td');
        takeNumberCell.innerText = shot.takeNumber;
        row.appendChild(takeNumberCell);
  
        const descriptionCell = document.createElement('td');
        descriptionCell.innerText = shot.description;
        row.appendChild(descriptionCell);
  
        const equipmentCell = document.createElement('td');
        equipmentCell.innerText = shot.equipment;
        row.appendChild(equipmentCell);
  
        const movementCell = document.createElement('td');
        movementCell.innerText = shot.movement;
        row.appendChild(movementCell);
  
        const angleCell = document.createElement('td');
        angleCell.innerText = shot.angle;
        row.appendChild(angleCell);
  
        const framingCell = document.createElement('td');
        framingCell.innerText = shot.framing;
        row.appendChild(framingCell);
  
        const lensCell = document.createElement('td');
        lensCell.innerText = shot.lens;
        row.appendChild(lensCell);
  
        const audioCell = document.createElement('td');
        audioCell.innerText = shot.audio;
        row.appendChild(audioCell);
  
        const soundCell = document.createElement('td');
        soundCell.innerText = shot.sound;
        row.appendChild(soundCell);
  
        const durationCell = document.createElement('td');
        durationCell.innerText = shot.duration;
        row.appendChild(durationCell);
  
        const actorsCell = document.createElement('td');
        actorsCell.innerText = shot.actors;
        row.appendChild(actorsCell);
  
        const notesCell = document.createElement('td');
        notesCell.innerText = shot.notes;
        row.appendChild(notesCell);
  
        tableBody.appendChild(row);
    });
  
    miscTimes.forEach(misc => {
        const row = document.createElement('tr');
        row.classList.add('table-warning');
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
    const saveButton = document.getElementById('save-button');
    saveButton.addEventListener('click', saveShots);
  });
  