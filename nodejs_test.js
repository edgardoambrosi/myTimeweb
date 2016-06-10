var PAUSAPRANZO="00:30:00"

var esame_timbrature={
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
}



var TIMBRATURE="E08:32 U14:00(0001) E14:53(0001) U16:21"
var NUOVASTRISCIATA=new Array();
var TIMBRATUREARRAY=TIMBRATURE.split(" ")
var PAUSAPRANZOsec=esame_timbrature.insecondi(PAUSAPRANZO);

TIMBRATUREARRAY.forEach(function(e,i){
   if (e.search(/U[0-9]+:[0-9]+\(0001\)/)!==-1){
	   TIMBRATUREARRAY[i+1]=TIMBRATUREARRAY[i+1].replace("(0001)","")
   }
})

TIMBRATUREARRAY.forEach(function(e,i){
   //se trovi codice 0003		
   if (e.search(/(E|U)[0-9]+:[0-9]+\(0003\)/)!==-1 ){
   		//...ignori la timbrata		
		return;
	//se trovi 0001	vicino ad una ENTRATA
   }else if (e.search(/E[0-9]+:[0-9]+\(0001\)/)!==-1){
   		//calcoli la pausa pranzo in eccesso
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
