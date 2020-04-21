var JeuAero = function(nomJoueur, nomAdversaire, serveurJeu, ordreJoueur)
{
    var TOUCHE_GAUCHE = 37;
    var TOUCHE_HAUT = 38;
    var TOUCHE_DROITE = 39;
    var NOMBRE_PIECES = 10;
    var POINTS_PIECE = 10;
    var TICKER = 60;
    var INTENSITE_PESANTEUR = 9.81;
    var TIMER = 100;
    var REPARTITION_PIECES_X = 5000;
    var REPARTITION_PIECES_Y = 500;
    var vitesseXJoueur;
    var vitesseYJoueur;
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

    //Variables multijoueur
    var joueurArrive = false;
    var adversaireArrive = false;
    var partieTerminee = false;
    var pieces;
    var nomGagnant = "";
    var pointsJoueur = 0;
    var pointsAdversaire = 0;
    var posJoueurX;
    var posJoueurY;
    var posAdversaireX;
    var posAdversaireY;

    const VARIABLE_LISTE_PIECES = "variable_liste_pieces";

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
        vitesseXJoueur = 15;

        creerInterface()

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
            if (touches[TOUCHE_DROITE])
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

            scene.setChildIndex(conteneurInterface, 1);
            scene.update(evenementTick);
        }

        ajouterEvenementsTouches();
        arrierePlan = new ArrierePlan(scene);
        joueur = new Joueur(scene, {x: ecranJeu.width/3 ,y: ecranJeu.height/2});
        adversaire = new Joueur(scene, {x: ecranJeu.width/3 ,y: ecranJeu.height/2});
        sol = new createjs.Rectangle(0,750,1000,100);

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
        //Annulation du ralentissement/acceleration
        vitesseArrierePlan = 0;
        delete touches[evenement.keyCode];
        joueur.attendre();
    }

    function gererToucheEnfoncee(evenement)
    {
        touches[evenement.keyCode] = true;
    }
    
    function testerChargement()
    {
        if(joueur.estCharge() && adversaire.estCharge() && arrierePlan.estCharge())
        {
            afficherJoueursEtArrierePlan();
            for (var i = 0; i < NOMBRE_PIECES; i++)
            {
                if(pieces[i].estCharge()){  pieces[i].afficher();   }
            }
            clearInterval(testChargement);
        }
    }
    
    function afficherJoueursEtArrierePlan()
    {
        arrierePlan.afficher();
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
        affichageTimer.y = 60;
        affichageNomJoueur = new createjs.Text("Joueur: ", "30px Arial", "#000000");
        affichageNomJoueur.set({text: "Joueur: " + nomJoueur});
        affichageNomJoueur.x = 25;
        affichageNomJoueur.y = 20;
        affichagePoints = new createjs.Text("Points: ", "30px Arial", "#000000");
        affichagePoints.x = 25;
        affichagePoints.y = 100;

        conteneurInterface.addChild(affichageTimer);
        conteneurInterface.addChild(affichagePoints);
        conteneurInterface.addChild(affichageNomJoueur);

        scene.addChild(conteneurInterface);
    }

    //FIN DE PARTIE
    function finirPartieJoueur()
    {
        serveurJeu.posterVariableBooleenne(nomJoueur + "=>" + "joueur-arrive", true);
    }

    //RAMASSAGE DE PIECES
    function ramasserPieceJoueur(indexPiece)
    {
        serveurJeu.posterVariableNumerique(nomJoueur + "=>" + "joueur-ramasse", indexPiece);
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
            case "touche-enfoncee":
                effectuerDeplacementJoueur(variable.valeur);
                break;
            case "joueur-ramasse":
                effectuerRamassage(variable.valeur, nomJoueur);
                break;
            default:
              break;
          }
        }
        else if (cle.pseudonyme == nomAdversaire)
        {
          switch(cle.nom)
          {
            case "touche-enfoncee":
              effectuerDeplacementAdversaire(variable.valeur);
              break;
            case "joueur-ramasse":
                effectuerRamassage(variable.valeur, nomAdversaire);
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

        //effectuerAugmentationPointage(POINTS_PIECE, nom);
    }

    function effectuerAugmentationPointage(valeur, nom)
    {
        (nom == nomJoueur) ? pointsJoueur = valeur : pointsAdversaire = valeur;
        actualiserPoints();
    }

    initialiser();
}