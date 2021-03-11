var JeuAero = function(nomJoueur, nomAdversaire, serveurJeu, ordreJoueur)
{
    const VARIABLE = 
    {
        LISTE_PIECES: "liste-pieces",
        APPUI_TOUCHE: "appui-touche",
        RELEVEMENT_TOUCHE: "relevement-touche",
        RAMASSAGE_PIECE: "ramassage-piece",
        MOUVEMENT_ADVERSAIRE: "mouvement-adversaire",
        JOUEUR_ARRIVE: "joueur-arrive"
    };
    const REPARTITION_PIECES_X = 15000;
    const REPARTITION_PIECES_Y = 500;
    const VITESSE_JOUEURS = 25;
    const NOIR = "#000000";

    const TOUCHE_GAUCHE = 37;
    const TOUCHE_HAUT = 38;
    const TOUCHE_DROITE = 39;
    const NOMBRE_PIECES = 30;
    const POINTS_PIECE = 10;
    const BONUS_PREMIER = 100;
    const TICKER = 60;
    const INTENSITE_PESANTEUR = 9.81;
    const TIMER = 200;

    var arrierePlan;
    var vitesseArrierePlan;
    var scene;
    var joueur;
    var adversaire;
    var testChargement;
    var touches = {};
    var conteneurInterface;
    var affichageTimer;
    var tempsRestant;
    var affichageNomJoueur;
   //var imageArrivee;

    //Variables multijoueur
    var joueurArrive;
    var adversaireArrive;
    var partieTerminee;
    var pieces;
    var nomGagnant = "";
    var pointsJoueur = 0;
    var pointsAdversaire = 0;
    var vitesseXJoueur;
    var vitesseXAdversaire;
    var vitesseYJoueur;
    var vitesseYAdversaire;
    var positionJoueur;
    var positionAdversaire;

    function initialiser()
    {
        serveurJeu.recevoirVariable = recevoirVariable;

        if(ordreJoueur == 1){   creerPositionPieces();    }

        var ecranJeu = document.querySelector("#ecran-jeu");
        scene = new createjs.Stage(ecranJeu);
        createjs.Ticker.setFPS(TICKER);

        occuperEspaceEcran();
        creerInterface();

        partieTerminee = false;
        joueurArrive = false;
        adversaireArrive = false;
        vitesseArrierePlan = 0;
        vitesseYJoueur = 0;
        var tempsDebut = (new Date()).getTime();
        var tempsDeSaut = 0;
        var momentSaut = tempsDebut;

        //Positions et vitesses initiales
        vitesseXJoueur = vitesseXAdversaire = VITESSE_JOUEURS;
        positionJoueur = positionAdversaire = {
            x: ecranJeu.width/3,
            y: ecranJeu.height/2
        };

        //Rafraichit la scène
        createjs.Ticker.addEventListener("tick", rafraichir);

        function rafraichir(evenementTick)
        {
            //Calcul du temps écoulé depuis le début de la partie
            tempsActuel = (new Date()).getTime();

            //Vérification de l'état de la partie
            if(partieTerminee)
            {
                createjs.Ticker.removeEventListener("tick", rafraichir);
                window.location = (nomGagnant == nomJoueur) ? "#fin-partie-gagnee" : "#fin-partie-perdue";
            }
            else
            {
                //Calcul du timer
                tempsRestant = TIMER - ((tempsActuel-tempsDebut)/1000);
                if(tempsRestant <= 0)
                {
                    createjs.Ticker.removeEventListener("tick", rafraichir);
                    window.location = "#fin-partie-perdue";
                }
                else
                {
                    affichageTimer.set({text: "Temps restant: "+Math.floor(tempsRestant) + "s"});
                }
            }

            //Appliquer la gravité
            if(!joueur.estAuSol())
            {
                //Temps depuis que le joueur a sauté
                tempsDeSaut = (tempsActuel-momentSaut)/1000;
                vitesseYJoueur += 0.5 * INTENSITE_PESANTEUR * (tempsDeSaut*tempsDeSaut);
                joueur.tomber(vitesseYJoueur);
            }
            if (touches[TOUCHE_GAUCHE])
            {
                scene.x += vitesseXJoueur;
                conteneurInterface.x -= vitesseXJoueur;
                joueur.reculer(vitesseXJoueur);
                vitesseArrierePlan = 5;
                gererTranslationObjets();
            }
            if(touches[TOUCHE_DROITE])
            {
                scene.x -= vitesseXJoueur;
                conteneurInterface.x += vitesseXJoueur;
                joueur.avancer(vitesseXJoueur);
                vitesseArrierePlan = -5;
                gererTranslationObjets();
            }

            if (touches[TOUCHE_HAUT] && joueur.estAuSol())
            { 
                tempsDeSaut = 0;
                momentSaut =  (new Date()).getTime();

                vitesseYJoueur = -15;
                joueur.sauter(vitesseYJoueur);
                joueur.setAuSol(false);
            }

            //DETECTION COLLISION
            for (var i = 0; i < pieces.length; i++)
            {
                if (gererCollisionPiece(joueur.getRectangle(), pieces[i].getRectangle()))
                {
                    //console.log("Le joueur a touché la piece");
                    ramasserPieceJoueur(i);
                }
            }

            if(gererCollisionSol(joueur.getRectangle()))
            {
                vitesseYJoueur = 0;
                joueur.setAuSol(true);
            }

            if(arrivee.estCharge() && gererArrivee(joueur.getRectangle()))
            {
                finirPartieJoueur();
            }

            if(adversaire.estCharge())
            {
                notifierPositionJoueur();
                adversaire.setPosition(positionAdversaire);
            }

            scene.setChildIndex(conteneurInterface, 1);
            scene.update(evenementTick);
        }

        //APPUI SUR UNE TOUCHE
        window.addEventListener("keydown", gererToucheEnfoncee);
        //AU RELEVEMENT D'UNE TOUCHE
        window.addEventListener("keyup", gererToucheRelevee);

        //Création des éléments de la scène
        arrierePlan = new ArrierePlan(scene);
        joueur = new Joueur(scene, positionJoueur);
        adversaire = new Joueur(scene, positionAdversaire);
        sol = new createjs.Rectangle(0,750,1000,100);
        arrivee = new Arrivee(scene, {x: REPARTITION_PIECES_X, y: 0});

        //Vérification du chargement du poteau
        testChargement = setInterval(testerChargement, 100);
    }

    function occuperEspaceEcran()
    {
        var canvas = document.querySelector("#ecran-jeu");
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    //CHARGEMENT DES ELEMENTS
    function testerChargement()
    {
        if(joueur.estCharge() && adversaire.estCharge() && arrierePlan.estCharge() && arrivee.estCharge())
        {
            afficherJoueursEtArrierePlan();
            for (var i = 0; i < pieces.length; i++)
            {
                if(pieces[i].estCharge()){  pieces[i].afficher();   }
            }
            clearInterval(testChargement);
        }
    }

    function creerInterface()
    {
        conteneurInterface = new createjs.Container();
        affichageTimer = new createjs.Text("Temps restant: ", "30px Arial", NOIR);
        affichageTimer.x = 25;
        affichageTimer.y = 20;

        affichageNomJoueur = new createjs.Text("Joueur: " + nomJoueur, "30px Arial", NOIR);
        affichageNomJoueur.x = 25;
        affichageNomJoueur.y = 100;
        affichagePointsJoueur = new createjs.Text("Points: " + pointsJoueur, "30px Arial", NOIR);
        affichagePointsJoueur.x = 25;
        affichagePointsJoueur.y = 140;

        affichageNomAdversaire = new createjs.Text("Opposant: " + nomAdversaire, "30px Arial", NOIR);
        affichageNomAdversaire.x = 25;
        affichageNomAdversaire.y = 200;
        affichagePointsAdversaire = new createjs.Text("Points: " + pointsAdversaire, "30px Arial", NOIR);
        affichagePointsAdversaire.x = 25;
        affichagePointsAdversaire.y = 240;

        conteneurInterface.addChild(affichageTimer);
        conteneurInterface.addChild(affichagePointsJoueur);
        conteneurInterface.addChild(affichageNomJoueur);
        conteneurInterface.addChild(affichageNomAdversaire);
        conteneurInterface.addChild(affichagePointsAdversaire);

        scene.addChild(conteneurInterface);
    }

    function afficherJoueursEtArrierePlan()
    {
        arrierePlan.afficher();
        arrivee.afficher();
        adversaire.afficher();
        joueur.afficher();
    }

    
    //GESTION DES COLLISIONS
    function gererCollisionPiece(rectangleJoueur, rectanglePiece)
	{
		if(rectangleJoueur.x >= rectanglePiece.x + rectanglePiece.width ||
			rectangleJoueur.x + rectangleJoueur.width <= rectanglePiece.x ||
			rectangleJoueur.y >= rectanglePiece.y + rectanglePiece.height ||
			rectangleJoueur.y + rectangleJoueur.height <= rectanglePiece.y)
		{
			return false;
		}
		else
		{
			return true;
        }
    }

    function gererCollisionSol(rectangleJoueur)
    {
        return (rectangleJoueur.y + rectangleJoueur.height <= sol.y) ?  false : true;
    }

    function gererTranslationObjets()
    {
        for (var i = 0; i < pieces.length; i++)
        {
            pieces[i].animer(vitesseArrierePlan);
        }
        arrierePlan.animer(vitesseArrierePlan, vitesseXJoueur);
    }

    function gererArrivee(rectangleJoueur)
    {
        return (rectangleJoueur.x + rectangleJoueur.width >= arrivee.getPosition().x && !joueurArrive) ?  true : false;
    }

    /**
     * 
     * ENVOI DE VARIABLES AU SERVEUR 
     *
    */

    //MANIPULATION DU TABLEAU DE PIECES
    function creerPositionPieces()
    {
        var positionsPieces = new Array();
        for(var i = 0; i < NOMBRE_PIECES; i++)
        {
            positionsPieces.push({x: getNombreAleatoire(REPARTITION_PIECES_X),
                                 y: getNombreAleatoire(REPARTITION_PIECES_Y)});
        }
        serveurJeu.posterVariableTextuelle(nomJoueur + "=>" + VARIABLE.LISTE_PIECES, JSON.stringify(positionsPieces));
    }

    function getNombreAleatoire(valeurMax){
        return Math.floor(Math.random() * valeurMax);
    }

    //GESTION DES INPUTS LOCAUX
    function gererToucheRelevee(evenement)
    {
        serveurJeu.posterVariableNumerique(nomJoueur + "=>" + VARIABLE.RELEVEMENT_TOUCHE, evenement.keyCode);
    }
    function gererToucheEnfoncee(evenement)
    {
        serveurJeu.posterVariableNumerique(nomJoueur + "=>" + VARIABLE.APPUI_TOUCHE, evenement.keyCode);
    }

    //RAMASSAGE DE PIECES
    function ramasserPieceJoueur(indexPiece)
    {
        serveurJeu.posterVariableNumerique(nomJoueur + "=>" + VARIABLE.RAMASSAGE_PIECE, indexPiece);
    }

    //DEPLACEMENT DE L'ADVERSAIRE
    function notifierPositionJoueur()
    {
        serveurJeu.posterVariableTextuelle(nomJoueur + "=>" + VARIABLE.MOUVEMENT_ADVERSAIRE, JSON.stringify(joueur.getPosition()));
    }

    //FIN DE PARTIE
    function finirPartieJoueur()
    {
        serveurJeu.posterVariableBooleenne(nomJoueur + "=>" + VARIABLE.JOUEUR_ARRIVE, true);
    }

    function identifierComposantCleVariable(cleVariable)
    {
      var composantCle = cleVariable.split('=>');
      var cle = {
          pseudonyme : composantCle[0],
          nom : composantCle[1]
      }
      return cle;
    }

    /**
     * 
     * RECEPTION DES VARIABLES ET ACTIONS
     * 
    */

    var recevoirVariable = function(variable)
    {
        var cle = identifierComposantCleVariable(variable.cle);
        //console.log("Surcharge de recevoirVariable " + variable.cle + " = " + variable.valeur);
        if(cle.pseudonyme == nomJoueur)
        {
          switch(cle.nom)
          {
            case VARIABLE.APPUI_TOUCHE:
                //Le serveur ne fait que valider l'appui sur une touche, le mouvement se fait dans rafraichir sinon la fluidité du mouvement est perdue
                touches[variable.valeur] = true;
                break;
            case VARIABLE.RELEVEMENT_TOUCHE:
                effectuerArretJoueur(variable.valeur);
                break;
            case VARIABLE.RAMASSAGE_PIECE:
                effectuerRamassage(variable.valeur, nomJoueur);
                break;
            case VARIABLE.JOUEUR_ARRIVE:
                effectuerArrivee(nomJoueur);
                break;
            default:
              break;
          }
        }
        else if (cle.pseudonyme == nomAdversaire)
        {
          switch(cle.nom)
          {
            case VARIABLE.APPUI_TOUCHE:
                effectuerDeplacementAdversaire(variable.valeur);
                break;
            case VARIABLE.RELEVEMENT_TOUCHE:
                adversaire.attendre();
                break;
            case VARIABLE.RAMASSAGE_PIECE:
                effectuerRamassage(variable.valeur, nomAdversaire);
                break;
            case VARIABLE.MOUVEMENT_ADVERSAIRE:
                positionAdversaire = JSON.parse(variable.valeur);
                break;
            case VARIABLE.JOUEUR_ARRIVE:
                effectuerArrivee(nomAdversaire);
                break;
            default:
              break;
          }
        }
        switch(cle.nom)
        {
            case VARIABLE.LISTE_PIECES:
                appliquerListePieces(JSON.parse(variable.valeur));
                break;
        }
    }

    function effectuerArretJoueur(valeur)
    {
        vitesseArrierePlan = 0;
        touches[valeur] = false;
        joueur.attendre();
    }

    function effectuerDeplacementAdversaire(valeur)
    {
        var codeTouche = parseInt(valeur);
        switch (codeTouche)
        {
            case TOUCHE_GAUCHE:
                adversaire.reculer(vitesseXAdversaire);
                break;
            case TOUCHE_DROITE:
                adversaire.avancer(vitesseXAdversaire);
                break;
            case TOUCHE_HAUT:
                break;
            default:
                break;
        } 
    }

    function effectuerRamassage(valeur, nom)
    {
        console.log(pieces);
        pieces[valeur].disparaitre();
        delete pieces[valeur];
        var nouveauTableauPieces = new Array();
        pieces.forEach(element => 
        {
            if(!(element == undefined))
            {
                nouveauTableauPieces.push(element);
            }
        });
        pieces = nouveauTableauPieces;
        console.log(pieces);

        effectuerAugmentationPointage(POINTS_PIECE, nom);
    }

    function appliquerListePieces(listePieces)
    {
        pieces = new Array();
        for(var i = 0; i < NOMBRE_PIECES; i++)
        {
            pieces.push(new Piece(scene, listePieces[i]));
        }
    }

    function effectuerArrivee(nom)
    {
        if(nom == nomJoueur)
        {
            joueurArrive = true;
            if(!adversaireArrive)
            {
                effectuerAugmentationPointage(BONUS_PREMIER, nom);
            }
        }
        else
        {
            adversaireArrive = true;
            if(!joueurArrive)
            {
                effectuerAugmentationPointage(BONUS_PREMIER, nom);
            }
        }
        //console.log(nom + " est arrivé !");
        verifierFinPartie();
    }

    function verifierFinPartie()
    {
        if(joueurArrive && adversaireArrive)
        {
            partieTerminee = true;
            nomGagnant = (pointsJoueur > pointsAdversaire) ? nomJoueur : nomAdversaire;
            //console.log("Le gagnant est " + nomGagnant);
        }
    }

    function effectuerAugmentationPointage(valeur, nom)
    {
        if(nom == nomJoueur)
        {
            pointsJoueur += valeur;
            affichagePointsJoueur.set({text: "Points: " + pointsJoueur});
        }
        else
        {
            pointsAdversaire += valeur;
            affichagePointsAdversaire.set({text: "Points: " + pointsAdversaire});
        }
    }

    this.getResultats = function()
    {
        return [{nom: nomJoueur, points: pointsJoueur}, {nom: nomAdversaire, points: pointsAdversaire}];
    }

    initialiser();
}