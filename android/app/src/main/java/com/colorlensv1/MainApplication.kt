package com.colorlensv1

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.colorlensv1.tflite.ColorTFLitePackage
import com.colorlensv1.color.ColorMatcherPackage

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> {
            android.util.Log.d("MainApplication", "Initializing packages...")
            return PackageList(this).packages.apply {
                try {
                    android.util.Log.d("MainApplication", "Adding ImageDecoderPackage...")
                    add(ImageDecoderPackage())
                    android.util.Log.d("MainApplication", "Successfully added ImageDecoderPackage")
                } catch (e: Exception) {
                    android.util.Log.e("MainApplication", "Failed to add ImageDecoderPackage", e)
                }
                
                try {
                    android.util.Log.d("MainApplication", "Adding ColorTFLitePackage...")
                    val tflitePackage = ColorTFLitePackage()
                    add(tflitePackage)
                    android.util.Log.d("MainApplication", "Successfully added ColorTFLitePackage")
                } catch (e: Exception) {
                    android.util.Log.e("MainApplication", "Failed to add ColorTFLitePackage", e)
                }
                
                try {
                    android.util.Log.d("MainApplication", "Adding ColorMatcherPackage...")
                    add(ColorMatcherPackage())
                    android.util.Log.d("MainApplication", "Successfully added ColorMatcherPackage")
                } catch (e: Exception) {
                    android.util.Log.e("MainApplication", "Failed to add ColorMatcherPackage", e)
                }
                
                android.util.Log.d("MainApplication", "All packages initialized. Total packages: ${this.size}")
            }
        }

        override fun getJSMainModuleName(): String = "index"

        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)
  }
}
