const { ipcRenderer } = require('electron');

// Load existing projects
function loadProjects() {
    ipcRenderer.send('load-projects');
}

ipcRenderer.on('projects-loaded', (event, projects) => {
    const projectList = document.getElementById('project-list');
    projectList.innerHTML = ''; // Clear existing options
    projects.forEach(project => {
        const option = document.createElement('option');
        option.value = project.id;
        option.textContent = project.title;
        projectList.appendChild(option);
    });
});

// Create a new project
document.getElementById('create-project').addEventListener('click', () => {
    const projectTitle = document.getElementById('project-title').value;
    const filmingDate = document.getElementById('filming-date-details').value;
    const startTime = document.getElementById('start-time-details').value;

    if (projectTitle && filmingDate && startTime) {
        const projectDetails = {
            title: projectTitle,
            filmingDate: filmingDate,
            startTime: startTime
        };

        ipcRenderer.send('create-new-project', projectDetails);
    } else {
        alert('Please fill in all fields.');
    }
});

ipcRenderer.on('project-created', (event, projectId) => {
    window.location.href = `edit-project.html?projectId=${projectId}`;
});

// Open an existing project
document.getElementById('open-project').addEventListener('click', () => {
    const projectId = document.getElementById('project-list').value;
    if (projectId) {
        ipcRenderer.send('open-project', projectId);
    } else {
        alert('Please select a project to open.');
    }
});

ipcRenderer.on('project-opened', (event, projectId) => {
    window.location.href = `edit-project.html?projectId=${projectId}`;
});

// Delete an existing project
document.getElementById('delete-project').addEventListener('click', () => {
    const projectId = document.getElementById('project-list').value;
    if (projectId) {
        if (confirm('Are you sure you want to delete this project?')) {
            ipcRenderer.send('delete-project', projectId);
        }
    } else {
        alert('Please select a project to delete.');
    }
});



ipcRenderer.on('project-deleted', () => {
    loadProjects(); // Refresh the project list
});

// Initial load of projects
loadProjects();
