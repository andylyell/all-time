const {
    app,
    BrowserWindow,
    ipcMain
} = require('electron');
const path = require('path');
const Datastore = require('nedb');
const {
    createTimer,
    getAllActiveTimers,
    deleteActiveTimer,
    saveActiveTimer,
    removeAllSavedTimers,
    updateTimer,
    resetActiveTimer
} = require('./app/database/timerOperations');

////////////////////////////
// DATABASE SET UP
////////////////////////////

// console.log(app.getAppPath());

const db = {}; //init empty object as datastore~
// load collections into empty db object
db.activeTimers = new Datastore({ filename: path.join(app.getAppPath(), './collections/activeTimers.db'), autoload: true });

////////////////////////////
// CREATE WINDOW
////////////////////////////

// function to create a new window
function createWindow() {
    const win = new BrowserWindow({
        width: 464,
        minWidth: 464,
        height: 720,
        // resizable: false,
        minHeight: 720,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    })
    win.loadFile('./app/index.html');
    // win.resizable = true;
    win.shadow = true;
    // win.webContents.openDevTools()
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


////////////////////////////
// FUNCTIONS
////////////////////////////

////////////////////////////
// INTER PROCESS LISTENERS
////////////////////////////

// load all listeners from db and send to renderer
ipcMain.on('loadAll', (event, args) => {

    getAllActiveTimers(db.activeTimers)
            .then((items) => {
            event.reply('databases-loaded', items);
        })
        .catch((err) => {
            event.reply('databases-loaded', err);
        })
})

// add a new timer
ipcMain.on('add-new-timer', (event, newActiveTimer) => {
    createTimer(db.activeTimers, newActiveTimer)
        .then((newTimer) => {
            // console.log(newTimer);
            event.reply('update-new-timer', newTimer);
        })
        .catch((err) => {
            console.log(err);
            // event.reply('databases-loaded', err);
        });
});

// remove active timer from db
ipcMain.on('remove-active-timer', (event, activeTimerId) => {

    deleteActiveTimer(db.activeTimers, activeTimerId)
    .then((result) => {
        // console.log(result);
    })
    .catch((err) => {
        console.log(err);
    })

    // getAllActiveTimers(db.activeTimers)
    //     .then((items) => {
    //         event.reply('update-saved-timers', items);
    //     })
    //     .catch((err) => {
    //         event.reply('update-saved-timers', err);
    //     })
});

ipcMain.on('remove-saved-timer', (event, activeTimerId) => {
    deleteActiveTimer(db.activeTimers, activeTimerId)
    .then((result) => {
        // console.log(result);
    })
    .catch((err) => {
        console.log(err);
    })

    getAllActiveTimers(db.activeTimers)
        .then((items) => {
        event.reply('update-saved-timers', items);
        })
        .catch((err) => {
            event.reply('update-saved-timers', err);
        })
})

//Saved an activeTimer
ipcMain.on('save-active-timer', (event, activeTimerId) => {

    //will need to update the property isSaved from false to true
    saveActiveTimer(db.activeTimers, activeTimerId)
    .then((message) => {
        // console.log(message);
    })
    .catch((err) => {
        console.log(err);
    })

    getAllActiveTimers(db.activeTimers)
        .then((items) => {
        event.reply('update-saved-timers', items);
        })
        .catch((err) => {
            event.reply('update-saved-timers', err);
        })
});

//remove all saved times from db
ipcMain.on('remove-all-saved-timers', (event, savedTimerIds) => {
    removeAllSavedTimers(db.activeTimers)
    .then((message) => {
        console.log(message);
    })
    .catch((err) => {
        console.log(err);
    })

    getAllActiveTimers(db.activeTimers)
        .then((items) => {
        event.reply('update-saved-timers', items);
        })
        .catch((err) => {
            event.reply('update-saved-timers', err);
        })
});


//update active timer
ipcMain.on('update-active-timer', (event, activeTimer) => {

    updateTimer(db.activeTimers, activeTimer)
        .then((message) => {
            console.log(message);
        })
        .catch((err) => {
            console.log(err);
        })

});

//reset active timer 
ipcMain.on('reset-active-timer', (event, activeTimer) => {

    resetActiveTimer(db.activeTimers, activeTimer)
    .then((message) => {
        console.log(message);
    })
    .catch((err) => {
        console.log(err);
    })

})

