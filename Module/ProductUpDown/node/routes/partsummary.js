var partsummarycontrol = require('../controller/Partsummary.js');

module.exports = function (app) {
    app.get('/partsummarys', partsummarycontrol.partsummarypage);
    app.post('/partsummarys/:method', partsummarycontrol.fun);
    app.get('/partsummarys/:method', partsummarycontrol.fun);
}
