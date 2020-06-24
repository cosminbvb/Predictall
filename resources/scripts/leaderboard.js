window.onload=function(){
    var ajaxRequest=new XMLHttpRequest();
    ajaxRequest.onreadystatechange = function() {
        //daca am primit raspunsul (readyState==4) cu succes (codul status este 200)
        if (this.readyState == 4 && this.status == 200) {
                //in proprietatea responseText am contintul fiserului JSON
                //document.getElementById("afisJson").innerHTML=this.responseText;
                var obJson = JSON.parse(this.responseText);
                alert(obJson.test);
        }
    };
    ajaxRequest.open("GET","/json/test.json",true);
    ajaxRequest.send();

}