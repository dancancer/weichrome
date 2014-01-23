'use strict';

/* Filters */
angular.module('myApp.filters', []).
    filter('interpolate', ['version', function (version) {
        return function (text) {
            return String(text).replace(/\%VERSION\%/mg, version);
        }
    }])
    .filter('mydate', ['$filter', function ($filter) {
        return function (text) {
            var _date = new Date(text);
            return $filter('date')(_date, 'yyyy-MM-dd HH:mm:ss');
        }
    }])
    .filter('square', function () {
        return function (text) {
            return text.replace('thumbnail', 'square')
        }
    })
    .filter('startFrom', function() {
        return function(input, start) {
            start = +start; //parse to int
            if(input)
                return input.slice(start);
        }
    })
    .filter('weibotxt', function () {
        return function (text) {
            var uniq = function (arr) {
                if (arr && arr.length >= 1) {
                    var a = [], o = {}, i, v, len = arr.length;
                    if (len < 2) {
                        return arr;
                    }
                    for (i = 0; i < len; i++) {
                        v = arr[i];
                        if (o[v] !== 1) {
                            a.push(v);
                            o[v] = 1;
                        }
                    }
                    return a;
                } else {
                    return a;
                }
            }
            if (text) {
                var atuser = new RegExp("(@[-|\\u303F-\\u9FFFA-Za-z0-9_]+)", "g");
                var onlyuser = new RegExp("@([\\u4E00-\\u9FA5A-Za-z0-9_]+)", "g")
                var list = uniq(text.match(atuser));
                //替换链接
                text = text.replace(/(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?/g, function (url) {
                    return "<a rclicka href=\"" + url + "\">" + url + "</a>";
                });
                //替换@
                for (var i in list) {
                    var s = "<a  href='http://weibo.com/n/" + list[i].substr(1, list[i].length) + "' rclicka  title='右键打开主页'>" + list[i] + "</a>";
                    var reg = new RegExp(list[i], "g")
                    text = text.replace(reg, s);
                }
                //替换话题
                text = text.replace(/\#([^\#|.]+)\#/g, function (word) {
                        var _s = word.substr(1, word.length - 2);
                        return "<a rclicka href=\"http://s.weibo.com/weibo/" + _s + "\">" + word + "</a>";
                    }
                );
                //替换表情
                var reg1 = /\[([^\[|.]+)\]/g;
                var emotions = chrome.extension.getBackgroundPage().emotions
                var emotionlist = uniq(text.match(reg1));
                for (var i in emotionlist) {
                    if (emotions[emotionlist[i]]) {
                        var url = "<img src='" + emotions[emotionlist[i]] + "'>";
                        var reg = new RegExp(emotionlist[i].replace("[", "\\[").replace("]", "\\]"), "g")
                        text = text.replace(reg, url);
                    }
                }
//                //替换emoji
//                for (var j = 0; j < emoji.length; j++) {
//                    // For block/background style
//                    // oldHtml = oldHtml.replace(emoji[j], '<span style="display: inline-block; background-image: url(img/' + to_hex(emoji[j]) + '.png); background-size: ' + size + 'px; height: ' + size + 'px; width: ' + size + 'px;"></span>');
//                    // For classic img style
//                    text = text.replace(emoji[j], '<img src="img/unicode/' + to_hex(emoji[j]) + '.png" height="' + 24 + '" width="' + 24 + '" />');
//                }

//                var $text = $('.emojstext');
//                var html = $text.html().trim().replace(/\n/g, '<br/>');
                text = jEmoji.softbankToUnified(text);
                text = jEmoji.googleToUnified(text);
                text = jEmoji.docomoToUnified(text);
                text = jEmoji.kddiToUnified(text);
                text = jEmoji.unifiedToHTML(text);

                return text;
            }
        }
    });
