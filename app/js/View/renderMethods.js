const DOMElements = require('../DOMElements');

module.exports = {

    //render the active timers
    renderActiveTimers: (activeTimers) => {

        if(activeTimers.length === 0) {
            DOMElements.activeTimerContainer.innerHTML = `
            <p class="empty-text">Add a timer to get started</p>
            `;
            return;
        }

        DOMElements.activeTimerContainer.innerHTML = '';
        activeTimers.forEach((activeTimer) => {
            DOMElements.activeTimerContainer.insertAdjacentHTML('beforeend', activeTimerTemplate(activeTimer));
        })
    },

    //render the saved timers
    renderSavedTimers: (savedTimers) => {

        if(savedTimers.length === 0) {
            DOMElements.historyContainer.innerHTML = `
            <p class="empty-text">No saved timers</p>
            `;
            return;
        }

        DOMElements.historyContainer.innerHTML = '';
        savedTimers.forEach((savedTimer) => {
            DOMElements.historyContainer.insertAdjacentHTML('beforeend', savedTimerTemplate(savedTimer));
        })

    },

    renderPauseButton: () => {
        return `
            <button class="button button__tertiary" id="pause-button">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                    <path
                        d="M12 6h-2a2 2 0 00-2 2v16a2 2 0 002 2h2a2 2 0 002-2V8a2 2 0 00-2-2zM22 6h-2a2 2 0 00-2 2v16a2 2 0 002 2h2a2 2 0 002-2V8a2 2 0 00-2-2z" />
                    <path data-name="&lt;Transparent Rectangle&gt;" fill="none" d="M0 0h32v32H0z" />
                </svg>
            </button>
        `;
    },

    renderPlayButton: () => {
        return `
            <button class="button button__tertiary" id="play-button">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                        <path
                            d="M16 2a14 14 0 1014 14A14 14 0 0016 2zm7.48 14.88l-11 6a1 1 0 01-1 0A1 1 0 0111 22V10a1 1 0 01.49-.86 1 1 0 011 0l11 6a1 1 0 010 1.76z" />
                        <path d="M13 20.32L20.91 16 13 11.69v8.63z" />
                        <path data-name="&lt;Transparent Rectangle&gt;" fill="none" d="M0 0h32v32H0z" />
                    </svg>
            </button>
        `
    }
};

function savedTimerTemplate(savedTimer) {
    return `
        <div class="history-card" id="${savedTimer._id}">
                <div class="history-card__info">
                    <p class="history-card__name">${savedTimer.name}</p>
                    <p class="history-card__date">${savedTimer.dateCreated}</p>
                </div>
                <div class="history-card__time-container">
                    <p class="history-card__time">${savedTimer.time}</p>
                    <button class="button button__tertiary" id="history-delete-button">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                            <path d="M12 12h2v12h-2zM18 12h2v12h-2z" />
                            <path d="M4 6v2h2v20a2 2 0 002 2h16a2 2 0 002-2V8h2V6zm4 22V8h16v20zM12 2h8v2h-8z" />
                            <path data-name="&lt;Transparent Rectangle&gt;" fill="none" d="M0 0h32v32H0z" />
                        </svg>
                    </button>
                </div>
            </div>
    `;
}

function activeTimerTemplate(activeTimer) {
    return `
        <div class="timer" id="${activeTimer._id}">
            <h2>${activeTimer.name}</h2>
            <p class="timer__date">Created 2021-04-15</p>
            <p class="timer__time">0<span>:00</span> </p>
            <div class="timer__controls">
                <div class="timer__control-time">
                    <button class="button button__tertiary" id="play-button">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                            <path
                                d="M16 2a14 14 0 1014 14A14 14 0 0016 2zm7.48 14.88l-11 6a1 1 0 01-1 0A1 1 0 0111 22V10a1 1 0 01.49-.86 1 1 0 011 0l11 6a1 1 0 010 1.76z" />
                            <path d="M13 20.32L20.91 16 13 11.69v8.63z" />
                            <path data-name="&lt;Transparent Rectangle&gt;" fill="none" d="M0 0h32v32H0z" />
                        </svg>
                    </button>
                    <button class="button button__tertiary button__tertiary--disabled" id="reset-button">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                            <path
                                d="M18 28A12 12 0 106 16v6.2l-3.6-3.6L1 20l6 6 6-6-1.4-1.4L8 22.2V16a10 10 0 1110 10z" />
                            <path data-name="&lt;Transparent Rectangle&gt;" fill="none" d="M0 0h32v32H0z" />
                        </svg>
                    </button>
                </div>
                <div class="timer__control-timer show">
                    <button class="button button__tertiary button__tertiary--disabled" id="save-button">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                            <path
                                d="M27.71 9.29l-5-5A1 1 0 0022 4H6a2 2 0 00-2 2v20a2 2 0 002 2h20a2 2 0 002-2V10a1 1 0 00-.29-.71zM12 6h8v4h-8zm8 20h-8v-8h8zm2 0v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8H6V6h4v4a2 2 0 002 2h8a2 2 0 002-2V6.41l4 4V26z" />
                            <path data-name="&lt;Transparent Rectangle&gt;" fill="none" d="M0 0h32v32H0z" />
                        </svg>
                    </button>
                    <button class="button button__tertiary" id="delete-button">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                            <path d="M12 12h2v12h-2zM18 12h2v12h-2z" />
                            <path d="M4 6v2h2v20a2 2 0 002 2h16a2 2 0 002-2V8h2V6zm4 22V8h16v20zM12 2h8v2h-8z" />
                            <path data-name="&lt;Transparent Rectangle&gt;" fill="none" d="M0 0h32v32H0z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `;
}