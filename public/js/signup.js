$(document).ready(function() {
	$('.span-box ul#list-ava li img').click(function(){
      var srcImg = $(this).attr('src');
      //alert(srcImg);
      $('#select-ava').attr("src",srcImg);
      $('#ava-src').val(srcImg);
    });
});
