const {
    app,
    BrowserWindow,
    ipcMain
} = require('electron');
const path = require('path');
const Datastore = require('nedb');
const {
    createTimer,
    getAllActiveTimers
} = require('./app/database/timerOperations');

//create data base
const db = {};
// load collections
db.activeTimers = new Datastore({ filename: './collections/activeTimers.db', autoload: true });
db.savedTimers = new Datastore({ filename: './collections/savedTimers.db', autoload: true });

// function to create a new window
function createWindow() {
    const win = new BrowserWindow({
        width: 464,
        minWidth: 464,
        height: 720,
        minHeight: 720,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    })
    win.loadFile('./app/index.html');
    win.resizable = true;
    win.shadow = true;
    win.webContents.openDevTools()
    // win.on('blur', () => {
    //     console.log('Lost focus');
    // })
}

app.whenReady().then(() => {
    createWindow() //create a new browser window
    //event listener that creates a new browser window only if one does not exits already
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
});

ipcMain.on('loadAll', (event, args) => {
    getAllActiveTimers(db.activeTimers)
            .then((items) => {
            event.reply('databases-loaded', items);
        })
        .catch((err) => {
            event.reply('databases-loaded', err);
        })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
});

ipcMain.on('addNewTimer', (event, newActiveTimer) => {
    console.log(newActiveTimer);
    console.log(db.activeTimers.indexes);

    createTimer(db.activeTimers, newActiveTimer)
        .then((message) => {
            console.log(message);
        })
        .catch((err) => {
            console.log(err);
            // event.reply('databases-loaded', err);
        });

    // db.activeTimers.insert(arg, function(err, newTimer){
    //     console.log(newTimer);
    // })
    // event.returnValue = 'added';

    // createTimer();
});