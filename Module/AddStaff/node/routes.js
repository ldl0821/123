var Cutter = {};
Cutter.AddStaff = require('./routes/AddStaff.js');
module.exports = function(app) {
    Cutter.AddStaff(app);
}