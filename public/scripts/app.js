/*
 * Client-side JS logic goes here
 * jQuery is already loaded
 * Reminder: Use (and do all your DOM work in) jQuery's document ready function
 */


let loginStatus = false;

function msToTime(timeStamp) {
  let d = new Date();
  let duration = d.getTime() - timeStamp;
  let minutes = parseInt((duration/(1000*60))%60),
      hours = parseInt((duration/(1000*60*60))%24),
      days = parseInt((duration/(1000*60*60*24))%365),
      months = parseInt((duration/(1000*60*60*24*30))%12),
      years = parseInt((duration/(1000*60*60*24*365)));

  if (duration < 30000)
    return "Just posted";
  else if(years > 1)
    return years + " Years ago";
  else if(years > 0)
    return years + " Year ago";
  else if(months > 1)
    return months + " Months ago";
  else if(months > 0)
    return months + " Month ago";
  else if(days > 1)
    return days + " Days ago";
  else if(days > 0)
    return days + " Day ago";
  else if(hours > 1)
    return hours + " Hours ago";
  else if(hours > 0)
    return hours + " Hour ago";
  else if(minutes > 1)
    return minutes + " Minutes ago";
  else
    return "1 Minute ago";
}


function createTweetElement(tweetInfo) {
  let tweet = $("<article>").addClass("old-tweet");
  tweet.append(
    $("<header>").append(
      $("<img>").attr("src", tweetInfo.user.avatars.small),
      $("<h1>").text(tweetInfo.user.name),
      $("<p>").text(tweetInfo.user.handle)),
    $("<p>").text(tweetInfo.content.text),
    $("<footer>").text(msToTime(tweetInfo.created_at)).append(
      $("<img>").attr("src", "/images/share.png"),
      $("<img>").attr("src", "/images/flag.png"),
      $("<img>").attr("src", "/images/like.png"))
  )
  return tweet;
}

function renderNewTweet(allTweets) {
  let $tweet = createTweetElement(allTweets.pop());
  $(".tweets-container").prepend($tweet);
}

function renderTweets(allTweets) {
  for (let tweetInfo of allTweets) {
    let $tweet = createTweetElement(tweetInfo);
    $(".tweets-container").prepend($tweet);
  }
}

$(function() {

  function toggleLogin(status) {
    if (status) {
      console.log("cookie here");
      $("#compose-button").fadeIn("slow");
      $("#logout-button").fadeIn("slow");
      $("#register-button").fadeOut("fast");
      $("#login-button").fadeOut("fast");
    }
    else {
      $("#compose-button").fadeOut("fast");
      $("#logout-button").fadeOut("fast");
      $("#register-button").fadeIn("slow");
      $("#login-button").fadeIn("slow");
    }
  }

  $.get("/tweets/renderlogin/").done((data) => {
    if (data) {
      loginStatus = true;
    }
    toggleLogin(loginStatus);
  });

  function loadTweets(q) {
    $.ajax({
      url: "/tweets/",
      success: (data) => {
        if(q === "all") {
          renderTweets(data);
          toggleLogin(loginStatus);
        } else if(q === "new") {
          renderNewTweet(data);
        };
      },
      failure: () => {
        console.error("loding failed");
      }
    });
  }
  $("#flash1").slideUp();

  loadTweets("all");

  $("textarea").on("input", () => {$("#flash1").slideUp()});

  $("#submit-tweet").on("submit", (event) => {
    event.preventDefault();
    let serialized = $("#submit-tweet").serialize();
    if(serialized === "text=") {
      $("#flash1").slideDown();
    } else {
      $.ajax({
        url: "/tweets/",
        method: "POST",
        data: serialized,
        success: () => {
          console.log(this.data);
          loadTweets("new");
        },
        failure: () => {
          console.error("failed");
        }
      });
    };
    $(".new-tweet").find("textarea").val("");
    // $(".new-tweet").find(".counter").text(140);
  });

  $("#compose-button").on("click", () => {
    $("#flash1").slideUp();
    $("#flash2").slideUp();
    $(".new-tweet").slideToggle("fast");
    $(".new-tweet").find("textarea").focus();
  });

  $("#login-button").on("click", () => {
    $("#register-form").slideUp();
    $("#login-form").slideToggle();
    // $(".").find("textarea").focus();
  });

  $("#logout-button").on("click", (event) => {
    event.preventDefault();
    $.ajax({
        url: "/tweets/logout",
        method: "POST",
        success: () => {
          console.log("successs");
          location.reload();
        },
        failure: () => {
          console.error("failed");
        }
      });
  });

  $("#register-button").on("click", () => {
    $("#login-form").slideUp();
    $("#register-form").slideToggle();
    // $(".new-tweet").find("textarea").focus();
  });
  // console.log($tweet);
});



