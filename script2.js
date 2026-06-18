let click = 0;

function color() {

  if (click % 2 == 0) {
    // mode sombre
    document.body.style.backgroundColor = "black";
    document.body.style.color = "white";

    let btn = document.getElementById("button");
    
    btn.style.backgroundColor = "white";
    btn.style.color = "black";
    btn.textContent = "Noir";
    document.getElementById("click_me").style.color = "yellow";
    alert("La page change de couleur");

    click = click + 1;
  } 
  else {
    // mode clair
    document.body.style.backgroundColor = "white";
    document.body.style.color = "black";

    let btn = document.getElementById("button");
    
    btn.style.backgroundColor = "black";
    btn.style.color = "white"; 
    btn.textContent = "Blanc";
    document.getElementById("click_me").style.color = "deeppink";

    alert("La page change de couleur");

    click = click + 1;
  }
}
