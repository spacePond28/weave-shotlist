const { ipcRenderer } = require('electron');

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
    timeEst: document.getElementById('timeEst').value,
    travelTime: document.getElementById('travelTime').value,
    manualStartTime: document.getElementById('manual-start-time').value,
    cast: document.getElementById('cast').value,
    notes: document.getElementById('notes').value
  };

  console.log('Shot details:', shotDetails);
  ipcRenderer.send('add-shot', shotDetails);
});

// Listen for response from main process
ipcRenderer.on('add-shot-response', (event, response) => {
  if (response.success) {
    alert('Shot added successfully.');
  } else {
    alert('Failed to add shot: ' + response.message);
  }
});
