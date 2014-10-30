// NAMESPACE
var foodMon = {};

var counter;
foodMon.category = "";

// FUNCTION DECLARATIONS
foodMon.categoryClick = function(e){
  counter = 1; 
  e.preventDefault();
  //random number
  var number = Math.floor((Math.random() * 300) + 1);
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
    var img1 = "<img style = 'width:200px' class = 'img-circle' src =" + rec1.imageUrlsBySize[90] +">";
    var img2 = "<img style = 'width:200px' class = 'img-circle' src =" + rec2.imageUrlsBySize[90] +">";
    //I append img1 into the class recipe1/2
    //empty() clears all child nodes so it's always clean from the start
    $('.recipe1').empty().append(img1); 
    $('.recipe2').empty().append(img2);

    var round = "Round 1 <br> <h4>Which would you rather prefer?</h4>";
    $('.round').empty().append(round);

    $("body").animate({scrollTop: $(".searchBar").offset().top }, 2000);

  });
};


foodMon.recipeClick = function(e) {
  counter++;
  //clicked grabs the specific node of the div i clicked
  //either recipe1 or recipe2
  var clicked = this;
  var round = "Round "+ counter +"<br><h4>Which would you rather prefer?</h4>";
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
    round = "Final Round <br><h4>Which would you rather prefer?</h4>";
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
  $('.container1').remove();
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
   var title = "Victory!!!";
   $(".win").append(title);
   var img = "<img class = 'img-thumbnail' src =" + data.images[0].hostedLargeUrl +">";
   $(".bigPic").append(img);
   $(".title").append(data.name);
   $(".myRating").append("Rating: " + data.rating);
   $(".cals").append("Calories: " + data.nutritionEstimates[0].value);
   $(".flavors").append("Flavors: <p>Bitter: "+data.flavors.Bitter+"</p><p>Meaty: "+data.flavors.Meaty+"</p><p>Salty: "+data.flavors.Salty+"</p><p>Sour :"+data.flavors.Sour+"</p><p>Sweet:"+data.flavors.Sweet+"</p>");
   $(".myIngredients").append("Ingredients: "+ data.ingredientLines);
   $(".final").append("<a target='_blank' href="+data.source.sourceRecipeUrl+">"+"How to Make it!"+"</a>");
   var btn = "<a class= 'btn1' href='/favorite'>Victory Page</a>";
   var restart = "<a class= 'btn2' href='/home'>Play Again</a>";
   $(".thisButton").append(btn);
   $(".thisButton").append(restart);
   $(window).scrollTop($(".detailContainer").offset().top);
   // $("body").animate({scrollTop: $(".detailContainer").offset().top }, 2000);
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
  var number = Math.floor((Math.random() * 350) + 1);
  var searchTerm = foodMon.category;
  var url= "http://api.yummly.com/v1/api/recipes?_app_id=d38fff6d&_app_key=effa46e418efdd042f6866b93906a8d0&q=" + searchTerm + "&maxResult=1&start="+number;

  var temp = $.getJSON(url, function(data){
    var rec = data.matches[0];
    return rec;
  });

  return temp;
};