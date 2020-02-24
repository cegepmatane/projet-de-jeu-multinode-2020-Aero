var VueJeu = function()
{
    var htmlJeu;

    function initialiser()
    {
        htmlJeu = document.querySelector("#page-jeu").innerHTML;
    }

    this.afficher = function()
    {
        document.querySelector("body").innerHTML = htmlJeu;
    }

    initialiser();
}