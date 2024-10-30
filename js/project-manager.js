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


function saveShot(event, projectId, shotData) {
  if (shotData.type === 'shot') {
      db.run('INSERT INTO shots (project_id, time, shot_number, scene_number, take_number, description, equipment, movement, angle, framing, lens, audio, sound, duration, actors, notes, data_value) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
      [projectId, shotData.time, shotData.shotNumber, shotData.sceneNumber, shotData.takeNumber, shotData.description, shotData.equipment, shotData.movement, shotData.angle, shotData.framing, shotData.lens, shotData.audio, shotData.sound, shotData.duration, shotData.actors, shotData.notes, shotData.dataValue], 
      function(err) {
          if (err) {
              console.error('Error saving shot:', err);
              event.reply('save-shot-response', { success: false, message: 'Failed to save shot.' });
              return;
          }
          event.reply('save-shot-response', { success: true, message: 'Shot saved successfully.', shotId: this.lastID });
      });
  } else if (shotData.type === 'misc') {
      db.run('INSERT INTO misc_times (project_id, time, description, data_value) VALUES (?, ?, ?, ?)', 
      [projectId, shotData.time, shotData.description, shotData.dataValue], 
      function(err) {
          if (err) {
              console.error('Error saving miscellaneous time:', err);
              event.reply('save-shot-response', { success: false, message: 'Failed to save miscellaneous time.' });
              return;
          }
          event.reply('save-shot-response', { success: true, message: 'Miscellaneous time saved successfully.', miscId: this.lastID });
      });
  }
}

ipcMain.on('save-shots', (event, { projectId, shots }) => {
  shots.forEach(shot => {
      saveShot(event, projectId, shot);
  });
});

ipcMain.on('load-shots', (event, projectId) => {
  db.all('SELECT * FROM shots WHERE project_id = ?', [projectId], (err, shots) => {
      if (err) {
          console.error('Error loading shots:', err);
          event.reply('load-shots-response', { success: false, message: 'Failed to load shots.' });
          return;
      }
      db.all('SELECT * FROM misc_times WHERE project_id = ?', [projectId], (err, miscTimes) => {
          if (err) {
              console.error('Error loading miscellaneous times:', err);
              event.reply('load-shots-response', { success: false, message: 'Failed to load miscellaneous times.' });
              return;
          }
          event.reply('load-shots-response', { success: true, shots, miscTimes });
      });
  });
});

module.exports = { loadProjects, createNewProject, openProject, deleteProject, getProjectDetails, amendProjectDetails, saveShot };