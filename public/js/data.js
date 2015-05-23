// Userlist data array for filling in info box
var userListNotif = [];
var ava64 = '';
var ulogin='';
var ufrom = '';
var avame = '';
var avafr = '';
var msgID = '';
var equalTime = '';
// DOM Ready =============================================================
$(document).ready(function() {
    //Get login
    getLogin();
    getNewMsg();
    // Username link click
    $("ul#ul_fr").on('click', 'li a.friend-name', showUserInfo);
    $("ul#list_notif").on('click', 'li a', showUserInfo);
    // Add close friend
    $("div#get-fr").on('click', 'span#addCf', addCloseFriend);
    // Send Msg
    $('#form_input').on('click', '#btn-send', sendMsg);
    // Send Msg
    $('#list-stick li').on('click', 'img', stickMsg);
    //Convert Base64
    $("input#avatar").change(function(){
        readImage( this );
    });
    //Set img
    $(header).on('click', 'top-logo', function(){ alert("Call");});
});
// Functions =============================================================
//Function addfriend
function addFriend(a){
    var friendName = a.attr('rel');
    var check = false;
    $.getJSON( '/getFriend/'+ ulogin, function( data ) {
        $.each(data.friend, function(){
            if (this.fID === friendName){
                check = true;
            }
        });
        if(check){
            alert('Đã là bạn bè!');
            //not add
        }
        else{
            alert('Thêm thành công!');
            //add
            $.ajax({
                type: 'post',
                url: '/addFriend',
                data: JSON.stringify({'uid': uid, 'fID': friendName}),
                contentType: "application/json; charset=utf-8",
                traditional: true,
                success: function (data) {
                    console.dir('success insert');
                    //if (dta)
                }
            });
        }
    });
}
// Get user to login
function getLogin() {
    // jQuery AJAX call for JSON
    $.get( '/', function( data ) {
        if (data != null){
            ulogin = data.username;
            avame = data.ava;
            uid = data._id;
            //alert(uid);
            var uinfor = '<img src="'+ avame +'" class="ava-me" id="avatarOfme">'+
                '<span href="" id="u_Login">'+ data.alias + 
                '</span>';
            $('div.acc-me').append(uinfor);
            $('div#notif').append('<h4>Xin chào <b>'+ data.alias +' </b>!</h4>');
            $.ajax({
                type: 'post',
                url: '/online',
                data: JSON.stringify({'uname': ulogin}),
                contentType: "application/json; charset=utf-8",
                traditional: true,
                success: function (data) {
                    console.dir('success insert');
                    //if (dta)
                }
            });
            
        }
    });
    
};

// Fill ul friend
function getFriend(uname) {
    // Empty content string
    var tableContent = '';
    //alert(uname);
    $.getJSON( '/getFriend/'+ uname, function( data ) {
        //alert('Call JSON');
        //For each item in our JSON, add a table row and cells to the content string
        $.each(data.friend, function(){
            var mid = this.msgID;
            var fid = this.fID;
            //Get Alias
            $.get( '/getUser/'+ this.fID, function( result ) {
                //alert(alias)
                tableContent += '<li>';
                    tableContent += '<div class="friend-right">';
                        tableContent += '<img class="friend-img left" src="'+ result.ava +'" alt="">';
                        tableContent += '<div class="friend-chat right">';
                            tableContent += '<a href="#" class="friend-name" rel="' + mid +'&'+ fid + '">';
                            if(result.isOnl == 1){
                                tableContent += '<i class="fa fa-circle onl left"></i>' + result.alias;
                            }
                            else{
                                tableContent += result.alias;
                            }
                                
                            tableContent += '</a>';
                        tableContent += '</div>';
                    tableContent += '</div>';
                    tableContent += '<div class="clr"></div>';
                tableContent += '</li>';
                // Inject the whole content string into our existing HTML table
                $('ul#ul_fr').append(tableContent);
                tableContent='';
            });
        });
    });
};

// Show User Info
function showUserInfo(event) {
    // Prevent Link from Firing
    event.preventDefault();
    var check = false;
    var str = $(this).attr('rel').split("&");
    // Retrieve username from link rel attribute
    msgID = str[0];
    ufrom = str[1];
    var index = str[2];
    //check and remove
    if (index != null){
        //alert('yes');
        $(this).remove();
    }
    $.getJSON( '/getFriend/'+ ulogin, function( data ) {
        $.each(data.friend, function(){
            if (this.fID === ufrom){
                check = true;
            }
        });
        if(check != true){
            //show add friend
            alert('Bạn mới!');
            $('#get-fr').append('<span id="addCf">'+'<i class="fa fa-user-plus"></i>'+'</span>');
        }
    });
    $("ul#list_notif").find('li').remove();
    userListNotif.splice(index, 1);
    var thisUsername = $(this).text();
    //alert(thisUsername);
    $('div#notif').find('h4').remove();

    var Content = '<span>'+ 'Đang chat >> ' + thisUsername+'</span>';
    $('#get-fr').html(Content);
    $('#mn-left').animate({marginLeft:'-250px'}, 200);
    $('ul#ul_fr').find('li').remove();
    $('div#notif').hide();
    $('#topArrow').hide();
    TriggerClick=0;
    removeChat();
    $.get( '/getUser/'+ str[1], function( result ) {
                avafr = result.ava;
                //alert('getFrom function show');
                if (ufrom != ''){
                    getMessageFrom(msgID, avafr);
                    scrollToBottom();
                }
            });
};
//Function request loop
function getNewMsg(){
    myInterval = setInterval(function () {
        if (userListNotif.length == 0){
            //ko hien thi icon
            $('#icon-notif').hide();
        }
        $.getJSON( '/getNewMsg/' + ulogin, function( data ) {
            $.each(data, function(){
                var id  = this._id;
                //alert(id);
                $.each(this.msg, function (){
                    if (this.ufrom === ufrom && this.unread === 0){
                        //hien thi tin nhan
                        $.get( '/getUser/'+ this.ufrom, function( result ) {
                                avafr = result.ava;
                            });
                        //alert('hien thi ava: '+ avafr);
                        if (equalTime != this.time){
                            //alert('khac time' + equalTime);
                            equalTime = this.time;
                            var SendInfo= { "mid": id,"time": this.time};
                            $.ajax({
                                    type: 'post',
                                    url: '/setReadMsg',
                                    data: JSON.stringify(SendInfo),
                                    contentType: "application/json; charset=utf-8",
                                    traditional: true,
                                    success: function (data) {
                                        console.dir('success insert');
                                        //if (dta)
                                    }
                                });
                            //alert('getFrom function new'+ this.content);
                            //getMessageFrom(id,avafr);
                            var tableContent = '';
                            var class_ ='';
                            if (this.content.search("<img") != -1) {
                                alert('img');
                                class_ = '<p class="">';
                            }
                            else{
                                class_ = '<p class="content">';
                            }
                            tableContent += '<li class="to-me">'+ 
                                '<img class="friend-img left" src="'+ avafr +'" alt="">'+
                                '<div class="discuss-des left">'+
                                    class_ + this.content +
                                    '</p>'+
                                    '<span class="time_send left" style>'+ this.time +'</span>'+
                                '</div>'+
                                '<div class="clr"></div>'+
                            '</li>';
                            $('ul#history').append(tableContent);
                            tableContent='';
                            removeUnread();
                            scrollToBottom();
                        }
                    }//het if ufrom
                    else{
                        if (this.unread === 0){
                            //hien thi qua notification
                            if(userListNotif.indexOf(this.ufrom) === -1){
                                var uname_get = this.ufrom;
                                userListNotif.push(uname_get);
                                    //hien thi icon
                                    $('#icon-notif').show();
                                //alert(uname_get);
                                $.get( '/getUser/'+ this.ufrom, function( result ) {
                                    $('#list_notif').append('<li>'+
                                                                '<a href="#" class="friend-name fr-notif" rel="' + id +'&'+ uname_get + '&'
                                                                        + userListNotif.indexOf(uname_get) +'">'+
                                                                    '<b>'+ result.alias +'</b>'+
                                                                '</a>'+
                                                                '<i class="fa fa-comments-o right"></i>'+
                                                            '</li>');
                                });
                            }
                        }
                    }
                        
                });// het each data[]
            }); // het each data
        });// het get Json
    }, 3000);// het interval   
}// het ham
// remove Chat
function removeChat(){
    $('ul#history').find('li').remove();
};
// remove Chat
function removeUnread(){
    $('ul#history li').find('span.unread').remove();
};
// Add closefriend
function addCloseFriend(event) {
    // Prevent Link from Firing
    event.preventDefault();
    //alert(msgID + ufrom);
    //add
    $.ajax({
        type: 'post',
        url: '/applyFriend',
        data: JSON.stringify({'uid': uid, 'fID': ufrom, "msgID": msgID}),
        contentType: "application/json; charset=utf-8",
        traditional: true,
        success: function (data) {
            console.dir('success insert');
            //if (dta)
        }
    });
    alert('Thêm thành công!');
    $(this).remove();
};
//Function convert base64
function readImage(input) {
    if ( input.files && input.files[0] ) {
        var FR= new FileReader();
        FR.onload = function(e) {
             $('div.acc-me img').attr( "src", e.target.result );
             alert( e.target.result );
             avar64 = e.target.result;
        };       
        FR.readAsDataURL( input.files[0] );
    }
}
//Function Upadate userinfor
function updateInfor() {
    //event.preventDefault();
    var ufullname = $('#setting input#txt-fullname').val();
    var unewpass = $('#setting input#txt-newpass').val();
    var unewava = $('#setting input#txt-newava').val();
    if (ufullname != "" || unewpass != "")
    {
        $.ajax({
            type: 'post',
            url: '/update',
            data: JSON.stringify({'uname': ulogin, 'alias': ufullname, 'pass': unewpass}),
            contentType: "application/json; charset=utf-8",
            traditional: true,
            success: function (data) {
                console.dir('success insert');
                //if (dta)
            }
        });
    }
    if (unewava != "") 
    {
        $.ajax({
            type: 'post',
            url: '/updateAva',
            data: JSON.stringify({'uname': ulogin,'ava': unewava}),
            contentType: "application/json; charset=utf-8",
            traditional: true,
            success: function (data) {
                console.dir('success insert');
                //if (dta)
            }
        });
    }
    alert('Thành công! Hãy đăng nhập lại để hoàn thành tác vụ!');
    window.location = "/logout";
};
// Function get message
function getMessageFrom(mID, avaFr) {
    // Empty content string
    var tableContent = '';
    //alert(avaFr);
    $.getJSON( '/getMessageFrom/'+ mID, function( data ) {
        //alert('Call JSON');
        //For each item in our JSON, add a table row and cells to the content string
        $.each(data, function(){
            var class_ = '';
            //hien thi
            //if (this.unread  != 0){
                if (this.unread === 0){
                    var SendInfo= { "mid": mID,"time": this.time};
                            $.ajax({
                                    type: 'post',
                                    url: '/setReadMsg',
                                    data: JSON.stringify(SendInfo),
                                    contentType: "application/json; charset=utf-8",
                                    traditional: true,
                                    success: function (data) {
                                        console.dir('success insert');
                                        //if (dta)
                                    }
                                });
                }
                if (this.content.search("<img") != -1) {
                        class_ = '<p class="">';
                    }
                    else{
                        class_ = '<p class="content">';
                    }
                if (this.ufrom === ulogin){
                    var li_class = 'from-me';
                    tableContent += '<li class="'+ li_class +'">'+ 
                            //'<img class="friend-img right" src="'+ avame +'" alt="">'+
                            '<div class="discuss-des right">'+
                                class_ + this.content +
                                '</p>'+
                                '<span class="time_send right" style>'+ this.time +'</span>';
                    if (this.unread === 0){ 
                        tableContent += '<span class="unread left" style><i class="fa fa-share"></i></span>'+
                                            '</div>'+
                                            '<div class="clr"></div>'+
                                        '</li>';
                    }
                    else{
                        tableContent += '</div>'+
                                            '<div class="clr"></div>'+
                                        '</li>';
                    }  
                    $('ul#history').append(tableContent);
                    tableContent='';
                }
                else{
                    var li_class = 'to-me';
                    tableContent += '<li class="'+ li_class +'">'+ 
                            '<img class="friend-img left" src="'+ avaFr +'" alt="">'+
                            '<div class="discuss-des left">'+
                                class_ + this.content +
                                '</p>'+
                                '<span class="time_send left" style>'+ this.time +'</span>'+
                            '</div>'+
                            '<div class="clr"></div>'+
                        '</li>';
                    $('ul#history').append(tableContent);
                    tableContent='';
                    }
                //}
            });  
        });
        //scrollToBottom();
};
//Function sendMsg
function sendMsg(event){
    event.preventDefault();
    var cur_time = getDateTime();
    //alert(cur_time+msgID);
    var content = $('#txt-message').val();
      $('.span-chat ul').append('<li class="from-me">'+
            //'<img class="friend-img right" src="images/ava0.png">'+
            '<div class="discuss-des right">'+
              '<p class="content">'+
                content +
              '</p>'+
              '<span class="time_send right" style>'+ cur_time +'</span>'+
              '<span class="unread left" style><i class="fa fa-share"></i></span>'+
            '</div>'+
            '<div class="clr"></div>'+
          '</li>');
      $('#txt-message').val('');
      scrollToBottom();

      var SendInfo= { "mid": msgID, "ufrom": ulogin, "uto": ufrom, "time": cur_time, "content": content, "unread": 0 };
      $.ajax({
            type: 'post',
            url: '/addMsg/' + msgID,
            data: JSON.stringify(SendInfo),
            contentType: "application/json; charset=utf-8",
            traditional: true,
            success: function (data) {
                console.dir('success insert');
                //if (dta)
            }
        });
      equalTime = cur_time;
}

//Scroll
function scrollToBottom(){
//$("#content").animate({ scrollTop: $(document).height()-$(window).height() },600);
$('#content').animate({scrollTop: $('#content')[0].scrollHeight}, 1000);
}
//Function getDateTime SQLite
function getDateTime() {
    var now     = new Date(); 
    var year    = now.getFullYear();
    var month   = now.getMonth()+1; 
    var day     = now.getDate();
    var hour    = now.getHours();
    var minute  = now.getMinutes();
    var second  = now.getSeconds(); 
    if(month.toString().length == 1) {
        var month = '0'+month;
    }
    if(day.toString().length == 1) {
        var day = '0'+day;
    }   
    if(hour.toString().length == 1) {
        var hour = '0'+hour;
    }
    if(minute.toString().length == 1) {
        var minute = '0'+minute;
    }
    if(second.toString().length == 1) {
        var second = '0'+second;
    }   
    var dateTime = year+'/'+month+'/'+day+' '+hour+':'+minute+':'+second;   
     return dateTime;
}
//Function search
function search(){
    //Hien thi ul_search
    $('ul#ul_search_fr').show();
    //An ul_fr
    $('ul#ul_fr').hide();
    //hien th back
    $('h3#back-list').show();
    var query_name = $('input#ls').val();

    //Goi ham
    $.getJSON( '/search/'+ query_name, function( Ulist ) {
        //get data
        $.each(Ulist, function(){
            var uEqual = this.username;
            //check
            if(uEqual != ulogin){
                //Append
                var tableContent = '<li>'+
                                '<div class="friend-right">'+
                                    '<img class="friend-img left" src="'+ this.ava +'">'+
                                    '<div class="friend-chat right">'+
                                        '<a href="#" class="friend-name" rel="'+ this.username +'" onclick="addFriend($(this));">'+
                                            this.alias +
                                            '<span id="addCf">'+
                                                '<i class="fa fa-user-plus right"></i>'+
                                            '</span>'+
                                        '</a>'+
                                        // '<div class="friend-dis">'+
                                        //     '<p> Chưa thêm bạn </p>'+
                                        // '</div>'+
                                    '</div>'+
                                '</div>'+
                                '<div class="clr"></div>'+
                            '</li>';
                $('#ul_search_fr').append(tableContent);
                tableContent = '';
            }
        });
    });
}
