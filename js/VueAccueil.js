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
        formulaireJoueur = document.querySelector("#formulaire-joueur");
        nomJoueur = document.querySelector("#nom-joueur");

        document.addEventListener("submit", enregistrerJoueurEntre);
    }

    function enregistrerJoueurEntre(evt)
    {
        console.log("enregistrerJoueurEntre");
        evt.preventDefault();
        
        //Ici, la méthode appelée est une méthode application.js qui a été donnée en référence à cette vue lors de sa création.
        //enregistrerJoueur est déclarée dans application.js
        enregistrerJoueur(nomJoueur.value);
    }


    initialiser();
}