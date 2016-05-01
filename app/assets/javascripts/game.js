$(document).ready(function(){
  
  var num_of_dealer_cards = 0;

  $("#rules_button").on("click", function(e){
    e.preventDefault();
    $("#welcome").hide();
    $("#rules").show();
  });

  $("#close_rules").on("click", function(e){
    e.preventDefault();
    $("#welcome").show();
    $("#rules").hide();   
  });

  $("#proceed").on("click", function(e){
    e.preventDefault();
    $("#welcome").hide();
    $("#place_bet").show();
  });

  $("#bet").on("click", function(e){
    e.preventDefault();
    var input = $("#amount").val();
    //Checks if the amount entered is a valid number os not
    if( ((input - 0) == input && (''+input).trim().length > 0) && input!=0 ){
      $("#place_bet").hide();
      $("#amount_playing").html("Playing for " + input + "$");
      $("#game").show();

      $("#message").html("<p style='color: green'>Dealing the first round of cards</p>");
      delayedClick("hit", 500);
      delayedClick("hit", 2600);
      delayedClick("stand", 5000);
      setTimeout(function(){
        $("#message").html("<p style='color: green'>Hit or Stand?</p>");
      }, 7000);
    }
    else
      alert("Valid numbers only here!");
  });

  $("#next_game").on('click', function(){
    window.location.reload(true);
  })

  $(".get_card").on("click", function(e){
    var type = $(this).data("type"); //dealer or player
    var id = type + "_cards";
    e.preventDefault();
    if(type=="dealer"){
      num_of_dealer_cards = num_of_dealer_cards + 1;
    }
    $.ajax({
      url: '/game/get_next_card/',
      type: 'GET',
      contentType: 'application/json',
      dataType: 'json',
      data: {type: type},
      success: function(response){
        if(response["status"]=="ok"){
          var div = document.getElementById(id);
          div.innerHTML = div.innerHTML + "&nbsp &nbsp" + response["selected"];
          $.ajax({
            url: '/game/check_results/',
            type: 'GET',
            contentType: 'application/json',
            dataType: 'json',
            data: {type: type},
            success: function(response){
              console.log(response);
              setTimeout(function(){
                if(response["game_over"]){
                  declareResults(response["winner"]);
                }
                else if(type=="dealer" && num_of_dealer_cards > 1){
                  $("#message").hide();
                  $("#stand").click();
                }
              }, 1000);
            }
          });
        }
      }
    });
  });

  function declareResults(winner){
    $("#message").hide();
    var text = "";
    if(winner=="draw"){
      text = "Well its a draw!"
    }
    else if(winner=="player"){
      text = "Congratulations you won!"
    }
    else if(winner=="dealer"){
      text = "Sorry you loose. Better luck next time."
    }
    text = text + "<br/>"
    var div = document.getElementById('winner_info');
    div.innerHTML = text + div.innerHTML;
    $(".get_card").hide();
    $("#game_finished").show();
  }

  function delayedClick(id, duration){
    setTimeout(function(){
      $("#"+id).click();
    }, duration); 
  }
});