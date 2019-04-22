(function($) {
    function slider(options) {
        this.opts = $.extend({}, slider.defaluts, options);
        this._imgSlider();
    }
      //设置默认值
      slider.defaluts = {
        imgElement: null,
        liElement: null,
        leftBtn: null,
        rightBtn: null,
        time: 2000,
        activeClass: '',
        flex: false
    }
    slider.prototype._imgSlider = function() {
        var opts = this.opts,
            index = 0,
            len = opts.imgElement.length;
        if (opts.imgElement == '') return;
        if (opts.flex) {
            opts.imgElement.eq(0)[0].style.display = 'flex';
        } else {
            opts.imgElement.eq(0).show();
        }
        showTime();
        //当鼠标经过 轮播停止，移开继续
        opts.imgElement.hover(function() {
            // clearInterval(timeInter);
        }, function() {
            // showTime();
        });

        //点击li 显示对应的图片
        opts.liElement.click(function() {
            var id = $(this).index();
            show(id);
        });
        if (!opts.activeLiShow) {
            $(opts.imgElement).prev()[0].style.display = 'none';
        }

        function showTime() {
            lh_dataAll.timeInter = setInterval(function() {
                index++;
                if (index > len) {
                    index = 0;
                }
                show(index);
            }, opts.time);
        }

        function show(index) {
            if (opts.flex) {
                //防止没有这个元素时报错
                if (opts.imgElement.eq(index)[0]) {
                    opts.imgElement.eq(index)[0].style.display = 'flex';
                }
                opts.imgElement.eq(index).siblings('div').fadeOut(0);
            } else {
                opts.imgElement.eq(index).fadeIn(0).siblings('div').fadeOut(0);
            }
            opts.liElement.eq(index).addClass(opts.activeClass).siblings('li').removeClass(opts.activeClass);
        }
    }
    $.extend({
        slider: function(options) {
            new slider(options);
        }
    })
})(jQuery)