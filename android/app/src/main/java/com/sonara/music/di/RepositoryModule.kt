package com.sonara.music.di

import com.sonara.music.data.database.TrackDao
import com.sonara.music.data.repository.TrackRepository
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object RepositoryModule {

    @Provides
    @Singleton
    fun provideTrackRepository(trackDao: TrackDao): TrackRepository {
        return TrackRepository(trackDao)
    }
}
