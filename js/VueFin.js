var VueFin = function()
{
    var htmlFin;

    function initialiser()
    {
        messageFin = document.querySelector("#page-fin").innerHTML;
        resultatsJoueur = document.querySelector("#resultats-joueur").innerHTML;
        resultatsAdversaire = document.querySelector("#resultats-adversaire").innerHTML;
    }

    this.afficher = function(texteFin, joueurs)
    {
        document.querySelector("body").innerHTML = messageFin.replace("{texte-fin-partie}", texteFin);

        document.querySelector("body").innerHTML += resultatsJoueur.replace("{texte-joueur}", "Joueur: " + joueurs[0].nom + " /Points: " + joueurs[0].points);
        document.querySelector("body").innerHTML += resultatsAdversaire.replace("{texte-adversaire}", "Opposant: " + joueurs[1].nom + " /Points: " + joueurs[1].points); 
    }

    initialiser();
}