window.onload=function(){
    var ajaxRequest=new XMLHttpRequest();
    ajaxRequest.onreadystatechange = function() {
        //daca am primit raspunsul (readyState==4) cu succes (codul status este 200)
        if (this.readyState == 4 && this.status == 200) {
                //in proprietatea responseText am contintul fiserului JSON
                var obJson = JSON.parse(this.responseText);
                document.getElementById("leaderboard_div").style.color = "white";
                templateDisplay(obJson);
        }
    };

    ajaxRequest.open("GET","/json/useri.json",true);
    ajaxRequest.send();
    
    function templateDisplay(obJson){
        let container=document.getElementById("leaderboard_div");
        //in textTemplate creez continutul (ce va deveni innerHTML-ul) divului
        let textTemplate="";
        for(let i=0;i<obJson.useri.length;i++){
            //creez un template ejs (primul parametru al lui ejs.render)
            //acesta va primi ca parametru un user din vectorul de useri din json {user: obJson.useri[i]}
            //practic obJson.useri[i] e redenumit ca "user" in template si putem sa ii accesam proprietatile
            textTemplate+=ejs.render(
                "<span><%= user.username %></span>\
                <span><%= user.nume %></span>\
                <span><%= user.score %></span>\
                <span><%= user.country %></span>\
                <span><%= user.favouriteTeam %></span>", 
            {user: obJson.useri[i]});
        }
        console.log(textTemplate);
        container.innerHTML+=textTemplate;
    }

}