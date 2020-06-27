var obJson;
var columns;
var averageScore=0;
window.onload=function(){
    var ajaxRequest=new XMLHttpRequest();
    ajaxRequest.onreadystatechange = function() {
        //daca am primit raspunsul (readyState==4) cu succes (codul status este 200)
        if (this.readyState == 4 && this.status == 200) {
                //in proprietatea responseText am contintul fiserului JSON
                obJson = JSON.parse(this.responseText);
                //sortam initial descrescator dupa score
                obJson.useri.sort(function(a,b){
                    return -(a.score-b.score);
                });
                //setam fiecarui user un nr de ordine in functie de scor
                var scoreSum=0;
                var numberOfUsers=obJson.useri.length;
                for(let place=0;place<numberOfUsers;place++){
                    scoreSum+=obJson.useri[place].score;
                    obJson.useri[place].place=place+1;
                }
                averageScore=scoreSum/numberOfUsers;
                let average=document.getElementById("average");
                average.innerHTML+=averageScore;
                document.getElementById("leaderboard_div").style.color = "white";
                columns=document.getElementById("leaderboard_div").innerHTML;
                let searchedUsernameLocalStorage=localStorage.getItem("searchedUserName");
                if(searchedUsernameLocalStorage && searchedUsernameLocalStorage.length>=1){
                    document.getElementById("searchUserName").value=searchedUsernameLocalStorage;
                    localStorage.removeItem("searchedUserName");
                    searchUserName();
                }
                else{
                    templateDisplay();
                }
        }
    };

    ajaxRequest.open("GET","/json/useri.json",true);
    ajaxRequest.send();
}

function templateDisplay(){
    let container=document.getElementById("leaderboard_div");
    //in textTemplate creez continutul (ce va deveni innerHTML-ul) divului
    //let columns=container.innerHTML;
    container.innerHTML="";
    let textTemplate=columns;
    for(let i=0;i<15;i++){
        //creez un template ejs (primul parametru al lui ejs.render)
        //acesta va primi ca parametru un user din vectorul de useri din json {user: obJson.useri[i]}
        //practic obJson.useri[i] e redenumit ca "user" in template si putem sa ii accesam proprietatile
        
        //randare client side
        textTemplate+=ejs.render(
            "<span><%= user.place %></span>\
            <span><%= user.username %></span>\
            <span><%= user.nume %></span>\
            <span><%= user.score %></span>\
            <span><%= user.country %></span>\
            <span><%= user.favouriteTeam %></span>", 
        {user: obJson.useri[i]});
    }
    container.innerHTML+=textTemplate;
    colorByScore();
}

var orderByScorePressed=1;
function orderByScore(){
    if (orderByScorePressed==1){
        obJson.useri.sort(function(a,b){
            return (a.score-b.score);
        });
    }
    else{
        obJson.useri.sort(function(a,b){
            return -(a.score-b.score);
        });
    }
    templateDisplay(obJson);
    orderByScorePressed=-orderByScorePressed;
    let elements=document.getElementById("leaderboard_div").children;
    //setting the column color
    for(let i=9;i<=elements.length;i+=6){
        elements[i].style.backgroundColor="#048BA8";
    }
    //removing it after a second
    setTimeout(function(){
        for(let i=9;i<=elements.length;i+=6){
            elements[i].style.backgroundColor="black";
        }
    },1000);
}


var orderByNamePressed=1;
function orderByName(){
    if (orderByNamePressed==1){
        obJson.useri.sort(function(a,b){
            return (a.nume.localeCompare(b.nume));
        });
    }
    else{
        obJson.useri.sort(function(a,b){
            return -(a.nume.localeCompare(b.nume));
        });
    }
    templateDisplay(obJson);
    orderByNamePressed=-orderByNamePressed;
    let elements=document.getElementById("leaderboard_div").children;

    //setting the column color
    for(let i=8;i<=elements.length;i+=6){
        elements[i].style.backgroundColor="#048BA8";
    }
    //removing it after a second
    setTimeout(function(){
        for(let i=8;i<=elements.length;i+=6){
            elements[i].style.backgroundColor="black";
        }
    },1000);
}

var orderByUserNamePressed=1;
function orderByUserName(){
    if (orderByUserNamePressed==1){
        obJson.useri.sort(function(a,b){
            return (a.nume.localeCompare(b.nume));
        });
    }
    else{
        obJson.useri.sort(function(a,b){
            return -(a.nume.localeCompare(b.nume));
        });
    }
    templateDisplay(obJson);
    orderByUserNamePressed=-orderByUserNamePressed;
    let elements=document.getElementById("leaderboard_div").children;
    for(let i=7;i<=elements.length;i+=6){
        elements[i].style.backgroundColor="#048BA8";
    }
    setTimeout(function(){
        for(let i=7;i<=elements.length;i+=6){
            elements[i].style.backgroundColor="black";
        }
    },1000);
}

function searchUserName() {
    let container=document.getElementById("leaderboard_div");
    container.innerHTML="";
    let textTemplate=columns;
    // Declare variables
    var input,td, i, txtValue;
    input = document.getElementById("searchUserName").value;
    localStorage.setItem("searchedUserName", input);
    list = obJson.useri;
  
    // Loop through all table rows, and hide those who don't match the search query
    for (i = 0; i < list.length; i++) {
      td=list[i];
      if (td) {
        txtValue = td.username;
        if (txtValue.startsWith(input)) {
            //sau txtValue.indexOf(input)>-1
            //daca nu vrem sa luam doar ce incepe cu inputul
            textTemplate+=ejs.render(
                "<span><%= user.place %></span>\
                <span><%= user.username %></span>\
                <span><%= user.nume %></span>\
                <span><%= user.score %></span>\
                <span><%= user.country %></span>\
                <span><%= user.favouriteTeam %></span>", 
            {user: list[i]});
        }
      }
    }
    container.innerHTML+=textTemplate;
    colorByScore();
}

function colorByScore(){
    let elements=document.getElementById("leaderboard_div").children;
    for(let i=9;i<=elements.length;i+=6){
        if(Number(elements[i].innerHTML)>averageScore){
            elements[i].style.color="green";
        }
        else{
            elements[i].style.color="orange";
        }
    }
}

//reload the page every 5 minutes
setInterval(function(){
    window.location.reload(1);
 }, 300000)