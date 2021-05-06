const { renderTimer } = require('../View/renderMethods');

// Active Timer class
// ===============================================================
class ActiveTimer {
    constructor(name, dateCreated, time, startTime, elapsedTime, isRunning, isStarted, isSaved, _id) {
        this.name = name;
        this.dateCreated = dateCreated;
        this.time = time;
        this.startTime = startTime;
        this.elapsedTime = elapsedTime;
        this.isRunning = isRunning;
        this.isStarted = isStarted;
        this.isSaved = isSaved;
        this._id = _id
    }

    // start timer
    startTimer(elementToUpdate) {
        this.startTime = Date.now() - this.elapsedTime;
        this.time = setInterval(() => {
                this.elapsedTime = Date.now() - this.startTime;
                renderTimer(this.elapsedTime, elementToUpdate);
            }, 1000);
    }

    // pause timer
    pauseTimer() {
        clearInterval(this.time);
        console.log('timer paused');
    }

    // reset timer
    resetTimer() {
        clearInterval(this.time);
        this.elapsedTime = 0;
        this.startTime = 0;
        console.log('timer reset');
    }
};

module.exports = ActiveTimer;
