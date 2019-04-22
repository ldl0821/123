$(() => {
    tinymce.init({
        selector: 'textarea#elm1', //<textarea>中为编辑区域
        theme: "modern", //主题
        language: "zh_CN", //语言 ，可自行下载中文
        height: 450,
        plugins: [ //插件，可自行根据现实内容删除
            "advlist autolink lists charmap print preview imageupload hr anchor pagebreak spellchecker",
            "searchreplace wordcount visualblocks visualchars fullscreen insertdatetime  nonbreaking",
            "save table contextmenu directionality emoticons paste textcolor"
        ],
        //content_css: "css/content.css", //引用的外部CSS样式，可删除
        toolbar: "insertfile undo redo | styleselect fontselect fontsizeselect| bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | l      | print preview fullpage imageupload | forecolor backcolor", //工具栏，可根据需求删除
        style_formats: [ //初始时提供的默认格式
            { title: 'Bold text', inline: 'b' },
            { title: 'Red text', inline: 'span', styles: { color: '#ff0000' } },
            { title: 'Red header', block: 'h1', styles: { color: '#ff0000' } },
            { title: 'Example 1', inline: 'span', classes: 'example1' },
            { title: 'Example 2', inline: 'span', classes: 'example2' },
            { title: 'Table styles' },
            { title: 'Table row 1', selector: 'tr', classes: 'tablerow1' }
        ],
        imageupload_url: '/TinyMCE/upload', //图片上传地址
    });


    function postReadData(param) {
        //调取富文本数据
        $.ajax({
            url: '/TinyMCE/readData',
            type: 'post',
            data: {
                name: $('input[name=MAC_NBRname_input]').val(),
                Num_name: $('input[name=Num_Name_input]').val(),
            },
            success: function(data) {
                if (data.Status == 0) {
                    if (data.Data == undefined) {
                        $(document.getElementById('elm1_ifr').contentWindow.document.body).html('');
                    } else {
                        $(document.getElementById('elm1_ifr').contentWindow.document.body).html(data.Data.text);
                    }
                } else {
                    BzAlert(data.error);
                }
            },
            error: function() {
                console.error(lang.Common.Error);
                return false;
            }
        })
    }

    $('#btnSave').click(function() {
        $.ajax({
            url: '/TinyMCE/postText',
            type: 'POST',
            data: {
                name: $('input[name=MAC_NBRname_input]').val(),
                text: $(document.getElementById('elm1_ifr').contentWindow.document.body).html(),
                Num_name: $('input[name=Num_Name_input]').val(),
            },
            success: function(data) {
                BzSuccess(data.Message);
                btnExamineGetNumName();
                // postReadData();
            },
            error: function() {
                console.error(lang.Common.Error);
                return false;
            }
        })
    })


    $('#btnDelete').click(() => {
        BzConfirm(lang.TinyMCE.deletetemplate, function(e) {
            if (e) {
                $.ajax({
                    url: '/TinyMCE/deleteText',
                    type: 'POST',
                    data: {
                        name: $('input[name=MAC_NBRname_input]').val(),
                        Num_name: $('input[name=Num_Name_input]').val(),
                    },
                    success: function(data) {
                        if (data.Status == 0) {
                            btnExamineGetNumName();
                            BzSuccess(data.Message);
                        } else {
                            BzAlert(data.error);
                        }
                    },
                    error: function() {
                        console.error(lang.Common.Error);
                        return false;
                    }
                })
            }
        });
    })

    function btnExamineGetNumName() {
        $.ajax({
            url: '/TinyMCE/getNum_Name',
            type: 'post',
            data: {
                name: $('input[name=MAC_NBRname_input]').val(),
            },
            success: function(data) {
                $('#MAC_NBRnameid input').remove();
                $('#MAC_NBRnameid span').remove();
                $('#MAC_NBRnameid').append('<input type="text" id="Num_Name" name="Num_Name" class="span6 m-wrap">');
                if (data.Status == 0) {
                    $("#Num_Name").kendoComboBox({
                        dataTextField: "Num_Name",
                        dataValueField: "Num_Name",
                        dataSource: data.Data,
                        change: btnExamine
                    }).data("Num_Name");
                    $(document.getElementById('elm1_ifr').contentWindow.document.body).html('');
                } else {
                    BzAlert(data.error);
                }
            },
            error: function() {
                console.error(lang.Common.Error);
                return false;
            }
        })
    }

    function btnExamine() {
        //调取富文本数据
        postReadData();
    }

    //删除重复
    Array.prototype.removeRepeatAttr = function() {
        var tmp = {},
            b = [],
            a = this;
        for (var i = 0; i < a.length; i++) {
            if (!tmp[a[i].text]) {
                b.push(a[i]);
                tmp[a[i].text] = !0;
            }
        };
        return b;
    }
    window.onload = function() {
        //调取客户数据
        $.ajax({
            url: '/TinyMCE/getClientName',
            type: 'GET',
            success: function(data) {
                var aaa = $("#MAC_NBRname").kendoComboBox({
                    dataTextField: "COMPANY_NAME",
                    dataValueField: "value",
                    dataSource: data.Data,
                    value: data.Data[0].COMPANY_NAME,
                    change: btnExamineGetNumName
                }).data("MAC_NBRname");
                btnExamineGetNumName();
                //调取富文本数据
                postReadData();
            },
            error: function() {
                console.error(lang.Common.Error);
                return false;
            }
        });
    }


    // $('#uploadImageForm').ajaxSubmit({
    //     dataType: 'json',
    //     success: function(response) {
    //         if (response.url) {
    //             var tpl = '<img src="%s" width="220" data-key="%k"/>';
    //             var tplV = tpl.replace('%s', response.url);
    //             tplV = tplV.replace('%k', response.key);
    //             ed.insertContent(tplV);
    //             ed.focus();
    //             removeForeground();
    //             removeBackground();
    //         } else {
    //             showImageUploadError('上传失败，请重试！');
    //         }
    //     },
    //     error: function() {
    //         showImageUploadError('上传失败，请重试！');
    //     }
    // });
})