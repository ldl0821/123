var TimeStatement = {};
TimeStatement.TimeStatement = require('./routes/TimeStatement.js');
module.exports = function(app) {
    TimeStatement.TimeStatement(app);
}