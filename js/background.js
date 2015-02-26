'use strict';
/**
 * Created with JetBrains WebStorm.
 * User: xup
 * Date: 13-10-1
 * Time: 下午7:11
 * To change this template use File | Settings | File Templates.
 */

var timeline = new Array();
var emotions = new Array();
var orig_emotions = [];
var emotions_category = [];

var sinaApi = {};
sinaApi.access_token = localStorage.access_token;
sinaApi.uid = localStorage.uid;
sinaApi.config = {
    source: '3962237458',
    oauth_key: '3962237458',
    oauth_secret: 'bc289a46f3f0af639194383ac884d784',
    google_appkey: 'pnkacoeejlfoikeaiobjennblgpoaaao',
    oauth_callback: 'https://api.weibo.com/oauth2/default.html',
    host: 'https://api.weibo.com/2',
    get_uid: '/account/get_uid.json',
    user_show: '/users/show.json',
    home_timeline: '/statuses/home_timeline.json',
    comments_timeline: '/comments/timeline.json',
    mentions_timeline: '/statuses/mentions.json',
    get_comments: '/comments/show.json',
    post_comments: '/comments/create.json',
    repost_timeline: '/statuses/repost_timeline.json',
    friends: '/friendships/friends.json',
    favorites: '/favorites.json',
    emotions: '/emotions.json',
    repost: '/statuses/repost.json',
    update: '/statuses/update.json',
    upload: '/statuses/upload.json',
    revokeoauth2: '/oauth2/revokeoauth2',
    add_favorites: '/favorites/create.json',
    remove_favorites: '/favorites/destroy.json',
    reply: '/comments/reply.json',
    friendships_create: "/friendships/create.json",
    friendships_destroy: "/friendships/destroy.json"
};


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
var getUnreadCount = function () {
    var access_token = localStorage.access_token;
    var param = '?access_token=' + access_token + '&uid=' + uid + '&unread_message=1';
    var uid = localStorage.uid;
    $.getJSON("https://rm.api.weibo.com/2/remind/unread_count.json" + param,
        function (data) {
            localStorage.unreadTimeLineNum = data.status;
            localStorage.unreadCommentNum = data.cmt;
            localStorage.unreadAtNum = data.mention_status;
            if (data.status > 0) {
                chrome.browserAction.setBadgeText({text: '' + data.status});
            } else {
                chrome.browserAction.setBadgeText({text: ""});
            }
            //data = unescape(h[1]);
            if (!localStorage.unreadAtNum_local)
                localStorage.unreadAtNum_local = localStorage.unreadAtNum;
            if (localStorage.unreadAtNum_local != localStorage.unreadAtNum && localStorage.unreadAtNum != 0) {
                localStorage.unreadAtNum_local = localStorage.unreadAtNum
                var notification = webkitNotifications.createNotification(
                    'icon_48.png',  //
                    ' ',  //
                        '有' + localStorage.unreadAtNum + '条@你的信息'  //
                );
                notification.show();
            }
            if (!localStorage.unreadCommentNum)
                localStorage.unreadCommentNum_local = localStorage.unreadCommentNum;
            if (localStorage.unreadCommentNum_local != localStorage.unreadCommentNum && localStorage.unreadCommentNum != 0) {
                localStorage.unreadCommentNum_local = localStorage.unreadCommentNum
                var notification = webkitNotifications.createNotification(
                    'icon_48.png',  //
                    ' ',  //
                        '有' + localStorage.unreadCommentNum + '条新的评论'  //
                );
                notification.show();
            }

        });
};

$.getJSON("js/emotions.json", function (data) {
    for (var i in data) {
        if (data[i].category == "")
            data[i].category = '\u5e38\u7528';
        emotions[data[i].value + ""] = data[i].url;
        emotions_category[i] = data[i].category;

    }
    emotions_category = uniq(emotions_category);
    orig_emotions = data;
});

$.getJSON(sinaApi.config.host + sinaApi.config.emotions + '?access_token=' + localStorage.access_token,
    function (data) {
        var _emotions = new Array();
        for (var i in data) {
            if (data[i].category == "")
                data[i].category = "\u5e38\u7528";
            _emotions[data[i].value + ""] = data[i].url;
            emotions_category[i] = data[i].category;
        }
        emotions = _emotions;
        orig_emotions = data;
        emotions_category = uniq(emotions_category);
    });

localStorage.current_timeline_api = sinaApi.config.home_timeline;
localStorage.current_icon = "#home_btn";
setInterval(getUnreadCount, 5000);