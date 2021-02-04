var Piece = function(scene, position)
{
    var imagePiece;
    var spriteSheetPiece;
    var spritePiece;
    var charge;

    function initialiser()
    {
        imagePiece = new Image();
        imagePiece.onload = creerSpriteSheet;
        imagePiece.src = "img/PieceAnimations.png";
        charge = false;
    }

    function creerSpriteSheet(evenementOnload)
    {
        //Création de la spritesheet à partir de l'image
        spriteSheetPiece = new createjs.SpriteSheet(
        {
            images: [imagePiece],
            frames:
            {
                width: 221,
                height: 421
            },
            animations:
            {
                tourner:
                {
                    frames: [0,1,2,1]
                }
            },
            framerate: 4
        });
        console.log("Spritesheet Piece créée");

        creerSprite();
    }

    function creerSprite()
    {
        //Création du sprite, ajustement du scale et des frontieres
        spritePiece = new createjs.Sprite(spriteSheetPiece, "tourner");

        //Positionnement
        spritePiece.x = position.x;
        spritePiece.y = position.y;

        spritePiece.scaleX = spritePiece.scaleY = 0.4;
    
        //Pour les collisions :
        spritePiece.setBounds(spritePiece.x, spritePiece.y, 221 * spritePiece.scaleX, 421 * spritePiece.scaleY);
        console.log("Sprite de la piece créée");

        charge = true;
        //afficher();
    }

    this.afficher = function()
    {
         //Ajout du sprite à la scène
         console.log("piece-->afficher");
         scene.addChild(spritePiece);
    }

    this.disparaitre = function()
    {
        scene.removeChild(spritePiece);
    }

    this.estCharge = function()
    {
        return charge;
    }

    this.animer = function(vitesse)
    {
        //Si on avance
        if (vitesse < 0)
        {
            spritePiece.x -= 0;
        }
        else if (vitesse > 0)
        {
            spritePiece.x += 0;
        }
    }

    this.getRectangle = function()
    {
        var rectangle = {
            x: spritePiece.x,
            y: spritePiece.y,
            width: spritePiece.getBounds().width,
            height: spritePiece.getBounds().height
        };

        return rectangle;
    }

    initialiser();
}