var TimeStatement = require('../controller/TimeStatement.js');
module.exports = function(app) {
    app.get('/TimeStatements', TimeStatement.TimeStatement);
}