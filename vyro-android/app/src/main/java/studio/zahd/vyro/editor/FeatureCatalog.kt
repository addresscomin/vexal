package studio.zahd.vyro.editor

data class FeatureSpec(val title: String, val group: String, val description: String, val stage: String)

object FeatureCatalog {
    val all = listOf(
        FeatureSpec("Trim / Split / Ripple delete", "Timeline", "Frame-aware clip edits and gap handling", "Core"),
        FeatureSpec("Multi-track layers", "Timeline", "Video, overlay, audio, titles and effects tracks", "Core"),
        FeatureSpec("Crop / Rotate / Flip / Canvas", "Transform", "Aspect ratios, position, scale and rotation", "Core"),
        FeatureSpec("Keyframe animation", "Motion", "Animate position, scale, rotation, opacity and effect values", "Advanced"),
        FeatureSpec("Graph editor", "Motion", "Bezier handles, easing presets and editable value curves", "Planned"),
        FeatureSpec("Parenting and null layers", "Motion", "Link transforms and control groups through parent layers", "Planned"),
        FeatureSpec("Motion paths", "Motion", "Animate along editable paths with spatial interpolation", "Planned"),
        FeatureSpec("Speed ramp / Reverse / Freeze", "Time", "Variable speed curves, reverse playback and freeze frames", "Advanced"),
        FeatureSpec("Masking", "Compositing", "Shape masks, feather, invert and animated mask paths", "Advanced"),
        FeatureSpec("Chroma key", "Compositing", "Green/blue screen keying with spill suppression", "Advanced"),
        FeatureSpec("Blend modes", "Compositing", "Layer compositing modes, opacity and track mattes", "Planned"),
        FeatureSpec("Rotoscope tools", "Compositing", "Assisted subject isolation with editable edge refinement", "Research"),
        FeatureSpec("Background removal", "AI", "Subject segmentation and background replacement", "AI / device dependent"),
        FeatureSpec("Point and object tracking", "Tracking", "Track a target and attach text, graphics or effects", "AI / device dependent"),
        FeatureSpec("Planar tracking", "Tracking", "Follow a flat surface for screen and sign replacement", "Research / advanced"),
        FeatureSpec("3D camera tracking", "Tracking", "Estimate camera motion and solve a compositing camera", "Research / advanced"),
        FeatureSpec("Stabilization", "Motion", "Reduce unwanted camera shake with adjustable crop", "Advanced"),
        FeatureSpec("Color correction", "Color Lab", "Exposure, contrast, white balance, curves and levels", "Planned"),
        FeatureSpec("HSL and selective color", "Color Lab", "Per-channel hue, saturation, luminance and qualifiers", "Planned"),
        FeatureSpec("Color wheels and scopes", "Color Lab", "Lift, gamma, gain, vectorscope and waveform tools", "Planned"),
        FeatureSpec("Glow and bloom", "Light FX", "Original threshold glow with radius, intensity and tint", "Planned"),
        FeatureSpec("Light sweep", "Light FX", "Animated highlight sweep with width, angle and softness", "Planned"),
        FeatureSpec("Lens flare and rays", "Light FX", "Procedural lens artifacts and directional light rays", "Planned"),
        FeatureSpec("Motion blur and echo", "Motion FX", "Shutter-based blur and temporal frame trails", "Planned"),
        FeatureSpec("Blur and distortion", "Motion FX", "Directional, radial, zoom, warp and displacement effects", "Planned"),
        FeatureSpec("Particle system", "Particles", "Procedural particles with emitters, forces and turbulence", "Planned"),
        FeatureSpec("3D layers and depth", "3D Studio", "3D transforms, camera, lights and depth-aware parallax", "Research / advanced"),
        FeatureSpec("Transitions", "Effects", "Dissolve, wipe, zoom, blur and custom shader transitions", "Advanced"),
        FeatureSpec("Audio mixer", "Audio", "Music, voiceover, SFX, ducking, fades and EQ", "Core"),
        FeatureSpec("Auto captions", "Text", "Speech-to-text captions with editable styles", "AI / device dependent"),
        FeatureSpec("Motion graphics", "Design", "Animated titles, shape layers, typography and presets", "Advanced"),
        FeatureSpec("Export", "Delivery", "Resolution, frame rate, bitrate and codec presets", "Core")
    )
}
