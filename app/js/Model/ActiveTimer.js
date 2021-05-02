// Active Timer class
// ===============================================================

const { TouchBarScrubber } = require("electron");

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
    startTimer() {
        this.startTime = Date.now() - this.elapsedTime;
        this.time = setInterval(() => {
            this.elapsedTime = Date.now() - this.startTime;
            console.log(this.elapsedTime);
        }, 10);
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
        console.log('timer reset');
    }

};

module.exports = ActiveTimer;