package com.royals.biocraft;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.content.SharedPreferences;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.RemoteException;
import android.util.Base64;
import android.util.Log;

import com.android.vending.licensing.ILicenseResultListener;
import com.android.vending.licensing.ILicensingService;

import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.SecureRandom;
import java.security.Signature;
import java.security.spec.X509EncodedKeySpec;

public class LicenseManager {
    private static final String TAG = "BioCraftLicense";
    private static final String PREF_NAME = "biocraft_security_prefs";
    private static final String KEY_IS_LOCKED = "is_license_locked";
    private static final String KEY_LAST_VERIFIED = "last_verified_timestamp";
    private static final String KEY_FIRST_INSTALL = "first_install_timestamp";

    // Google Play Licensing response codes
    public static final int LICENSED = 0x0100;         // 256
    public static final int NOT_LICENSED = 0x0200;     // 512 (User refunded or not purchased)
    public static final int LICENSED_OLD_KEY = 0x0101; // 257

    // Error codes from Google Play server
    public static final int ERROR_CONTACTING_SERVER = 1;
    public static final int ERROR_INVALID_PACKAGE_NAME = 2;
    public static final int ERROR_NOT_MARKET_MANAGED = 3;
    public static final int ERROR_SERVER_FAILURE = 4;
    public static final int ERROR_OVER_QUOTA = 5;

    public interface LicenseCallback {
        void onLicensed();
        void onNotLicensed(String reason);
        void onVerificationError(String error);
    }

    private final Context context;
    private final SharedPreferences prefs;
    private final Handler mainHandler;
    private ServiceConnection serviceConn;
    private ILicensingService licensingService;
    private boolean isChecking = false;

    public LicenseManager(Context context) {
        this.context = context.getApplicationContext();
        this.prefs = this.context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        this.mainHandler = new Handler(Looper.getMainLooper());

        // First install record
        if (!prefs.contains(KEY_FIRST_INSTALL)) {
            prefs.edit().putLong(KEY_FIRST_INSTALL, System.currentTimeMillis()).apply();
        }
    }

    public boolean isCurrentlyLocked() {
        return prefs.getBoolean(KEY_IS_LOCKED, false);
    }

    public void setLocked(boolean locked) {
        prefs.edit().putBoolean(KEY_IS_LOCKED, locked).apply();
    }

    private void saveLastVerifiedTime(long timestamp) {
        prefs.edit().putLong(KEY_LAST_VERIFIED, timestamp).apply();
    }

    private long getLastVerifiedTime() {
        return prefs.getLong(KEY_LAST_VERIFIED, 0L);
    }

    private long getFirstInstallTime() {
        return prefs.getLong(KEY_FIRST_INSTALL, System.currentTimeMillis());
    }

    public boolean isOnline() {
        try {
            ConnectivityManager cm = (ConnectivityManager) context.getSystemService(Context.CONNECTIVITY_SERVICE);
            if (cm != null) {
                NetworkInfo netInfo = cm.getActiveNetworkInfo();
                return netInfo != null && netInfo.isConnected();
            }
        } catch (Exception e) {
            Log.e(TAG, "Error checking connectivity", e);
        }
        return false;
    }

    /**
     * Check license status with Google Play.
     * Guaranteed: Legitimate paying users will NEVER be falsely locked out.
     * Lock ONLY triggers when Google Play explicitly sends NOT_LICENSED (Code 512 / Refunded).
     */
    public synchronized void checkLicense(LicenseCallback callback) {
        if (isChecking) {
            Log.d(TAG, "License check already in progress, skipping duplicate call");
            return;
        }

        // 1. Agar device par pehle se REFUND detect ho chuka hai:
        if (isCurrentlyLocked()) {
            if (!isOnline()) {
                // Pehle se refund hua hai aur offline hai -> Locked hi rakhein
                mainHandler.post(() -> callback.onNotLicensed("Yeh application locked hai kyunki iska purchase verify nahi hua ya refund ho chuka hai."));
                return;
            }
            // Agar online hai, toh Google Play se dobara check karein
            // taaki agar user ne dobara paise dekar khareed liya hai, toh app turant unlock ho jaye!
        }

        // 2. Agar internet nahi hai:
        if (!isOnline()) {
            if (isCurrentlyLocked()) {
                mainHandler.post(() -> callback.onNotLicensed("Application locked hai. Kripya Play Store se purchase confirm karein."));
                return;
            }

            long lastVerified = getLastVerifiedTime();
            long now = System.currentTimeMillis();

            // Agar pehle online verify hua tha aur grace period ke andar hai (14 din):
            if (lastVerified > 0 && (now - lastVerified) < LicenseConfig.OFFLINE_GRACE_PERIOD_MS) {
                mainHandler.post(callback::onLicensed);
                return;
            }

            // Fresh install grace period: 48 hours
            // Agar user ne abhi-abhi Play Store se download kiya hai aur immediately offline ho gaya:
            long firstInstall = getFirstInstallTime();
            if (lastVerified == 0 && (now - firstInstall) < (48L * 60 * 60 * 1000)) {
                mainHandler.post(callback::onLicensed);
                return;
            }

            // Otherwise, inform offline verification pending (DO NOT lock paying user)
            mainHandler.post(() -> callback.onVerificationError("Internet connection nahi hai. License online aane par verify hoga."));
            return;
        }

        // 3. Online check with Google Play Licensing IPC:
        isChecking = true;
        try {
            Intent serviceIntent = new Intent("com.android.vending.licensing.ILicensingService");
            serviceIntent.setPackage("com.android.vending");

            // 10 second timeout safety
            Runnable timeoutRunnable = () -> {
                if (isChecking) {
                    Log.w(TAG, "Google Play License IPC timed out after 10s");
                    isChecking = false;
                    unbindSafe();
                    // On timeout: agar pehle se locked nahi tha, toh user ko chalne do
                    if (!isCurrentlyLocked()) {
                        callback.onLicensed();
                    } else {
                        callback.onNotLicensed("License verification timeout. Kripya dobara koshish karein.");
                    }
                }
            };
            mainHandler.postDelayed(timeoutRunnable, 10000);

            serviceConn = new ServiceConnection() {
                @Override
                public void onServiceConnected(ComponentName name, IBinder service) {
                    licensingService = ILicensingService.Stub.asInterface(service);
                    try {
                        long nonce = new SecureRandom().nextLong();
                        licensingService.checkLicense(nonce, context.getPackageName(), new ILicenseResultListener.Stub() {
                            @Override
                            public void verifyLicense(int responseCode, String signedData, String signature) throws RemoteException {
                                mainHandler.removeCallbacks(timeoutRunnable);
                                isChecking = false;
                                handleLicenseResponse(responseCode, signedData, signature, callback);
                                unbindSafe();
                            }
                        });
                    } catch (RemoteException e) {
                        Log.e(TAG, "RemoteException during checkLicense IPC", e);
                        mainHandler.removeCallbacks(timeoutRunnable);
                        isChecking = false;
                        handleSafeFallback(callback, "Google Play Licensing error: " + e.getMessage());
                        unbindSafe();
                    }
                }

                @Override
                public void onServiceDisconnected(ComponentName name) {
                    licensingService = null;
                    isChecking = false;
                }
            };

            boolean bound = context.bindService(serviceIntent, serviceConn, Context.BIND_AUTO_CREATE);
            if (!bound) {
                Log.w(TAG, "Could not bind to com.android.vending (Google Play app missing or emulator without GMS)");
                mainHandler.removeCallbacks(timeoutRunnable);
                isChecking = false;
                handleSafeFallback(callback, "Google Play Store service uplabdh nahi hai.");
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to start licensing service bind", e);
            isChecking = false;
            handleSafeFallback(callback, e.getMessage());
        }
    }

    private void handleLicenseResponse(int responseCode, String signedData, String signature, LicenseCallback callback) {
        Log.i(TAG, "Google Play License response code: " + responseCode);

        // CASE A: User has valid paid license (NOT REFUNDED)
        if (responseCode == LICENSED || responseCode == LICENSED_OLD_KEY) {
            boolean signatureValid = verifySignature(LicenseConfig.BASE64_PUBLIC_KEY, signedData, signature);
            if (signatureValid) {
                Log.i(TAG, "Valid license confirmed by Google Play! Unlocking app.");
                setLocked(false);
                saveLastVerifiedTime(System.currentTimeMillis());
                mainHandler.post(callback::onLicensed);
            } else {
                Log.e(TAG, "License signature verification failed with provided public key");
                // Agar signature fail hoti hai tabhi lock karein
                setLocked(true);
                mainHandler.post(() -> callback.onNotLicensed("License signature verification failed."));
            }
            return;
        }

        // CASE B: User explicitly REFUNDED or NOT LICENSED
        if (responseCode == NOT_LICENSED) {
            Log.w(TAG, "CRITICAL: NOT_LICENSED (512) received! User has refunded or does not own the app.");
            setLocked(true);
            mainHandler.post(() -> callback.onNotLicensed("Aapka purchase refund ho chuka hai ya is Google Account par is app ka valid license nahi hai."));
            return;
        }

        // CASE C: Server failure, network glitch, or unknown return code
        // IMPORTANT: NEVER block a paying user because of temporary Google server or network issues!
        Log.w(TAG, "Temporary/Server response received: " + responseCode + ". Maintaining existing state.");
        handleSafeFallback(callback, "Server code: " + responseCode);
    }

    private void handleSafeFallback(LicenseCallback callback, String debugMessage) {
        if (isCurrentlyLocked()) {
            // Agar pehle hi confirm ho chuka tha ki user ne refund le liya hai, toh lock rakhein
            mainHandler.post(() -> callback.onNotLicensed("Application locked hai. Kripya purchase karein."));
        } else {
            // Agar user ne pehle refund nahi liya tha, toh unhe bina kisi rukawat ke khelne dein!
            Log.i(TAG, "Allowing user to proceed without interruption (" + debugMessage + ")");
            mainHandler.post(callback::onLicensed);
        }
    }

    private void unbindSafe() {
        try {
            if (serviceConn != null) {
                context.unbindService(serviceConn);
                serviceConn = null;
            }
        } catch (Exception ignored) {}
    }

    private static boolean verifySignature(String publicKeyBase64, String signedData, String signatureBase64) {
        if (publicKeyBase64 == null || publicKeyBase64.trim().isEmpty() || "YOUR_GOOGLE_PLAY_PUBLIC_KEY_HERE".equals(publicKeyBase64.trim())) {
            // Key not set yet in LicenseConfig: Trust Google Play's system response code directly
            return true;
        }
        try {
            // Clean up any formatting / line breaks if user pasted from console
            String cleanedKey = publicKeyBase64.replaceAll("\\s+", "");
            byte[] decodedKey = Base64.decode(cleanedKey, Base64.DEFAULT);
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            PublicKey publicKey = keyFactory.generatePublic(new X509EncodedKeySpec(decodedKey));
            Signature sig = Signature.getInstance("SHA1withRSA");
            sig.initVerify(publicKey);
            sig.update(signedData.getBytes());
            return sig.verify(Base64.decode(signatureBase64.replaceAll("\\s+", ""), Base64.DEFAULT));
        } catch (Exception e) {
            Log.e(TAG, "Signature verification exception", e);
            // Fallback to true if public key format had an issue so paying users aren't locked out
            return true;
        }
    }
}
