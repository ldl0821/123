$.ajax({
    type: 'GET',
    async: false,
    url: '/diagnosis/r/mac',
    success: function(data) {
        mac = data.Data;
    }
})
app.controller('diagnosisctrl', function($scope, $http) {
    var type = $.getparam("type");
    var baseUrl = "/diagnosis/";
    var statusNbr = $.getparam('status') || 1;
    var TIME;
    var Status = {
        "1": lang.Maintain.停机,
        "2": lang.Maintain.运行,
        "3": lang.Maintain.空闲,
        "4": lang.Maintain.关机,
        "5": lang.Maintain.调试,
    }
    var color = {
        "1": 'rgb(245, 40, 12)',
        "2": 'rgb(78, 207, 31)',
        "3": 'rgb(230, 210, 21)',
        "4": 'rgb(96, 103, 101)',
        "5": 'rgb(35, 43, 232)',
    }
    $scope.all_para;
    $scope.items = [];
    $scope.items_group = [];
    setInterval(() => ($.get('/diagnosis/r/NewCollection', function(data) {
        if (data.Status == 0) {
            $scope.all_para = data.Data;
        }
    })), 5000);

    $scope.getRealData = function(groupId) {
        $.post(baseUrl + "GetMachinesByGourpId", { groupId: groupId }, function(data) {
            if (data.Status == 0) {
                $scope.items = data.Data;
                if ($scope.items.length > 0) {
                    if ($scope.all_para == null) {
                        $.get('/diagnosis/r/NewCollection', function(result) {
                            if (result.Status == 0) {
                                $scope.all_para = result.Data;
                                for (var i = 0; i < $scope.items.length; i++) {
                                    $scope.items[i].color = "#CCCCCC";
                                    $scope.items[i].photo = "/images/machine/NoDefault/" + $scope.items[i].PHOTO;
                                    $scope.items[i].pars = [];
                                    var templist = _.where($scope.all_para, { 'Key': $scope.items[i].MAC_NBR });
                                    if (templist.length > 0) {
                                        $scope.SetPara($scope.items[i], templist[0]);
                                    }
                                    $scope.$apply();
                                }
                            }

                        })

                    } else {
                        for (var i = 0; i < $scope.items.length; i++) {
                            $scope.items[i].color = "#CCCCCC";
                            $scope.items[i].photo = "/images/machine/NoDefault/" + $scope.items[i].PHOTO;
                            $scope.items[i].pars = [];
                            var templist = _.where($scope.all_para, { 'Key': $scope.items[i].MAC_NBR });
                            if (templist.length > 0) {
                                $scope.SetPara($scope.items[i], templist[0]);
                            }
                            $scope.$apply();
                        }
                    }

                }

            }
        });
    }

    $scope.SetPara = function(pars, templist) {
        templist.Value.forEach(key => {
            if (key.Hot) {
                var tjson;
                if (key.Name == 'STD::Status') {
                    tjson = {
                        NAME: lang.EmployeePerformance.State,
                        VALUE: Status[key.Value == 0 ? "-- -- " : key.Value]
                            // UNIT: key.UnitName
                    }
                    pars.color = key.Value == 0 ? "#CCCCCC" : color[key.Value];
                } else if (key.Name == 'STD::SubStatus') {
                    tjson = {
                        NAME: key.Description,
                        VALUE: key.Value == 0 ? "-- -- " : key.Value
                            // UNIT: key.UnitName
                    }
                } else if (key.Name == "STD::StatusStartTime" || key.Name == "DeviceDateTime") {
                    tjson = {
                        NAME: key.Description,
                        VALUE: moment(key.Value).format('YYYY-MM-DD HH:mm:ss')
                            // UNIT: key.UnitName
                    }
                } else {
                    tjson = {
                        NAME: key.Description,
                        VALUE: key.Value
                            // UNIT: key.UnitName
                    }
                }
                pars.pars.push(tjson);
            }
        });
    }

    GetGrouplist(0, "machine/GetGrouplist", $("#treeview-template").html(), "icon-group", function(data) {
        var groupId = parseInt($(data).find('[attr="treenode"]').attr("nodeid"));
        $scope.getRealData(groupId);
        //获取即时参数
        if (TIME != undefined) {
            //TIME.clear();
            clearTimeout(TIME);
        }
        TIME = setTimeout(function() {
            $scope.getRealData(groupId);
        }, 5000);
    });

    $scope.flag = $.getparam('status') || 1;
    $scope.refreshMac = function(n) {
        statusNbr = n
        $scope.flag = n;
        var list = [];
        if ($scope.all_para) {
            $scope.macList = [];
            for (var i = 0; i < $scope.all_para.length; i++) {
                var _mac = _.where(mac, { 'MAC_NBR': $scope.all_para[i].Key });
                var templist = _.where($scope.all_para[i].Value, { 'Name': 'STD::Status' });
                if (templist.length > 0) {
                    if (templist[0].Value == n) {
                        var items = [];
                        $scope.all_para[i].Value.forEach(o => {
                            var obj = {}
                            if (o.Hot) {
                                if (o.Name == "STD::Status") {
                                    obj.name = lang.EmployeePerformance.State;
                                    obj.value = Status[o.Value];
                                } else if (o.Name == "STD::StatusStartTime" || o.Name == "DeviceDateTime") {
                                    obj.name = o.Description;
                                    obj.value = moment(o.Value).format('YYYY-MM-DD HH:mm:ss');
                                } else {
                                    obj.name = o.Description;
                                    obj.value = o.Value;
                                }
                                items.push(obj);
                            }
                        });

                        $scope.macList.push({
                            PHOTO: "/images/machine/NoDefault/" + _mac[0].PHOTO,
                            MAC_NAME: _mac[0].MAC_NAME,
                            MAC_NO: _mac[0].MAC_NO,
                            color: color[n],
                            items: items
                        });

                    }
                }
            }
        }
    }

    $scope.refreshMac(statusNbr);
    setInterval(function() {
        $scope.refreshMac(statusNbr);
    }, 5000)
})