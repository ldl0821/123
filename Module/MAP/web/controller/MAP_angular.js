var app = angular.module('Map', []);
app.controller('MapCtrl', function($scope, $http) {
    if (JSON.parse(localStorage.getItem('USER_MDA_MESSAGE')).USER_PRE.length == 0 || JSON.parse(localStorage.getItem('USER_MDA_MESSAGE')).USER_PRE == undefined) {
        $scope.UserData = '';
    } else {
        $scope.UserData = JSON.parse(localStorage.getItem('USER_MDA_MESSAGE')).USER_PRE[0].COMPANY_NAME;
    }
    $scope.status = [{
            StatusID: 2,
            Icon: 'icon-play',
            name: '运行',
            color: '#4ecf1f',
            MacCount: 0
        },
        {
            StatusID: 3,
            Icon: 'icon-circle-blank',
            name: '空闲',
            color: '#e6d215',
            MacCount: 0
        },
        {
            StatusID: 5,
            Icon: 'icon-wrench',
            name: '调试',
            color: '#1b24f7',
            MacCount: 0
        }, {
            StatusID: 1,
            Icon: 'icon-pause',
            name: '停机',
            color: '#f5280c',
            MacCount: 0
        }, {
            StatusID: 4,
            Icon: 'icon-stop',
            name: '关机',
            color: '#606765',
            MacCount: 0
        }
    ];
})