



$( document ).ready(function() {
//          初始化选择表情的popver
    $("#showEmotionsBtn").popover({
        placement : 'bottom', // top, bottom, left or right
        html: 'true',
        content : $('#emotions_div'),
        trigger: 'manual'
    });

    $("#showEmotionsBtn").bind("click",function(){
        $('#emotions_div').show();
        $("#showEmotionsBtn").popover('toggle');
        console.log('toggle');
        $("#clost_em").bind("click",function(){
            $("#showEmotionsBtn").trigger('click');
            console.log('hide');
        });

    });

    function initToolbarBootstrapBindings(){
        chrome.fontSettings.getFontList(function(data){
//            console.log(data);
            var i=0;
            var fonts = new Array();
            var fontTarget = $('[title=Font]').siblings('.dropdown-menu');
            for(i in data){
                fonts.push(data[i].displayName);
            }
            $.each(fonts, function (idx, fontName) {
                fontTarget.append($('<li><a data-edit="fontName ' + fontName +'" style="font-family:\''+ fontName +'\'">'+fontName + '</a></li>'));
            });
            $('a[title]').tooltip({container:'body'});
            $('.dropdown-menu input').click(function() {return false;})
                .change(function () {$(this).parent('.dropdown-menu').siblings('.dropdown-toggle').dropdown('toggle');})
                .keydown('esc', function () {this.value='';$(this).change();});

            $('[data-role=magic-overlay]').each(function () {
                var overlay = $(this), target = $(overlay.data('target'));
                overlay.css('opacity', 0).css('position', 'absolute').offset(target.offset()).width(target.outerWidth()).height(target.outerHeight());
            });
            if ("onwebkitspeechchange"  in document.createElement("input")) {
                var editorOffset = $('#editor').offset();
                $('#voiceBtn').css('position','absolute').offset({top: editorOffset.top, left: editorOffset.left+$('#editor').innerWidth()-35});
            } else {
                $('#voiceBtn').hide();
            }
            $('#editor').wysiwyg({ fileUploadError: showErrorAlert} );
            $(".pinned").pin({
                containerSelector: ".editer-container"
            });
            $('#editor').on('resize',function(){
                $(".pinned").pin({
                    containerSelector: ".editer-container"
                });
                consle.log('resize');
            })
            window.prettyPrint && prettyPrint();


        })
    };
    function showErrorAlert(reason, detail) {
        var msg='';
        if (reason==='unsupported-file-type') { msg = "Unsupported format " +detail; }
        else {
            console.log("error uploading file", reason, detail);
        }
        $('<div class="alert"> <button type="button" class="close" data-dismiss="alert">&times;</button>'+
            '<strong>File upload error</strong> '+msg+' </div>').prependTo('#alerts');
    };
    initToolbarBootstrapBindings();


});
/**
 * Created by dan on 14-7-25.
 */
