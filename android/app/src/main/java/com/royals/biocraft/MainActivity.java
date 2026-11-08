package com.royals.biocraft;

import android.app.Dialog;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.net.Uri;
import android.os.Bundle;
import android.view.Window;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.OnBackPressedCallback;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private LicenseManager licenseManager;
    private Dialog lockDialog;
    private boolean isLockedState = false;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        licenseManager = new LicenseManager(this);

        // Handle Back button so user cannot bypass lock screen
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (isLockedState) {
                    finishAffinity();
                } else {
                    setEnabled(false);
                    getOnBackPressedDispatcher().onBackPressed();
                }
            }
        });

        // Agar pehle se locked status save hai (refund detect ho chuka hai)
        if (licenseManager.isCurrentlyLocked()) {
            showLockScreen("Aapka purchase refund ho chuka hai ya license expire ho gaya hai. Game chalane ke liye kripya ise Google Play Store se khareedein.");
        }

        // Verify license with Google Play
        performLicenseCheck();
    }

    @Override
    public void onResume() {
        super.onResume();
        // Check again on resume in case user returned after refunding or buying
        if (isLockedState || licenseManager.isCurrentlyLocked()) {
            performLicenseCheck();
        }
    }

    private void performLicenseCheck() {
        licenseManager.checkLicense(new LicenseManager.LicenseCallback() {
            @Override
            public void onLicensed() {
                isLockedState = false;
                dismissLockScreen();
            }

            @Override
            public void onNotLicensed(String reason) {
                isLockedState = true;
                showLockScreen(reason);
            }

            @Override
            public void onVerificationError(String error) {
                if (licenseManager.isCurrentlyLocked()) {
                    isLockedState = true;
                    showLockScreen("Refund ya unverified license ki wajah se app locked hai.");
                } else if (!licenseManager.isOnline()) {
                    Toast.makeText(MainActivity.this, "Offline mode: License will be verified when online.", Toast.LENGTH_SHORT).show();
                }
            }
        });
    }

    private void showLockScreen(String message) {
        runOnUiThread(() -> {
            if (isFinishing() || isDestroyed()) return;

            if (lockDialog == null) {
                lockDialog = new Dialog(this);
                lockDialog.requestWindowFeature(Window.FEATURE_NO_TITLE);
                lockDialog.setContentView(R.layout.dialog_license_lock);
                lockDialog.setCancelable(false);
                lockDialog.setCanceledOnTouchOutside(false);

                Window window = lockDialog.getWindow();
                if (window != null) {
                    window.setBackgroundDrawable(new ColorDrawable(Color.TRANSPARENT));
                    window.setLayout(WindowManager.LayoutParams.MATCH_PARENT, WindowManager.LayoutParams.MATCH_PARENT);
                }

                Button btnBuy = lockDialog.findViewById(R.id.btn_buy_playstore);
                Button btnRetry = lockDialog.findViewById(R.id.btn_retry_check);
                Button btnExit = lockDialog.findViewById(R.id.btn_exit_app);

                btnBuy.setOnClickListener(v -> openPlayStore());
                btnRetry.setOnClickListener(v -> {
                    Toast.makeText(MainActivity.this, "Verifying license with Google Play...", Toast.LENGTH_SHORT).show();
                    performLicenseCheck();
                });
                btnExit.setOnClickListener(v -> finishAffinity());
            }

            TextView tvMessage = lockDialog.findViewById(R.id.tv_lock_message);
            if (tvMessage != null && message != null) {
                tvMessage.setText(message);
            }

            if (!lockDialog.isShowing()) {
                lockDialog.show();
            }
        });
    }

    private void dismissLockScreen() {
        runOnUiThread(() -> {
            if (lockDialog != null && lockDialog.isShowing()) {
                lockDialog.dismiss();
            }
        });
    }

    private void openPlayStore() {
        String packageName = getPackageName();
        try {
            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=" + packageName));
            intent.setPackage("com.android.vending");
            startActivity(intent);
        } catch (ActivityNotFoundException e) {
            Intent webIntent = new Intent(Intent.ACTION_VIEW, Uri.parse("https://play.google.com/store/apps/details?id=" + packageName));
            startActivity(webIntent);
        }
    }
}
