$('#table').bootstrapTable({
    url: '/realTimeAlarm/getAlarm', //请求后台的URL（*）
    method: 'get', //请求方式（*）
    //toolbar: '#toolbar', //工具按钮用哪个容器
    striped: true, //是否显示行间隔色
    // cache: false,                       //是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
    // pagination: true,                   //是否显示分页（*）
    // sortable: false,                     //是否启用排序

    sidePagination: "client", //分页方式：client客户端分页，server服务端分页（*）
    pageNumber: 1, //初始化加载第一页，默认第一页
    pageSize: 99999999, //每页的记录行数（*）
    //pageList: [10, 25, 50, 100],        //可供选择的每页的行数（*）
    // search: true,                       //是否显示表格搜索，此搜索是客户端搜索，不会进服务端，所以，个人感觉意义不大
    // strictSearch: true,
    // showColumns: true,                  //是否显示所有的列
    // showRefresh: true,                  //是否显示刷新按钮
    // minimumCountColumns: 2,             //最少允许的列数
    // clickToSelect: true,                //是否启用点击选中行
    height: 500, //行高，如果没有设置height属性，表格自动根据记录条数觉得表格高度
    // uniqueId: "ID",                     //每一行的唯一标识，一般为主键列
    // showToggle:true,                    //是否显示详细视图和列表视图的切换按钮
    // cardView: false,                    //是否显示详细视图
    // detailView: false,                   //是否显示父子表
    columns: [{
        field: 'MAC_NAME',
        title: lang.EmployeePerformance.Equipment,
        align: 'center',
        width: 200,
    }, {
        field: 'ALARM_DATE',
        title: lang.Alarm.AlarmTime,
        align: 'center',
        width: 200,
        formatter: function(val) {
            return moment(val).subtract(8, 'hours').format('YYYY-MM-DD HH:mm:ss')

        }
    }, {
        field: 'ALARM_MESSAGE',
        title: lang.Alarm.AlarmContent
    }],
    responseHandler: function(data) {
        var arr = [];
        if (data.Status == 0) {
            arr = data.Data
        }
        return arr;
    }
});

function refresh() {
    $('#table').bootstrapTable('refresh');
}


function getAlarmNum() {
    $.get('/realTimeAlarm/getAlarmNum', function(data) {
        if (data.Status == 0) {
            var html = "";
            data.Data.forEach(function(v, i) {
                html += '<p class="clearfix"><span class="pull-left">' + v.MAC_NAME + '</span><span class="pull-right">' + v.value + lang.Alarm.Times + '</span></p>'
            })
            $('.content').html(html);
        }
        //console.log(data)
    })
}

getAlarmNum()
setInterval(function() {
    refresh();
    getAlarmNum()
}, 5000)