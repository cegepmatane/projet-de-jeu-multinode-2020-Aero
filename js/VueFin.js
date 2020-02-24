var VueFin = function()
{
    var htmlFin;

    function initialiser()
    {
        htmlFin = document.querySelector("#page-fin").innerHTML;
    }

    this.afficher = function(texte)
    {
        document.querySelector("body").innerHTML = htmlFin.replace("{texte-fin-partie}", texte);
    }

    initialiser();
}