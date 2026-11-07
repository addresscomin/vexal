package studio.zahd.vyro.editor

import android.net.Uri
import java.util.UUID

enum class TrackKind { VIDEO, AUDIO, TEXT, OVERLAY, EFFECT }
enum class ClipKind { VIDEO, IMAGE, AUDIO, TEXT, STICKER }

data class Keyframe<T>(val timeMs: Long, val value: T)
data class Transform(
    val scaleX: Float = 1f,
    val scaleY: Float = 1f,
    val rotationDegrees: Float = 0f,
    val positionX: Float = 0f,
    val positionY: Float = 0f,
    val opacity: Float = 1f
)
data class VyroClip(
    val id: String = UUID.randomUUID().toString(),
    val kind: ClipKind,
    val source: Uri? = null,
    val startMs: Long = 0,
    val sourceInMs: Long = 0,
    val sourceOutMs: Long = 0,
    val name: String = "New clip",
    val transform: Transform = Transform(),
    val volume: Float = 1f,
    val speed: Float = 1f,
    val isMuted: Boolean = false
) {
    val durationMs: Long get() = (sourceOutMs - sourceInMs).coerceAtLeast(0)
    val endMs: Long get() = startMs + durationMs
}
data class VyroTrack(
    val id: String = UUID.randomUUID().toString(),
    val kind: TrackKind,
    val name: String,
    val clips: List<VyroClip> = emptyList(),
    val isVisible: Boolean = true,
    val isLocked: Boolean = false
)
data class VyroProject(
    val id: String = UUID.randomUUID().toString(),
    val name: String = "Untitled project",
    val width: Int = 1080,
    val height: Int = 1920,
    val frameRate: Int = 30,
    val tracks: List<VyroTrack> = listOf(
        VyroTrack(kind = TrackKind.VIDEO, name = "Video 1"),
        VyroTrack(kind = TrackKind.VIDEO, name = "Overlay 1"),
        VyroTrack(kind = TrackKind.TEXT, name = "Text"),
        VyroTrack(kind = TrackKind.AUDIO, name = "Audio"),
        VyroTrack(kind = TrackKind.EFFECT, name = "Effects")
    )
)

/** Non-destructive timeline operations. Rendering is handled by the media engine. */
object TimelineEdits {
    fun split(clip: VyroClip, playheadMs: Long): List<VyroClip> {
        val local = playheadMs - clip.startMs
        require(local > 0 && local < clip.durationMs) { "Playhead must be inside the clip" }
        val sourceSplit = clip.sourceInMs + local
        return listOf(
            clip.copy(sourceOutMs = sourceSplit),
            clip.copy(id = UUID.randomUUID().toString(), startMs = playheadMs, sourceInMs = sourceSplit)
        )
    }

    fun trimStart(clip: VyroClip, newStartMs: Long): VyroClip {
        require(newStartMs >= clip.startMs && newStartMs < clip.endMs)
        val delta = newStartMs - clip.startMs
        return clip.copy(startMs = newStartMs, sourceInMs = clip.sourceInMs + delta)
    }

    fun trimEnd(clip: VyroClip, newEndMs: Long): VyroClip {
        require(newEndMs > clip.startMs && newEndMs <= clip.endMs)
        return clip.copy(sourceOutMs = clip.sourceInMs + (newEndMs - clip.startMs))
    }

    fun setSpeed(clip: VyroClip, speed: Float): VyroClip {
        require(speed in 0.25f..4f)
        return clip.copy(speed = speed)
    }

    fun setVolume(clip: VyroClip, volume: Float): VyroClip {
        require(volume in 0f..2f)
        return clip.copy(volume = volume)
    }
}
