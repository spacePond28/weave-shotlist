const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { loadProjects, createNewProject, openProject, deleteProject, amendProjectDetails, getProjectDetails, getShots } = require('./js/project-manager');

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
    createTables();
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
        shot INTEGER,
        scene TEXT,
        setup TEXT,
        description TEXT,
        equipment TEXT,
        movement TEXT,
        angle TEXT,
        shot_size TEXT,
        lens TEXT,
        camera TEXT,
        sound TEXT,
        time_est TEXT,
        cast TEXT,
        notes TEXT,
        action TEXT,
        FOREIGN KEY (project_id) REFERENCES projects(id)
    )`);
}

ipcMain.on('load-projects', loadProjects);
ipcMain.on('create-new-project', createNewProject);
ipcMain.on('open-project', openProject);
ipcMain.on('delete-project', deleteProject);
ipcMain.on('amend-project-details', amendProjectDetails);
ipcMain.on('get-project-details', getProjectDetails);
ipcMain.on('get-shots', getShots);