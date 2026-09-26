package com.starmaen.lionbrowser;

import android.graphics.drawable.ColorDrawable;
import android.graphics.drawable.Drawable;
import android.graphics.drawable.LayerDrawable;
import android.os.Bundle;
import android.view.Gravity;
import android.view.Window;

import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(LionWebViewPlugin.class);
        registerPlugin(LionVpnPlugin.class);
        super.onCreate(savedInstanceState);
        applyLionWindowColors();
    }

    // يلوّن خلفية النافذة (كانت رمادية) بلون التطبيق: النصف العلوي بلون الترويسة والسفلي بلون الخلفية
    private void applyLionWindowColors() {
        try {
            int top = 0xFF0D1629;
            int bottom = 0xFF020618;
            Window w = getWindow();
            LayerDrawable ld = new LayerDrawable(new Drawable[] { new ColorDrawable(bottom), new ColorDrawable(top) });
            ld.setLayerGravity(1, Gravity.TOP);
            ld.setLayerHeight(1, getResources().getDisplayMetrics().heightPixels / 2);
            w.setBackgroundDrawable(ld);
            w.setStatusBarColor(top);
            w.setNavigationBarColor(bottom);
            WindowInsetsControllerCompat c = WindowCompat.getInsetsController(w, w.getDecorView());
            if (c != null) {
                c.setAppearanceLightStatusBars(false);
                c.setAppearanceLightNavigationBars(false);
            }
        } catch (Exception ignored) {
        }
    }
}
