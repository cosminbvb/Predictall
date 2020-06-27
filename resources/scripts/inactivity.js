window.onload=function(){
    inactivity();
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

