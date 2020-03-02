        function URLFacile()
        {
            this.parametres = new Array();
            
            var parametresUrl = window.location.search.replace("?","").split("&");
            for(position in parametresUrl)
            {
            
                cleValeur = parametresUrl[position].split("=");
                this.parametres[cleValeur[0]] = cleValeur[1];
            }
            this.get = function(cle)
            {
                return this.parametres[cle];
            }
        }
 
