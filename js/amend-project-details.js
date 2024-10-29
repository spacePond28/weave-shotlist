const { ipcRenderer } = require('electron');

// Function to load project details
function loadProjectDetails(projectId) {
  ipcRenderer.send('get-project-details', projectId);
  console.log(projectId);
}

// Prepopulate the form with project details
ipcRenderer.on('project-details-loaded', (event, project) => {
  document.getElementById('project-title').value = project.title;
  document.getElementById('filming-date-details').value = project.filming_date;
  document.getElementById('start-time-details').value = project.start_time;
  document.getElementById('lunch-time-details').value = project.lunch_time;
});

// Handle form submission to amend project details
document.getElementById('amend-project-details-submit').addEventListener('click', () => {
  const projectId = new URLSearchParams(window.location.search).get('projectId');
  const projectDetails = {
    id: projectId,
    title: document.getElementById('project-title').value,
    filmingDate: document.getElementById('filming-date-details').value,
    startTime: document.getElementById('start-time-details').value,
    lunchTime: document.getElementById('lunch-time-details').value
  };

  ipcRenderer.send('amend-project-details', projectDetails);
});

// Load project details on page load
window.onload = () => {
  const projectId = new URLSearchParams(window.location.search).get('projectId');
  if (projectId) {
    loadProjectDetails(projectId);
  }
};