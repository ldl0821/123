var baseUrl = "/ToolLifes/";
app.controller('TCtrl', function($scope, $http) {
    $scope.dataArr = ['workingBGC','warnBGC','scrapBGC'];
    $scope.items = [];
    $scope.items_son = [];
    $scope.ID = "";
    $scope.str = "";
    $(".inbox-nav li a.btn").on("click", function() {
        $(".inbox-nav li.active").removeClass("active");
        $(this).parent().addClass("active");
        $scope.GetLock();
    });
    $('#ToolNo').bind('keypress', function(event) {
        if (event.keyCode == "13") {
            $scope.GetLock($scope.str);
        }
    });
    $("#QueryTool").click(function(){
        $scope.GetLock();
    })

    $scope.GetLock = function(str) {
        //获取查询条件 所有、锁机，未锁
        var type = $(".inbox-nav").find(".active").children().attr("data-title");
        var CUTTTER_NO = $("#ToolNo").val();
        var mac_nbr = $('#my-selects').val()==undefined?"":$('#my-selects').val().toString();
        var CUTTER_STST = type==""?"":parseInt(type);
        $http.post(baseUrl+'GetCurrentCutterDurationLifeList',{pageIndex:1,PageSize:999,CUTTTER_NO:CUTTTER_NO,mac_nbr:mac_nbr,CUTTER_STST:CUTTER_STST}).success(function(data) {
            if(data.Status==0){
                $scope.items_son = data.Data.List;
            }
        })
    }
    $scope.GetLock();
    //编辑寿命
    $scope.editKnife = function(index){
        WitheKnife('编辑',2,$scope.items_son[index]);
    }

    //卸刀
    $scope.unloadKnife = function(index) {
        BzConfirm("确定将【" + $scope.items_son[index].NEW_CUTTER_NO + "】进行卸刀？", function(e) {
            if (e) {
                $http.post(baseUrl+'UninstallCutter', { NEW_CUTTER_ID: $scope.items_son[index].NEW_CUTTER_ID })
                    .success(function(data) {
                        if (data.Status == 0) {
                            BzSuccess('操作成功！');
                            $scope.GetLock();
                        } else {
                            BzAlert(data.Message);
                        }
                    });
            }
        });
    }

    //换刀
    $scope.changeKnife = function(index) {
        BzConfirm("确定将【" + $scope.items_son[index].NEW_CUTTER_NO + "】换刀？", function(e) {
            if (e) {
                WitheKnife('换刀',1,$scope.items_son[index].NEW_CUTTER_ID);
            }
        });
    }

    /*装刀 */
    var macNbr = 0; 
    $("#addTool").click(function(){
        WitheKnife('装刀',0,"");
    })
    //装刀操作部分
    function WitheKnife(title,type,NEW_CUTTER_ID){
        $.confirm({
            title: title,
            draggable: true,
            content: `<div class="row box-a">
                    <div class="col-xs-6">
                        <span>刀具规则:</span>
                        <select id="ToolRules"></select>
                    </div>
                    <div class="col-xs-6">
                        <span>刀具&nbsp;&nbsp;&nbsp;ID:</span>
                        <input  type="text" id="ToolRulesId" ></input>
                    </div>
                    <div class="col-xs-6">
                        <span>设&nbsp;&nbsp;&nbsp;&nbsp;&nbsp&nbsp&nbsp备:</span>
                        <input type="text" id="mac"/>                           
                    </div>
                    <div class="col-xs-6">
                        <span>预计寿命:</span>
                        <input type="number" id="EXPECT_LIFE"/>
                    </div>
                    <div class="col-xs-6">
                        <span>预警寿命:</span>
                        <input type="number" id="WARN_LIFE"/>
                    </div>
                    <div class="col-xs-6">
                        <span>程序编号:</span>
                        <input type="text" id="PROGRAM"/>
                    </div>
                    <div class="col-xs-6">
                        <span>刀具编号:</span>
                        <input type="text" id="CUTTER_NO"/>
                    </div>
                    <div class="col-xs-6">
                        <span>刀具名称:</span>
                        <input type="text" id="CUTTER_NAME"/>
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
                        if (!EXPECT_LIFE.value || !WARN_LIFE.value || !ToolRulesId.value || !PROGRAM.value || !CUTTER_NO.value|| !CUTTER_NAME.value) {
                            BzAlert("信息不全，请填写完毕！");
                            return false;
                        }
                        //方法
                        var parms = {
                            NEW_CUTTER_NO: CUTTER_NO.value,
                            NEW_CUTTER_NO_NAME: CUTTER_NAME.value,
                            PROGRAM: PROGRAM.value,
                            EXCEPT_LIFE: parseFloat(EXPECT_LIFE.value)*3600,
                            WARN_LIFE: parseFloat(WARN_LIFE.value)*3600,
                            MAC_NBR: mac_nbr.rData==undefined?macNbr:mac_nbr.rData,
                            REAL_LIFE: 0,
                            R_ID: parseInt($("#ToolRules").val())
                        }
                        if(type==0){ // 装刀
                            parms.NEW_CUTTER_UNIQUE_NO = ToolRulesId.value;
                            $.ajax({
                                url: baseUrl+'InsertNewCutter',
                                data: parms,
                                success: function(data) {
                                    if (data.Status == 0) {
                                        BzSuccess(data.Message);
                                        $scope.GetLock();
                                    }else{
                                        BzAlert(data.Message);
                                    }
                                }
                            })
                        }else if(type==1){//换刀
                            parms.NEW_CUTTER_ID = NEW_CUTTER_ID;
                            parms.NEW_CUTTER_UNIQUE_NO = ToolRulesId.value;
                            $http.post(baseUrl+'ChangeCutter',parms).success((data)=>{
                                if(data.Status==0){
                                    BzSuccess(data.Message);
                                    $scope.GetLock();
                                }else
                                    BzAlert(data.Message);
                            })
                        }else if(type==2){//编辑
                            var item = NEW_CUTTER_ID;
                            parms.REAL_LIFE = item.REAL_LIFE
                            parms.NEW_CUTTER_ID = item.NEW_CUTTER_ID;
                            $http.post(baseUrl+'UpdateCurrentCutter',parms).success((data)=>{
                                if(data.Status==0){
                                    BzSuccess(data.Message);
                                    $scope.GetLock();
                                }else
                                    BzAlert(data.Message);
                            })
                        }
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
                
                //加载刀具规则
                $.ajax({
                    url:baseUrl+'GetCutterRuleList',
                    data:{pageIndex:1,PageSize:999999,program:"",mac_nbr:"",type:""},
                    async: false,
                    success:function(data){
                        if(data.Data.List.length>0){
                            for(var i=0;i<data.Data.List.length;i++){
                                $("#ToolRules").append("<option value="+data.Data.List[i].R_ID+">"+data.Data.List[i].R_NAME+"</option>");
                            }
                        }
                    }
                })
                //根据规则拉取规则信息
                $.ajax({
                    url:baseUrl+'GetCutterRuleByR_ID',
                    data:{R_ID:parseInt($("#ToolRules").val())},
                    async: false,
                    success:function(data){
                        if(data.Status==0){
                            $("#EXPECT_LIFE").val((parseFloat(data.Data[0].EXCEPT_LIFE)/3600).toFixed(2));
                            $("#WARN_LIFE").val((parseFloat(data.Data[0].WARN_LIFE)/3600).toFixed(2));
                            $("#PROGRAM").val(data.Data[0].PROGRAM);
                            $("#input_mac").val(data.Data[0].MAC_NAME);
                            $("#CUTTER_NO").val(data.Data[0].TOL_NO);
                            $("#CUTTER_NAME").val(data.Data[0].TOL_NAME);
                            macNbr = data.Data[0].MAC_NBR;
                        }
                    }
                })
                $("#ToolRules").change(()=>{
                    var rid = $("#ToolRules").val();
                    $http.post(baseUrl+'GetCutterRuleByR_ID',{R_ID:parseInt(rid)}).success((data)=>{
                        if(data.Status==0){
                            $("#EXPECT_LIFE").val((parseFloat(data.Data[0].EXCEPT_LIFE)/3600).toFixed(2));
                            $("#WARN_LIFE").val((parseFloat(data.Data[0].WARN_LIFE)/3600).toFixed(2));
                            $("#PROGRAM").val(data.Data[0].PROGRAM);
                            $("#input_mac").val(data.Data[0].MAC_NAME);
                            $("#CUTTER_NO").val(data.Data[0].TOL_NO);
                            $("#CUTTER_NAME").val(data.Data[0].TOL_NAME);
                            macNbr = data.Data[0].MAC_NBR;
                        }
                    })
                })
                if(type==2){ // 编辑
                    var item = NEW_CUTTER_ID;
                    $("#ToolRules").val(item.R_ID);
                    $("#ToolRulesId").val(item.NEW_CUTTER_UNIQUE_NO);
                    $('#ToolRulesId').attr('readonly','readonly')
                    $("#EXPECT_LIFE").val((parseFloat(item.EXCEPT_LIFE)/3600).toFixed(2));
                    $("#WARN_LIFE").val((parseFloat(item.WARN_LIFE)/3600).toFixed(2));
                    $("#PROGRAM").val(item.PROGRAM);
                    $("#input_mac").val(item.MAC_NAME);
                    $("#CUTTER_NO").val(item.NEW_CUTTER_NO);
                    $("#CUTTER_NAME").val(item.NEW_CUTTER_NO_NAME);
                    macNbr = item.MAC_NBR;
                }
            }
        })
    }
})

app.filter('reverse', function() { //可以注入依赖
    return function(date) {
        return date==null?"":moment(date).format("YYYY-MM-DD HH:mm:ss");
    }
});

app.filter('toHour', function() { //可以注入依赖
    return function(number) {
        return (parseFloat(number)/3600).toFixed(2);
    }
});