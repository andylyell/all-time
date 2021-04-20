const electron = require('electron');
const { ipcRenderer } = electron;


// document.querySelector('button');

// button.addEventListener('click', () => {
//     ipcRenderer.send('button-click', 'the button has been clicked son');
//     console.log('clicked');
// });



console.log('app.js and the rest');

// In renderer process (web page).
// console.log(ipcRenderer.sendSync('synchronous-message', 'ping')) // prints "pong"
// ipcRenderer.on('asynchronous-reply', (event, arg) => {
//   console.log(arg) // prints "pong"
// })
// ipcRenderer.send('asynchronous-message', 'async-ping')