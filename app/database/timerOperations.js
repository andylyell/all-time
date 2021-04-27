module.exports = {

    //create activeTimer
    createTimer: (dbCollection, newActiveTimer) => {

        return new Promise((resolve, reject) => {
            dbCollection.insert(newActiveTimer, err => {
                if(err){
                    throw new Error(err)
                } 
                resolve('added new active timer');
            });
        })
    },

    //retrieve all active Timers
    getAllActiveTimers: (dbCollection) => {
        return new Promise((resolve, reject) => {
            dbCollection.find({}, (err, items) => {
                if(items) {
                    resolve(items);
                } else {
                    reject(err);
                }
            });
        })
    },

    //retrieve single activeTimer
    getTimer: (database, data) => {
        console.log('get one');
    },
    
    
    //update activeTimer
    updateTimer: (database, data) => {
        console.log('update');
    },

    //delete activeTimer
    deleteActiveTimer: (dbCollection, timerId) => {
        return new Promise((resolve, reject) => {
            dbCollection.remove({ _id: timerId }, {}, function (err, numRemoved) {
                if(err) {
                    reject(err);
                }
                resolve('removed timer')
            });
        })
    }
}