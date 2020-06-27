var lastId;
window.onload=function(){
    inactivity();
    //loading the current matches from predictions.json
    if(id != null)
    {
        var parent=document.getElementsByClassName('matches')[0];
        for(let i=0;i<=8;i++){
            var currentMatch;
            for(let j in fisier.predictions){
                if(fisier.predictions[j].id==i){
                    currentMatch=fisier.predictions[j];
                    break;
                }
            }
            var Logo1=document.createElement('div');
            Logo1.className='team-logo';
            var Img1=document.createElement('img');
            Img1.src=currentMatch.link1;
            Logo1.appendChild(Img1);
            var Logo2=document.createElement('div');
            Logo2.className='team-logo';
            var Img2=document.createElement('img');
            Img2.src=currentMatch.link2;
            Logo2.appendChild(Img2);
            var score1=document.createElement('div');
            score1.className='score';
            score1.classList.add('score1');
            score1.contentEditable=true;
            score1.onkeyup=sendScore;
            score1.innerHTML='?';
            var score2=document.createElement('div');
            score2.className='score';
            score2.classList.add('score2');
            score2.contentEditable=true;
            score2.onkeyup=sendScore;
            score2.innerHTML='?';
            var Team1=document.createElement('div');
            Team1.className='team';
            Team1.innerHTML=currentMatch.team1;
            var Team2=document.createElement('div');
            Team2.innerHTML=currentMatch.team2;
            parent.appendChild(Logo1);
            parent.appendChild(Team1);
            parent.appendChild(score1);
            parent.appendChild(score2);
            parent.appendChild(Team2);
            parent.appendChild(Logo2);
        }
        //if the user is logged in, we load his past predictions for the current matchday
        getPastPredictions();
    }
}
function getPastPredictions(){
    //creez un obiect de tip XMLHttpRequest cu care pot 
    //transmite cereri catre server
        //la schimbarea starii obiectului XMLHttpRequest (la schimbarea proprietatii readyState)
    /* stari posibile:
    0 - netrimis
    1 - conexiune deschisa
    2 - s-au transmis headerele
    3 - se downleadeaza datele (datele sunt impartite in pachete si el primeste cate un astfel de pachet)
    4 - a terminat
    */
    var ajaxRequest=new XMLHttpRequest();
    ajaxRequest.onreadystatechange=function(){
        //daca am primit raspunsul (readyState==4) 
        //cu succes (codul status este 200)	
        if(this.readyState==4 && this.status==200){
            //in proprietatea responseText am contintul fiserului JSON
            var obJson = JSON.parse(this.responseText);
            PastPredictions(obJson,id);
            lastId=obJson.lastId;
        }	
    }
    //deschid o conexiune cu o cerere de tip get catre server
    ajaxRequest.open("GET", "/json/userPredictions.json", true);
    ajaxRequest.send();
    function PastPredictions(obJson,id){
        for(let i=0;i<obJson.userPredictions.length;i++){
            if(obJson.userPredictions[i].userId==id){
                let score1=document.querySelectorAll('.score1')[obJson.userPredictions[i].predictionId];
                let score2=document.querySelectorAll('.score2')[obJson.userPredictions[i].predictionId];
                score1.innerHTML=obJson.userPredictions[i].score1;
                score2.innerHTML=obJson.userPredictions[i].score2;
            }
        }
    }
}
function sendScore(){
    let newPrediction;
    let divNumber;
    let list=document.getElementsByClassName(this.className);
    let nr=0;
    for(let d of list){
        if(d==this){
            divNumber=nr;
            break;
        }
        else{
            nr++;
        } 
    }
    let firstDiv;
    let secondDiv;
    if(this.classList.contains('score1')){
        firstDiv=this;
        secondDiv=document.querySelectorAll('.score2')[divNumber];
    }
    if(this.classList.contains('score2')){
        secondDiv=this;
        firstDiv=document.querySelectorAll('.score1')[divNumber];
    }
    newPrediction={
        id:lastId,
        userId:id,
        predictionDate:new Date(),
        predictionId:divNumber,
        score1:firstDiv.innerHTML,
        score2:secondDiv.innerHTML
    }
    if(newPrediction.score1>=0 && newPrediction.score1<=20 && newPrediction.score2>=0 && newPrediction.score2<=20 && newPrediction.score1!=='' && newPrediction.score2!==''){
        lastId++;
        var ajaxRequest=new XMLHttpRequest();
        ajaxRequest.open("POST", "/submitPredictions", true);
        ajaxRequest.setRequestHeader('Content-Type','application/json');
        ajaxRequest.send(JSON.stringify(newPrediction));
    }
}
function findDivNumber(div,className){
    let list=document.getElementsByClassName(className);
    let nr=0;
    for(let d in list){
        if(d==div){
            return nr;
        }
        else nr++;
    }
}

function inactivity(){
    var secondsOfInactivity=0;
    const maxSeconds=5;
    var show=document.getElementById("inactivityDiv");
    show.style.display="none";
    setInterval(function(){
        secondsOfInactivity++;
        if(secondsOfInactivity>maxSeconds){
            show.style.display="initial";
            show.style.opacity="0.7";
            show.innerText=secondsOfInactivity+" seconds of inactivity";
        }
    },1000)

    function resetInactivity(){
        secondsOfInactivity=0;
        show.style.display="none";
    }

    var events=['mousedown', 'mousemove', 'keydown',
    'scroll', 'touchstart'];

    events.forEach(function(eventName) {
        document.addEventListener(eventName, resetInactivity, true);
    });
}