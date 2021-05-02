const electron = require('electron');
const { ipcRenderer } = electron;
const DOMElements = require('./js/DOMElements');
const ActiveTimer = require('./js/Model/ActiveTimer');
const { renderActiveTimers, renderSavedTimers } = require('./js/View/renderMethods');

let activeTimers;
let savedTimers;
let allTimers = [];

//Get data as in memory data
window.addEventListener('load', () => ipcRenderer.send('loadAll'));

//Get activeTimer data from Main Process
ipcRenderer.on('databases-loaded', (event, args) => {
    // activeTimers = args
    allTimers = sortTimers(args);

    renderActiveTimers(allTimers.activeTimers);
    renderSavedTimers(allTimers.savedTimers);
});

//update activeTimers
ipcRenderer.on('update-active-timers', (event, args) => {
    // console.log('updated');
    
    allTimers = sortTimers(args);

    renderActiveTimers(allTimers.activeTimers);
    renderSavedTimers(allTimers.savedTimers);
});



//Get savedTimers data from main process

//////////////////////////////////
//FUNCTIONS
//////////////////////////////////
const sortTimers = (timersArray) => {

    let savedTimers = [];
    let activeTimers = [];

    timersArray.forEach((timer) => {
        if(timer.isSaved) {
            savedTimers.push(timer);
        } else {

            const newActiveTimer = new ActiveTimer(
                timer.name,
                timer.dateCreated,
                timer.time,
                timer.isRunning,
                timer.isStarted,
                timer.isSaved,
                timer._id
            );

            activeTimers.push(newActiveTimer);
        }
    });

    return {
        activeTimers: activeTimers,
        savedTimers: savedTimers
    }
}

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

    //get IDs of the saved history items
    const historyCards = document.querySelectorAll('.history-card'); //get history cards as nodelist
    const historyCardsArr = Array.from(historyCards); //turn nodeslist into an iterable array
    const cardIds = historyCardsArr.map((card) => { //map array entries to create new array of history card IDs
        return card.id
    });

    ipcRenderer.send('remove-all-saved-timers', cardIds); //pass onto main process to remove from DB


});

DOMElements.addButton.addEventListener('click', () => {

    // guard clause if no input
    if(DOMElements.inputTimer.value === '') {
        DOMElements.inputContainer.classList.add('input--error');
        return;
    }

    DOMElements.inputContainer.classList.remove('input--error');

    const newActiveTimer = new ActiveTimer(
        DOMElements.inputTimer.value,
        Date.now(),
        0,
        false,
        false,
        false,

    );

    ipcRenderer.send('add-new-timer', newActiveTimer);
    DOMElements.inputTimer.value = ''; //clear form
});

DOMElements.inputTimer.addEventListener('input', (e) => {
    if(DOMElements.inputTimer.value) {
        DOMElements.inputContainer.classList.remove('input--error');
    }
});

//general event listeners
document.addEventListener('click', (e) => {

    ////////////////////////////
    //ACTIVE TIMER EVENTS
    ////////////////////////////

    //listen to play button events
    if(e.target.id === 'play-button') {
        console.log('play');

        const currentTimer = allTimers.activeTimers.find((activeTimer) => {
            return activeTimer._id = e.target.closest('.timer').id;
        }); 

        currentTimer.whoAmI();

    }

    //listen to pause button events

    //listn to reset button events

    //listen to save button events
    if(e.target.id === 'save-button') {
        //change isSaved to be true
        let activeTimerId = e.target.closest('.timer').id; //get elements id
        // send to Main process
        ipcRenderer.send('save-active-timer', activeTimerId); //pass onto main process to remove from DB

        // console.log('save active timer');
    }

    //listen to delete button events
    if(e.target.id === 'delete-button') {
        let activeTimerId = e.target.closest('.timer').id; //get elements id
        ipcRenderer.send('remove-active-timer', activeTimerId); //pass onto main process to remove from DB
    };


    ////////////////////////////
    //SAVED TIMER EVENTS
    ////////////////////////////
    //listen to delete button events
    if(e.target.id === 'history-delete-button') {
        let activeTimerId = e.target.closest('.history-card').id; //get elements id
        ipcRenderer.send('remove-active-timer', activeTimerId); //pass onto main process to remove from DB
    };

    // listen to delete button events
});