﻿var app = angular.module('layout', []);
app.controller('layoutctrl', ['$scope', '$http', function($scope, $http) {
    App.init();
    $http.get('/loadmenu').success(function(data) {
        if (data.Status == 0) {
            $('#' + data.Data.PID).parent().addClass("active");
            if (data.Data.ID != null) {
                SelectMenu($("#" + data.Data.ID).parent().parent(), data.Data.ID);
            }
        }
    })
    $scope.toggleSideMenu = function(e) {
        if ($("body").hasClass("page-sidebar-closed")) {
            $.cookie("SIDEBAR", "", 1); //显示
        } else {
            $.cookie("SIDEBAR", "", 0); //隐藏
        }
    };
    $scope.getID = function(e) {
        $http.get('/save/pid?id=' + e).success();
    }
    $scope.getSon = function(e) {
        var pid = $('#' + e).attr('pid');
        var id = $('#' + e).attr('id');
        $http.get('/save/id?id=' + id + '&pid=' + pid).success();
    }
}])

//递归处理菜单
function SelectMenu(ele, mid) {
    if (ele.hasClass("sub-menu")) { //子菜单
        $(ele).show();
        $(ele).parent().addClass("open");
        $(ele).parent().children().eq(0).children().last().addClass("open"); //菜单打开箭头
        SelectMenu($(ele).parent().parent(), mid);
    } else { //根菜单
        $(ele).children().filter(".open").addClass("active");
        $('#' + mid).parent().addClass('active');
    }
}