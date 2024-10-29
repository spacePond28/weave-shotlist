const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./shotlist.db');

function loadProjects(event) {
    db.all('SELECT * FROM projects', [], (err, rows) => {
        if (err) {
            throw err;
        }
        event.reply('projects-loaded', rows);
    });
}

function createNewProject(event, projectDetails) {
    const { title, filmingDate, startTime, lunchTime } = projectDetails;
    db.run('INSERT INTO projects (title, filming_date, start_time, lunch_time) VALUES (?, ?, ?, ?)', [title, filmingDate, startTime, lunchTime], function(err) {
        if (err) {
            throw err;
        }
        event.reply('project-created', this.lastID);
    });
}

function openProject(event, projectId) {
    event.reply('project-opened', projectId);
}

function deleteProject(event, projectId) {
    db.run('DELETE FROM projects WHERE id = ?', [projectId], function(err) {
        if (err) {
            throw err;
        }
        event.reply('project-deleted');
    });
}

function getProjectDetails(event, projectId) {
    db.get('SELECT * FROM projects WHERE id = ?', [projectId], (err, row) => {
      if (err) {
        console.error('Error fetching project details:', err);
        throw err;
      }
  
      console.log('Retrieved project details:', row);
      event.reply('project-details-loaded', row);
    });
  }
  
function amendProjectDetails(event, projectDetails) {
    const { id, title, filmingDate, startTime, lunchTime } = projectDetails;
    db.run('UPDATE projects SET title = ?, filming_date = ?, start_time = ?, lunch_time = ? WHERE id = ?', [title, filmingDate, startTime, lunchTime, id], function(err) {
        if (err) {
            throw err;
        }
        event.reply('project-details-amended');
    });
}

module.exports = { loadProjects, createNewProject, openProject, deleteProject, getProjectDetails, amendProjectDetails };