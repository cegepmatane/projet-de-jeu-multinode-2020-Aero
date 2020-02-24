var Obstacle = function(x, y, width, height, scene)
{
    const UNITE_DISTANCE = 50;

    //Couleur orange-dorée
    var couleur = "#fcad03";
    var shape;
    // this.longueur = longueur * UNITE_DISTANCE;
    // this.largeur = largeur * UNITE_DISTANCE;

    function intialiser()
    {
        shape = new createjs.Shape();
        shape.graphics.beginFill(couleur).drawRect(x, y, width*UNITE_DISTANCE, height*UNITE_DISTANCE).endStroke();
    }

    this.afficher = function()
    {
        scene.addChild(shape);
        console.log("affichage d'un obstacle");
    }

    this.animer = function(vitesse)
    {
        //Si on avance
        if (vitesse < 0)
        {
            shape.x -= 10;
        }
        else if (vitesse > 0)
        {
            shape.x += 10;
        }
    }

    intialiser();
}