(function($) {
    var ms = {
        init: function(totalsubpageTmep, args) {
            return (function() {
                ms.createAllElevent(totalsubpageTmep, args);
                ms.addEvent(totalsubpageTmep, args);
            })();
        },
        //生成所有元素
        createAllElevent: function(totalsubpageTmep, args) {
            var that = this;
            return (function() {
                //清空一下
                //          	that.clearAllBorder('body');
                let createEvents = `<div class='createEvents' style='border:2px dashed #000;cursor:move;padding:3px;position:absolute;display:inline-block'></div>`;
                totalsubpageTmep.wrap(createEvents);
                totalsubpageTmep.css({
                    position: 'static'
                })
                totalsubpageTmep.parent().css({
                    left: $(totalsubpageTmep).css('left'),
                    top: $(totalsubpageTmep).css('top')
                })
                totalsubpageTmep.parent().append(`<i class="icon-refresh" aria-hidden="true" style='position:absolute;left:50%;top:-5%;cursor:pointer'></i>`);
                totalsubpageTmep.parent().append(`<i class="icon-file" aria-hidden="true" style='position:absolute;left:100%;top:10%;cursor:pointer'></i>`);
                totalsubpageTmep.parent().append(`<i class="icon-remove" aria-hidden="true" style='position:absolute;left:100%;top:0%;cursor:pointer'></i>`);
                totalsubpageTmep.parent().append(`<i class="icon-exchange" aria-hidden="true" style='position:absolute;left:100%;top:96%;cursor:pointer;'></i>`);
                totalsubpageTmep.parent().append(`<span class='facilityTopState' style='position:absolute;font-family:${$('#lightFontFamily').val()};font-size:${$('#lightFontsIZE').val()}px;left:${Number($('#lightFontX').val())+20}px;top:${Number($('#lightFonty').val())+-20}px;color:${$('#lightFontColoe').val()};'>设备名</span>`);
                totalsubpageTmep.parent().append(`<Header class='facilityTopLight' style='position:absolute;left:${Number($('#lightX').val())}px;top:${Number($('#lightY').val())-$('#lightHeight').val()}px;width:${$('#lightWidth').val()}px;height:${$('#lightHeight').val()}px;border-radius:${$('#lightBorder').val()}px;background:#000;'></Header>`);
            })();
        },
        //生成第二个表
        addEvent: function(totalsubpageTmep, args) {
            var that = this;
            var oDiv = totalsubpageTmep.parent()[0],
                disX, disY;
            return (function() {
                let totalTransform = 0; //用来旋转  
                //旋转
                totalsubpageTmep.next().click(() => {
                    totalTransform -= 45;
                    if (totalTransform == -360) {
                        totalTransform = 0;
                    }
                    totalsubpageTmep.css({
                        'transform': 'rotate(' + totalTransform + 'deg)',
                    })
                });
                //复制
                totalsubpageTmep.next().next().click(() => {
                    let offsetLeft = ~~totalsubpageTmep.parent().offset().left;
                    let times = (new Date()).valueOf();
                    totalsubpageTmep.parent().before(totalsubpageTmep.clone().addClass('createEvents' + offsetLeft + times));
                    that.showBorder($(`.createEvents${offsetLeft}${times}`));
                });
                //删除
                totalsubpageTmep.next().next().next().click(() => {
                    totalsubpageTmep.parent().remove();
                });
                //放大
                totalsubpageTmep.next().next().next().next().mousedown(function(e) {
                    var e = e || window.event;
                    e.stopPropagation();
                    $('.rightvessel>div').hide();
                    $('.rightvessel>div').eq(0).show();
                    $('.rightvessel>div').eq(2).show();
                    $('.rightvessel>div').eq(4).show();
                    $('.rightvessel>div').eq(5).show();
                    disX = e.clientX - this.offsetLeft;
                    disY = e.clientY - this.offsetTop;
                    if ($('#lockCheckbox').attr('checked')) {
                        that.onmousemove(e, totalsubpageTmep[0], disX, disY, 'sizeAuto', totalsubpageTmep);
                    } else {
                        that.onmousemove(e, totalsubpageTmep[0], disX, disY, 'size', totalsubpageTmep);
                    }
                    document.onmouseup = that.onmouseup;
                });
                //移动
                totalsubpageTmep.mousedown(function(e) {
                    var e = e || window.event;
                    e.stopPropagation();
                    $('.rightvessel>div').hide();
                    $('.rightvessel>div').eq(0).show();
                    $('.rightvessel>div').eq(2).show();
                    $('.rightvessel>div').eq(4).show();
                    $('.rightvessel>div').eq(5).show();

                    $('.createEvents').attr('data-active', 'false');
                    $('.createEventsWire').attr('data-active', 'false');
                    totalsubpageTmep.parent().attr('data-active', 'true');
                    $('#bindFacility').val(totalsubpageTmep.parent().attr('data-name') == undefined ? '未绑定设备' : totalsubpageTmep.parent().attr('data-name'));
                    $('#input_MAC_NBRname').val('');
                    $('#coordinateX').val(~~totalsubpageTmep.parent().position().left);
                    $('#coordinateY').val(~~totalsubpageTmep.parent().position().top);
                    $('#coordinateWidth').val(~~totalsubpageTmep.parent().width());
                    $('#coordinateHeight').val(~~totalsubpageTmep.parent().height());
                    historyWidth = $('#coordinateWidth').val();
                    historyHeight = $('#coordinateHeight').val();
                    disX = e.clientX - oDiv.offsetLeft;
                    disY = e.clientY - oDiv.offsetTop;
                    that.onmousemove(e, oDiv, disX, disY, 'move', totalsubpageTmep);
                    document.onmouseup = that.onmouseup;
                })
            })()
        },

        onmousemove: function(e, oDiv, disX, disY, type, totalsubpageTmep) {
            document.onmousemove = function(e) {
                if (type == 'move') {
                    e.preventDefault();
                    var l = e.clientX - disX,
                        t = e.clientY - disY;
                    oDiv.style.left = l + 'px';
                    oDiv.style.top = t + 'px';
                    $('#coordinateX').val(~~totalsubpageTmep.parent().position().left)
                    $('#coordinateY').val(~~totalsubpageTmep.parent().position().top)
                } else if (type == 'size') {
                    e.preventDefault();
                    var l = e.clientX - disX,
                        t = e.clientY - disY;
                    oDiv.style.width = l + 'px';
                    oDiv.style.height = t + 'px';
                    $('#coordinateWidth').val(~~totalsubpageTmep.parent().width())
                    $('#coordinateHeight').val(~~totalsubpageTmep.parent().height())
                } else {
                    //锁定纵横比
                    e.preventDefault();
                    var l = e.clientX - disX,
                        t = e.clientY - disY;
                    oDiv.style.width = l + 'px';
                    oDiv.style.height = 'auto';
                    $('#coordinateWidth').val(~~totalsubpageTmep.parent().width())
                    $('#coordinateHeight').val(~~totalsubpageTmep.parent().height())
                    historyWidth = $('#coordinateWidth').val();
                    historyHeight = $('#coordinateHeight').val();
                }
            }
        },
        onmouseup: function() {
            document.onmousemove = null;
            document.onmouseup = null;
        },
        clearAllBorder: function(father, args) {
            for (let i = 0; i < $(`${father}>div.createEvents`).length; i++) {
                let offsetLeft = $(`${father}>div.createEvents`).eq(i).css('left');
                let offsetTop = $(`${father}>div.createEvents`).eq(i).css('top');
                let imgWidth = $(`${father}>div.createEvents`).eq(i).children('img').width();
                let imgheight = $(`${father}>div.createEvents`).eq(i).children('img').height();
                let imgtransform = $(`${father}>div.createEvents`).eq(i).children('img').css('transform');
                let imgSrc = $(`${father}>div.createEvents`).eq(i).children('img').attr('src');
                $(`${father}>div.createEvents`).eq(i).remove();
                $(`${father}`).append(`<img style='position:absolute;left:${parseInt(offsetLeft)+6}px;top:${parseInt(offsetTop)+6}px;width:${imgWidth}px;height:${imgheight}px;transform:${imgtransform}'src='${imgSrc}' />`);
            }
        },
        showBorder: function(show) {
            show.control();
            show.parent().css({
                'left': 20 + 'px',
                'top': 20 + 'px',
            });
        }
    }
    $.fn.control = function(options) {
        ms.init(this, options);
    }
})(jQuery);