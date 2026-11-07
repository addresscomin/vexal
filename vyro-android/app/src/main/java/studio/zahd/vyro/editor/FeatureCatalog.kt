package studio.zahd.vyro.editor

data class FeatureSpec(val title: String, val group: String, val description: String, val stage: String)

object FeatureCatalog {
    val all = listOf(
        FeatureSpec("Trim / Split / Ripple delete", "Timeline", "Frame-aware clip edits and gap handling", "Core"),
        FeatureSpec("Multi-track layers", "Timeline", "Video, overlay, audio, titles and effects tracks", "Core"),
        FeatureSpec("Crop / Rotate / Flip / Canvas", "Transform", "Aspect ratios, position, scale and rotation", "Core"),
        FeatureSpec("Keyframe animation", "Motion", "Animate position, scale, rotation, opacity and effect values", "Advanced"),
        FeatureSpec("Speed ramp / Reverse / Freeze", "Time", "Variable speed curves, reverse playback and freeze frames", "Advanced"),
        FeatureSpec("Masking", "Compositing", "Shape masks, feather, invert and animated mask paths", "Advanced"),
        FeatureSpec("Chroma key", "Compositing", "Green/blue screen keying with spill suppression", "Advanced"),
        FeatureSpec("Background removal", "AI", "Subject segmentation and background replacement", "AI / device dependent"),
        FeatureSpec("Motion tracking", "Tracking", "Track a point/object and attach text or graphics", "AI / device dependent"),
        FeatureSpec("Camera tracking", "Tracking", "Estimate camera movement for compositing", "Research / advanced"),
        FeatureSpec("Stabilization", "Motion", "Reduce unwanted camera shake", "Advanced"),
        FeatureSpec("Color grading", "Color", "Exposure, contrast, curves, HSL, LUTs and scopes", "Advanced"),
        FeatureSpec("Transitions", "Effects", "Dissolve, wipe, zoom, blur and custom shader transitions", "Advanced"),
        FeatureSpec("Audio mixer", "Audio", "Music, voiceover, SFX, ducking, fades and EQ", "Core"),
        FeatureSpec("Auto captions", "Text", "Speech-to-text captions with editable styles", "AI / device dependent"),
        FeatureSpec("Motion graphics", "Design", "Animated titles, shape layers, typography and presets", "Advanced"),
        FeatureSpec("Compositing", "Compositing", "Blend modes, opacity, overlays and picture-in-picture", "Advanced"),
        FeatureSpec("Export", "Delivery", "Resolution, frame rate, bitrate and codec presets", "Core")
    )
}
