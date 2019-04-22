var baseUrl = "/ToolRunningTime/";
var groupOrMachine;
$(function() {
    groupOrMachine = $("#groupOrMachine").multipleComboxTree({
        url: "/Alarm/GetAllMachineAndMachineGroup",
        url2: "/Alarm/GetKeywordMachinelist",
        type: 2,
        data: {
            GroupId: 0
        },
        //checkbox: true
    }).data("BZ-multipleComboxTree");


    //加载刀具组
    loadCutterGoup("#groupTool")
    window.loadCutterGoup = loadCutterGoup;

    function loadCutterGoup(id) {
        $.get('CutterHistory/GetCutterGroupList', function(data) {
            var html = '';
            if (data.Data.length > 0) {
                data.Data.forEach(function(v, i) {
                    html += '<option value="' + v.CUTTER_GOUP_NBR + '">' + v.CUTTER_GOUP_NAME + '</option>'
                })

            }
            $(id).append(html);

            $(id).change(function(e) {
                var re = null;

                data.Data.forEach(function(v, i) {
                    if (e.target.value == v.CUTTER_GOUP_NBR) {
                        re = v;
                    }
                })
                $(id).data("selected-data", re);
            })
        })
    }


    $("#table").bootstrapTable({
        url: '/CutterManage/GetCutterList', //请求后台的URL（*）
        method: 'post', //请求方式（*）
        toolbar: '#toolbar', //工具按钮用哪个容器
        striped: true, //是否显示行间隔色
        cache: false, //是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
        pagination: true, //是否显示分页（*）
        //paginationLoop:true,
        sortable: true, //是否启用排序
        //sortOrder: "HASP_ID desc",                   //排序方式
        queryParams: queryParams, //传递参数（*）
        queryParamsType: '',
        sidePagination: "server", //分页方式：client客户端分页，server服务端分页（*）
        pageNumber: 1, //初始化加载第一页，默认第一页
        pageSize: 10, //每页的记录行数（*）
        pageList: [10, 25, 50, 100], //可供选择的每页的行数（*）
        //search: true, //是否显示表格搜索，此搜索是客户端搜索，不会进服务端，所以，个人感觉意义不大
        //strictSearch: false,
        //showColumns: true, //是否显示所有的列
        //showRefresh: true, //是否显示刷新按钮
        minimumCountColumns: 2, //最少允许的列数
        clickToSelect: true, //是否启用点击选中行
        height: 500, //行高，如果没有设置height属性，表格自动根据记录条数觉得表格高度
        uniqueId: "ID", //每一行的唯一标识，一般为主键列
        //showToggle: true,                    //是否显示详细视图和列表视图的切换按钮
        cardView: false, //是否显示详细视图
        detailView: false, //是否显示父子表
        columns: [{
            field: 'MAC_NAME',
            title: '设备号',
            align: 'center',
            valign: 'middle',
        },{ 
            field: 'CUTTER_NO',
            title: '刀号',
            align: 'center',
            valign: 'middle',
        }, {
            field: 'EXPECT_LIFE',
            title: '预计寿命',
            align: 'center',
            valign: 'middle',

        }, {
            field: 'WARN_LIFE',
            title: '预警寿命',
            align: 'center',
            valign: 'middle',
            events: Method,
            formatter:function(val,row){
                return '<a class="update">'+val+'</a>'
            }
        }, {
            field: 'USING_LIFE',
            title: '使用寿命',
            align: 'center',
            valign: 'middle',

        }, {
            field: 'STATUS_TYPE',
            title: '状态',
            align: 'center',
            valign: 'middle',
            formatter: function(val) {
                var re = '';
                switch (val) {
                    case 1:
                        re = '进行中';
                        break;
                    case 2:
                        re = '预警';
                        break;
                    case 3:
                        re = '报废';
                        break;
                    case 4:
                        re = '其他';
                        break;
                }
                return re;
            }
        }, {
            field: 'INSTALL_DATE',
            title: '装刀时间',
            align: 'center',
            valign: 'middle',
            formatter: formatDate

        }, {
            field: 'USING_DATE',
            title: '使用时间',
            align: 'center',
            valign: 'middle',
            formatter: formatDate

        }, {
            field: 'UNINSTALL_DATE',
            title: '卸刀时间',
            align: 'center',
            valign: 'middle',

            formatter: formatDate

        }, {
            field: '',
            title: '操作',
            align: 'center',
            valign: 'middle',
            formatter: function(val, obj) {
                var arr = [];
                if (obj.UNINSTALL_DATE) {
                    arr.push('<button class="btn green">详细</btton>');
                } else {
                    arr.push('<button class="btn blue">卸刀</btton>');
                    //arr.push('<button class="btn red">清除</btton>');
                }
                return arr.join('&nbsp;');
            },
            events: Method

        }, ],
        responseHandler: function(res) {
            var re = {
                rows: res.Data,
                total: 0,
            };
            if (re.rows.length > 0)
                re.total = re.rows[0].TOTALCOUNT
            return re;
        },
    });


    function queryParams(obj) {
        return {
            PageIndex: obj.pageNumber,
            PageSize: obj.pageSize,
            gp_nbr: '',
            tool_no: '',
            status: '',
            mac_nbr: '',
            flag: checkbox.checked == false ? 1 : ""

        }
    }

    function formatDate(val, obj) {
        var html = '';
        if (val) {
            html = moment(val).format('YYYY-MM-DD HH:mm:ss');
        }
        return html;
    }

})

/*事件 */

var Method = {
    'click .blue': function(e, val, obj) {
        downTool(e, val, obj); //卸刀

    },
    'click .red': function(e, val, obj) {
        setZero(e, val, obj); //清除

    },
    'click .green': function(e, val, obj) {
        viewDetails(e, val, obj); //详细

    },
    'click .update':function(e, val, obj){
        setWarnLife(e, val, obj);
    }

}

/*卸刀事件方法*/
function downTool(e, val, obj) {
    $.confirm({
        title: ' ',
        content: '<h4>您确定要卸刀吗？</h4>',
        draggable: true,
        boxWidth: '500px',
        useBootstrap: false,
        // animation: 'news',
        // closeAnimation: 'news',
        buttons: {
            addInput: {
                text: '确定',
                btnClass: 'btn-blue',
                action: function() {
                    //方法
                    console.log(obj)
                    var data = {
                        gp_nbr: obj.CUTTER_GOUP_NBR,
                        mac_nbr: obj.MAC_NBR,
                        cutter_no: obj.CUTTER_NO,
                    }
                    $.post('/CutterManage/UnInstallCutter', data, function(data) {
                        if (data.Status == 0) {
                            search();
                        }
                    })

                }
            },
            close: {
                text: '取消',
                btnClass: 'btn-red',
            }
        },
        onContentReady: function() {
            var data = [{
                    id: 0,
                    text: "寿命未到"
                }, {
                    id: 1,
                    text: "寿命已到"
                },
                {
                    id: 2,
                    text: "报废"
                },
                {
                    id: 3,
                    text: "其他"
                },
            ];
            var html = '';
            data.forEach(function(v, i) {
                html += '<option value="' + v.id + '">' + v.text + '</option>'
            })

            $("#s1").html(html);


        },
    })
}

/*修改预计寿命方法 */

function setExpectLife(e, val, obj) {
    $.confirm({
        title: '预计寿命',
        content: '<input type="number" id="dynamicValue" class="center"/>',
        draggable: true,
        boxWidth: '400px',
        useBootstrap: false,
        // animation: 'news',
        // closeAnimation: 'news',
        buttons: {
            addInput: {
                text: '输入',
                btnClass: 'btn-blue',
                action: function() {
                    //方法
                    var dynamicValue = parseFloat($("#dynamicValue").val());
                    if (!isNaN(dynamicValue)) {
                        updateLife(obj, dynamicValue)
                    } else {
                        BzAlert('输入的必须是个有效数字！')
                        return false;
                    }

                }
            },
            close: {
                text: '取消',
                btnClass: 'btn-red',
            }
        },
        onContentReady: function() {

        },
    })
}

function updateLife(obj, val) {
    console.log(obj)

    var data = {
        macNbr: groupOrMachine.rData,
        address: $("#groupTool").data("selected-data").CUTTER_GROUP_ADDRESS,
        value: val
    }
    console.log(data)
    $.post('RemoteChange/GetDynamicValue2', data, function(data) {
        if (data.Status == 3) {
            BzAlert(data.Message);
            return false;
        }
        if (data.Data == 0) {
            var p = {
                groupid: $("#groupTool").data("selected-data").CUTTER_GOUP_NBR,
                exception_life: val,
                MAC_NBR: groupOrMachine.rData
            }
            $.post('CutterManage/EditCutterExceptLife', p, function(data) {
                console.log(data);
                search();
                BzSuccess('操作成功！');
            })
        } else {
            $.alert('检查配置是否正确！')
        }
    })

}

/* 修改预警寿命方法*/
function setWarnLife(e, val, obj) {

    $.confirm({
        title: '预警寿命',
        content: '<input type="number" id="dynamicValue" class="center"/>',
        draggable: true,
        boxWidth: '400px',
        useBootstrap: false,
        // animation: 'news',
        // closeAnimation: 'news',
        buttons: {
            addInput: {
                text: '输入',
                btnClass: 'btn-blue',
                action: function() {
                    //方法
                    var dynamicValue = parseFloat($("#dynamicValue").val());
                    if (!isNaN(dynamicValue)) {
                        // if(dynamicValue>obj.USING_LIFE){
                        //     BzAlert('预警寿命不能大于预计寿命!');
                        //     return false;
                        // }
                        var data = {
                                cutter_nbr: obj.CUTTER_NBR,
                                warn_life: dynamicValue
                            }
                            //方法
                        $.post('CutterManage/EditCutterWarntLife', data, function(data) {
                            search();
                        })
                    } else {
                        BzAlert('输入的必须是个有效数字！')
                        return false;
                    }

                }
            },
            close: {
                text: '取消',
                btnClass: 'btn-red',
            }
        },
        onContentReady: function() {

        },
    })
}

/*查询及刷新 */
function search() {
    var data = {
        query: {
            mac_nbr: groupOrMachine.rData || "",
            PageIndex: 1,
            // gp_nbr: groupTool.value,
            tool_no: tool_no.value,
            status: $('#status').val(),
            flag: checkbox.checked == false ? 1 : ""

        }
    }

    $("#table").bootstrapTable('refresh', data);
}

/*置零 */
function setZero(e, val, obj) {
    var data = {
        cutter_nbr: obj.CUTTER_NBR
    }
    $.confirm({
        title: '清除',
        content: '<h4>您确定要清除吗？</h4>',
        draggable: true,
        boxWidth: '500px',
        useBootstrap: false,
        // animation: 'news',
        // closeAnimation: 'news',
        buttons: {
            addInput: {
                text: '确定',
                btnClass: 'btn-blue',
                action: function() {
                    //方法
                    $.post('/CutterManage/ClearAllData', data, function(data) {
                        if (data.Data == 0) {
                            search();
                        }
                    })

                }
            },
            close: {
                text: '取消',
                btnClass: 'btn-red',
            }
        },
        onContentReady: function() {

        },
    })

}

/*装刀 */
function addTool() {

    $.confirm({
        title: '装刀',
        draggable: true,
        content: `<div class="row box-a">
                <div class="col-xs-6">
                    <span>设&nbsp;&nbsp;&nbsp;&nbsp;&nbsp&nbsp&nbsp备:</span>
                    <input type="text" id="mac"/>                           
                </div>
                <div class="col-xs-6">
                    <span>刀具编号:</span>
                    <input type="text" id="CUTTER_NO"/>
                </div>
                <div class="col-xs-6">
                    <span>预计寿命:</span>
                    <input type="text" id="EXPECT_LIFE"/>
                </div>
                <div class="col-xs-6">
                    <span>预警寿命:</span>
                    <input type="text" id="WARN_LIFE"/>
                </div>
            </div>`,
        boxWidth: '600px',
        useBootstrap: false,
        // animation: 'news',
        // closeAnimation: 'news',
        buttons: {
            addInput: {
                text: '确定',
                btnClass: 'btn-blue',
                action: function() {
                    var mac_nbr = $("#mac").data("BZ-multipleComboxTree");
                    console.log(toolGroup.value)
                    if (!mac_nbr.rData || !toolGroup.value || isNaN(CUTTER_NO.value) || isNaN(EXPECT_LIFE.value) || isNaN(WARN_LIFE.value)) {
                        return false;
                    }

                    //方法
                    var data = {
                        addcut: {
                            MAC_NBR: mac_nbr.rData,
                            CUTTER_GOUP_NBR: toolGroup.value,
                            CUTTER_NO: CUTTER_NO.value,
                            EXPECT_LIFE: EXPECT_LIFE.value,
                            WARN_LIFE: WARN_LIFE.value
                        }
                    }
                    $.ajax({
                        url: '/CutterManage/InStallCutter',
                        contentType: 'application/json',
                        data: JSON.stringify(data),
                        success: function(data) {
                            if (data.Status == 0) {
                                search();
                                // BzSuccess('新增成功！');
                            }
                            // else {
                            //     BzAlert('不能插入重复键！');
                            // }


                        }
                    })
                }
            },
            close: {
                text: '取消',
                btnClass: 'btn-red',
            }
        },
        onContentReady: function() {
            $("#mac").multipleComboxTree({
                url: "/Alarm/GetAllMachineAndMachineGroup",
                url2: "/Alarm/GetKeywordMachinelist",
                type: 2,
                width:180,
                data: {
                    GroupId: 0
                },
                //checkbox: true
            }).data("BZ-multipleComboxTree");
            input_mac.style.height = '20px';
            loadCutterGoup('#toolGroup');
        },
    })
}


/**查看详细 */
function viewDetails(e, val, obj) {
    $.alert({
        title: '详细',
        content: '<table id="tableVD"></table>',
        draggable: true,
        boxWidth: '800px',
        useBootstrap: false,
        onContentReady: function() {
            $("#tableVD").bootstrapTable({
                url: '/CutterManage/GetDetails', //请求后台的URL（*）
                method: 'post', //请求方式（*）
                toolbar: '#toolbar', //工具按钮用哪个容器
                striped: true, //是否显示行间隔色
                cache: false, //是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
                pagination: true, //是否显示分页（*）
                //paginationLoop:true,
                sortable: true, //是否启用排序
                //sortOrder: "HASP_ID desc",                   //排序方式
                queryParams: function() {
                    return {
                        // PageIndex: obj.pageNumber,
                        // PageSize: obj.pageSize,
                        dt: moment(obj.INSTALL_DATE).format('YYYY-MM-DD HH:mm:ss'),
                        dt2: moment(obj.UNINSTALL_DATE).format('YYYY-MM-DD HH:mm:ss'),
                        gp_nbr: obj.CUTTER_GOUP_NBR,
                        mac_nbr: obj.MAC_NBR

                    }
                }, //传递参数（*）
                queryParamsType: '',
                sidePagination: "client", //分页方式：client客户端分页，server服务端分页（*）
                pageNumber: 1, //初始化加载第一页，默认第一页
                pageSize: 10, //每页的记录行数（*）
                pageList: [10, 25, 50, 100], //可供选择的每页的行数（*）
                //search: true, //是否显示表格搜索，此搜索是客户端搜索，不会进服务端，所以，个人感觉意义不大
                //strictSearch: false,
                //showColumns: true, //是否显示所有的列
                showRefresh: true, //是否显示刷新按钮
                minimumCountColumns: 2, //最少允许的列数
                clickToSelect: true, //是否启用点击选中行
                height: 500, //行高，如果没有设置height属性，表格自动根据记录条数觉得表格高度
                uniqueId: "ID", //每一行的唯一标识，一般为主键列
                //showToggle: true,                    //是否显示详细视图和列表视图的切换按钮
                cardView: false, //是否显示详细视图
                detailView: false, //是否显示父子表
                columns: [{
                    field: 'MAC_NAME',
                    title: '设备号',
                    align: 'center',
                    valign: 'middle',
                }, {
                    field: 'CUTTER_GOUP_NAME',
                    title: '刀组号',
                    align: 'center',
                    valign: 'middle',
                }, {
                    field: 'CUTTER_NO',
                    title: '刀号',
                    align: 'center',
                    valign: 'middle',
                }, {
                    field: 'PROGRAM',
                    title: '程序号',
                    align: 'center',
                    valign: 'middle',

                }, {
                    field: 'EVENT_DATE',
                    title: '调刀日期',
                    align: 'center',
                    valign: 'middle',
                    formatter: function(val) {
                        var re = "";
                        if (val) {
                            re = moment(val).format('YYYY-MM-DD HH:mm:ss');
                        }
                        return re;
                    }
                }],
                responseHandler: function(res) {
                    // var re = {
                    //     rows: res.Data,
                    //     total: 0,
                    // };
                    // if (re.rows.length > 0)
                    //     re.total = re.rows[0].TOTALCOUNT
                    // return re;
                    return res.Data;
                },
            });
        }
    })


}

//消息提醒
var alertMsg = new AlertMsg('/ToolAlert/getData');
alertMsg.init().setCenter();

// setInterval(function() {
//     alertMsg.setCenter();
// }, 5000)

function AlertMsg(url) {
    this.url = url;
    this.init = function() {
        var me = this;
        var html = `
            <div id="mybox" style="position:fixed; bottom:-260px;right: 0;width:500px;height:250px;border:1px solid #ddd;zIndex: 50;background:#fff;">
                <p style="background:#f2dede;padding:5px;font-size:20px;">刀具寿命预警！</p>
                <div style="padding:5px;">
                    <p id="ooooo" style="font-size:20px;"></p>
                    <a href="/ToolAlert" style="font-size:20px;">查看详情</a>
                </div>
                <div id="cha" style="position:absolute;right:2px;top:2px;font-size:20px;cursor:pointer;">×</div>
            </div>
        `;
        $('body').append(html);
        $('#cha').click(function() {
            me.close();
        })
        return this;
    }
    this.setCenter = function() {
        var me = this;
        $.get(me.url, function(data) {
            if (Array.isArray(data.Data)) {
                if (data.Data.length > 0) {
                    $('#ooooo').html('您有' + data.Data.length + '条消息');
                    me.sport();
                } else {
                    me.close();
                }
            }
        })
    }

    this.sport = function() {
        $('#mybox').animate({
            bottom: 0
        }, 500)
    }

    this.close = function() {
        $('#mybox').css({
            bottom: '-260px'
        })
    }
}