function Combo(callback) {
    this.callback = callback;
    this.items = 0;
    this.results = [];
}
Combo.prototype = {add: function () {
    var self = this;
    var id = this.items;
    this.items++;
    return function () {
        self.check(id, arguments);
    };
}, check: function (id, args) {
    this.results[id] = Array.prototype.slice.call(args);
    this.items--;
    if (this.items === 0) {
        this.callback.apply(this, this.results);
    }
}};
Object.inherits = function (destination) {
    for (var i = 1, len = arguments.length; i < len; i++) {
        var source = arguments[i];
        if (!source) {
            continue;
        }
        for (var property in source) {
            destination[property] = source[property];
        }
        if (destination.super_ === undefined) {
            destination.super_ = source;
        }
    }
    return destination;
};
var OAUTH_CALLBACK_URL = chrome.extension.getURL('oauth_cb.html');
var FAWAVE_OAUTH_CALLBACK_URL = 'http://fawave.net4team.net/fawave/client/oauth_callback';
var OAUTH_CALLBACK_URL2 = 'http://fengmk2.cnpmjs.org/fawave/oauth/callback';
var RE_JSON_BAD_WORD = /[\u000B\u000C]/ig;
var URL_RE = new RegExp('(?:\\[url\\s*=\\s*|)((?:www\\.|http[s]?://)[\\w\\.\\?%&\\-/#=;:!\\+~]+)(?:\\](.+)\\[/url\\]|)', 'ig');
var TSINA_APPKEYS = {fawave: ['FaWave', '3538199806', '18cf587d60e11e3c160114fd92dd1f2b']};
var sinaApi = {combo: function (callback) {
    return new Combo(callback);
}, config: {host: 'http://api.t.sina.com.cn', user_home_url: 'http://weibo.com/n/', search_url: 'http://weibo.com/k/', result_format: '.json', source: '3538199806', oauth_key: '3538199806', oauth_secret: '18cf587d60e11e3c160114fd92dd1f2b', google_appkey: 'AIzaSyAu4vq6sYO3WuKxP2G64fYg6T1LdIDu3pk', user_timeline_need_friendship: true, max_text_length: 140, max_image_size: 5 * 1024 * 1024, userinfo_has_counts: true, support_double_char: true, support_counts: true, support_counts_max_id_num: 99, support_comment: true, support_do_comment: true, support_repost_comment: true, support_repost_comment_to_root: false, support_repost: true, support_comment_repost: true, support_repost_timeline: true, support_upload: true, repost_pre: '转:', repost_delimiter: '//', image_shorturl_pre: ' [图] ', support_favorites: true, support_do_favorite: true, support_geo: true, latitude_field: 'lat', longitude_field: 'long', support_max_id: true, support_destroy_msg: true, support_direct_messages: false, support_sent_direct_messages: false, support_mentions: true, support_friendships_create: true, support_search: true, support_user_search: true, support_search_max_id: false, support_favorites_max_id: false, support_auto_shorten_url: true, rt_need_source: true, support_followers: true, need_processMsg: true, comment_need_user_id: false, user_timeline_need_user: false, show_fullname: false, support_blocking: true, public_timeline: '/statuses/public_timeline', friends_timeline: '/statuses/friends_timeline', comments_timeline: '/statuses/comments_timeline', user_timeline: '/statuses/user_timeline', mentions: '/statuses/mentions', followers: '/statuses/followers', friends: '/statuses/friends', favorites: '/favorites', favorites_create: '/favorites/create', favorites_destroy: '/favorites/destroy', counts: '/statuses/counts', status_show: '/statuses/show/{{id}}', update: '/statuses/update', upload: '/statuses/upload', repost: '/statuses/repost', repost_timeline: '/statuses/repost_timeline', comment: '/statuses/comment', reply: '/statuses/reply', comment_destroy: '/statuses/comment_destroy/{{id}}', comments: '/statuses/comments', destroy: '/statuses/destroy/{{id}}', destroy_msg: '/direct_messages/destroy/{{id}}', direct_messages: '/direct_messages', sent_direct_messages: '/direct_messages/sent', new_message: '/direct_messages/new', verify_credentials: '/account/verify_credentials', rate_limit_status: '/account/rate_limit_status', friendships_create: '/friendships/create', friendships_destroy: '/friendships/destroy', friendships_show: '/friendships/show', reset_count: '/statuses/reset_count', user_show: '/users/show/{{id}}', blocks_blocking: '/blocks/blocking', blocks_blocking_ids: '/blocks/blocking/ids', blocks_create: '/blocks/create', blocks_destroy: '/blocks/destroy', blocks_exists: '/blocks/exists', tags: '/tags', create_tag: '/tags/create', destroy_tag: '/tags/destroy', tags_suggestions: '/tags/suggestions', search: '/statuses/search', user_search: '/users/search', oauth_authorize: '/oauth/authorize', oauth_request_token: '/oauth/request_token', oauth_callback: OAUTH_CALLBACK_URL, oauth_access_token: '/oauth/access_token', detailUrl: '/jump?aid=detail&twId=', searchUrl: '/search/', ErrorCodes: {"40025:Error: repeated weibo text!": "重复发送", "40028:": "新浪微博接口内部错误", "40031:Error: target weibo does not exist!": "不存在的微博ID", "40015:Error: not your own comment!": "评论ID不在登录用户的comments_by_me列表中", "40303:Error: already followed": "已跟随"}}, translate: function (text, target, callback, context) {
    var api = 'http://translate.google.cn/translate_a/t?client=t&sl=auto';
    if (!target || target === 'zh-CN' || target === 'zh-TW') {
        target = 'zh';
    }
    var params = {tl: target, text: text};
    $.ajax({url: api, data: params, success: function (data, status) {
        data = eval(data);
        if (data && data[0]) {
            data = data[0];
            var tran_text = '';
            for (var i = 0, l = data.length; i < l; i++) {
                tran_text += data[i][0];
            }
            callback.call(context, tran_text);
        } else {
            showMsg(_u.i18n("comm_not_need_tran"), true);
            callback.call(context, null);
        }
    }, error: function (xhr, status) {
        var error = {message: status + ': ' + xhr.statusText};
        try {
            error = JSON.parse(xhr.responseText).error;
        } catch (e) {
        }
        if (error.message === 'The source language could not be detected') {
            showMsg(_u.i18n("comm_not_need_tran"), true);
        } else {
            showMsg(_u.i18n("comm_could_not_tran") + error.message, true);
        }
        callback.call(context, null);
    }});
}, processMsg: function (str_or_status, notEncode) {
    var str = str_or_status;
    var need_processMsg = this.config.need_processMsg;
    if (str_or_status.text !== undefined) {
        str = str_or_status.text;
    }
    if (str_or_status.need_processMsg !== undefined) {
        need_processMsg = str_or_status.need_processMsg;
    }
    if (typeof str === 'object') {
        return'&nbsp;';
    }
    if (str && need_processMsg) {
        if (!notEncode) {
            str = htmlencode(str);
        }
        str = str.replace(URL_RE, this._replaceUrl);
        str = this.processAt(str, str_or_status);
        str = this.processEmotional(str);
        str = this.processSearch(str);
        if (typeof jEmoji !== 'undefined') {
            str = jEmoji.unifiedToHTML(jEmoji.softbankToUnified(str));
        }
    }
    return str || '&nbsp;';
}, searchMatchReg: /#([^#]+)#/g, processSearch: function (str) {
    var search_url = this.config.search_url;
    str = str.replace(this.searchMatchReg, function (m, g1) {
        var search = g1.remove_html_tag();
        return'<a target="_blank" href="' + search_url + '{{search}}" title="Search #{{search}}">#{{search}}#</a>'.format({search: search});
    });
    return str;
}, findSearchText: function (str) {
    var matchs = str.match(this.searchMatchReg);
    var result = [];
    if (matchs) {
        for (var i = 0, len = matchs.length; i < len; i++) {
            var s = matchs[i];
            result.push([s, s.substring(1, s.length - 1)]);
        }
    }
    return result;
}, formatSearchText: function (str) {
    return'#' + str.trim() + '#';
}, _at_match_rex: /@([●\w\-\_\u2E80-\u3000\u303F-\u9FFF]+)/g, processAt: function (str) {
    return str.replace(this._at_match_rex, '<a class="getUserTimelineBtn" href="" data-screen_name="$1" rhref="' +
        this.config.user_home_url + '$1" title="' +
        _u.i18n("btn_show_user_title") + '">@$1</a>');
}, find_at_users: function (str) {
    if (!str) {
        return null;
    }
    var matchs = str.match(this._at_match_rex);
    if (matchs) {
        var users = [];
        for (var i = 0, l = matchs.length; i < l; i++) {
            var name = matchs[i].substring(1);
            if (users.indexOf(name) < 0) {
                users.push(name);
            }
        }
        return users;
    }
    return null;
}, processEmotional: function (str) {
    return str.replace(/\[([\u4e00-\u9fff,\uff1f,\w]{1,6})\]/g, this._replaceEmotional.bind(this));
}, _replaceUrl: function (m, g1, g2) {
    var _url = g1;
    if (g1.indexOf('http') !== 0) {
        _url = 'http://' + g1;
    }
    return'<a target="_blank" class="link" href="{{url}}">{{value}}</a>'.format({url: _url, title: g1, value: g2 || g1});
}, EMOTION_TPL: '<img title="{{title}}" src="{{src}}" />', _replaceEmotional: function (m, g1) {
    if (g1) {
        if (!this.bgEmotions && typeof getBackgroundView !== 'undefined') {
            this.bgEmotions = getBackgroundView().Emotions;
            if (this.bgEmotions) {
                this.bgEmotions = this.bgEmotions.weibo;
            }
        }
        var face = this.bgEmotions && this.bgEmotions[g1];
        if (!face) {
            face = TSINA_API_EMOTIONS[g1];
            if (face) {
                face = TSINA_FACE_URL_PRE + face;
            }
        }
        if (face) {
            return this.EMOTION_TPL.format({title: m, src: face});
        }
    }
    return m;
}, apply_auth: function (url, args, user) {
    if (user.blogType === 'tsina') {
        delete args.data.source;
    }
    user.authType = user.authType || 'baseauth';
    if (user.authType === 'baseauth') {
        args.headers.Authorization = make_base_auth_header(user.userName, user.password);
    } else if (user.authType === 'oauth' || user.authType === 'xauth') {
        var oauth_secret = this.config.oauth_secret;
        var oauth_key = this.config.oauth_key;
        var accessor = {consumerSecret: oauth_secret};
        if (user.oauth_token_secret) {
            accessor.tokenSecret = user.oauth_token_secret;
        }
        var parameters = {};
        for (var k in args.data) {
            parameters[k] = args.data[k];
            if (k.substring(0, 6) === 'oauth_') {
                delete args.data[k];
            }
        }
        var message = {action: url, method: args.type, parameters: parameters};
        message.parameters.oauth_consumer_key = oauth_key;
        message.parameters.oauth_version = '1.0';
        if (user.oauth_token_key) {
            message.parameters.oauth_token = user.oauth_token_key;
        }
        OAuth.setTimestampAndNonce(message);
        OAuth.SignatureMethod.sign(message, accessor);
        if (this.config.oauth_params_by_get === true) {
            args.data = message.parameters;
        } else {
            args.headers.Authorization = OAuth.getAuthorizationHeader(this.config.oauth_realm, message.parameters);
        }
    }
}, format_authorization_url: function (params) {
    var login_url = (this.config.oauth_host || this.config.host) + this.config.oauth_authorize;
    params = params || {};
    return OAuth.addToURL(login_url, params);
}, get_authorization_url: function (user, callback, context) {
    if (user.authType === 'oauth') {
        var login_url = null;
        this.get_request_token(user, function (token, text_status, error_code) {
            if (token) {
                user.oauth_token_key = token.oauth_token;
                user.oauth_token_secret = token.oauth_token_secret;
                var params = {oauth_token: user.oauth_token_key};
                if (this.config.oauth_callback) {
                    params.oauth_callback = this.config.oauth_callback;
                }
                login_url = this.format_authorization_url(params);
            }
            callback.call(context, login_url, text_status, error_code);
        }, this);
    } else {
        throw new Error(user.authType + ' not support get_authorization_url');
    }
}, get_request_token: function (user, callback, context) {
    if (user.authType === 'oauth') {
        var params = {url: this.config.oauth_request_token, type: 'get', user: user, play_load: 'string', apiHost: this.config.oauth_host, data: {}, need_source: false};
        if (this.config.oauth_callback) {
            params.data.oauth_callback = this.config.oauth_callback;
        }
        if (this.config.oauth_request_params) {
            $.extend(params.data, this.config.oauth_request_params);
        }
        this._sendRequest(params, function (token_str, text_status, error_code) {
            var token = null;
            if (text_status !== 'error') {
                token = decodeForm(token_str);
                if (!token.oauth_token) {
                    token = null;
                    error_code = token_str;
                    text_status = 'error';
                }
            }
            callback.call(context, token, text_status, error_code);
        });
    } else {
        throw new Error(user.authType + ' not support get_request_token');
    }
}, get_access_token: function (user, callback, context) {
    if (user.authType === 'oauth' || user.authType === 'xauth') {
        var params = {url: this.config.oauth_access_token, type: 'get', user: user, play_load: 'string', apiHost: this.config.oauth_host, data: {}, need_source: false};
        if (user.oauth_pin) {
            params.data.oauth_verifier = user.oauth_pin;
        }
        if (user.authType === 'xauth') {
            params.data.x_auth_username = user.userName;
            params.data.x_auth_password = user.password;
            params.data.x_auth_mode = "client_auth";
        }
        this._sendRequest(params, function (token_str, text_status, error_code) {
            var token = null;
            if (text_status !== 'error') {
                token = decodeForm(token_str);
                if (!token.oauth_token) {
                    token = null;
                    error_code = token_str;
                    text_status = 'error';
                } else {
                    user.oauth_token_key = token.oauth_token;
                    user.oauth_token_secret = token.oauth_token_secret;
                }
            }
            callback.call(context, token ? user : null, text_status, error_code);
        });
    } else {
        throw new Error(user.authType + ' not support get_access_token');
    }
}, verify_credentials: function (user, callback, data, context) {
    if (!user) {
        return callback && callback();
    }
    var params = {url: this.config.verify_credentials, type: 'get', user: user, play_load: 'user', data: data};
    this._sendRequest(params, callback, context);
}, rate_limit_status: function (data, callback, context) {
    if (!callback) {
        return;
    }
    var params = {url: this.config.rate_limit_status, type: 'get', play_load: 'rate', data: data};
    this._sendRequest(params, callback, context);
}, friends_timeline: function (data, callback, context) {
    var params = {url: this.config.friends_timeline, type: 'get', play_load: 'status', data: data};
    this._sendRequest(params, callback, context);
}, user_timeline: function (data, callback, context) {
    var need_friendship = this.config.user_timeline_need_friendship && data.need_friendship;
    delete data.need_friendship;
    var params = {url: this.config.user_timeline, type: 'get', play_load: 'status', data: data};
    var both = this.combo(function (statuses_args, friendship_args, show_user_args, blocking_args) {
        var friendship = null;
        if (friendship_args && friendship_args[0]) {
            var relationship = friendship_args[0];
            if (relationship.relationship) {
                relationship = relationship.relationship;
            }
            friendship = relationship.target || relationship;
        }
        var statuses_result = statuses_args[0];
        var user_info = show_user_args[0];
        if (statuses_result && !user_info) {
            var statuses = statuses_result.items || statuses_result || [];
            if (statuses.length > 0) {
                user_info = statuses[0].user || statuses[0].sender;
            }
        }
        if (user_info && friendship) {
            user_info.following = friendship.following;
            user_info.followed_by = friendship.followed_by;
        }
        if (statuses_result) {
            statuses_result.user = user_info;
        }
        if (user_info && blocking_args && blocking_args[0]) {
            user_info.blocking = blocking_args[0].result;
        }
        return callback.apply(context, statuses_args);
    });
    var oauth_user = data.user;
    var user_id = data.id || data.name;
    var screen_name = data.screen_name || data.name;
    this._sendRequest(params, both.add());
    var friendship_callback = both.add();
    var user_timeline_callback = both.add();
    var user_blocking_callback = both.add();
    var args;
    if (need_friendship) {
        args = {user: oauth_user};
        if (user_id) {
            args.target_id = user_id;
        }
        if (screen_name) {
            args.target_screen_name = screen_name;
        }
        this.friendships_show(args, friendship_callback);
    } else {
        friendship_callback();
    }
    if (this.config.user_timeline_need_user) {
        args = {user: oauth_user};
        args.id = user_id;
        args.screen_name = screen_name;
        this.user_show(args, user_timeline_callback);
    } else {
        user_timeline_callback();
    }
    if (need_friendship && this.config.support_blocking) {
        args = {user: oauth_user};
        if (user_id) {
            args.user_id = user_id;
        }
        if (screen_name) {
            args.screen_name = screen_name;
        }
        this.blocks_exists(args, user_blocking_callback);
    } else {
        user_blocking_callback();
    }
}, comments_timeline: function (data, callback, context) {
    if (!callback) {
        return;
    }
    var params = {url: this.config.comments_timeline, type: 'get', play_load: 'comment', data: data};
    this._sendRequest(params, callback, context);
}, repost_timeline: function (data, callback, context) {
    var params = {url: this.config.repost_timeline, type: 'get', play_load: 'status', data: data};
    this._sendRequest(params, callback, context);
}, mentions: function (data, callback, context) {
    var params = {url: this.config.mentions, type: 'get', play_load: 'status', data: data};
    this._sendRequest(params, callback, context);
}, comments_mentions: function (data, callback, context) {
    var params = {url: this.config.comments_mentions, type: 'get', play_load: 'status', data: data};
    this._sendRequest(params, callback, context);
}, followers: function (data, callback, context) {
    var params = {url: this.config.followers, type: 'get', play_load: 'user', data: data};
    this._sendRequest(params, callback, context);
}, friends: function (data, callback, context) {
    var params = {url: this.config.friends, type: 'get', play_load: 'user', data: data};
    this._sendRequest(params, callback, context);
}, favorites: function (data, callback, context) {
    var params = {url: this.config.favorites, type: 'get', play_load: 'status', data: data};
    this._sendRequest(params, callback, context);
}, favorites_create: function (data, callback, context) {
    var params = {url: this.config.favorites_create, type: 'post', play_load: 'status', data: data};
    this._sendRequest(params, callback, context);
}, favorites_destroy: function (data, callback, context) {
    var params = {url: this.config.favorites_destroy, type: 'post', play_load: 'status', data: data};
    this._sendRequest(params, callback, context);
}, counts: function (data, callback, context) {
    if (!callback) {
        return;
    }
    var params = {url: this.config.counts, type: 'get', play_load: 'count', data: data};
    this._sendRequest(params, callback, context);
}, user_show: function (data, callback, context) {
    var params = {url: this.config.user_show, type: 'get', play_load: 'user', data: data};
    this._sendRequest(params, callback, context);
}, direct_messages: function (data, callback, context) {
    var params = {url: this.config.direct_messages, type: 'get', play_load: 'message', data: data};
    this._sendRequest(params, callback, context);
}, sent_direct_messages: function (data, callback, context) {
    var params = {url: this.config.sent_direct_messages, type: 'get', play_load: 'message', data: data};
    this._sendRequest(params, callback, context);
}, destroy_msg: function (data, callback, context) {
    var params = {url: this.config.destroy_msg, type: 'post', play_load: 'message', data: data};
    this._sendRequest(params, callback, context);
}, new_message: function (data, callbackFn, context) {
    if (!callbackFn) {
        return;
    }
    if (data && data.text) {
        data.text = this.url_encode(data.text);
    }
    var params = {url: this.config.new_message, type: 'post', play_load: 'message', data: data};
    this._sendRequest(params, callbackFn, context);
}, status_show: function (data, callback, context) {
    var params = {url: this.config.status_show, play_load: 'status', data: data};
    this._sendRequest(params, callback, context);
}, get_geo: function () {
    var settings = Settings.get();
    if (this.config.support_geo && settings.isGeoEnabled && settings.geoPosition) {
        if (settings.geoPosition.latitude) {
            return settings.geoPosition;
        }
    }
    return null;
}, format_geo_arguments: function (data, geo) {
    data[this.config.latitude_field] = geo.latitude;
    data[this.config.longitude_field] = geo.longitude;
}, update: function (data, callback, context) {
    var geo = this.get_geo();
    if (geo) {
        this.format_geo_arguments(data, geo);
    }
    if (data && data.status) {
        data.status = this.url_encode(data.status);
    }
    var params = {url: this.config.update, type: 'post', play_load: 'status', data: data};
    this._sendRequest(params, callback, context);
}, format_upload_params: function (user, data, pic) {
}, parse_upload_result: function (data) {
    return JSON.parse(data);
}, upload: function (user, data, pic, before_request, onprogress, callback, context) {
    var auth_args = {type: 'post', data: {}, headers: {}};
    pic.keyname = pic.keyname || 'pic';
    data.source = data.source || this.config.source;
    if (data.need_source === false) {
        delete data.need_source;
        delete data.source;
    }
    var geo = this.get_geo();
    if (geo) {
        this.format_geo_arguments(data, geo);
    }
    this.format_upload_params(user, data, pic);
    var boundary = '----multipartformboundary' + new Date().getTime();
    var dashdash = '--';
    var crlf = '\r\n';
    var builder = '';
    builder += dashdash;
    builder += boundary;
    builder += crlf;
    for (var key in data) {
        auth_args.data[key] = this.url_encode(data[key]);
    }
    var api = user.apiProxy || this.config.host;
    var resultFormat = this.config.result_format;
    if ('__uploadFormat'in data) {
        resultFormat = data.__uploadFormat;
        delete data.__uploadFormat;
    }
    var url = api + this.config.upload + resultFormat;
    if (this.config.use_method_param) {
        url = api;
    } else if (data.__upload_url) {
        url = data.__upload_url + resultFormat;
        delete data.__upload_url;
        delete auth_args.data.__upload_url;
    }
    this.apply_auth(url, auth_args, user);
    for (var key in auth_args.data) {
        builder += 'Content-Disposition: form-data; name="' + key + '"';
        builder += crlf;
        builder += crlf;
        builder += auth_args.data[key];
        builder += crlf;
        builder += dashdash;
        builder += boundary;
        builder += crlf;
    }
    builder += 'Content-Disposition: form-data; name="' + pic.keyname + '"';
    var fileName = pic.file.fileName || pic.file.name;
    if (fileName) {
        builder += '; filename="' + this.url_encode(fileName) + '"';
    }
    builder += crlf;
    builder += 'Content-Type: ' + (pic.file.fileType || pic.file.type);
    builder += crlf;
    builder += crlf;
    var parts = [];
    parts.push(builder);
    parts.push(pic.file);
    builder = crlf;
    builder += dashdash;
    builder += boundary;
    builder += dashdash;
    builder += crlf;
    parts.push(builder);
    if (before_request) {
        before_request();
    }
    var that = this;
    $.ajax({url: url, cache: false, timeout: 5 * 60 * 1000, type: 'post', data: buildBlob(parts), dataType: 'text', contentType: 'multipart/form-data; boundary=' + boundary, processData: false, xhr: xhr_provider(onprogress), beforeSend: function (req) {
        for (var k in auth_args.headers) {
            req.setRequestHeader(k, auth_args.headers[k]);
        }
    }, success: function (data, textStatus, xhr) {
        var no_net_work = false;
        if (data === '' && textStatus === 'success' && xhr.status === 0 && xhr.statusText === '') {
            no_net_work = true;
            textStatus = 'error';
            data = {error: 'No network', error_code: 10000};
        }
        if (!no_net_work) {
            try {
                data = that.parse_upload_result(data);
            }
            catch (err) {
                data = {error: _u.i18n("comm_error_return") + ' [json parse error]', error_code: 500};
                textStatus = 'error';
            }
        }
        var error_code = null;
        if (data) {
            error_code = data.error_code;
            var error = data.errors || data.error || data.wrong || data.error_msg;
            if (data.ret && data.ret !== 0) {
                error = data.msg;
                error_code = data.ret;
            }
            if (error) {
                data.error = error;
                textStatus = 'error';
                var message = that.format_error(error, error_code, data);
                _showMsg('error: ' + message + ', error_code: ' + error_code, false, true);
            }
        } else {
            error_code = 400;
        }
        callback.call(context, data, textStatus, error_code);
    }, error: function (xhr, textStatus, errorThrown) {
        var r = null, status = 'unknow';
        if (xhr) {
            if (xhr.status) {
                status = xhr.status;
            }
            if (xhr.responseText) {
                var r = xhr.responseText;
                try {
                    r = JSON.parse(r);
                }
                catch (err) {
                    r = null;
                }
                if (r) {
                    _showMsg('error_code:' + r.error_code + ', error:' + r.error, false, true);
                }
            }
        }
        if (!r) {
            textStatus = textStatus ? ('textStatus: ' + textStatus + '; ') : '';
            errorThrown = errorThrown ? ('errorThrown: ' + errorThrown + '; ') : '';
            _showMsg('error: ' + textStatus + errorThrown + 'statuCode: ' + status, false, true);
        }
        callback.call(context, r || {}, 'error', status);
    }});
}, repost: function (data, callback, context) {
    if (data && data.status) {
        data.status = this.url_encode(data.status);
    }
    var params = {url: this.config.repost, type: 'post', play_load: 'status', data: data};
    this._sendRequest(params, callback, context);
}, comment: function (data, callback, context) {
    if (data && data.comment) {
        data.comment = this.url_encode(data.comment);
    }
    var params = {url: this.config.comment, type: 'post', play_load: 'comment', data: data};
    this._sendRequest(params, callback, context);
}, reply: function (data, callback, context) {
    if (!callback) {
        return;
    }
    if (data && data.comment) {
        data.comment = this.url_encode(data.comment);
    }
    var params = {url: this.config.reply, type: 'post', play_load: 'comment', data: data};
    this._sendRequest(params, callback, context);
}, comments: function (data, callback, context) {
    if (!callback) {
        return;
    }
    var params = {url: this.config.comments, type: 'get', play_load: 'comment', data: data};
    this._sendRequest(params, callback, context);
}, comment_destroy: function (data, callback, context) {
    if (!callback)return;
    var params = {url: this.config.comment_destroy, type: 'post', play_load: 'comment', data: data};
    this._sendRequest(params, callback, context);
}, friendships_create: function (data, callback, context) {
    var params = {url: this.config.friendships_create, type: 'post', play_load: 'user', data: data};
    this._sendRequest(params, callback, context);
}, friendships_destroy: function (data, callback, context) {
    var params = {url: this.config.friendships_destroy, type: 'post', play_load: 'user', data: data};
    this._sendRequest(params, callback, context);
}, friendships_show: function (data, callback, context) {
    var params = {url: this.config.friendships_show, type: 'get', play_load: 'object', data: data};
    this._sendRequest(params, callback, context);
}, reset_count: function (data, callback, context) {
    var params = {url: this.config.reset_count, type: 'post', play_load: 'result', data: data};
    this._sendRequest(params, callback, context);
}, tags: function (data, callback, context) {
    var params = {url: this.config.tags, play_load: 'tag', data: data};
    this._sendRequest(params, callback, context);
}, tags_suggestions: function (data, callback, context) {
    var params = {url: this.config.tags_suggestions, play_load: 'tag', data: data};
    this._sendRequest(params, callback, context);
}, create_tag: function (data, callback, context) {
    var params = {url: this.config.create_tag, type: 'post', play_load: 'tag', data: data};
    this._sendRequest(params, callback, context);
}, destroy_tag: function (data, callback, context) {
    var params = {url: this.config.destroy_tag, type: 'post', play_load: 'tag', data: data};
    this._sendRequest(params, callback, context);
}, destroy: function (data, callback, context) {
    var params = {url: this.config.destroy, type: 'POST', play_load: 'status', data: data};
    this._sendRequest(params, callback, context);
}, blocks_blocking: function (data, callback, context) {
    var params = {url: this.config.blocks_blocking, type: 'get', play_load: 'user', data: data};
    this._sendRequest(params, callback, context);
}, blocks_blocking_ids: function (data, callback, context) {
    var params = {url: this.config.blocks_blocking_ids, type: 'get', play_load: 'json', data: data};
    this._sendRequest(params, callback, context);
}, blocks_create: function (data, callback, context) {
    var params = {url: this.config.blocks_create, type: 'post', play_load: 'json', data: data};
    this._sendRequest(params, callback, context);
}, blocks_destroy: function (data, callback, context) {
    var params = {url: this.config.blocks_destroy, type: 'post', play_load: 'json', data: data};
    this._sendRequest(params, callback, context);
}, blocks_exists: function (data, callback, context) {
    var params = {url: this.config.blocks_exists, type: 'get', play_load: 'json', data: data};
    this._sendRequest(params, callback, context);
}, search: function (data, callback, context) {
    var params = {url: this.config.search, play_load: 'status', data: data};
    this._sendRequest(params, callback, context);
}, user_search: function (data, callback, context) {
    var params = {url: this.config.user_search, play_load: 'user', data: data};
    this._sendRequest(params, callback, context);
}, format_result: function (data, play_load, args) {
    var items = data;
    if (!$.isArray(items)) {
        items = data.results || data.users || data.statuses;
    }
    if ($.isArray(items)) {
        for (var i = 0, l = items.length; i < l; i++) {
            items[i] = this.format_result_item(items[i], play_load, args);
        }
    } else {
        data = this.format_result_item(data, play_load, args);
    }
    var next_results;
    if (args.url === this.config.search && data.next_page) {
        next_results = data.next_page;
    }
    if (data && data.search_metadata && data.search_metadata.next_results) {
        next_results = data.search_metadata.next_results;
    }
    if (next_results) {
        var p = decodeForm(next_results);
        data.max_id = p.max_id;
    }
    return data;
}, format_result_item: function (data, play_load, args) {
    if (!data) {
        return data;
    }
    if (play_load === 'user' && data && data.id) {
        data.t_url = 'http://weibo.com/' + (data.domain || data.id);
    } else if (play_load === 'status') {
        if (!data.user) {
            data.user = {screen_name: data.from_user, profile_image_url: data.profile_image_url, id: data.from_user_id};
            delete data.profile_image_url;
            delete data.from_user;
            delete data.from_user_id;
        }
        this.format_result_item(data.user, 'user', args);
        data.t_url = 'http://weibo.com/' + data.user.id + '/' + WeiboUtil.mid2url(data.mid);
        if (data.pic_urls && data.pic_urls.length > 1) {
            data.bmiddle_pic = [];
            data.original_pic = [];
            data.thumbnail_pic = [];
            for (var i = 0; i < data.pic_urls.length; i++) {
                var pic = data.pic_urls[i];
                data.thumbnail_pic.push(pic.thumbnail_pic);
                data.bmiddle_pic.push(pic.thumbnail_pic.replace('/thumbnail/', '/bmiddle/'));
                data.original_pic.push(pic.thumbnail_pic.replace('/thumbnail/', '/large/'));
            }
        }
        if (data.retweeted_status) {
            data.retweeted_status = this.format_result_item(data.retweeted_status, 'status', args);
        }
    } else if (play_load == 'message') {
        this.format_result_item(data.sender, 'user', args);
        this.format_result_item(data.recipient, 'user', args);
    } else if (play_load == 'comment') {
        this.format_result_item(data.user, 'user', args);
        this.format_result_item(data.status, 'status', args);
    }
    return data;
}, url_encode: function (text) {
    return text;
}, before_sendRequest: function (args, user) {
}, format_error: function (error, error_code, data) {
    if (this.config.ErrorCodes) {
        error = this.config.ErrorCodes[error] || error;
    }
    return error;
}, _sendRequest: function (params, callbackFn, context) {
    var args = {type: 'get', play_load: 'status', headers: {}};
    $.extend(args, params);
    args.data = args.data || {};
    args.data.source = args.data.source || this.config.source;
    if (args.need_source === false) {
        delete args.need_source;
        delete args.data.source;
    }
    if (!args.url) {
        showMsg('url未指定', true);
        callbackFn({}, 'error', '400');
        return;
    }
    var user = args.user || args.data.user || localStorage.getObject(CURRENT_USER_KEY);
    if (!user) {
        showMsg('用户未指定', true);
        callbackFn({}, 'error', 400);
        return;
    }
    args.user = user;
    if (args.data && args.data.user) {
        delete args.data.user;
    }
    this.before_sendRequest(args, user);
    if (!args.type || args.type.toUpperCase() === 'GET') {
        if (user.blogType !== 'tqq') {
            args.data.nocache = new Date().getTime();
        }
    }
    var api = user.apiProxy || args.apiHost || this.config.host;
    var url = api + args.url.format(args.data);
    if (args.play_load !== 'string' && this.config.result_format) {
        url += this.config.result_format;
    }
    var pattern = /\{\{([\w\s\.\(\)\'\",-]+)?\}\}/g;
    args.url.replace(pattern, function (match, key) {
        delete args.data[key];
    });
    this.apply_auth(url, args, user);
    var play_load = args.play_load;
    delete args.play_load;
    var callmethod = user.uniqueKey + ': ' + args.type + ' ' + args.url;
    var request_data = args.content || args.data;
    var processData = !args.content;
    var contentType = args.contentType || 'application/x-www-form-urlencoded';
    $.ajax({url: url, timeout: 60 * 1000, type: args.type, data: request_data, contentType: contentType, processData: processData, dataType: 'text', context: this, beforeSend: function (req) {
        for (var key in args.headers) {
            req.setRequestHeader(key, args.headers[key]);
        }
    }, success: function (data, textStatus, xhr) {
        var no_net_work = false;
        if (data === '' && textStatus === 'success' && xhr.status === 0 && xhr.statusText === '') {
            no_net_work = true;
            textStatus = 'error';
            data = {error: 'No network', error_code: 10000};
        }
        if (play_load !== 'string' && !no_net_work) {
            data = data.replace(RE_JSON_BAD_WORD, '');
            try {
                data = JSON.parse(data);
            }
            catch (err) {
                if (xhr.status == 201 || xhr.statusText == "Created") {
                    if (!data) {
                        data = true;
                    }
                } else {
                    if (data.indexOf('{"wrong":"no data"}') > -1 || data === '' || data.toLowerCase() == 'ok') {
                        data = [];
                    } else {
                        data = {error: callmethod + ' ' + _u.i18n("comm_error_return")
                            + ' ' + err.message, error_code: 500};
                        textStatus = 'error';
                    }
                }
            }
        }
        var error_code = null;
        if (data) {
            error_code = data.error_code || data.code;
            var error = data.error || data.error_msg;
            if (data.ret && data.ret !== 0) {
                if (data.msg === 'have no tweet') {
                    data.data = {info: []};
                } else if (data.ret === 4 && data.errcode === 0) {
                    error = null;
                    data = {};
                } else {
                    error = data.msg;
                    error_code = data.ret;
                }
            } else {
                if (data.ret !== undefined && (data.msg === 'have no tweet' || data.msg === 'have no user')) {
                    data.data = {info: []};
                }
            }
            if (!error && data.errors) {
                if (typeof(data.errors) === 'string') {
                    error = data.errors;
                } else if (data.errors.length) {
                    if (data.errors[0].message) {
                        error = data.errors[0].message;
                    } else {
                        for (var i in data.errors[0]) {
                            error += i + ': ' + data.errors[0][i];
                        }
                    }
                }
            }
            if (error || error_code) {
                data.error = error;
                textStatus = this.format_error(data.error || data.wrong || data.message || data.error_msg, error_code, data);
                var error_msg = callmethod + ' error: ' + textStatus;
                if (!textStatus && error_code) {
                    error_msg += ', error_code: ' + error_code;
                }
                error_code = error_code || 'unknow';
                showMsg(error_msg, false, true);
            } else {
                data = this.format_result(data, play_load, args);
            }
        } else {
            error_code = 999;
        }
        callbackFn && callbackFn.call(context, data, textStatus, error_code);
        hideLoading();
    }, error: function (xhr, textStatus, errorThrown) {
        var r = null, status = 'unknow';
        try {
            if (xhr) {
                if (xhr.status) {
                    status = xhr.status;
                }
                if (xhr.responseText) {
                    var r = xhr.responseText;
                    try {
                        r = JSON.parse(r);
                    }
                    catch (err) {
                        r = null;
                    }
                    if (r) {
                        if (typeof(r.error) === 'object') {
                            r = r.error;
                        }
                        var error_code = r.error_code || r.code || r.type;
                        r.error = this.format_error(r.error || r.wrong || r.message || r.error_text || r.msg, error_code, r);
                        if (!args.dont_show_error) {
                            var error_msg = callmethod + ' error: ' + r.error;
                            if (!r.error && error_code) {
                                error_msg += ', error_code: ' + error_code;
                            }
                            showMsg(error_msg, false, true);
                        }
                    }
                }
            }
        } catch (err) {
            r = null;
        }
        if (!r) {
            textStatus = textStatus ? ('textStatus: ' + textStatus + '; ') : '';
            errorThrown = errorThrown ? ('errorThrown: ' + errorThrown + '; ') : '';
            r = {error: callmethod + ' error: ' + textStatus + errorThrown + ' statuCode: ' + status};
            if (!args.dont_show_error) {
                showMsg(r.error, false, true);
            }
        }
        callbackFn.call(context, r || {}, 'error', status);
        hideLoading();
    }});
}};
function make_base_auth_header(user, password) {
    var tok = user + ':' + password;
    var hash = Base64.encode(tok);
    return"Basic " + hash;
}
function make_base_auth_url(domain, user, password) {
    return"http://" + user + ":" + password + "@" + domain;
}
var WeiboAPI2 = Object.inherits({}, sinaApi, {config: Object.inherits({}, sinaApi.config, {oauth_access_token: '/access_token', oauth_authorize: '/authorize', oauth_callback: 'https://api.weibo.com/oauth2/default.html', oauth_host: 'https://api.weibo.com/oauth2', support_direct_messages: false, support_sent_direct_messages: false, support_blocking: false, support_comments_mentions: true, support_like: true, host: 'https://api.weibo.com/2', verify_credentials: '/users/show', destroy: '/statuses/destroy', comments: '/comments/show', comments_timeline: '/comments/timeline', comments_mentions: '/comments/mentions', comment: '/comments/create', reply: '/comments/reply', comment_destroy: '/comments/destroy', support_search: false, search: '/search/topics', user_search: '/search/suggestions/users', user_timeline_need_friendship: false, followers: '/friendships/followers', friends: '/friendships/friends', }), apply_auth: function (url, args, user) {
    delete args.data.source;
    if (args.__refresh_access_token) {
        return;
    }
    if (user.oauth_token_key) {
        args.data.access_token = user.oauth_token_key;
    }
}, get_access_token: function (user, callback, context) {
    var params = {url: this.config.oauth_access_token, type: 'post', user: user, play_load: 'string', apiHost: this.config.oauth_host, data: {code: user.oauth_pin, client_id: this.config.oauth_key, client_secret: this.config.oauth_secret, redirect_uri: this.config.oauth_callback, grant_type: 'authorization_code'}, need_source: false};
    this._sendRequest(params, function (data, text_status, error_code) {
        data = JSON.parse(data);
        if (text_status !== 'error' && data && data.access_token) {
            user.oauth_token_key = data.access_token;
            user.oauth_expires_in = data.expires_in;
            user.oauth_token_type = data.token_type;
            user.oauth_refresh_token = data.refresh_token;
            user.oauth_remind_in = data.remind_in;
            user.uid = data.uid;
        } else {
            user = null;
            text_status = text_status || 'error';
            error_code = error_code || JSON.stringify(data);
        }
        callback.call(context, user, text_status, error_code);
    });
}, get_authorization_url: function (user, callback, context) {
    var params = {response_type: 'code', client_id: this.config.oauth_key, redirect_uri: this.config.oauth_callback, };
    var loginURL = this.config.oauth_host + this.config.oauth_authorize + '?';
    var args = [];
    for (var k in params) {
        args.push(k + '=' + encodeURIComponent(params[k]));
    }
    loginURL += args.join('&');
    callback.call(context, loginURL, 'success', 200);
}, url_encode: function (text) {
    return text;
}, before_sendRequest: function (args, user) {
    switch (args.url) {
        case this.config.verify_credentials:
            args.data.uid = user.uid;
            break;
        case this.config.friendships_destroy:
        case this.config.friendships_create:
            args.data.uid = args.data.id;
            delete args.data.id;
            break;
        case this.config.friends:
        case this.config.followers:
            if (args.data.user_id) {
                args.data.uid = args.data.user_id;
                delete args.data.user_id;
            }
            break;
    }
}, format_result: function (data, play_load, args) {
    var items = data;
    if (!$.isArray(items)) {
        items = data.results || data.users || data.statuses || data.comments || data.favorites || data.reposts;
    }
    if ($.isArray(items)) {
        var needs = [];
        for (var i = 0, l = items.length; i < l; i++) {
            items[i] = this.format_result_item(items[i], play_load, args);
        }
        if (data.statuses || data.comments || data.favorites || data.reposts) {
            data.items = items;
            delete data.statuses;
            delete data.comments;
            delete data.favorites;
            delete data.reposts;
        }
    } else {
        data = this.format_result_item(data, play_load, args);
        if (args.url === this.config.rate_limit_status) {
            if (data.limit_time_unit === 'HOURS') {
                data.hourly_limit = data.user_limit;
                data.remaining_hits = data.remaining_user_hits;
            }
        }
    }
    return data;
}, reset_count: function (data, callback, context) {
    callback.call(context);
}, });
WeiboAPI2._format_result_item = WeiboAPI2.format_result_item;
WeiboAPI2.format_result_item = function (data, play_load, args) {
    if (args.url === this.config.favorites && play_load === 'status' && data.favorited_time) {
        var status = data.status;
        status.favorited_time = data.favorited_time;
        status.favorited_tags = data.tags;
        data = status;
    }
    if (play_load === 'status' && data && data.deleted === '1') {
        if (!data.user) {
            data.user = {id: '0', profile_image_url: 'http://tp1.sinaimg.cn/7539050679/50/7539050679/1'};
        }
        return data;
    }
    data = this._format_result_item(data, play_load, args);
    if (data && play_load === 'user') {
        data.followed_by = data.following;
        data.following = data.follow_me;
    }
    return data;
};
var TQQAPI = Object.inherits({}, WeiboAPI2, {config: Object.inherits({}, WeiboAPI2.config, {host: 'https://open.t.qq.com/api', user_home_url: 'http://t.qq.com/', search_url: 'http://t.qq.com/k/', result_format: '', source: 'b6d893a83bd54e598b5a7c359599190a', oauth_key: 'b6d893a83bd54e598b5a7c359599190a', oauth_secret: '34ad78be42426de26e5c4b445843bb78', oauth_host: 'https://open.t.qq.com', oauth_authorize: '/cgi-bin/oauth2/authorize', oauth_access_token: '/cgi-bin/oauth2/access_token', oauth_callback: 'https://chrome.google.com/webstore/detail/fawave/aicelmgbddfgmpieedjiggifabdpcnln/callback', oauth_params_by_get: true, support_comment: true, support_do_comment: true, support_repost: true, support_direct_messages: true, support_sent_direct_messages: true, support_comment_repost: false, support_repost_comment: false, support_repost_comment_to_root: false, support_repost_timeline: true, support_favorites_max_id: true, support_comments_mentions: false, reply_dont_need_at_screen_name: true, rt_at_name: true, repost_delimiter: ' || ', support_counts: true, support_counts_max_id_num: 29, max_image_size: 4 * 1024 * 1024, latitude_field: 'wei', longitude_field: 'jing', friends_timeline: '/statuses/home_timeline', repost_timeline: '/t/re_list_repost', user_timeline_need_friendship: false, user_timeline_need_user: true, show_fullname: true, support_blocking: true, support_like: false, syncflag: 1, blocks_blocking: '/friends/blacklist', blocks_blocking_ids: '/friends/blacklist/ids', blocks_create: '/friends/addblacklist', blocks_destroy: '/friends/delblacklist', blocks_exists: '/friends/exists', mentions: '/statuses/mentions_timeline', followers: '/friends/user_fanslist', friends: '/friends/user_idollist', favorites: '/fav/list_t', favorites_create: '/fav/addt', favorites_destroy: '/fav/delt', counts: '/t/re_count', sub_counts: '/t/sub_re_count', status_show: '/t/show', update: '/t/add', upload: '/t/add_pic', repost: '/t/re_add', comment: '/t/comment', comments: '/t/re_list', destroy: '/t/del', destroy_msg: '/private/del', direct_messages: '/private/recv', sent_direct_messages: '/private/send', new_message: '/private/add', rate_limit_status: '/account/rate_limit_status', friendships_create: '/friends/add', friendships_destroy: '/friends/del', friendships_show: '/friends/check', reset_count: '/info/update', user_show: '/user/other_info', tags: '/tags', create_tag: '/tags/create', destroy_tag: '/tags/destroy', tags_suggestions: '/tags/suggestions', search: '/search/t', user_search: '/search/user', verify_credentials: '/user/info', gender_map: {0: 'n', 1: 'm', 2: 'f'}}), apply_auth: function (url, args, user) {
    var oauth_consumer_key = TQQAPI.config.oauth_key;
    delete args.data.source;
    if (args.__refresh_access_token) {
        return;
    }
    if (user.oauth_token_key) {
        args.data.access_token = user.oauth_token_key;
        args.data.oauth_consumer_key = oauth_consumer_key;
        args.data.openid = user.openid;
        args.data.oauth_version = '2.a';
        args.data.scope = 'all';
    }
}, get_access_token: function (user, callback, context) {
    var params = {url: this.config.oauth_access_token, type: 'post', user: user, play_load: 'string', apiHost: this.config.oauth_host, data: {code: user.oauth_pin, client_id: this.config.oauth_key, client_secret: this.config.oauth_secret, redirect_uri: this.config.oauth_callback, grant_type: 'authorization_code'}, need_source: false};
    this._sendRequest(params, function (data, text_status, error_code) {
        if (text_status !== 'error' && data) {
            data = decodeForm(data);
            user.oauth_token_key = data.access_token;
            user.oauth_expires_in = data.expires_in;
            user.oauth_token_type = data.token_type;
            user.oauth_refresh_token = data.refresh_token;
            user.oauth_remind_in = data.remind_in;
            user.uid = data.name;
            user.openid = data.openid;
        } else {
            user = null;
            text_status = text_status || 'error';
            error_code = error_code || JSON.stringify(data);
        }
        callback.call(context, user, text_status, error_code);
    });
}, RET_ERRORS: {0: '成功返回', 1: '参数错误', 2: '频率受限', 3: '鉴权失败', 4: '服务器内部错误'}, RET4_ERRCODES: {4: '表示有过多脏话', 5: '禁止访问', 6: '该记录不存在', 8: '内容超过最大长度：420字节 （以进行短url处理后的长度计）', 9: '包含垃圾信息：广告，恶意链接、黑名单号码等', 10: '发表太快，被频率限制', 11: '源微博已删除', 12: '源微博审核中', 13: '重复发表'}, RET3_ERRCODES: {1: '无效TOKEN,被吊销', 2: '请求重放', 3: 'access_token不存在', 4: 'access_token超时', 5: 'oauth 版本不对', 6: 'oauth 签名方法不对', 7: '参数错', 8: '处理失败', 9: '验证签名失败', 10: '网络错误', 11: '参数长度不对', 12: '处理失败12', 13: '处理失败13', 14: '处理失败14', 15: '处理失败15'}, format_error: function (error_msg, error_code, err) {
    var message = null;
    if (err) {
        if (err.ret === 3) {
            message = this.RET3_ERRCODES[err.errcode];
        } else if (err.ret === 4) {
            message = this.RET4_ERRCODES[err.errcode];
        }
        if (!message) {
            message = this.RET_ERRORS[err.ret];
            if (message) {
                message += ': ' + error_msg;
            }
        }
    }
    return message || error_msg;
}, _VIDEO_PADDING: '!!!{{status.video.shorturl}}!!!', EMOTION_MAP: {1: '狂喜', 2: '偷乐', 3: '无感', 4: '伤心', 5: '咆哮'}, processMsg: function (status, notEncode) {
    var statusText;
    if (status.video && status.video.picurl && status.text) {
        if (status.text.indexOf(status.video.shorturl) < 0) {
            status.text += ' ' + status.video.shorturl;
        }
        var text = status.text.replace(status.video.shorturl, this._VIDEO_PADDING);
        var s = this.super_.processMsg.call(this, text, notEncode);
        var video_html = '<a href="' + status.video.realurl + '" title="' +
            status.video.title + '" target="_blank" class="link">' + status.video.shorturl + '</a>';
        s = s.replace(this._VIDEO_PADDING, video_html);
        s += '<br/><img class="video_image" title="' + status.video.title + '" src="' + status.video.picurl + '" />';
        statusText = s;
    } else {
        statusText = this.super_.processMsg.call(this, status, notEncode);
    }
    if (status.emotionurl) {
        var title = this.EMOTION_MAP[status.emotiontype] || ('未知心情:' + status.emotiontype);
        statusText = '<img src="' + status.emotionurl + '" alt="' + title + '" title="' + title + '" />' + statusText;
    }
    if ((!statusText || statusText === '&nbsp;') && status._type === 2) {
        statusText = '转播';
    }
    return statusText;
}, _emotion_rex: window.TQQ_EMOTIONS_ALL ? new RegExp('\/(' +
    Object.keys(window.TQQ_EMOTIONS_ALL).join('|') + ')', 'g') : null, _shuoshuo_emotion_rex: /\[em\](\w+)\[\/em\]/g, processEmotional: function (str) {
    if (!this._emotion_rex) {
        return str;
    }
    str = str.replace(this._shuoshuo_emotion_rex, function (m, g1) {
        if (g1) {
            return'<img src="http://qzonestyle.gtimg.cn/qzone/em/' + g1 + '.gif" />';
        }
    });
    return str.replace(this._emotion_rex, function (m, g1) {
        if (window.TQQ_EMOTIONS_ALL && g1) {
            var emotion = window.TQQ_EMOTIONS_ALL[g1];
            if (emotion) {
                var tpl;
                if (emotion.indexOf('http://') >= 0) {
                    tpl = '<img title="{{title}}" src="{{emotion}}" />';
                } else {
                    tpl = '<img title="{{title}}" src="' + TQQ_EMOTIONS_URL_PRE + '{{emotion}}" />';
                }
                return tpl.format({title: g1, emotion: emotion});
            }
        }
        return m;
    });
}, AT_USER_RE: /([^#])?@([\w\-\_]+)/g, ONLY_AT_USER_RE: /@([\w\-\_]+)/g, processAt: function (str, status) {
    var tpl = '{{m1}}<a class="getUserTimelineBtn" href="" data-screen_name="{{m2}}" rhref="' +
        this.config.user_home_url + '{{m2}}" title="' +
        _u.i18n("btn_show_user_title") + '">{{username}}</a>';
    return str.replace(this.AT_USER_RE, function (match, $1, $2) {
        var users = status.users || {};
        var username = users[$2];
        if (username) {
            username += '(@' + $2 + ')';
        } else {
            username = '@' + $2;
        }
        var data = {m1: $1 || '', m2: $2, username: username};
        return tpl.format(data);
    });
}, url_encode: function (text) {
    return text;
}, rate_limit_status: function (data, callback, context) {
    callback.call(context, {error: _u.i18n("comm_no_api")});
}, format_upload_params: function (user, data, pic) {
    if (data.status) {
        data.content = data.status;
        delete data.status;
    }
    data.format = 'json';
    delete data.source;
}, upload: function (user, data, pic, before_request, onprogress, callback, context) {
    if (data && (data.syncflag === null || data.syncflag === undefined)) {
        data.syncflag = this.config.syncflag;
    }
    this.super_.upload.call(this, user, data, pic, before_request, onprogress, function (result, text_status, error_code) {
        if (result && result.data) {
            result = result.data;
        }
        if (text_status !== 'error' && result && !result.error && result.id) {
            this.status_show({user: user, id: result.id}, callback, context);
        } else {
            callback.apply(context, arguments);
        }
    }, this);
}, _get_friendships: function (user, followers_args, callback, context) {
    var ids = [];
    var result = followers_args[0];
    if (result && result.items) {
        for (var i = 0, len = result.items.length; i < len; i++) {
            ids.push(String(result.items[i].id));
        }
    }
    if (ids.length > 0) {
        this.friendships_show({user: user, target_ids: ids.join(',')}, function () {
            var infos = arguments[0];
            if (infos) {
                for (var i = 0, len = result.items.length; i < len; i++) {
                    var user = result.items[i];
                    var info = infos[user.id];
                    if (info) {
                        for (var k in info) {
                            user[k] = info[k];
                        }
                    }
                }
            }
            callback.apply(context, followers_args);
        });
    } else {
        callback.apply(context, followers_args);
    }
}, user_search: function (data, callback, context) {
    var user = data.user;
    this.super_.user_search.call(this, data, function () {
        this._get_friendships(user, arguments, callback, context);
    }, this);
}, followers: function (data, callback, context) {
    var user = data.user;
    this.super_.followers.call(this, data, function () {
        this._get_friendships(user, arguments, callback, context);
    }, this);
}, friends: function (data, callback, context) {
    var user = data.user;
    this.super_.friends.call(this, data, function () {
        this._get_friendships(user, arguments, callback, context);
    }, this);
}, reset_count: function (data, callback, context) {
    if (data.type === 1) {
        return callback.call(context, true);
    }
    data.op = 1;
    if (data.type === 2) {
        data.type = 6;
    } else if (data.type === 3) {
        data.type = 7;
    } else if (data.type === 4) {
        data.type = 8;
    }
    var params = {url: this.config.reset_count, type: 'get', play_load: 'result', data: data};
    this._sendRequest(params, callback, context);
}, sub_counts: function (data, callback, context) {
    var params = {url: this.config.sub_counts, type: 'get', play_load: 'json', data: data};
    this._sendRequest(params, callback, context);
}, before_sendRequest: function (args, user) {
    if (args.play_load === 'string') {
        return;
    }
    args.data.format = 'json';
    if (args.data.count) {
        args.data.reqnum = args.data.count;
        delete args.data.count;
    }
    if (args.data.since_id) {
        args.data.pagetime = args.data.since_id;
        args.data.pageflag = args.data.pageflag === undefined ? 2 : args.data.pageflag;
        delete args.data.since_id;
    }
    if (args.data.max_id) {
        args.data.pagetime = args.data.max_id;
        args.data.pageflag = 1;
        delete args.data.max_id;
    }
    var content = args.data.status || args.data.text || args.data.comment;
    if (content) {
        args.data.content = content;
        delete args.data.status;
        delete args.data.text;
        delete args.data.comment;
    }
    if (args.url === this.config.user_timeline || args.url === this.config.mentions || args.url === this.config.friends_timeline) {
        args.data.type = 0x1 | 0x2 | 0x8 | 0x10 | 0x20;
    }
    switch (args.url) {
        case this.config.counts:
            args.data.flag = 2;
            break;
        case this.config.new_message:
        case this.config.user_timeline:
            if (args.data.id) {
                args.data.name = args.data.id;
                delete args.data.id;
            } else if (args.data.screen_name) {
                args.data.name = args.data.screen_name;
                delete args.data.screen_name;
            }
            break;
        case this.config.blocks_blocking:
            if (args.data.page) {
                args.data.startindex = (parseInt(args.data.page, 10) - 1) * args.data.reqnum;
            }
            break;
        case this.config.blocks_create:
        case this.config.blocks_destroy:
            args.data.name = args.data.user_id || args.data.screen_name;
            delete args.data.user_id;
            delete args.data.screen_name;
            break;
        case this.config.comments:
            args.data.flag = 1;
            args.data.rootid = args.data.id;
            delete args.data.id;
            break;
        case this.config.repost_timeline:
            args.url = args.url.replace('_repost', '');
            args.data.flag = 0;
            args.data.rootid = args.data.id;
            delete args.data.id;
            break;
        case this.config.reply:
            args.url = this.config.comment;
            args.data.content = '回复@' + args.data.reply_user_id + ':' + args.data.content;
            args.data.reid = args.data.id;
            delete args.data.id;
            delete args.data.reply_user_id;
            delete args.data.cid;
            break;
        case this.config.comment:
            args.data.reid = args.data.id;
            delete args.data.id;
            break;
        case this.config.repost:
            args.data.reid = args.data.id;
            delete args.data.id;
            break;
        case this.config.friendships_destroy:
        case this.config.friendships_create:
        case this.config.user_show:
            args.data.name = args.data.id || args.data.screen_name;
            delete args.data.id;
            break;
        case this.config.followers:
        case this.config.friends:
            args.data.startindex = args.data.cursor;
            args.data.name = args.data.user_id;
            if (String(args.data.startindex) === '-1') {
                args.data.startindex = '0';
            }
            if (args.data.reqnum > 30) {
                args.data.reqnum = 30;
            }
            delete args.data.cursor;
            delete args.data.user_id;
            break;
        case this.config.search:
        case this.config.user_search:
            args.data.keyword = args.data.q;
            args.data.pagesize = args.data.reqnum;
            delete args.data.reqnum;
            delete args.data.q;
            break;
        case this.config.update:
            if (args.data.sina_id) {
                args.data.reid = args.data.sina_id;
                delete args.data.sina_id;
                args.url = '/t/reply';
            }
            break;
        case this.config.friendships_show:
            args.data.flag = 2;
            args.data.names = args.data.target_ids || args.data.target_id;
            delete args.data.target_screen_name;
            delete args.data.target_id;
            delete args.data.target_ids;
            break;
        case this.config.comments_timeline:
            args.url = this.config.mentions;
            args.data.type = 0x40;
            break;
    }
    if (args.url === this.config.update) {
        if (args.data.content) {
            var urls = UrlUtil.findUrls(args.data.content) || [];
            for (var i = 0, len = urls.length; i < len; i++) {
                var url = urls[i];
                if (VideoService.is_qq_support(url)) {
                    args.url = '/t/add_video';
                    args.data.url = url;
                    break;
                }
            }
        }
        if (args.data.syncflag === null || args.data.syncflag === undefined) {
            args.data.syncflag = this.config.syncflag;
        }
    }
}, format_result: function (data, play_load, args) {
    if (play_load === 'string') {
        return data;
    }
    if (args.url === this.config.friendships_create || args.url === this.config.friendships_destroy) {
        return true;
    }
    if (!data.data && data.msg === 'ok') {
        return true;
    }
    data = data.data;
    if (!data) {
        return data;
    }
    var items = data.info || data;
    delete data.info;
    var users = data.user || {};
    if (!$.isArray(items)) {
        items = data.results || data.users;
    }
    if ($.isArray(items)) {
        for (var i = 0, l = items.length; i < l; i++) {
            items[i] = this.format_result_item(items[i], play_load, args, users);
        }
        data.items = items;
        if (data.user && !data.user.id) {
            delete data.user;
        }
        if (args.url === this.config.followers || args.url === this.config.friends) {
            if (data.items.length >= parseInt(args.data.reqnum, 10)) {
                var start_index = parseInt(args.data.startindex, 10) || 0;
                if (start_index === -1) {
                    start_index = 0;
                }
                data.next_cursor = start_index + data.items.length;
            } else {
                data.next_cursor = '0';
            }
        }
    } else {
        data = this.format_result_item(data, play_load, args, users);
    }
    var item;
    if (args.url === this.config.friendships_show) {
        if (data) {
            for (var key in data) {
                item = data[key];
                item.following = !!item.isfans;
                item.followed_by = !!item.isidol;
                item.blacked_by = !!item.ismyblack;
                item.name = item.id = key;
            }
            var keys = Object.keys(data);
            if (keys.length === 1) {
                data = data[keys[0]];
            }
        }
    } else if (args.url === this.config.counts) {
        if (data) {
            var items = [];
            for (var k in data) {
                var item = {};
                var d = data[k];
                item.id = k;
                item.rt = d.count;
                item.comments = d.mcount;
                items.push(item);
            }
            data = items;
        }
    }
    return data;
}, format_result_item: function (data, play_load, args, users, need_user) {
    if (play_load === 'user' && data && data.name) {
        var user = {};
        user.t_url = 'http://t.qq.com/' + data.name;
        user.screen_name = data.nick;
        user.id = data.name;
        user.name = data.name;
        user.province = data.province_code;
        user.city = data.city_code;
        user.verified = data.isvip;
        user.verified_reason = data.verifyinfo;
        if (data.isent) {
            user.verified_type = data.isent;
        }
        user.gender = this.config.gender_map[data.sex || 0];
        if (data.head) {
            user.profile_image_url = data.head + '/50';
        } else {
            user.profile_image_url = 'http://mat1.gtimg.com/www/mb/images/head_50.jpg';
        }
        user.followers_count = data.fansnum;
        user.friends_count = data.idolnum;
        user.statuses_count = data.tweetnum;
        user.favourites_count = data.favnum;
        user.description = data.introduction;
        user.email = data.email;
        user.homepage = data.homepage;
        user.bi_followers_count = data.mutual_fans_num;
        if (data.birth_day) {
            user.birthday = data.birth_year + '-' + data.birth_month + '-' + data.birth_day;
        }
        if (data.comp && data.comp.length > 0) {
            user.jobs = [];
            for (var i = 0; i < data.comp.length; i++) {
                var comp = data.comp[i];
                var end = comp.end_year > 3000 ? '' : comp.end_year;
                var job = '(' + comp.begin_year + '-' + end + ')' + comp.company_name;
                if (comp.department_name) {
                    job += '-' + comp.department_name;
                }
                user.jobs.push(job);
            }
        }
        if (data.tag) {
            user.tags = data.tag;
            for (var j = 0, len = user.tags.length; j < len; j++) {
                var tag = user.tags[j];
                tag.url = 'http://t.qq.com/search/tag.php?k=#' + tag.name;
            }
        }
        user.following = !!data.ismyfans;
        user.followed_by = !!data.ismyidol;
        user.blocking = user.blacked_by = !!data.ismyblack;
        if (data.tweet && data.tweet.length > 0) {
            data.tweet[0].origtext = data.tweet[0].origtext || data.tweet[0].text;
            user.status = this.format_result_item(data.tweet[0], 'status', args, users, false);
        }
        return user;
    }
    if (play_load === 'status' || play_load === 'comment' || play_load === 'message') {
        var status = {};
        if (data.type === 7) {
            status.status_type = 'comments_timeline';
        }
        status.t_url = 'http://t.qq.com/p/t/' + data.id;
        status.id = data.id;
        status.text = data.origtext;
        if (args.url !== this.config.comments && args.url !== this.config.favorites && play_load !== 'message' && status.text) {
            status.text = htmldecode(status.text);
        }
        status.created_at = new Date(data.timestamp * 1000);
        status.timestamp = data.timestamp;
        status.video = data.video;
        status.music = data.music;
        status.emotiontype = data.emotiontype;
        status.emotionurl = data.emotionurl;
        status._type = data.type;
        if (data.image) {
            status.thumbnail_pic = data.image[0] + '/160';
            status.bmiddle_pic = data.image[0] + '/460';
            status.original_pic = data.image[0] + '/2000';
        }
        if (data.source) {
            if (data.type === 4) {
                status.text = '@' + data.source.name + ' ' + status.text;
                status.related_dialogue_url = 'http://t.qq.com/p/r/' + status.id;
                status.in_reply_to_status_id = data.source.id;
                status.in_reply_to_screen_name = data.source.nick;
            } else {
                status.retweeted_status = this.format_result_item(data.source, 'status', args, users);
                if (play_load === 'comment') {
                    status.status = status.retweeted_status;
                    delete status.retweeted_status;
                }
            }
        }
        status.repost_count = data.count || 0;
        status.comments_count = data.mcount || 0;
        status.source = data.from;
        if (data.fromurl) {
            status.source = '<a href="' + data.fromurl + '">' + status.source + '</a>';
        }
        if (need_user !== false) {
            status.user = this.format_result_item(data, 'user', args, users);
        }
        if (data.toname) {
            status.recipient = {name: data.toname, nick: data.tonick, isvip: data.toisvip, head: data.tohead};
            status.recipient = this.format_result_item(status.recipient, 'user', args, users);
        }
        if (status && status.text) {
            var matchs = status.text.match(this.ONLY_AT_USER_RE);
            if (matchs) {
                status.users = {};
                for (var j = 0; j < matchs.length; j++) {
                    var name = $.trim(matchs[j]).substring(1);
                    status.users[name] = users[name];
                }
            }
        }
        if (!status.text && data.status === 3) {
            status.text = '对不起，原文已经被作者删除。';
        }
        return status;
    }
    return data;
}});
var TSohuAPI = Object.inherits({}, sinaApi, {config: Object.inherits({}, sinaApi.config, {host: 'http://api.t.sohu.com', user_home_url: 'http://t.sohu.com/n/', search_url: 'http://t.sohu.com/k/', source: '5vi74qXPB5J97GNzsevN', oauth_key: '5vi74qXPB5J97GNzsevN', oauth_secret: 'fxZbb-07bCvv-BCA1Qci2lO^7wnl0%pRE$mvG1K#', support_max_id: true, support_search_max_id: false, support_comment: true, support_repost_comment: false, support_repost_comment_to_root: false, support_repost_timeline: false, support_direct_messages: true, support_sent_direct_messages: true, favorites: '/favourites', favorites_create: '/favourites/create/{{id}}', favorites_destroy: '/favourites/destroy/{{id}}', repost: '/statuses/transmit/{{id}}', friendships_create: '/friendship/create/{{id}}', friendships_destroy: '/friendship/destroy/{{id}}', friends: '/statuses/friends/{{user_id}}', followers: '/statuses/followers/{{user_id}}', mentions: '/statuses/mentions_timeline', comments: '/statuses/comments/{{id}}', reply: '/statuses/comment', support_blocking: false, user_timeline: '/statuses/user_timeline/{{id}}', ErrorCodes: {"Reached max access time per hour.": "已达到请求数上限", "Could not follow user: id is already on your list": "已跟随", "You are not friends with the specified user": "你没有跟随他", "can't send direct message to user who is not your follower!": "不能发私信给没有跟随你的人"}}), processEmotional: function (str) {
    return str.replace(/\[([\u4e00-\u9fff,\uff1f,\w]{1,10})\]/g, this.replaceEmotional);
}, replaceEmotional: function (m, g1) {
    var tpl = '<img title="{{title}}" src="{{src}}" />';
    if (g1) {
        var face = TSOHU_EMOTIONS[g1];
        if (face) {
            return tpl.format({title: m, src: TSOHU_EMOTIONS_URL_PRE + face});
        }
    }
    return m;
}, reset_count: function (data, callback, context) {
    callback.call(context);
}, format_upload_params: function (user, data, pic) {
    for (var k in data) {
        data[k] = encodeURIComponent(data[k]);
    }
}, before_sendRequest: function (args) {
    if (args.url == this.config.new_message) {
        args.data.user = args.data.id;
        delete args.data.id;
    } else if (args.url === this.config.destroy || args.url === this.config.destroy_msg) {
        args.type = 'delete';
        if (args.url === this.config.destroy_msg) {
        }
    } else if (args.url === this.config.search) {
        args.data.rpp = args.data.count;
        delete args.data.count;
    } else if (args.url === this.config.user_timeline) {
        if (!args.data.id) {
            args.data.id = args.data.screen_name;
        }
    }
}, format_result: function (data, play_load, args) {
    var items = data;
    if (data.statuses || data.comments) {
        items = data.statuses || data.comments;
        data.items = items;
        delete data.statuses;
        delete data.comments;
    } else if (data.users) {
        items = data.users;
    }
    if ($.isArray(items)) {
        for (var i in items) {
            items[i] = this.format_result_item(items[i], play_load, args);
        }
        if (items.length == 0) {
            data.next_cursor = '0';
        }
    } else {
        data = this.format_result_item(data, play_load, args);
    }
    if (data.cursor_id) {
        data.next_cursor = data.cursor_id;
        delete data.cursor_id;
    }
    return data;
}, format_result_item: function (data, play_load, args) {
    if (play_load === 'status' && data.id) {
        data.text = htmldecode(data.text);
        data.thumbnail_pic = data.small_pic;
        delete data.small_pic;
        data.bmiddle_pic = data.middle_pic;
        delete data.middle_pic;
        var tpl = 'http://t.sohu.com/m/';
        if (data.in_reply_to_status_text) {
            data.retweeted_status = {id: data.in_reply_to_status_id, text: htmldecode(data.in_reply_to_status_text), has_image: data.in_reply_to_has_image, user: {id: data.in_reply_to_user_id, screen_name: data.in_reply_to_screen_name}, t_url: tpl + data.in_reply_to_status_id};
            this.format_result_item(data.retweeted_status.user, 'user', args);
            delete data.in_reply_to_has_image;
            delete data.in_reply_to_status_text;
        }
        data.t_url = tpl + data.id;
        this.format_result_item(data.user, 'user', args);
    } else if (play_load === 'comment' && data.id) {
        data.status = {id: data.in_reply_to_status_id, text: htmldecode(data.in_reply_to_status_text), user: {id: data.in_reply_to_user_id, screen_name: data.in_reply_to_screen_name}};
        data.text = htmldecode(data.text);
    } else if (play_load === 'user' && data && data.id) {
        data.t_url = 'http://t.sohu.com/u/' + (data.domain || data.id);
    } else if (play_load === 'message') {
        data.text = htmldecode(data.text);
        this.format_result_item(data.sender, 'user', args);
        this.format_result_item(data.recipient, 'user', args);
    } else if (play_load === 'count') {
        data.rt = data.transmit_count;
        data.comments = data.comments_count;
        delete data.transmit_count;
        delete data.comments_count;
    }
    if (data && data.cursor_id) {
        data.next_cursor = data.cursor_id;
    }
    return data;
}});
var DiguAPI = Object.inherits({}, sinaApi, {config: Object.inherits({}, sinaApi.config, {host: 'http://api.minicloud.com.cn', user_home_url: 'http://t.digu.com/', search_url: 'http://digu.com/search/', source: 'fawave', support_comment: false, support_do_comment: false, support_double_char: false, support_repost: false, support_comment_repost: false, support_repost_timeline: false, support_max_id: false, support_sent_direct_messages: false, support_auto_shorten_url: false, repost_pre: '转载:', support_search_max_id: false, user_timeline_need_friendship: false, support_blocking: false, verify_credentials: '/account/verify', mentions: '/statuses/replies', destroy_msg: '/messages/handle/destroy/{{id}}', direct_messages: '/messages/100', new_message: '/messages/handle/new', upload: '/statuses/update', repost: '/statuses/update', comment: '/statuses/update', reply: '/statuses/update', search: '/search_statuses', user_search: '/search_user', gender_map: {0: 'n', 1: 'm', 2: 'f'}, ErrorCodes: {'-1': '服务器错误', '0': '未知原因', '1': '用户名或者密码为空', '2': '用户名或者密码错误', '3': '访问的URL不正确', '4': 'id指定的记录信息不存在。', '5': '重复发送', '6': '包含敏感非法关键字，禁止发表', '7': '包含敏感信息进入后台审核', '8': '认证帐号被关小黑屋，被禁言，不能够发表信息了。', '9': '表示发送悄悄话失败', '10': '没有操作权限（比如删除只能删除自己发的，或者自己收藏的，或者自己收到的信息）', '11': '指定的用户不存在', '12': '注册的用户已经存在', '13': '表单值是空值，或者没有合法的颜色值，没有修改。修改失败。', '14': '上传文件异常，请检查是否符合要求', '15': '更新用户信息失败。', '16': '删除失败，删除收藏夹分类时，分类的名字是必须的。', '17': '删除失败，删除收藏夹分类时,分类不存在', '18': '传递过来的参数为空或者异常', '19': '重复收藏', '20': '只能给跟随自己的人发送信息', '21': '用户名、昵称或者密码不合法，用户名、昵称或者密码必须是4-12位，只支持字母、数字、下划线', '22': '两次输入的秘密不正确', '23': 'Email格式不正确。', '24': '这个的帐号已被占用', '25': '发送太频繁，帐号暂时被封', '26': '服务器繁忙或者你访问的频率太高，超出了规定的限制', '27': '对不起，你的ip被官方封掉了，请联系我们的工作人员，进行相关处理', '28': '对不起，用户昵称中包含非法关键字。', '9': '对不起，所在地包含非法关键字。', '30': '对不起，个人兴趣包含非法关键字。', '31': '对不起，签名（个人简介）包含非法关键字。', '32': '对不起，昵称已经被占用', '33': 'Http请求方法不正确'}}), processAt: function (str) {
    str = str.replace(/^@([\w\-\u4e00-\u9fa5|\_]+)/g, '<a target="_blank" href="http://digu.com/search/friend/' + '$1" title="点击打开用户主页">@$1</a>');
    str = str.replace(/([^\w#])@([\w\-\u4e00-\u9fa5|\_]+)/g, '$1<a target="_blank" href="http://digu.com/search/friend/' + '$2" title="点击打开用户主页">@$2</a>');
    return str;
}, searchMatchReg: /(^|[^a-zA-Z0-9\/])(#)([\w\u4e00-\u9fa5|\_]+)/g, processSearch: function (str) {
    return str.replace(this.searchMatchReg, '$1<a title="Search $2$3" href="'
        + this.config.search_url + '%23$3" target="_blank">$2$3</a>');
}, findSearchText: function (str) {
    var matchs = str.match(this.searchMatchReg);
    var result = [];
    if (matchs) {
        for (var i = 0, len = matchs.length; i < len; i++) {
            var s = matchs[i].trim();
            result.push([s, s.substring(1)]);
        }
    }
    return result;
}, formatSearchText: function (str) {
    return'#' + str.trim();
}, processEmotional: function (str) {
    return str.replace(/\[:(\d{2})\]|\{([\u4e00-\u9fa5,\uff1f]{2,})\}/g, this._replaceEmotional);
}, _replaceEmotional: function (m, g, g2) {
    if (g2 && window.DIGU_EMOTIONS && DIGU_EMOTIONS[g2]) {
        return'<img src="http://images.digu.com/web_res_v1/emotion/' + DIGU_EMOTIONS[g2] + '.gif" />';
    } else if (g && (g > 0) && (g < 33)) {
        return'<img src="http://images.digu.com/web_res_v1/emotion/' + g + '.gif" />';
    } else {
        return m;
    }
}, rate_limit_status: function (data, callback, context) {
    callback.call(context, {error: _u.i18n("comm_no_api")});
}, reset_count: function (data, callback, context) {
    callback.call(context);
}, counts: function (data, callback, context) {
    callback.call(context);
}, comments_timeline: function (data, callback, context) {
    callback.call(context);
}, before_sendRequest: function (args) {
    if (args.url === this.config.update) {
        if (args.data.status) {
            args.data.content = args.data.status;
            delete args.data.status;
        }
        if (args.data.sina_id) {
            args.data.digu_id = args.data.sina_id;
            delete args.data.sina_id;
        }
    } else if (args.url === this.config.friends || args.url === this.config.followers) {
        args.data.page = args.data.cursor == '-1' ? 1 : args.data.cursor;
        delete args.data.cursor;
        if (!args.data.page) {
            args.data.page = 1;
        }
        if (args.data.user_id) {
            args.data.friendUserIdOrName = args.data.user_id;
        }
        delete args.data.user_id;
        delete args.data.screen_name;
    } else if (args.url === this.config.new_message) {
        args.data.content = args.data.text;
        args.data.receiveUserId = args.data.id;
        args.data.message = 0;
        delete args.data.text;
        delete args.data.id;
    } else if (args.url === this.config.friendships_create || args.url === this.config.friendships_destroy) {
        args.data.userIdOrName = args.data.id;
        args.type = 'get';
        delete args.data.source;
        delete args.data.id;
    } else if (args.url === this.config.user_timeline) {
        if (args.data.id) {
            args.data.name = args.data.id;
            delete args.data.id;
        } else if (args.data.screen_name) {
            args.data.userIdOrName = args.data.screen_name;
            delete args.data.screen_name;
        }
    } else if (args.url === this.config.verify_credentials) {
        args.data.isAllInfo = true;
        delete args.data.source;
    }
    if (args.data.userIdOrName) {
        args.data.userIdOrName = this.url_encode(args.data.userIdOrName);
    }
}, format_upload_params: function (user, data, pic) {
    data.uploadImg = 'xiexiezhichi';
    data.content = data.status;
    delete data.status;
    pic.keyname = 'image0';
}, format_result: function (data, play_load, args) {
    if (data.wrong === 'no data') {
        data = [];
    }
    if (args.url === this.config.friendships_create) {
        if (data.result === 0) {
            data.message = '你被该用户屏蔽，不能与他成为好友关系';
            data.success = true;
        } else if (data.result === 1) {
            data = true;
        } else if (data.result === 2) {
            data.message = '已经跟随';
            data.success = true;
        } else if (data.result === 3) {
            data.message = '用户设置了隐私保护，已经提交了跟随申请';
            data.success = true;
        } else if (data.result === -1) {
            data.success = false;
        } else if (data.result === -2) {
            data.message = '你跟随的人数超过了1000';
            data.success = false;
        } else if (data.result === -3) {
            data.message = '他设置了隐私保护，无法跟随';
            data.success = false;
        }
        return data;
    }
    if ($.isArray(data)) {
        for (var i in data) {
            data[i] = this.format_result_item(data[i], play_load);
        }
    } else {
        data = this.format_result_item(data, play_load);
    }
    if (args.url === this.config.followers || args.url === this.config.friends) {
        data = {users: data, next_cursor: Number(args.data.page) + 1, previous_cursor: args.data.page};
        if (data.users.length === 0) {
            data.next_cursor = '0';
        }
    }
    return data;
}, format_result_item: function (data, play_load, args) {
    if (play_load === 'status' && data.id) {
        data.favorited = data.favorited === 'true';
        if (data.picPath && data.picPath.length > 0) {
            data.thumbnail_pic = data.picPath[0];
            data.bmiddle_pic = data.thumbnail_pic.replace(/([\/_])100x75/, function (m, $1) {
                return $1 + '640x480';
            });
            data.original_pic = data.thumbnail_pic.replace(/[\/_]100x75/, '');
        }
        delete data.picPath;
        var tpl = 'http://t.digu.com/detail/';
        if (data.in_reply_to_status_id !== '0' && data.in_reply_to_status_id !== '') {
            data.related_dialogue_url = 'http://t.digu.com/relatedDialogue/' + data.id;
        }
        data.t_url = tpl + data.id;
        this.format_result_item(data.user, 'user', args);
    } else if (play_load === 'user' && data && data.id) {
        data.id = data.name || data.id;
        data.t_url = 'http://t.digu.com/' + (data.name || data.id);
        data.gender = this.config.gender_map[data.gender];
        if (data.profile_image_url) {
            data.profile_image_url = data.profile_image_url.replace(/([\/_])24x24/, function (m, $1) {
                return $1 + '48x48';
            });
        }
    } else if (play_load === 'comment') {
        this.format_result_item(data.user, 'user', args);
    } else if (play_load === 'message') {
        this.format_result_item(data.sender, 'user', args);
        this.format_result_item(data.recipient, 'user', args);
    }
    if (data.text) {
        data.text = htmldecode(data.text);
    }
    return data;
}});
var LeiHouAPI = Object.inherits({}, sinaApi, {config: Object.inherits({}, sinaApi.config, {host: 'http://leihou.com', user_home_url: 'http://leihou.com/', source: 'fawave', repost_pre: 'RT', support_double_char: false, support_comment: false, support_do_comment: false, support_repost: false, support_comment_repost: false, support_repost_timeline: false, support_sent_direct_messages: false, support_favorites: false, support_do_favorite: false, support_destroy_msg: false, support_user_search: false, support_auto_shorten_url: false, user_timeline_need_friendship: false, support_blocking: false, upload: '/statuses/update', repost: '/statuses/update', comment: '/statuses/update', search: '/search'}), url_encode: function (text) {
    return text;
}, rate_limit_status: function (data, callback, context) {
    callback.call(context, {error: _u.i18n("comm_no_api")});
}, comments_timeline: function (data, callback, context) {
    callback.call(context);
}, reset_count: function (data, callback, context) {
    callback.call(context);
}, counts: function (data, callback, context) {
    callback.call(context);
}, before_sendRequest: function (args) {
    if (args.url === this.config.friends || args.url === this.config.followers) {
        args.data.page = args.data.cursor == '-1' ? 1 : args.data.cursor;
        delete args.data.cursor;
        if (!args.data.page) {
            args.data.page = 1;
        }
    } else if (args.url === this.config.repost) {
        if (args.data.sina_id) {
            args.data.in_reply_to_status_id = args.data.sina_id;
            delete args.data.sina_id;
        }
    } else if (args.url === this.config.new_message) {
        args.data.user = args.data.id;
        delete args.data.id;
    }
}, format_result: function (data, play_load, args) {
    if ($.isArray(data)) {
        for (var i in data) {
            data[i] = this.format_result_item(data[i], play_load, args);
        }
    } else {
        data = this.format_result_item(data, play_load, args);
    }
    if (args.url === this.config.followers || args.url === this.config.friends) {
        data = {users: data, next_cursor: args.data.page + 1, previous_cursor: args.data.page};
        if (data.users.length === 0) {
            data.next_cursor = 0;
        }
    }
    return data;
}, format_result_item: function (data, play_load, args) {
    if (play_load === 'status' && data.id) {
        var pic = /http:\/\/pic\.leihou\.com\/(\w+)/.exec(data.text);
        if (pic && pic.length === 2) {
            data.thumbnail_pic = 'http://pic.leihou.com/pic/' + pic[1] + '_medium.jpg';
            data.bmiddle_pic = 'http://pic.leihou.com/pic/' + pic[1] + '_large.jpg';
            data.original_pic = data.bmiddle_pic;
        }
        var tpl = 'http://leihou.com/{{user.screen_name}}/lei/{{id}}';
        if (data.in_reply_to_status_id) {
            data.retweeted_status = {id: data.in_reply_to_status_id, user: {id: data.in_reply_to_user_id, screen_name: data.in_reply_to_screen_name, name: data.in_reply_to_screen_name}};
            data.related_dialogue_url = 'http://leihou.com/dialog/' + data.id;
            this.format_result_item(data.retweeted_status.user, 'user', args);
            data.retweeted_status.t_url = tpl.format(data.retweeted_status);
        }
        this.format_result_item(data.user, 'user', args);
        data.t_url = tpl.format(data);
    } else if (play_load === 'user' && data && data.id) {
        if (data.user) {
            data = data.user;
        }
        data.t_url = 'http://leihou.com/' + (data.screen_name || data.id);
        if (data.profile_image_url) {
            data.profile_image_url = data.profile_image_url.replace('_m.', '_s.');
        }
        if (data.location) {
            var province_city = data.location.split('.');
            data.province = province_city[0];
            data.city = province_city[1] || province_city[0];
        }
    } else if (play_load === 'comment') {
        this.format_result_item(data.user, 'user', args);
    } else if (play_load === 'message') {
        this.format_result_item(data.sender, 'user', args);
        data.sender.id = data.sender.screen_name;
        this.format_result_item(data.recipient, 'user', args);
    }
    return data;
}});
var TwitterAPI = Object.inherits({}, sinaApi, {config: Object.inherits({}, sinaApi.config, {oauth_host: 'https://api.twitter.com', host: 'https://api.twitter.com/1.1', user_home_url: 'https://twitter.com/', search_url: 'https://twitter.com/search?q=', source: 'fawave', oauth_key: 'i1aAkHo2GkZRWbUOQe8zA', oauth_secret: 'MCskw4dW5dhWAYKGl3laRVTLzT8jTonOIOpmzEY', repost_pre: 'RT', support_comment: false, support_do_comment: false, support_repost: false, support_comment_repost: false, support_repost_timeline: false, support_direct_messages: true, support_sent_direct_messages: false, support_auto_shorten_url: false, support_search_max_id: true, support_user_search_page: true, support_upload: true, support_double_char: false, rt_need_source: false, user_timeline_need_friendship: true, show_fullname: true, support_blocking: true, oauth_callback: 'oob', upload: '/statuses/update_with_media', retweet: '/statuses/retweet/{{id}}', favorites_create: '/favorites/create/{{id}}', favorites: '/favorites/list', friends_timeline: '/statuses/home_timeline', friendships_lookup: '/friendships/lookup', friends: '/friends/list', followers: '/followers/list', mentions: '/statuses/mentions_timeline', search: '/search/tweets'}), searchMatchReg: /(#([\w\-\_\u2E80-\u3000\u303F-\u9FFF]+))/g, processSearch: function (str) {
    return str.replace(this.searchMatchReg, '<a class="tag" title="$2" href="https://twitter.com/search?q=%23$2" target="_blank">$1</a>');
}, findSearchText: function (str) {
    var matchs = str.match(this.searchMatchReg);
    var result = [];
    if (matchs) {
        for (var i = 0, len = matchs.length; i < len; i++) {
            var s = matchs[i].trim();
            result.push([s, s.substring(1)]);
        }
    }
    return result;
}, formatSearchText: function (str) {
    return'#' + str.trim();
}, processEmotional: function (str) {
    return str;
}, comments_timeline: function (data, callback, context) {
    callback.call(context);
}, reset_count: function (data, callback, context) {
    callback.call(context);
}, counts: function (data, callback, context) {
    callback.call(context);
}, retweet: function (data, callback, context) {
    var params = {url: this.config.retweet, type: 'post', play_load: 'status', data: data};
    this._sendRequest(params, callback, context);
}, friendships_lookup: function (data, callback, context) {
    var params = {url: this.config.friendships_lookup, type: 'get', play_load: 'object', data: data};
    this._sendRequest(params, callback, context);
}, _get_friendships: function (user, followers_args, callback, context) {
    var ids = [];
    var result = followers_args[0];
    if (result && result.users) {
        for (var i = 0, len = result.users.length; i < len; i++) {
            ids.push(String(result.users[i].id));
        }
    }
    if (ids.length > 0) {
        this.friendships_lookup({user: user, user_id: ids.join(',')}, function () {
            var infos = arguments[0];
            if (infos && infos.length > 0) {
                var map = {};
                for (var i = 0, l = infos.length; i < l; i++) {
                    var info = infos[i], relation = {following: false, followed_by: false};
                    if (info.connections) {
                        for (var j = 0, jl = info.connections.length; j < jl; j++) {
                            if (info.connections[j] === 'following') {
                                relation.followed_by = true;
                            } else if (info.connections[j] === 'followed_by') {
                                relation.following = true;
                            }
                        }
                    }
                    map[String(info.id)] = relation;
                }
                for (var i = 0, len = result.users.length; i < len; i++) {
                    var user = result.users[i];
                    var info = map[String(user.id)];
                    if (info) {
                        for (var k in info) {
                            user[k] = info[k];
                        }
                    }
                }
            }
            callback.apply(context, followers_args);
        });
    } else {
        callback.apply(context, followers_args);
    }
}, user_search: function (data, callback, context) {
    var user = data.user;
    this.super_.user_search.call(this, data, function () {
        this._get_friendships(user, arguments, callback, context);
    }, this);
}, followers: function (data, callback, context) {
    var user = data.user;
    this.super_.followers.call(this, data, function () {
        this._get_friendships(user, arguments, callback, context);
    }, this);
}, friends: function (data, callback, context) {
    var user = data.user;
    this.super_.friends.call(this, data, function () {
        this._get_friendships(user, arguments, callback, context);
    }, this);
}, format_upload_params: function (user, data, pic) {
    pic.keyname = 'media[]';
    delete data.source;
}, apply_auth: function (url, auth_args, user) {
    if (url.indexOf(this.config.upload) > 0 && this.config.host.indexOf('https://api.twitter.com') >= 0) {
        var data = auth_args.data;
        auth_args.data = {};
        this.super_.apply_auth.call(this, url, auth_args, user);
        auth_args.data = data;
    } else {
        this.super_.apply_auth.call(this, url, auth_args, user);
    }
}, blocks_exists: function (data, callback, context) {
    this.super_.blocks_exists.call(this, data, function (r, text, status) {
        if (status === 404) {
            callback({result: false}, text, status);
        } else {
            callback({result: true, user: r}, text, status);
        }
    }, context);
}, url_encode: function (text) {
    return text;
}, before_sendRequest: function (args, user) {
    if (args.url.indexOf('/oauth') < 0) {
        args.data.include_entities = 'true';
        args.data.contributor_details = 'true';
    }
    if (args.url === this.config.update) {
        if (args.data.sina_id) {
            args.data.in_reply_to_status_id = args.data.sina_id;
            delete args.data.sina_id;
        } else if (args.data.id) {
            args.data.in_reply_to_status_id = args.data.id;
            delete args.data.id;
        }
        delete args.data.source;
    } else if (args.url === this.config.new_message) {
        args.data.user = args.data.id;
        delete args.data.id;
    } else if (args.url === this.config.search) {
        delete args.data.page;
        args.data.show_user = 'true';
        delete args.data.source;
    } else if (args.url === this.config.user_search || args.url === this.config.blocks_blocking) {
    } else if (args.url === this.config.blocks_exists) {
        args.dont_show_error = true;
    }
    var hasAPI = user && user.apiProxy;
    if (!hasAPI && this.config.host === 'https://api.twitter.com' && args.url.indexOf('/oauth') < 0) {
        args.url = '/1' + args.url;
    }
}, format_result_item: function (data, play_load, args) {
    if (play_load === 'status' && data.id) {
        data.id = data.id_str || data.id;
        data.in_reply_to_status_id = data.in_reply_to_status_id_str || data.in_reply_to_status_id;
        if (data.entities && data.entities.media && data.entities.media.length > 0) {
            var entities = data.entities;
            if (entities.media && entities.media.length > 0) {
                for (var i = 0, len = entities.media.length; i < len; i++) {
                    var media = entities.media[i];
                    if (media.type === 'photo') {
                        data.thumbnail_pic = media.media_url;
                        data.bmiddle_pic = data.thumbnail_pic;
                        data.original_pic = data.thumbnail_pic;
                        if (data.text) {
                            data.text = data.text.replace(media.url, '');
                        }
                        break;
                    }
                }
            }
            delete data.entities;
        }
        if (data.text) {
            data.text = data.text.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
        }
        var tpl = this.config.user_home_url + '{{user.screen_name}}/status/{{id}}';
        if (data.retweeted_status) {
            data.retweeted_status.id = data.retweeted_status.id_str || data.retweeted_status.id;
            data.retweeted_status.t_url = tpl.format(data.retweeted_status);
            this.format_result_item(data.retweeted_status.user, 'user', args);
        }
        if (data.from_user && !data.user) {
            data.user = {id: data.from_user_id_str || data.from_user_id, profile_image_url: data.profile_image_url, screen_name: data.from_user};
            delete data.from_user_id_str;
            delete data.profile_image_url;
            delete data.from_user;
            data.source = htmldecode(data.source);
        }
        data.t_url = tpl.format(data);
        this.format_result_item(data.user, 'user', args);
    } else if (play_load === 'user' && data && data.id) {
        data.t_url = this.config.user_home_url + (data.screen_name || data.id);
        data.following = false;
    }
    return data;
}});
var StatusNetAPI = Object.inherits({}, TwitterAPI, {config: Object.inherits({}, TwitterAPI.config, {host: 'http://identi.ca/api', user_home_url: 'http://identi.ca/', status_prev_url: 'http://identi.ca/notice/', search_url: 'http://identi.ca/tag/', source: 'FaWave', oauth_key: 'c71100649f6c6cfb4eebbacca18de8f6', oauth_secret: 'f3ef411594e624f7eda7e1c0ae6b9029', repost_pre: 'RT', support_double_char: false, support_comment: false, support_do_comment: false, support_repost: false, support_comment_repost: false, support_upload: false, support_repost_timeline: false, support_sent_direct_messages: false, support_auto_shorten_url: false, support_user_search: false, support_blocking: false, oauth_callback: 'oob', repost: '/statuses/update', retweet: '/statuses/retweet/{{id}}', favorites_create: '/favorites/create/{{id}}', friends_timeline: '/statuses/home_timeline', search: '/search.json?q='}), format_upload_params: function (user, data, pic) {
    pic.keyname = 'media';
}, url_encode: function (text) {
    return text;
}, format_result_item: function (data, play_load, args) {
    data = this.super_.format_result_item.apply(this, [data, play_load, args]);
    if (play_load === 'user' && data && data.id) {
        data.following = false;
        if (data.statusnet_profile_url) {
            data.t_url = data.statusnet_profile_url;
        } else {
            data.t_url = this.config.user_home_url + data.screen_name;
        }
    } else if (play_load === 'status' && data) {
        data.t_url = this.config.status_prev_url + data.id;
        if (!data.user) {
            data.user = {screen_name: data.from_user, profile_image_url: data.profile_image_url, id: data.from_user_id};
            delete data.profile_image_url;
            delete data.from_user;
            delete data.from_user_id;
        }
        if (data.attachments) {
            if (data.attachments.length) {
                for (var i = 0, l = data.attachments.length; i < l; i++) {
                    var attachment = data.attachments[i];
                    if (attachment.mimetype && attachment.mimetype.indexOf('image') >= 0) {
                        data.thumbnail_pic = attachment.url;
                        data.bmiddle_pic = data.thumbnail_pic;
                        data.original_pic = data.thumbnail_pic;
                    }
                }
            } else if (data.attachments.ori_pic) {
                data.thumbnail_pic = data.attachments.small_pic.url;
                data.bmiddle_pic = data.attachments.middle_pic.url;
                data.original_pic = data.attachments.ori_pic.url;
                delete data.attachments;
            }
        }
        if (!data.repost_count) {
            data.repost_count = data.repeat_count || 0;
        }
        if (!data.comments_count) {
            data.comments_count = data.reply_count || 0;
        }
    }
    return data;
}});
var TaobaoStatusNetAPI = Object.inherits({}, StatusNetAPI, {config: Object.inherits({}, StatusNetAPI.config, {host: 'http://aita.alibaba-inc.com/api', user_home_url: 'http://aita.alibaba-inc.com/', status_prev_url: 'http://aita.alibaba-inc.com/notice/', search_url: 'http://aita.alibaba-inc.com/tag/', source: 'FaWave', repost_pre: 'RT', support_double_char: false, support_upload: true, support_repost_timeline: false, support_repost: true, support_direct_messages: false, support_auto_shorten_url: true, support_user_search: false, support_comment: false, support_comment_pic: true, support_do_comment: true, comment_reply_need_original: true, show_fullname: false, support_blocking: false, repost: '/statuses/retweet/{{id}}', upload: '/statusnet/media/upload'}), parse_upload_result: function (data) {
    if (!data) {
        return data;
    }
    var re = /<(\w+)>([^<]+)<\/\w+>/ig;
    var matchs = data.match(re);
    var result = {};
    if (matchs) {
        for (var i = matchs.length; i--;) {
            var m = re.exec(matchs[i]);
            re.lastIndex = 0;
            result[m[1]] = m[2];
        }
    } else {
        result = {error: 'parse error: ' + data};
    }
    return result;
}, upload: function (user, params, pic, before_request, onprogress, callback, context) {
    this.super_.upload.call(this, user, {__uploadFormat: ''}, pic, before_request, onprogress, function (data) {
        if (data && data.mediaid) {
            params.user = user;
            params.mediaId = data.mediaid;
            this.update(params, callback, context);
        } else {
            callback.apply(context, arguments);
        }
    }, this);
}, before_sendRequest: function (args, user) {
    if (args.url === this.config.comment || args.url === this.config.reply) {
        if (args.data.id) {
            args.data.in_reply_to_status_id = args.data.id;
            delete args.data.id;
        }
        args.data.status = args.data.comment;
        args.url = '/statuses/update';
    } else if (args.url === this.config.new_message) {
        args.data.user = args.data.id;
        delete args.data.id;
    } else if (args.url === this.config.search) {
        args.data.rpp = args.data.count;
        args.data.show_user = 'true';
        delete args.data.source;
        delete args.data.count;
    } else if (args.url === this.config.user_search || args.url === this.config.blocks_blocking) {
        args.data.per_page = args.data.count;
        delete args.data.count;
    } else if (args.url === this.config.blocks_exists) {
        args.dont_show_error = true;
    }
}, _emotion_rex: window.TAOBAO_FACES ? new RegExp('\\[\\^(' + Object.keys(window.TAOBAO_FACES).join('|') + ')\\^\\]', 'g') : null, processEmotional: function (str) {
    if (!this._emotion_rex) {
        return str;
    }
    return str.replace(this._emotion_rex, function (m, g1) {
        if (window.TAOBAO_FACES && g1) {
            var emotion = TAOBAO_FACES[g1];
            if (emotion) {
                var tpl = '<img style="height: 24px;" title="{{title}}" src="' +
                    TAOBAO_FACES_URL_PRE + '{{emotion}}" />';
                return tpl.format({title: g1, emotion: emotion});
            }
        }
        return m;
    });
}, searchMatchReg: /#([^#]+)#/g, processSearch: function (str) {
    var search_url = this.config.search_url;
    return str.replace(this.searchMatchReg, function (m, g1) {
        var search = g1.remove_html_tag();
        return'<a target="_blank" href="' + search_url + '{{search}}" title="Search #{{search}}">#{{search}}#</a>'.format({search: search});
    });
}, _at_match_rex: /@([\(\)●\w\-\_\u2E80-\u3000\u303F-\u9FFF]+)/g});
var FanfouAPI = Object.inherits({}, sinaApi, {config: Object.inherits({}, sinaApi.config, {host: 'http://api2.fanfou.com', user_home_url: 'http://fanfou.com/', search_url: 'http://fanfou.com/q/', source: 'fawave', oauth_host: 'http://fanfou.com', oauth_key: '2f6d311aaa5779bc956310698a0a989b', oauth_secret: 'bdf029681e94c8ab9f7bc43d3d41435e', oauth_callback: OAUTH_CALLBACK_URL2, repost_pre: '转', support_comment: false, support_do_comment: false, support_comment_repost: false, support_repost_timeline: false, support_direct_messages: true, support_sent_direct_messages: false, support_auto_shorten_url: false, support_double_char: false, upload: '/photos/upload', search: '/search/public_timeline', favorites_create: '/favorites/create/{{id}}', support_user_search: false, user_timeline_need_friendship: false, show_fullname: true, support_blocking: false, gender_map: {'男': 'm', '女': 'f'}}), processAt: function (str, status) {
    var tpl = '<a class="getUserTimelineBtn" href="" data-screen_name="{{m1}}" rhref="' +
        this.config.user_home_url + '{{m1}}" title="' +
        _u.i18n("btn_show_user_title") + '">{{username}}</a>';
    return str.replace(/@([\w\-\u4e00-\u9fa5|\_\.]+)/g, function (match, $1) {
        var users = status.users || {};
        var userid = users[$1];
        var username = $1;
        if (userid) {
            username = '@' + $1 + '(' + userid + ')';
        } else {
            username = '@' + $1;
        }
        var data = {m1: userid || $1, username: username};
        return tpl.format(data);
    });
}, reset_count: function (data, callback, context) {
    callback.call(context);
}, counts: function (data, callback, context) {
    callback.call(context);
}, url_encode: function (text) {
    return text;
}, format_geo_arguments: function (data, geo) {
    data.location = geo.latitude + ',' + geo.longitude;
}, apply_auth: function (url, auth_args, user) {
    if (url.indexOf(this.config.upload) > 0) {
        var data = auth_args.data;
        auth_args.data = {};
        this.super_.apply_auth.call(this, url, auth_args, user);
        auth_args.data = data;
    } else {
        this.super_.apply_auth.call(this, url, auth_args, user);
    }
}, before_sendRequest: function (args, user) {
    if (args.url === this.config.new_message) {
        args.data.user = args.data.id;
        delete args.data.id;
    } else if (args.url === this.config.update) {
        if (args.data.sina_id) {
            args.data.in_reply_to_status_id = args.data.sina_id;
            delete args.data.sina_id;
        }
    } else if (args.url === this.config.repost) {
        args.url = this.config.update;
        args.data.repost_status_id = args.data.id;
        delete args.data.id;
    } else if (args.url === this.config.friends || args.url === this.config.followers) {
        args.data.page = args.data.cursor == '-1' ? 1 : args.data.cursor;
        if (!args.data.page) {
            args.data.page = 1;
        }
        if (args.data.user_id) {
            args.data.id = args.data.user_id;
        }
        delete args.data.cursor;
        delete args.data.user_id;
        delete args.data.screen_name;
    }
}, format_upload_params: function (user, data, pic) {
    pic.keyname = 'photo';
}, format_result: function (data, play_load, args) {
    if ($.isArray(data)) {
        for (var i in data) {
            data[i] = this.format_result_item(data[i], play_load);
        }
    } else {
        data = this.format_result_item(data, play_load);
    }
    if (args.url === this.config.followers || args.url === this.config.friends) {
        data = {users: data, next_cursor: Number(args.data.page) + 1, previous_cursor: args.data.page};
        if (data.users.length === 0) {
            data.next_cursor = '0';
        }
    }
    return data;
}, ONLY_AT_USER_RE: /@([^\s]+)/g, _FANFOU_IMAGEURL_RE: /http:\/\/fanfou\.com\/photo\/[\w\-]+$/i, format_result_item: function (data, play_load, args) {
    if (play_load === 'status' && data && data.id) {
        var users = {};
        users[data.user.screen_name] = data.user.id;
        var tpl = 'http://fanfou.com/statuses/{{id}}';
        data.t_url = tpl.format(data);
        this.format_result_item(data.user, 'user', args);
        if (data.repost_status && data.repost_status.photo) {
            delete data.photo;
        }
        if (data.photo) {
            data.thumbnail_pic = data.photo.thumburl;
            data.bmiddle_pic = data.photo.largeurl;
            data.original_pic = data.photo.largeurl;
            delete data.photo;
            data.text = data.text.replace(this._FANFOU_IMAGEURL_RE, '');
        }
        if (data.in_reply_to_status_id) {
            data.related_dialogue_url = 'http://fanfou.com/statuses/' + data.in_reply_to_status_id + '?fr=viewreply';
            users[data.in_reply_to_screen_name] = data.in_reply_to_user_id;
        }
        if (data.text) {
            data.text = htmldecode(data.text);
        }
        if (data.repost_status) {
            data.retweeted_status = this.format_result_item(data.repost_status, 'status', args);
            delete data.repost_status;
            users[data.retweeted_status.user.screen_name] = data.retweeted_status.user.id;
        }
        if (data && data.text) {
            var matchs = data.text.match(this.ONLY_AT_USER_RE);
            if (matchs) {
                data.users = {};
                if (data.repost_screen_name) {
                    users[data.repost_screen_name] = data.repost_user_id;
                }
                for (var j = 0; j < matchs.length; j++) {
                    var name = $.trim(matchs[j]).substring(1);
                    data.users[name] = users[name];
                }
            }
        }
    } else if (play_load === 'user' && data && data.id) {
        data.t_url = 'http://fanfou.com/' + (data.id || data.screen_name);
        data.gender = this.config.gender_map[data.gender];
        data.followed_by = data.following;
        data.following = false;
        data.name = data.id || data.name;
    }
    return data;
}});
var T163API = Object.inherits({}, sinaApi, {config: Object.inherits({}, sinaApi.config, {host: 'http://api.t.163.com', user_home_url: 'http://t.163.com/n/', search_url: 'http://t.163.com/tag/', source: 'cXU8SDfNTtF0esHy', oauth_key: 'cXU8SDfNTtF0esHy', oauth_secret: 'KDKVAlZYlx4Yvzwx9BQEbTAVhkdjXQ8I', oauth_authorize: '/oauth/authenticate', oauth_callback: FAWAVE_OAUTH_CALLBACK_URL, support_counts: false, support_double_char: false, support_comment: true, support_repost_timeline: true, support_repost_comment: true, support_repost_comment_to_root: true, support_search_max_id: false, support_favorites_max_id: true, support_direct_messages: true, support_sent_direct_messages: true, user_timeline_need_friendship: false, user_timeline_need_user: true, support_blocking: false, max_text_length: 163, repost_pre: 'RT', repost_delimiter: '||', favorites: '/favorites/{{id}}', favorites_create: '/favorites/create/{{id}}', search: '/search', user_show: '/users/show', repost: '/statuses/retweet/{{id}}', comments: '/statuses/comments/{{id}}', friends_timeline: '/statuses/home_timeline', comments_timeline: '/statuses/comments_to_me', repost_timeline: '/statuses/retweets/{{id}}', gender_map: {0: 'n', 1: 'm', 2: 'f'}}), _replaceEmotional: function (m, g1) {
    if (window.T163_EMOTIONS && g1) {
        var face = T163_EMOTIONS[g1];
        if (face) {
            return'<img title="{{title}}" src="{{src}}" />'.format({title: m, src: T163_EMOTIONS_URL_PRE + face});
        }
        face = T163_FACES_MAP[g1];
        if (face) {
            return'<img title="{{title}}" src="{{src}}" />'.format({title: m, src: face});
        }
    }
    return m;
}, reset_count: function (data, callback, context) {
    callback.call(context);
}, counts: function (data, callback, context) {
    callback.call(context);
}, format_upload_params: function (user, data, pic) {
    delete data.source;
    delete data.lat;
    delete data.long;
}, upload: function (user, params, pic, before_request, onprogress, callback, context) {
    this.super_.upload.call(this, user, {}, pic, before_request, onprogress, function (data) {
        if (data && data.upload_image_url) {
            params.user = user;
            params.status += ' ' + data.upload_image_url;
            this.update(params, callback, context);
        } else {
            callback.apply(context, arguments);
        }
    }, this);
}, upload_image: function (user, pic, before_request, onprogress, callback, context) {
    if (!before_request) {
        before_request = function () {
        };
    }
    if (!onprogress) {
        onprogress = function () {
        };
    }
    this.super_.upload.call(this, user, {}, pic, before_request, onprogress, function (data, text_status, code) {
        if (data && data.upload_image_url) {
            data = data.upload_image_url;
        }
        callback.call(context, data, text_status, code);
    });
}, url_encode: function (text) {
    return text;
}, before_sendRequest: function (args, user) {
    delete args.data.source;
    if (args.data.since_id) {
        args.data.max_id = args.data.since_id;
        delete args.data.since_id;
    } else if (args.data.max_id) {
        args.data.since_id = args.data.max_id;
        delete args.data.max_id;
    }
    if (args.url === this.config.user_timeline) {
        if (args.data.id) {
            args.data.user_id = args.data.id;
            delete args.data.id;
            delete args.data.screen_name;
        } else {
            args.data.name = args.data.screen_name;
            delete args.data.screen_name;
        }
    } else if (args.url === this.config.comment || args.url === this.config.reply) {
        args.data.status = args.data.comment;
        args.url = this.config.reply;
        delete args.data.comment;
        delete args.data.cid;
        delete args.data.reply_user_id;
    } else if (args.url === this.config.repost) {
        if (args.data.sina_id) {
            delete args.data.sina_id;
        }
    } else if (args.url === this.config.new_message) {
        args.data.user = args.data.id;
        delete args.data.id;
    } else if (args.url === this.config.favorites) {
        args.data.id = user.name;
    } else if (args.url === this.config.friendships_destroy || args.url === this.config.friendships_create) {
        args.data.user_id = args.data.id;
        delete args.data.id;
    } else if (args.url === this.config.comments_timeline) {
        args.data.trim_user = false;
    }
}, format_result: function (data, play_load, args) {
    data = this.super_.format_result.call(this, data, play_load, args);
    if (String(data.next_cursor) === '-1') {
        data.next_cursor = '0';
    }
    return data;
}, format_result_item: function (data, play_load, args) {
    if (play_load === 'user' && data && data.id) {
        data.t_url = 'http://t.163.com/' + data.screen_name;
        var temp_name = data.screen_name;
        data.screen_name = data.name || data.screen_name;
        data.name = temp_name;
        data.gender = this.config.gender_map[data.gender];
        if (data.sysTag) {
            data.tags = [];
            for (var i = 0, len = data.sysTag.length; i < len; i++) {
                var tag = data.sysTag[i];
                data.tags.push({name: tag, url: 'http://t.163.com/search/itag/' + tag, itag: true});
            }
            delete data.sysTag;
        }
        if (data.userTag) {
            data.tags = data.tags || [];
            for (var i = 0, len = data.userTag.length; i < len; i++) {
                var tag = data.userTag[i];
                data.tags.push({name: tag, url: 'http://t.163.com/search/tag/' + tag});
            }
            delete data.userTag;
        }
    } else if (play_load === 'status') {
        if (!data.user) {
            data.user = {id: data.from_user_id, screen_name: data.from_user, name: data.from_user_name, profile_image_url: data.profile_image_url};
            if (data.to_status_id && data.to_user_id) {
                data.in_reply_to_status_id = data.to_status_id;
                data.in_reply_to_user_id = data.to_user_id;
                data.in_reply_to_screen_name = data.to_user;
                data.in_reply_to_user_name = data.to_user_name;
                data.in_reply_to_status_text = data.to_status_text;
            }
            delete data.from_user_id;
            delete data.from_user;
            delete data.from_user_name;
            delete data.profile_image_url;
            delete data.to_status_id;
            delete data.to_user_id;
            delete data.to_user;
            delete data.to_user_name;
            delete data.to_status_text;
        }
        if (data.text) {
            data.text = htmldecode(data.text);
        }
        var url_re = /\s?(http:\/\/126.fm\/\w+)/i;
        var results = url_re.exec(data.text);
        if (results) {
            data.original_pic = results[1];
            data.thumbnail_pic = 'http://oimagec6.ydstatic.com/image?w=120&h=120&url='
                + data.original_pic;
            data.bmiddle_pic = 'http://oimagec6.ydstatic.com/image?w=460&url='
                + data.original_pic;
            data.text = data.text.replace(results[0], '');
        }
        data.user = this.format_result_item(data.user, 'user', args);
        var tpl = '{{user.t_url}}/status/{{id}}';
        if (data.retweeted_status) {
            data.retweeted_status = this.format_result_item(data.retweeted_status, 'status', args);
        }
        data.repost_count = data.retweet_count;
        if (data.is_retweet_by_user && (args.data.user_id === undefined || args.user.id == args.data.user_id)) {
            data.retweet_me = args.user;
            if (String(data.retweet_user_id) === String(args.user.id)) {
                data.retweet_user_id = null;
            }
            data.is_retweet_by_user = false;
        }
        if (data.retweet_user_id) {
            data.retweet_user = {id: data.retweet_user_id, screen_name: data.retweet_user_screen_name, name: data.retweet_user_name};
            data.retweet_user = this.format_result_item(data.retweet_user, 'user', args);
        }
        data.t_url = tpl.format(data);
        if (data.in_reply_to_status_id && data.in_reply_to_status_text) {
            data.retweeted_status = {id: data.in_reply_to_status_id, text: data.in_reply_to_status_text, user: {id: data.in_reply_to_user_id, screen_name: data.in_reply_to_user_name, name: data.in_reply_to_screen_name, profile_image_url: 'http://mimg.126.net/p/butter/1008031648/img/face_big.gif'}};
            if (data.root_in_reply_to_status_id == data.in_reply_to_status_id) {
                data.retweeted_status.retweet_count = data.root_retweet_count;
                data.retweeted_status.comments_count = data.root_comments_count;
            }
            data.retweeted_status.user = this.format_result_item(data.retweeted_status.user, 'user', args);
            data.retweeted_status = this.format_result_item(data.retweeted_status, 'status', args);
            if (!data.retweeted_status.created_at) {
                data.retweeted_status.created_at = data.created_at;
            }
            if (data.root_in_reply_to_status_id && data.root_in_reply_to_status_id != data.in_reply_to_status_id && data.root_in_reply_to_status_text) {
                data.retweeted_status.retweeted_status = {id: data.root_in_reply_to_status_id, text: data.root_in_reply_to_status_text, retweet_count: data.root_retweet_count, comments_count: data.root_comments_count, user: {id: data.root_in_reply_to_user_id, screen_name: data.root_in_reply_to_user_name, name: data.root_in_reply_to_screen_name, profile_image_url: 'http://mimg.126.net/p/butter/1008031648/img/face_big.gif'}};
                delete data.root_in_reply_to_status_id;
                delete data.root_in_reply_to_status_text;
                delete data.root_in_reply_to_user_id;
                delete data.root_in_reply_to_screen_name;
                delete data.root_in_reply_to_user_name;
                data.retweeted_status.retweeted_status.user = this.format_result_item(data.retweeted_status.retweeted_status.user, 'user', args);
                data.retweeted_status.retweeted_status = this.format_result_item(data.retweeted_status.retweeted_status, 'status', args);
                if (!data.retweeted_status.retweeted_status.created_at) {
                    data.retweeted_status.retweeted_status.created_at = data.retweeted_status.created_at;
                }
            }
            delete data.in_reply_to_status_id;
            delete data.in_reply_to_status_text;
            delete data.in_reply_to_user_id;
            delete data.in_reply_to_screen_name;
            delete data.in_reply_to_user_name;
        }
    } else if (play_load === 'message') {
        data.sender = this.format_result_item(data.sender, 'user', args);
        data.recipient = this.format_result_item(data.recipient, 'user', args);
    } else if (play_load === 'comment') {
        if (data.text) {
            data.text = htmldecode(data.text);
        }
        data.user = this.format_result_item(data.user, 'user', args);
        data.status = {id: data.in_reply_to_status_id, text: data.in_reply_to_status_text, comments_count: data.comments_count, user: {id: data.in_reply_to_user_id, screen_name: data.in_reply_to_user_name, name: data.in_reply_to_screen_name, profile_image_url: 'http://mimg.126.net/p/butter/1008031648/img/face_big.gif'}};
        data.status.user = this.format_result_item(data.status.user, 'user', args);
        if (!data.user) {
            data.user = data.status.user;
        }
        data.status = this.format_result_item(data.status, 'status', args);
        if (data.root_in_reply_to_status_id && data.root_in_reply_to_status_id != data.in_reply_to_status_id && data.root_in_reply_to_status_text) {
            data.status.retweeted_status = {id: data.root_in_reply_to_status_id, text: data.root_in_reply_to_status_text, comments_count: data.status.comments_count, user: {id: data.root_in_reply_to_user_id, screen_name: data.root_in_reply_to_user_name, name: data.root_in_reply_to_screen_name, profile_image_url: 'http://mimg.126.net/p/butter/1008031648/img/face_big.gif'}};
            delete data.root_in_reply_to_status_id;
            delete data.root_in_reply_to_status_text;
            delete data.root_in_reply_to_user_id;
            delete data.root_in_reply_to_screen_name;
            delete data.root_in_reply_to_user_name;
            data.status.retweeted_status.user = this.format_result_item(data.status.retweeted_status.user, 'user', args);
            data.status.retweeted_status = this.format_result_item(data.status.retweeted_status, 'status', args);
        }
        delete data.in_reply_to_status_id;
        delete data.in_reply_to_status_text;
        delete data.in_reply_to_user_id;
        delete data.in_reply_to_screen_name;
        delete data.in_reply_to_user_name;
    }
    return data;
}});
var GooglePlusAPI = Object.inherits({}, sinaApi, {config: Object.inherits({}, sinaApi.config, {host: 'https://www.googleapis.com/plus/v1', source: '', result_format: '', support_counts: false, support_repost: true, support_comment_repost: true, support_repost_timeline: false, support_upload: false, support_cursor_only: true, support_mentions: false, support_direct_messages: false, support_sent_direct_messages: false, support_auto_shorten_url: false, support_geo: false, repost_pre: 'RT ', need_processMsg: false, user_timeline_need_friendship: false, support_blocking: false, oauth_scope: ['https://www.googleapis.com/auth/plus.me'].join(' '), oauth_key: '828316891836.apps.googleusercontent.com', oauth_secret: 'XmewNnlKyFGDvBJ-Qa3HDkc_', oauth_callback: 'http://localhost:1984/fawave/callback', oauth_host: 'https://accounts.google.com/o/oauth2', oauth_authorize: '/auth', oauth_access_token: '/token', oauth_token_need_refresh: true, friends_timeline: '/people/me/activities/public', user_timeline: '/people/{{id}}/activities/public', followers: '/people/{{user_id}}/@groups/@followers', friends: '/people/{{user_id}}/@groups/@following', favorites: '/activities/@me/@liked', favorites_create: '/activities/@me/@liked/{{id}}?key={{key}}&alt={{alt}}', favorites_destroy: '/activities/@me/@liked/{{id}}?key={{key}}&alt={{alt}}_delete', friendships_create: '/people/@me/@groups/@following/{{id}}?key={{key}}&alt={{alt}}', friendships_destroy: '/people/@me/@groups/@following/{{id}}?key={{key}}&alt={{alt}}_delete', update: '/activities/@me/@self?key={{key}}&alt={{alt}}', repost: '/activities/@me/@self?key={{key}}&alt={{alt}}_repost', repost_real: '/activities/@me/@self?key={{key}}&alt={{alt}}', destroy: '/activities/@me/@self/{{id}}?key={{key}}&alt={{alt}}', comments: '/activities/{{user_id}}/@self/{{id}}/@comments', comment: '/activities/{{user_id}}/@self/{{id}}/@comments?key={{key}}&alt={{alt}}', reply: '/activities/{{user_id}}/@self/{{id}}/@comments?key={{key}}&alt={{alt}}', search: '/activities/search', user_search: '/activities/search/@people', verify_credentials: '/people/me'}), apply_auth: function (url, args, user) {
    delete args.data.source;
    if (args.__refresh_access_token) {
        return;
    }
    if (user.oauth_token_key) {
        args.data.access_token = user.oauth_token_key;
    }
}, get_access_token: function (user, callback, context) {
    var params = {url: this.config.oauth_access_token, type: 'post', user: user, play_load: 'json', apiHost: this.config.oauth_host, data: {code: user.oauth_pin, client_id: this.config.oauth_key, client_secret: this.config.oauth_secret, redirect_uri: this.config.oauth_callback, grant_type: 'authorization_code'}, need_source: false};
    this._sendRequest(params, function (data, text_status, error_code) {
        if (text_status !== 'error' && data && data.access_token) {
            user.oauth_token_key = data.access_token;
            user.oauth_expires_in = data.expires_in;
            user.oauth_token_type = data.token_type;
            user.oauth_refresh_token = data.refresh_token;
        } else {
            user = null;
            text_status = text_status || 'error';
            error_code = error_code || JSON.stringify(data);
        }
        callback.call(context, user, text_status, error_code);
    });
}, refresh_access_token: function (user, callback, context) {
    var params = {url: this.config.oauth_access_token, type: 'post', user: user, play_load: 'json', apiHost: this.config.oauth_host, data: {client_id: this.config.oauth_key, client_secret: this.config.oauth_secret, refresh_token: user.oauth_refresh_token, grant_type: 'refresh_token'}, need_source: false, __refresh_access_token: true};
    this._sendRequest(params, function (data, text_status, error_code) {
        var result = null;
        if (text_status !== 'error' && data && data.access_token) {
            result = {oauth_token_key: data.access_token, oauth_expires_in: data.expires_in, oauth_token_type: data.token_type};
        } else {
            text_status = text_status || 'error';
            error_code = error_code || JSON.stringify(data);
        }
        callback.call(context, result, text_status, error_code);
    });
}, get_authorization_url: function (user, callback, context) {
    var params = {response_type: 'code', client_id: this.config.oauth_key, redirect_uri: this.config.oauth_callback, scope: this.config.oauth_scope, state: String(new Date().getTime())};
    var loginURL = this.config.oauth_host + this.config.oauth_authorize + '?';
    var args = [];
    for (var k in params) {
        args.push(k + '=' + encodeURIComponent(params[k]));
    }
    loginURL += args.join('&');
    callback.call(context, loginURL, 'success', 200);
}, format_result: function (data, play_load, args) {
    var items = data.items || data;
    if ($.isArray(items)) {
        for (var i = 0, l = items.length; i < l; i++) {
            items[i] = this.format_result_item(items[i], play_load, args);
        }
        if (data.nextPageToken) {
            data.next_cursor = data.nextPageToken;
        } else {
            data.next_cursor = '0';
        }
    } else {
        data = this.format_result_item(data, play_load, args);
    }
    return data;
}, format_result_item: function (data, play_load, args) {
    if (play_load === 'user') {
        data.name = data.screen_name = data.displayName;
        delete data.displayName;
        data.description = data.aboutMe;
        data.gender = data.gender === 'male' ? 'm' : (data.gender === 'female' ? 'f' : 'n');
        data.profile_image_url = data.image.url;
        if (Array.isArray(data.organizations)) {
            for (var i = 0, l = data.organizations.length; i < l; i++) {
                var org = data.organizations[i];
                data.description += (org.type ? org.type + ':' : '') + org.title + ' at ' + org.name + '<br/>';
            }
            delete data.organizations;
        }
        if (Array.isArray(data.urls)) {
            for (var i = 0, l = data.urls.length; i < l; i++) {
                var info = data.urls[i];
                data.description += (info.type ? info.type + ':' : '') + info.value + '<br/>';
            }
            delete data.urls;
        }
        if (data.placesLived && data.placesLived[0]) {
            var place = data.placesLived[0];
            data.city = place.value;
        }
        delete data.placesLived;
    } else if (play_load === 'status') {
        data.user = this.format_result_item(data.actor, 'user', args);
        delete data.actor;
        data.text = data.title;
        delete data.title;
        data.source = data.provider.title;
        delete data.provider;
        data.created_at = data.published;
        delete data.published;
        data.t_url = data.url;
        delete data.url;
        var obj = data.object;
        if (obj) {
            delete data.object;
            if (obj.attachments && obj.attachments[0]) {
                var attachment = obj.attachments[0];
                if (attachment.content) {
                    data.text = attachment.content;
                }
                if (attachment.fullImage) {
                    data.original_pic = data.bmiddle_pic = attachment.fullImage.url;
                }
                if (attachment.image) {
                    data.thumbnail_pic = attachment.image.url;
                }
            }
            if (obj.content) {
                data.text = obj.content;
            }
            data.comments_count = obj.replies.totalItems;
            data.repost_count = obj.resharers.totalItems;
            data.favorite_count = obj.plusoners.totalItems;
        }
        delete data.crosspostSource;
    }
    return data;
}, });
var BuzzAPI = Object.inherits({}, sinaApi, {config: Object.inherits({}, sinaApi.config, {host: 'https://www.googleapis.com/buzz/v1', source: 'AIzaSyAu4vq6sYO3WuKxP2G64fYg6T1LdIDu3pk', oauth_key: 'net4team.net', oauth_secret: 'y+6SWcLVshQvogadDzXtSra+', result_format: '', userinfo_has_counts: false, support_counts: false, support_repost: true, support_comment_repost: true, support_repost_timeline: false, support_upload: false, support_cursor_only: true, support_mentions: false, support_direct_messages: false, support_sent_direct_messages: false, support_auto_shorten_url: false, support_upload: false, need_processMsg: false, support_geo: false, repost_pre: 'RT ', comment_need_user_id: true, user_timeline_need_friendship: false, support_blocking: false, oauth_host: 'https://www.google.com', oauth_authorize: '/accounts/OAuthAuthorizeToken', oauth_request_token: '/accounts/OAuthGetRequestToken', oauth_request_params: {scope: 'https://www.googleapis.com/auth/buzz'}, oauth_access_token: '/accounts/OAuthGetAccessToken', oauth_realm: '', friends_timeline: '/activities/@me/@consumption', user_timeline: '/activities/{{id}}/@self', followers: '/people/{{user_id}}/@groups/@followers', friends: '/people/{{user_id}}/@groups/@following', favorites: '/activities/@me/@liked', favorites_create: '/activities/@me/@liked/{{id}}?key={{key}}&alt={{alt}}', favorites_destroy: '/activities/@me/@liked/{{id}}?key={{key}}&alt={{alt}}_delete', friendships_create: '/people/@me/@groups/@following/{{id}}?key={{key}}&alt={{alt}}', friendships_destroy: '/people/@me/@groups/@following/{{id}}?key={{key}}&alt={{alt}}_delete', update: '/activities/@me/@self?key={{key}}&alt={{alt}}', repost: '/activities/@me/@self?key={{key}}&alt={{alt}}_repost', repost_real: '/activities/@me/@self?key={{key}}&alt={{alt}}', destroy: '/activities/@me/@self/{{id}}?key={{key}}&alt={{alt}}', comments: '/activities/{{user_id}}/@self/{{id}}/@comments', comment: '/activities/{{user_id}}/@self/{{id}}/@comments?key={{key}}&alt={{alt}}', reply: '/activities/{{user_id}}/@self/{{id}}/@comments?key={{key}}&alt={{alt}}', search: '/activities/search', user_search: '/activities/search/@people', verify_credentials: '/people/@me/@self'}), url_encode: function (text) {
    return text;
}, reset_count: function (data, callback, context) {
    callback.call(context);
}, rate_limit_status: function (data, callback, context) {
    callback.call(context, {error: _u.i18n("comm_no_api")});
}, counts: function (data, callback, context) {
    callback.call(context);
}, format_authorization_url: function (params) {
    var login_url = 'https://www.google.com/buzz/api/auth/OAuthAuthorizeToken';
    params.domain = this.config.oauth_key;
    params.iconUrl = 'http://falang.googlecode.com/svn/trunk/icons/icon48.png';
    $.extend(params, this.config.oauth_request_params);
    return OAuth.addToURL(login_url, params);
}, before_sendRequest: function (args, user) {
    if (args.url == this.config.oauth_request_token || args.url == this.config.oauth_access_token) {
        return;
    }
    args.data.alt = 'json';
    args.data.key = args.data.source;
    delete args.data.source;
    delete args.data.screen_name;
    delete args.data.since_id;
    if (args.data.count) {
        args.data['max-results'] = args.data.count;
        delete args.data.count;
    }
    if (args.data.cursor) {
        args.data.c = args.data.cursor;
        delete args.data.cursor;
    }
    if (args.url == this.config.favorites_create || args.url == this.config.friendships_create) {
        args.type = 'PUT';
        args.contentType = 'application/json';
    } else if (args.url == this.config.favorites_destroy || args.url == this.config.friendships_destroy) {
        args.type = 'DELETE';
        args.url = args.url.replace('_delete', '');
    } else if (args.url == this.config.update) {
        delete args.data.sina_id;
        args.content = JSON.stringify({data: {object: {type: 'note', content: args.data.status}}});
        args.contentType = 'application/json';
        delete args.data.status;
    } else if (args.url == this.config.destroy) {
        args.type = 'DELETE';
    } else if (args.url == this.config.repost) {
        args.content = JSON.stringify({data: {annotation: args.data.status, verbs: ["share"], object: {id: args.data.id}}});
        args.contentType = 'application/json';
        args.url = this.config.repost_real;
        delete args.data.status;
        delete args.data.id;
    } else if (args.url == this.config.comment) {
        args.content = JSON.stringify({data: {content: args.data.comment}});
        args.contentType = 'application/json';
        delete args.data.comment;
        delete args.data.reply_user_id;
        delete args.data.cid;
    }
}, format_result: function (data, play_load, args) {
    if (args.url === this.config.friendships_create) {
        return true;
    }
    if (data.data) {
        data = data.data;
    }
    var items = data.items || data.entry || data;
    if ($.isArray(items)) {
        for (var i in items) {
            items[i] = this.format_result_item(items[i], play_load, args);
        }
        if (data.links && data.links.next) {
            var next = data.links.next[0].href;
            var params = decodeForm(next);
            if (params.c) {
                data.next_cursor = params.c;
            }
        }
        data.items = items;
        if (args.url == this.config.friends) {
            var cursor = parseInt(args.data.c);
            if (cursor == -1) {
                cursor = 0;
            }
            var next_cursor = cursor + items.length;
            if (next_cursor >= data.totalResults) {
                next_cursor = '0';
            }
            data.next_cursor = next_cursor;
        }
    } else {
        data = this.format_result_item(data, play_load, args);
    }
    return data;
}, format_result_item: function (data, play_load, args) {
    if (play_load === 'user' && data && data.id) {
        data.screen_name = data.displayName || data.name;
        data.t_url = data.profileUrl;
        data.profile_image_url = data.thumbnailUrl;
        data.description = data.aboutMe;
        delete data.aboutMe;
        delete data.thumbnailUrl;
        delete data.displayName;
        delete data.profileUrl;
    } else if (play_load == 'status') {
        if (data.object && data.object.type == 'activity') {
            data.text = data.annotation;
            data.retweeted_status = this.format_result_item(data.object, 'status', args);
        } else {
            data.text = data.object ? data.object.content : data.content;
            if (data.crosspostSource) {
                data.crosspostSource = data.crosspostSource.substring(data.crosspostSource.indexOf('http://'));
            }
            var attachments = data.object ? data.object.attachments : data.attachments;
            if (attachments && attachments[0].type == 'photo') {
                data.thumbnail_pic = attachments[0].links.preview[0].href;
                data.bmiddle_pic = attachments[0].links.enclosure[0].href;
                data.original_pic = data.bmiddle_pic;
            }
            if (data.text == '-' && attachments && attachments[0].type == 'article') {
                data.text = attachments[0].title + ' -- ' + attachments[0].content;
                if (attachments[0].links.alternate) {
                    data.text += ' ' + attachments[0].links.alternate[0].href;
                }
            }
        }
        if (data.source) {
            data.source = data.source.title;
            if (data.source == 'net4team.net') {
                data.source = '<a href="https://chrome.google.com/extensions/detail/aicelmgbddfgmpieedjiggifabdpcnln" target="_blank">FaWave</a>';
            }
        }
        var link = data.links.alternate || data.links.self;
        data.t_url = link[0].href;
        if (data.links.replies) {
            data.comments_count = data.links.replies[0].count;
        }
        data.user = this.format_result_item(data.actor, 'user', args);
        if (args.url == this.config.favorites) {
            data.favorited = true;
        }
        delete data.annotation;
        delete data.object;
        delete data.title;
        delete data.links;
        delete data.actor;
    } else if (play_load == 'comment') {
        data.user = this.format_result_item(data.actor, 'user', args);
        data.text = data.content;
        delete data.actor;
        delete data.links;
        delete data.content;
    }
    if (data && data.published) {
        data.created_at = data.published;
        delete data.published;
    }
    return data;
}});
var DoubanAPI2 = Object.inherits({}, WeiboAPI2, {config: Object.inherits({}, WeiboAPI2.config, {oauth_access_token: '/token', oauth_authorize: '/auth', oauth_callback: 'http://fawave.net4team.net/fawave/client/oauth_callback', oauth_host: 'https://www.douban.com/service/auth2', source: '05eab335ff02696d11c019a1fd073c47', oauth_key: '05eab335ff02696d11c019a1fd073c47', oauth_secret: '1d6f9f197ff25d7c', result_format: '', show_fullname: true, reply_dont_need_at_screen_name: true, support_direct_messages: true, support_sent_direct_messages: false, support_blocking: false, support_comments_mentions: false, support_comment: false, support_repost: false, support_comment_repost: false, support_repost_timeline: false, support_auto_shorten_url: false, support_mentions: false, support_direct_messages: false, support_favorites: false, support_counts: false, support_like: false, user_timeline_need_friendship: true, user_timeline_need_user: true, host: 'https://api.douban.com', verify_credentials: '/v2/user/~me', friends_timeline: '/shuo/v2/statuses/home_timeline', user_timeline: '/shuo/v2/statuses/user_timeline/{{screen_name}}', update: '/shuo/v2/statuses/', upload: '/shuo/v2/statuses/', destroy: '/shuo/v2/statuses/{{id}}_delete', retweet: '/shuo/v2/statuses/{{id}}/reshare_post', favorites_create: '/shuo/v2/statuses/{{id}}/like', favorites_destroy: '/shuo/v2/statuses/{{id}}/like_delete', comments: '/shuo/v2/statuses/{{id}}/comments', comment: '/shuo/v2/statuses/{{id}}/comments_post', reply: '/shuo/v2/statuses/{{id}}/comments_post', comment_destroy: '/shuo/v2/statuses/comment/{{cid}}', support_search: false, search: '/search/topics', user_search: '/shuo/v2/users/search', followers: '/shuo/v2/users/{{user_id}}/followers', friends: '/shuo/v2/users/{{user_id}}/following', friendships_create: '/shuo/v2/friendships/create', friendships_destroy: '/shuo/v2/friendships/destroy', friendships_show: '/shuo/v2/friendships/show', }), apply_auth: function (url, args, user) {
    delete args.data.source;
    if (args.__refresh_access_token) {
        return;
    }
    if (user.oauth_token_key) {
        args.headers.Authorization = 'Bearer ' + user.oauth_token_key;
    }
}, refresh_access_token: function (user, callback, context) {
    var params = {url: this.config.oauth_access_token, type: 'post', user: user, play_load: 'json', apiHost: this.config.oauth_host, data: {client_id: this.config.oauth_key, client_secret: this.config.oauth_secret, refresh_token: user.oauth_refresh_token, grant_type: 'refresh_token'}, need_source: false, __refresh_access_token: true};
    this._sendRequest(params, function (data, text_status, error_code) {
        var result = null;
        if (text_status !== 'error' && data && data.access_token) {
            result = {oauth_token_key: data.access_token, oauth_expires_in: data.expires_in, oauth_token_type: data.token_type};
        } else {
            text_status = text_status || 'error';
            error_code = error_code || JSON.stringify(data);
        }
        callback.call(context, result, text_status, error_code);
    });
}, retweet: function (data, callback, context) {
    var params = {url: this.config.retweet, type: 'post', play_load: 'status', data: data};
    this._sendRequest(params, callback, context);
}, user_show: function (data, callback) {
    if (!data.id) {
        return callback();
    }
    this.user_search({q: data.id, user: data.user}, function (users, code_text, code) {
        callback(users && users[0], code_text, code);
    });
}, verify_credentials: function (user, callback, data) {
    var self = this;
    self.super_.verify_credentials.call(self, user, function (result, code_text, code) {
        self.user_show({id: result.id, user: result}, function (userAll) {
            callback(userAll || result, code_text, code);
        });
    }, data);
}, format_upload_params: function (user, data, pic) {
    data.text = data.status;
    delete data.status;
    pic.keyname = 'image';
}, before_sendRequest: function (args, user) {
    if (args.data.max_id) {
        args.data.until_id = args.data.max_id;
        delete args.data.max_id;
    }
    if (args.data.status) {
        args.data.text = args.data.status;
        delete args.data.status;
    }
    if (args.data.cursor) {
        args.data.start = args.data.cursor;
        delete args.data.cursor;
    }
    switch (args.url) {
        case this.config.user_timeline:
            if (args.data.id) {
                args.data.screen_name = args.data.id;
                delete args.data.id;
            }
            break;
        case this.config.favorites_create:
            args.type = 'POST';
            break;
        case this.config.favorites_destroy:
            args.type = 'DELETE';
            args.url = args.url.replace('_delete', '');
            break;
        case this.config.comment:
            args.type = 'POST';
            args.data.text = args.data.comment;
            delete args.data.comment;
            args.url = args.url.replace('_post', '');
            break;
        case this.config.destroy:
            args.type = 'DELETE';
            args.url = args.url.replace('_delete', '');
            break;
        case this.config.retweet:
            args.type = 'POST';
            args.url = args.url.replace('_post', '');
            break;
        case this.config.friendships_create:
            args.data.user_id = args.data.id;
            delete args.data.id;
            break;
        case this.config.friendships_destroy:
            args.data.user_id = args.data.id;
            delete args.data.id;
            break;
    }
}, format_result: function (data, play_load, args) {
    var items = data;
    if (!$.isArray(items)) {
        items = data.results || data.users || data.statuses || data.comments || data.favorites || data.reposts;
    }
    if ($.isArray(items)) {
        var needs = [];
        for (var i = 0, l = items.length; i < l; i++) {
            items[i] = this.format_result_item(items[i], play_load, args);
        }
        if (data.statuses || data.comments || data.favorites || data.reposts) {
            data.items = items;
            delete data.statuses;
            delete data.comments;
            delete data.favorites;
            delete data.reposts;
        }
        var cursor = parseInt(args.data && args.data.start || 0, 10) || 0;
        cursor += items.length;
        data.next_cursor = cursor;
    } else {
        data = this.format_result_item(data, play_load, args);
        if (args.url === this.config.rate_limit_status) {
            if (data.limit_time_unit === 'HOURS') {
                data.hourly_limit = data.user_limit;
                data.remaining_hits = data.remaining_user_hits;
            }
        }
    }
    return data;
}, format_result_item: function (data, play_load, args) {
    if (play_load === 'user') {
        var user = {id: data.id, screen_name: data.name || data.screen_name, name: data.uid, profile_image_url: data.large_avatar || data.avatar, t_url: data.alt || data.original_site_url, created_at: data.created_at || data.created, city_name: data.city || data.loc_name, location: data.location, is_first_visit: data.is_first_visit, new_site_to_vu_count: data.new_site_to_vu_count, description: data.description || data.desc, verified: data.verified || false, logged_in: data.logged_in, followers_count: data.followers_count, friends_count: data.following_count, statuses_count: data.statuses_count, blocked: data.blocked, blocking: data.blocking, };
        if (args && args.url === this.config.friends) {
            user.followed_by = data.following;
        } else {
            user.following = data.following;
        }
        if (!user.t_url) {
            if (data.type === 'user') {
                user.t_url = 'http://www.douban.com/people/' + data.uid;
            }
        }
        user._data = data;
        return user;
    } else if (play_load === 'status') {
        var status = {id: data.id, created_at: data.created_at, retweet_count: data.reshared_count, favorite_count: data.like_count, comments_count: data.comments_count, text: data.text, favorited: data.liked, user: this.format_result_item(data.user, 'user', args), };
        var url = status.user.t_url;
        if (!/\/$/.test(url)) {
            url += '/';
        }
        status.t_url = url + 'status/' + status.id;
        if (!status.text) {
            status.text = data.title;
            if (status.text === '说：') {
                status.text = '转播';
            }
        } else if (data.title !== '说：') {
            status.text = '“' + status.text + '” , ' + data.title;
        }
        var attachments = data.attachments;
        if (attachments && attachments.length) {
            var attachment = attachments[0];
            status.text = status.text || '';
            if (attachment.title) {
                status.text += ' : ' + attachment.title;
            }
            if (attachment.description) {
                status.text += ' >> "' + attachment.description + '"';
            }
            if (attachment.href) {
                status.text += ' ' + attachment.href;
            }
            var media = attachment.media;
            if (media && media.length) {
                media = media[0];
                if (media.type === 'image') {
                    status.original_pic = media.original_src;
                    status.bmiddle_pic = media.original_src;
                    status.thumbnail_pic = media.src;
                    if (status.original_pic && /\/spic\//.test(status.original_pic)) {
                        status.original_pic = status.original_pic.replace('/spic/', '/opic/');
                        status.bmiddle_pic = status.bmiddle_pic.replace('/spic/', '/lpic/');
                    }
                    if (!status.original_pic) {
                        status.original_pic = status.thumbnail_pic.replace('/small/', '/raw/');
                        status.bmiddle_pic = status.thumbnail_pic.replace('/small/', '/median/');
                    }
                }
            }
        }
        if (data.source && data.source.href) {
            status.source = '<a href="' + data.source.href + '">' + data.source.title + '</a>';
        }
        if (status.text && /\[score\]\d\[\/score\]/.test(status.text)) {
            status.text = status.text.replace('[score]5[/score]', '★★★★★');
            status.text = status.text.replace('[score]4[/score]', '★★★★☆');
            status.text = status.text.replace('[score]3[/score]', '★★★☆☆');
            status.text = status.text.replace('[score]2[/score]', '★★☆☆☆');
            status.text = status.text.replace('[score]1[/score]', '★☆☆☆☆');
            status.text = status.text.replace('[score]0[/score]', '');
        }
        status._data = data;
        if (data.reshared_status) {
            status.retweeted_status = this.format_result_item(data.reshared_status, 'status');
        }
        return status;
    } else if (play_load === 'comment') {
        var comment = data;
        comment.user = this.format_result_item(data.user, 'user');
        return comment;
    }
    return data;
}, });
var DoubanAPI = Object.inherits({}, sinaApi, {config: Object.inherits({}, sinaApi.config, {host: 'http://api.douban.com', source: '05e787211a7ff69311b695634f7fe3b9', oauth_key: '05e787211a7ff69311b695634f7fe3b9', oauth_secret: 'a29252a52eaa835d', result_format: '', userinfo_has_counts: false, support_comment: false, support_repost: false, support_comment_repost: false, support_repost_timeline: false, support_max_id: false, support_favorites: false, support_do_favorite: false, support_mentions: false, support_upload: false, need_processMsg: false, support_cursor_only: true, support_search: false, support_auto_shorten_url: false, user_timeline_need_friendship: false, user_timeline_need_user: true, show_fullname: true, support_blocking: false, oauth_host: 'http://www.douban.com', oauth_authorize: '/service/auth/authorize', oauth_request_token: '/service/auth/request_token', oauth_access_token: '/service/auth/access_token', oauth_realm: 'fawave', friends_timeline: '/people/%40me/miniblog/contacts', user_timeline: '/people/{{id}}/miniblog', update: '/miniblog/saying', destroy: '/miniblog/{{id}}', direct_messages: '/doumail/inbox', sent_direct_messages: '/doumail/outbox', friends: '/people/{{user_id}}/contacts', followers: '/people/{{user_id}}/friends', new_message: '/doumails', destroy_msg: '/doumail/{{id}}', comment: '/miniblog/{{id}}/comments_post', reply: '/miniblog/{{id}}/comments_post', comments: '/miniblog/{{id}}/comments', user_search: '/people', user_show: '/people/{{id}}', verify_credentials: '/people/%40me'}), _sendRequest: function (params, callback, context) {
    showMsg('请重新授权 "豆瓣广播"', true);
    callback({}, 'error', 400);
}, counts: function (data, callback, context) {
    callback.call(context);
}, rate_limit_status: function (data, callback, context) {
    callback.call(context, {error: _u.i18n("comm_no_api")});
}, before_sendRequest: function (args) {
    if (args.url === this.config.oauth_request_token || args.url === this.config.oauth_access_token) {
        return;
    }
    args.data.alt = 'json';
    if (args.data.count) {
        args.data['max-results'] = args.data.count;
        if (args.data.cursor) {
            args.data['start-index'] = args.data.cursor;
            args.data.cursor = Number(args.data.cursor);
            if (args.data.cursor == -1) {
                args.data.cursor = 1;
            }
            args.next_cursor = args.data.cursor + args.data.count;
            delete args.data.cursor;
        } else {
            args.next_cursor = args.data.count + 1;
        }
        delete args.data.count;
    }
    delete args.data.screen_name;
    delete args.data.since_id;
    args.data.apikey = args.data.source;
    delete args.data.source;
    if (args.url === this.config.update) {
        args.content = '<?xml version="1.0" encoding="UTF-8"?><entry xmlns:ns0="http://www.w3.org/2005/Atom" xmlns:db="http://www.douban.com/xmlns/"><content><![CDATA[{{status}}]]></content></entry>'.format(args.data);
        args.contentType = 'application/atom+xml; charset=utf-8';
        args.data = {};
    } else if (args.url === this.config.destroy || args.url === this.config.destroy_msg) {
        delete args.data.apikey;
        delete args.data.alt;
        args.type = 'DELETE';
    } else if (args.url === this.config.friends_timeline || args.url == this.config.user_timeline) {
        args.data.type = 'all';
    } else if (args.url == this.config.new_message) {
        args.content = '<?xml version="1.0" encoding="UTF-8"?><entry xmlns="http://www.w3.org/2005/Atom" xmlns:db="http://www.douban.com/xmlns/" xmlns:gd="http://schemas.google.com/g/2005" xmlns:opensearch="http://a9.com/-/spec/opensearchrss/1.0/"><db:entity name="receiver"><uri>http://api.douban.com/people/{{id}}</uri></db:entity><content><![CDATA[{{text}}]]></content><title><![CDATA[{{text}}]]></title></entry>'.format(args.data);
        args.contentType = 'application/atom+xml; charset=utf-8';
        args.data = {};
    } else if (args.url === this.config.comment) {
        args.content = '<?xml version="1.0" encoding="UTF-8"?><entry><content><![CDATA[{{comment}}]]></content></entry>'.format(args.data);
        args.contentType = 'application/atom+xml; charset=utf-8';
        args.data = {id: args.data.id};
        args.url = args.url.replace('_post', '');
        args.is_comment_post = true;
    } else if (args.url === this.config.comments) {
        args.miniblog_id = args.data.id;
    }
}, format_result: function (data, play_load, args) {
    if (args.url === this.config.update || args.url === this.config.destroy || args.url == this.config.destroy_msg || args.url == this.config.new_message || args.is_comment_post) {
        return true;
    }
    var items = data.entry || data;
    if ($.isArray(items)) {
        if (data.author) {
            data.user = this.format_result_item(data.author, 'user', args);
        }
        var map = {};
        var need = [];
        for (var i in items) {
            if (!items[i].author && data.user) {
                items[i].user = data.user;
            }
            var itemData = this.format_result_item(items[i], play_load, args);
            if (play_load === 'status') {
                if (itemData.id && map[itemData.id]) {
                    continue;
                }
            }
            if (itemData.id) {
                map[itemData.id] = 1;
            }
            need.push(itemData);
        }
        data.items = need;
        if (items.length === 0) {
            args.next_cursor = '0';
        }
        if (args.next_cursor) {
            data.next_cursor = args.next_cursor;
        }
    } else {
        data = this.format_result_item(data, play_load, args);
    }
    return data;
}, REDIRECT_LINK_RE: /href\=\"(http\:\/\/\w+\.douban\.com\/link\w?\?url=([^\"]+))\"/i, format_result_item: function (data, play_load, args) {
    if (play_load === 'user' && data) {
        if (data.link) {
            var url_index = 1, icon_index = 2;
            if (data.link.length == 2) {
                url_index = 0;
                icon_index = 1;
            }
            data.t_url = data.link[url_index]['@href'];
            data.profile_image_url = data.link[icon_index]['@href'];
        } else {
            data.t_url = data.uri['$t'];
        }
        if (data['db:uid']) {
            data.id = data['db:uid']['$t'];
        } else {
            data.id = data.t_url.substring(data.t_url.lastIndexOf('/people/') + 8, data.t_url.length - 1);
        }
        if (data.content) {
            data.description = data.content['$t'];
            delete data.content;
        }
        if (data['db:location']) {
            data.province = data['db:location']['$t'];
            delete data.location;
        }
        data.screen_name = data.title ? data.title['$t'] : data.name['$t'];
        data.name = data.id;
        delete data.link;
        delete data.title;
    } else if (play_load === 'status' || play_load === 'comment') {
        if (data.author) {
            data.user = this.format_result_item(data.author, 'user', args);
        }
        if (data['db:uid']) {
            data.id = data['db:uid']['$t'];
        } else {
            data.id = data.id['$t'];
            if (play_load == 'comment') {
                data.id = data.id.substring(data.id.lastIndexOf('/comment/') + 9, data.id.length);
            } else {
                data.id = data.id.substring(data.id.lastIndexOf('/miniblog/') + 10, data.id.length);
            }
        }
        if (data.user) {
            data.t_url = 'http://www.douban.com/people/' + data.user.id + '/status/' + data.id;
        }
        if (data.content) {
            data.text = data.content['$t'];
            var m = this.REDIRECT_LINK_RE.exec(data.text);
            if (m) {
                data.text = data.text.replace(m[1], decodeURIComponent(m[2]));
            }
        } else {
            data.text = '<a href="' + data.t_url + '">' + data.t_url + '</a>';
        }
        if (data.category) {
            var term = data.category['@term'], can_comment = false, add_comment_to_text = false;
            if (term.endswith('#miniblog.recommendation')) {
                add_comment_to_text = true;
                var $a = $(data.text);
                if ($a.length === 1) {
                    var href = $a.attr('href');
                    if (!href || href.length < 10) {
                        var word = $a.html();
                        data.text = '推荐<a href="http://music.douban.com/subject_search?search_text=' + word + '">' + word + '</a>';
                    }
                }
            } else if (term.endswith('#miniblog.saying')) {
                can_comment = true;
            }
            if ((can_comment || add_comment_to_text) && data['db:attribute']) {
                $.each(data['db:attribute'], function (index, item) {
                    if (can_comment && item['@name'] === 'comments_count') {
                        data[item['@name']] = item['$t'];
                    } else if (add_comment_to_text && item['@name'] === 'comment') {
                        add_comment_to_text = false;
                        if (item['$t']) {
                            data.text += ' : ' + item['$t'];
                        }
                    }
                });
                delete data['db:attribute'];
            }
        }
        if (data.comments_count === undefined) {
            data.hide_comments = true;
        }
        delete data.author;
        delete data.content;
    } else if (play_load === 'message') {
        data.sender = data.user = this.format_result_item(data.author, 'user', args);
        if (data['db:entity'] && data['db:entity']['@name'] == "receiver") {
            data.recipient = this.format_result_item(data['db:entity'], 'user', args);
            delete data['db:entity'];
        }
        data.text = data.title['$t'];
        data.id = data.id['$t'];
        data.id = data.id.substring(data.id.lastIndexOf('/doumail/') + 9, data.id.length);
        data.t_url = data.link[1]['@href'];
        data.text += (' <a href="{{t_url}}">' + _u.i18n("comm_view") + '</a>').format(data);
        delete data.title;
    }
    if (data.published) {
        data.created_at = data.published['$t'];
        delete data.published;
    }
    return data;
}, url_encode: function (text) {
    return text;
}});
var TianyaAPI = Object.inherits({}, sinaApi, {config: Object.inherits({}, sinaApi.config, {host: 'http://open.tianya.cn/api', source: '12d4d19aee679b8713297c2583fe21b204dd9ca0a', oauth_key: '12d4d19aee679b8713297c2583fe21b204dd9ca0a', oauth_secret: '0b3b77ad0586343a18670a18e44d7457', result_format: '', oauth_callback: FAWAVE_OAUTH_CALLBACK_URL, userinfo_has_counts: false, comment_need_user_id: true, support_comment: true, support_repost: false, support_comment_repost: false, support_repost_timeline: false, support_max_id: false, support_favorites: false, support_do_favorite: false, support_mentions: true, support_auto_shorten_url: false, support_followers: false, user_timeline_need_friendship: false, support_search: false, support_direct_messages: false, support_sent_direct_messages: false, support_blocking: false, oauth_host: 'http://open.tianya.cn', oauth_authorize: '/oauth/authorize.php', oauth_request_token: '/oauth/request_token.php', oauth_access_token: '/oauth/access_token.php', update: '/weibo/add.php', upload: '/weibo/addimg.php', verify_credentials: '/user/info.php', friends_timeline: '/weibo/gethomeline.php', user_timeline: '/weibo/getmyweibo.php', comments_timeline: '/weibo/getreceivecomment.php', mentions: '/weibo/getaboutme.php', comment: '/weibo/addcomment.php', }), user_cache: {}, apply_auth: function (url, args, user) {
    if (url && url.indexOf('access_token.php') < 0 && user.oauth_token_secret) {
        args.data.oauth_token = user.oauth_token_key;
        args.data.oauth_token_secret = user.oauth_token_secret;
        var timestamp = (new Date().getTime() / 1000).toFixed(0);
        var tempkey = hex_md5(timestamp + this.config.oauth_key +
            user.oauth_token_key + user.oauth_token_secret + this.config.oauth_secret).toUpperCase();
        args.data.timestamp = timestamp;
        args.data.tempkey = tempkey;
    } else {
        this.super_.apply_auth.call(this, url, args, user);
    }
}, counts: function (data, callback, context) {
    callback.call(context);
}, rate_limit_status: function (data, callback, context) {
    callback.call(context, {error: _u.i18n("comm_no_api")});
}, url_encode: function (text) {
    return text;
}, before_sendRequest: function (args, user) {
    args.data.outformat = 'json';
    if (args.url.indexOf('/oauth/') < 0) {
        args.data.appkey = args.data.source;
        delete args.data.source;
    }
    if (args.url === this.config.update) {
        args.data.word = args.data.status;
        delete args.data.status;
    }
    if (args.data.count) {
        args.data.pagesize = args.data.count;
        delete args.data.count;
    }
    if (args.url === this.config.comment) {
        args.data.word = encodeURIComponent(args.data.comment);
        args.data.authorid = args.data.user_id;
        delete args.data.comment;
        delete args.data.user_id;
    }
}, format_upload_params: function (user, data, pic) {
    pic.keyname = 'media';
    data.appkey = data.source;
    delete data.source;
    data.word = data.status;
    delete data.status;
}, format_result: function (data, play_load, args) {
    if (data && !data.error && data.data) {
        data = data.data.items || data.data;
    }
    if ($.isArray(data)) {
        for (var i = 0, l = data.length; i < l; i++) {
            data[i] = this.format_result_item(data[i], play_load, args);
        }
    } else {
        data = this.format_result_item(data, play_load, args);
    }
    return data;
}, format_result_item: function (data, play_load, args) {
    if (play_load === 'user') {
        data = data.user || data;
        data.id = data.user_id;
        data.screen_name = data.user_name;
        if (data.register_date) {
            data.created_at = new Date(data.register_date);
        }
        if (data.birthday) {
            data.birthday = new Date(data.birthday);
        }
        data.verified = !!data.isvip;
        data.gender = 'n';
        if (data.sex && data.sex.indexOf) {
            if (data.sex.indexOf('男') >= 0) {
                data.gender = 'm';
            } else if (data.sex.indexOf('女') >= 0) {
                data.gender = 'f';
            }
        }
        data.description = data.describe;
        data.profile_image_url = data.userheadphoto || 'http://tx.tianyaui.com/logo/man/' + data.id;
        data.t_url = 'http://my.tianya.cn/' + data.id;
    } else if (play_load === 'status') {
        data.text = data.originContent || data.titleOrigin;
        delete data.originContent;
        delete data.titleOrigin;
        delete data.word;
        if (this.user_cache[data.uid]) {
            data.user = this.user_cache[data.uid];
        } else {
            data.user = {user_id: data.uid, user_name: data.uname};
            data.user = this.format_result_item(data.user, 'user', args);
        }
        delete data.uid;
        delete data.uname;
        if (data.time) {
            data.created_at = new Date(data.time);
            delete data.time;
        }
        if (data.medias && data.medias.image && data.medias.image[0]) {
            var image = data.medias.image[0];
            data.thumbnail_pic = image.sUrl;
            data.bmiddle_pic = image.mUrl;
            data.original_pic = image.lUrl;
        }
        delete data.medias;
        delete data.media;
        data.t_url = 'http://my.tianya.cn/t/' + data.user.id + '/' + data.id;
        data.source = data.from;
        delete data.from;
        data.repost_count = data.shareCount;
        data.comments_count = data.replyCount;
        if (data.sharedId) {
            data.retweeted_status = {id: data.sharedId, text: htmldecode(data.sharedTitle || '')};
            if (data.sharedMedias && data.sharedMedias.image && data.sharedMedias.image[0]) {
                var image = data.sharedMedias.image[0];
                data.retweeted_status.thumbnail_pic = image.sUrl;
                data.retweeted_status.bmiddle_pic = image.mUrl;
                data.retweeted_status.original_pic = image.lUrl;
            }
            delete data.sharedMedias;
            delete data.sharedMedia;
            data.retweeted_status.repost_count = data.sharedShareCount;
            data.retweeted_status.comments_count = data.sharedReplyCount;
            if (this.user_cache[data.sharedUid]) {
                data.retweeted_status.user = this.user_cache[data.sharedUid];
            } else {
                data.retweeted_status.user = {user_id: data.sharedUid, user_name: data.sharedUname};
                data.retweeted_status.user = this.format_result_item(data.retweeted_status.user, 'user', args);
            }
            data.retweeted_status.t_url = 'http://my.tianya.cn/t/' + data.retweeted_status.user.id + '/' + data.retweeted_status.id;
        }
    } else if (play_load === 'comment') {
        data.text = data.wordOrigin;
        delete data.wordOrigin;
        delete data.word;
        data.user = {user_id: data.uid, user_name: data.uname};
        data.user = this.format_result_item(data.user, 'user', args);
        delete data.uid;
        delete data.uname;
        data.created_at = new Date(data.time);
        delete data.time;
        if (data.twId) {
            data.status = {id: data.twId, media: data.twMedia, mediaFlag: data.twMediaFlag, medias: data.twMedias, replyCount: data.twReplyCount, shareCount: data.twShareCount, star: data.twStar, title: data.twTitle, titleOrigin: data.twTitleOrigin, uid: data.twUid, uname: data.twUname};
            data.status = this.format_result_item(data.status, 'status', args);
            for (var k in data) {
                if (k.indexOf('tw') === 0) {
                    delete data[k];
                }
            }
            if (data.sharedTwId) {
                data.status.retweeted_status = {id: data.sharedTwId, media: data.sharedTwMedia, mediaFlag: data.sharedTwMediaFlag, medias: data.sharedTwMedias, replyCount: data.sharedTwReplyCount, shareCount: data.sharedTwShareCount, star: data.sharedTwStar, title: data.sharedTwTitle, titleOrigin: data.sharedTwTitleOrigin || htmldecode(data.sharedTwTitle || ''), uid: data.sharedTwUid, uname: data.sharedTwUname};
                data.status.retweeted_status = this.format_result_item(data.status.retweeted_status, 'status', args);
                for (var k in data) {
                    if (k.indexOf('sharedTw') === 0) {
                        delete data[k];
                    }
                }
            }
        }
    }
    return data;
}});
var FacebookAPI = Object.inherits({}, sinaApi, {config: Object.inherits({}, sinaApi.config, {host: 'https://graph.facebook.com', user_home_url: 'http://www.facebook.com/', source: '121425774590172', oauth_key: '121425774590172', oauth_secret: 'ab7ffce878acf3c7e870c0e7f0a1b29a', result_format: '', userinfo_has_counts: false, support_counts: false, support_cursor_only: true, support_friends_only: true, support_repost: false, support_comment_repost: false, support_repost_timeline: false, support_sent_direct_messages: false, support_comment: false, support_do_comment: true, support_mentions: false, support_favorites: false, support_auto_shorten_url: false, user_timeline_need_friendship: false, support_blocking: false, direct_messages: '/me/inbox', verify_credentials: '/me', friends_timeline: '/me/home', destroy: '/{{id}}_delete', user_timeline: '/{{id}}/feed', update: '/me/feed_update', upload: '/me/photos', friends: '/{{user_id}}/friends', followers: '/{{user_id}}/friends', comment: '/{{id}}/comments', favorites_create: '/{{id}}/likes', favorites_destroy: '/{{id}}/likes', new_message: '/{{id}}/notes', oauth_authorize: '/oauth/authorize', oauth_request_token: '/oauth/request_token', oauth_callback: FAWAVE_OAUTH_CALLBACK_URL, oauth_access_token: '/oauth/access_token', oauth_scope: ['offline_access', 'publish_stream', 'read_insights', 'read_mailbox', 'read_requests', 'read_stream', 'user_activities', 'friends_activities', 'user_birthday', 'friends_birthday', 'user_about_me', 'friends_about_me', 'user_photos', 'friends_photos', 'user_relationships', 'friends_relationships', 'user_status', 'friends_status', 'user_interests', 'friends_interests', 'user_likes', 'friends_likes', 'user_online_presence', 'friends_online_presence', 'user_website', 'friends_website', 'user_videos', 'friends_videos', 'read_friendlists', 'manage_friendlists', 'user_checkins', 'friends_checkins', 'user_hometown', 'friends_hometown', 'user_location', 'friends_location', 'user_religion_politics', 'friends_religion_politics'].join(',')}), url_encode: function (text) {
    return text;
}, apply_auth: function (url, args, user) {
}, get_access_token: function (user, callback, context) {
    var params = {url: this.config.oauth_access_token, type: 'get', user: user, play_load: 'string', apiHost: this.config.oauth_host, data: {client_id: this.config.oauth_key, redirect_uri: this.config.oauth_callback, client_secret: this.config.oauth_secret, code: user.oauth_pin}, need_source: false};
    this._sendRequest(params, function (token_str, text_status, error_code) {
        var token = null;
        if (text_status != 'error') {
            token = decodeForm(token_str);
            if (!token.access_token) {
                token = null;
                error_code = token_str;
                text_status = 'error';
            } else {
                user.oauth_token_key = token.access_token;
            }
        }
        callback.call(context, token ? user : null, text_status, error_code);
    });
}, get_authorization_url: function (user, callback, context) {
    var params = {client_id: this.config.oauth_key, redirect_uri: this.config.oauth_callback, scope: this.config.oauth_scope};
    var login_url = this.format_authorization_url(params);
    callback.call(context, login_url, 'success', 200);
}, format_upload_params: function (user, data, pic) {
    data.message = data.status;
    delete data.status;
    if (user.oauth_token_key) {
        data.access_token = user.oauth_token_key;
    }
    pic.keyname = 'source';
}, before_sendRequest: function (args, user) {
    delete args.data.source;
    delete args.data.since_id;
    if (args.play_load == 'string') {
        return;
    }
    if (user.oauth_token_key) {
        args.data.access_token = user.oauth_token_key;
    }
    if (args.data.count) {
        args.data.limit = args.data.count;
        delete args.data.count;
    }
    if (args.data.cursor) {
        if (String(args.data.cursor) != '-1') {
            if (args.url == this.config.friends) {
                args.data.offset = args.data.cursor;
            } else {
                args.data.until = args.data.cursor;
            }
        }
        delete args.data.cursor;
    }
    if (args.url == this.config.update) {
        args.url = args.url.replace('_update', '');
        args.data.message = args.data.status;
        delete args.data.status;
    }
    else if (args.url == this.config.comment) {
        args.data.message = args.data.comment;
        delete args.data.comment;
    }
    else if (args.url == this.config.destroy) {
        args.url = args.url.replace('_delete', '');
        args.type = 'DELETE';
    }
    else if (args.url == this.config.favorites_destroy) {
        args.type = 'DELETE';
    }
    else if (args.url == this.config.new_message) {
        args.data.message = args.data.text;
        args.data.subject = args.data.text.slice(0, 80);
        delete args.data.text;
    } else if (args.url == this.config.user_search) {
        args.url = '/search';
        args.data.type = 'user';
    } else if (args.url == this.config.search) {
        args.url = '/search';
        args.data.type = 'post';
    }
}, format_result: function (data, play_load, args) {
    var items = data;
    if (!$.isArray(data) && data.data) {
        items = data.items = data.data;
        delete data.data;
    }
    if ($.isArray(items)) {
        for (var i in items) {
            items[i] = this.format_result_item(items[i], play_load, args);
        }
    } else {
        data = this.format_result_item(data, play_load, args);
    }
    if (data.paging) {
        if (data.paging.next) {
            var params = decodeForm(data.paging.next);
            data.next_cursor = String(params.until || params.offset);
        } else {
            data.next_cursor = '0';
        }
    }
    return data;
}, format_result_item: function (data, play_load, args) {
    if (play_load == 'user' && data && data.id) {
        data.t_url = data.link || 'http://www.facebook.com/profile.php?id=' + data.id;
        data.profile_image_url = this.config.host + '/' + data.id + '/picture';
        data.screen_name = data.name;
        data.description = data.about;
        if (data.gender) {
            data.gender = data.gender == 'male' ? 'm' : 'f';
        } else {
            data.gender = 'n';
        }
        if (data.location && data.location.name) {
            data.province = data.location.name;
        }
        if (data.hometown && data.hometown.name) {
            data.city = data.hometown.name;
        }
        delete data.location;
        delete data.hometown;
        delete data.about;
    } else if (play_load == 'status' || play_load == 'message') {
        data.text = data.message || '';
        if (!data.text) {
            if (data.name) {
                data.text += ' ' + data.name;
            }
            if (data.link) {
                data.text += ' ' + data.link;
            }
        }
        delete data.message;
        data.t_url = data.link;
        delete data.link;
        if (data.picture) {
            if (data.picture.indexOf('/safe_image.php?') > 0) {
                data.thumbnail_pic = data.picture;
                var params = decodeForm(data.picture);
                data.bmiddle_pic = params.url;
                data.original_pic = data.bmiddle_pic;
            } else {
                data.thumbnail_pic = data.picture;
                data.bmiddle_pic = data.picture.replace('_s.', '_n.');
                data.original_pic = data.bmiddle_pic;
            }
            delete data.picture;
        }
        if (data.application) {
            data.source = '<a href="http://www.facebook.com/apps/application.php?id={{id}}" target="_blank">{{name}}</a>'.format(data.application);
            delete data.application;
        }
        data.user = this.format_result_item(data.from, 'user', args);
        data.created_at = data.created_time || data.updated_time;
        delete data.from;
    } else if (play_load == 'comment') {
    }
    return data;
}});
var RenrenAPI = Object.inherits({}, sinaApi, {config: Object.inherits({}, sinaApi.config, {host: 'http://api.renren.com/restserver.do', oauth_host: 'https://graph.renren.com', user_home_url: 'http://www.renren.com/', source: '4f3e0d2c2ccc4ccf8c30767b08da9253', oauth_key: '4f3e0d2c2ccc4ccf8c30767b08da9253', oauth_secret: 'be199423964443a583780ec10b8381fb', call_id: 0, result_format: '', support_counts: false, support_cursor_only: false, support_friends_only: true, support_repost: true, support_comment_repost: true, support_repost_timeline: false, support_direct_messages: false, support_sent_direct_messages: false, support_comment: false, support_do_comment: true, support_mentions: false, support_favorites: false, support_auto_shorten_url: false, support_max_id: false, user_timeline_need_friendship: false, use_method_param: true, support_blocking: false, support_search: false, support_user_search: false, user_search: 'friends.search', direct_messages: '/me/inbox', verify_credentials: 'users.getLoggedInUser', user_profile: 'users.getProfileInfo', user_profile_fields: ['base_info', 'status', 'visitors_count', 'blogs_count', 'albums_count', 'friends_count', 'guestbook_count', 'status_count'].join(','), friends_timeline: 'feed.get', friends_timeline_type: '10,20,21,30,32,50,51,52', destroy: '/{{id}}_delete', user_timeline: 'feed.get', comments: 'status.getComment', comments_need_status: true, update: 'status.set', upload: 'photos.upload', friends: 'friends.getFriends', followers: 'friends.getFriends', users: 'users.getInfo', photos: 'photos.get', comment: 'status.addComment', reply: 'status.addComment', repost: 'status.forward', repost_need_status: true, favorites_create: 'like.like', favorites_destroy: 'like.unlike', favorite_need_status: true, support_favorite_count: true, new_message: '/{{id}}/notes', oauth_authorize: '/oauth/authorize', oauth_callback: FAWAVE_OAUTH_CALLBACK_URL, oauth_access_token: '/oauth/token', oauth_scope: ['read_user_feed', 'read_user_message', 'read_user_photo', 'read_user_status', 'read_user_comment', 'read_user_share', 'publish_feed', 'publish_share', 'send_request', 'send_message', 'photo_upload', 'status_update', 'publish_comment', 'operate_like'].join(' ')}), url_encode: function (text) {
    return text;
}, apply_auth: function (url, args, user) {
}, get_access_token: function (user, callback, context) {
    var params = {url: this.config.oauth_access_token, type: 'get', user: user, play_load: 'string', apiHost: this.config.oauth_host, data: {client_id: this.config.oauth_key, redirect_uri: this.config.oauth_callback, client_secret: this.config.oauth_secret, code: user.oauth_pin, grant_type: 'authorization_code'}, need_source: false};
    this._sendRequest(params, function (token_str, text_status, error_code) {
        var token = null;
        if (text_status !== 'error') {
            token = JSON.parse(token_str);
            if (!token.access_token) {
                token = null;
                error_code = token_str;
                text_status = 'error';
            } else {
                user.oauth_token_key = token.access_token;
                user.oauth_expires_in = token.expires_in;
                user.oauth_scope = token.scope;
            }
        }
        callback.call(context, token ? user : null, text_status, error_code);
    });
}, get_authorization_url: function (user, callback, context) {
    var params = {client_id: this.config.oauth_key, redirect_uri: this.config.oauth_callback, scope: this.config.oauth_scope, response_type: 'code'};
    var login_url = this.format_authorization_url(params);
    callback.call(context, login_url, 'success', 200);
}, signature: function (params, user) {
    params.access_token = user.oauth_token_key;
    params.api_key = this.config.oauth_key;
    params.v = '1.0';
    var kvs = [];
    for (var k in params) {
        kvs.push([k, params[k]]);
    }
    kvs.sort(function (a, b) {
        if (a[0] < b[0])return-1;
        if (a[0] > b[0])return 1;
        if (a[1] < b[1])return-1;
        if (a[1] > b[1])return 1;
        return 0;
    });
    var sig = "";
    for (var p = 0; p < kvs.length; ++p) {
        var value = kvs[p][1];
        if (value == null)continue;
        sig += kvs[p][0] + '=' + value;
    }
    sig = hex_md5(sig + this.config.oauth_secret);
    params.sig = sig;
}, before_sendRequest: function (args, user) {
    delete args.data.source;
    delete args.data.since_id;
    if (args.play_load === 'string') {
        return;
    }
    args.data.method = args.url;
    var status_type = 'status';
    var data_status = null;
    if (args.data.status && args.data.status.id) {
        data_status = args.data.status;
        status_type = data_status.status_type;
        if (status_type === 'status') {
            args.data.status_id = args.data.id;
            args.data.owner_id = data_status.user.id;
        } else if (status_type === 'photo') {
            args.data.pid = args.data.id;
            args.data.uid = data_status.user.id;
        } else if (status_type === 'share') {
            args.data.share_id = args.data.id;
            args.data.user_id = data_status.user.id;
        }
        delete args.data.id;
        delete args.data.status;
    }
    if (args.url === this.config.user_timeline) {
        args.data.uid = args.data.id;
        delete args.data.id;
        delete args.data.screen_name;
        args.data.type = this.config.friends_timeline_type;
    } else if (args.url === this.config.friends_timeline) {
        args.data.type = this.config.friends_timeline_type;
    } else if (args.url === this.config.comments) {
        if (status_type === 'photo') {
            args.data.method = 'photos.getComments';
        } else if (status_type === 'share') {
            args.data.method = 'share.getComments';
        }
        args.data.order = 1;
    } else if (args.url === this.config.comment) {
        if (args.data.reply_user_id) {
            args.data.rid = args.data.reply_user_id;
            delete args.data.reply_user_id;
            delete args.data.cid;
        }
        args.data.content = args.data.comment;
        if (status_type === 'photo') {
            args.data.method = 'photos.addComment';
        } else if (status_type === 'share') {
            args.data.method = 'share.addComment';
            if (args.data.rid) {
                args.data.to_user_id = args.data.rid;
                delete args.data.rid;
            }
        }
        if (status_type !== 'share') {
            delete args.data.user_id;
        }
        delete args.data.comment;
    } else if (args.url === this.config.friends) {
        delete args.data.user_id;
        delete args.data.screen_name;
        var cursor = parseInt(args.data.cursor);
        delete args.data.cursor;
        if (cursor > 0) {
            args.data.page = cursor;
        }
    } else if (args.url === this.config.repost) {
        if (args.data.retweeted_status.status_type === 'status') {
            args.data.forward_id = args.data.id;
            delete args.data.id;
            args.data.forward_owner = args.data.retweeted_status.user.id;
            args.data.status += '//';
        } else {
            args.data.method = 'share.share';
            args.data.type = args.data.retweeted_status.status_type === 'share' ? 20 : 2;
            args.data.ugc_id = args.data.retweeted_status.id;
            args.data.user_id = args.data.retweeted_status.user.id;
            args.data.comment = args.data.status;
            delete args.data.status;
        }
        delete args.data.retweeted_status;
    } else if (args.url === this.config.favorites_create || args.url === this.config.favorites_destroy) {
        args.data = {method: args.url, url: 'http://www.renren.com/g?ownerid=' +
            (args.data.owner_id || args.data.uid) + '&resourceid=' + (args.data.status_id || args.data.pid) + '&type=' + status_type};
    } else if (args.url === this.config.user_search) {
        args.data.name = args.data.q;
        delete args.data.q;
    }
    args.type = 'post';
    args.data.format = 'json';
    args.url = '';
    var old_status = args.data.status;
    if (args.data.status) {
        args.data.status = Base64._utf8_encode(args.data.status);
    }
    var old_content = args.data.content;
    if (args.data.content) {
        args.data.content = Base64._utf8_encode(args.data.content);
    }
    var old_comment = args.data.comment;
    if (args.data.comment) {
        args.data.comment = Base64._utf8_encode(args.data.comment);
    }
    this.signature(args.data, user);
    if (old_status) {
        args.data.status = old_status;
    }
    if (old_content) {
        args.data.content = old_content;
    }
    if (old_comment) {
        args.data.comment = old_comment;
    }
}, format_upload_params: function (user, data, pic) {
    delete data.source;
    data.method = this.config.upload;
    data.caption = data.status;
    delete data.status;
    data.format = 'json';
    var old_caption = data.caption;
    if (data.caption) {
        data.caption = Base64._utf8_encode(data.caption);
    }
    this.signature(data, user);
    if (old_caption) {
        data.caption = old_caption;
    }
    pic.keyname = 'upload';
}, _at_match_rex: /@([●\w\-\_\u2E80-\u3000\u303F-\u9FFF]+)\(([\d]+)(\s?)\)/g, processAt: function (str) {
    return str.replace(this._at_match_rex, '<a class="getUserTimelineBtn" href="" data-screen_name="$1" data-id="$2" rhref="' +
        this.config.user_home_url + 'g/$2" title="' +
        _u.i18n("btn_show_user_title") + '">@$1</a>$3');
}, _emotion_rex: typeof RENREN_FACES === 'object' ? new RegExp('\\((' + Object.keys(RENREN_FACES).join('|') + ')\\)', 'g') : null, processEmotional: function (str) {
    if (!this._emotion_rex) {
        return str;
    }
    return str.replace(this._emotion_rex, function (m, g1) {
        if (window.RENREN_FACES && g1) {
            var emotion = RENREN_FACES[g1];
            if (emotion) {
                var tpl = '<img title="{{title}}" src="' + '{{emotion}}" />';
                return tpl.format({title: g1, emotion: emotion});
            }
        }
        return m;
    });
}, format_result: function (data, play_load, args) {
    if (data && (data.result === 1 || (args.data.method === 'share.share' && data.id) || (args.data.method === 'status.forward' && data.id))) {
        return true;
    }
    if (args.data.method === 'share.getComments' && data && data.comments) {
        data = data.comments;
    } else if (args.data.method === 'friends.search' && data.friends) {
        var users = data.friends || [];
        data = [];
        for (var i = 0, l = users.length; i < l; i++) {
            var user = users[i];
            var info = user.info;
            if (info) {
                info = info.split(',');
                info = {province: info[0], city: info[1]}
            }
            data.push({id: user.id, hometown_location: info, name: user.name, tinyurl: user.tinyurl, isFriend: user.isFriend});
        }
    }
    return this.super_.format_result.call(this, data, play_load, args);
}, format_result_item: function (data, play_load, args) {
    if (play_load === 'user' && data && (data.uid || data.id)) {
        var user = {id: data.actor_id || data.uid || data.id, name: data.name};
        user.following = data.isFriend;
        delete data.uid;
        delete data.actor_id;
        delete data.name;
        user.t_url = 'http://www.renren.com/profile.do?id=' + user.id;
        user.profile_image_url = data.tinyurl || data.headurl;
        delete data.tinyurl;
        delete data.headurl;
        user.screen_name = user.name;
        user.description = data.network_name;
        delete data.network_name;
        user.gender = 'n';
        if (data.sex !== undefined) {
            user.gender = data.sex === 1 ? 'm' : 'f';
            delete data.sex;
        }
        if (data.base_info) {
            user.gender = data.base_info.gender == '1' ? 'm' : 'f';
            if (data.base_info.hometown) {
                user.province = data.base_info.hometown.province;
                user.city = data.base_info.hometown.city;
            }
        }
        delete data.base_info;
        if (data.hometown_location) {
            user.province = data.hometown_location.province;
            user.city = data.hometown_location.city;
        }
        delete data.hometown_location;
        user.followers_count = data.visitors_count;
        user.friends_count = data.friends_count;
        user.statuses_count = data.status_count;
        return user;
    } else if (play_load === 'status' || play_load === 'message') {
        data.id = data.status_id || data.source_id;
        delete data.post_id;
        delete data.status_id;
        if (data.message) {
            data.text = data.message;
        } else {
            var title = data.title || '';
            if (title) {
                title += ' ';
            }
            data.text = title + (data.description || '');
        }
        data.user = this.format_result_item(data, 'user', args);
        data.t_url = data.href;
        data.status_type = 'status';
        if (data.feed_type === 30) {
            data.status_type = 'photo';
        } else if (data.feed_type === 32) {
            data.status_type = 'share';
            if (data.message) {
                data.text = data.message;
            }
            data.t_url = 'http://share.renren.com/share/' + data.user.id + '/' + data.id;
        } else if (data.feed_type === 21) {
            data.status_type = 'share';
        } else if (data.feed_type === 51) {
            data.status_type = 'share';
            var url = data.href;
            if (data.attachment && data.attachment[0]) {
                if (data.attachment[0].href && data.attachment[0].href.indexOf('...') < 0) {
                    url = data.attachment[0].href
                }
            }
            data.text = data.title + ' ' + url;
        }
        if (data.comments) {
            data.comments_count = data.comments.count || 0;
        }
        if (data.likes) {
            data.favorite_count = data.likes.total_count + data.likes.user_like;
            data.favorited = data.likes.user_like === 1;
        }
        if (data.attachment && data.attachment.length > 0) {
            for (var i = 0, l = data.attachment.length; i < l; i++) {
                var attachment = data.attachment[i];
                var pic_owner_id = attachment.owner_id;
                if (attachment.media_type === 'photo') {
                    if (data.user.id === pic_owner_id && data.status_type !== 'share') {
                        data.thumbnail_pic = attachment.src;
                        data.bmiddle_pic = data.original_pic = attachment.raw_src || attachment.src;
                        data.pic_id = attachment.media_id;
                        data.pic_owner_id = pic_owner_id;
                        data.text = attachment.content;
                        data.text = data.text.replace(/<a\shref=.+?namecard=['"](\d+)['"][^>]+>(@[^>]+)<\/a>/ig, '$2($1)');
                        data.t_url = 'http://photo.renren.com/photo/' + data.user.id + '/photo-' + data.pic_id;
                        data.id = data.pic_id;
                    } else {
                        data.retweeted_status = data.retweeted_status || {};
                        if (!data.retweeted_status.original_pic) {
                            data.retweeted_status.id = data.retweeted_status.id || attachment.media_id;
                            data.retweeted_status.pic_id = attachment.media_id;
                            data.retweeted_status.pic_owner_id = pic_owner_id;
                            data.retweeted_status.thumbnail_pic = attachment.src;
                            data.retweeted_status.bmiddle_pic = data.retweeted_status.original_pic = attachment.raw_src || attachment.src;
                            data.retweeted_status.actor_id = pic_owner_id;
                            data.retweeted_status.name = data.retweeted_status.name || attachment.owner_name;
                            data.retweeted_status.t_url = attachment.href;
                            data.retweeted_status.text = data.retweeted_status.text || attachment.content || data.description || data.title;
                            var node = (data.trace && data.trace.node) || [];
                            node.push({id: pic_owner_id, name: data.retweeted_status.name});
                            for (var ni = 0, nl = node.length; ni < nl; ni++) {
                                var nitem = node[ni];
                                var ignoreText = '(转自|转)' + nitem.name + ':';
                                data.text = data.text.replace(new RegExp(ignoreText, 'ig'), '$1@' + nitem.name + '(' + nitem.id + '):');
                            }
                        }
                    }
                } else if (attachment.media_type === 'status') {
                    data.retweeted_status = data.retweeted_status || {};
                    data.retweeted_status.id = attachment.media_id;
                    data.retweeted_status.text = attachment.content;
                    data.retweeted_status.actor_id = pic_owner_id;
                    data.retweeted_status.name = attachment.owner_name;
                    data.retweeted_status.status_type = 'status';
                    var ignoreText = '(转自|转)' + attachment.owner_name + ':';
                    data.text = data.text.replace(new RegExp(ignoreText, 'ig'), '$1@' + attachment.owner_name + '(' + pic_owner_id + '):');
                } else if (attachment.media_type === 'blog') {
                    data.retweeted_status = data.retweeted_status || {};
                    data.retweeted_status.id = attachment.media_id;
                    data.retweeted_status.text = data.title + ': ' + data.description + ' ' + data.href;
                    data.retweeted_status.actor_id = pic_owner_id;
                    data.retweeted_status.name = attachment.owner_name;
                }
            }
            delete data.attachment;
            if (data.retweeted_status) {
                data.retweeted_status.user = this.format_result_item(data.retweeted_status, 'user', args);
                if (!data.retweeted_status.created_at) {
                    data.retweeted_status.created_at = data.update_time;
                }
                if (!data.retweeted_status.t_url) {
                    data.retweeted_status.t_url = 'http://status.renren.com/status/' +
                        data.retweeted_status.user.id + '/' + data.retweeted_status.id;
                }
            }
        }
        if (data.source) {
            data.source = '<a href="{{href}}" target="_blank">{{text}}</a>'.format(data.source);
        }
        if (!data.t_url) {
            data.t_url = 'http://status.renren.com/status/' + data.user.id + '/' + data.id;
        }
        data.created_at = data.update_time || data.time;
        delete data.update_time;
        delete data.time;
        delete data.message;
        delete data.title;
        delete data.prefix;
    } else if (play_load === 'comment') {
        data.id = data.comment_id;
        data.created_at = data.update_time || data.time;
        if (!data.text) {
            data.text = data.content;
        }
        delete data.comment_id;
        delete data.update_time;
        delete data.time;
        data.user = this.format_result_item(data, 'user', args);
    }
    return data;
}, verify_credentials: function (user, callback, data, context) {
    this.super_.verify_credentials.call(this, user, function (result, code_text, code) {
        var params = {url: this.config.user_profile, play_load: 'user', data: {user: user, uid: result.id, fields: this.config.user_profile_fields}};
        this._sendRequest(params, callback, context);
    }, data, this);
}, _fill_pics: function (user, items, callback, context) {
    var items_map = {}, user_id_pic_map = {};
    items = items || [];
    for (var i = 0, len = items.length; i < len; i++) {
        var item = items[i];
        var pid = item.pic_id;
        if (pid) {
            var list = items_map[pid] || [];
            list.push(item);
            items_map[pid] = list;
            var pids = user_id_pic_map[item.pic_owner_id] || [];
            pids.push(pid);
            user_id_pic_map[item.pic_owner_id] = pids;
        }
        if (item.retweeted_status && item.retweeted_status.pic_id) {
            item = item.retweeted_status;
            pid = item.pic_id;
            var list = items_map[pid] || [];
            list.push(item);
            items_map[pid] = list;
            var pids = user_id_pic_map[item.pic_owner_id] || [];
            pids.push(pid);
            user_id_pic_map[item.pic_owner_id] = pids;
        }
    }
    if (Object.keys(items_map).length === 0) {
        return callback.call(context, items);
    }
    var count = Object.keys(user_id_pic_map).length;
    for (var user_id in user_id_pic_map) {
        var pids = user_id_pic_map[user_id];
        var params = {url: this.config.photos, play_load: 'photo', data: {user: user, uid: user_id, pids: pids.join(',')}};
        this._sendRequest(params, function (photos) {
            if (photos) {
                for (var i = 0, len = photos.length; i < len; i++) {
                    var photo = photos[i];
                    var list = items_map[photo.pid];
                    for (var j = 0, jlen = list.length; j < jlen; j++) {
                        var status = list[j];
                        status.id = photo.pid;
                        status.bmiddle_pic = photo.url_large;
                        status.original_pic = photo.url_large;
                        if (photo.caption) {
                            status.text = photo.caption;
                        }
                        status.created_at = photo.update_time || photo.time;
                        status.t_url = 'http://photo.renren.com/photo/' + photo.uid + '/photo-' + photo.pid;
                    }
                }
            }
            count--;
            if (count === 0) {
                callback.call(context, items);
            }
        }, this);
    }
}, _fill_users: function (user, items, callback, context) {
    if (items && items.length > 0 && items[0].uid) {
        var items_map = {};
        for (var i = 0, len = items.length; i < len; i++) {
            var item = items[i];
            var uid = item.uid;
            var list = items_map[uid] || [];
            list.push(item);
            items_map[uid] = list;
            if (item.retweeted_status) {
                item = item.retweeted_status;
                uid = item.uid;
                list = items_map[uid] || [];
                list.push(item);
                items_map[uid] = list;
            }
        }
        var params = {url: this.config.users, play_load: 'user', data: {user: user, uids: Object.keys(items_map).join(','), fields: 'uid,name,sex,star,zidou,vip,birthday,email_hash,tinyurl,headurl,mainurl,hometown_location,work_history,university_history'}};
        this._sendRequest(params, function (users) {
            if (users) {
                for (var i = 0, len = users.length; i < len; i++) {
                    var user = users[i];
                    var list = items_map[user.id];
                    for (var j = 0, jlen = list.length; j < jlen; j++) {
                        list[j].user = user;
                    }
                }
            }
            callback.call(context, items);
        }, this);
    } else {
        callback.call(context, items);
    }
}, _fill_datas: function (user, items, code_text, code, callback, context) {
    var both = this.combo(function (users_args, pics_args) {
        callback.call(context, items, code_text, code);
    });
    var users_callback = both.add(), pics_callback = both.add();
    this._fill_users(user, items, users_callback);
    this._fill_pics(user, items, pics_callback);
}, });
var PlurkAPI = Object.inherits({}, sinaApi, {config: Object.inherits({}, sinaApi.config, {host: 'http://www.plurk.com/API', source: '4e4QGBY94z6v3zvb2rvDqH8yzSccvk2D', result_format: '', support_counts: false, support_comment: false, support_double_char: false, support_direct_messages: false, support_repost: false, support_comment_repost: false, support_repost_timeline: false, support_mentions: false, support_cursor_only: true, support_auto_shorten_url: false, user_timeline_need_friendship: false, support_blocking: false, repost_pre: 'RT', verify_credentials: '/Users/login', update: '/Timeline/plurkAdd', upload: '/Timeline/uploadPicture', destroy: '/Timeline/plurkDelete', favorites: '/Timeline/getPlurks?filter=only_favorite', favorites_create: '/Timeline/favoritePlurks', favorites_destroy: '/Timeline/unfavoritePlurks', friends_timeline: '/Polling/getPlurks', followers: '/FriendsFans/getFansByOffset', friends: '/FriendsFans/getFollowingByOffset', friendships_create: '/FriendsFans/setFollowing?user_id={{id}}&follow=true', friendships_destroy: '/FriendsFans/setFollowing?user_id={{id}}&follow=false', comment: '/Responses/responseAdd', comment_destroy: '/Responses/responseDelete', comments: '/Responses/get', search: '/PlurkSearch/search', user_search: '/UserSearch/search', user_timeline: '/Timeline/getPlurks'}), url_encode: function (text) {
    return text;
}, format_upload_params: function (user, data, pic) {
    data.api_key = data.source;
    delete data.source;
    delete data.lat;
    delete data.long;
    pic.keyname = 'image';
}, upload: function (user, params, pic, before_request, onprogress, callback, context) {
    this.super_.upload.call(this, user, {}, pic, before_request, onprogress, function (data) {
        if (data && data.full) {
            params.user = user;
            params.status += ' ' + data.full;
            this.update(params, callback, context);
        } else {
            callback.call(context, 'error');
        }
    }, this);
}, before_sendRequest: function (args) {
    args.data.api_key = args.data.source;
    delete args.data.source;
    if (args.data.count) {
        args.data.limit = args.data.count;
        delete args.data.count;
    }
    if (args.url == this.config.update) {
        args.data.content = args.data.status;
        delete args.data.status;
        args.data.qualifier = ':';
    }
    if (args.url == this.config.destroy) {
        args.data.plurk_id = args.data.id;
        delete args.data.id;
    }
    if (args.url == this.config.favorites_create || args.url == this.config.favorites_destroy) {
        args.data.ids = '[' + args.data.id + ']';
        delete args.data.id;
    }
    if (args.url == this.config.friends_timeline) {
        if (!args.data.since_id) {
            args.url = this.config.user_timeline;
        } else {
            args.data.offset = args.data.since_id;
            delete args.data.since_id;
        }
        args.is_friends_timeline = true;
    }
    if (args.data.cursor) {
        args.data.offset = args.data.cursor;
        if (args.is_friends_timeline) {
            args.url = this.config.user_timeline;
        }
        delete args.data.cursor;
    }
    if (args.url == this.config.user_timeline) {
        delete args.data.screen_name;
        delete args.data.id;
    }
    if (args.url == this.config.followers || args.url == this.config.friends) {
        delete args.data.screen_name;
        delete args.data.limit;
        if (args.data.offset && String(args.data.offset) == '-1') {
            args.data.offset = 0;
        }
    }
    if (args.url == this.config.comments) {
        args.data.plurk_id = args.data.id;
        delete args.data.id;
    }
    if (args.url == this.config.comment) {
        args.data.plurk_id = args.data.id;
        args.data.content = args.data.comment;
        args.data.qualifier = ':';
        delete args.data.comment;
        delete args.data.id;
    }
    if (args.url == this.config.search || args.url == this.config.user_search) {
        args.data.query = args.data.q;
        delete args.data.q;
    }
}, apply_auth: function (url, args, user) {
    if (args.url === this.config.verify_credentials && user.authType === 'baseauth') {
        args.data.username = user.userName;
        args.data.password = user.password;
    }
}, format_result: function (data, play_load, args) {
    if (data.success_text == 'ok') {
        return true;
    }
    var items = data;
    if (args.url == this.config.user_search) {
        items = data.users;
    }
    var status_users = data.plurk_users || data.plurks_users || data.friends || data.users;
    delete data.plurk_users;
    delete data.plurks_users;
    delete data.friends;
    delete data.users;
    if (args.url != this.config.verify_credentials && data && (data.plurks || data.responses)) {
        items = data.plurks || data.responses;
        data.items = items;
        delete data.plurks;
        delete data.responses;
    }
    if ($.isArray(items)) {
        for (var i in items) {
            if (play_load == 'status' || play_load == 'comment') {
                items[i].user = this.format_result_item(status_users[String(items[i].owner_id || items[i].user_id)], 'user', args);
            }
            items[i] = this.format_result_item(items[i], play_load, args);
        }
        if (items.length > 0) {
            if (args.url == this.config.followers || args.url == this.config.friends || args.url == this.config.user_search) {
                data = {items: items};
                var last_offset = Number(args.data.offset || 0);
                data.next_cursor = last_offset + items.length;
            } else {
                if (items[items.length - 1].created_at) {
                    data.next_cursor = new Date(items[items.length - 1].created_at.replace(' GMT', '')).format("yyyy-M-dThh:mm:ss");
                }
                if (args.is_friends_timeline) {
                    items[0].cursor_id = new Date(items[0].created_at.replace(' GMT', '')).format("yyyy-M-dThh:mm:ss");
                }
                if (args.url == this.config.comments) {
                    data.has_next = false;
                    data.comment_count = data.response_count;
                }
            }
        } else {
            if (args.url == this.config.followers || args.url == this.config.friends || args.url == this.config.user_search) {
                data = {items: [], next_cursor: '0'};
            }
        }
    } else {
        data = this.format_result_item(data, play_load, args);
    }
    return data;
}, STATUS_IMAGE_RE: /\[img\|\|([^\|]+)\|\|([^\|]+)\|\|[^\]]+\]/i, STATUS_IMAGE_RE2: /http:\/\/images\.plurk\.com\/([\w\_\-]+)\.\w+/i, format_result_item: function (data, play_load, args) {
    if (play_load == 'user' && data) {
        data.followers_count = data.fans_count;
        var user_info = data.user_info || data;
        data.screen_name = user_info.display_name || user_info.nick_name;
        data.user_name = user_info.nick_name;
        data.id = user_info.id;
        data.gender = user_info.gender == 1 ? 'm' : (user_info.gender == 2 ? 'f' : 'n');
        if (user_info.has_profile_image) {
            if (user_info.avatar) {
                data.profile_image_url = 'http://avatars.plurk.com/{{id}}-medium{{avatar}}.gif'.format(user_info);
            } else {
                data.profile_image_url = 'http://avatars.plurk.com/{{id}}-medium.gif'.format(user_info);
            }
        } else {
            data.profile_image_url = 'http://www.plurk.com/static/default_medium.gif';
        }
    } else if (play_load == 'status') {
        data.text = data.content_raw;
        var m = this.STATUS_IMAGE_RE.exec(data.text);
        if (m) {
            data.original_pic = m[2];
            data.thumbnail_pic = m[1];
            data.bmiddle_pic = m[2];
            data.text = data.text.replace(m[0], '');
        } else {
            m = this.STATUS_IMAGE_RE2.exec(data.text);
            if (m) {
                data.original_pic = m[0];
                data.thumbnail_pic = 'http://images.plurk.com/tn_' + m[1] + '.gif';
                data.bmiddle_pic = m[0];
                data.text = data.text.replace(m[0], '');
            }
        }
        data.id = data.plurk_id;
        data.created_at = data.posted;
        delete data.posted;
        delete data.plurk_id;
        delete data.content;
        delete data.content_raw;
    } else if (play_load == 'comment') {
        data.text = data.content_raw;
        data.created_at = data.posted;
        delete data.content;
        delete data.content_raw;
    }
    return data;
}});
var TumblrAPI = Object.inherits({}, sinaApi, {config: Object.inherits({}, sinaApi.config, {host: 'http://www.tumblr.com/api', source: '', result_format: '', userinfo_has_counts: false, support_counts: false, support_repost: true, support_comment_repost: true, support_repost_timeline: false, support_cursor_only: true, support_mentions: false, support_direct_messages: false, support_auto_shorten_url: false, need_processMsg: false, user_timeline_need_friendship: false, verify_credentials: '/authenticate'}), apply_auth: function (url, args, user) {
    args.data.email = user.userName;
    args.data.password = user.password;
    args.type = 'post';
}});
var DianDianAPI = Object.inherits({}, sinaApi, {config: Object.inherits({}, sinaApi.config, {host: 'https://api.diandian.com/v1', source: '', oauth_key: 'fxEFnxJaFE', oauth_secret: 'SUgviw9UYjM3BKXYkcfM1mZ4nJCbzsISlCDa', oauth_authorize: '/oauth/authorize', oauth_access_token: '/oauth/token', oauth_callback: FAWAVE_OAUTH_CALLBACK_URL, oauth_scope: 'read,write', oauth_host: 'https://api.diandian.com', oauth_token_need_refresh: true, result_format: '', support_counts: false, support_repost: true, support_do_comment: false, support_repost_comment: false, support_comment_repost: false, support_repost_timeline: false, support_cursor_only: true, support_mentions: false, support_direct_messages: false, support_auto_shorten_url: false, user_timeline_need_friendship: false, support_comment: false, support_friendships_create: false, support_blocking: false, support_search: false, support_user_search: false, support_comments_mentions: false, support_followers: false, verify_credentials: '/user/info', friends_timeline: '/user/home', user_timeline: '/blog/{{id}}/posts', update: '/blog/{{uid}}/post', upload: '/blog/{{uid}}/post', destroy: '/blog/{{uid}}/post/delete', repost: '/blog/{{uid}}/post/reblog', favorites: '/user/likes', favorites_create: '/user/like', favorites_destroy: '/user/unlike', }), apply_auth: function (url, args, user) {
    delete args.data.source;
    if (args.__refresh_access_token) {
        return;
    }
    if (user.oauth_token_key) {
        args.data.access_token = user.oauth_token_key;
    }
}, get_access_token: function (user, callback, context) {
    var params = {url: this.config.oauth_access_token, type: 'post', user: user, play_load: 'json', apiHost: this.config.oauth_host, data: {code: user.oauth_pin, client_id: this.config.oauth_key, client_secret: this.config.oauth_secret, redirect_uri: this.config.oauth_callback, grant_type: 'authorization_code'}, need_source: false};
    this._sendRequest(params, function (data, text_status, error_code) {
        if (text_status !== 'error' && data && data.access_token) {
            user.oauth_token_key = data.access_token;
            user.oauth_expires_in = data.expires_in;
            user.oauth_token_type = data.token_type;
            user.oauth_refresh_token = data.refresh_token;
        } else {
            user = null;
            text_status = text_status || 'error';
            error_code = error_code || JSON.stringify(data);
        }
        callback.call(context, user, text_status, error_code);
    });
}, refresh_access_token: function (user, callback, context) {
    var params = {url: this.config.oauth_access_token, type: 'post', user: user, play_load: 'json', apiHost: this.config.oauth_host, data: {client_id: this.config.oauth_key, client_secret: this.config.oauth_secret, refresh_token: user.oauth_refresh_token, grant_type: 'refresh_token'}, need_source: false, __refresh_access_token: true};
    this._sendRequest(params, function (data, text_status, error_code) {
        var result = null;
        if (text_status !== 'error' && data && data.access_token) {
            result = {oauth_token_key: data.access_token, oauth_expires_in: data.expires_in, oauth_token_type: data.token_type, oauth_refresh_token: data.refresh_token, }
        } else {
            text_status = text_status || 'error';
            error_code = error_code || JSON.stringify(data);
        }
        callback.call(context, result, text_status, error_code);
    });
}, get_authorization_url: function (user, callback, context) {
    var params = {response_type: 'code', client_id: this.config.oauth_key, redirect_uri: this.config.oauth_callback, scope: this.config.oauth_scope};
    var loginURL = this.config.oauth_host + this.config.oauth_authorize + '?';
    var args = [];
    for (var k in params) {
        args.push(k + '=' + encodeURIComponent(params[k]));
    }
    loginURL += args.join('&');
    callback.call(context, loginURL, 'success', 200);
}, format_upload_params: function (user, data, pic) {
    data.caption = data.status;
    data.type = 'photo';
    data.__upload_url = this.config.host + this.config.upload.format({uid: user.id}) + '?access_token=' + encodeURIComponent(user.oauth_token_key);
    delete data.status;
    pic.keyname = 'data';
}, before_sendRequest: function (args) {
    switch (args.url) {
        case this.config.user_timeline:
            if (args.data.id === args.user.screen_name) {
                args.data.id = args.user.id;
            }
            break;
        case this.config.update:
            args.data.uid = args.user.id;
            args.data.type = 'text';
            args.data.body = args.data.status;
            delete args.data.status;
            var urls = UrlUtil.findUrls(args.data.body) || [];
            for (var i = 0, len = urls.length; i < len; i++) {
                var url = urls[i];
                if (VideoService.is_qq_support(url)) {
                    args.data.type = 'video';
                    args.data.sourceUrl = url;
                    args.data.caption = args.data.body.replace(url, '');
                    delete args.data.body;
                    break;
                }
            }
            break;
        case this.config.destroy:
            args.data.uid = args.user.id;
            break;
        case this.config.repost:
            args.data.uid = args.user.id;
            args.data.comment = args.data.status;
            delete args.data.status;
            break;
    }
    if (args.data.count) {
        args.data.limit = args.data.count;
        delete args.data.count;
    }
    if (args.data.cursor) {
        args.data.offset = args.data.cursor;
        delete args.data.cursor;
    }
}, format_result: function (data, play_load, args) {
    if (data.access_token) {
        return data;
    }
    if (data.meta && data.meta.status === 200 && !data.response) {
        return true;
    }
    if (data.meta && data.meta.status !== 200) {
        data.meta.error = data.meta.msg;
        return data.meta;
    }
    data = data.response || {};
    var items = data.posts || data.likedPost || data;
    if ($.isArray(items)) {
        for (var i = 0, l = items.length; i < l; i++) {
            items[i] = this.format_result_item(items[i], play_load, args);
        }
        if (data.posts || data.likedPost) {
            data.items = items;
            delete data.posts;
            delete data.likedPost;
        }
        if (items.length > 0) {
            var start = 0;
            if (args.data.offset) {
                start = parseInt(args.data.offset, 10) || 0;
            }
            data.next_cursor = start + 1;
        } else {
            data.next_cursor = '0';
        }
    } else {
        data = this.format_result_item(data, play_load, args);
    }
    return data;
}, url_encode: function (text) {
    return text;
}, format_result_item: function (data, play_load, args) {
    if (play_load === 'user') {
        var followers_count = 0;
        var blogs = data.blogs || [];
        var profile_image_url = '';
        var t_url = '';
        var blogCName = '';
        for (var i = 0; i < blogs.length; i++) {
            var blog = blogs[i];
            followers_count += blog.followers || 0;
            if (blog.primary || blogs.length === 1) {
                profile_image_url = 'https://api.diandian.com/v1/blog/' + blog.blogCName + '/avatar/57';
                t_url = 'http://' + blog.blogCName;
                blogCName = blog.blogCName;
            }
        }
        var user = {id: blogCName, screen_name: data.name, name: data.name, followers_count: followers_count || 0, friends_count: data.following || 0, favorite_count: data.likes || 0, statuses_count: blogs.length, profile_image_url: profile_image_url, t_url: t_url, blogCName: blogCName, };
        return user;
    }
    if (play_load === 'status') {
        var status = {id: data.postId, t_url: data.postUrl, created_at: new Date(data.createTime), comments_count: data.commentCount, repost_count: data.reblogCount, };
        if (data.photos && data.photos.length > 0) {
            status.thumbnail_pic = [];
            status.bmiddle_pic = [];
            status.original_pic = [];
            for (var i = 0; i < data.photos.length; i++) {
                var pic = data.photos[i].altSizes;
                var thumb = pic['320'] || pic['640'] || pic.default;
                var bmiddle = pic.default;
                status.thumbnail_pic.push(thumb.url);
                status.bmiddle_pic.push(bmiddle.url);
                status.original_pic.push(pic.default.url);
            }
        }
        var text = '';
        if (data.type === 'photo') {
            text = data.caption;
        } else if (data.type === 'video') {
            text = data.caption + ' ' + (data.sourceTitle || '') + ' ' + data.sourceUrl;
        } else if (data.type === 'audio') {
            text = data.musicName + ' - ' + data.musicSinger + ' ' + data.playerUrl + ' ' + data.caption;
            if (data.cover) {
                if (!status.thumbnail_pic) {
                    status.thumbnail_pic = [];
                    status.bmiddle_pic = [];
                    status.original_pic = [];
                }
                status.thumbnail_pic.push(data.coverNormal);
                status.bmiddle_pic.push(data.coverLarge);
                status.original_pic.push(data.cover);
            }
        } else {
            text = (data.title || '') + ' ' + (data.body || '');
        }
        text = text.trim();
        if (text) {
            var textInfo = linkToText(text);
            text = textInfo.text;
            if (textInfo.images.length > 0) {
                if (!status.thumbnail_pic) {
                    status.thumbnail_pic = [];
                    status.bmiddle_pic = [];
                    status.original_pic = [];
                }
                for (var i = 0; i < textInfo.images.length; i++) {
                    var url = textInfo.images[i];
                    status.thumbnail_pic.push(url);
                    status.bmiddle_pic.push(url);
                    status.original_pic.push(url);
                }
            }
        }
        status.text = text;
        var user = {name: data.blogName, blogs: [
            {blogCName: data.blogCName, }
        ]};
        status.user = this.format_result_item(user, 'user', args);
        return status;
    }
    return data;
}});
var TSinaAPI = WeiboAPI = sinaApi;
var LaiwangAPI = Object.inherits({}, WeiboAPI2, {config: Object.inherits({}, WeiboAPI2.config, {host: 'https://api.laiwang.com/v1', user_home_url: 'http://laiwang.com/u', source: '', result_format: '', support_counts: false, support_repost: false, support_comments_mentions: false, support_comment_repost: false, support_comment: false, support_favorites: false, support_repost_timeline: false, support_upload: true, support_cursor_only: true, support_mentions: false, support_direct_messages: false, support_sent_direct_messages: false, support_auto_shorten_url: false, support_geo: false, repost_pre: '转载 ', need_processMsg: true, user_timeline_need_friendship: false, support_blocking: false, support_like: false, support_do_favorite: false, support_user_search: true, support_search: true, user_timeline_need_user: true, oauth_scope: ['fedd', 'relationship', 'message', 'post', 'user', 'search'].join(' '), oauth_key: '4664077205954578731', oauth_secret: '46d46c3764b841adb2eb8c01a0ed98ca', oauth_callback: FAWAVE_OAUTH_CALLBACK_URL, oauth_host: 'https://api.laiwang.com/oauth', oauth_authorize: '/authorize', oauth_access_token: '/access_token', oauth_token_need_refresh: true, retweet_need_status: true, rt_at_name: true, friends_timeline: '/feed/main/list', user_timeline: '/feed/post/user/list', followers: '/relationship/friend/list', friends: '/relationship/friend/following/list', favorites: '/activities/@me/@liked', favorites_create: '/activities/@me/@liked/{{id}}?key={{key}}&alt={{alt}}', favorites_destroy: '/activities/@me/@liked/{{id}}?key={{key}}&alt={{alt}}_delete', friendships_create: '/relationship/friend/add', friendships_destroy: '/relationship/friend/remove', update: '/post/add', destroy: '/post/remove', comments: '/post/comment/list', comment: '/post/comment/add', reply: '/post/comment/add', search: '/search/feed', user_search: '/search/user', verify_credentials: '/user/page/get', retweet: '/post/share', upload: '/post/addwithpic', user_show: '/user/page/get', }), AT_USER_RE: /([^#])?@([●\w\-\_\u2E80-\u3000\u303F-\u9FFF]+)/g, processAt: function (str, status) {
    var tpl = '{{m1}}<a class="getUserTimelineBtn" href="" data-screen_name="{{m2}}" data-id="{{userid}}" rhref="' +
        this.config.user_home_url + '/{{userid}}" title="' +
        _u.i18n("btn_show_user_title") + '">{{username}}</a>';
    return str.replace(this.AT_USER_RE, function (match, $1, $2) {
        var users = status.users || {};
        var userid = users[$2];
        if (!userid) {
            return match;
        }
        var data = {m1: $1 || '', m2: $2, userid: userid, username: '@' + $2};
        return tpl.format(data);
    });
}, _emotion_rex: window.LAIWANG_FACES ? new RegExp('\\[(' + Object.keys(window.LAIWANG_FACES).join('|') + ')\\]', 'g') : null, processEmotional: function (str) {
    if (!this._emotion_rex) {
        return str;
    }
    return str.replace(this._emotion_rex, function (m, g1) {
        if (window.LAIWANG_FACES && g1) {
            var emotion = LAIWANG_FACES[g1];
            if (emotion) {
                var tpl = '<img style="height: 21px;" title="{{title}}" src="' + '{{emotion}}" />';
                return tpl.format({title: g1, emotion: emotion});
            }
        }
        return m;
    });
}, refresh_access_token: function (user, callback) {
    var params = {url: this.config.oauth_access_token, type: 'post', user: user, play_load: 'json', apiHost: this.config.oauth_host, data: {client_id: this.config.oauth_key, client_secret: this.config.oauth_secret, refresh_token: user.oauth_refresh_token, grant_type: 'refresh_token'}, need_source: false, __refresh_access_token: true};
    this._sendRequest(params, function (data, text_status, error_code) {
        var result = null;
        if (text_status !== 'error' && data && data.access_token) {
            result = {oauth_token_key: data.access_token, oauth_expires_in: data.expires_in, oauth_token_type: data.token_type, oauth_refresh_token: data.refresh_token, };
        } else {
            text_status = text_status || 'error';
            error_code = error_code || JSON.stringify(data);
        }
        callback(result, text_status, error_code);
    });
}, retweet: function (data, callback, context) {
    var params = {url: this.config.retweet, type: 'post', play_load: 'status', data: data};
    this._sendRequest(params, callback, context);
}, format_upload_params: function (user, data, pic) {
    if (data.status) {
        data.content = data.status;
        delete data.status;
    }
    delete data.source;
}, before_sendRequest: function (args) {
    switch (args.url) {
        case this.config.user_timeline:
            if (args.data.id) {
                args.data.userId = args.data.id;
                delete args.data.id;
            }
            break;
        case this.config.update:
            args.data.content = args.data.status;
            args.data.scope = 'public';
            delete args.data.status;
            break;
        case this.config.retweet:
            args.data.postId = args.data.id;
            args.data.publisherId = args.data.status.user.id;
            if (args.data.status.retweeted_status) {
                args.data.postId = args.data.status.retweeted_status.id;
                args.data.publisherId = args.data.status.retweeted_status.user.id;
            }
            delete args.data.status;
            delete args.data.id;
            break;
        case this.config.destroy:
            args.data.postId = args.data.id;
            delete args.data.id;
            break;
        case this.config.comments:
            args.data.postId = args.data.id;
            args.data.orderType = 'DESC';
            delete args.data.id;
            break;
        case this.config.comment:
        case this.config.reply:
            args.data.content = args.data.comment;
            args.data.postId = args.data.id;
            delete args.data.id;
            delete args.data.comment;
            break;
        case this.config.search:
            args.data.key = args.data.q;
            args.data.offset = args.data.cursor;
            delete args.data.q;
            delete args.data.cursor;
            break;
        case this.config.user_search:
            args.data.key = args.data.q;
            args.data.offset = args.data.cursor;
            delete args.data.q;
            delete args.data.cursor;
            break;
        case this.config.user_show:
            if (args.data.id) {
                args.data.userId = args.data.id;
                delete args.data.id;
            }
            break;
        case this.config.followers:
        case this.config.friends:
            if (args.data.user_id) {
                args.data.userId = args.data.user_id;
                delete args.data.user_id;
            }
            if (args.data.cursor && parseInt(args.data.cursor, 10) > 0) {
                args.data.offset = args.data.cursor;
            }
            delete args.data.cursor;
            args.data.type = args.url === this.config.friends ? 'following' : 'followers';
            args.url = this.config.followers;
            break;
        case this.config.friendships_destroy:
            args.data.friendId = args.data.id;
            delete args.data.id;
            break;
    }
    if (args.data.count) {
        args.data.size = args.data.count;
        delete args.data.count;
    }
    if (args.data.size > 100) {
        args.data.size = 100;
    }
    delete args.data.screen_name;
}, format_result: function (data, play_load, args) {
    if (args.url === this.config.destroy || args.url === this.config.friendships_destroy || args.url === this.config.friendships_create) {
        return true;
    }
    if (args.url === this.config.search || args.url === this.config.user_search || args.url === this.config.followers) {
        if (!data.nextCursor) {
            data.nextCursor = (parseInt(args.data.offset, 10) || 0) + parseInt(args.data.size, 10);
        }
    }
    var items = data.values || data;
    if ($.isArray(items)) {
        for (var i = 0, l = items.length; i < l; i++) {
            items[i] = this.format_result_item(items[i], play_load, args);
        }
        if (data.previousCursor) {
            data.previous_cursor = data.previousCursor;
        }
        if (data.nextCursor) {
            data.next_cursor = data.nextCursor;
        }
        data.items = items;
    } else {
        data = this.format_result_item(data, play_load, args);
    }
    return data;
}, _convert_content: function (data) {
    var matchs = data.content.match(/<a[^>]+?id=(\d+)[^>]+>@([^<]+)<\/a>/g);
    if (matchs) {
        data.users = {};
        for (var i = 0; i < matchs.length; i++) {
            var line = matchs[i];
            var m = /<a[^>]+?id=(\d+)[^>]+>@([^<]+)<\/a>/.exec(line);
            if (m) {
                data.users[m[2]] = m[1];
                data.content = data.content.replace(line, '@' + m[2]);
            }
        }
    }
}, format_result_item: function (data, play_load, args) {
    if (play_load === 'user') {
        data.statuses_count = data.postCount;
        data.friends_count = data.friendCount;
        data.followers_count = data.followerCount;
        data.following = false;
        data.followed_by = false;
        if (data.connectionType === 'bilateral') {
            data.following = true;
            data.followed_by = true;
        } else if (data.connectionType === 'following') {
            data.followed_by = true;
        } else if (data.connectionType === 'followers') {
            data.following = true;
        }
        data.blocking = data.isBlocked;
        data.screen_name = data.name;
        data.name = data.pinyin || data.name;
        if (data.name) {
            data.name = data.name.replace(/\^/g, '');
        }
        data.description = data.brief;
        data.gender = data.gender === 'male' ? 'm' : (data.gender === 'female' ? 'f' : 'n');
        data.profile_image_url = data.avatar || data.avatarBig;
        data.email = data.mail;
        data.t_url = 'http://www.laiwang.com/u/' + data.id;
    } else if (play_load === 'status') {
        data.user = this.format_result_item(data.publisher, 'user', args);
        delete data.publisher;
        this._convert_content(data);
        data.text = data.content || '\n';
        delete data.content;
        data.source = data.client;
        delete data.client;
        data.created_at = data.createdAt;
        delete data.createdAt;
        data.t_url = data.user.t_url + '/post/' + data.id;
        delete data.url;
        var attachments = data.attachments;
        if (attachments && attachments.length > 0) {
            data.original_pic = data.bmiddle_pic = [];
            data.thumbnail_pic = [];
            for (var i = 0; i < attachments.length; i++) {
                var attachment = attachments[i];
                if (attachment.type !== 'photo') {
                    continue;
                }
                data.original_pic.push(attachment.picture);
                data.thumbnail_pic.push(attachment.thumbnail);
            }
        }
        data.comments_count = data.commentCount;
        data.repost_count = data.shareCount || 0;
        data.favorited = data.favor;
        if (data.shareUser) {
            var retweeted_status = data;
            var user = this.format_result_item(data.shareUser, 'user', args);
            data = {retweeted_status: retweeted_status, text: '转载', id: data.sharePostId, created_at: data.created_at, user: user, comments_count: 0, repost_count: 0, favorited: false, t_url: user.t_url + '/post/' + data.sharePostId, };
        }
    } else if (play_load === 'comment') {
        this._convert_content(data);
        data.text = data.content;
        delete data.content;
        data.user = this.format_result_item(data.commentor, 'user', args);
        delete data.commentor;
        data.created_at = data.createdAt;
    }
    return data;
}, });
var T_APIS = {'tsina': TSinaAPI, 'weibo': WeiboAPI2, 'tqq': TQQAPI, 'laiwang': LaiwangAPI, 'tsohu': TSohuAPI, 'leihou': LeiHouAPI, 't163': T163API, 'fanfou': FanfouAPI, 'douban': DoubanAPI, 'douban_v2': DoubanAPI2, 'renren': RenrenAPI, 'buzz': BuzzAPI, 'googleplus': GooglePlusAPI, 'facebook': FacebookAPI, 'plurk': PlurkAPI, 'identi_ca': StatusNetAPI, 'tumblr': TumblrAPI, 'tianya': TianyaAPI, 't_taobao': TaobaoStatusNetAPI, 'diandian': DianDianAPI, 'twitter': TwitterAPI};
var tapi = {api_dispatch: function (data) {
    return T_APIS[(data.user ? data.user.blogType : data.blogType) || 'tsina'];
}, search: function (data, callback, context) {
    return tapi.api_dispatch(data).search(data, callback, context);
}, user_search: function (data, callback, context) {
    return tapi.api_dispatch(data).user_search(data, callback, context);
}, translate: function (user, text, target, callback, context) {
    return tapi.api_dispatch(user).translate(text, target, callback, context);
}, processMsg: function (user, str_or_status, not_encode) {
    return tapi.api_dispatch(user).processMsg(str_or_status, not_encode);
}, find_at_users: function (user, str) {
    return tapi.api_dispatch(user).find_at_users(str);
}, get_config: function (user) {
    return this.api_dispatch(user).config;
}, get_authorization_url: function (user, callback, context) {
    return this.api_dispatch(user).get_authorization_url(user, callback, context);
}, get_access_token: function (user, callback, context) {
    return this.api_dispatch(user).get_access_token(user, callback, context);
}, refresh_access_token: function (user, callback, context) {
    return this.api_dispatch(user).refresh_access_token(user, callback, context);
}, verify_credentials: function (user, callback, data, context) {
    return this.api_dispatch(user).verify_credentials(user, callback, data, context);
}, rate_limit_status: function (data, callback, context) {
    return this.api_dispatch(data).rate_limit_status(data, callback, context);
}, friends_timeline: function (data, callback, context) {
    return this.api_dispatch(data).friends_timeline(data, callback, context);
}, user_timeline: function (data, callback, context) {
    return this.api_dispatch(data).user_timeline(data, callback, context);
}, comments_timeline: function (data, callback, context) {
    return this.api_dispatch(data).comments_timeline(data, callback, context);
}, repost_timeline: function (data, callback, context) {
    return this.api_dispatch(data).repost_timeline(data, callback, context);
}, mentions: function (data, callback, context) {
    return this.api_dispatch(data).mentions(data, callback, context);
}, comments_mentions: function (data, callback, context) {
    return this.api_dispatch(data).comments_mentions(data, callback, context);
}, followers: function (data, callback, context) {
    return this.api_dispatch(data).followers(data, callback, context);
}, friends: function (data, callback, context) {
    return this.api_dispatch(data).friends(data, callback, context);
}, favorites: function (data, callback, context) {
    return this.api_dispatch(data).favorites(data, callback, context);
}, favorites_create: function (data, callback, context) {
    return this.api_dispatch(data).favorites_create(data, callback, context);
}, favorites_destroy: function (data, callback, context) {
    return this.api_dispatch(data).favorites_destroy(data, callback, context);
}, counts: function (data, callback, context) {
    return this.api_dispatch(data).counts(data, callback, context);
}, user_show: function (data, callback, context) {
    return this.api_dispatch(data).user_show(data, callback, context);
}, direct_messages: function (data, callback, context) {
    return this.api_dispatch(data).direct_messages(data, callback, context);
}, sent_direct_messages: function (data, callback, context) {
    return this.api_dispatch(data).sent_direct_messages(data, callback, context);
}, destroy_msg: function (data, callback, context) {
    return this.api_dispatch(data).destroy_msg(data, callback, context);
}, new_message: function (data, callback, context) {
    return this.api_dispatch(data).new_message(data, callback, context);
}, update: function (data, callback, context) {
    return this.api_dispatch(data).update(data, callback, context);
}, upload: function (user, data, pic, before_request, onprogress, callback, context) {
    return this.api_dispatch(user).upload(user, data, pic, before_request, onprogress, callback, context);
}, repost: function (data, callback, context) {
    return this.api_dispatch(data).repost(data, callback, context);
}, comment: function (data, callback, context) {
    return this.api_dispatch(data).comment(data, callback, context);
}, reply: function (data, callback, context) {
    return this.api_dispatch(data).reply(data, callback, context);
}, comments: function (data, callback, context) {
    return this.api_dispatch(data).comments(data, callback, context);
}, comment_destroy: function (data, callback, context) {
    return this.api_dispatch(data).comment_destroy(data, callback, context);
}, friendships_create: function (data, callback, context) {
    return this.api_dispatch(data).friendships_create(data, callback, context);
}, friendships_destroy: function (data, callback, context) {
    return this.api_dispatch(data).friendships_destroy(data, callback, context);
}, friendships_show: function (data, callback, context) {
    return this.api_dispatch(data).friendships_show(data, callback, context);
}, reset_count: function (data, callback, context) {
    return this.api_dispatch(data).reset_count(data, callback, context);
}, retweet: function (data, callback, context) {
    return this.api_dispatch(data).retweet(data, callback, context);
}, destroy: function (data, callback, context) {
    return this.api_dispatch(data).destroy(data, callback, context);
}, tags: function (data, callback, context) {
    return this.api_dispatch(data).tags(data, callback, context);
}, tags_suggestions: function (data, callback, context) {
    return this.api_dispatch(data).tags_suggestions(data, callback, context);
}, create_tag: function (data, callback, context) {
    return this.api_dispatch(data).create_tag(data, callback, context);
}, destroy_tag: function (data, callback, context) {
    return this.api_dispatch(data).destroy_tag(data, callback, context);
}, status_show: function (data, callback, context) {
    return this.api_dispatch(data).status_show(data, callback, context);
}, blocks_blocking: function (data, callback, context) {
    return this.api_dispatch(data).blocks_blocking(data, callback, context);
}, blocks_blocking_ids: function (data, callback, context) {
    return this.api_dispatch(data).blocks_blocking_ids(data, callback, context);
}, blocks_create: function (data, callback, context) {
    return this.api_dispatch(data).blocks_create(data, callback, context);
}, blocks_destroy: function (data, callback, context) {
    return this.api_dispatch(data).blocks_destroy(data, callback, context);
}, blocks_exists: function (data, callback, context) {
    return this.api_dispatch(data).blocks_exists(data, callback, context);
}, findSearchText: function (user, str) {
    return this.api_dispatch(user).findSearchText(str);
}, formatSearchText: function (user, str) {
    return this.api_dispatch(user).formatSearchText(str);
}};
var VDiskAPI = {appkey: '243370', app_secret: 'ead5d2e0987e60ef43b2c9d80a893326', URL_GET_TOKEN: 'http://openapi.vdisk.me/?m=auth&a=get_token', URL_KEEP_TOKEN: 'http://openapi.vdisk.me/?m=user&a=keep_token', URL_UPLOAD_FILE: 'http://openapi.vdisk.me/?m=file&a=upload_file', URL_UPLOAD_SHARE_FILE: 'http://openapi.vdisk.me/?m=file&a=upload_share_file', _sha256: function (basestring) {
    return HMAC_SHA256_MAC(this.app_secret, basestring);
}, get_token: function (user, callback, context) {
    var params = {account: user.username, password: user.password, appkey: this.appkey, app_type: user.app_type, time: new Date().getTime().toString().substring(0, 10)};
    var basestring = 'account={{account}}&appkey={{appkey}}&password={{password}}&time={{time}}'.format(params);
    params.signature = this._sha256(basestring);
    $.ajax({url: this.URL_GET_TOKEN, type: 'post', dataType: 'json', data: params, success: function (data) {
        var error = null, result = null;
        if (data.err_code === 0) {
            result = data.data;
        } else {
            error = new Error(data.err_msg);
        }
        callback.call(context, error, result);
    }, error: function (xhr, text_status, err) {
        callback.call(context, err);
    }});
}, upload: function (user, fileobj, callback, onprogress, context) {
    this.get_token(user, function (err, result) {
        if (err) {
            return callback.call(context, err);
        }
        this._upload({token: result.token}, fileobj, callback, onprogress, context);
    }, this);
}, _upload: function (data, fileobj, callback, onprogress, context) {
    data.dir_id = '0';
    data.cover = 'yes';
    var blob = build_upload_params(data, fileobj);
    $.ajax({url: this.URL_UPLOAD_SHARE_FILE, data: blob, type: 'post', dataType: 'json', contentType: blob.contentType, processData: false, beforeSend: function (req) {
        if (onprogress) {
            if (req.upload) {
                req.upload.onprogress = function (ev) {
                    onprogress(ev);
                };
            }
        }
    }, success: function (data) {
        var error = null, result = null;
        if (data.err_code === 0) {
            result = data.data;
        } else {
            error = new Error(data.err_msg);
        }
        callback.call(context, error, result);
    }, error: function (xhr, status, err) {
        callback.call(context, err);
    }});
}};
var Instapaper = {request: function (user, url, data, callback, context) {
    var headers = {};
    if (user) {
        headers = {Authorization: make_base_auth_header(user.username, user.password)};
    }
    $.ajax({url: url, data: data, timeout: 60000, type: 'post', beforeSend: function (req) {
        for (var k in headers) {
            req.setRequestHeader(k, headers[k]);
        }
    }, success: function (data, text_status, xhr) {
        callback.call(context, text_status == 'success', text_status, xhr);
    }, error: function (xhr, text_status, err) {
        callback.call(context, false, text_status, xhr);
    }});
}, authenticate: function (user, callback, context) {
    var api = 'https://www.instapaper.com/api/authenticate';
    this.request(user, api, {}, callback, context);
}, add: function (user, data, callback, context) {
    var api = 'https://www.instapaper.com/api/add';
    this.request(user, api, data, callback, context);
}};
var ReadItLater = {apikey: '5bOAabomd1c6eRl363pQy55JaNTMBf20', request: Instapaper.request, authenticate: function (user, callback, context) {
    var api = 'https://readitlaterlist.com/v2/auth';
    user.apikey = this.apikey;
    this.request(null, api, user, callback, context);
}, add: function (user, data, callback, context) {
    var api = 'https://readitlaterlist.com/v2/add';
    data.username = user.username;
    data.password = user.password;
    data.apikey = this.apikey;
    this.request(null, api, data, callback, context);
}};
var mid = {BASE62: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]};
mid.base62Decode = function (str) {
    var num = 0;
    var len = str.length;
    for (var i = 0; i < len; i++) {
        var n = len - i - 1;
        var s = str[i];
        num += mid.BASE62.indexOf(s) * Math.pow(62, n);
    }
    return num;
};
mid.base62Encode = function (num) {
    var str = '';
    var r = 0;
    while (num !== 0 && str.length < 100) {
        r = num % 62;
        str = mid.BASE62[r] + str;
        num = Math.floor(num / 62);
    }
    return str;
};
mid.decode = function (hash) {
    var id = '';
    for (var end = hash.length; end > 0; end -= 4) {
        var start = end - 4;
        if (start < 0) {
            start = 0;
        }
        var h = hash.substring(start, end);
        var n = String(mid.base62Decode(h));
        var padding = 7 - n.length;
        if (padding > 0 && start > 0) {
            for (; padding > 0; padding--) {
                n = '0' + n;
            }
        }
        id = n + id;
    }
    return id;
};
mid.encode = function (id) {
    id = String(id);
    if (!/^\d+$/.test(id)) {
        return id;
    }
    var hash = '';
    for (var end = id.length; end > 0; end -= 7) {
        var start = end - 7;
        if (start < 0) {
            start = 0;
        }
        var num = id.substring(start, end);
        var h = mid.base62Encode(num);
        var padding = 4 - h.length;
        if (padding > 0 && start > 0) {
            for (; padding > 0; padding--) {
                h = '0' + h;
            }
        }
        hash = h + hash;
    }
    return hash;
};
var WeiboUtil = mid;
WeiboUtil.mid2url = mid.encode;
WeiboUtil.url2mid = mid.decode;