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
                let createEventsWire = `<div class='createEventsWire' style='cursor:move;position:absolute;display:inline-block;color:${$('#addwireColorSelect').val()};background:${$('#addwireBackgroundSelect').val()};font-size:${$('#addwireSizeSelect').val()};'></div>`;
                totalsubpageTmep.wrap(createEventsWire);
                totalsubpageTmep.css({
                    'position': 'static',
                    'text-align': 'center',
                    'width': `${$('#borderSize>div').eq($('#linesNumber').val()-1).width()-10}px`
                })
                totalsubpageTmep.parent().css({
                    left: $(totalsubpageTmep).css('left'),
                    top: $(totalsubpageTmep).css('top')
                })
                totalsubpageTmep.parent().append(`<i class="icon-file" aria-hidden="true" style='position:absolute;left:100%;top:10%;cursor:pointer;display:none'></i>`);
                totalsubpageTmep.parent().append(`<i class="icon-remove" aria-hidden="true" style='position:absolute;left:100%;top:0%;cursor:pointer'></i>`);
                totalsubpageTmep.parent().append(`<i class="icon-exchange" aria-hidden="true" style='position:absolute;left:100%;top:96%;cursor:pointer'></i>`);
            })();
        },
        // 添加事件
        addEvent: function(totalsubpageTmep, args) {
            var that = this;
            var oDiv = totalsubpageTmep.parent()[0],
                disX, disY;
            return (function() {
                //复制
                totalsubpageTmep.next().click(() => {
                        let offsetLeft = ~~totalsubpageTmep.parent().offset().left;
                        let times = (new Date()).valueOf();
                        totalsubpageTmep.parent().before(totalsubpageTmep.clone().addClass('createEvents' + offsetLeft + times));
                        that.showBorder($(`.createEvents${offsetLeft}${times}`));
                    })
                    //删除
                totalsubpageTmep.next().next().click(() => {
                        totalsubpageTmep.parent().remove();
                    })
                    //放大
                totalsubpageTmep.next().next().next().mousedown(function(e) {
                        var e = e || window.event;
                        e.stopPropagation();
                        $('.rightvessel>div').hide();
                        $('.rightvessel>div').eq(0).show();
                        $('.rightvessel>div').eq(2).show();
                        disX = e.clientX - this.offsetLeft;
                        disY = e.clientY - this.offsetTop;
                        that.onmousemove(e, totalsubpageTmep[0], disX, disY, 'size', totalsubpageTmep);
                        document.onmouseup = that.onmouseup;
                    })
                    //移动
                totalsubpageTmep.mousedown(function(e) {
                        var e = e || window.event;
                        e.stopPropagation();
                        $('.rightvessel>div').hide();
                        $('.rightvessel>div').eq(0).show();
                        $('.rightvessel>div').eq(2).show();

                        $('.createEvents').attr('data-active', 'false');
                        $('.createEventsWire').attr('data-active', 'false');
                        totalsubpageTmep.parent().attr('data-active', 'true');

                        $('#input_MAC_NBRname').val('');
                        $('#coordinateX').val(~~totalsubpageTmep.parent().position().left);
                        $('#coordinateY').val(~~totalsubpageTmep.parent().position().top);
                        $('#coordinateWidth').val(~~totalsubpageTmep.parent().width());
                        $('#coordinateHeight').val(~~totalsubpageTmep.parent().height());
                        disX = e.clientX - oDiv.offsetLeft;
                        disY = e.clientY - oDiv.offsetTop;
                        that.onmousemove(e, oDiv, disX, disY, 'move', totalsubpageTmep);
                        document.onmouseup = that.onmouseup;
                    })
                    //双击
                totalsubpageTmep.dblclick(function(e) {
                    $(this).focus();
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
                } else {
                    // console.log(oDiv.parentNode)
                    e.preventDefault();
                    var l = e.clientX - disX,
                        t = e.clientY - disY;
                    oDiv.style.width = l + 'px';
                    oDiv.style.height = t + 'px';
                    oDiv.style.lineHeight = t + 'px';
                }
            }
        },
        onmouseup: function(event) {
            // $(this).clone(true).insertAfter(this); 
            if($(event.target.offsetParent).hasClass('createEventsWire')){
                // 拿到这个div距离左边的距离
                let distance = event.clientX - $('#borderSize>div').offset().left - (event.clientX - Number($(event.target.offsetParent).css('left').split('px')[0]));

                // 为了防止每个元素的宽不一样  通过算法动态算出
                let widthNumGather = 0;
                let distanceNum = 0;
                for(distanceNum = 0; distanceNum <$('#borderSize>div').length; distanceNum++ ){
                    widthNumGather += $($('#borderSize>div')[distanceNum]).width();
                    if(widthNumGather >= distance){
                        break;
                    }
                }
                // let distanceNum = Math.ceil(distance/ $('#borderSize>div').width());
                
                // distanceNum默认从1开始 所以+1
                distanceNum += 1;
                let str = $(event.target.offsetParent).find('span').html();
                str = str.replace(/[0-9]/ig,distanceNum);
                $(event.target.offsetParent).find('div').attr('data-lineval',distanceNum);
                $(event.target.offsetParent).find('span').html(str);
                // $('#borderSize>div')[distanceNum-1].append($(event.target.offsetParent).clone().addClass('createEvents' + distance + distanceNum)[0])
                // $(`.createEvents${distance}${distanceNum}`).wireContorl();
                // $(event.target.offsetParent).remove();
            }
            document.onmousemove = null;
            document.onmouseup = null;
        },
        showBorder: function(show) {
            show.wireContorl();
            show.parent().css({
                'left': 20 + 'px',
                'top': 20 + 'px',
            });
        }
    }
    $.fn.wireContorl = function(options) {
        ms.init(this, options);
    }
})(jQuery);