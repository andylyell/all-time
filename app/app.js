const electron = require('electron');
const { ipcRenderer } = electron;
const DOMElements = require('./js/DOMElements');
const ActiveTimer = require('./js/Model/ActiveTimer');
const { renderActiveTimers, renderSingleActiveTimer, renderSavedTimers, renderPlay, renderPause, renderReset, renderNotification, renderNoActiveTimerLabel } = require('./js/View/renderMethods');

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
            // const hiddenCardArr = historyCardsArray.map((historyCard) => {
            //     return historyCard.classList.contains('hide')
            // });
            // if(hiddenCardArr.length === originalArray.length) {
            //     DOMElements.historyContainer.innerHTML = `
            // <p class="empty-text empty-text--search">No matches found</p>
            // `;
            // return;
            // }
            // else {
            //     if(document.querySelector('.empty-text--search')) {
            //         document.querySelector('.empty-text--search').remove();
            //     }
            //     return;
            // }
        }
    });

    // if(historyCardsArray.length === 0) {
    //     console.log('no history timers');
    //     DOMElements.historyContainer.innerHTML = `
    //         <p class="empty-text empty-text--search">No matches found</p>
    //         `;
    // } 
    // else {
    //     if(document.querySelector('.empty-text--search')) {
    //         document.querySelector('.empty-text--search').remove();
    //     }
    // }

    //controller function to evalute criteria
    function evaluateCritera() {
        const searchInputValue = utilities.sanitise(searchInput.value); // get sanitised value of search input
        const tagsArray = selectedTags.map((tag) => { //check which tags have been selected
            return tag.dataset.tagType;
        });
        articlesArray.forEach((article) => { // iterate over each article
            const contentLinkTag = article.querySelector('.content-link__tag').dataset.tagType; //get article tag
            const articleTitle = article.querySelector('.content-link__title').innerHTML; // get the article header
            const sanitisedArticleTitle = utilities.sanitise(articleTitle); // sanitise the header
            //if there is search input but no tags
            if(searchInputValue && tagsArray.length === 0) {
                if(!sanitisedArticleTitle.includes(searchInputValue)) { // check if the article title contains the search input value
                    article.classList.add('hidden');
                } else {
                    article.classList.remove('hidden');
                }
            }
            // if there is search input and tags
            else if(searchInputValue && tagsArray.length >= 1) {
                const matchesTag = tagsArray.filter((tag) => { //check if this tag matches any of the tags in the array
                    if(tag === contentLinkTag) {
                        return tag;
                    }
                });
                if(sanitisedArticleTitle.includes(searchInputValue) && matchesTag.length >= 1) {
                    article.classList.remove('hidden');
                } else {
                    article.classList.add('hidden');
                }
            }
            // if there is no search input and tags
            else if(!searchInputValue && tagsArray.length >= 1) {
                const matchesTag = tagsArray.filter((tag) => { //check if this tag matches any of the tags in the array
                    if(tag === contentLinkTag) {
                        return tag;
                    }
                });
                if(matchesTag.length >= 1) {
                    article.classList.remove('hidden');
                } else {
                    article.classList.add('hidden'); // if they do not contain a tag then apply a hidden class to the article
                }
            }
            // if there is no search input and no tags
            else if(!searchInputValue && tagsArray.length === 0) {
                    article.classList.remove('hidden');
            }
        });
    }

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
        console.log(currentTimer);
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
        renderNotification('delete', activeTimerId, e.target.closest('.history-card').querySelector('.history-card__name').innerHTML) // show notification
        ipcRenderer.send('remove-saved-timer', activeTimerId); //pass onto main process to remove from DB
    };

    ////////////////////////////
    // NOTIFICATION EVENTS
    ////////////////////////////
    if(e.target.id === 'close-notification-button') {
        // remove show class
        const notification = e.target.closest('.notification');
        notification.classList.remove('show');
        // set timeout to remove from DOM
    }
});