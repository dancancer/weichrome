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

function insertText(obj,str) {
    debugger;
    if (document.selection) {
        var sel = document.selection.createRange();
        sel.text = str;
    } else if (typeof obj.selectionStart === 'number' && typeof obj.selectionEnd === 'number') {
        var startPos = obj.selectionStart,
            endPos = obj.selectionEnd,
            cursorPos = startPos,
            tmpStr = obj.value;
        obj.value = tmpStr.substring(0, startPos) + str + tmpStr.substring(endPos, tmpStr.length);
        cursorPos += str.length;
        obj.selectionStart = obj.selectionEnd = cursorPos;
    } else {
        obj.value += str;
    }
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