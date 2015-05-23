/***
   * Thanks for your download :)
   * 31. january 2013
   * www.tempees.com  
   * http://www.facebook.com/tempeescom
   * http://www.twitter.com/tempeescom
   * http://www.tempees.com/donate
   * LICENCE: All of our site is free, and you can use it where you want. For private and commercial purposes.        
***/  

$(document).ready(function() {
  //Funtion Gotop
  // Ẩn hiện icon go-top
  $('#content').scroll(function(){
    if( $('#content').scrollTop() == 0 ) {
      $('#go_top').stop(false,true).fadeOut(600);
    }
    else{
      $('#go_top').stop(false,true).fadeIn(1000);
    }
  });
          
  // Cuộn trang lên với scrollTop
  $('#go_top').click(function(){
    $('#content').animate({scrollTop:0},400);
    //$("#content").animate({ scrollTop: $("#content").height()- 600 },600);
    return false;
  });

  TriggerClick = 0;
  $('span#i-menu').click(function(){
    if(TriggerClick === 0){
         TriggerClick = 1;
         //$('#mn-left').show();
         getFriend(ulogin);
         $('body').addClass('open-menu');
         $('#mn-left').animate({marginLeft:'0%'}, 400);
         $(window).resize(function() {
           $('#body').height($(window).height());
         });
         $(window).trigger('resize');
    }else{
         TriggerClick = 0;
         $('body').removeClass('open-menu');
         $('#mn-left').animate({marginLeft:'-250px'}, 200);
         $('ul#ul_fr').find('li').remove();
         //$('#mn-left').hide();
         $(window).resize(function() {
           //$('#body').height('auto');
           $('#body').height($(window).height());
         });
         $(window).trigger('resize');
         
    };
    
    return false;
  });
  
  $('open-menu #content').click(function(){
    $(this).animate({marginLeft:'0%'}, 200);
  });
  
  $(window).resize(function() {
    $('#content').height($(window).height());
    $('#content section').height($(window).height());
  });

  $(window).trigger('resize');
  
  //Span-tool
  sClick = 0;

  $('#span-tool').click(function(){
    if (sClick == 0)
    {
      $(this).animate({marginBottom:'50px'}, 200);
      $('.left-tool').show();
      $('footer').show();
      sClick = 1;
    }
    else
    {
      $(this).animate({marginBottom:'0%'}, 200);
      $('.left-tool').hide();
      $('footer').hide();
      $('.stick').hide();
      sClick = 0;
    }
    
  });
  //Function Send
    // $('#btn-send').click(function(){
      
    // });
    //Send enter
    $('input#txt-message').keypress(function(e){

    // Submit the form on enter

    if(e.which == 13) {
      e.preventDefault();
      $('#btn-send').click();
    }

  });

    //Function Search
    $('input#ls').keypress(function(e){

    // Submit the form on enter

    if(e.which == 13) {
      e.preventDefault();
      $('ul#ul_search_fr').find('li').remove();
      search();
    }

  });
    //Back list
$('h3#back-list').click(function(){
    //An ul_search
    $('ul#ul_search_fr').hide();
    //Hien thi ul_fr
    $('ul#ul_fr').show();
    //An itselt
    $('h3#back-list').toggle();
    //reset value
    $('input#ls').val('');
    $('ul#ul_fr').find('li').remove();
    
    getFriend(ulogin);
});
    
  //Function Stick
    $('#btn-stick').click(function(){
      $('.stick').show();
    });
    $('#st_close').click(function(){
      $('.stick').hide();
    });
    $('#list-stick li img').click(function(){
      var cur_time = getDateTime();
      var source = this.src;
      $('.span-chat ul').append('<li class="from-me">'+
            //'<img class="friend-img right" src="images/ava0.png">'+
            '<div class="discuss-des right">'+
              '<p class="">'+
                 '<img class="i-stick" src="'+ source +'">' +
              '</p>'+
              '<span class="time_send right" style>'+ cur_time +'</span>'+
              '<span class="unread left" style><i class="fa fa-share"></i></span>'+
            '</div>'+
            '<div class="clr"></div>'+
          '</li>');
      $('.stick').hide();
      scrollToBottom();
      var content = '<img class="i-stick" src="'+ source +'">';
      var SendInfo= { "mid": msgID, "ufrom": ulogin, "time": cur_time, "content": content, "unread": 0 };
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
      
    });

  //Function select img
    $('#btn-image').click(function(){
        $('#inImg').click();
    });
    $("#inImg").change(function() {
            loadImageFileAsURL();
        });
    function loadImageFileAsURL()
    {
        var filesSelected = document.getElementById("inImg").files;
        if (filesSelected.length > 0)
        {
            var fileToLoad = filesSelected[0];

            if (fileToLoad.type.match("image.*"))
            {
                var fileReader = new FileReader();
                fileReader.onload = function(fileLoadedEvent) 
                {
                    var li_new = document.createElement('li');
                    li_new.className= 'from-me';
                    // var ava_n = document.createElement('img');
                    // ava_n.className='friend-img right';
                    // ava_n.src='images/ava0.png';
                    var div_new = document.createElement("div");
                    div_new.className= 'discuss-des right';
                    var imageLoaded = document.createElement("img");
                    imageLoaded.src = fileLoadedEvent.target.result;
                    div_new.appendChild(imageLoaded);
                    //li.appendChild(imageLoaded);
                    //li_new.appendChild(ava_n);
                    li_new.appendChild(div_new);
                    var div_clr = document.createElement("div");
                    div_clr.className= 'clr';
                    li_new.appendChild(div_clr);
                    document.getElementById('history').appendChild(li_new);
                    scrollToBottom();
                };
                fileReader.readAsDataURL(fileToLoad);
            }
        }
    }
    //Form Group
    $('#addfr li').click(function(){
        var value = $(this).find('a').text();
        $(this).find('i').remove();
        $(this).find('div.friend-right').append('<i class="fa fa-check fa-2x add"></i>');
        $(this).css( "background-color","#a4dcf7" );
    });
    //Show setting
    // $('a#u_Login').click(function(){
    //     $('#setting').show();
    // });
    $('input#cancel').click(function(){
        $('#setting').hide();
    });
    $('input#ok').click(function(){
        updateInfor();
    });
    
    $('span#edit').click(function(){
      //$('#setting').show();
      $('#setting').fadeTo('slow', 1);
    });
    //Set ava
    $('ul#list-ava li img').click(function(){
      //alert($(this).attr('src'));
      var srcImg = $(this).attr('src');
      $('ul#list-ava li').find('img.img-active').removeClass('img-active');
      $(this).addClass('img-active');
      $('input#txt-newava').val(srcImg);
    });
    
    
    $('span.logout').click(function(){
      $.ajax({
          type: 'post',
          url: '/offline',
          data: JSON.stringify({"uname": ulogin}),
          contentType: "application/json; charset=utf-8",
          traditional: true
      }).done(function( response ) {
          if (response.msg === ''){
            window.location = "/logout";
          }
          else{
            alert('Chua logout!');
          }
      });
      //window.location = "/logout";
    });
    //hien thi notif dialog
    var notif = 0;
    $('span#i-notifi').click(function(){
      if (notif === 0 ){
        $('div#notif').show();
        $('#topArrow').show();
        notif = 1;
      }
      else{
        $('div#notif').hide();
        $('#topArrow').hide();
        notif = 0;
      }
    });
});