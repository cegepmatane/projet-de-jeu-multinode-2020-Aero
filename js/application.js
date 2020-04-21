(function application()
{
    var vueAccueil;
    var vueJeu;
    var vueFin;

    var jeu;
    var nomJoueur;
    var nomAdversaire;
    var ordreJoueur;
    var serveurJeu;
    var multijoueur;

    function initialiser()
    {
        console.log("initialiser()");
        serveurJeu = new MultiNode();

        serveurJeu.confirmerConnexion = confirmerConnexion;
        serveurJeu.confirmerAuthentification = confirmerAuthentification;
        serveurJeu.apprendreAuthentification = apprendreAuthentification;

        serveurJeu.connecter();

        vueAccueil = new VueAccueil(enregistrerJoueur);
        vueJeu = new VueJeu();
        vueFin = new VueFin();

        vueAccueil.afficher();

        //multijoueur = new Multijoueur();
        nomJoueur = "";
        nomAdversaire = "";
        ordreJoueur = 0;

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
            //lancerJeu();
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
        jeu = new JeuAero(nomJoueur, nomAdversaire, serveurJeu, ordreJoueur);
    }

    function enregistrerJoueur(nomJoueurEntre)
    {
      nomJoueur = nomJoueurEntre;
      console.log("Le joueur s'appelle " + nomJoueur);
      serveurJeu.demanderAuthentification(nomJoueur);
    }
            
    var confirmerConnexion = function()
    {
        console.log("Je suis connecte.");
    }

    var confirmerAuthentification = function(listePseudo)
    {
        console.log("Je suis authentifie.");
        console.log("Les autres participants sont " + JSON.stringify(listePseudo));
        if(listePseudo.length > 0)
        {
          nomAdversaire = listePseudo[0];
          ordreJoueur = 2;
        }
        else
        {
          ordreJoueur = 1;
        }
        validerDebutPartie();
    }

    var apprendreAuthentification = function(pseudonyme)
    {
        console.log("Nouvel opposant :  " + pseudonyme);
        nomAdversaire = pseudonyme;
        validerDebutPartie();
    }
    
    function validerDebutPartie()
    {
        if(nomAdversaire != "" && nomJoueur != "")
        {
            console.log("Début de la partie");
            lancerJeu();
        }
    }

    document.addEventListener("DOMContentLoaded", initialiser);

})();