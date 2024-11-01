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
        start_time TEXT NOT NULL,
        table_html TEXT
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

async function deleteProject(event, projectId) {
    const { response } = await dialog.showMessageBox({
        type: 'warning',
        buttons: ['Cancel', 'Delete'],
        defaultId: 1,
        cancelId: 0,
        message: 'Are you sure you want to delete this project?'
    });

    if (response === 1) {
        db.run('DELETE FROM projects WHERE id = ?', [projectId], function(err) {
            if (err) {
                throw err;
            }
            event.reply('project-deleted');
        });
    }
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

function saveTableHTML(data) {
    const { projectId, tableHTML } = data;
    db.run('UPDATE projects SET table_html = ? WHERE id = ?', [tableHTML, projectId], function(err) {
        if (err) {
            console.error('Error saving table HTML:', err);
            return;
        }
        mainWindow.webContents.send('save-table-html-response', { message: 'Table HTML saved successfully!' });
    });
}

function loadTableData(projectId, event) {
    db.get('SELECT table_html FROM projects WHERE id = ?', [projectId], (err, row) => {
        if (err) {
            console.error('Error loading table HTML:', err);
            return;
        }
        event.reply('table-html-loaded', row.table_html);
    });
}

ipcMain.on('load-projects', loadProjects);
ipcMain.on('create-new-project', createNewProject);
ipcMain.on('open-project', openProject);
ipcMain.on('delete-project', deleteProject);
ipcMain.on('amend-project-details', amendProjectDetails);
ipcMain.on('get-project-details', getProjectDetails);

ipcMain.on('save-table-html', (event, data) => {
    saveTableHTML(data);
});

ipcMain.on('load-table-data', (event, projectId) => {
    loadTableData(projectId, event);
});

ipcMain.on('show-message-box', async (event, message) => {
    await dialog.showMessageBox({
        type: 'info',
        title: 'Information',
        message: message
    });
    event.reply('message-box-closed');
});
