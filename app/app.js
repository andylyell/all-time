const electron = require('electron');
const { ipcRenderer } = electron;
const DOMElements = require('./js/DOMElements');
const ActiveTimer = require('./js/Model/ActiveTimer');
const { renderActiveTimers } = require('./js/View/renderMethods');

let activeTimers;
let savedTimers;

//Get data as in memory data
window.addEventListener('load', () => ipcRenderer.send('loadAll'));
//Get activeTimer data from Main Process
ipcRenderer.on('databases-loaded', (event, args) => {
    //receive data
    activeTimers = args
    //call render function
    renderActiveTimers(activeTimers);
});

//update activeTimers
ipcRenderer.on('update-active-timers', (event, args) => {
    console.log('updated');
    activeTimers = args;
    renderActiveTimers(activeTimers);
});



//Get savedTimers data from main process


//////////////////////////////////
//EVENT LISTENERS
//////////////////////////////////

DOMElements.menuButton.addEventListener('click', () => {
    DOMElements.menu.classList.add('show');
});

DOMElements.menuCloseButton.addEventListener('click', () => {
    DOMElements.menu.classList.remove('show');
});

DOMElements.resetHistoryButton.addEventListener('click', () => {

    console.log('reset history button');
});

DOMElements.addButton.addEventListener('click', () => {

    // guard clause if no input
    if(DOMElements.inputTimer.value === '') {
        DOMElements.inputContainer.classList.add('input--error');
        return;
    }

    // const addedDice = new Dice(uuid, +dice.dataset.faces, 0);  // Create new dice object
    const newActiveTimer = new ActiveTimer(
        DOMElements.inputTimer.value,
        Date.now(),
        0,
        false,
        false
    )

    console.log(newActiveTimer);

    ipcRenderer.send('add-new-timer', newActiveTimer);

    console.log('addTimer');
});

DOMElements.inputTimer.addEventListener('input', (e) => {
    console.log(e.target.value);

})

//general event listeners
document.addEventListener('click', (e) => {

    ////////////////////////////
    //ACTIVE TIMER EVENTS
    ////////////////////////////

    //listen to play button events

    //listen to pause button events

    //listn to reset button events

    //listen to save button events
    if(e.target.id === 'save-button') {
        console.log('save active timer');
    }

    //listen to delete button events
    if(e.target.id === 'delete-button') {
        let activeTimerId = e.target.closest('.timer').id; //get elements id
        ipcRenderer.send('remove-active-timer', activeTimerId); //pass onto main process to remove from DB
    };


    ////////////////////////////
    //SAVED TIMER EVENTS
    ////////////////////////////

    // listen to delete button events
});