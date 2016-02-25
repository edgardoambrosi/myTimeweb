$( document ).ready(function() {

		var	XTIMBRATURE="";
		var	NTIMBRATURE=0;
		var	ENTRATA="";
		var PREV="";
		var	NEXT="";
		var SALDO=0;
		var SALDOstr="";
		var	LAVORATO=0;
		var	DALAVORARE=0;
		var USCITA_PREVISTA=0;
		var GIORNATATERMINATASOSPESA;
		var	TOTALE="07:42:00";
		var clockCD="";	
		var clockCN="";
		var server_url="https://gescar.rm.cnr.it/timeweb/TwNet.dll";
		var notifiche_aut_url="https://servizipdr.cedrc.cnr.it/new/alfresco/service/api/login";
		var notifiche_url="https://servizipdr.cedrc.cnr.it:/new/alfresco/service/application-dependency/timeweb";
		var TICKET="";
		var DATA_GIORNO_LAVORATO="";
        var DATA_GIORNO_INIZIO="";
        var DATA_GIORNO_FINE="";
        var CAUSALI=new Object();
		var CAUSALE=0;
		var CAUSALE_SEL="";

		var app = {
			//SERVER DISPONIBILE
			isAvailable:false,

			// Application Constructor
			initialize: function() {
				this.bindEvents();
			},
			// Bind Event Listeners
			//
			// Bind any events that are required on startup. Common events are:
			// 'load', 'deviceready', 'offline', and 'online'.
			bindEvents: function() {
				document.addEventListener('deviceready', this.onDeviceReady, false);
			},
			// deviceready Event Handler
			//
			// The scope of 'this' is the event. In order to call the 'receivedEvent'
			// function, we must explicitly call 'app.receivedEvent(...);'
			onDeviceReady: function() {
				app.receivedEvent('deviceready');
			},
			// Update DOM on a Received Event
			receivedEvent: function(id) {
				var parentElement = document.getElementById(id);
				$.ajax({
				  url: server_url, 
				  method: 'GET'	
				}).success(function(a,b,c) {
					console.log("Server Disponibile");
					var listeningElement = parentElement.querySelector('.listening');
					var receivedElement = parentElement.querySelector('.received');
					listeningElement.setAttribute('style', 'display:none;');
					receivedElement.setAttribute('style', 'display:block;');
					$('#credenziali').show();
					app.isAvailable=true;
				}).error(function(){
					console.log("Server non Disponibile");
					var listeningElement = parentElement.querySelector('.listening');
					var receivedElement = parentElement.querySelector('.received');
					listeningElement.setAttribute('style', 'display:block;');
					receivedElement.setAttribute('style', 'display:none;');
					$('#credenziali').hide();
					app.isAvailable=false;
				});
			}
		};

		var env={
			reset: function(){
				XTIMBRATURE="";
				NTIMBRATURE=0;
				ENTRATA="";
				PREV="";
				NEXT="";
				SALDO=0;
				SALDOstr="";
				LAVORATO=0;
				DALAVORARE=0;
				GIORNATATERMINATASOSPESA;
				DATA_GIORNO_LAVORATO="";
				TOTALE="07:42:00";
                CAUSALI=new Object();
				CAUSALE=0;
				CAUSALE_SEL="";
				TICKET="";
				//$('#tempo-restante').setTime(LAVORATO);
				//$('#tempo-trascorso').setTime(DALAVORARE);
				$('#strisciata').text("");
				$('#_saldo').text("");
				t=$('#GiornoLavoro').val();
				if(typeof t=="undefined" || t=="" ){
					DATA_GIORNO_LAVORATO=data.composizione();
				}else{
					var d=t.split("-");		
					DATA_GIORNO_LAVORATO=d[2]+"-"+d[1]+"-"+d[0];
				}
				t=$('#GiornoLavoro_inizio').val();
				if(typeof t=="undefined" || t=="" ){
					DATA_GIORNO_INIZIO=data.composizione();
				}else{
					DATA_GIORNO_INIZIO=data.composizione(t);
				}
				t=$('#GiornoLavoro_fine').val();
				if(typeof t=="undefined" || t=="" ){
					DATA_GIORNO_FINE=data.composizione();
				}else{
					DATA_GIORNO_FINE=data.composizione(t);
				}
				
				CAUSALE_SEL=$('select[name="VOCISELEZIONATE"]').val();

				/*VIBRAZIONE DI CONFERMA*/
				/*iOS*/
				//navigator.notification.vibrate(2500);
				/*ANDROID*/
				//navigator.vibrate(2500);
			}
		};

		var esame_timbrature={
			individuazione:function(TIMBRATURE){
				XTIMBRATURE=TIMBRATURE.split(" ");
				NTIMBRATURE=XTIMBRATURE.length;
				ENTRATA=XTIMBRATURE[0];
				PREV=XTIMBRATURE[(NTIMBRATURE-3)<0?0:NTIMBRATURE-3];
				NEXT=XTIMBRATURE[NTIMBRATURE-2];
			},
			dalavorare_lavorato:function(){
				var n=0;
				for (var i=0;i<=XTIMBRATURE.length;i++){
					//CONTROLLO SE LA TIMBRATURA È DISPARI OSSIA LA 1° LA 3° ETC mi aspetto sempre una entrata
					if ( (i+1) %2 == 1 ){
						//CONTROLLO CHE LA TIMBRATURA ESISTE
						if (XTIMBRATURE[i] !==null && XTIMBRATURE[i] !==undefined && XTIMBRATURE[i] !==""){
							//CONTROLLO SE LA TIMBRATURA È UNA ENTRATA
							if ( XTIMBRATURE[i].charAt(0)=="E"){
								//...SE LO È ASSEGNO L'ENTRATA
								ENTRATA=XTIMBRATURE[i];
								continue;
							}else{
								//...ALTRIMENTI, SE ESISTE E NON È UNA ENTRATA IL CONTEGGIO NON PUO ESSRE EFFETTUATO 
								LAVORATO=NaN;
								break; 
							}
						}else{
							break;
						}
					}
					//CONTROLLO SE LA TIMBRATURA È PARI OSSIA LA 2° LA 4° ETC mi aspetto sempre una uscita o nessuna timbratura
					if ( (i+1) %2 == 0 ){
						//CONTROLLO CHE LA TIMBRATURA ESISTE
						if (XTIMBRATURE[i] !==null && XTIMBRATURE[i] !==undefined && XTIMBRATURE[i] !==""){
							//...SE ESISTE CONTROLLO SE LA TIMBRATURA È UNA USCITA
							if ( XTIMBRATURE[i].charAt(0)=="U"){
								//...SE LO È ASSEGNO NEXT
								NEXT=XTIMBRATURE[i];
								//CALCOLO IL LAVORATO
								NEXTsec=esame_timbrature.insecondi(NEXT.replace(/U/, '')+":00");
								ENTRATAsec=esame_timbrature.insecondi(ENTRATA.replace(/E/, '')+":00");
								LAVORATO=(LAVORATO+(NEXTsec-ENTRATAsec));
								//CALCOLO IL DALAVORARE
								TOTALEsec=esame_timbrature.insecondi(TOTALE);
								DALAVORARE=(TOTALEsec-LAVORATO);
								DALAVORARE>0?DALAVORARE=DALAVORARE:DALAVORARE=0;
								//CALCOLO SALDO
								if (TOTALEsec==LAVORATO){							
									SALDO=0;
								}					
								if ( TOTALEsec>LAVORATO ){
									SALDO=DALAVORARE;
									t = new Date(null);
									t.setSeconds(SALDO);
									t.toISOString().substr(11, 8);
									SALDOstr="-"+t.toISOString().substr(11, 8);
									SALDO=DALAVORARE * (-1);
								}else{					
									SALDO=LAVORATO-TOTALEsec;
									t = new Date(null);
									t.setSeconds(SALDO);
									t.toISOString().substr(11, 8);
									SALDOstr=t.toISOString().substr(11, 8);
								}
								GIORNATATERMINATASOSPESA=true;
							}else{			
								//...SE ESISTE E NON È UNA USCITA NON POSSO EFFETTUARE IL CALCOLO
								LAVORATO=NaN;
								GIORNATATERMINATASOSPESA=true;
							}
						}else{
							//...ALTRIMENTI SE LA TIMBRATURA NON ESISTE CALCOLO IL LAVORATO AL TEMPO ATTUALE
							ORARIOATTUALE=((new Date()).toString().split(" "))[4];
							ORARIOATTUALEsec=esame_timbrature.insecondi(ORARIOATTUALE);
							ENTRATAsec=esame_timbrature.insecondi(ENTRATA.replace(/E/, '')+":00");
							LAVORATO=(LAVORATO+(ORARIOATTUALEsec-ENTRATAsec));
							//CALCOLO IL DALAVORARE
							TOTALEsec=esame_timbrature.insecondi(TOTALE)
							DALAVORARE=(TOTALEsec-LAVORATO);
							DALAVORARE>0?DALAVORARE=DALAVORARE:DALAVORARE=0;
							//CALCOLO SALDO
							if (TOTALEsec==LAVORATO){							
								SALDO=0;
							}					
							if ( TOTALEsec>LAVORATO ){
								SALDO=DALAVORARE;
								t = new Date(null);
								t.setSeconds(SALDO);
								t.toISOString().substr(11, 8);
								SALDOstr="-"+t.toISOString().substr(11, 8);
								SALDO=DALAVORARE * (-1);
							}else{					
								SALDO=LAVORATO-TOTALEsec;
								t = new Date(null);
								t.setSeconds(SALDO);
								t.toISOString().substr(11, 8);
								SALDOstr=t.toISOString().substr(11, 8);
							}
							GIORNATATERMINATASOSPESA=false;
						}
					}
				}

			},
			uscita_prevista:function(){
					ORARIOATTUALE=((new Date()).toString().split(" "))[4];
					ORARIOATTUALEsec=esame_timbrature.insecondi(ORARIOATTUALE);
					USCITA_PREVISTA=DALAVORARE+ORARIOATTUALEsec;
			},
			insecondi:function(orario){
				var hms = orario;   // your input string tipo '02:04:33'
				var a = hms.split(':'); // split it at the colons
				// minutes are worth 60 seconds. Hours are worth 60 minutes.
				var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]); 
				return seconds;
			},
			inorario:function(sec){
				secondi = sec % 60; 
				minuti = ((sec - secondi)/60) % 60; 
				ore = (sec - secondi - (minuti * 60)) / 3600 % 3600; 						
				t=minuti.toString();
				minutiS="";
				if ( t.length == 1 ){
				 minutiS="0"+t;
				}else{
				 minutiS=t;	
				}
				return ore+":"+minutiS;
			}
		};
		var data={
			composizione:function(d){
				var mesi=["Jan","Feb","Mar", "Apr", "May", "Giu", "Jul", "Aug", "Sep","Oct","Nov","Dec"];
				var nmesi=["01","02","03", "04", "05", "06", "07", "08", "09","10","11","12"];
				if (typeof d=="undefined"){
					var oggi=(new Date()).toString().split(" ");
					var giorno=oggi[2];
					var mese=oggi[1];
					var anno=oggi[3];
					$(mesi).each(function(i,e){
						if ( mese == e){
							oggi=giorno+"-"+nmesi[i]+"-"+anno;
						}
					});
					return oggi;
				}else{
					var oggi=(new Date(d)).toString().split(" ");
					var giorno=oggi[2];
					var mese=oggi[1];
					var anno=oggi[3];
					$(mesi).each(function(i,e){
						if ( mese == e){
							oggi=giorno+"-"+nmesi[i]+"-"+anno;
						}
					});
					return oggi;
				}
			}
		};

		var timeweb={  
			connetti:function(u,p,d){
				$.ajax({
				  url: server_url,
				  data:"TIPOAUT=0&AZIONE=RICHIESTAAUTENTIFICAZIONE&NOMEPAGATTUALE=MOSTRALOGIN&USERNAME="+u+"&PASSWORD="+p+"&btnConf=Login",
				  method: 'POST'	
				}).complete(function(a,b,c) {
					console.log("Autenticazione Effettuata");
					timeweb.cartellino(d);
					$('.received').show()
					$('.listening').hide();
					$('#credenziali').hide();					
					$('#monitor').show();
	            	$('.menu-act').show();
				});
			},
			disconnetti:function(){
				$.ajax({
				  url: server_url, 
				  data:"AZIONE=LOGOUT",
				  method: 'GET'	
				}).success(function(a,b,c) {
					console.log("Logout effettuato");
					var cookies = document.cookie.split(";");
					for(var i=0; i < cookies.length; i++) {
						var equals = cookies[i].indexOf("=");
						var name = equals > -1 ? cookies[i].substr(0, equals) : cookies[i];
						document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
					}
				});
			},
			cartellino:function(a){
				var oggi;
				if ( typeof a=="undefined"){
					oggi=DATA_GIORNO_LAVORATO;
				}else{
					oggi=a;
				}			
				$.ajax({
				  url: server_url, 
				  data:"AZIONE=CARTELLINO&DATAINIZIO="+oggi+"&DATAFINE="+oggi,
				  //data:"AZIONE=CARTELLINO&DATAINIZIO=03-02-2016&DATAFINE=03-02-2016",
				  method: 'GET'	
				}).success(function(a,b,c) {
					console.log("Orari Cartellino");
					//alert("Orari Cartellino")
					_TIMBRATURE=$(a).find('table[id="divDatiTB"]').find('tr').find('td[align="LEFT"]').eq(1).text();

					/*TEST EFFETTUATI*/
					//valide				
					//_TIMBRATURE='E10:56'
					//_TIMBRATURE='E07:56 U16:24' 
					//_TIMBRATURE='E07:56 U08:30 E09:45' 
					//_TIMBRATURE='E07:56 U08:30 E09:45 U10:15' 
					//_TIMBRATURE='E07:56 U08:30 E09:45 U10:15 E10:23' 
					//errori
					//_TIMBRATURE='U07:56'
					//_TIMBRATURE='E07:56 E12:34'
					//_TIMBRATURE='E07:56 U12:34 U15:12'    
					esame_timbrature.individuazione(_TIMBRATURE);
					esame_timbrature.dalavorare_lavorato();
					$('#strisciata').text(_TIMBRATURE);

					clockCD = $('#tempo-restante').FlipClock({
						autoStart:false
					});
					clockCD.setTime(DALAVORARE);
					clockCD.setCountdown(true);
					GIORNATATERMINATASOSPESA===true?clockCD.stop():clockCD.start();

					/*CALCOLO SEMPRE L'ORA IN CUI DOVREBBE ESSERE EFFETTUATA L'USCITA*/
					$('#tempo-restante-extra').remove();
					esame_timbrature.uscita_prevista();
					USCITA=esame_timbrature.inorario(USCITA_PREVISTA);
					$('#tempo-restante').before("<p id='tempo-restante-extra'>DA LAVORARE: ( uscita prevista: "+USCITA+" )</p>");
					$('#tempo-restante-extra').addClass('tempo-restante-extra');

					clockCN = $('#tempo-trascorso').FlipClock({
						autoStart:false
					});
					clockCN.setTime(LAVORATO);
					clockCN.setCountdown(false);
					GIORNATATERMINATASOSPESA===true?clockCN.stop():clockCN.start();
					$('#_saldo').remove();
					$('#saldo').append("<h1 id='_saldo'>"+SALDOstr+"</h1>");
					if ( SALDO < 0){
						 $('#saldo').addClass('saldo-negativo');
						 $('#saldo').removeClass('saldo-positivo');
					}
					if ( SALDO > 0) {
						$('#saldo').addClass('saldo-positivo');
						$('#saldo').removeClass('saldo-negativo');
					}	

				});
			},
            contatori:function(da,a,cs){
            var DA=da;
            var A=a;
            var CAUSALE_SEL=cs;
            $.ajax({
				   dataType:"html",
				   dataFilter:function(d,t){
						return $(d);
				   },
                   url: server_url,
                   data:"AZIONE=RIEPILOGHIVGMENSILI&DATAINIZIOMENS="+DA+"&DATAFINEMENS="+A+"&VOCISELEZIONATE="+CAUSALE_SEL+"&GRIDRIEPILOGHIMENSILI=Descrizione&DOEXEC=DOEXEC&NOMEPAGATTUALE:VISUALIZZA%20TPAGINARIEPILOGOVGMENSILE&VIEWNULLROWS=S",
                   method: 'POST'
                   }).success(function(a,b,c) {
                          console.log("Riepiloghi Contatori: "+ DA+" "+A);
	                      _CAUSALE=$(a).find('#divDatiTB tr td[align="right"]');
                          $.each(_CAUSALE,function(i,e){
							  if (i<(_CAUSALE.length-1) && ($(e).text()!=="" && typeof $(e).text()!=="undefined") ){ 
								var n=parseInt($(e).text());
 							  	CAUSALE=CAUSALE+n;
							  }													
				          })
						  $('#quantita').FlipClock(CAUSALE, {
								clockFace: 'Counter'
						  });
                    });
            },
            causali:function(){
            $.ajax({
                dataType:"html",
                dataFilter:function(d,t){
                   return $(d);
                },
                url: server_url,
                data:"AZIONE=RIEPILOGHIVGMENSILI",
                method: 'GET'
                }).success(function(a,b,c) {
                    console.log("Recupero Causali: ");
                    CAUSALI=$(a).find('select[name="VOCISELEZIONATE"]');
					$(CAUSALI).removeAttr('multiple');
					$('select[name="VOCISELEZIONATE"]').remove();
                    $('#causale_sel').append(CAUSALI);
					$(CAUSALI).css("position","relative")
					$(CAUSALI).css("top","-30px")
                });
            }
        };

		var notifiche={
			connetti:function(u,p){
				nome="edgardo.ambrosi";
				$.ajax({
				  url: notifiche_aut_url,
				  data:"u="+nome+"&pw="+p,
				  method: 'GET'	
				}).success(function(a,b,c) {
					console.log("Autenticazione Notifiche Effettuata");
					TICKET=$(c.responseText).text();
				}).error(function(a,b,c){
					alert("Autenticazione Notifiche Incompleta. Non si potranno recuperare le comunicazioni da parte dell'ente. Verificare le credenziali del sistema di notifica.")	
				});
			},
			library:function(u){
				$.ajax({
				  url: notifiche_url+"/"+u,
				  data:"gui=false&target=Sites/notifications/documentLibrary&urlProxy=https://servizipdr.cedrc.cnr.it:/new/alfresco/service/jsonpProxy?url=&applicationId=timeweb/"+u+"&alf_ticket="+TICKET,
				  dataType:"script", 
				  method: 'GET'	
				}).success(function(a,b,c) {
					//eseguo le dipendenze scaricate come funzione anonima immediata. Dopo qualche istante le funzioni della libreria saranno disponibili.
					(function(){a})
					console.log("Recupero Libreria Notifiche Effettuata");
 				    recuperaNotifiche(true)
					mostraNotifiche(false)
				}).error(function(a,b,c){
					alert("Libreria notifiche non recuperata. Le notifiche non saranno disponibili.")	
				});
			},
			library_bis:function(u){
			  url=notifiche_url+"/"+u;
			  data="?gui=false&target=Sites/notifications/documentLibrary&urlProxy=https://servizipdr.cedrc.cnr.it:/new/alfresco/service/jsonpProxy?url=&applicationId=timeweb/"+u+"&alf_ticket="+TICKET;
              $('<iframe />');  // Create an iframe element
              $('<iframe />', {
                  name: 'frame1',
                  id: 'frame1',
				  style: "width:100%; height:100%;",
  				  sandbox: 'allow-scripts',
              }).appendTo('#pannello-menu');
			  $("#frame1").append("<html><head><script src="+url+data+"/></head><body></body></html>")
			}

		}


		/*CONTROLLO TIMBRATURE SUCCESSIVE*/
		$('#strisciata').click(function(){
			console.log("...controllo timbrature...")
			env.reset();
			timeweb.cartellino();
		});

		$('#saldo').click(function(){
			console.log("...controllo timbrature...")
			env.reset();
			timeweb.cartellino();
		});

		$('.received').click(function(){
			console.log("...tento la disconnessione...");
			timeweb.disconnetti();
			$('#monitor').hide();
            $('.menu-act').hide();
			app.initialize();
			env.reset();
		});

		$('.listening').click(function(){
			console.log("...tento la connessione...");
			app.initialize();
		});

		$("#credset").click(function() {
			env.reset();
			timeweb.connetti($('#NomeUtente').val(),$('#Password').val(),DATA_GIORNO_LAVORATO);
			notifiche.connetti($('#NomeUtente').val(),$('#Password').val());
		});

		$('#NomeUtente').on('input', function() {
			$('#Password').on('input', function() {
				$("#credset").prop("disabled", false);
			});		
		});

		$('#GiornoLavoro').on('input',function(){
			console.log("...controllo timbrature del giorno scelto...")
			env.reset();
			timeweb.cartellino(DATA_GIORNO_LAVORATO);
		});

		$('.menu-act').click(function(){
            $('.menu').fadeToggle("fast","linear");
            $('#pannello-menu').fadeToggle("fast","linear");
            $('#monitor').fadeToggle("fast","linear");
            $('.app').fadeToggle("fast","linear");
            
		});		
						
		$('#Causale').click(function(){
            $('#quantita').FlipClock(0, {
                    clockFace: 'Counter'
            });
			env.reset();
            timeweb.causali();
            $('#perConteggio').fadeToggle("fast","linear");
		})

		$('#calcola').click(function(){
			env.reset();
			timeweb.contatori(DATA_GIORNO_INIZIO,DATA_GIORNO_FINE,CAUSALE_SEL);
		})
		$('#Notifiche').click(function(){
			//scarica libreria solo 1 volta
			notifiche.library_bis($('#NomeUtente').val());
			//aggiorna
			//notifiche.download();
			//visualizza notifica sempre 
			//notifiche.visualizza();
		})

});
