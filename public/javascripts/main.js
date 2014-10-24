// NAMESPACE
var foodMon = {};

var counter;
foodMon.category = "";

// FUNCTION DECLARATIONS
foodMon.categoryClick = function(e){
  counter = 1; 
  e.preventDefault();
  //random number
  var number = Math.floor((Math.random() * 200) + 1);
  foodMon.category = this.innerText;
  console.log(this.innerText);
  //Goes through api with the searchTerm Soups starts at random place
  var url= "http://api.yummly.com/v1/api/recipes?_app_id=d38fff6d&_app_key=effa46e418efdd042f6866b93906a8d0&q=" + foodMon.category + "&maxResult=2&start="+number;
  //We do JSON in order to get the recipe object of what we searched for
  $.getJSON(url, function(data){
    var rec1 = data.matches[0];
    var rec2 = data.matches[1];

    // localStorage stuff stores information on the current session!
    // Great for my app! Thanks Localstorage - you're dope!
    // key: value Ex) recipe1: now has rec1 information in string form
    // When I've chosen the victor recipe go to localstorage JSON Parse and get ID
    localStorage.setItem('recipe1', JSON.stringify(rec1));
    localStorage.setItem('recipe2', JSON.stringify(rec2));

    //I NOW HAVE ACCESS to the obj so I grab the images
    var img1 = "<img style = 'width:200px' class = 'img-thumbnail' src =" + rec1.imageUrlsBySize[90] +">";
    var img2 = "<img style = 'width:200px' class = 'img-thumbnail' src =" + rec2.imageUrlsBySize[90] +">";
    //I append img1 into the class recipe1/2
    //empty() clears all child nodes so it's always clean from the start
    $('.recipe1').empty().append(img1); 
    $('.recipe2').empty().append(img2);
    var round = "<h2>Round 1</h2>";
    $('.round').empty().append(round);

  });
};


foodMon.recipeClick = function(e) {
  counter++;
  //clicked grabs the specific node of the div i clicked
  //either recipe1 or recipe2
  var clicked = this;
  var round = "<h2>Round "+ counter +"</h2>";
  $('.round').empty().append(round);

  // Run the getRecipe function which brings me new data!
  foodMon.getRecipe(clicked).success(function(data){
    //tmp is the new recipe object I got from the api call
    var tmp = data.matches[0];
    //If i clicked recipe1 then I want to change the img attrbiute
    //of recipe2 to the new tmp image and store that information into local
    //storage in case it becomes my victor!
    if ($(clicked).hasClass("recipe1")){
      $('.recipe2 img').attr('src', tmp.imageUrlsBySize[90]);
      localStorage.setItem('recipe2', JSON.stringify(tmp));
    //Else do the opposite
    } else {
      $('.recipe1 img').attr('src', tmp.imageUrlsBySize[90]);
      localStorage.setItem('recipe1', JSON.stringify(tmp));
    }
  });
  if (counter === 5){
    round = "<h2>Final Round</h2>";
    $('.round').empty().append(round);
  }
  //When the counter hit's five the next clikc is the winner!
  if (counter === 6) {
    if ($(clicked).hasClass("recipe1")){
      foodMon.declareWinner(1);  
    } else {
      foodMon.declareWinner(2);
    }
  }
};


///////////////////////////////////////////////////
//////////////////////////////////////////////////
////////FUNCTIONS INSIDE FUNCTIONS!!!!!!
foodMon.declareWinner = function(winNum){
  $('.recipes').empty();
//Get the information from the local storage
  var taco = localStorage.getItem('recipe'+winNum);
  var nacho = JSON.parse(taco);
  var detail = nacho.id;
  //Make another api call
  var url ="http://api.yummly.com/v1/api/recipe/"+detail+"?_app_id=d38fff6d&_app_key=effa46e418efdd042f6866b93906a8d0";

  //
  $.getJSON(url, function(data){
  // I append the ingredient lines and image into 
  //the div class info!
   var title = "<div><h1>Victory!!!</h1></div>";
   $(".info").append(title);
   $(".info").append(data.name);
   var img = "<img class = 'img-thumbnail' src =" + data.images[0].hostedLargeUrl +">";
   var btn = "<a class= 'btn btn-primary' href='/favorite'>Victory Page</a>";
   var restart = "<a class= 'btn btn-primary' href='/home'>Restart</a>";
   $(".info").append(img);
   $(".info").append(btn);
   $(".info").append(restart);
   //AJAX allows me to do app.post
   $.ajax({
      type:"POST",
      url: "/favorite",
      data: {info: data}
    })
      .done(function(msg){
        console.log("Data Saved" + msg);
      }); 
  });
};


//Gets my new recipe for the one that got eliminated!
foodMon.getRecipe = function(){
  var number = Math.floor((Math.random() * 200) + 1);
  var searchTerm = foodMon.category;
  var url= "http://api.yummly.com/v1/api/recipes?_app_id=d38fff6d&_app_key=effa46e418efdd042f6866b93906a8d0&q=" + searchTerm + "&maxResult=1&start="+number;

  var temp = $.getJSON(url, function(data){
    var rec = data.matches[0];
    return rec;
  });

  return temp;
};