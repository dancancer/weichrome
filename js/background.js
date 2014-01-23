'use strict';
/**
 * Created with JetBrains WebStorm.
 * User: xup
 * Date: 13-10-1
 * Time: 下午7:11
 * To change this template use File | Settings | File Templates.
 */

var timeline = new Array();
var emotions= new Array();
var orig_emotions = [];
var emotions_category = [];
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
var getUnreadCount =function(){
    var access_token = localStorage.access_token;
    var param = '?access_token='+access_token+'&uid='+uid+'&unread_message=1';
    var uid=localStorage.uid;
    $.getJSON("https://rm.api.weibo.com/2/remind/unread_count.json"+param,
        function(data){
            localStorage.unreadTimeLineNum = data.status;
            localStorage.unreadCommentNum = data.cmt;
            localStorage.unreadAtNum = data.mention_status;
            if(data.status>0){
                chrome.browserAction.setBadgeText({text:''+data.status}) ;
            }else{
                chrome.browserAction.setBadgeText({text:""});
            }
        });
};

$.getJSON("js/emotions.json",function(data){
    for(var i in data){
            if(data[i].category=="")
                data[i].category = '\u5e38\u7528';
            emotions[data[i].value+""] = data[i].url;
            emotions_category[i] = data[i].category;

    }
    emotions_category = uniq(emotions_category);
    orig_emotions = data;
    console.log(emotions_category);
    });

$.getJSON(sinaApi.config.host+sinaApi.config.emotions+'?access_token='+localStorage.access_token,
    function(data){
        var _emotions = new Array();
        for(var i in data){
            if(data[i].category=="")
                data[i].category = "\u5e38\u7528";
            _emotions[data[i].value+""] = data[i].url;
            emotions_category[i] = data[i].category;


        }
        if(_emotions.length>0){
            emotions = _emotions;
        }
        orig_emotions = data;
        emotions_category = uniq(emotions_category);
        console.log("\u5e38\u7528");
        console.log(emotions_category);
    });


localStorage.current_timeline_api = sinaApi.config.home_timeline;
localStorage.current_icon = "#home_btn";
setInterval(getUnreadCount, 5000);