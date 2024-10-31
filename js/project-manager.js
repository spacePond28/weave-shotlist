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
    const { title, filmingDate, startTime } = projectDetails;
    db.run('INSERT INTO projects (title, filming_date, start_time ) VALUES (?, ?, ?)', [title, filmingDate, startTime], function(err) {
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
       event.reply('project-details-loaded', row);
    });
  }

  function amendProjectDetails(event, projectDetails) {
    const { id, title, filmingDate, startTime, lunchTime } = projectDetails;
    db.run('UPDATE projects SET title = ?, filming_date = ?, start_time = ? WHERE id = ?', [title, filmingDate, startTime, id], function(err) {
        if (err) {
            console.log(err);
            event.reply('amend-project-details-response', { success: false, message: 'Failed to amend project details.' });
        } else {
            event.reply('amend-project-details-response', { success: true, message: 'Project details amended successfully.' });
        }
    });
}


  
  
module.exports = { loadProjects, createNewProject, openProject, deleteProject, getProjectDetails, amendProjectDetails};