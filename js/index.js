var $ = require('../../../h5che/src/libs/vendor/zepto/zepto'),
    dom = require('../../../h5che/src/libs/common/js/dom'),
    store = require('../../../h5che/src/libs/common/js/storage');


/**
 * 图片预加载
 */
$("img[data-src]").each(function() {
    var $this = $(this);
    var src = $this.data('src');
    dom.preImage(src, function() {
        $this.attr('src', src);
    });
});
var loadImages = [
    'img/qrcode.png',
    'img/share.jpg'
];
dom.preImage(loadImages);


/**
 * 不包含max
 */
function random(max) {
    return Math.floor(Math.random() * max);
}
var cache = {
    name: 'ROAD_NAME',
    set: function(key, value) {
        var current = this.get() || {};
        current[key] = value;
        store.set(this.name, current);
    },
    get: function(key) {
        var current = store.get(this.name);
        if(key)
            return current[key];
        return current;
    }
};

var ticket = {
    1: [
        '%s已大杀特杀，找个妹子来教你',
        '马路逗比，找个妹子来教你',
        '%s已双杀，找个妹子来教你',
        '手刹哥，找个妹子来教你',
        '%s已疯狂杀戮，找个妹子来教你'
    ],
    2: [
        '妹子是个超级马路杀手，还不学车',
        '捞到路霸一枚，还不学车',
        '刹车天后，还不学车.'
    ]
};

/**
 * canvas命令
 */
var CanvasCommand = (function() {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = 520;
    canvas.height = 500;

    var $compose = $('#compose');

    var Action = {
        fillText: function(font) {
            var canvas2 = document.createElement('canvas');
            var sizes = [], width=0;
            $.each(font, function(key, value) {
                sizes.push(value['size']);
                width += value['size'] * value['txt'].length + 5;
            });
            canvas2.width = width - 5;//画布宽度
            var max = Math.max.apply(this, sizes);

            canvas2.height = max * 1.5;//画布高度
            var ctx2 = canvas2.getContext('2d');
            ctx2.fillStyle = "#ffed03";
            ctx2.fillRect(0, 0, canvas2.width, canvas2.height);
            var x = 0;
            $.each(font, function(key, value) {
                ctx2.font = (value['bold'] || '')+" "+value['size']+"px serif";
                ctx2.fillStyle = "black";
                ctx2.fillText(value['txt'], x, max);
                x += value['size'] * value['txt'].length + 5;
            });

            return canvas2;
        },
        fillImage: function(num, txts) {
            var qrcode = new Image();
            qrcode.src = 'img/qrcode.png';
            qrcode.onload = function() {
                var image = new Image();
                image.src = 'img/story/'+num+'.png';
                image.onload = function() {
                    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
                    ctx.drawImage(qrcode, 20, 400, 80, 80);
                    $.each(txts, function(key, value) {
                        ctx.drawImage(value, value.left, value.top, value.width, value.height);
                    });
                    var base64 = canvas.toDataURL("image/jpeg", 0.6);
                    $compose.attr('src', base64);
                };
            };
        }
    };
    return {
        /**
         * 命令格式 command,params
         * @param param
         */
        execute: function(param) {
            return Action[param.command].apply(Action, param.params);//执行命令
        }
    }
})();

var stories = [];
function setStory(name) {
    stories = [
        [
            {
                top:142, font: [
                    {size: 44, txt:name, bold:'bold'},
                    {size: 32, txt:'考到驾照后'}
                ]
            }
        ]
    ];
}

Zepto(function() {
    var $btnCreate = $('#btnCreate');
    //生成昵称和姓名
    $btnCreate.on('click', function() {
        var name = $('#name').val();
        var sex = $('[name=sex]').not(function(){return !this.checked;}).val();
        if(name.length == 0) {
            setTimeout(function() {
                alert('请输入主角名字')
            }, 100);
            return;
        }
        var msg = ticket[sex][random(sex == 1 ? 5 : 3)];
        msg = msg.replace(/(%s)+/, name);
        cache.set('name', name);//缓存
        cache.set('msg', msg);
        cache.set('random', true);
        location.href = 'create.html';//跳转
    });


    if($btnCreate.length > 0) {
        return;
    }

    //制作语录
    var current = 0;
    var name = cache.get('name');
    setStory(name);//故事
    $('#txt').html(cache.get('msg') + '<i class="ui-icon-down"></i>');

    stories[current].push({align:'right', top:420, font:[{size:20, txt:'—— '+name+' de 故事', bold:'bold'}]});
    var currentStories = stories[current];

    var txts = [];
    $.each(currentStories, function(key, value) {
        var txt = CanvasCommand.execute({
            command:'fillText',
            params:[value['font']]
        });
        if(value.align == 'right') {
            txt.left = (550 - txt.width);
        }else {
            //居中效果
            txt.left = (520 - txt.width)/2;
        }

        txt.top = value['top'];
        txts.push(txt);
    });
    CanvasCommand.execute({command:'fillImage', params:[current+1, txts]});
});