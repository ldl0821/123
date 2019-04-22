var Efficiencystatistics = {};
Efficiencystatistics.effciency = require('./routes/machineactivation.js');
Efficiencystatistics.new_effciency = require('./routes/new_machineactivation.js');
Efficiencystatistics.wf_effciency = require('./routes/wf_machineactivation.js');
module.exports = function(app) {
    Efficiencystatistics.effciency(app);
    Efficiencystatistics.new_effciency(app);
    Efficiencystatistics.wf_effciency(app);
}