var Diagnosisroute = {};
var MachinePara = {};
Diagnosisroute.routes = require('./routes/diagnosiss.js');
MachinePara.routes = require('./routes/MachinePara.js');
module.exports = function(app) {
    Diagnosisroute.routes(app);
    MachinePara.routes(app);
}