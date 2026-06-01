package com.sonara.music.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import com.sonara.music.MainActivity
import com.sonara.music.playback.MediaPlaybackService

class MusicWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (id in appWidgetIds) {
            updateHomeWidgetLayout(context, appWidgetManager, id)
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        if (intent.action == "com.sonara.music.WIDGET_UPDATE") {
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val providerName = ComponentName(context, MusicWidgetProvider::class.java)
            val ids = appWidgetManager.getAppWidgetIds(providerName)
            onUpdate(context, appWidgetManager, ids)
        }
    }

    private fun updateHomeWidgetLayout(context: Context, manager: AppWidgetManager, id: Int) {
        // Resolve target layouts by XML package mappings
        val layoutName = context.packageName
        val resId = context.resources.getIdentifier("widget_sonara_playback", "layout", context.packageName)
        
        if (resId != 0) {
            val remoteViews = RemoteViews(layoutName, resId)

            // Setup play, next and previous continuous control intents to MediaPlaybackService
            val playAction = Intent(context, MediaPlaybackService::class.java)
            val playPending = PendingIntent.getService(context, 10, playAction, PendingIntent.FLAG_IMMUTABLE)

            // Dynamic XML mapping lookups to avoid strict R.id generation anomalies
            val playBtnId = context.resources.getIdentifier("btn_widget_play", "id", context.packageName)
            if (playBtnId != 0) {
                remoteViews.setOnClickPendingIntent(playBtnId, playPending)
            }

            // Launching main package scope on overall container wrapper touch
            val openApp = Intent(context, MainActivity::class.java)
            val appPending = PendingIntent.getActivity(context, 12, openApp, PendingIntent.FLAG_IMMUTABLE)
            val rootLayoutId = context.resources.getIdentifier("widget_container_root", "id", context.packageName)
            if (rootLayoutId != 0) {
                remoteViews.setOnClickPendingIntent(rootLayoutId, appPending)
            }

            manager.updateAppWidget(id, remoteViews)
        }
    }
}
