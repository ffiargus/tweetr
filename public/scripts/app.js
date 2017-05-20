/*
 * Client-side JS logic
 * jQuery is already loaded
 */

let loginStatus = false;
let userID = "";

function msToTime(timeStamp) {
  let duration = Date.now() - timeStamp;
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
  let like = "";
  for (liker of tweetInfo.likes) {
    if (liker === userID) {
      like = "liked";
    }
  }
  tweet.append(
    $("<header>").append(
      $("<img>").attr("src", tweetInfo.user.avatars.small),
      $("<h1>").text(tweetInfo.user.name),
      $("<p>").text(tweetInfo.user.handle)),
    $("<p>").text(tweetInfo.content.text),
    $("<footer>").text(msToTime(tweetInfo.created_at)).append(
      $("<a>").attr("href", "mailto:user@example.com").append(
        $("<img>").attr("src", "/images/share.png")),
      $("<img>").attr("src", "/images/flag.png"),
      $("<p>").text(tweetInfo.likes.length),
      $("<img>").attr("src", "/images/like.png").
        addClass("like-button").
        addClass(like).
        attr("data-tweetid", tweetInfo._id).
        attr("data-userid", tweetInfo.user.handle))
  )
  return tweet;
}

// function renderNewTweet(allTweets) {
//   let $tweet = createTweetElement(allTweets.pop());
//   $(".tweets-container").prepend($tweet);
// }

function renderTweets(allTweets) {
  $(".tweets-container").empty();
  for (let tweetInfo of allTweets) {
    let $tweet = createTweetElement(tweetInfo);
    $(".tweets-container").prepend($tweet);
  }
}

$(function() {

  function toggleLike(element, userUnlike) {
    if (userUnlike) {
      $(element).removeClass("liked");
    } else {
      $(element).addClass("liked");
    }
  }

  function toggleLogin(status) {
    if (status) {
      $("#register-button").fadeOut("fast");
      $("#login-button").fadeOut("fast");
      $("#compose-button").fadeIn("slow");
      $("#settings-button").fadeIn("slow");
      $("#logout-button").fadeIn("slow");
    }
    else {
      $("#compose-button").fadeOut("fast");
      $("#logout-button").fadeOut("fast");
      $("#settings-button").fadeOut("fast");
      $("#register-button").fadeIn("slow");
      $("#login-button").fadeIn("slow");
    }
  }

  function loadTweets() {
    $.ajax({
      url: "/tweets/",
      success: (data) => {
        renderTweets(data);
      },
      failure: () => {
        console.error("loding failed");
      }
    });
  }

  $("#flash1").slideUp();

  loadTweets();

  //checks for cookie to determine login status
  $.get("/renderlogin").done((data) => {
    if (data) {
      userID = data;
      loginStatus = true;
    }
    toggleLogin(loginStatus);
  });

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
          loadTweets();
        },
        failure: () => {
          console.error("failed");
        }
      });
    };
    $(".new-tweet").find("textarea").val("");
    $(".new-tweet").find(".counter").text(140);
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
        url: "/logout",
        method: "POST",
        success: () => {
          console.log("logout successs");
          loginStatus = false;
          toggleLogin(loginStatus);
          $(".new-tweet").slideUp("fast");
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

  $(".tweets-container").on("click", ".old-tweet .like-button", function() {
    let uID = $(this).data("userid");
    let tID = $(this).data("tweetid")
    if (loginStatus === true && userID !== uID) {
      $.ajax({
        url: `tweets/${tID}`,
        method: "PUT",
        success: (unLike) => {
          toggleLike(this, unLike);
          loadTweets();
        },
        failure: () => {
          console.error("failed");
        }
      });
    }
  })

});



