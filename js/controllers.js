'use strict';
/* Controllers */
angular.module('myApp.controllers', [])
  .controller('optionCtrl',['$scope','$http','sinaApi',function($scope,$http,sinaApi) {
        $scope.appid = "";
        $scope.access_token = localStorage.access_token;
        $scope.uid=localStorage.uid;
        $scope.oAuthPath = "";
        $scope.user=[];
        $scope.maxid=null;
        $scope.isloading = false;
        $scope.timeline = new Array();
        $scope.authorize = function(){
            localStorage.timeline = [];
            localStorage.scrollTop = 0;
            localStorage.maxid = null;
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
                    localStorage.timeline = [];
                    localStorage.scrollTop = 0;
                    localStorage.maxid = null;
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
                    $scope.$apply($scope.access_token = data.access_token);
                    $scope.$apply($scope.uid = data.uid);
                    localStorage.access_token = data.access_token;
                    localStorage.uid = data.uid;
                    localStorage.current_user_name = data.screen_name;
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
  .controller('weiboCtrl', ['$scope','$http','sinaApi',function($scope,$http,sinaApi) {
        console.log('start:'+(new Date()).getTime());
        $scope.isAuth = true;
        $scope.showMain = false;
        $scope.tabs = {
            home:"home",
            at:"@",
            comments:"comments",
            favorites:"favorites",
            user:"user",
            follows:"follows"
        }

        $scope.oAuthPath = 'https://api.weibo.com/oauth2/authorize?client_id='+sinaApi.config.oauth_key+'&redirect_uri=https://api.weibo.com/oauth2/default.html&response_type=code';

        chrome.webRequest.onResponseStarted.addListener(function(details){
            var pin = details.url;
            if (pin.indexOf('=') > 0) {
                pin = pin.substring(pin.indexOf('=')+1);
            }
            $scope.$apply($scope.code = pin);
            $scope.gettoken();
        },{urls: ["https://api.weibo.com/oauth2/default.html*"]},["responseHeaders"])

        $scope.gettoken = function(){
            sinaApi.gettoken(code,
                function(){
                    $scope.checkIsAuth();
                },function(err){
                    console.debug(err);
            });
        };

        $scope.loadFriends = function(cursor){
            sinaApi.friends(cursor,function(data){
                if(data.next_cursor!=0){
                    $scope.loadFriends(data.next_cursor);
                }
                $.each(data.users,function(i,n){
                    $scope.atList[$scope.atList.length] = {name:n.name,screen_name:n.screen_name}
                })
            },function(data){
                console.debug(err);
            });
        };

        $scope.initUserInfo = function(uid){
            sinaApi.user_show_byid(uid,function(data){
                $scope.currentuser = data;
                localStorage.user = JSON.stringify($scope.user);
                //验证已授权后再进行初始化
                $scope.init();
            },function(data){
                $scope.isAuth = false;
                $("#oAuthIframe").attr("src",$scope.oAuthPath);
            });
        };

        $scope._timeline_suc = function(data,type){
            if(data.statuses.length>1){
                //区分获取最新和向下刷新
                if(type=='refresh'){
                    $scope.timeline = [];
                    $scope.timeline = data.statuses;
                    $("#warp").animate({'scrollTop':0},300);
                    localStorage.scrollTop = 0;
                }else{
                    $scope.timeline = $scope.timeline.concat(data.statuses);
                }
                $scope.maxid = data.statuses[data.statuses.length-1].id-3;
                localStorage.timeline = JSON.stringify($scope.timeline);
                localStorage.maxid = $scope.maxid;
            }
            $scope.loading = false;
        }

        $scope.get_mentions_timeline=function(type){
            $scope.loading = true;
            sinaApi.mentions_timeline($scope.maxid,function(data){
                $scope._timeline_suc(data,type);
                $scope.unreadAtNum = 0;
                localStorage.unreadAtNum = 0;
            },function(data){
                $scope.loading = false;
            })
        }

        $scope.get_comments_timeline=function(type){
            $scope.loading = true;
            sinaApi.comments_timeline($scope.maxid,function(data){
                for(var i in data.comments){
                    data.comments[i].retweeted_status = data.comments[i].status;
                }
                data.statuses =  data.comments;
                $scope._timeline_suc(data,type);
                $scope.unreadCommentNum = 0;
                localStorage.unreadCommentNum = 0;
            },function(data){
                $scope.loading = false;
            })
        }

        $scope.get_favorites=function(type){
            $scope.loading = true;
            sinaApi.favorites($scope.maxid,function(data){
                data.statuses = [];
                for(var i in data.favorites){
                    data.statuses[i] =  data.favorites[i].status;
                }
                $scope._timeline_suc(data,type);
            },function(data){
                $scope.loading = false;
            })
        }

        $scope.get_home_timeline = function(type){
            $scope.loading = true;
            console.log("maxid:"+$scope.maxid);
            sinaApi.home_timeline($scope.maxid,function(data){
                $scope._timeline_suc(data,type);
                $scope.unreadTimeLineNum = 0;
                localStorage.unreadTimeLineNum = 0;
            },function(data){
                $scope.loading = false;
            });
        };

        $scope.get_user_timeline = function(screen_name,type){
            if(!screen_name)
                screen_name = $scope.target_user.screen_name;
            $scope.loading = true;
            console.log("maxid:"+$scope.maxid);
            sinaApi.user_timeline(screen_name,$scope.maxid,function(data){
                $scope._timeline_suc(data,type);
            },function(data){
                $scope.loading = false;
            });
        };

        $scope._handlePager=function(item,data){
            item.comments_pre_page = item.comments_next_page;
            item.comments_next_page = 0;
            item.comments_pre_page = 0;
            if(data.next_cursor!=0)
                item.comments_next_page = item.comments_page+1;
            if(data.previous_cursor!=0)
                item.comments_pre_page = item.comments_page-1;
        }

        $scope.get_repost = function(item,type){
            if(type=='pre'){
                item.comments_page = item.comments_pre_page;
            }else if(type=="next"){
                item.comments_page = item.comments_next_page;
            };
            $scope.loading = true;
            sinaApi.repost_timeline(item.id,item.comments_page,function(data){
                $scope.loading = false;
                if(data.reposts.length>0)
                    item.comments = data.reposts;
                $scope._handlePager(item,data);
                $scope.loading = false;
            },function(data){
                $scope.loading = false;
            });
        }

        $scope.get_comments = function(item,type){
            if(type=='pre'){
                item.comments_page = item.comments_pre_page;
            }else if(type=="next"){
                item.comments_page = item.comments_next_page;
            };
            $scope.loading = true;
            sinaApi.get_comments(item.id,item.comments_page,function(data){
                $scope.loading = false;
                if(data.comments.length>0)
                    item.comments = data.comments;
                $scope._handlePager(item,data);
                $scope.loading = false;
            },function(data){
                $scope.loading = false;
            });
        };

        $scope._send_suc = function(){
            Example.show("发送成功")
            $scope.commentbox.comment_txt = "";
            $scope.hideCommentText();
        }

        $scope._send_err = function() {
            Example.show("发送失败")
        }

        $scope.update = function(){
            if($scope.commentbox.pic)
                $scope.upload();
            sinaApi.update($scope.commentbox.comment_txt,
                function(){
                    $scope._send_suc();
                },
                function(){
                    $scope._send_err();
                }
            )
        }

        $scope.upload = function(){
            sinaApi.upload($scope.commentbox.comment_txt,$scope.commentbox.pic,
                function(){
                    $scope._send_suc();
                },
                function(){
                    $scope._send_err();
                }
            )
        }

        $scope.reply = function(){
            sinaApi.reply($scope.commentbox.comment_txt,$scope.commentbox.cid,
                $scope.commentbox.id,$scope.chk_also_comment_orig,
                function(){
                    $scope._send_suc();
                    $scope.chk_also_comment_orig = false;
                },
                function(){
                    $scope._send_err();
                }
            )
        }

        $scope.comment = function(){
            sinaApi.post_comments($scope.commentbox.comment_txt,
                $scope.commentbox.id,$scope.chk_also_repost,
                function(){
                    $scope._send_suc();
                    $scope.chk_also_repost= false;
                },
                function(){
                    $scope._send_err();
                }
            )
        }

        $scope.repost = function(){
            var is_comment = 0;
            if($scope.chk_also_comment)
                is_comment = 1;
            if($scope.chk_also_comment_orig)
                is_comment = 2;
            if($scope.chk_also_comment&$scope.chk_also_comment_orig)
                is_comment = 3;
            sinaApi.repost($scope.commentbox.comment_txt,
                $scope.commentbox.id,is_comment,
                function(){
                    $scope._send_suc();
                    $scope.chk_also_comment = false;
                    $scope.chk_also_comment_orig = false;
                },
                function(){
                    $scope._send_err();
                }
            )
        }

        $scope.send = function(){
            if($scope.commentbox.type=='reply')
                $scope.reply();
            if($scope.commentbox.type=='create')
                $scope.update();
            if ($scope.commentbox.type=='repost')
                $scope.repost();
            if ($scope.commentbox.type=='comment')
                $scope.comment();
        };

        $scope.favorite= function(item){
            sinaApi.favorite(item.id,item.favorited,function(){
                item.favorited = data.status.favorited;
                if(item.favorited)
                    Example.show("收藏成功")
                else
                    Example.show("移除收藏成功")
            },function(){
                Example.show("操作失败");
            });
        }

        $scope.categoryChange = function(_category){
            $scope.current_category = {category:_category};
        }

        $scope.showCommentText = function(item,type,$event){
//            Example.show("发送成功");
            $scope.current_category = {category:$scope.emotions_category[0]};
            $scope.commentbox.pic = null;
            $scope.commentbox.repost_with_retweet = false;
            if(item)
                $scope.commentbox.id = item.id
            $scope.commentbox.type = type;
            if(type=="repost"){
                $scope.commentbox.title = "转发@"+item.user.name+"的微博";
                $scope.commentbox.comment_txt = '转发微博//@'+item.user.name+":"+item.text;
                $scope.commentbox.button_txt = "转发";
                if(item.retweeted_status)
                    $scope.commentbox.repost_with_retweet = true;
            }
            if(type=="comment"){
                $scope.commentbox.title = "评论@"+item.user.name+"的微博";
                $scope.commentbox.comment_txt ="";
                $scope.commentbox.button_txt = "评论";
            }
            if(type=="reply"){
                $scope.commentbox.title = "回复@"+item.user.name;
                $scope.commentbox.cid = item.id;
                if(item.retweeted_status)
                    $scope.commentbox.id = item.retweeted_status.id||item.status.id;
                else
                    $scope.commentbox.id = item.status.id;
                $scope.commentbox.comment_txt ="";
                $scope.commentbox.button_txt = "回复";
            }
            if(type=="create"){
                $scope.commentbox.title = "写微博";
                $scope.commentbox.comment_txt ="";
                $scope.commentbox.button_txt = "发送";
            }
            $('#comment_text_div').fadeIn();
        };

        $scope.hideCommentText = function(){
            $('#comment_text_div').fadeOut();
            $scope.commentbox.pic = null;
            $scope.hideImgPop();
            $scope.hideEmoPop();
            $scope.chk_also_repost = false;
            $scope.chk_also_comment = false;
            $scope.chk_also_comment_orig = false;
        };

        $scope.showComments = function(item,$index){
            if(item.comment_type!="Comment"){
                $("#commentsdiv"+$index).collapse('show');
                item.comment_type = "Comment";
                item.comments_page=1;
                $scope.get_comments(item,'');
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
                $scope.get_comments(item,'');
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
                $scope.get_repost(item,'');
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
                $scope.get_repost(item);
            }else
            {
                $("#recommentsdiv"+$index).collapse('toggle');
            }
        };

        $scope.loadHome = function(type){
            $("a.active").removeClass("active");
            $("#home_btn").addClass("active");
            localStorage.current_icon = "#home_btn";
            localStorage.current_tab = $scope.tabs.home;
            $scope.current_tab = $scope.tabs.home;
            $scope.maxid = null;
            $scope.get_home_timeline('refresh');
        };

        $scope.loadComment = function(type){
            $("a.active").removeClass("active");
            $("#comment_btn").addClass("active");
            localStorage.current_icon = "#comment_btn";
            localStorage.current_tab = $scope.tabs.comments;
            $scope.current_tab = $scope.tabs.comments;
            $scope.maxid = null;
            $scope.get_comments_timeline('refresh');
        };

        $scope.loadAt = function(type){
            $("a.active").removeClass("active");
            $("#at_btn").addClass("active");
            localStorage.current_icon = "#at_btn";
            localStorage.current_tab = $scope.tabs.at;
            $scope.current_tab = $scope.tabs.at;
            $scope.maxid = null;
            $scope.get_mentions_timeline('refresh');
        };

        $scope.loadFavorites = function(type){
            $("a.active").removeClass("active");
            $("#favorite_btn").addClass("active");
            localStorage.current_icon = "#favorite_btn";
            localStorage.current_tab = $scope.tabs.favorites;
            $scope.current_tab = $scope.tabs.favorites;
            $scope.maxid = null;
            $scope.get_favorites('refresh');
        };

        $scope.loadUser = function(screen_name){
            var _user = JSON.parse(localStorage.theuser);
            var uid = null;
            if(!screen_name){
                if(localStorage.screen_name)
                    screen_name = _user.screen_name;
                else
                    uid = $scope.uid;
            }
            var _suc = function(data){
                $scope.target_user = data;
                localStorage.target_user = JSON.stringify(data);
                $("a.active").removeClass("active");
                $("#user_btn").addClass("active");
                localStorage.current_icon = "#user_btn";
                localStorage.current_tab = $scope.tabs.user;
                $scope.current_tab = $scope.tabs.user;
                $scope.maxid = null;
                $scope.get_user_timeline($scope.target_user.screen_name,'refresh');
            };
            if(screen_name)
                sinaApi.user_show(screen_name,_suc,function(data){
                });
            else
                sinaApi.user_show_byid(uid,_suc,function(data){
                });
        }

        $scope.get_timeline_next = function(){
            if(localStorage.current_tab == $scope.tabs.home)
                $scope.get_home_timeline();
            if(localStorage.current_tab == $scope.tabs.comments)
                $scope.get_comments_timeline();
            if(localStorage.current_tab == $scope.tabs.at)
                $scope.get_mentions_timeline();
            if(localStorage.current_tab == $scope.tabs.favorites)
                $scope.get_favorites();
            if(localStorage.current_tab == $scope.tabs.user)
                $scope.get_user_timeline();
        };

        $scope.gotoOption = function(){
            chrome.extension.getOptions
            chrome.tabs.create({"url":"chrome-extension://pnkacoeejlfoikeaiobjennblgpoaaao/option.html","selected":true}, function(tab){
            });
        }

        $scope.hideinfo = function(){
            $("#infodiv").hide();
        };

        $scope.handleFileSelect = function(evt) {
            if(evt&&evt.target.files){
                var files = evt.target.files; // FileList object
                // Loop through the FileList and render image files as thumbnails.
                for (var i = 0, f; f = files[i]; i++) {
                    // Only process image files.
                    if (!f.type.match('image.*')) {
                        continue;
                    }
                    $scope.commentbox.pic = f;
                    var reader1 = new FileReader();
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
                        if(exif!='false'){
                            $scope.insertText($("#comment_textarea")[0],buildExifStr(exif));
                        }
                    };
                    reader1.readAsDataURL(f);
                    reader3.readAsBinaryString(f);
                }
            }
        }

        $scope.insertText = function(obj,str) {
            debugger;
            if (document.selection) {
                var sel = document.selection.createRange();
                sel.text = str;
            } else if (typeof obj.selectionStart === 'number' && typeof obj.selectionEnd === 'number') {
                var startPos = obj.selectionStart,
                    endPos = obj.selectionEnd,
                    cursorPos = startPos,
                    tmpStr = obj.value;
                $scope.commentbox.comment_txt = tmpStr.substring(0, startPos) + str + tmpStr.substring(endPos, tmpStr.length);
                cursorPos += str.length;
                obj.selectionStart = obj.selectionEnd = cursorPos;
            } else {
                $scope.commentbox.comment_txt += str;
            }
        }

        $scope.selectImg = function(){
            $('#files').click();
        }
        $scope.showEmotions = function(){
            $('#emotions_div').show();
            $("#showEmotionsBtn").popover('toggle');
        }

        $scope.insertEmotion = function(emotion){
            $scope.insertText($("#comment_textarea")[0],emotion)
        }

        $scope.hideImgPop = function(){
            $scope.commentbox.pic = null;
            $("#selectImgBtn").popover('hide');
        };

        $scope.hideEmoPop = function(){
            $("#showEmotionsBtn").popover('hide');
        }

        $scope.checkIsAuth = function(){
            $scope.uid=localStorage.uid;
            $scope.current_user_name = localStorage.current_user_name;
            $scope.access_token = localStorage.access_token;
            if($scope.uid&&$scope.access_token){
                try{
                    $scope.currentuser = JSON.parse(localStorage.user);
                }catch(e){
                    console.log(e);
                    $scope.initUserInfo($scope.uid);
                }
            }
            else{
                $scope.isAuth = false;
                $("#oAuthIframe").attr("src",$scope.oAuthPath);
            }
            return $scope.isAuth;
        }

        $scope.init = function(){
            console.log('init');
            $scope.api = sinaApi.config;
            $scope.unreadTimeLineNum = 0;
            $scope.unreadCommentNum = 0;
            $scope.unreadAtNum = 0;
            $scope.appid = "";
            $scope.oAuthPath = "";
            $scope.maxid=null;
            $scope.isloading = false;
            $scope.timeline = new Array();
            $scope.loading = false;
            $scope.chk_also_comment = false;
            $scope.chk_also_comment_orig = false;
            $scope.chk_also_repost = false;
            $scope.atList = [];
            $scope.emotions = [];
            $scope.commentbox ={};
            $scope.currentPage = 0;
            $scope.pageSize = 5;
            $scope.inited = false;
            console.log('init end:'+(new Date()).getTime());
//            $scope.loadFriends(0);
        }

//      当ngrepeat渲染完毕后
        $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
            console.log('ngRepeatFinished:'+(new Date()).getTime());
            console.log("scroll to:"+localStorage.scrollTop);
            $("#warp")[0].scrollTop = localStorage.scrollTop;
//          读取表情
            $scope.emotions_category = chrome.extension.getBackgroundPage().emotions_category;
            $scope.current_category = {category:$scope.emotions_category[0]};
            $scope.emotions = chrome.extension.getBackgroundPage().orig_emotions;
            if($scope.inited)
                return;
            $scope.inited = true;
//          初始化选择图片的popver
            $("#selectImgBtn").popover({
                placement : 'bottom', // top, bottom, left or right
                html: 'true',
                content : $('#uploadimg_div'),
                trigger: 'manual'
            });
//          初始化选择表情的popver
            $("#showEmotionsBtn").popover({
                placement : 'bottom', // top, bottom, left or right
                html: 'true',
                content : $('#emotions_div'),
                trigger: 'manual'
            });
            //绑定滚动事件，每次滚动都记录当前页面位置
            $("#warp").scroll(function() {
                var nDivHight = $("#warp").height();
                var nScrollHight = $(this)[0].scrollHeight;
                var nScrollTop = $(this)[0].scrollTop;
                localStorage.scrollTop = nScrollTop;
                console.log(nScrollTop);
                if(nScrollTop + nDivHight >= nScrollHight&&$scope.loading == false){
                    console.log("loadnewdata");
                    $scope.get_timeline_next();
                }


            });
            //绑定选择文件选择事件
            $('#files').on('change',function(event){
                $scope.handleFileSelect(event);
            });
        });

        angular.element(document).ready(function () {
            console.log('document ready:'+(new Date()).getTime());
            setTimeout(function(){
                if($scope.checkIsAuth()){
                    $scope.showMain = true;
                    console.log('data load start:'+(new Date()).getSeconds());
                    if(!localStorage.current_icon)
                        localStorage.current_icon = "#home_btn"
                    $scope.current_tab = localStorage.current_tab;
                    $("a.active").removeClass("active");
                    $(localStorage.current_icon).addClass("active");
                    if(localStorage.target_user&&localStorage.target_user!='undefined')
                        $scope.target_user = JSON.parse(localStorage.target_user);
                    if(localStorage.timeline){
                        $scope._timeline_suc({statuses:JSON.parse(localStorage.timeline)});
                    }else{
                        $scope.loadHome();
                    }
                    console.log('date loaded:'+(new Date()).getSeconds());
                    //          设置header button class

                    $scope.$watch('commentbox.comment_txt', function(newValue, oldValue) {
                        if(newValue)
                            $scope.commentbox.lastCharNum = parseInt((280-getLength(newValue))/2);
                        else
                            $scope.commentbox.lastCharNum = 140;
                    });
                    Example.init({
                        "selector": ".bb-alert"
                    });
                    $scope.$apply();
                }
                console.log((new Date()).getTime());
            },25);

        });
        $scope.init();
        //5秒检测一次未读数
        setInterval(function(){
            $scope.unreadTimeLineNum = localStorage.unreadTimeLineNum;
        }, 5000);

     }
  ]);


var Example = (function() {
    "use strict";
    var elem,
        hideHandler,
        that = {};
    that.init = function(options) {
        elem = options.selector;
    };
    that.show = function(text) {
        clearTimeout(hideHandler);
        $(elem).find("span").html(text);
        $(elem).delay(200).fadeIn().delay(3000).fadeOut();
    };
    return that;
}());
