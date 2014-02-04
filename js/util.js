function buildBlob(parts) {
    var blob = null;
    var version = parseInt(getChromeVersion() || 0, 10);
    if (version >= 20) {
        blob = new Blob(parts);
    } else {
        if (typeof BlobBuilder === 'undefined') {
            var BlobBuilder = window.WebKitBlobBuilder;
        }
        var bb = new BlobBuilder();
        for ( var i = 0; i < parts.length; i++) {
            bb.append(parts[i]);
        }
        blob = bb.getBlob();
    }
    return blob;
}

function dataUrlToBlob(dataurl){
    var datas=dataurl.split(',',2);
    var blob=binaryToBlob(atob(datas[1]));
    blob.fileType=datas[0].split(';')[0].split(':')[1];
    blob.name=blob.fileName='pic.'+blob.fileType.split('/')[1];
    blob.keyname = 'pic';
    return blob;}

function binaryToBlob(data){
    var arr=new Uint8Array(data.length);
    for(var i=0,l=data.length;i<l;i++){
        arr[i]=data.charCodeAt(i);}

    var buffer=arr;
    var version=parseInt(getChromeVersion()||0,10);
    if(version<21){buffer=arr.buffer;}
    return buildBlob([buffer]);
}

function bulidUploadParam (pic,data){
    pic = {file:pic};
    var auth_args = {
        type : 'post',
        data : {},
        headers : {}
    };
    pic.keyname = pic.keyname || 'pic';
//    this.format_upload_params(user, data, pic);
    var _now = new Date().getTime()
    var boundary = '----multipartformboundary' + _now;
    var dashdash = '--';
    var crlf = '\r\n';
    var builder = '';
    builder += dashdash;
    builder += boundary;
    builder += crlf;
    for ( var key in data) {
        auth_args.data[key] = data[key];
    }
    for ( var key in auth_args.data) {
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
        builder += '; filename="' + fileName+ '"';
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
    var blob = buildBlob(parts);
    return {blob:blob,boundary:boundary,auth_args:auth_args};
}

function getChromeVersion() {
    var m = /Chrome\/(\d+)/i.exec(navigator.userAgent);
    if (m) {
        return m[1];
    }
    return;
}

function buildExifStr(exif){
    var ExposureTime = "";
    var FNumber = ""
    var FocalLength = "";
    var ISOSpeedRatings = "";
    var Model = "";
    if(exif.FocalLength&&exif.FocalLength.numerator&&exif.FocalLength.denominator)
        FocalLength = Math.round(exif.FocalLength.numerator/exif.FocalLength.denominator)+"mm, "
    if(exif.FNumber&&exif.FNumber.numerator&&exif.FNumber.denominator)
        FNumber = " f/"+(exif.FNumber.numerator/exif.FNumber.denominator).toFixed(1)+", ";
    if(exif.ExposureTime&&exif.ExposureTime.numerator>=exif.ExposureTime.denominator)
        ExposureTime = Math.round(exif.ExposureTime.numerator/exif.ExposureTime.denominator)+"s, ";
    else if(exif.ExposureTime&&exif.ExposureTime.numerator<exif.ExposureTime.denominator)
        ExposureTime = "1/"+Math.round(exif.ExposureTime.denominator/exif.ExposureTime.numerator)+"s, ";
    if(exif.ISOSpeedRatings)
        ISOSpeedRatings = "iso"+exif.ISOSpeedRatings;
    if(exif.Model)
        Model = "使用"+exif.Model+"拍摄, "

    var exifStr = (Model+FNumber+FocalLength+ExposureTime+ISOSpeedRatings).replace(/0,/g,"");
    if(exifStr)
        return "Exif:["+exifStr+"]";
    else
        return "";
}

function getLength(str) {
    var len = str.length;
    var reLen = 0;
    for (var i = 0; i < len; i++) {
        if (str.charCodeAt(i) < 27 || str.charCodeAt(i) > 126) {
            // 全角
            reLen += 2;
        } else {
            reLen++;
        }
    }
    return reLen;
}

var m = {
    name: 'auth_callback',
    url: window.location.href
};

function uniq (arr) {
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

function weibotxt (text) {
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
//                text = jEmoji.softbankToUnified(text);
//                text = jEmoji.googleToUnified(text);
//                text = jEmoji.docomoToUnified(text);
//                text = jEmoji.kddiToUnified(text);
//                text = jEmoji.unifiedToHTML(text);

        return text;
    }
}


if ( chrome.runtime && chrome.runtime.sendMessage ) {
    chrome.runtime.sendMessage(m);
} else if ( chrome.extension.sendMessage ) {
    chrome.extension.sendMessage(m);
} else if (chrome.extension.sendRequest) {
    chrome.extension.sendRequest(m);
}
