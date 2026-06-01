# Obfuscation guidelines and R8 memory optimization rules
-keep class com.sonara.music.data.model.** { *; }
-keepattributes Signature,Exceptions,*Annotation*,InnerClasses,EnclosingMethod

# ExoPlayer Media3 reflection bindings
-keep class androidx.media3.common.** { *; }
-keep class androidx.media3.exoplayer.** { *; }
-keep class androidx.media3.session.** { *; }

# Dagger Hilt Reflection definitions
-keep class dagger.hilt.** { *; }
-keepattributes *Annotation*,Signature

# Room persistent database optimization bounds
-keep class * extends androidx.room.RoomDatabase
-keep class * implements androidx.room.RoomOpenHelper
