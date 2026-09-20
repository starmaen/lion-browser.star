package com.starmaen.lionbrowser;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(LionWebViewPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
