var JeuAero = function(nomJoueur, nomAdversaire, serveurJeu, ordreJoueur)
{
    var TOUCHE_GAUCHE = 37;
    var TOUCHE_HAUT = 38;
    var TOUCHE_DROITE = 39;

    var NOMBRE_PIECES = 30;
    var POINTS_PIECE = 10;
    var BONUS_PREMIER = 100;
    var TICKER = 60;
    var INTENSITE_PESANTEUR = 9.81;
    var TIMER = 200;
    var REPARTITION_PIECES_X = 15000;
    var REPARTITION_PIECES_Y = 500;
    var arrierePlan;
    var vitesseArrierePlan;
    var scene;
    var ctx;
    var joueur;
    var adversaire;
    var testChargement;
    var touches = {};
    var tableauObstacles = [];
    var conteneurInterface;
    var affichageTimer;
    var tempsRestant;
    var affichageNomJoueur;
    var imageArrivee;

    //Variables multijoueur
    var joueurArrive;
    var adversaireArrive;
    var partieTerminee;
    var pieces;
    var nomGagnant = "";
    var pointsJoueur = 0;
    var pointsAdversaire = 0;
    var vitesseXJoueur;
    var vitesseYJoueur;
    var positionJoueur;
    var positionAdversaire;

    const VARIABLE_LISTE_PIECES = "variable_liste_pieces";
    const APPUI_TOUCHE = "touche-enfoncee";
    const RELEVEMENT_TOUCHE = "touche-relevee";
    const RAMASSAGE_PIECE = "joueur-ramasse";
    const MOUVEMENT_ADVERSAIRE = "mouvement-adversaire";
    const JOUEUR_ARRIVE = "joueur-arrive";

    function initialiser()
    {
        serveurJeu.recevoirVariable = recevoirVariable;

        if(ordreJoueur == 1)
        {
            creerPositionPieces();
        }

        var ecranJeu = document.querySelector("#ecran-jeu");
        ctx = ecranJeu.getContext('2d');
        scene = new createjs.Stage(ecranJeu);
        createjs.Ticker.setFPS(TICKER);

        occuperEspaceEcran();

        vitesseArrierePlan = 0;
        vitesseYJoueur = 0;
        var tempsDebut = (new Date()).getTime();
        var tempsEnLair = tempsDebut;

        partieTerminee = false;
        var joueurArrive = false;
        var adversaireArrive = false;

        //Positions et vitesses initiales
        vitesseXJoueur = vitesseXAdversaire = 15;
        positionJoueur = positionAdversaire = {x: ecranJeu.width/3 ,y: ecranJeu.height/2};

        creerInterface();

        //Rafraichit la scène
        createjs.Ticker.addEventListener("tick", rafraichir);

        function rafraichir(evenementTick)
        {
            //Calcul du temps écoulé
            tempsActuel = (new Date()).getTime();
            var temps = (tempsActuel-tempsEnLair)/1000;
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

            if(partieTerminee)
            {
                createjs.Ticker.removeEventListener("tick", rafraichir);
                window.location = (nomGagnant == nomJoueur) ? "#fin-partie-gagnee" : "#fin-partie-perdue";
            }

            //Appliquer la gravité
            if(!joueur.estAuSol())
            {
                vitesseYJoueur += 0.5 * INTENSITE_PESANTEUR * (temps*temps);
                //console.log("VITESSE JOUEUR EN Y : " + vitesseYJoueur);
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
            if (touches[TOUCHE_HAUT])
            { 
                if(joueur.estAuSol())
                {
                    vitesseYJoueur = 0.5 * INTENSITE_PESANTEUR * (temps*temps) - 15;
                    joueur.sauter(vitesseYJoueur);
                    tempsEnLair =  (new Date()).getTime();
                    joueur.setAuSol(false);
                }
            }

            //DETECTION COLLISION
            for (var i = 0; i < pieces.length; i++)
            {
                if (gererCollisionPiece(joueur.getRectangle(), pieces[i].getRectangle()))
                {
                    console.log("Le joueur a touché la piece");
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

        ajouterEvenementsTouches();
        arrierePlan = new ArrierePlan(scene);
        joueur = new Joueur(scene, positionJoueur);
        adversaire = new Joueur(scene, positionAdversaire);
        sol = new createjs.Rectangle(0,750,1000,100);
        arrivee = new Arrivee(scene, {x: REPARTITION_PIECES_X, y: 0});

        //Vérification du chargement du poteau
        testChargement = setInterval(testerChargement, 100);
    }

    function creerPositionPieces()
    {
        var positionsPieces = new Array();
        for(var i = 0; i < NOMBRE_PIECES; i++)
        {
            positionsPieces.push({x: getNombreAleatoire(REPARTITION_PIECES_X), y: getNombreAleatoire(REPARTITION_PIECES_Y)});
        }
        serveurJeu.posterVariableTextuelle(nomJoueur + "=>" + VARIABLE_LISTE_PIECES, JSON.stringify(positionsPieces));
    }

    function appliquerListePieces(listePieces)
    {
        pieces = new Array();
        for(var i = 0; i < NOMBRE_PIECES; i++)
        {
            pieces.push(new Piece(scene, listePieces[i]));
        }
    }

    function getNombreAleatoire(valeurMax)
    {
        return (Math.floor(Math.random() * valeurMax));
    }

    function ajouterEvenementsTouches()
    {
        //APPUI SUR UNE TOUCHE
        window.addEventListener("keydown", gererToucheEnfoncee);
        //AU RELEVEMENT D'UNE TOUCHE
        window.addEventListener("keyup", gererToucheRelevee);
    }

    function gererToucheRelevee(evenement)
    {
        serveurJeu.posterVariableNumerique(nomJoueur + "=>" + RELEVEMENT_TOUCHE, evenement.keyCode);
    }

    function gererToucheEnfoncee(evenement)
    {
        serveurJeu.posterVariableNumerique(nomJoueur + "=>" + APPUI_TOUCHE, evenement.keyCode);
    }
    
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
    
    function afficherJoueursEtArrierePlan()
    {
        arrierePlan.afficher();
        arrivee.afficher();
        adversaire.afficher();
        joueur.afficher();
    }

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

    function gererArrivee(rectangleJoueur)
    {
        return (rectangleJoueur.x + rectangleJoueur.width >= arrivee.getPosition().x && !joueurArrive) ?  true : false;
    }

    function occuperEspaceEcran()
    {
        var canvas = document.querySelector("#ecran-jeu");
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function gererTranslationObjets()
    {
        for (var i = 0; i < pieces.length; i++)
        {
            pieces[i].animer(vitesseArrierePlan);
        }
        arrierePlan.animer(vitesseArrierePlan, vitesseXJoueur);
    }

    function creerInterface()
    {
        conteneurInterface = new createjs.Container();
        affichageTimer = new createjs.Text("Temps restant: ", "30px Arial", "#000000");
        affichageTimer.x = 25;
        affichageTimer.y = 20;

        affichageNomJoueur = new createjs.Text("Joueur: " + nomJoueur, "30px Arial", "#000000");
        affichageNomJoueur.x = 25;
        affichageNomJoueur.y = 100;
        affichagePointsJoueur = new createjs.Text("Points: " + pointsJoueur, "30px Arial", "#000000");
        affichagePointsJoueur.x = 25;
        affichagePointsJoueur.y = 140;

        affichageNomAdversaire = new createjs.Text("Opposant: " + nomAdversaire, "30px Arial", "#000000");
        affichageNomAdversaire.x = 25;
        affichageNomAdversaire.y = 200;
        affichagePointsAdversaire = new createjs.Text("Points: " + pointsAdversaire, "30px Arial", "#000000");
        affichagePointsAdversaire.x = 25;
        affichagePointsAdversaire.y = 240;

        conteneurInterface.addChild(affichageTimer);
        conteneurInterface.addChild(affichagePointsJoueur);
        conteneurInterface.addChild(affichageNomJoueur);
        conteneurInterface.addChild(affichageNomAdversaire);
        conteneurInterface.addChild(affichagePointsAdversaire);

        scene.addChild(conteneurInterface);
    }

    //FIN DE PARTIE
    function finirPartieJoueur()
    {
        serveurJeu.posterVariableBooleenne(nomJoueur + "=>" + JOUEUR_ARRIVE, true);
    }

    //RAMASSAGE DE PIECES
    function ramasserPieceJoueur(indexPiece)
    {
        serveurJeu.posterVariableNumerique(nomJoueur + "=>" + RAMASSAGE_PIECE, indexPiece);
    }

    function notifierPositionJoueur()
    {
        serveurJeu.posterVariableTextuelle(nomJoueur + "=>" + MOUVEMENT_ADVERSAIRE, JSON.stringify(joueur.getPosition()));
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

    var recevoirVariable = function(variable)
    {
        var cle = identifierComposantCleVariable(variable.cle);
        //console.log("Surcharge de recevoirVariable " + variable.cle + " = " + variable.valeur);
        if(cle.pseudonyme == nomJoueur)
        {
          switch(cle.nom)
          {
            case APPUI_TOUCHE:
                //Le serveur ne fait que valider l'appui sur une touche, le mouvement se fait dans rafraichir sinon la fluidité du mouvement est perdue
                touches[variable.valeur] = true;
                break;
            case RELEVEMENT_TOUCHE:
                effectuerArretJoueur(variable.valeur);
                break;
            case RAMASSAGE_PIECE:
                effectuerRamassage(variable.valeur, nomJoueur);
                break;
            case JOUEUR_ARRIVE:
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
            case APPUI_TOUCHE:
                effectuerDeplacementAdversaire(variable.valeur);
                break;
            case RELEVEMENT_TOUCHE:
                adversaire.attendre();
                break;
            case RAMASSAGE_PIECE:
                effectuerRamassage(variable.valeur, nomAdversaire);
                break;
            case MOUVEMENT_ADVERSAIRE:
                positionAdversaire = JSON.parse(variable.valeur);
                break;
            case JOUEUR_ARRIVE:
                effectuerArrivee(nomAdversaire);
                break;
            default:
              break;
          }
        }
        switch(cle.nom)
        {
            case VARIABLE_LISTE_PIECES:
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

        console.log(nom + " est arrivé !");
        verifierFinPartie();
    }

    function verifierFinPartie()
    {
        if(joueurArrive && adversaireArrive)
        {
            partieTerminee = true;
            nomGagnant = (pointsJoueur > pointsAdversaire) ? nomJoueur : nomAdversaire;
            console.log("Le gagnant est " + nomGagnant);
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