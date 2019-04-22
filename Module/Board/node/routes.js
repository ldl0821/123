var Board = {};
Board.Board = require('./routes/Board.js');

module.exports = function(app) {
    Board.Board(app);
}