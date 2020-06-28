function isColor(strColor){
    var s = new Option().style;
    s.color = strColor;
    return s.color == strColor;
  }
function changeBackground(){
    let input=document.getElementById("changeBackground");
    let color=input.value;
    let body=document.body;
    if(isColor(color)){
        body.style.backgroundColor=color;
        localStorage.setItem("backgroundColor", color);
    }
    else{
        alert("Invalid color");
    }
}