/*
 * Client-side JS logic
 * jQuery is already loaded
 */

let loginStatus = false;
let userID = "";

//function to calculate and display appropriate date message
//based on timestamp
function msToTime(timeStamp) {
  let duration = Date.now() - timeStamp;
  let minutes = parseInt((duration/(1000*60))%60),
      hours = parseInt((duration/(1000*60*60))%24),
      days = parseInt((duration/(1000*60*60*24))%365),
      months = parseInt((duration/(1000*60*60*24*30))%12),
      years = parseInt((duration/(1000*60*60*24*365)));

  //if statements checking which text to display
  //and accounts for plural
  if (duration < 40000)           //display just posted if posted within 40 secondss
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

  let like = "";
  let flag = "";
  let containFlag = "";

  for (let liker of tweetInfo.likes) {        //checks if user likes tweet
    if (liker === userID) {
      like = "liked";
    }
  }

  for (let flager of tweetInfo.flags) {        //checks if user flagged tweet
    if (flager === userID) {
      flag = "flaged";
      containFlag = "tweet-flag";
    }
  }

  //creating the article container for the tweet
  let tweet = $("<article>").addClass("old-tweet").addClass(containFlag);

  //appends each element required for the tweet article
  tweet.append(
    $("<header>").append(
      $("<img>").attr("src", tweetInfo.user.avatars.small),
      $("<h1>").text(tweetInfo.user.name),
      $("<p>").text(tweetInfo.user.handle)),
    $("<p>").text(tweetInfo.content.text),
    $("<footer>").text(msToTime(tweetInfo.created_at)).append(
      $("<p>").text(tweetInfo.likes.length),
      $("<img>").attr("src", "/images/like.png").
        addClass("like-button").                                //adding like button class
        addClass(like).                                         //adds additional class if tweet is liked
        attr("data-tweetid", tweetInfo._id).
        attr("data-userid", tweetInfo.user.handle),
      $("<img>").attr("src", "/images/flag.jpg").
        addClass("flag-button").
        addClass(flag),
      $("<a>").attr("href", "mailto:?subject=Checkout%20this%20tweet!&body=localhost:8080/tweets").append(  //email link to someone
        $("<img>").attr("src", "/images/share.png")))
  )
  return tweet;
}

function renderTweets(allTweets) {
  $(".tweets-container").empty();               //clears all tweets before rendering to avoid
  for (let tweetInfo of allTweets) {            //duplicates
    let $tweet = createTweetElement(tweetInfo);
    $(".tweets-container").prepend($tweet);
  }
}

//runs on document ready
$(function() {

  //helper functions
  function toggleLike(element, userUnlike) {
    if (userUnlike) {
      $(element).removeClass("liked");
    } else {
      $(element).addClass("liked");
    }
  }

  function toggleFlag(element, userUnflag) {
    if (userUnflag) {
      $(element).removeClass("flaged");
      $(element).closest(".old-tweet").removeClass("tweet-flag");
    } else {
      $(element).addClass("flaged");
      $(element).closest(".old-tweet").addClass("tweet-flag");
    }
  }

  //hides and shows buttons depending on login status
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

  loadTweets();   //loads tweets when document is ready

  //checks for cookie to determine login status
  $.get("/renderlogin").done((data) => {
    if (data) {
      userID = data;
      loginStatus = true;
      let dispName = data.substring(0, 11);
      if (userID.length > 11) {
        dispName = dispName + "..";
      }
      $("#settings-button").text(dispName);
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

  //buttons toggle form visibility
  $("#compose-button").on("click", () => {
    $("#flash1").slideUp();
    $("#flash2").slideUp();
    $(".new-tweet").slideToggle("fast");
    $(".new-tweet").find("textarea").focus();
  });

  $("#login-button").on("click", () => {
    $("#register-form").slideUp();
    $("#login-form").slideToggle();
    $("#login-form").find(".email").focus();
  });

  $("#register-button").on("click", () => {
    $("#login-form").slideUp();
    $("#register-form").slideToggle();
    $("#register-form").find(".email").focus();
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
          location.reload();    //reloads page after successful logout
        },
        failure: () => {
          console.error("failed");
        }
      });
  });

  //handles user liking tweets
  //not using arrow functions here to keep simplicity in using "this"
  $(".tweets-container").on("click", ".old-tweet .like-button", function() {
    let uID = $(this).data("userid");
    let tID = $(this).data("tweetid");
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
  });

  //handles user flagging tweets, almost identical to liking
  //with a few differences
  //traverses up DOM to use ids stored in like button
  $(".tweets-container").on("click", ".old-tweet .flag-button", function() {
    let uID = $(this).closest(".old-tweet").find(".like-button").data("userid");
    let tID = $(this).closest(".old-tweet").find(".like-button").data("tweetid");
    if (loginStatus === true) {
      $.ajax({
        url: `tweets/flag/${tID}`,
        method: "PUT",
        success: (unFlag) => {
          toggleFlag(this, unFlag);
          loadTweets();
        },
        failure: () => {
          console.error("failed");
        }
      });
    }
  });

});



