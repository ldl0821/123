let BoardConfig = {};
BoardConfig.BoardConfig = require('./routes/BoardConfig.js');

module.exports = app => {
    BoardConfig.BoardConfig(app);
}