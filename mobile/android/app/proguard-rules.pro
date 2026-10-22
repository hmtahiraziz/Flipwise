# Cardweave / React Native release R8 rules
# Re-test: cd mobile; $env:ENVFILE=".env.production"; npm run android:bundle

-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.swmansion.reanimated.** { *; }
-keep class com.swmansion.gesturehandler.** { *; }
-keep class com.swmansion.rnscreens.** { *; }
-keep class com.th3rdwave.safeareacontext.** { *; }
-keep class expo.modules.** { *; }
-keep class com.clerk.** { *; }

-dontwarn com.facebook.react.**
-dontwarn com.facebook.hermes.**
-dontwarn com.facebook.jni.**
-dontwarn expo.modules.**

# Keep native method names used by JNI / TurboModules
-keepclasseswithmembernames class * {
    native <methods>;
}
