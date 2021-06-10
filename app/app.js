const electron = require('electron');
const { menuCloseButton } = require('./js/DOMElements');
const { ipcRenderer } = electron;
const DOMElements = require('./js/DOMElements');
const ActiveTimer = require('./js/Model/ActiveTimer');
const { renderActiveTimers, renderSingleActiveTimer, renderSavedTimers, renderPlay, renderPause, renderReset, renderNotification, renderNoActiveTimerLabel } = require('./js/View/renderMethods');

let allTimers = [];

//Get data as in memory data
window.addEventListener('load', () => {
    ipcRenderer.send('loadAll');
});

//Set menu items to be unfocusable on when not expanded
// DOMElements.menuCloseButton.tabIndex = '-1';
// DOMElements.searchInput.tabIndex = '-1';
// DOMElements.resetHistoryButton.tabIndex = '-1';

//////////////////////////////////
//FUNCTIONS
//////////////////////////////////
const unfocusMenuElements = () => {
    const focusableElements = 'button, [href], input, select, textarea';
    const allMenuFocusableElements = DOMElements.menu.querySelectorAll(focusableElements); // get first element to be focused inside modal
    const allMenuFocusableElementsArr = Array.from(allMenuFocusableElements);
    allMenuFocusableElementsArr.forEach((el) => {
        el.tabIndex = '-1'
    })
}

const focusMenuElements = () => {
    const focusableElements = 'button, [href], input, select, textarea';
    const allMenuFocusableElements = DOMElements.menu.querySelectorAll(focusableElements); // get first element to be focused inside modal
    const allMenuFocusableElementsArr = Array.from(allMenuFocusableElements);
    allMenuFocusableElementsArr.forEach((el, index) => {
        el.tabIndex = `${index}`
    })
}


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
        if(timer._id === cardId) {
            timerObject = timer;
            return;
        }
    });
    return timerObject;
};



//////////////////////////////////
// INITIAL LOAD FUNCTIONS
//////////////////////////////////

//Get activeTimer data from Main Process
ipcRenderer.on('databases-loaded', (event, args) => {
    // activeTimers = args
    allTimers = sortTimers(args);
    renderActiveTimers(allTimers.activeTimers);
    renderSavedTimers(allTimers.savedTimers);
    unfocusMenuElements();
});

//////////////////////////////////
// INTER PROCESS LISTENERS
//////////////////////////////////

//update activeTimers
ipcRenderer.on('update-saved-timers', (event, args) => {
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

    const alltimerButtonsArr = Array.from(document.querySelectorAll('.timer-control-button'));
    unfocusElArray = [DOMElements.menuButton, DOMElements.inputTimer, DOMElements.addButton, ...alltimerButtonsArr];
    unfocusElArray.forEach((el) => {
        el.tabIndex = '-1'
    })

    DOMElements.menu.classList.add('show');
    DOMElements.menuBackground.classList.add('show');
    menuCloseButton.focus();
    
    focusMenuElements();

    const focusableElements = 'button, [href], input, select, textarea';
    const allFocusableElement = DOMElements.menu.querySelectorAll(focusableElements);
    const firstFocusableElement = DOMElements.menu.querySelectorAll(focusableElements)[0]; // get first element to be focused inside modal
    const lastFocusableElement = DOMElements.menu.querySelectorAll(focusableElements)[allFocusableElement.length -1]; // get last element to be focused inside modal
    document.addEventListener('keydown', function (e) {

        let isTabPressed = e.key === 'Tab' || e.key === 9;

        if (!isTabPressed) {
            return;
        }

        if (e.shiftKey) { // if shift key pressed for shift + tab combination
            if (document.activeElement === firstFocusableElement) {
                lastFocusableElement.focus(); // add focus for the last focusable element
                e.preventDefault();
            }
        } else { // if tab key is pressed
            if (document.activeElement === lastFocusableElement) { // if focused has reached to last focusable element then focus first focusable element after pressing tab
                firstFocusableElement.focus(); // add focus for the first focusable element
                e.preventDefault();
            } else if (document.activeElement === firstFocusableElement){
                DOMElements.menuCloseButton.focus() // add focus for the last focusable element
                e.preventDefault();
            }
        }
    });
});

DOMElements.menuCloseButton.addEventListener('click', () => {
    const alltimerButtonsArr = Array.from(document.querySelectorAll('.timer-control-button'));
    unfocusElArray = [DOMElements.menuButton, DOMElements.inputTimer, DOMElements.addButton, ...alltimerButtonsArr];
    unfocusElArray.forEach((el, index) => {
        // el.tabIndex = `${index}`
        el.tabIndex = `1`
    })
    DOMElements.menuBackground.classList.remove('show');
    DOMElements.menu.classList.remove('show');
    unfocusMenuElements();
    DOMElements.menuButton.focus();
});

DOMElements.resetHistoryButton.addEventListener('click', () => {
    const historyCards = document.querySelectorAll('.history-card'); //get history cards as nodelist
    const historyCardsArr = Array.from(historyCards); //turn nodeslist into an iterable array
    const cardIds = historyCardsArr.map((card) => { //map array entries to create new array of history card IDs
        return card.id
    });
    renderNotification('all-delete', Math.floor(Math.random() * 100000), 'All timers removed') // show notification
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

DOMElements.searchInput.addEventListener('input', (e) => {
    //take input value
    const searchInputValue = e.target.value;
    // iterate over history cards
    const historyCards = document.querySelectorAll('.history-card');
    const historyCardsArray = Array.from(historyCards);

    // if history card title matches or contains value of input then show
    historyCardsArray.forEach((historyCard, index, originalArray) => {
        const historyCardTitle = historyCard.querySelector('.history-card__name').innerHTML;
        if(historyCardTitle.includes(searchInputValue)) {
            historyCard.classList.remove('hide');
        } else {
            historyCard.classList.add('hide');
        }
    });
})

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
        ipcRenderer.send('reset-active-timer', currentTimer); //update DB with elapse time set to 0 and startTime set to 0
        renderReset(timerCard, currentTimer);
    };

    //listen to save button events
    if(e.target.id === 'save-button') {
        //change isSaved to be true
        const activeTimer = e.target.closest('.timer');
        ipcRenderer.send('save-active-timer', activeTimer.id); //pass onto main process to remove from DB
        e.target.closest('.timer').remove(); //remove from UI
        renderNoActiveTimerLabel();
        renderNotification('save', activeTimer.id, activeTimer.querySelector('#active-timer-name').innerHTML)// show notification
    }

    //listen to delete button events
    if(e.target.id === 'delete-button') {
        const activeTimer = e.target.closest('.timer');
        // const activeTimerId = e.target.closest('.timer').id; //get elements id
        ipcRenderer.send('remove-active-timer', activeTimer.id); //pass onto main process to remove from DB
        e.target.closest('.timer').remove(); //remove from UI
        renderNotification('delete', activeTimer.id, activeTimer.querySelector('#active-timer-name').innerHTML) // show notification
        renderNoActiveTimerLabel();
    };


    ////////////////////////////
    //SAVED TIMER EVENTS
    ////////////////////////////
    //listen to delete button events
    if(e.target.id === 'history-delete-button') {
        let activeTimerId = e.target.closest('.history-card').id; //get elements id
        renderNotification('delete', activeTimerId, e.target.closest('.history-card').querySelector('.history-card__name').title) // show notification
        ipcRenderer.send('remove-saved-timer', activeTimerId); //pass onto main process to remove from DB
    };

    ////////////////////////////
    // NOTIFICATION EVENTS
    ////////////////////////////
    if(e.target.id === 'close-notification-button') {       
        // remove show class
        e.target.tabIndex = '-1';
        const notification = e.target.closest('.notification');
        notification.classList.remove('show');  
        // set timeout to remove from DOM
    }
});