'use strict';
/* Controllers */
angular.module('myApp.controllers', [])
  .controller('optionCtrl',['$scope','$http',function($scope,$http) {
        $scope.appid = "";
        $scope.access_token = localStorage.access_token;
        $scope.uid=localStorage.uid;
        $scope.oAuthPath = "";
        $scope.user=[];
        $scope.maxid=null;
        $scope.isloading = false;
        $scope.timeline = new Array();

        $scope.authorize = function(){
            chrome.extension.getBackgroundPage().timeline = [];
            chrome.extension.getBackgroundPage().scrollTop = 0;
            chrome.extension.getBackgroundPage().maxid = null;
            localStorage.access_token = null;
            localStorage.uid = null;
            $scope.oAuthPath = 'https://api.weibo.com/oauth2/authorize?client_id='+sinaApi.config.oauth_key+'&redirect_uri=https://api.weibo.com/oauth2/default.html&response_type=code';

            window.open($scope.oAuthPath);
        };
        $scope.revokeoauth2 = function(){
            var param = '?access_token='+$scope.access_token;
            $http({method:'GET', url: sinaApi.config.host+sinaApi.config.revokeoauth2+param}).
                success(function(data, status) {
                    localStorage.access_token = "";
                    localStorage.uid = "";
                    $scope.user = [];
                    chrome.extension.getBackgroundPage().timeline = [];
                    chrome.extension.getBackgroundPage().scrollTop = 0;
                    chrome.extension.getBackgroundPage().maxid = null;
                }).
                error(function(data, status) {
                });
        };
        chrome.tabs.onUpdated.addListener(
            function (tabId, changeInfo, tab) {
                if (changeInfo.status === 'loading' && tab.url.indexOf(sinaApi.config.oauth_callback + '?code=') === 0 ) {
                    var pin = tab.url;
                    if (pin.indexOf('=') > 0) {
                        pin = pin.substring(pin.indexOf('=')+1);
                    }
                    $scope.$apply($scope.appid = pin);;
                    chrome.tabs.remove(tabId);
                    $scope.gettoken();
                }
            }
        );
        $scope.gettoken = function(){
            var param = '&code='+$scope.appid;
            var path = 'https://api.weibo.com/oauth2/access_token?client_id='+sinaApi.config.oauth_key+
                '&client_secret='+sinaApi.config.oauth_secret+
                '&grant_type=authorization_code&redirect_uri=https://api.weibo.com/oauth2/default.html';
            $http({method:'POST',url: path+param}).
                success(function(data, status) {
                    console.log(data);
                    $scope.$apply($scope.access_token = data.access_token);
                    $scope.$apply($scope.uid = data.uid);
                    localStorage.access_token = data.access_token;
                    localStorage.uid = data.uid;
                    $scope.getuserinfo();
                }).
                error(function(data, status) {
                    $scope.data = data || "Request failed";
                    $scope.status = status;
                });
        };
        $scope.getuserinfo = function(uid){
            var param = '?access_token='+$scope.access_token+'&uid='+$scope.uid;
            $http({method:'GET', url: sinaApi.config.host+sinaApi.config.user_show+param}).
                success(function(data, status) {
                    $scope.user = [];
                    $scope.user.push(data);
                    localStorage.user = JSON.stringify($scope.user);
                }).
                error(function(data, status) {
                    $scope.data = data || "Request failed";
                    $scope.status = status;
                });
        };
        if($scope.access_token!=undefined&$scope.uid!=undefined){
            $scope.getuserinfo($scope.uid);
        }
  }])
  .controller('weiboCtrl', ['$scope','$http',function($scope,$http) {
        $scope.api = sinaApi.config;
        $scope.currentuser = JSON.parse(localStorage.user);
        $scope.unreadTimeLineNum = 0;
        $scope.unreadCommentNum = 0;
        $scope.unreadAtNum = 0;
        $scope.appid = "";
        $scope.access_token = localStorage.access_token;
        $scope.uid=localStorage.uid;
        $scope.oAuthPath = "";
        $scope.user=[];
        $scope.maxid=null;
        $scope.isloading = false;
        $scope.isAuth = true;
        $scope.timeline = new Array();
        $scope.loading = false;
        $scope.chk_also_comment = false;
        $scope.chk_also_comment_orig = false;
        $scope.chk_also_repost = false;

        $scope.gotoOption = function(){
            chrome.extension.getOptions
            chrome.tabs.create({"url":"chrome-extension://pnkacoeejlfoikeaiobjennblgpoaaao/option.html","selected":true}, function(tab){
            });
        }

        $scope.getuserinfo = function(uid){
            var param = '?access_token='+$scope.access_token+'&uid='+$scope.uid;
            $http({method:'GET', url: sinaApi.config.host+sinaApi.config.user_show+param}).
              success(function(data, status) {
                $scope.user = [];
                $scope.user.push(data);
                $scope.isAuth = true;
              }).
              error(function(data, status) {
                $scope.isAuth = false;
                $scope.data = data || "Request failed";
                $scope.status = status;
            });
        };

        $scope.get_home_timeline = function(type,api){
            var param = '?access_token='+$scope.access_token;
            if($scope.maxid!=null){
                param = param+"&max_id="+$scope.maxid;
            }
            $scope.loading = true;
            if(!api)
                api = localStorage.current_timeline_api;
            $scope.current_timeline_api = api;
            $http({method:'GET', url: sinaApi.config.host+api+param}).
                success(function(data, status) {
                    if(api==sinaApi.config.favorites){
                        data.statuses = [];
                        for(var i in data.favorites){
                            data.statuses[i] =  data.favorites[i].status;
                        }
                    }
                    if(api==sinaApi.config.comments_timeline){
                        for(var i in data.comments){
                            data.comments[i].retweeted_status = data.comments[i].status;

                        }
                        data.statuses =  data.comments;
                    }
                    if(data.statuses.length>1){
                        data.statuses.shift();
                        //区分获取最新和向下刷新
                        if(type=='refresh'){
                            $scope.timeline = data.statuses;
                            $("#warp").animate({'scrollTop':0},300);
                        }else{
                              $scope.timeline = $scope.timeline.concat(data.statuses);
                        }
                        $scope.maxid = data.statuses[data.statuses.length-1].id;
                        chrome.extension.getBackgroundPage().timeline = $scope.timeline;
						chrome.extension.getBackgroundPage().scrollTop = 0;
                        chrome.extension.getBackgroundPage().maxid = $scope.maxid;
                    }
                    $scope.loading = false;
                    $scope.unreadTimeLineNum = 0;
                    localStorage.unreadTimeLineNum = 0;
                }).
                error(function(data, status) {
                    $scope.data = data || "Request failed";
                    $scope.status = status;
                    $scope.loading = false;
                });

        };
        $scope.get_comments = function(item,type){
            var requestStr = sinaApi.config.get_comments;
            if(item.comment_type == "Repost"){
                requestStr = sinaApi.config.repost_timeline;
            }
            if(type=='pre'){
                item.comments_page = item.comments_pre_page;
            }else if(type=="next"){
                item.comments_page = item.comments_next_page;
            }
            var param = '?access_token='+$scope.access_token+"&id="+item.id+"&page="+item.comments_page+"&count=8";
            var url = sinaApi.config.host+requestStr+param;
            $scope.loading = true;
            $http({method:'GET', url: url}).
                success(function(data, status) {
                    $scope.loading = false;
                    if(item.comment_type=="Repost"){
                        if(data.reposts.length>0){
                            item.comments = data.reposts;
                        }
                    }else{
                        if(data.comments.length>0){
                            item.comments = data.comments;
                        }
                    }
                    item.comments_pre_page = item.comments_next_page;
                    if(data.next_cursor!=0){
                        item.comments_next_page = item.comments_page+1;
                    }else{
                        item.comments_next_page = 0;
                    }
                    if(data.previous_cursor!=0){
                        item.comments_pre_page = item.comments_page-1;
                    }else{
                        item.comments_pre_page = 0
                    }

                }).
                error(function(data, status) {
                    $scope.loading = false;
                    $scope.data = data || "Request failed";
                    $scope.status = status;
                });
        };

        $("#warp").scroll(function() {
            var nDivHight = $("#warp").height();
            var nScrollHight = $(this)[0].scrollHeight;
            var nScrollTop = $(this)[0].scrollTop;
            if(nScrollTop + nDivHight >= nScrollHight&&$scope.loading == false){
                console.log("loadnewdata");
                $scope.get_home_timeline();
            }

			chrome.extension.getBackgroundPage().scrollTop = nScrollTop;

        });
        $scope.commentbox ={};
        $scope.currentPage = 0;
        $scope.pageSize = 5;
        $scope.categoryChange = function(_category){
            $scope.current_category = {category:_category};
        }

        $scope.showCommentText = function(item,type,$event){
            $scope.emotions = chrome.extension.getBackgroundPage().orig_emotions;
            $scope.emotions_category = chrome.extension.getBackgroundPage().emotions_category;
            $scope.current_category = {category:$scope.emotions_category[0]};
            $scope.commentbox.pic = null;
            $('#comment_text_div').fadeIn();
            if(item)
                $scope.commentbox.id = item.id
            $scope.commentbox.type = type;
            if(type=="repost"&&item.retweeted_status){
                $scope.commentbox.comment_txt = '转发微博//@'+item.user.name+":"+item.text;
                $scope.commentbox.button_txt = "转发";
            }else{
                $scope.commentbox.comment_txt ="";
                $scope.commentbox.button_txt = "评论";
            }
            if(type=="create"){
                $scope.commentbox.comment_txt ="";
                $scope.commentbox.button_txt = "发送";
            }
        };

        $scope.hideCommentText = function(){
            $scope.commentbox.pic = null;
            $("#showEmotionsBtn").popover('hide');
            $scope.chk_also_repost = false;
            $scope.chk_also_comment = false;
            $scope.chk_also_comment_orig = false;
            $('#comment_text_div').fadeOut();
        };

        $scope.showComments = function(item,$index){
            if(item.comment_type!="Comment"){
                $("#commentsdiv"+$index).collapse('show');
                item.comment_type = "Comment";
                item.comments_page=1;
                $scope.get_comments(item);
            }else
            {
                $("#commentsdiv"+$index).collapse('toggle');
            }
        };

        $scope.showReComments = function(item,$index){
            if(item.comment_type!="Comment"){
                $("#recommentsdiv"+$index).collapse('show');
                item.comment_type = "Comment";
                item.comments_page=1;
                $scope.get_comments(item);
            }else
            {
                $("#recommentsdiv"+$index).collapse('toggle');
            }
        };

        $scope.showRepost = function(item,$index){
            if(item.comment_type!="Repost"){
                $("#commentsdiv"+$index).collapse('show');
                item.comment_type = "Repost";
                item.comments_page=1;
                $scope.get_comments(item);
            }else
            {
                $("#commentsdiv"+$index).collapse('toggle');
            }
        };

        $scope.showReRepost = function(item,$index){
            if(item.comment_type!="Repost"){
                $("#recommentsdiv"+$index).collapse('show');
                item.comment_type = "Repost";
                item.comments_page=1;
                $scope.get_comments(item);
            }else
            {
                $("#recommentsdiv"+$index).collapse('toggle');
            }
        };

        $scope.create = function(){
            if($scope.commentbox.pic){
                $scope.upload();
                return;
            }
            debugger;
            var api = sinaApi.config.update;
            var _data = 'status='+encodeURI($scope.commentbox.comment_txt)+
                '&access_token='+$scope.access_token;
            var _header = {'Content-Type': 'application/x-www-form-urlencoded'}
            $http({
                method:'POST',
                url: sinaApi.config.host+api,
                data:_data,
                dataType:'text',
                headers:_header
            }).
                success(function(data, status) {
                    console.log(data);
                    Example.show("发送成功")
                    $scope.commentbox.comment_txt = "";
                    $scope.hideCommentText()
                    $scope.chk_also_repost= false;
                    $scope.chk_also_comment = false;
                    $scope.chk_also_comment_orig = false;
                }).
                error(function(data, status) {
                    console.log(data);
                    Example.show("发送失败")
                });
        }

        $scope.upload = function(){
            var _data = bulidUploadParam($scope.commentbox.pic,{
                'status':encodeURI($scope.commentbox.comment_txt),
                'access_token':$scope.access_token
            });
            var api = sinaApi.config.upload;
            var _header = {'Content-Type': 'multipart/form-data; boundary='+_data.boundary}

            $.ajax({
                    url : sinaApi.config.host+api,
                    cache : false,
                    timeout : 5 * 60 * 1000,
                    type : 'post',
                    data : _data.blob,
                    dataType : 'text',
                    contentType : 'multipart/form-data; boundary=' + _data.boundary,
                    processData : false,
                    beforeSend : function(req) {
                        for ( var k in _data.auth_args.headers) {
                            req.setRequestHeader(k, _data.auth_args.headers[k]);
                        }
                    },
                    success : function(data, textStatus, xhr) {
                        console.log(data);
                        Example.show("发送成功")
                        $scope.commentbox.comment_txt = "";
                        $scope.hideCommentText()
                        $scope.chk_also_repost= false;
                        $scope.chk_also_comment = false;
                        $scope.chk_also_comment_orig = false;
                    },
                    error : function(xhr, textStatus, errorThrown) {
                        console.log(data);
                        Example.show("发送失败")                    }
                });
        }

        $scope.comment = function(){
            var api = sinaApi.config.post_comments;
            var _data = 'comment='+encodeURI($scope.commentbox.comment_txt)+
                '&id='+$scope.commentbox.id+'&access_token='+$scope.access_token;
            if($scope.commentbox.type=='create'){
                $scope.create();
                return;
            }
            if ($scope.commentbox.type=='repost'){
                api = sinaApi.config.repost;
                var is_comment = 0;
                if($scope.chk_also_comment)
                    is_comment = 1;
                if($scope.chk_also_comment_orig)
                    is_comment = 2;
                if($scope.chk_also_comment&$scope.chk_also_comment_orig)
                    is_comment = 3;
                _data = 'status='+encodeURI($scope.commentbox.comment_txt)+
                    '&is_comment='+is_comment+'&id='+$scope.commentbox.id+'&access_token='+$scope.access_token;
            }else{
                if($scope.chk_also_repost){
                    api = sinaApi.config.repost;
                    _data = 'status='+encodeURI($scope.commentbox.comment_txt)+
                        '&is_comment=1&id='+$scope.commentbox.id+'&access_token='+$scope.access_token;
                }

            }
            $http({
                method:'POST',
                url: sinaApi.config.host+api,
                data:_data,
                headers:{'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function(data, status) {
                    console.log(data);
                    Example.show("发送成功")
                    $scope.commentbox.comment_txt = "";
                    $scope.hideCommentText()
                    $scope.chk_also_repost= false;
                    $scope.chk_also_comment = false;
                    $scope.chk_also_comment_orig = false;
                }).
                error(function(data, status) {
                    console.log(data);
                    Example.show("发送失败")
                });
        };

        $scope.favorite = function(item){
            var api = sinaApi.config.add_favorites;
            var _data = '&id='+item.id+'&access_token='+$scope.access_token;
            if(item.favorited)
                api = sinaApi.config.remove_favorites;
            $http({
                method:'POST',
                url: sinaApi.config.host+api,
                data:_data,
                headers:{'Content-Type': 'application/x-www-form-urlencoded'}
            }).
                success(function(data, status) {
                    console.log(data);
                    item.favorited = data.status.favorited;
                    if(item.favorited)
                        Example.show("收藏成功")
                    else
                        Example.show("移除收藏成功")
                    chrome.extension.getBackgroundPage().timeline = $scope.timeline;
                }).
                error(function(data, status) {
                    console.log(data);
                    Example.show("操作失败")
                });
        }

        $scope.refresh = function(){
            $("li.active").removeClass("active");
            $("#home_btn").addClass("active");
            localStorage.current_icon = "#home_btn";
            localStorage.current_timeline_api = sinaApi.config.home_timeline;
            $scope.maxid = null;
            $scope.get_home_timeline('refresh',sinaApi.config.home_timeline);
        };

        $scope.loadComment = function(){
            $("li.active").removeClass("active");
            $("#comment_btn").addClass("active");
            localStorage.current_icon = "#comment_btn";
            localStorage.current_timeline_api = sinaApi.config.comments_timeline;
            $scope.maxid = null;
            $scope.get_home_timeline('refresh',sinaApi.config.comments_timeline);
        };

        $scope.loadAt = function(){
            $("li.active").removeClass("active");
            $("#at_btn").addClass("active");
            localStorage.current_icon = "#at_btn";
            localStorage.current_timeline_api = sinaApi.config.mentions_timeline;
            $scope.maxid = null;
            $scope.get_home_timeline('refresh',sinaApi.config.mentions_timeline);
        };

        $scope.loadFavorites = function(){
            $("li.active").removeClass("active");
            $("#favorite_btn").addClass("active");
            localStorage.current_icon = "#favorite_btn";
            $scope.maxid = null;
            $scope.get_home_timeline('refresh',sinaApi.config.favorites);
        };


        $scope.atList = [];
        $scope.loadFriends = function(cursor){
            var param = '?access_token='+$scope.access_token+"&uid="+$scope.uid+"&count=200&cursor="+cursor;
            var url = sinaApi.config.host+sinaApi.config.friends+param;
            $http({method:'GET', url: url}).
                success(function(data, status) {
                    if(data.next_cursor!=0){
                        $scope.loadFriends(data.next_cursor);
                    }
                    $.each(data.users,function(i,n){
                        $scope.atList[$scope.atList.length] = {name:n.name,screen_name:n.screen_name}
                    })
                }).
                error(function(data, status) {
                });
        };

        $scope.loadFriends(0);

        $scope.hideinfo = function(){
            $("#infodiv").hide();
        };

        $scope.addItem2Editor = function(item){

        };

        $scope.handleFileSelect = function(evt) {
            console.log(evt);
            if(evt&&evt.target.files){
                debugger;
                var files = evt.target.files; // FileList object
                EXIF.getData(evt.target.files[0], function() {
                    $scope.commentbox.comment_txt =  EXIF.pretty($("#upload_img"));
                });
                // Loop through the FileList and render image files as thumbnails.
                for (var i = 0, f; f = files[i]; i++) {
                    // Only process image files.
                    if (!f.type.match('image.*')) {
                        continue;
                    }
                    $scope.commentbox.pic = f;
                    var reader1 = new FileReader();
                    var reader2 = new FileReader();
                    var reader3 = new FileReader();
                    // Closure to capture the file information.
                    reader1.onload = (function(theFile) {
                        return function(e) {
                            // Render thumbnail.
                            var span = document.createElement('span');
                            span.innerHTML = ['<img class="thumb" style="max-width: 200px;max-height: 200px" id="upload_img" src="', e.target.result,
                                '" title="', escape(theFile.name), '"/>'].join('');
                            $("#uploadimg_div").show();
                            $("#selectImgBtn").popover('show');
                            $('#imglist')[0].innerHTML = span.innerHTML;

                        };
                    })(f);

                    reader3.onloadend = function() {
                        var exif = EXIF.readFromBinaryFile(new BinaryFile(this.result));
                        if(exif!='false')
                            $scope.commentbox.comment_txt = buildExifStr(exif);
                    };
                    reader1.readAsDataURL(f);
                    reader3.readAsBinaryString(f);
                }
            }
        }

        $('#files').on('change',function(event){
            $scope.handleFileSelect(event);
        });
        $scope.selectImg = function(){
            $('#files').click();
        }
        $scope.showEmotions = function(){
            $('#emotions_div').show();
            $("#showEmotionsBtn").popover('toggle');
        }

        $scope.insertEmotion = function(emotion){
            insertText($("#comment_textarea")[0],emotion);
        }

        if(chrome.extension.getBackgroundPage().timeline&&chrome.extension.getBackgroundPage().timeline.length>0){
            $scope.timeline = chrome.extension.getBackgroundPage().timeline
            $scope.maxid = $scope.timeline[$scope.timeline.length-1].id;
            $scope.unreadTimeLineNum = localStorage.unreadTimeLineNum;
            $scope.unreadCommentNum = localStorage.unreadCommentNum;
            $scope.unreadAtNum = localStorage.unreadAtNum;

        }else{
            $scope.get_home_timeline();
            localStorage.current_icon = "#home_btn";
        }

        if($scope.uid&&$scope.access_token)
            $scope.getuserinfo($scope.uid);
        else
            $scope.isAuth = false;

        if(!localStorage.current_timeline_api)
            $scope.current_timeline_api = sinaApi.config.home_timeline;
        else
            $scope.current_timeline_api = localStorage.current_timeline_api;
        if(!localStorage.current_icon)
            localStorage.current_icon = "#home_btn"
        $("li.active").removeClass("active");
        $(localStorage.current_icon).addClass("active");


        $scope.hideImgPop = function(){
            $scope.commentbox.pic = null;
            $("#selectImgBtn").popover('hide');
        };

        $scope.hideEmoPop = function(){
            $('#emotions_div').hide();
            $("#showEmotionsBtn").popover('hide');
        }



        setTimeout(function(){
            $("#warp")[0].scrollTop = chrome.extension.getBackgroundPage().scrollTop;
            $("#selectImgBtn").popover({
                placement : 'bottom', // top, bottom, left or right
                html: 'true',
                content : $('#uploadimg_div'),
                trigger: 'manual'
            });
            $("#showEmotionsBtn").popover({
                placement : 'bottom', // top, bottom, left or right
                html: 'true',
                content : $('#emotions_div'),
                trigger: 'manual'
            });
            $scope.$apply();

        }, 200);


		
        setInterval(function(){
            $scope.$apply($scope.unreadTimeLineNum = localStorage.unreadTimeLineNum);
        }, 5000);



     }
  ]);


var Example = (function() {
    "use strict";
    var elem,
        hideHandler,
        that = {};
    that.init = function(options) {
        elem = $(options.selector);
    };
    that.show = function(text) {
        clearTimeout(hideHandler);
        elem.find("span").html(text);
        elem.delay(200).fadeIn().delay(4000).fadeOut();
    };
    return that;
}());

Example.init({
    "selector": ".bb-alert"
});
