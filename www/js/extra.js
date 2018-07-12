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
		var ORARIOINIZIOLAVORO="07:50:00";
		var	TOTALE="07:42:00";
		var PAUSAPRANZO="00:30:00"
		var clockCD="";	
		var clockCN="";
		var server_url="https://gescar.rm.cnr.it/timeweb/TwNet.dll";
		var notifiche_aut_url="https://servizipdr.cedrc.cnr.it/new/alfresco/service/api/login";
		var notifiche_url="https://servizipdr.cedrc.cnr.it:/new/alfresco/service/application-dependency/timeweb_mobile";
		var TICKET="";
		var DATA_GIORNO_LAVORATO="";
        var DATA_GIORNO_INIZIO="";
        var DATA_GIORNO_FINE="";
        var CAUSALI=new Object();
		var CAUSALE=0;
		var CAUSALE_SEL="";
        var GIUSTIFICATIVI=new Object();
		var GIUSTIFICATIVO=0;
		var GIUSTIFICATIVO_SEL="";
		var CONNESSO=false;
		var COMUNICAZIONI="";
		var IDDIP="";
		var MEMORCOORD=[0,0];
		var LOGINFOARRAY=[];
				
			
		var check={
			maxDay:15,
			gestione_validita:function(d){
				var date_avvio=d
				DI=new Date(date_avvio)
				DE=new Date()
				DE.setDate(DI.getDate()+check.maxDay)
				if (DI>=DE){
					//se la demo e' scaduta tutta l'applicazione viene rimossa dal DOM
					$(".container").remove();
					avvisi.comunicazione("Demo Scaduta");	
					$('#demo_info').show();				
					log.info("Demo Scaduta!")
				}else{
					//avvisi.comunicazione("Demo Valida");					
					log.info("Demo Valida!")
				}	
			},
			validita:function(){
		        var trial_db = window.openDatabase("StartDateDB", "1.0", "StartDateDB", 2000);
				trial_db.transaction(
					function(tx){tx.executeSql('create table expired (date_avvio);')},
					function(err){
						//se la tabella esiste viene restituito codice 5				
						if (err.code==5){
				            log.info("Leggo Data Avvio");
							trial_db.transaction(
								function(tx){
									tx.executeSql(
									  'select date_avvio from expired;',
									  [],
									  function(tx, results){
										  for (var j=0; j<results.rows.length; j++) {
											var row = results.rows.item(j);
											check.gestione_validita(row['date_avvio']);
										  }
									   }
									 );
								}
							)
						}
					},
					function(){
						log.info("Creazione Db StartDateDB...");
				        trial_db.transaction(
				            function(tx){
								tx.executeSql("INSERT INTO expired (date_avvio) VALUES ('"+new Date()+"');")
				            },
				            function(err){console.log(err)},
				            function(){
								log.info("Inizializzazione periodo prova eseguita.")
								avvisi.comunicazione("Salvataggio eseguito");
							}
				                                 
				        )
				    }
				);
			}
			
		};
		
		var container = {
			//SERVER DISPONIBILE
			isAvailable:false,
			receivedEvent: function(id) {
				$.ajax({
				  url: server_url, 
				  method: 'GET'	
				}).success(function(a,b,c) {
					check.validita()
					log.info("Server Disponibile");
					$('.listening').hide();
					$('.received').show();
					$('#credenziali').show();
					container.isAvailable=true;
					spinner.termina();
				}).error(function(){
					log.info("Server non Disponibile");
					$('.listening').show();
					$('.received').hide();
					$('#credenziali').hide();
					container.isAvailable=false;
					spinner.termina();
					avvisi.comunicazione("Rete o Server non disponibile.");
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
				ORARIOINIZIOLAVORO="07:50:00";
				TOTALE="07:42:00";
				PAUSAPRANZO="00:30:00"
                CAUSALI=new Object();
				CAUSALE=0;
				CAUSALE_SEL="";
                GIUSTIFICATIVI=new Object();
				GIUSTIFICATIVO=0;
				GIUSTIFICATIVO_SEL="";
				TICKET="";
				IDDIP="";
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
				GIUSTIFICATIVO_SEL=$('select[name="VOCISELEZIONATE"]').val();

				//salvataggio impostazioni 
				main.salva_impostazioni();

				/*VIBRAZIONE DI CONFERMA*/
				/*iOS*/
                //navigator.notification.vibrate(2500);
				/*ANDROID*/
				//navigator.vibrate(2500);
			}
		};

		var esame_timbrature={
			/*QUESTA FUNZIONE HA LO SCOPO DI IMPLEMENTARE LA LOGICA PER LE CAUSALI DIGITATE DAL DIPENDENTE AL MOMENTO DELL'USCITA DAI TORNELLI.
			PER ORA SONO IMPLEMENTATE SOLO LE CAUSALI PAUSAPRANZO COD 0001 E SERVIZIO ESTERNO CAUSALE 0003.
			LA GESTIONE E LA LOGICA DIPENDE ESCLUSIVAMENTE DALLE REGOLE INTERNE.*/
			gestione_causali:function(TIMBRATURE){
				/*se le strisciate originali sono "E08:32 U14:00(0001) E14:53(0001) U16:21"
				diventano "E08:32 U14:00(0001) E14:53 U16:21" e infine "E08:32 U14:30 E14:53 U16:21".
				
				Se originali sono "E08:32 U14:00(0001) E14:23(0001) U16:21" diventano "E08:32 U14:23 E14:23 U16:21"

				Se originali sono "E08:32 U14:00(0003) E14:23(0003) U16:21" diventano "E08:32 U16:21"
				
				*/
				
				var NUOVASTRISCIATA=new Array();
				var TIMBRATUREARRAY=TIMBRATURE.split(" ")
				var PAUSAPRANZOsec=esame_timbrature.insecondi(PAUSAPRANZO);

				//SE VICINO AD UNA USCITA TROVO UN 0001 RIMUOVO DALLA TIMBRATURA SUCCESSIVA IL MEDESIMO CODICE 0001 SOLO PER UNA UTILITÀ NEL CICLO SUCCESSIVO. 
				TIMBRATUREARRAY.forEach(function(e,i){
				   if (e.search(/U[0-9]+:[0-9]+\(0001\)/)!==-1){
					   TIMBRATUREARRAY[i+1]=TIMBRATUREARRAY[i+1].replace("(0001)","")
				   }
				})

				TIMBRATUREARRAY.forEach(function(e,i){
				   //se trovi codice 0003, MI ASPETTO CHE LA SUCCESSIVA TIMBRATA RIPORTI LO STESSO CODICE 0003  	
				   if (e.search(/(E|U)[0-9]+:[0-9]+\(0003\)/)!==-1 ){
				   		//...ignori la timbrata		
						return;
					//se trovi 0001	vicino ad una ENTRATA
				   }else if (e.search(/E[0-9]+:[0-9]+\(0001\)/)!==-1){
				   		//calcoli la pausa pranzo in eccesso,
				   		 ENTRATA=e.replace("(0001)","").replace("E","")
				   		 USCITA=TIMBRATUREARRAY[i-1].replace("(0001)","").replace("U","");
						 _ENTRATA=esame_timbrature.insecondi(ENTRATA+":00")
						 _USCITA= esame_timbrature.insecondi(USCITA+":00")
						 _PAUSAPRANZO=_ENTRATA-_USCITA
						 if (PAUSAPRANZOsec > _PAUSAPRANZO ) {
								NUOVASTRISCIATA.push("E"+TIMBRATUREARRAY[i-1].replace("(0001)","").replace("U",""));
								return;
						 }
						 if (PAUSAPRANZOsec <= _PAUSAPRANZO ){
								NUOVASTRISCIATA.push("E"+esame_timbrature.inorario(_USCITA+(_PAUSAPRANZO-PAUSAPRANZOsec)));
								return;
						 }
				   //se trovi 0001	vicino ad una USCITA					   		 
				   }else if (e.search(/U[0-9]+:[0-9]+\(0001\)/)!==-1){
				   		var INVERTI=false;
				   		if (TIMBRATUREARRAY[i+1].search(/E[0-9]+:[0-9]+\(0001\)/)!==-1) INVERTI=true
				   		//calcoli la pausa pranzo in eccesso
				   		 USCITA=e.replace("(0001)","").replace("U","")
				   		 ENTRATA=TIMBRATUREARRAY[i+1].replace("(0001)","").replace("E","");
						 _ENTRATA=esame_timbrature.insecondi(ENTRATA+":00")
						 _USCITA= esame_timbrature.insecondi(USCITA+":00")
						 _PAUSAPRANZO=_ENTRATA-_USCITA
						 if (PAUSAPRANZOsec > _PAUSAPRANZO ) {
								NUOVASTRISCIATA.push("U"+TIMBRATUREARRAY[i+1].replace("(0001)","").replace("E",""));
								return;
						 }
						 if (PAUSAPRANZOsec <= _PAUSAPRANZO ){
								NUOVASTRISCIATA.push("U"+esame_timbrature.inorario(_ENTRATA-(_PAUSAPRANZO-PAUSAPRANZOsec)));
								return;
						 }

				   }
				   NUOVASTRISCIATA.push(e);
				})

				console.log(NUOVASTRISCIATA.toString().replace(/,/g," "))		
				
				return NUOVASTRISCIATA.toString().replace(/,/g," ");
			},		
			//IMPOSTO ALCUNE VARIABILI NECESSARIE PER I CONTEGGI
			individuazione:function(TIMBRATURE){
				XTIMBRATURE=TIMBRATURE.split(" ");
				NTIMBRATURE=XTIMBRATURE.length;
				ENTRATA=XTIMBRATURE[0];
				PREV=XTIMBRATURE[(NTIMBRATURE-3)<0?0:NTIMBRATURE-3];
				NEXT=XTIMBRATURE[NTIMBRATURE-2];
			},
			//CALCOLO IL TEMPO LAVORATO E QUELLO DA LAVORARE
			dalavorare_lavorato:function(){
				var n=0;
				for (var i=0;i<=XTIMBRATURE.length;i++){
					//CONTROLLO SE LA TIMBRATURA È DISPARI OSSIA LA 1° LA 3° ETC mi aspetto sempre una entrata
					if ( (i+1) %2 == 1 ){
						//CONTROLLO CHE LA TIMBRATURA ESISTE
						if (XTIMBRATURE[i] !==null && XTIMBRATURE[i] !==undefined && XTIMBRATURE[i] !==""){
							//CONTROLLO SE LA TIMBRATURA È UNA ENTRATA
							if ( XTIMBRATURE[i].charAt(0)=="E"){
								//...SE LO È ASSEGNO L'ENTRATA, MA SE LA TIMBRATURA CHE STO CONSIDERNADO E' LA PRIMA E ORARIOINIZIOLAVORO E' STATO ABILITATO IN IMPOSTAZIONI
								if(i==0 && (ORARIOINIZIOLAVORO!="undefined" && ORARIOINIZIOLAVORO!="" ) && (esame_timbrature.insecondi(ENTRATA.replace(/E/, '')+":00") < (esame_timbrature.insecondi(ORARIOINIZIOLAVORO) )  ) ){
									ENTRATA='E'+ORARIOINIZIOLAVORO.replace(/:00$/,'')
								}else{
									ENTRATA=XTIMBRATURE[i];
								}	
//								ENTRATA=XTIMBRATURE[i];
								//INTERROMPO QUESTA FASE E PROSEGUO AL PUNTO (2)
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
					//PUNTO (2)
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
									/*TODO:DA SISTEMARE IL SALDO E LA PAUSA PRANZO*/
									PAUSAPRANZOsec=esame_timbrature.insecondi(PAUSAPRANZO);
									SALDO=( SALDO - PAUSAPRANZOsec );
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
								PAUSAPRANZOsec=esame_timbrature.insecondi(PAUSAPRANZO);
								SALDO=( SALDO - PAUSAPRANZOsec );
							}else{					
								SALDO=LAVORATO-TOTALEsec;
								t = new Date(null);
								t.setSeconds(SALDO);
								t.toISOString().substr(11, 8);
								SALDOstr=t.toISOString().substr(11, 8);
							}
                    
                            //SE LA GIORNATA CHE SI STA ANALIZZANDO E' QUELLA ATTUALE VIENE SETTATO IL FLAG GIORNATATERMINATASOSPESA FALSE
                            if (DATA_GIORNO_LAVORATO==data.composizione()){
                                GIORNATATERMINATASOSPESA=false;
                            }else{
                                //ALTRIMENTI IL FLAG GIORNATATERMINATASOSPESA VIENE MESSO A TRUE E IL CONTATORE DALAVORARE,LAVORATO INDEFINITO.
                                LAVORATO=NaN;
                                DALAVORARE=NaN;
                                SALDOstr=NaN;
                                GIORNATATERMINATASOSPESA=true;
                            }
						}
					}
				}

			},
			uscita_prevista:function(){
					ORARIOATTUALE=((new Date()).toString().split(" "))[4];
					ORARIOATTUALEsec=esame_timbrature.insecondi(ORARIOATTUALE);
                    TOTALEsec=esame_timbrature.insecondi(TOTALE);
                    //SE LA GIORNATA CHE SI STA ANALIZZANDO E' QUELLA ATTUALE ALLORA CALCOLO LA USCITA_PREVISTA
                    if (DATA_GIORNO_LAVORATO==data.composizione()){
		                if ( TOTALEsec > LAVORATO ) {
		                    USCITA_PREVISTA=DALAVORARE+ORARIOATTUALEsec;
		                }else{
		                    USCITA_PREVISTA=0;
		                }
		            //ALTRIMENTI IL CALCOLO DELLA USCITA_PREVISTA NON HA SIGNIFICATO
                    }else{
		                    USCITA_PREVISTA=0;
                    }


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
			//compone una data dal formato ISO al semplice formato dd-mm-yyyy
			composizione:function(d){
				var mesi=["Jan","Feb","Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep","Oct","Nov","Dec"];
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
			},
			//calcola il range del mese corrente dal primo giorno al secondo giorno
            iniziofinemese:function(d){
                var date = new Date(d);
	            if ( date == "Invalid Date"){
	            	date = new Date();
	            }    
                var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
                var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
                return [ firstDay,lastDay];
            },
			//somma due orari in formato hh.mm
			sommaorario:function(orario1,orario2){
				h1=new String(orario1).split(".");
				h2=new String(orario2).split(".");
				h1h=Number(h1[0]);
				h1m=Number(h1[1]);
                h1h>0?h1hm=( (h1h*60)+h1m ):h1hm=( ( Math.abs(h1h) * 60 ) + h1m ) * (-1);
				h2h=Number(h2[0]);
				h2m=Number(h2[1]);
                h2h>0?h2hm=( (h2h*60)+h2m ):h2hm=( ( Math.abs(h2h) * 60 ) + h2m ) * (-1);
				hhmt=h1hm+h2hm;
     			m=(Math.abs(hhmt)) % 60;
				h=( (Math.abs(hhmt) - m) /60 )
				hhmt>0?T=h+"."+m:T=(h*(-1))+"."+m;
				return T
			}
			
		};

		var timeweb={  
			connetti:function(u,p,d){
				$.ajax({
				  url: server_url,
                  async:false,
				  data:"TIPOAUT=0&AZIONE=RICHIESTAAUTENTIFICAZIONE&NOMEPAGATTUALE=MOSTRALOGIN&USERNAME="+u+"&PASSWORD="+p+"&btnConf=Login",
				  method: 'POST'	
				}).complete(function(a,b,c) {
					if ($($.parseHTML(a.responseText)[5]).text()=="Login"){
						spinner.termina();
						avvisi.comunicazione("Autenticazione non valida. L'accesso è garantito solo per la gestione dell'applicazione!")
						$('.received').show()
						$('.listening').hide();
						$('#credenziali').hide();					
		            	$('.menu-act').show();
					}else{
					    spinner.termina()
						log.info("Autenticazione Effettuata");
						/*ESTRAGGO DALLA RISPOSTA l'ID DEL DIPENDENTE*/
						var resp=$.parseHTML(a.responseText);
						var t=$(resp).find('.linkcomandi').attr('href')
						IDDIP=t.replace(/.*iddipselected=/g, "")
   													
						timeweb.cartellino(d);
						$('.received').show()
						$('.listening').hide();
						$('#credenziali').hide();					
						$('#monitor').show();
		            	$('.menu-act').show();
						CONNESSO=true;
					}
				});
			},
			disconnetti:function(){
				$.ajax({
				  url: server_url, 
				  data:"AZIONE=LOGOUT",
				  method: 'GET'	
				}).success(function(a,b,c) {
					log.info("Logout effettuato");
					$('.received').hide()
					$('.listening').show();
					var cookies = document.cookie.split(";");
					for(var i=0; i < cookies.length; i++) {
						var equals = cookies[i].indexOf("=");
						var name = equals > -1 ? cookies[i].substr(0, equals) : cookies[i];
						document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
					}
					spinner.termina()
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
					log.info("Orari Cartellino");
					//alert("Orari Cartellino")
					_TIMBRATURE=$(a).find('table[id="divDatiTB"]').find('tr').find('td[align="LEFT"]').eq(2).text();

					__TIMBRATURE=esame_timbrature.gestione_causali(_TIMBRATURE)
					esame_timbrature.individuazione(__TIMBRATURE);
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
					$('#tempo-lavorato-extra').remove();
					esame_timbrature.uscita_prevista();
					USCITA=esame_timbrature.inorario(USCITA_PREVISTA);
					$('#tempo-restante').before("<label id='tempo-restante-extra'>Da lavorare: ( uscita prevista: "+USCITA+" )</label>");
					$('#tempo-trascorso').before("<label id='tempo-lavorato-extra'>Lavorato</label>");

					clockCN = $('#tempo-trascorso').FlipClock({
						autoStart:false
					});
					clockCN.setTime(LAVORATO);
					clockCN.setCountdown(false);
					GIORNATATERMINATASOSPESA===true?clockCN.stop():clockCN.start();
					$('#_saldo').remove();
					$('#saldo').append("<h2 class='blink' id='_saldo'>"+SALDOstr+"</h2>");
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
			anomalie:function(i,f){
				var DA=i;
				var A=f; 
				$.ajax({
				  url: server_url, 
				  data:"AZIONE=CARTELLINO&DATAINIZIO="+DA+"&DATAFINE="+A,
				  method: 'GET'	
				}).success(function(a,b,c) {
					log.info("Anomalie");
					$('#anomalieTable').find("tr:gt(0)").remove();
					var t=$(a).find('table[id="divDatiTB"]').find('tr');
					$.each(t,function(i,e){
						if ( i>0 && $(e).attr('vis')!="no"){
							var d=$(e).find('td').eq(0).text();
							var h=$(e).find('td').eq(2).text();
							var id_btn=(d.split(" ")[0]).replace(/\//g,"-")
							$('#anomalieTable').find('tbody').append('<tr><td>'+d+'</td><td>'+h+'</td><td><input style="zoom:1.7" type="radio" name="ANOMALIA" value="'+id_btn+'"></input></td></tr>');
							$("input[type=radio]").parent().css("background-color","transparent")
							$("input[type=radio]").parent().css("padding-right","2%")
							$("#insGiust").click(function(){
								var d=$($("input[type=radio]:checked")[0]).attr('value')
								var GIORNODA=(d).replace(/-/g,"/");
								var GIORNOA=(d).replace(/-/g,"/");
								var t=GIORNODA;
								var GIORNODA=t.split("/")[0]+"/"+t.split("/")[1]+"/"+"20"+t.split("/")[2]
								var t=GIORNOA;
								var GIORNOA=t.split("/")[0]+"/"+t.split("/")[1]+"/"+"20"+t.split("/")[2]
								$('#giustifica_call').trigger("click", [ GIORNODA, GIORNOA ]);								
							})
							$("#insTimb").click(function(){
								var d=$($("input[type=radio]:checked")[0]).attr('value')
								var GIORNODA=(d).replace(/-/g,"/");
								var GIORNOA=(d).replace(/-/g,"/");
								var t=GIORNODA;
								var GIORNODA=t.split("/")[0]+"/"+t.split("/")[1]+"/"+"20"+t.split("/")[2]
								var t=GIORNOA;
								var GIORNOA=t.split("/")[0]+"/"+t.split("/")[1]+"/"+"20"+t.split("/")[2]
								alert("TODO: Creare il form per inserimento timbratura manuale")	
								//$('#giustifica_call').trigger("click", [ GIORNODA, GIORNOA ]);								
							})
						}
					})
					if ( $('#anomalieTable').find("tr:gt(0)").length > 0 )	$('#anomalieTable').show();
				});
			},
			giustificativi_manuali:function(i,f){
				var DA=i;
				var A=f; 
				$.ajax({
				  url: server_url, 
				  data:"AZIONE=GESTIONEGIUSTIFICATIVI&DATAINIZIO="+DA+"&DATAFINE="+A,
				  method: 'GET'	
				}).success(function(a,b,c) {
					log.info("Giustificativi");
					$('#giusTable').find("tr:gt(0)").remove();
					var t=$(a).find('table[id="divDatiTB"]').find('tr');
					$.each(t,function(i,e){
						if ( i>0 && $(e).attr('vis')!="no"){
							var d=$(e).find('td').eq(3).text();
							var h=$(e).find('td').eq(4).text();
							var g=$(e).find('td').eq(2).text();
							var l=$(e).find('td').eq(10).text();
							var m=$(e).find('td').eq(9).text();
							$('#giusTable').find('tbody').append('<tr><td>'+d+" "+h+'</td><td>'+g+'</td><td>'+l+'</td><td>'+m+'</td></tr>');
						}
					})
					if ( $('#giusTable').find("tr:gt(0)").length > 0 )	$('#giusTable').show();
				});
			},
			timbrature_manuali:function(i,f){
				var DA=i;
				var A=f; 
				$.ajax({
				  url: server_url, 
				  data:"AZIONE=GESTIONETIMBRATURE&DATAINIZIO="+DA+"&DATAFINE="+A,
				  method: 'GET'	
				}).success(function(a,b,c) {
					log.info("Timbrature");
					$('#timbTable').find("tr:gt(0)").remove();
					var t=$(a).find('table[id="divDatiTB"]').find('tr');
					$.each(t,function(i,e){
						if ( i>0 && $(e).attr('vis')!="no"){
							var d=$(e).find('td').eq(2).text();
							var h=$(e).find('td').eq(3).text();
							var g=$(e).find('td').eq(4).text();
							var l=$(e).find('td').eq(5).text();
							var m=$(e).find('td').eq(8).text();							
							var n=$(e).find('td').eq(9).text();						
							var raw='<tr><td>'+d+" "+h+" "+g+'</td><td>'+l+'</td><td>'+m+'</td><td>'+n+'</td></tr>'
						 	$('#timbTable').find('tbody').append(raw);						
						}
					})
					if ( $('#timbTable').find("tr:gt(0)").length > 0 )	$('#timbTable').show();
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
                          log.info("Riepiloghi Contatori: "+ DA+" "+A);
						  __CAUSALE="00.00";
	                      _CAUSALE=$(a).find('#divDatiTB tr td[align="right"]');
                          $.each(_CAUSALE,function(i,e){
							  if (i<(_CAUSALE.length-1) && ($(e).text()!=="" && typeof $(e).text()!=="undefined") ){ 
								var n=parseFloat($(e).text());
								//VERIFICA FLOAT
								if (Number(n) === n && n % 1 !== 0){									
									CAUSALE=data.sommaorario(__CAUSALE,n);
									__CAUSALE=CAUSALE;
									console.log(__CAUSALE)
									  $('#quantita1').FlipClock(__CAUSALE.split('.')[0], {
											clockFace: 'Counter'
									  });
									  $('#quantita1').show();
  									  $('#separatore').show();
									  $('#quantita2').FlipClock(__CAUSALE.split('.')[1], {
											clockFace: 'Counter'
									  });
									  /*TODO: quando un saldo in ore e minuti si presenta nel formato 3.3 ossia 3 ore e 30 min, il counter i minuti li interpreta 
									  non come trenta ma come tre e quindi visualmente diventa 03. DA SISTEMARE*/
									  $('#quantita2').show();
								}else {
									if (Number(n) === n && n % 1 === 0){
										CAUSALE=CAUSALE+n;
										  $('#quantita1').FlipClock(CAUSALE, {
												clockFace: 'Counter'
										  });
  										  $('#quantita1').show();
  									      $('#separatore').hide();
										  $('#quantita2').hide();
									}								
								}
							  }													
				          })
                    });
            },
            saldi:function(da,a){
            var DA=da;
            var A=a;
            $.ajax({
				   dataType:"html",
				   dataFilter:function(d,t){
						return $(d);
				   },
                   url: server_url,
                   data:"AZIONE=CARTELLINO&DETTAGLIOAZIONE=TOTALIVB&DATAINIZIO="+DA+"&DATAFINE="+A,
                   method: 'GET'
                   }).success(function(a,b,c) {
                          log.info("Saldi: "+ DA+" "+A);
	                      _TABLE=$(a).find('.CSTR').parent().parent().next().find('table').eq(1);
                          _TABLE.addClass('bordered condensed responstable')
						  _TABLE.addClass('u-max-full-width')
                          $('#totaliTab').append($(_TABLE));
						  $('#totaliTab').find('.footer').parent().remove();	
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
                    log.info("Recupero Causali: ");
                    CAUSALI=$(a).find('select[name="VOCISELEZIONATE"]');
					$(CAUSALI).removeAttr('multiple');
					$('select[name="VOCISELEZIONATE"]').remove();
                    $('#causale_sel').append(CAUSALI);
					$(CAUSALI).addClass('u-max-full-width')
					
					
					/*gestione del plugin jquery SELECT2 per sostituire il controllo html select e options.
					E' stato sostituito perche' il select html su android non funziona correttamente. 
					Magari una futura release phonegap e cordova sistemeranno il bug. per ora alla versione 8 di 
					Phonegap e Cordova non funziona.
					*/
					$(CAUSALI).addClass('js-example-basic-single')
					$(CAUSALI).select2({
						placeholder:'Selezionare una causale...',
						minimumResultsForSearch:Infinity
					})
					//sembra che se non viene selezionato un valore iniziale e invocato il trigger change l'assegnazione di un valore non funziona	
					$(CAUSALI).val('1').trigger('change')
					
					
                });
            },
            giustificativi:function(){
		        $.ajax({
		            dataType:"html",
		            dataFilter:function(d,t){
		               return $(d);
		            },
		            url: server_url,
		            data:"AZIONE=PROSPETTIGIUSTIFICATIVI",
		            method: 'GET'
		            }).success(function(a,b,c) {
		                log.info("Recupero Giustificativi: ");
		                GIUSTIFICATIVI=$(a).find('select[name="VOCISELEZIONATE"]');
						$(GIUSTIFICATIVI).removeAttr('multiple');
						$('select[name="VOCISELEZIONATE"]').remove();
		                $('#giustificativo_sel').append(GIUSTIFICATIVI);
						$(GIUSTIFICATIVI).addClass('u-max-full-width')
						

						/*gestione del plugin jquery SELECT2 per sostituire il controllo html select e options.
						E' stato sostituito perche' il select html su android non funziona correttamente. 
						Magari una futura release phonegap e cordova sistemeranno il bug. per ora alla versione 8 di 
						Phonegap e Cordova non funziona.
						*/
						$(GIUSTIFICATIVI).addClass('js-example-basic-single')
						$(GIUSTIFICATIVI).select2({
							placeholder:'Selezionare un giustificativo...',
							minimumResultsForSearch:Infinity
						})
						//sembra che se non viene selezionato un valore iniziale e invocato il trigger change l'assegnazione di un valore non funziona	
						$(GIUSTIFICATIVI).val('1').trigger('change')

						
	            });
            },
			giustificativo:function(da,a,oraI,oraF,desc,tipodivoce,iddip){
				var DA=da;
				var A=a
				var ORAI=oraI;
				var ORAF=oraF;
				var DESC=desc;
				var TIPODIVOCE=tipodivoce;
				var IDDIP=iddip;
				$.ajax({
				  url: server_url,
                  async:false,
                  data:"fmv_tipogidvoce="+TIPODIVOCE+"&fmv_datainizio="+DA+"&fmv_datafine="+A+"&fmv_orainizio="+ORAI+"&fmv_orafine="+ORAF+"&fmv_durata=&fmv_note="+DESC+"&azione=AZIONESUGIUST&dettaglioazione=INS&LD=&provenienza=GESTIONEGIUSTIFICATIVI&fmv_idgiust=&fmv_iddip="+IDDIP+"&DATAINIZIO="+DA+"&DATAFINE="+A,
				  method: 'POST'	
				}).success(function(a,b,c) {
					avvisi.comunicazione("Inserimento Effettuato!")
				}).error(function(a){console.log(a)});
            }
        };

		var notifiche={
			connetti:function(u,p){
				spinner.attesa("Ricevo notifiche...");
				//nome="edgardo.ambrosi";
				nome="timeweb";
				password="timeweb";
				$.ajax({
				  async:false,
				  url: notifiche_aut_url,
				  //data:"u="+u+"&pw="+p,
				  data:"u="+nome+"&pw="+password,
				  method: 'GET'	
				}).success(function(a,b,c) {
					log.info("Autenticazione Notifiche Effettuata");
					TICKET=$(c.responseText).text().replace("\n", ""); //sostituisco \n perchè il testo estratto con text() come primo carattere lo include.
					//subito dopo il login al servizio notifica effettuo il download delle notifiche
		       		notifiche.library($('#NomeUtente').val());
				}).error(function(a,b,c){
					log.info("Autenticazione Notifiche Incompleta. Non si potranno recuperare le comunicazioni da parte dell'ente. Verificare le credenziali del sistema di notifica.")	
					avvisi.comunicazione("Autenticazione Notifiche Incompleta. Non si potranno recuperare le comunicazioni da parte dell'ente. Verificare le credenziali del sistema di notifica.")	
				});
			},
			library:function(u){
				$.ajax({
				  url: notifiche_url+"/"+u,
                  async:false,
				  data:"gui=false&target=Sites/notifications/documentLibrary&urlProxy=https://servizipdr.cedrc.cnr.it:/new/alfresco/service/jsonpProxy?url=&applicationId=timeweb/"+u+"&alf_ticket="+TICKET,
				  dataType:"script", 
				  method: 'GET'	
				}).success(function(a,b,c) {
					log.info("Recupero Libreria Notifiche Effettuata");
					var t=setInterval(function(){
					 if ( typeof recuperaNotifiche === "function"){
						clearInterval(t);
						console.log=log.info
                        recuperaNotifiche(true);
						var f=setInterval(function(){
							if ( listaNotification.length > 0 ){
								$('#notifiche_call').attr('data-badge',listaNotification.length)
								
								/*TODO:DA QUI*/
								COMUNICAZIONI=listaNotification;
								/*TODO:*/
							}
						},1000)
						var g=setTimeout(function(){
								clearInterval(f);
								clearTimeout(g);
						},30000)
					 }	
					},5000);
                    var v=setInterval(function(){
						spinner.termina()	
	                    clearInterval(v);
                    },5000)
				}).error(function(a,b,c){
					log.info("Libreria notifiche non recuperata. Le notifiche non saranno disponibili.")
					avvisi.comunicazione("Libreria notifiche non recuperata. Le notifiche non saranno disponibili.")	
                });
			}
		}

		/*CONTROLLO TIMBRATURE SUCCESSIVE*/
		$('#strisciata').click(function(){
			log.info("...controllo timbrature...")
			env.reset();
			timeweb.cartellino();
		});

		$('#saldo').click(function(){
			log.info("...controllo timbrature...")
			env.reset();
			timeweb.cartellino();
		});

		$('#giustifica_call').on("click",function(a,b,c){

        	$('.menu-act').trigger('click', [0])

        	$('.overlay-hide').trigger('click')

        	
			var GIORNODA=b;
			var GIORNOA=c;
			if (typeof b == "undefined" || typeof a == "undefined" ){
				GIORNODA=DATA_GIORNO_LAVORATO
				GIORNOA=DATA_GIORNO_LAVORATO
			}
			$('#form_giustificativi').data("DA",GIORNODA);
			$('#form_giustificativi').data("A",GIORNOA);
            timeweb.giustificativi();
			$('#form_giustificativi').show()
            $('#giustificativo_sel').show();		
		})

		$('#calibra_call').on("click",function(a,b,c){

        	$('.menu-act').trigger('click', [0])

        	$('.overlay-hide').trigger('click')

			$('.finger').removeClass('finger-left')
		    var calibrazione = window.openDatabase("Calibrazione", "1.0", "Calibrazione", 200000);
			calibrazione.transaction(
				function(tx){tx.executeSql('DROP TABLE IF EXISTS Calibrazione')},
				function(tx,err){log.info("Error processing SQL: "+err);}							
			);
			MEMORCOORD=[0,0]
   			main.ottimizzo();
		})


		$('#form_giustificativi-conferma').click(function(){
			//$('#form_giustificativi').css("top","-100%");
			$('#form_giustificativi').hide();	
			var GIORNODA=$('#form_giustificativi').data("DA");
			var GIORNOA=$('#form_giustificativi').data("A");
			var DA=$('#form_giustificativi input[name="DA"]').val();
			var A=$('#form_giustificativi input[name="A"]').val();
			var DESC=$('#form_giustificativi textarea').val();
			alert(GIORNODA+" "+GIORNOA+" "+DA+" "+A+" "+DESC+" "+GIUSTIFICATIVO_SEL+" "+IDDIP);
		    //timeweb.giustificativo(GIORNODA,GIORNOA,"7:50","9:38","ADITERM RISONANZA MAGNETICA",GIUSTIFICATIVO_SEL,IDDIP);			
		})
		$('#form_giustificativi-annulla').click(function(){
			//$('#form_giustificativi').css("top","-100%")
			$('#form_giustificativi').hide()	
		})


		$('.received').click(function(){
			log.info("...tento la disconnessione...");
			spinner.attesa("...tento la disconnessione...");			
			timeweb.disconnetti();
			$('#monitor').hide();
            $('.menu-act').hide();
			env.reset();
		});

		$('.listening').click(function(){
			spinner.attesa("...tento la connessione...");
			log.info("...tento la connessione...");
			container.receivedEvent('deviceready');
		});

		$("#reset_set").click(function(){
			main.reset_impostazioni(true);
			main.salva_impostazioni();
		});
		$("#salva_set").click(function(){
			ORARIOINIZIOLAVORO=$("input[name='ORARIOINIZIOLAVORO']").val();
			TOTALE=$("input[name='TOTALE']").val();
			PAUSAPRANZO=$("input[name='PAUSAPRANZO']").val();
			server_url=$("textarea[name='server_url']").val();
			notifiche_url=$("textarea[name='notifiche_url']").val();
			notifiche_aut_url=$("textarea[name='notifiche_aut_url']").val();
			main.reset_impostazioni();
			main.salva_impostazioni(true);
					
		});

		$("input[name='SaveCred']").click(function() {
			if ( $("input[name='SaveCred']").prop('checked') ){
		        var db = window.openDatabase("Credenziali", "1.0", "Credenziali", 200000);
				db.transaction(
					function(transaction){
						transaction.executeSql(
						  'select username,password from credenziali;',
						  [],
						  function(tx, results){
							  for (var j=0; j<results.rows.length; j++) {
								var row = results.rows.item(j);
									$('#NomeUtente').val(row['username']);
									$('#Password').val(row['password']);
							  }
						   }
						 );
					}
				)			
			 }	

			if ( !($("input[name='SaveCred']").prop('checked')) ){
		        var db = window.openDatabase("Credenziali", "1.0", "Credenziali", 200000);
				db.transaction(
					function(transaction){
						transaction.executeSql(
						  'DROP TABLE IF EXISTS credenziali;'
						);
					}
				)			
			 }	

		});

		$("#credset").click(function() {
			env.reset();
			//se SaveCred è vero, creo DB credenziali se non esiste
			if ( $("input[name='SaveCred']").prop('checked') ){
		        var credenziali = window.openDatabase("Credenziali", "1.0", "Credenziali", 200000);
				credenziali.transaction(
					function(tx){tx.executeSql('DROP TABLE IF EXISTS credenziali')},
					function(tx,err){log.info("Error processing SQL: "+err);}							
				);
				credenziali.transaction(
					function(tx){tx.executeSql('CREATE TABLE IF NOT EXISTS credenziali (username unique,password)')},
					function(tx,err){log.info("Error processing SQL: "+err);}							
				);
                credenziali.transaction(
					function(tx) {
				        tx.executeSql("INSERT INTO credenziali (username, password) VALUES ('"+$('#NomeUtente').val()+"','"+$('#Password').val()+"')");
				    }
				);			
			}
			spinner.attesa("Connessione in corso...");
			timeweb.connetti($('#NomeUtente').val(),$('#Password').val(),DATA_GIORNO_LAVORATO);
            if (CONNESSO) notifiche.connetti($('#NomeUtente').val(),$('#Password').val());
		});

		$('#NomeUtente').on('input', function() {
			$('#Password').on('input', function() {
				$("#credset").prop("disabled", false);
			});		
		});

		$('#GiornoLavoro').on('input',function(){
			log.info("...controllo timbrature del giorno scelto...")
			env.reset();
			timeweb.cartellino(DATA_GIORNO_LAVORATO);
		});

		var s=true
		$('.menu-act').click(function(e,p){
			if(p==undefined && s==true){
				s=false
				console.log(s)
				ss=setTimeout(function(){
					clearTimeout(ss)
					s=true
					console.log(s)
				},420)				
				$('.overlay-menu').toggleClass('overlay-menu-open')				
			}
			if(p==1 && s==true){
				s=false
				ss=setTimeout(function(){
					clearTimeout(ss)
					s=true
				},320)				
				$('.overlay-menu').toggleClass('overlay-menu-open')
				log.info("Apri o Ritira Menu")
			}	 
			if(p==0 && s==true){
				s=false
				ss=setTimeout(function(){
					clearTimeout(ss)
					s=true
				},320)				
				$('.overlay-menu').removeClass('overlay-menu-open')				 
				log.info("Chiudi Menu")				
			}	 
		});		

		$('#monitor_call').on("click",function(a,b,c){

        	$('.menu-act').trigger('click', [0])

        	$('.overlay-hide').trigger('click')


            $('#monitor').show();	
		})

		$('#impostazioni_call').click(function(){
 
        	$('.menu-act').trigger('click', [0])

        	$('.overlay-hide').trigger('click')

			$("input[name='ORARIOINIZIOLAVORO']").val(ORARIOINIZIOLAVORO);
			$("input[name='TOTALE']").val(TOTALE);
			$("input[name='PAUSAPRANZO']").val(PAUSAPRANZO);
			$("textarea[name='server_url']").val(server_url);
			$("textarea[name='notifiche_url']").val(notifiche_url);
			$("textarea[name='notifiche_aut_url']").val(notifiche_aut_url);
            $('#form_settaggi').show();
			//alert($('#form_settaggi').height())
		});		

		$('#contatti_call').click(function(){

        	$('.menu-act').trigger('click', [0])

        	$('.overlay-hide').trigger('click')

	        	
    		$('#form_contatti').show();	    	
		});		

		$('#informazioni_call').click(function(){

        	$('.menu-act').trigger('click', [0])

        	$('.overlay-hide').trigger('click')
        	
			$('#form_informazioni').show();	    	

		});		

		$('#totalizza').click(function(){
			$('#totali_call').trigger("click");
		
		})
        $('#totali_call').click(function(){
 
        	$('.menu-act').trigger('click', [0])

        	$('.overlay-hide').trigger('click')

            $('#totaliTab').find('table[class~="responstable"]').remove();

			env.reset();
            timeweb.causali();
            $('#totali').show();			

            var _t=$('#mese_corrente').val();

	        var t=data.iniziofinemese(new Date(_t));

            timeweb.saldi(data.composizione(t[0]),data.composizione(t[1]));
            
        })


        $('#conteggi_call').click(function(){

        	$('.menu-act').trigger('click', [0])

        	$('.overlay-hide').trigger('click')

            $('#quantita1').FlipClock(0, {
            	clockFace: 'Counter'
            });
            $('#quantita2').FlipClock(0, {
            	clockFace: 'Counter'
            });

			env.reset();
            timeweb.causali();
            $('#conteggi').show();

            var _t=$('#mese_corrente').val();

	        var t=data.iniziofinemese(new Date(_t));

            timeweb.saldi(data.composizione(t[0]),data.composizione(t[1]));
            
        })

		$('#anomali').click(function(){
			$('#anomalie_call').trigger("click");
		})					
		$('#anomalie_call').click(function(){

        	$('.menu-act').trigger('click', [0])

        	$('.overlay-hide').trigger('click')


			$('#anomalie').show()
			
			env.reset();
            timeweb.giustificativi();
            
            var _t=$('#anomalie_mese_corrente').val();
            
            var t=data.iniziofinemese(new Date(_t))

			timeweb.anomalie(data.composizione(t[0]),data.composizione(t[1]));

        });

		$('#giustificati').click(function(){
			$('#giustificativi_call').trigger("click");
		})					
		$('#giustificativi_call').click(function(){

        	$('.menu-act').trigger('click', [0])

        	$('.overlay-hide').trigger('click')

			$('#giustifica_manuale').show()
			
			env.reset();
            timeweb.giustificativi();
            
            var _t=$('#giustifica_mese_corrente').val();
            
            var t=data.iniziofinemese(new Date(_t))

			timeweb.giustificativi_manuali(data.composizione(t[0]),data.composizione(t[1]));
            
        });

		$('#timbrati').click(function(){
			$('#timbrature_call').trigger("click");
		})					
		$('#timbrature_call').click(function(){

        	$('.menu-act').trigger('click', [0])

        	$('.overlay-hide').trigger('click')

			
			$('#timbrature_manuali').show()
			
			env.reset();
            timeweb.giustificativi();
            
            var _t=$('#timbrature_mese_corrente').val();
            
            var t=data.iniziofinemese(new Date(_t))

			timeweb.timbrature_manuali(data.composizione(t[0]),data.composizione(t[1]));
            
        });

		$('#calcola').click(function(){
			env.reset();
			timeweb.contatori(DATA_GIORNO_INIZIO,DATA_GIORNO_FINE,CAUSALE_SEL);
        });

		$('#notifiche_call').click(function(){

        	$('.menu-act').trigger('click', [0])

        	$('.overlay-hide').trigger('click')


			$('#pannello_notifiche').show()
			$("div[id*='info']").remove()
			var f=setInterval(function(){
				if ( listaNotification.length > 0 ){
					$.each(listaNotification,function(i,e){
						var d=$('#elenco_notifiche').append('<div id="info-'+i+'"></div>');
						$("#info-"+i).addClass('error');
						$("#info-"+i).append('<h4 style="color:black">'+atob($.parseJSON(e)[0].titolo)+'</h4>')
						$("#info-"+i).append('<p style="color:black;large">'+atob($.parseJSON(e)[0].notification)+'</p>')				
					})
					clearInterval(f);
				}
			},1000)
        });
   		
		$('.overlay-hide').click(function(e) {
		  var vpHeight = window.innerHeight;
		  var vpWidth = window.innerWidth;
		  var dimensioneIconaX=$($('.overlay-hide')[0]).css('background-size').split(" ")[0].replace('px','')
		  var dimensioneIconaY=$($('.overlay-hide')[0]).css('background-size').split(" ")[1].replace('px','')		  
		  var colpitoX=e.pageX;
  		  var colpitoY=e.pageY;
		  var sogliaX=vpWidth - dimensioneIconaX;	
		  var sogliaY=dimensioneIconaY
		  /*questo condizione e' vera quando il click e' generato dal trigger*/	
		  if (( typeof colpitoX == "undefined" ) && ( typeof colpitoY == "undefined" )){
	   	  	  //console.log(dimensioneIconaX+"   "+colpitoX+"  "+sogliaX)
 	   	  	  //console.log(dimensioneIconaY+"   "+colpitoY+"  "+sogliaY)
			  $('.notifyjs-corner').remove()	
 	   	  	  $('.overlay-hide').hide()
			  $('.menu-act').trigger('click', [0]) 	   	  	  
			  //elimino tutte le notifiche	
	   	  }	  
		  if ((colpitoX > sogliaY ) && ( colpitoY < sogliaY )){
	   	  	  //console.log(dimensioneIconaX+"   "+colpitoX+"  "+sogliaX)
 	   	  	  //console.log(dimensioneIconaY+"   "+colpitoY+"  "+sogliaY)
			  $('.notifyjs-corner').remove()	
 	   	  	  $('.overlay-hide').hide()
			  $('.menu-act').trigger('click', [0]) 	   	  	  
			  //elimino tutte le notifiche	
	   	  }	  

		});

		$('.zoom').click(function(e){
			  $('.menu-act').trigger('click', [0]) 	   	  	  
		});

		var main={
			calibro:function(mess,coord){
				var xBest=0;
				var yBest=0;
				
				$("#flusso").find('p').remove()				
				$('<p style="color:white;font-size:xx-large;">'+mess+'</p>').insertBefore('#salta')

				var touchmeBullet=$('#calibratore');
				var touchTarget=$('#calibrazione');
				$(touchTarget).bind('click',onTarget);
				function onTarget(e) {
					$('#calibratore').css('top',e.clientY - ( $('.circle').height() / 2 ))
					$('#calibratore').css('left',e.clientX - ( $('.circle').width() / 2 ))
					if (coord=='X') {
						$('#calibratore').show()
						$(touchTarget).unbind('click')
						 xBest=e.clientX 
					}
					if (coord=='Y') {
						$('#calibratore').show()
						$(touchTarget).unbind('click')
						yBest=e.clientY
					}
				
				}
			    var t=setInterval(function(){
					if (xBest > 0 ) {
						clearInterval(t)
						MEMORCOORD[0]=xBest
					}
					if (yBest > 0 ) {
						clearInterval(t)
						MEMORCOORD[1]=yBest
					}
				},1000)

			},
			ottimizzo:function(){
				//APRO IL DB DELLE COORDINATE...
		        var db = window.openDatabase("Calibrazione", "1.0", "Calibrazione", 200000);
				db.transaction(
					//...SE LA TABELLA ESISTE PRELEVO LE COORDINATE X Y...
					function(transaction){
						transaction.executeSql(
						  'select X,Y from Calibrazione;',
						  [],
						  function(tx, results){
							for (var j=0; j<results.rows.length; j++) {
								var row = results.rows.item(j);
								//...ASSOCIO LE X Y ALLA VARIABILE GLOBALE MEMORCOORD...
								MEMORCOORD[0]=row['X'];
								MEMORCOORD[1]=row['Y'];

								//...QUINDI PROCEDO CON LA CALIBRAZIONE AUTOMATICA...
								var iphoneResolutionRiferimento=844;
								var vpWidth = MEMORCOORD[0];
								var vpHeight = MEMORCOORD[1] ;

								/*Quindi calcolo la densita' diagonale per il dispositivo che suppongo sia inferiore a quella del riferimento*/
								var thisDeviceResolution=Math.sqrt(Math.pow(vpHeight,2)+Math.pow(vpWidth,2))
								/*ED INFINE ARIBITRARIAMENTE IPOTIZZO CHE UNO ZOOM OTTIMALE PER UN DISPOSITIVO RISPETTO ALL'IPHONE E' DATO DALLA SEGUENTE FORMULA (EMPIRICA):
									CALCOLO IL RAPPORTO TRA LA  DENSITA_DEL_DISPOSITIVO E LA DENSITA_IPHONE CHE SARA' COMPRESA TRA 0 E 1.
									CALCOLO IL 5% DI DEL PRECEDENTE RAPPORTO E LO USO COME CORRETTIVO
									AGGIUNGO IL 5% AL PRECEDENTE RAPPORTO. 
									QUESTO E' LO ZOOM-OUT CHE APPLICHERO' ALLA APP SU QUESTO DISPOSITIVO.
								*/
								var zoom=(thisDeviceResolution/iphoneResolutionRiferimento)+((thisDeviceResolution/iphoneResolutionRiferimento*5)/100)
								$(".zoom").css("top", "0");
								$(".zoom").css("left", "0");
								$(".zoom").css("transform-origin","top");
				 				$(".zoom").css("transform", "scaleY("+zoom+")");
								$(".zoom").css('zoom',zoom)

								//document.write(vpHeight+" "+ vpWidth +" "+iphoneResolutionRiferimento +" "+ thisDeviceResolution+" "+ zoom)
								log.info("Y "+vpHeight+"-----"+" X "+vpWidth+"-----"+" Zoom per questo dispositivo "+zoom )

							}

						   },
						   //...INVECE SE LA TABELLA CALIBRAZIONE NON ESISTE...	
						   function(e){
								//...PROCEDO CON UNA NUOVA CALIBRAZIONE
								$('#salta').click(function(){
									$('#calibrazione').hide()								
								})
								$('#calibrazione').show()		
								main.calibro("1) Indicare l\'angolo in alto a destra!",'X')
								var tx=setInterval(function(){
									if ( MEMORCOORD[0] > 0 ){
										clearInterval(tx)
										main.calibro("2) Indicare l\'angolo in basso a sinistra!","Y")
										$('.finger').addClass('finger-left')
										var ty=setInterval(function(){
											if ( MEMORCOORD[1] > 0 ){
												clearInterval(ty)
												avvisi.richiesta("Calibrazione","Confermi i punti selezionati?")
												$('#calibrazione').hide()

												var iphoneResolutionRiferimento=844;
												var vpWidth = MEMORCOORD[0];
												var vpHeight = MEMORCOORD[1] ;

												/*Quindi calcolo la densita' diagonale per il dispositivo che suppongo sia inferiore a quella del riferimento*/
												var thisDeviceResolution=Math.sqrt(Math.pow(vpHeight,2)+Math.pow(vpWidth,2))
												/*ED INFINE ARIBITRARIAMENTE IPOTIZZO CHE UNO ZOOM OTTIMALE PER UN DISPOSITIVO RISPETTO ALL'IPHONE E' DATO DALLA SEGUENTE FORMULA (EMPIRICA):
													CALCOLO IL RAPPORTO TRA LA  DENSITA_DEL_DISPOSITIVO E LA DENSITA_IPHONE CHE SARA' COMPRESA TRA 0 E 1.
													CALCOLO IL 5% DI DEL PRECEDENTE RAPPORTO E LO USO COME CORRETTIVO
													AGGIUNGO IL 5% AL PRECEDENTE RAPPORTO. 
													QUESTO E' LO ZOOM-OUT CHE APPLICHERO' ALLA APP SU QUESTO DISPOSITIVO.
												*/
												var zoom=(thisDeviceResolution/iphoneResolutionRiferimento)+((thisDeviceResolution/iphoneResolutionRiferimento*5)/100)
												$(".zoom").css("top", "0");
												$(".zoom").css("left", "0");
												$(".zoom").css("transform-origin","top");
								 				$(".zoom").css("transform", "scaleY("+zoom+")");
												$(".zoom").css('zoom',zoom)


												//document.write(vpHeight+" "+ vpWidth +" "+iphoneResolutionRiferimento +" "+ thisDeviceResolution+" "+ zoom)
												log.info("Y "+vpHeight+"-----"+" X "+vpWidth+"-----"+" Zoom per questo dispositivo "+zoom )

											}
										},1000)
									}
								},1000)
						   }
					
						 );
					}
				)		

			},
			//Abilitazione ad usare le credenziali salvate.
			//Questo viene fatto simulando il click sul flag "Ricordami su questo dispositivo"
			salva_cred:function(){	$("input[name='SaveCred']").trigger('click')  },
			reset_impostazioni:function(feedback){
				var impostazioni = window.openDatabase("Impostazioni", "1.0", "Impostazioni", 200000);
				impostazioni.transaction(
				    function(tx){tx.executeSql('drop table impostazioni;')},
					function(err){avvisi.comunicazione("Reset Fallito")},
					function(){if (feedback) avvisi.comunicazione("Reset Eseguito")}
				)
			},
			salva_impostazioni:function(feedback){					
				//Cerca il db impostazioni, se c'è lo carico e imposto i settaggi. Altrimenti scrivo nel db quelli di default.
				var impostazioni = window.openDatabase("Impostazioni", "1.0", "Impostazioni", 200000);
				impostazioni.transaction(
					function(tx){tx.executeSql('create table impostazioni (orarioiniziolavoro,totale,pausa,server,notifiche_server,notifiche_auth);')},
					function(err){
						//se la tabella esiste viene restituito codice 5				
						if (err.code==5){
				            log.info("Carico Impostazioni");
							impostazioni.transaction(
								function(tx){
									tx.executeSql(
									  'select orarioiniziolavoro,totale,pausa,server,notifiche_server,notifiche_auth from impostazioni;',
									  [],
									  function(tx, results){
										  for (var j=0; j<results.rows.length; j++) {
											var row = results.rows.item(j);
												ORARIOINIZIOLAVORO=row['orarioiniziolavoro'];
												TOTALE=row['totale'];
												PAUSAPRANZO=row['pausa'];
												server_url=row['server'];
												notifiche_url=row['notifiche_server'];
												notifiche_aut_url=row['notifiche_auth'];
										  }
									   }
									 );
								}
							)			
						}
					},
					function(){
						log.info("Creazione Db...");
				        impostazioni.transaction(
				            function(tx){
								tx.executeSql("INSERT INTO impostazioni (orarioiniziolavoro,totale,pausa,server,notifiche_server,notifiche_auth) VALUES ('"+ORARIOINIZIOLAVORO+"','"+TOTALE+"','"+PAUSAPRANZO+"','"+server_url+"','"+notifiche_url+"','"+notifiche_aut_url+"');")
				            },
				            function(err){console.log(err)},
				            function(){
								log.info("Inizializzazione eseguita.")
								if (feedback) avvisi.comunicazione("Salvataggio eseguito");
							}
				                                 
				        )
				    }

				);
			}
		};

        var callbackFunc={
        	onConfirmCalibra:function(a){
           		if(a===1){
					//salva in DB le coordinate 
				    var calibrazione = window.openDatabase("Calibrazione", "1.0", "Calibrazione", 200000);
					calibrazione.transaction(
						function(tx){tx.executeSql('DROP TABLE IF EXISTS Calibrazione')},
						function(tx,err){log.info("Error processing SQL: "+err);}							
					);
					calibrazione.transaction(
						function(tx){tx.executeSql('CREATE TABLE IF NOT EXISTS Calibrazione (X,Y)')},
						function(tx,err){log.info("Error processing SQL: "+err);}							
					);
		            calibrazione.transaction(
						function(tx) {
						    tx.executeSql("INSERT INTO Calibrazione (X, Y) VALUES ('"+MEMORCOORD[0]+"','"+MEMORCOORD[1]+"')");
							avvisi.comunicazione("Calibrazione salvata. Non verra\' richiesta nuovamente. Per calibrare nuovamente utilizzare la voce nel menu.")
						}
					);			

				} 
           		if(a===2) {
					$('.finger').removeClass('finger-left')
           			MEMORCOORD=[0,0]	
           			main.ottimizzo()	
           		}	
        	}
        }	
        
        var spinner={
        	attesa:function(mess){
				try{
		            SpinnerPlugin.activityStart(mess);
				}catch(err){
					avvisi.comunicazione("Plugin non disponibile.")
				}
			},	
            termina:function(){
		     	var v=setInterval(function(){
					try{
                        SpinnerPlugin.activityStop();
                        clearInterval(v);
					}catch(err){
                        clearInterval(v);
					}
                },3000)           
            }
        }
        
		var avvisi={
			comunicazione:function(mess,title){
				if (title == "undefined"){
					navigator.notification.alert(mess,null,"AVVISO","Letto");
				}else{
					navigator.notification.alert(mess,null,title,"Letto");			
				}
			},
			richiesta:function(title,mess){
				if (title == "undefined"){
					navigator.notification.confirm(mess,callbackFunc.onConfirmCalibra,"AVVISO",["Ok","No"]);
				}else{
					navigator.notification.confirm(mess,callbackFunc.onConfirmCalibra,title,["Ok","No"]);			
				}
			}

		}

		var log={
			logDirectory:"",
			logFileName:"",
			init:function(fileName){
				var t=setInterval(function(){
					if ( cordova.file == null ) console.log("File System ancora non accessibile")
					if ( cordova.file != null ) {
						clearInterval(t)
						log.logDirectory=cordova.file.externalDataDirectory 
						log.logFileName=fileName;
						window.resolveLocalFileSystemURL(log.logDirectory, function(dir){
							dir.getFile(fileName, {create:false}, function(file) {
								file.remove(function(){console.log("File Rimosso")},function(err){console.log(err.code)})
							});
						});	
						window.resolveLocalFileSystemURL(log.logDirectory, log.writeHandler);					
					}	
				},1000)
			},
			writeHandler:function(dir){
				var wh=setInterval(function(){
					if (LOGINFOARRAY.length > 0) {
						var logMess=LOGINFOARRAY.pop(0)
						var logFile=log.logFileName
						var reader = new FileReader()
						reader.onload=function(){
							console.log(reader.result)
						}
						dir.getFile(logFile, {create:true}, function(file) {
							logOb = file;
							if(!logOb) return;
							var log = logMess + " [" + (new Date()) + "]\n";
							logOb.createWriter(function(fileWriter) {
								fileWriter.seek(fileWriter.length);
								var blob = new Blob([log], {type:'text/plain'});
								/*quando il metodo readAs... del FileReader viene invocato, scatta il trigger onload (definito sopra ) che stampa il blob*/
								reader.readAsText(blob);
								fileWriter.write(blob);
							}, log.writeError);

						});
					}	
				},500)
				
			},
			writeError:function(error){
				console.log("RICEVUTO ERRORE: "+error.message)
			},
			writeToFile:function(mess){	
				LOGINFOARRAY.push(mess)
			},
			info:function(mess){	
				var g=setInterval(function(){
					if ( log.logDirectory != "" ){
						clearInterval(g)
				 		log.writeToFile(mess);
					}
				},1000)
			}
		}	
		
		//Inizializzo il file di log
		log.init("log_info.log")
		
		//Controllo se demo scaduta
		log.info("Controllo validita demo...")
		check.validita();

		//OTTIMIZZO LA VIEW DELLA APP
		log.info("Ottimizzo il rendering della app...")
		main.ottimizzo();


		//Operazioni Principali
		main.salva_cred()
		main.salva_impostazioni()
});
