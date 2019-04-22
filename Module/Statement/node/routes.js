var Statement = {};
Statement.Statement = require('./routes/Statement.js');

module.exports = function(app) {
    Statement.Statement(app);
}