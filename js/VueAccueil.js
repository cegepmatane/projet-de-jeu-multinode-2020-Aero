var VueAccueil = function(enregistrerJoueur)
{
    var htmlAccueil;
    var formulaireJoueur;
    var nomJoueur;

    function initialiser()
    {
        htmlAccueil = document.querySelector("#page-accueil").innerHTML;
    }

    this.afficher = function()
    {
        document.querySelector("body").innerHTML = htmlAccueil;
        document.addEventListener("submit", enregistrerJoueurEntre);
    }

    function enregistrerJoueurEntre(evt)
    {
        console.log("enregistrerJoueurEntre");
        evt.preventDefault();
        
        //Ici, la méthode appelée est une méthode application.js qui a été donnée en référence à cette vue lors de sa création.
        //enregistrerJoueur est déclarée dans application.js
        enregistrerJoueur(document.querySelector("#nom-joueur").value);
    }

    this.mettreAJourTimer = function(temps)
    {
        document.getElementById("timer").innerHTML = "<p>" + temps + "</p>";
    }

    initialiser();
}