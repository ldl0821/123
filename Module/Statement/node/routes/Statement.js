var Statement = require('../controller/Statement.js');
module.exports = function(app) {
    app.get('/Statements', Statement.Statement);
    app.post('/Statement/machineactivation/GetNewNULLActivation', Statement.GetNewNULLActivation);
    // app.post('/Statement/machineactivation/GetActivation', Statement.GetActivation);
    app.post('/Statement/GetClasses', Statement.GetClasses);
    app.get('/Statement/r/outExcel', Statement.outExcel);
}