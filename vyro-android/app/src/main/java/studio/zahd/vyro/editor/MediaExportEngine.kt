package studio.zahd.vyro.editor

import android.content.Context
import android.net.Uri
import androidx.media3.common.MediaItem
import androidx.media3.common.util.UnstableApi
import androidx.media3.effect.ScaleAndRotateTransformation
import androidx.media3.transformer.EditedMediaItem
import androidx.media3.transformer.Effects
import androidx.media3.transformer.Transformer

/**
 * First real export path for a single source clip.
 * The timeline model stays non-destructive; this class turns a selected clip
 * into a Media3 export. Multi-track composition and custom shader effects are
 * separate engine milestones.
 */
@OptIn(UnstableApi::class)
class MediaExportEngine(context: Context) {
    private val appContext = context.applicationContext

    fun exportClip(
        source: Uri,
        outputPath: String,
        trimStartMs: Long = 0L,
        trimEndMs: Long? = null,
        rotationDegrees: Float = 0f,
        onComplete: () -> Unit,
        onError: (Throwable) -> Unit
    ) {
        val mediaBuilder = MediaItem.Builder().setUri(source)
        if (trimStartMs > 0L || trimEndMs != null) {
            val clipping = MediaItem.ClippingConfiguration.Builder()
                .setStartPositionMs(trimStartMs.coerceAtLeast(0L))
            if (trimEndMs != null) clipping.setEndPositionMs(trimEndMs)
            mediaBuilder.setClippingConfiguration(clipping.build())
        }

        val videoEffects = if (rotationDegrees % 360f == 0f) {
            emptyList()
        } else {
            listOf(
                ScaleAndRotateTransformation.Builder()
                    .setRotationDegrees(rotationDegrees)
                    .build()
            )
        }
        val edited = EditedMediaItem.Builder(mediaBuilder.build())
            .setEffects(Effects(emptyList(), videoEffects))
            .build()

        val transformer = Transformer.Builder(appContext)
            .addListener(object : Transformer.Listener {
                override fun onCompleted(
                    composition: androidx.media3.transformer.Composition,
                    exportResult: androidx.media3.transformer.ExportResult
                ) {
                    onComplete()
                }

                override fun onError(
                    composition: androidx.media3.transformer.Composition,
                    exportResult: androidx.media3.transformer.ExportResult,
                    exportException: androidx.media3.transformer.ExportException
                ) {
                    onError(exportException)
                }
            })
            .build()

        try {
            transformer.start(edited, outputPath)
        } catch (error: Throwable) {
            onError(error)
        }
    }
}
