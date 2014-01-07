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
var getUnreadCount =function(){
    var access_token = localStorage.access_token;
    var param = '?access_token='+access_token+'&uid='+uid+'&unread_message=1';
    var uid=localStorage.uid;
    $.getJSON("https://rm.api.weibo.com/2/remind/unread_count.json"+param,
        function(data){
            localStorage.unreadTimeLineNum = data.status;
            localStorage.unreadCommentNum = data.cmt;
            localStorage.unreadAtNum = data.mention_status;
            console.log(localStorage.unreadTimeLineNum);
            console.log(localStorage.unreadCommentNum);
            console.log(localStorage.unreadAtNum);
            if(data.status>0){
                chrome.browserAction.setBadgeText({text:''+data.status}) ;
            }else{
                chrome.browserAction.setBadgeText({text:""});
            }
        });
};

$.getJSON("js/emotions.json",function(data){
    for(var i in data){
            emotions[data[i].value+""] = data[i].url;;
    }
    });

$.getJSON(sinaApi.host+sinaApi.emotions+'?access_token='+localStorage.access_token,
    function(data){
        var _emotions = new Array();
        console.log(data);
        for(var i in data){
                _emojis[data[i].value+""] = data[i].url;
        }
        if(_emotions.length>0){
            emotions = _emotions;
        }
    });



setInterval(getUnreadCount, 5000);