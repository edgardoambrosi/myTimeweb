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
		
		var app = {
			//SERVER DISPONIBILE
			isAvailable:false,
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

		var avvisi={
			comunicazione:function(mess){
				navigator.notification.alert(mess,null,"AVVISO","LETTO");
			}
		}


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
								//...SE LO È ASSEGNO L'ENTRATA
								ENTRATA=XTIMBRATURE[i];
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
			},
			//calcola il range del mese corrente dal primo giorno al secondo giorno
            iniziofinemese:function(){
                var date = new Date();
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
						avvisi.comunicazione("Autenticazione non valida. L'accesso è garantito solo per la gestione dell'applicazione!")
						$('.received').show()
						$('.listening').hide();
						$('#credenziali').hide();					
		            	$('.menu-act').show();
					}else{
						console.log("Autenticazione Effettuata");
						/*ESTRAGGO DALLA RISPOSTA l'ID DEL DIPENDENTE*/
						var resp=$.parseHTML(a.responseText);
						var t=$(resp).find('.linkcomandi').attr('href')
						IDDIP=t.replace(/.*iddipselected=/g, "")
   													
						timeweb.cartellino(d);
						$('.received').show()
						$('.listening').hide();
						$('#credenziali').hide();					
						$('#monitor').show();
						$('#giustifica').show();
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
					//_TIMBRATURE='E10:56 U11:00'
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
			anomalie:function(i,f){
				var DA=i;
				var A=f; 
				$.ajax({
				  url: server_url, 
				  data:"AZIONE=CARTELLINO&DATAINIZIO="+DA+"&DATAFINE="+A,
				  method: 'GET'	
				}).success(function(a,b,c) {
					console.log("Anomalie");
					$('#anomalieTable').remove();
					var anomalieTable="<table id='anomalieTable'/>"
					$('#pannello-menu').append(anomalieTable);            
					$('#anomalieTable').append('<caption>ANOMALIE MESE CORRENTE</caption>');
					$('#anomalieTable').append('<th>GIORNO</th><th>TIMBRATURE</th>');
					var t=$(a).find('table[id="divDatiTB"]').find('tr');
					$.each(t,function(i,e){
						if ( i>0 && $(e).attr('vis')!="no"){
							var d=$(e).find('td').eq(0).text();
							var h=$(e).find('td').eq(2).text();
							var id_btn=(d.split(" ")[0]).replace(/\//g,"-")
							$('#anomalieTable').append('<tr><td>'+d+'</td><td>'+h+'</td><td><input type="button" id="'+id_btn+'" value="CAUSALE"></input></td></tr>');
							$("#"+id_btn).click(function(){
								var GIORNODA=($(this).attr('id')).replace(/-/g,"/");
								var GIORNOA=($(this).attr('id')).replace(/-/g,"/");
								var t=GIORNODA;
								var GIORNODA=t.split("/")[0]+"/"+t.split("/")[1]+"/"+t.split("/")[2].replace(/[0-9]+/,"2016")
								var t=GIORNOA;
								var GIORNOA=t.split("/")[0]+"/"+t.split("/")[1]+"/"+t.split("/")[2].replace(/[0-9]+/,"2016")
								//console.log(GIORNODA+" "+GIORNOA+" "+"7:50"+" "+"9:38"+" "+"ADITERM RISONANZA MAGNETICA"+" "+GIUSTIFICATIVO_SEL+" "+IDDIP);
 							    timeweb.giustificativo(GIORNODA,GIORNOA,"7:50","9:38","ADITERM RISONANZA MAGNETICA",GIUSTIFICATIVO_SEL,IDDIP);
							})
						}
					})

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
                          console.log("Saldi: "+ DA+" "+A);
	                      _TABLE=$(a).find('.CSTR').parent().parent().next().find('table').eq(1);
                          _TABLE.addClass('responstable')
                          $('#saldi').append($(_TABLE));
                          $('#saldi').css('display','block')
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
		                console.log("Recupero Giustificativi: ");
		                GIUSTIFICATIVI=$(a).find('select[name="VOCISELEZIONATE"]');
						$(GIUSTIFICATIVI).removeAttr('multiple');
						$('select[name="VOCISELEZIONATE"]').remove();
		                $('#giustificativo_sel').append(GIUSTIFICATIVI);
						$(GIUSTIFICATIVI).css("position","relative")
						$(GIUSTIFICATIVI).css("top","-30px")
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
				try{
                    SpinnerPlugin.activityStart("Ricevo notifiche...");
				}catch(err){
					avvisi.comunicazione("Plugin non disponibile.")
				}
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
					console.log("Autenticazione Notifiche Effettuata");
					TICKET=$(c.responseText).text().replace("\n", ""); //sostituisco \n perchè il testo estratto con text() come primo carattere lo include.
					//subito dopo il login al servizio notifica effettuo il download delle notifiche
		       		notifiche.library($('#NomeUtente').val());
				}).error(function(a,b,c){
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
					console.log("Recupero Libreria Notifiche Effettuata");
					var t=setInterval(function(){
					 if ( typeof recuperaNotifiche === "function"){
						clearInterval(t);
                        recuperaNotifiche(true);
						var f=setInterval(function(){
							if ( listaNotification.length > 0 ){
								$('#Notifiche').attr('data-badge',listaNotification.length)
								
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
						try{
                            SpinnerPlugin.activityStop();
                            clearInterval(v);
						}catch(err){
                            clearInterval(v);
						}
                    },5000)
				}).error(function(a,b,c){
					avvisi.comunicazione("Libreria notifiche non recuperata. Le notifiche non saranno disponibili.")	
                });
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

		$('#giustifica').click(function(){
			alert(DATA_GIORNO_LAVORATO+" "+DATA_GIORNO_LAVORATO+" "+"7:50"+" "+"9:38"+" "+"ADITERM RISONANZA MAGNETICA"+" "+GIUSTIFICATIVO_SEL+" "+IDDIP);
		    timeweb.giustificativo(GIORNODA,GIORNOA,"7:50","9:38","ADITERM RISONANZA MAGNETICA",GIUSTIFICATIVO_SEL,IDDIP);
		})

		$('.received').click(function(){
			console.log("...tento la disconnessione...");
			timeweb.disconnetti();
			$('#monitor').hide();
			$('#giustifica').hide();			
            $('.menu-act').hide();
			app.receivedEvent('deviceready');
			env.reset();
		});

		$('.listening').click(function(){
			console.log("...tento la connessione...");
			app.receivedEvent('deviceready');
		});

		$("#reset_set").click(function(){
			main.reset_impostazioni(true);
			main.salva_impostazioni();
		});
		$("#salva_set").click(function(){
			TOTALE=$("input[name='TOTALE']").val();
			PAUSAPRANZO=$("input[name='PAUSAPRANZO']").val();
			server_url=$("input[name='server_url']").val();
			notifiche_url=$("input[name='notifiche_url']").val();
			notifiche_aut_url=$("input[name='notifiche_aut_url']").val();
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
					function(tx,err){console.log("Error processing SQL: "+err);}							
				);
				credenziali.transaction(
					function(tx){tx.executeSql('CREATE TABLE IF NOT EXISTS credenziali (username unique,password)')},
					function(tx,err){console.log("Error processing SQL: "+err);}							
				);
                credenziali.transaction(
					function(tx) {
				        tx.executeSql("INSERT INTO credenziali (username, password) VALUES ('"+$('#NomeUtente').val()+"','"+$('#Password').val()+"')");
				    }
				);			
			}
			timeweb.connetti($('#NomeUtente').val(),$('#Password').val(),DATA_GIORNO_LAVORATO);
            if (CONNESSO) notifiche.connetti($('#NomeUtente').val(),$('#Password').val());
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

		$('#imgmenu').click(function(){
		//SE STO ACCENDENDO IL MENU, QUINDI E' SPENTO
		if(!$('.menu').is(":visible")){
			//ACCENDO IL MENU
            $('.menu').show();
            //ACCENDO IL SECONDO COMANDO MENU
			$('#imgset').show();
            //ACCENDO IL PANNELLO DEI MENU
            $('#pannello-menu').show();
            //RIMUOVO LE NOTIFICHE
			$("div[id*='info']").remove();
			//IN CASO DI FALLIMENTO DI LOGIN, MI ASPETTO CHE IL MONITOR SIA SPENTO E QUINDI NON DEVE ESSERE RISPENTO.
			if ($('#monitor').is(":visible")){
				$('#monitor').hide();
				$('#giustifica').hide();				
			}
			//SPENGO IL CONTROLLO DI AVVIO
            $('.app').hide();
         //SE LO STO SPEGNENDO   
         }else{
			//SPENGO IL MENU
            $('.menu').hide()
            //SPENGO IL SECONDO COMANDO MENU
			$('#imgset').hide();
            //SPENGO IL PANNELLO DEI MENU
            $('#pannello-menu').hide();
            //RIMUOVO LE NOTIFICHE
			$("div[id*='info']").remove();
			//IN CASO DI FALLIMENTO DI LOGIN, MI ASPETTO CHE IL MONITOR SIA SPENTO E QUINDI NON DEVE ESSERE RIACCESO.
			if ( CONNESSO ){
				$('#monitor').show();
				$('#giustifica').show();				
			}else{
				$('#monitor').hide();
				$('#giustifica').hide();				
			}
			//ACCENDO IL CONTROLLO DI AVVIO
            $('.app').show();
         }   
		});		

		$('#imgset').click(function(){
			$("input[name='TOTALE']").val(TOTALE);
			$("input[name='PAUSAPRANZO']").val(PAUSAPRANZO);
			$("input[name='server_url']").val(server_url);
			$("input[name='notifiche_url']").val(notifiche_url);
			$("input[name='notifiche_aut_url']").val(notifiche_aut_url);

            $('#pannello-menu').children().hide();
            $('.settings').fadeToggle("fast","linear");
				
		});		

        $('#Saldi').click(function(){
            $('#pannello-menu').children().hide();
            
            $('#saldi').find('table').remove();
            var t=data.iniziofinemese(new Date())
            timeweb.saldi(data.composizione(t[0]),data.composizione(t[1]));
            
            $('#quantita1').FlipClock(0, {
            	clockFace: 'Counter'
            });
            $('#quantita2').FlipClock(0, {
            	clockFace: 'Counter'
            });
			env.reset();
            timeweb.causali();
            $('#perConteggio').show();
            
        })
						
		$('#Causale').click(function(){
		    $('#pannello-menu').children().hide();
		    
			env.reset();
            timeweb.giustificativi();
            
            var t=data.iniziofinemese(new Date())
			timeweb.anomalie(data.composizione(t[0]),data.composizione(t[1]));

            $('#giustificativo_sel').show();
            
        });

		$('#calcola').click(function(){
			env.reset();
			timeweb.contatori(DATA_GIORNO_INIZIO,DATA_GIORNO_FINE,CAUSALE_SEL);
        });
		$('#Notifiche').click(function(){
            $('#pannello-menu').children().hide();
			$("div[id*='info']").remove()
			var f=setInterval(function(){
				if ( listaNotification.length > 0 ){
					$.each(listaNotification,function(i,e){
						var d=$('#pannello-menu').append('<div id="info-'+i+'"></div>');
						$("#info-"+i).addClass('info');
						$("#info-"+i).append('<h1>'+atob($.parseJSON(e)[0].titolo)+'</h1>')
						$("#info-"+i).append('<h2>'+atob($.parseJSON(e)[0].notification)+'</h2>')																
					})
					clearInterval(f);
				}
			},1000)
        });
   		

		var main={
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
					function(tx){tx.executeSql('create table impostazioni (totale,pausa,server,notifiche_server,notifiche_auth);')},
					function(err){
						//se la tabella esiste viene restituito codice 5				
						if (err.code==5){
				            console.log("Carico Impostazioni");
							impostazioni.transaction(
								function(tx){
									tx.executeSql(
									  'select totale,pausa,server,notifiche_server,notifiche_auth from impostazioni;',
									  [],
									  function(tx, results){
										  for (var j=0; j<results.rows.length; j++) {
											var row = results.rows.item(j);
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
						console.log("Creazione Db...");
				        impostazioni.transaction(
				            function(tx){
								tx.executeSql("INSERT INTO impostazioni (totale,pausa,server,notifiche_server,notifiche_auth) VALUES ('"+TOTALE+"','"+PAUSAPRANZO+"','"+server_url+"','"+notifiche_url+"','"+notifiche_aut_url+"');")
				            },
				            function(err){console.log(err)},
				            function(){
								console.log("Inizializzazione eseguita.")
								if (feedback) avvisi.comunicazione("Salvataggio eseguito");
							}
				                                 
				        )
				    }

				);
			}
		};

		//Operazioni Principali
		main.salva_cred()
		main.salva_impostazioni()
});
