package com.sonara.music.di

import android.content.Context
import androidx.room.Room
import androidx.room.migration.Migration
import androidx.sqlite.db.SupportSQLiteDatabase
import com.sonara.music.data.database.SonaraDatabase
import com.sonara.music.data.database.TrackDao
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    private const val DATABASE_NAME = "sonara_secure_music.db"

    // Clear structural migration layout from v1 to v2 to showcase production upgrade compliance
    private val MIGRATION_1_2 = object : Migration(1, 2) {
        override fun migrate(db: SupportSQLiteDatabase) {
            db.execSQL("ALTER TABLE tracks ADD COLUMN lyricSnippet TEXT DEFAULT NULL")
        }
    }

    @Provides
    @Singleton
    fun provideRoomDatabase(@ApplicationContext context: Context): SonaraDatabase {
        return Room.databaseBuilder(
            context,
            SonaraDatabase::class.java,
            DATABASE_NAME
        )
        .addMigrations(MIGRATION_1_2)
        .fallbackToDestructiveMigrationOnDowngrade()
        .build()
    }

    @Provides
    @Singleton
    fun provideTrackDao(database: SonaraDatabase): TrackDao {
        return database.trackDao()
    }
}
