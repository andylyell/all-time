module.exports = {

    //create activeTimer
    createTimer: (dbCollection, newActiveTimer) => {
        return new Promise((resolve, reject) => {
            dbCollection.insert(newActiveTimer, (err, newTimer) => {
                if(err){
                    throw new Error(err)
                } 
                resolve(newTimer);
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
    updateTimer: (dbCollection, activeTimer) => {
        return new Promise((resolve, reject) => {
            dbCollection.update({ _id: activeTimer._id }, { $set: { elapsedTime: activeTimer.elapsedTime }}, {}, function(err, propertyChanged) {
                if(err) {
                    reject(err);
                }
                resolve('timer saved');
            })
        })



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
    },

    //save activeTimer
    saveActiveTimer: (dbCollection, timerId) => {
        return new Promise((resolve, reject) => {
            dbCollection.update({ _id: timerId }, { $set: { isSaved: true }}, {}, function(err, propertyChanged) {
                if(err) {
                    reject(err);
                }
                resolve('timer saved');
            })
        })
    },

    // delete all saved timers
    removeAllSavedTimers: (dbCollection) => {
        return new Promise((resolve, reject) => {
            dbCollection.remove({ isSaved: true }, {multi: true}, function(err, removeList) {
                if(err) {
                    reject(err)
                }
                resolve('all saved timers removed');
            })
        })
    }
}

// // Remove multiple documents
// db.remove({ system: 'solar' }, { multi: true }, function (err, numRemoved) {
//     // numRemoved = 3
//     // All planets from the solar system were removed
//   });