// Grab the articles as a json
$.getJSON("/articles", function(data) {
  });
  
  //data[i]._id
  
  $("#scrape-btn").on("click", function(){
    $.ajax({
        method: "GET",
        url: "/scraper"
      })
      .done(function(data) {
                console.log(data);
                
                $("#articles").empty();

                for (var i = 0; i < data.length; i++) {
                    // Display the apropos information on the page
                    $("#articles").append(`<div class='row'>
                    <div class='col-md-12'>
                    <div class='panel panel-primary'>
                    <div class='panel-heading'>
                    <h3 class='panel-title> <a href='${data[i].link}'>${data[i].title}</h3></a>
                    </div>
                    <div class="panel-body">${data[i].description}
                    </div>
                    </div>
                    </div>`);
                };
               
        });
  })

  
  // When you click the savenote button
  $(document).on("click", "#savenote", function() {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");
  
    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        // Value taken from title input
        title: $("#titleinput").val(),
        // Value taken from note textarea
        body: $("#bodyinput").val()
      }
    })
      // With that done
      .done(function(data) {
        // Log the response
        console.log(data);
        // Empty the notes section
        $("#notes").empty();
      });
  
    // Also, remove the values entered in the input and textarea for note entry
    $("#titleinput").val("");
    $("#bodyinput").val("");
  });
  