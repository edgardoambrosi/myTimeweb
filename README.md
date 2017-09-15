# Timeweb Monitor per Solari Web

Questa versione è stabile per Iphone e utilizza i seguenti plugin: 
notification, spinner, vibration,...

Le caratteristiche implementate sono 
Monitoraggio orari lavoro, Contaotri vari, Servizio di Notifica, Impostazioni della App, Salvataggio delle credenziali,...




POSSIBILI ERRORI QUANDO SI ESEGUE IL COMANDO
phonegap cordova compile android, bisogna eliminare la libreria jar android-support...


ERRORE:
BUILD FAILED
Total time: 4.473 secs
Error: /home/ambrosi/Desktop/AmbienteSviluppo/AlfrescoDev/Cordova-workspace/myTimeweb/platforms/android/gradlew: Command failed with exit code 1 Error output:
Java HotSpot(TM) 64-Bit Server VM warning: ignoring option MaxPermSize=256M; support was removed in 8.0
FAILURE: Build failed with an exception.
* What went wrong:
Execution failed for task ':transformClassesWithDexForDebug'.
> com.android.build.api.transform.TransformException: com.android.ide.common.process.ProcessException: java.util.concurrent.ExecutionException: com.android.dex.DexException: Multiple dex files define Landroid/support/v4/accessibilityservice/AccessibilityServiceInfoCompat$AccessibilityServiceInfoVersionImpl;


SOLUZIONE: eliminare da myTimeweb/platforms/android/libs/android-support-v13.jar
VEDI POST: https://stackoverflow.com/questions/36103262/how-to-fix-android-multiple-dex-files-define-exception

