(function application()
{
    var vueAccueil;
    var vueJeu;
    var vueFin;

    var jeu;
    var nomJoueur;

    function initialiser()
    {
        vueAccueil = new VueAccueil(enregistrerJoueur);
        vueJeu = new VueJeu();
        vueFin = new VueFin();

        vueAccueil.afficher();

        nomJoueur = "";

        window.addEventListener("hashchange", naviguer);
    }

    function naviguer()
    {
        var hash = window.location.hash;
        console.log("naviguer", hash);

        if(hash.match(/^#accueil/))
        {
            vueAccueil.afficher();
        }
        else if(hash.match(/^#jouer/))
        {
            lancerJeu();
        }
        else if(hash.match(/^#fin-partie-gagnee/))
        {
            vueFin.afficher("Bravo ! Vous avez récolté toutes les émeraudes disséminées" +
                " sur les toits de la ville. Mais continuez de courir, d'autres sont à votre poursuite !!");
        }
        else if(hash.match(/^#fin-partie-perdue/))
        {
            vueFin.afficher("Dommage pour vous...Vous n'avez pas eu de chance cette fois-ci. Soyez plus rapide !");
        }
    }

    function lancerJeu()
    {
        vueJeu.afficher();
        jeu = new JeuAero(nomJoueur);
    }

    function enregistrerJoueur(nomJoueurEntre)
    {
        console.log("enregistrerJoueur");
        nomJoueur = nomJoueurEntre;
    }

    document.addEventListener("DOMContentLoaded", initialiser);

})();