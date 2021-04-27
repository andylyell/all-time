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
    deleteTimer: (database, data) => {
        console.log('delete');
    }
}