const DOMElements = {
    menu: document.getElementById('menu'),
    menuButton: document.getElementById('menu-button'),
    menuCloseButton: document.getElementById('menu-close-button'),
    resetHistoryButton: document.getElementById('reset-history-button'),
    historyCards: document.querySelectorAll('.history-card'),
    addButton: document.getElementById('add-button'),
    inputContainer: document.getElementById('input-container'),
    inputTimer: document.getElementById('input-timer-name'),
    activeTimerContainer: document.getElementById('timer-container'),
    historyContainer: document.getElementById('history-container')
};

module.exports = DOMElements;