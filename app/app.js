const electron = require('electron');
const { ipcRenderer } = electron;
const DOMElements = require('./js/DOMElements');
const ActiveTimer = require('./js/Model/ActiveTimer');
const { renderActiveTimers, renderSingleActiveTimer, renderSavedTimers, renderPlayButton, renderPauseButton } = require('./js/View/renderMethods');

let allTimers = [];

//Get data as in memory data
window.addEventListener('load', () => ipcRenderer.send('loadAll'));

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

//update activeTimers
// ipcRenderer.on('update-active-new-timer', (event, args) => {
//     // console.log('updated'); 
//     allTimers = sortTimers(args);
//     console.log(allTimers);
//     renderActiveTimers(allTimers.activeTimers);
//     renderSavedTimers(allTimers.savedTimers);
// });

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
})



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
        activeTimers: activeTimers,
        savedTimers: savedTimers
    }
}

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

        e.target.remove(); //remove play button
        timerCard.querySelector('.timer__control-time').insertAdjacentHTML('afterbegin', renderPauseButton()); //replace play button with pause button
        timerCard.classList.add('active');
        timerCard.querySelector('.timer__control-timer').classList.remove('show');
        timerCard.querySelector('#reset-button').disabled = false;
        timerCard.querySelector('#reset-button').classList.remove('button__tertiary--disabled');
        timerCard.querySelector('#save-button').disabled = false;
        timerCard.querySelector('#save-button').classList.remove('button__tertiary--disabled');

    }

    //listen to pause button events
    if(e.target.id === 'pause-button') {

        const timerCard = e.target.closest('.timer'); //get timerCard that houses play button
        const currentTimer = getCurrentTimer(timerCard.id); //call function to get the current Timer Object
        currentTimer.pauseTimer();

        //update timer in DB
        ipcRenderer.send('update-active-timer', currentTimer);

        e.target.remove(); //remove pause button
        timerCard.querySelector('.timer__control-time').insertAdjacentHTML('afterbegin', renderPlayButton()); //replace play button with pause button
        timerCard.classList.remove('active');
        timerCard.querySelector('.timer__control-timer').classList.add('show');
    }

    //listn to reset button events
    if(e.target.id === 'reset-button') {
        const timerCard = e.target.closest('.timer'); //get timerCard that houses play button
        const currentTimer = getCurrentTimer(timerCard.id); //call function to get the current Timer Object
        currentTimer.resetTimer();
    }

    //listen to save button events
    if(e.target.id === 'save-button') {
        //change isSaved to be true
        let activeTimerId = e.target.closest('.timer').id; //get elements id
        ipcRenderer.send('save-active-timer', activeTimerId); //pass onto main process to remove from DB
        e.target.closest('.timer').remove(); //remove from UI
    }

    //listen to delete button events
    if(e.target.id === 'delete-button') {
        let activeTimerId = e.target.closest('.timer').id; //get elements id
        ipcRenderer.send('remove-active-timer', activeTimerId); //pass onto main process to remove from DB
        e.target.closest('.timer').remove(); //remove from UI
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