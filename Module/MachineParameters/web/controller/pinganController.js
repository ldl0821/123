app.controller('appCtrl', function($scope, $http) {
    var baseUrl = "/diagnosis/";
    var TIME;
    var color = {
        "1": 'rgb(245, 40, 12)',
        "2": 'rgb(78, 207, 31)',
        "3": 'rgb(230, 210, 21)',
        "4": 'rgb(96, 103, 101)',
        "5": 'rgb(35, 43, 232)',
    }

    $scope.items = [];
    $scope.items_son = [];
    $scope.status = 0;
    GetGrouplist(0, "diagnosis/GetUserMacGroup", $("#treeview-template").html(), "icon-group", function(data) {
        var groupId = parseInt($(data).find('[attr="treenode"]').attr("nodeid"));
        $.post(baseUrl + "GetMachinesByGourpId", { groupId: groupId }, function(data) {
            if (data.Status == 0) {
                $scope.items = data.Data;
                if ($scope.items.length > 0) {
                    for (var i = 0; i < $scope.items.length; i++) {
                        $scope.items[i].color = "#CCCCCC";
                        $scope.items[i].photo = "/images/machine/NoDefault/" + $scope.items[i].PHOTO;
                        $scope.items[i].pars = [];
                    }
                }
                $scope.$apply();
                //获取即时参数
                if (TIME != undefined) {
                    //TIME.clear();
                    clearTimeout(TIME);
                }
                $scope.getRealData($scope.status);
            }
        });
    });
    $scope.getRealData = function(status) {
        var machineIds = "";
        for (var i = 0; i < $scope.items.length; i++) {
            machineIds += $scope.items[i].MAC_NBR + ',';
        }
        machineIds = machineIds.substring(0, machineIds.length - 1);
        if (machineIds == '') {
            $scope.items_son = [];
            $scope.$apply();
            return;
        }
        $.post("/diagnosis/r/DataCenter", ({ machineIds: machineIds }), function(data) {
            //2018/9/17   lh   如果状态为0  转为 3
            for (var l = 0; l < data.Data.length; l++) {
                if (data.Data[l].Items['STD::Status']) {
                    if (data.Data[l].Items['STD::Status'].Value == 0) {
                        data.Data[l].Items['STD::Status'].Value = 3;
                    }
                }
            }
            for (var i = 0; i < $scope.items.length; i++) {
                var jsonlength = 0;
                var chuhao = 1;
                var tempMac = _.where(data.Data, { 'MacNbr': $scope.items[i].MAC_NBR });
                if (tempMac.length > 0) {
                    var para = tempMac[0].Items;
                    $scope.items[i].twopars = []; //二维数组
                    $scope.items[i].pars = [];
                    $scope.items[i].parsAll = [];
                    for (var key in para) {
                        jsonlength += 1;
                        if (key == 'STD::Status') {
                            $scope.items[i].color = para[key].Value == 0 ? "#CCCCCC" : color[para[key].Value];
                            if ($scope.status == para[key].Value || $scope.status == 0) {
                                $scope.items[i].enable = true;
                            } else {
                                $scope.items[i].enable = false;
                            }
                        }
                        if (para[key].Name == 'STD::Program' || para[key].Name == 'STD::Alarm') {
                            $scope.items[i].parsAll.push({
                                NAME: para[key].Description == undefined ? para[key].Name : para[key].Description,
                                VALUE: para[key].Value
                            });
                        }
                        if (para[key].Name == 'STD::Status') {
                            //1停止  2运行 3空闲 4关机  5 调试
                            switch (para[key].Value) {
                                case 1:
                                    $scope.items[i].parsAll.push({
                                        NAME: para[key].Description == undefined ? para[key].Name : para[key].Description,
                                        VALUE: '停止'
                                    });
                                    break;
                                case 2:
                                    $scope.items[i].parsAll.push({
                                        NAME: para[key].Description == undefined ? para[key].Name : para[key].Description,
                                        VALUE: '运行'
                                    });
                                    break;
                                case 3:
                                    $scope.items[i].parsAll.push({
                                        NAME: para[key].Description == undefined ? para[key].Name : para[key].Description,
                                        VALUE: '空闲'
                                    });
                                    break;
                                case 4:
                                    $scope.items[i].parsAll.push({
                                        NAME: para[key].Description == undefined ? para[key].Name : para[key].Description,
                                        VALUE: '关机'
                                    });
                                    break;
                                case 5:
                                    $scope.items[i].parsAll.push({
                                        NAME: para[key].Description == undefined ? para[key].Name : para[key].Description,
                                        VALUE: '调试'
                                    });
                                    break;
                                default:
                                    console.error('Error');
                                    break;
                            }
                        }


                        if (jsonlength % 10 != 0) {
                            $scope.items[i].twopars.push({
                                NAME: para[key].Description == undefined ? para[key].Name : para[key].Description,
                                VALUE: para[key].Value
                            });
                        } else {
                            chuhao++;
                            // $scope.items[i].pars.push($scope.items[i].twopars);
                            // $scope.items[i].twopars = [];
                        }


                        // $scope.items[i].pars.push({
                        //     NAME: para[key].Description == undefined ? para[key].Name : para[key].Description,
                        //     VALUE: para[key].Value
                        // });
                    }
                    for (var j = 0; j < chuhao; j++) {
                        $scope.items[i].pars.push($scope.items[i].twopars.slice(j * 10, j * 10 + 11));
                    }

                    // para.forEach(key => {
                    //     //if (key.Hot) {
                    //     if (key.Name == 'STD::Status') {
                    //         $scope.items[i].color = key.Value == 0 ? "#CCCCCC" : color[key.Value];
                    //         if ($scope.status == key.Value || $scope.status == 0) {
                    //             $scope.items[i].enable = true;
                    //         } else {
                    //             $scope.items[i].enable = false;
                    //         }
                    //     }
                    //     $scope.items[i].pars.push({
                    //         NAME: key.Description,
                    //         VALUE: key.Value
                    //     });
                    //     //}
                    // });
                }
            }
            if ($scope.status > 0) {
                $scope.items_son = _.where($scope.items, { 'enable': true });
            } else {
                $scope.items_son = $scope.items;
            }
            $scope.items_son.sort(compare('GP_NBR', compare('RANK_NUM')));
            $scope.$apply();
            // TIME = setTimeout(function() {
            //     $scope.getRealData($scope.status);
            // }, 5000);

            $('.machineLabel').mouseover(function(e) {
                var e = event || window.event;
                if (e.screenX - $('#grid').offset().left <= $('#grid').width() / 2) {
                    $(this).children('.machineLabelChild').css({
                        display: 'flex'

                    })
                } else {
                    $(this).children('.machineLabelChild').css({
                        display: 'flex',
                        left: `-${$(this).children('.machineLabelChild').children().length*100}%`,
                    })
                }
            })
            $('.machineLabel').mouseout(function(e) {
                $(this).children('.machineLabelChild').css({
                    display: 'none'
                })
            })
            $('.machineLabelChild').mouseover(function(e) {
                $(this).css({
                    display: 'flex'
                })
            })
            $('.machineLabelChild').mouseout(function() {
                $(this).css({
                    display: 'none'
                })
            })
        });
    }

    $scope.all = function() {
        $scope.status = 0;
        clearTimeout(TIME);
        $scope.getRealData($scope.status);
    }

    $scope.stop = function() {
        $scope.status = 1;
        clearTimeout(TIME);
        $scope.getRealData($scope.status);
    }
    $scope.run = function() {
        $scope.status = 2;
        clearTimeout(TIME);
        $scope.getRealData($scope.status);
    }
    $scope.idle = function() {
        $scope.status = 3;
        clearTimeout(TIME);
        $scope.getRealData($scope.status);
    }
    $scope.oper = function() {
        $scope.status = 5;
        clearTimeout(TIME);
        $scope.getRealData($scope.status);
    }
    $scope.shut = function() {
        $scope.status = 4;
        clearTimeout(TIME);
        $scope.getRealData($scope.status);
    }

    $scope.showDetail = function(index, mac_no, mac_name, CATEGORY) {
        // window.location = `/MachinePara?mac_nbr=${index}`;
        window.location = `/UpDatas?id=${index}`;
    }
})
//按照多个字段排序
function compare(name, minor) {
    return function(o, p) {
        var a, b;
        if (o && p && typeof o === 'object' && typeof p === 'object') {
            a = o[name];
            b = p[name];
            if (a === b) {
                return typeof minor === 'function' ? minor(o, p) : 0;
            }
            if (typeof a === typeof b) {
                return a < b ? -1 : 1;
            }
            return typeof a < typeof b ? -1 : 1;
        } else {
            console.log("error");
        }
    }
}

function getHsonLength(json) {
    var jsonLength = 0;
    for (var i in json) {
        jsonLength++;
    }
    return jsonLength;
}