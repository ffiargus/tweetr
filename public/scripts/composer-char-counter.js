//function handling the text limit counter

$(function() {
  $(".new-tweet").on("input", "textarea", function() {
    let textAmount = +$(this).val().length;
    $(this).closest(".new-tweet").find(".counter").text(140 - textAmount);
    if(textAmount > 140) {
      $("#submit-post").prop('disabled', true);
      $(this).closest(".new-tweet").find(".counter").addClass("negInput");
      $("#flash2").slideDown();
    } else {
      $("#submit-post").prop('disabled', false);
      $(this).closest(".new-tweet").find(".counter").removeClass("negInput");
      $("#flash2").slideUp();
    }
  });
  $("#flash2").slideUp();
});
