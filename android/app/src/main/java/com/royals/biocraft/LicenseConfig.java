package com.royals.biocraft;

public class LicenseConfig {
    /**
     * Google Play Console Base64-encoded RSA public key.
     * Kahan milega:
     * Google Play Console -> Your App (BioCraft) -> Monetization setup -> Licensing -> Base64-encoded RSA public key
     * 
     * Jab aap Play Store Console par app setup karenge, wahan se copy karke yahan paste kar sakte hain.
     */
    public static final String BASE64_PUBLIC_KEY = "";

    /**
     * Offline Grace Period: Agar user ne pehle khareeda tha aur internet nahi hai,
     * toh 14 din tak offline khelne ki permission rahegi.
     * Lekin agar ek baar bhi refund detect ho gaya (responseCode == NOT_LICENSED),
     * toh app turant permanent LOCK ho jayega.
     */
    public static final long OFFLINE_GRACE_PERIOD_MS = 14L * 24 * 60 * 60 * 1000;
}
