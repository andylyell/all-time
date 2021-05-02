// Active Timer class
// ===============================================================

class ActiveTimer {
    constructor(name, dateCreated, time, isRunning, isStarted, isSaved, _id) {
        this.name = name;
        this.dateCreated = dateCreated;
        this.time = time;
        this.isRunning = isRunning;
        this.isStarted = isStarted;
        this.isSaved = isSaved;
        this._id = _id
    }

    whoAmI() {
        console.log(`ID: ${this._id} - Name: ${this.name}`);
    }

    // start timer
    // stop timer
    // reset timer
    // save timer

     // returns a random integer from 1 to number of faces
    // rollDice() {
    //     this.activeRoll = Math.floor(Math.random() * this.faces) + 1;
    // }
};

module.exports = ActiveTimer;