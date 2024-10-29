const { ipcRenderer } = require('electron');
const db = require('./db');

document.getElementById('createProject').addEventListener('click', () => {
    const projectName = prompt('Enter project name:');
    if (projectName) {
        db.createProject(projectName, (id) => {
            ipcRenderer.send('project-created', id);
        });
    }
});

document.getElementById('openProject').addEventListener('click', () => {
    // Logic to open a project
});

document.getElementById('deleteProject').addEventListener('click', () => {
    const projectId = getSelectedProjectId();
    if (projectId && confirm('Are you sure you want to delete this project?')) {
        db.deleteProject(projectId, () => {
            loadProjects();
        });
    }
});

function loadProjects() {
    db.getProjects((projects) => {
        const projectList = document.getElementById('projectList');
        projectList.innerHTML = '';
        projects.forEach(project => {
            const projectItem = document.createElement('div');
            projectItem.className = 'project-item';
            projectItem.textContent = project.name;
            projectItem.dataset.id = project.id;
            projectList.appendChild(projectItem);
        });
    });
}

function getSelectedProjectId() {
    // Logic to get the selected project ID
}

loadProjects();
