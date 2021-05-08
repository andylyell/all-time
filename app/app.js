const electron = require('electron');
const { ipcRenderer } = electron;
const DOMElements = require('./js/DOMElements');
const ActiveTimer = require('./js/Model/ActiveTimer');
const { renderActiveTimers, renderSingleActiveTimer, renderSavedTimers, renderPlay, renderPause, renderReset } = require('./js/View/renderMethods');

let allTimers = [];

//Get data as in memory data
window.addEventListener('load', () => ipcRenderer.send('loadAll'));

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
                timer.startTime,
                timer.elapsedTime, 
                timer.isRunning,
                timer.isStarted,
                timer.isSaved,
                timer._id
            );

            activeTimers.push(newActiveTimer);
        }
    });

    return {
        activeTimers: activeTimers.sort((a, b) => { return a.dateCreated - b.dateCreated}),
        savedTimers: savedTimers.sort((a, b) => { return b.dateCreated - a.dateCreated}) 
    }
}

// const sortedActivities = activities.sort((a, b) => b.date - a.date)

const getCurrentTimer = (cardId) => {
    //select activeTimer object from data array
    let timerObject
    allTimers.activeTimers.forEach((timer) => {
        // console.log(timer);
        if(timer._id === cardId) {
            timerObject = timer;
            return;
        }
    });
    return timerObject;
}

//////////////////////////////////
// INITIAL LOAD FUNCTIONS
//////////////////////////////////

//Get activeTimer data from Main Process
ipcRenderer.on('databases-loaded', (event, args) => {
    // activeTimers = args
    allTimers = sortTimers(args);
    console.log(allTimers);
    renderActiveTimers(allTimers.activeTimers);
    renderSavedTimers(allTimers.savedTimers);
});

//////////////////////////////////
// INTER PROCESS LISTENERS
//////////////////////////////////

//update activeTimers
ipcRenderer.on('update-saved-timers', (event, args) => {
    // console.log('updated'); 
    allTimers = sortTimers(args);
    renderSavedTimers(allTimers.savedTimers);
});

ipcRenderer.on('update-new-timer', (event, args) => {    
    //create new time object
    const newActiveTimer = new ActiveTimer(
        args.name,
        args.dateCreated,
        args.time,
        args.startTime,
        args.elapsedTime, 
        args.isRunning,
        args.isStarted,
        args.isSaved,
        args._id
    );
    allTimers.activeTimers.push(newActiveTimer) //add timer to local data
    renderSingleActiveTimer(args); //add timer to DOM

    if(document.querySelector('.empty-text--active')) {
        document.querySelector('.empty-text--active').remove();
    }
});

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
        0,
        0,
        false,
        false,
        false,
    );
    ipcRenderer.send('add-new-timer', newActiveTimer);  //SEND TIMER TO DB
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
        const timerCard = e.target.closest('.timer'); //get timerCard that houses play button
        const currentTimer = getCurrentTimer(timerCard.id); //call function to get the current Timer Object
        currentTimer.startTimer(timerCard); //start timer within the right activeTimer object
        renderPlay(e.target, timerCard); //render DOM
    }

    //listen to pause button events
    if(e.target.id === 'pause-button') {

        const timerCard = e.target.closest('.timer'); //get timerCard that houses play button
        const currentTimer = getCurrentTimer(timerCard.id); //call function to get the current Timer Object
        currentTimer.pauseTimer(); //pause time within the right activeTimer Object
        ipcRenderer.send('update-active-timer', currentTimer); //update timer in DB
        renderPause(e.target, timerCard); //render DOM
    }

    //listn to reset button events
    if(e.target.id === 'reset-button') {
        const timerCard = e.target.closest('.timer'); //get timerCard that houses play button
        const currentTimer = getCurrentTimer(timerCard.id); //call function to get the current Timer Object
        currentTimer.resetTimer();
        console.log(currentTimer);
        ipcRenderer.send('reset-active-timer', currentTimer); //update DB with elapse time set to 0 and startTime set to 0
        renderReset(timerCard, currentTimer);
    };

    //listen to save button events
    if(e.target.id === 'save-button') {
        //change isSaved to be true
        const activeTimerId = e.target.closest('.timer').id; //get elements id
        ipcRenderer.send('save-active-timer', activeTimerId); //pass onto main process to remove from DB
        e.target.closest('.timer').remove(); //remove from UI
    }

    //listen to delete button events
    if(e.target.id === 'delete-button') {
        const activeTimerId = e.target.closest('.timer').id; //get elements id
        ipcRenderer.send('remove-active-timer', activeTimerId); //pass onto main process to remove from DB
        e.target.closest('.timer').remove(); //remove from UI
    };


    ////////////////////////////
    //SAVED TIMER EVENTS
    ////////////////////////////
    //listen to delete button events
    if(e.target.id === 'history-delete-button') {
        let activeTimerId = e.target.closest('.history-card').id; //get elements id
        ipcRenderer.send('remove-saved-timer', activeTimerId); //pass onto main process to remove from DB
        // re-render the history cards
    };
});