
$.get(
  "/cloud.html",
  onAjaxSuccess
);


 
function onAjaxSuccess(data)
{
    $('body').append($(data).find('.files'));
    $.getScript("/js/cloud.js");
}