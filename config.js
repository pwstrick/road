var path = require('path');
module.exports = {
    //宏定义
    macro: {
        '__VERSION': Date.now().toString(16)
    },
    //CSS相关设置
    css: {
        rem: 64 //rem计算基值
    },
    //server相关设置
    server: {
        release: './', //发布目录
        port: 8047 //端口
    },
    //HTML相关
    html: {
        collapseWhitespace: true
    },
    //webpack打包
    webpack: {
        entry: {
            index : './js/index.js'
        },
        output: {
            filename: '[name].bundle.js',
        }
    }
    //vue: {
    //    html: {
    //        root: path.resolve(__dirname)
    //    }
    //}
};