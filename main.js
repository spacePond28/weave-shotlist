const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const console = require('console');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

let mainWindow;
let db = new sqlite3.Database('./shotlist.db');

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            autofill: true
        }
    });

    mainWindow.loadFile('index.html');
}

app.on('ready', () => {
    createWindow();
});

function createTables() {
    db.run(`CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        filming_date TEXT NOT NULL,
        start_time TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS shots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        time TEXT,
        shot_number TEXT,
        scene_number TEXT,
        take_number TEXT,
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
        data_value TEXT,
        FOREIGN KEY (project_id) REFERENCES projects(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS misc_times (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        time TEXT NOT NULL,
        description TEXT NOT NULL,
        data_value TEXT,
        FOREIGN KEY (project_id) REFERENCES projects(id)
    )`);
}

// Call the createTables function to ensure tables are created
createTables();

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
    db.run('INSERT INTO projects (title, filming_date, start_time) VALUES (?, ?, ?)', [title, filmingDate, startTime], function(err) {
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
    const { id, title, filmingDate, startTime } = projectDetails;
    db.run('UPDATE projects SET title = ?, filming_date = ?, start_time = ? WHERE id = ?', [title, filmingDate, startTime, id], function(err) {
        if (err) {
            console.log(err);
            event.reply('amend-project-details-response', { success: false, message: 'Failed to amend project details.' });
        } else {
            event.reply('amend-project-details-response', { success: true, message: 'Project details amended successfully.' });
        }
    });
}

function saveShotData(shotData) {
    db.run(`INSERT INTO shots (project_id, time, shot_number, scene_number, take_number, description, equipment, movement, angle, framing, lens, audio, sound, duration, actors, notes, data_value) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
    [shotData.project_id, shotData.time, shotData.shot_number, shotData.scene_number, shotData.take_number, shotData.description, shotData.equipment, shotData.movement, shotData.angle, shotData.framing, shotData.lens, shotData.audio, shotData.sound, shotData.duration, shotData.actors, shotData.notes, shotData.data_value], function(err) {
        if (err) {
            console.error('Error saving shot data:', err);
            return;
        }
        // Notify the renderer process that the shot data was saved successfully
        mainWindow.webContents.send('save-shot-data-response', { message: 'Shot data saved successfully!' });
    });
}

function saveMiscData(miscData) {
    db.run(`INSERT INTO misc_times (project_id, time, description, data_value) VALUES (?, ?, ?, ?)`, 
    [miscData.project_id, miscData.time, miscData.description, miscData.data_value]);
}

function loadTableData(projectId, event) {
    db.all(`SELECT * FROM shots WHERE project_id = ?`, [projectId], (err, shots) => {
        if (err) {
            console.error(err);
            return;
        }
        event.reply('shots-loaded', shots);
    });

    db.all(`SELECT * FROM misc_times WHERE project_id = ?`, [projectId], (err, miscTimes) => {
        if (err) {
            console.error(err);
            return;
        }
        event.reply('misc-times-loaded', miscTimes);
    });
}

ipcMain.on('load-projects', loadProjects);
ipcMain.on('create-new-project', createNewProject);
ipcMain.on('open-project', openProject);
ipcMain.on('delete-project', deleteProject);
ipcMain.on('amend-project-details', amendProjectDetails);
ipcMain.on('get-project-details', getProjectDetails);

ipcMain.on('save-shot-data', (event, shotData) => {
    saveShotData(shotData);
});

ipcMain.on('save-misc-data', (event, miscData) => {
    saveMiscData(miscData);
});

ipcMain.on('load-table-data', (event, projectId) => {
    loadTableData(projectId, event);
});

ipcMain.on('show-message-box', (event, message) => {
    dialog.showMessageBox({
        type: 'info',
        title: 'Information',
        message: message
    });
});

app.console = new console.Console(process.stdout, process.stderr);
