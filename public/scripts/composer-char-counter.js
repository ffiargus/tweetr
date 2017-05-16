$(function() {
  $(".new-tweet").on("input", "textarea", function() {
    let textAmount = +$(this).val().length;
    $(this).closest(".new-tweet").find(".counter").text(140 - textAmount);
    if(textAmount > 140) {
      $(this).closest(".new-tweet").find(".counter").addClass("negInput");
    } else {
      $(this).closest(".new-tweet").find(".counter").removeClass("negInput");
    }
  });
});
