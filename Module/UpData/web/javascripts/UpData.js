//angular.module('bz.maintain.app', ['ui.bootstrap'])
var facilityId; //设备ID
app.controller('maintainCtrl', ['$scope', '$http', function($scope, $http) {
    $('#searchData').click(function() {
        if (MAC_NBR.rData != null) {
            //MAC_NBR.rData
            facilityId = MAC_NBR.rData;
        }
    })
}])