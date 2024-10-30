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
  alert(response.message);
});

// Load project details on page load
window.onload = () => {
  const projectId = new URLSearchParams(window.location.search).get('projectId');
  if (projectId) {
    loadProjectDetails(projectId);
  }
};
