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

// Function to save shots and miscellaneous data to the database
function saveShotsToDB(projectId, shots) {
  db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS shots (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          project_id TEXT,
          type TEXT,
          time TEXT,
          shotNumber TEXT,
          sceneNumber TEXT,
          takeNumber TEXT,
          description TEXT,
          equipment TEXT,
          movement TEXT,
          angle TEXT,
          framing TEXT,
          lens TEXT,
          audio TEXT,
          sound TEXT,
          duration TEXT,
          actors TEXT,
          notes TEXT,
          dataValue TEXT,
          FOREIGN KEY(project_id) REFERENCES projects(id)
      )`);

      let stmt = db.prepare(`INSERT INTO shots (
          project_id, type, time, shotNumber, sceneNumber, takeNumber, description, equipment, movement, angle, framing, lens, audio, sound, duration, actors, notes, dataValue
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

      shots.forEach(shot => {
          stmt.run(
              projectId,
              shot.type,
              shot.time,
              shot.shotNumber || null,
              shot.sceneNumber || null,
              shot.takeNumber || null,
              shot.description,
              shot.equipment || null,
              shot.movement || null,
              shot.angle || null,
              shot.framing || null,
              shot.lens || null,
              shot.audio || null,
              shot.sound || null,
              shot.duration || null,
              shot.actors || null,
              shot.notes || null,
              shot.dataValue
          );
      });

      stmt.finalize();
  });
}

// Function to load shots and miscellaneous data from the database
function loadShotsFromDB(projectId, callback) {
  db.all(`SELECT * FROM shots WHERE project_id = ?`, [projectId], (err, rows) => {
      if (err) {
          console.error(err);
          callback([], []);
          return;
      }
      const shots = rows.filter(row => row.type === 'shot');
      const miscTimes = rows.filter(row => row.type === 'misc');
      callback(shots, miscTimes);
  });
}
  
  
module.exports = { loadProjects, createNewProject, openProject, deleteProject, getProjectDetails, amendProjectDetails, loadShotsFromDB, saveShotsToDB};