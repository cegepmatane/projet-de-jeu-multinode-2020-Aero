var Joueur = function(scene, position)
{
    var imageJoueur;
    var spriteSheetJoueur;
    var spriteJoueur;
    //Etat de chargement du joueur
    var enMouvement;
    var charge;
    var auSol;

    var LARGEUR_ENCADREMENT = 100;
    var frontiereDroite;
    var frontiereGauche;

    function initialiser()
    {
        imageJoueur = new Image();
        imageJoueur.onload = creerSpriteSheet;
        imageJoueur.src = "img/joueurAnimationsV2.png";
        charge = false;
        auSol = false;
        frontiereDroite = position.x + LARGEUR_ENCADREMENT;
        frontiereGauche = position.x - LARGEUR_ENCADREMENT;
    }

    function creerSpriteSheet(evenementOnload)
    {
        //Création de la spritesheet à partir de l'image
        spriteSheetJoueur = new createjs.SpriteSheet(
        {
            images: [imageJoueur],
            frames:
            {
                width: 625,
                height: 825
            },
            animations:
            {
                immobile:
                {
                    frames: [0,1,2,1]
                },
                avancer: 
                {
                    frames: [3,4,5,4]
                },
                reculer:
                {
                    frames: [6,7,8,7]
                }
            },
            framerate: 8
        });
        console.log("Spritesheet joueur créée");

        creerSprite();
    }

    function creerSprite()
    {
        //Création du sprite, ajustement du scale et des frontieres
        spriteJoueur = new createjs.Sprite(spriteSheetJoueur, "immobile");

        spriteJoueur.scaleX = spriteJoueur.scaleY = 0.4;
        //Pour les collisions :
        spriteJoueur.setBounds(spriteJoueur.x, spriteJoueur.y, 625 * spriteJoueur.scaleX, 825 * spriteJoueur.scaleY);
        console.log("Sprite du joueur créée");

        //Positionnement
        spriteJoueur.x = position.x;
        spriteJoueur.y = position.y;
        //console.log(scene.isVisible);

        charge = true;
        //afficher();
    }

    this.afficher = function()
    {
         //Ajout du sprite à la scène
         console.log("joueur-->afficher");
         scene.addChild(spriteJoueur);
    }

    this.estCharge = function()
    {
        return charge;
    }

    this.estAuSol = function()
    {
        return auSol;
    }

    this.setAuSol = function(valeur)
    {
        auSol = valeur;
    }

    this.getRectangle = function()
    {
        var rectangle = {
            x: spriteJoueur.x,
            y: spriteJoueur.y,
            width: spriteJoueur.getBounds().width,
            height: spriteJoueur.getBounds().height
        };

        return rectangle;
    }

    this.sauter = function(vitesse)
    {
        spriteJoueur.y += vitesse;
        //TODO ajouter l'animation
        enMouvement = true;
    }

    this.tomber = function(vitesse)
    {
        spriteJoueur.y += vitesse;
        //console.log(spriteJoueur.y);
        //TODO ajouter l'animation
    }

    this.avancer = function()
    {
        centrerDeplacement(10);
        if (!enMouvement)
        {
            spriteJoueur.gotoAndPlay("avancer");
            enMouvement = true;
        }
    }

    this.reculer = function()
    {
        centrerDeplacement(-10);
        if (!enMouvement)
        {
            spriteJoueur.gotoAndPlay("reculer");
            enMouvement = true;
        }
    }

    this.attendre = function()
    {
        spriteJoueur.gotoAndPlay("immobile");
        enMouvement = false;
    }

    //Restreindre le mouvement du joueur au centre de l'écran
    function centrerDeplacement(valeurDeplacement)
    {
        if(spriteJoueur.x <= frontiereDroite
            && spriteJoueur.x >= frontiereGauche)
        {
            spriteJoueur.x += valeurDeplacement;
            if(spriteJoueur.x >= frontiereDroite){spriteJoueur.x = frontiereDroite;}
            if(spriteJoueur.x <= frontiereGauche){spriteJoueur.x = frontiereGauche;}
        }
    }

    initialiser();
}