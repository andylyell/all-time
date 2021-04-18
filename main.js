const {
    app,
    BrowserWindow,
    ipcMain
} = require('electron');
const path = require('path');
const Datastore = require('nedb');
const {
    createTimer
} = require('./app/database/timerOperations');

//load database
const db = new Datastore({ filename: './timers.db', autoload: true });

// function to create a new window
function createWindow() {
    const win = new BrowserWindow({
        width: 464,
        height: 720,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    })
    win.loadFile('./app/index.html');
    win.resizable = true;
    win.shadow = true;
    win.on('blur', () => {
        console.log('Lost focus');
    })
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

//receiving these message initially from the renderer process
// ipcMain.on('asynchronous-message', (event, arg) => {
//     console.log(arg) // prints "ping"
//     event.reply('asynchronous-reply', 'async-pong')
// })

// ipcMain.on('synchronous-message', (event, arg) => {
//     console.log(arg) // prints "ping"
//     event.returnValue = 'pong'
// })

ipcMain.on('button-click', (event, arg) => {
    console.log(arg);
    console.log(db.indexes);

    const entry = {
        'message': arg
    }

    db.insert(entry, function(err, newTimer){
        console.log(newTimer);
    })
    event.returnValue = 'added';

    createTimer();
})  

// var doc = { hello: 'world'
//                , n: 5
//                , today: new Date()
//                , nedbIsAwesome: true
//                , notthere: null
//                , notToBeSaved: undefined  // Will not be saved
//                , fruits: [ 'apple', 'orange', 'pear' ]
//                , infos: { name: 'nedb' }
//                };

// db.insert(doc, function (err, newDoc) {   // Callback is optional
//   // newDoc is the newly inserted document, including its _id
//   // newDoc has no key called notToBeSaved since its value was undefined
// });