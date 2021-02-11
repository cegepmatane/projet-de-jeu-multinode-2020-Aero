    function Variable(type, cle, valeur)
    {
        this.type = type;
        this.cle = cle;
        this.valeur = valeur;
    }

    function MultiNode()
    {        
        var multinode = this;

        this.messageTransfertVariable = {etiquette:"TRANSFERT_VARIABLE"};
        this.messageDemandeAuthentification = {etiquette:"DEMANDE_AUTHENTIFICATION"};
        // messages recus
        this.messageNotificationAuthentification = {etiquette:"NOTIFICATION_AUTHENTIFICATION"};
        this.messageNotificationVariable = {etiquette:"NOTIFICATION_VARIABLE"};
        this.messageConfirmationAuthentification = {etiquette:"CONFIRMATION_AUTHENTIFICATION"};

        multinode.contact;
        this.connecter = function(pseudonyme){

            try
            {
                multinode.contact = new WebSocket("ws://127.0.0.1:8080/multinode");
                //this.contact.onopen = () => contact.send("allo");
            }
            catch(erreur)
            {
                console.log("erreur" + JSON.stringify(erreur));
            }
            
            multinode.contact.onopen = function(evenement)
            {
                console.log("ouverture " + JSON.stringify(evenement));
                multinode.confirmerConnexion(); 
            }

            multinode.contact.onclose = function(evenement)
            {
                console.log("fermeture " + JSON.stringify(evenement));
            }

            multinode.contact.onmessage = function(evenement)
            {
                console.log("message " + JSON.stringify(evenement));
                var message = JSON.parse(evenement.data);

                switch(message.etiquette)
                {
                    case "NOTIFICATION_AUTHENTIFICATION":
                        multinode.apprendreAuthentification(message.pseudonyme);
                    break;
                    case "NOTIFICATION_VARIABLE":
                        var variable = message.variable;
                        console.log("variable recue " + variable.valeur);
                        multinode.recevoirVariable(variable);
                    break;
                    case "CONFIRMATION_AUTHENTIFICATION":
                        multinode.confirmerAuthentification(message.listePseudo);
                    break;
                    //case "CONFIRMATION_CONNEXION": onOpen()
                    //    multinode.confirmerConnexion();
                    //break;
                }

                //console.debug("Message recu", message.valeur);
            };            

        }

        this.posterVariableTextuelle = function(id, texte)
        {
            console.debug("MultiNode => posterVariableTextuelle()",texte);
            multinode.messageTransfertVariable.variable = new Variable("texte", id, texte);
            multinode.contact.send(JSON.stringify(multinode.messageTransfertVariable));
        }

        this.posterVariableNumerique = function(id, nombre)
        {
            console.debug("MultiNode => posterVariableNumerique()",nombre);
            multinode.messageTransfertVariable.variable = new Variable("numerique", id, nombre);
            multinode.contact.send(JSON.stringify(multinode.messageTransfertVariable));
        }

        this.posterVariableBooleenne = function(id, booleen)
        {
            console.debug("MultiNode => posterVariableBooleenne()",booleen);
            multinode.messageTransfertVariable.variable = new Variable("booleen", id, booleen);
            multinode.contact.send(JSON.stringify(multinode.messageTransfertVariable));
        }

        this.demanderAuthentification = function(pseudonyme)
        {
            console.debug("MultiNode => demanderAuthentification()",pseudonyme);
            multinode.messageDemandeAuthentification.pseudonyme = pseudonyme;
            multinode.contact.send(JSON.stringify(multinode.messageDemandeAuthentification));            
        }

        // fonction a redefinir
        this.confirmerConnexion = function()
        {
        }

        this.confirmerAuthentification = function(autresParticipants)
        {
        }
        
        this.apprendreAuthentification = function(pseudonyme)
        {
        }
        
        this.recevoirVariable = function(variable)
        {
        }
        
    }
