package com.starmaen.lionbrowser;

import android.content.Intent;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.api.Scope;
import com.google.android.gms.tasks.Task;
import com.google.api.client.extensions.android.http.AndroidHttp;
import com.google.api.client.googleapis.extensions.android.gms.auth.GoogleAccountCredential;
import com.google.api.client.http.ByteArrayContent;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.DriveScopes;
import com.google.api.services.drive.model.File;
import com.google.api.services.drive.model.FileList;

import java.io.ByteArrayOutputStream;
import java.util.Collections;
import java.util.concurrent.Executors;

@CapacitorPlugin(name = "LionDriveSync")
public class LionDriveSyncPlugin extends Plugin {

    private GoogleSignInClient mGoogleSignInClient;
    private Drive mDriveService;
    private static final String SYNC_FILE_NAME = "lionbrowser_sync.json";

    @Override
    public void load() {
        GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestEmail()
                .requestProfile()
                .requestScopes(new Scope(DriveScopes.DRIVE_FILE))
                .build();
        mGoogleSignInClient = GoogleSignIn.getClient(getActivity(), gso);
    }

    @PluginMethod
    public void signIn(PluginCall call) {
        Intent signInIntent = mGoogleSignInClient.getSignInIntent();
        startActivityForResult(call, signInIntent, "handleSignInResult");
    }

    @ActivityCallback
    private void handleSignInResult(PluginCall call, ActivityResult result) {
        if (call == null) return;
        Task<GoogleSignInAccount> task = GoogleSignIn.getSignedInAccountFromIntent(result.getData());
        try {
            GoogleSignInAccount account = task.getResult();
            initDriveService(account);

            JSObject res = new JSObject();
            res.put("success", true);
            res.put("email", account.getEmail());
            res.put("displayName", account.getDisplayName());
            call.resolve(res);
        } catch (Exception e) {
            call.reject("فشل تسجيل الدخول: " + e.getMessage());
        }
    }

    private void initDriveService(GoogleSignInAccount account) {
        GoogleAccountCredential credential = GoogleAccountCredential.usingOAuth2(
                getContext(),
                Collections.singleton(DriveScopes.DRIVE_FILE)
        );
        credential.setSelectedAccount(account.getAccount());

        mDriveService = new Drive.Builder(
                AndroidHttp.newCompatibleTransport(),
                GsonFactory.getDefaultInstance(),
                credential
        )
        .setApplicationName("LionBrowser")
        .build();
    }

    @PluginMethod
    public void syncData(PluginCall call) {
        String data = call.getString("data");
        if (data == null) {
            call.reject("البيانات فارغة");
            return;
        }

        GoogleSignInAccount account = GoogleSignIn.getLastSignedInAccount(getContext());
        if (account == null) {
            call.reject("المستخدم غير مسجل الدخول");
            return;
        }

        if (mDriveService == null) {
            initDriveService(account);
        }

        Executors.newSingleThreadExecutor().execute(() -> {
            try {
                FileList result = mDriveService.files().list()
                        .setQ("name = '" + SYNC_FILE_NAME + "' and trashed = false")
                        .setSpaces("drive")
                        .setFields("files(id, name)")
                        .execute();

                ByteArrayContent content = ByteArrayContent.fromString("application/json", data);

                if (result.getFiles().isEmpty()) {
                    File fileMetadata = new File();
                    fileMetadata.setName(SYNC_FILE_NAME);
                    fileMetadata.setMimeType("application/json");
                    mDriveService.files().create(fileMetadata, content).execute();
                } else {
                    String existingFileId = result.getFiles().get(0).getId();
                    File fileMetadata = new File();
                    mDriveService.files().update(existingFileId, fileMetadata, content).execute();
                }

                JSObject ret = new JSObject();
                ret.put("success", true);
                ret.put("message", "تمت المزامنة بنجاح في Google Drive");
                call.resolve(ret);
            } catch (Exception e) {
                call.reject("خطأ أثناء المزامنة: " + e.getMessage());
            }
        });
    }

    @PluginMethod
    public void fetchSyncedData(PluginCall call) {
        GoogleSignInAccount account = GoogleSignIn.getLastSignedInAccount(getContext());
        if (account == null) {
            call.reject("المستخدم غير مسجل الدخول");
            return;
        }

        if (mDriveService == null) {
            initDriveService(account);
        }

        Executors.newSingleThreadExecutor().execute(() -> {
            try {
                FileList result = mDriveService.files().list()
                        .setQ("name = '" + SYNC_FILE_NAME + "' and trashed = false")
                        .setSpaces("drive")
                        .setFields("files(id, name)")
                        .execute();

                if (result.getFiles().isEmpty()) {
                    JSObject ret = new JSObject();
                    ret.put("found", false);
                    call.resolve(ret);
                    return;
                }

                String fileId = result.getFiles().get(0).getId();
                ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
                mDriveService.files().get(fileId).executeMediaAndDownloadTo(outputStream);
                String jsonContent = outputStream.toString("UTF-8");

                JSObject ret = new JSObject();
                ret.put("found", true);
                ret.put("data", jsonContent);
                call.resolve(ret);
            } catch (Exception e) {
                call.reject("خطأ أثناء استرجاع البيانات: " + e.getMessage());
            }
        });
    }
}
