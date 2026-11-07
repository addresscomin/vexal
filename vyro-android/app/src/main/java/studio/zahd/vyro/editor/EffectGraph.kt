package studio.zahd.vyro.editor

/**
 * Non-destructive effect-stack model.
 *
 * This describes editable effect intent and parameters. A renderer must map each
 * definition to a preview/export implementation before an effect is considered live.
 */
enum class EffectFamily {
    COLOR, LIGHT, MOTION, DISTORTION, PARTICLE, KEYING, BLUR, STYLIZE
}

enum class EffectValueType {
    FLOAT, INTEGER, BOOLEAN, COLOR, ANGLE, POINT
}

data class EffectParameter(
    val key: String,
    val label: String,
    val type: EffectValueType,
    val defaultValue: Float,
    val minValue: Float,
    val maxValue: Float,
    val animatable: Boolean = true
)

data class EffectDefinition(
    val id: String,
    val name: String,
    val family: EffectFamily,
    val description: String,
    val parameters: List<EffectParameter>,
    val gpuPreferred: Boolean = true
)

data class EffectKeyframe(
    val timeUs: Long,
    val value: Float,
    val interpolation: Interpolation = Interpolation.BEZIER
)

enum class Interpolation { HOLD, LINEAR, BEZIER }

data class AnimatedEffectValue(
    val parameterKey: String,
    val keyframes: List<EffectKeyframe>
)

data class EffectInstance(
    val instanceId: String,
    val definitionId: String,
    val enabled: Boolean = true,
    val mix: Float = 1f,
    val values: Map<String, Float> = emptyMap(),
    val animation: List<AnimatedEffectValue> = emptyList()
)

object VyroEffectLibrary {
    private fun p(
        key: String,
        label: String,
        default: Float,
        min: Float,
        max: Float
    ) = EffectParameter(key, label, EffectValueType.FLOAT, default, min, max)

    val definitions = listOf(
        EffectDefinition(
            "vyro.glow", "Prism Glow", EffectFamily.LIGHT,
            "Threshold-based soft glow with tint and intensity controls.",
            listOf(p("threshold", "Threshold", 0.72f, 0f, 1f), p("radius", "Radius", 18f, 0f, 80f), p("intensity", "Intensity", 0.8f, 0f, 2f))
        ),
        EffectDefinition(
            "vyro.light_sweep", "Light Sweep", EffectFamily.LIGHT,
            "A controllable animated highlight that travels across a layer.",
            listOf(p("position", "Position", 0f, -1f, 1f), p("angle", "Angle", 25f, -180f, 180f), p("width", "Width", 0.2f, 0.01f, 1f), p("softness", "Softness", 0.5f, 0f, 1f))
        ),
        EffectDefinition(
            "vyro.directional_blur", "Vector Blur", EffectFamily.BLUR,
            "Directional blur with animated angle and distance.",
            listOf(p("angle", "Angle", 0f, -180f, 180f), p("distance", "Distance", 12f, 0f, 100f))
        ),
        EffectDefinition(
            "vyro.radial_blur", "Orbit Blur", EffectFamily.BLUR,
            "Radial and zoom blur around an editable center point.",
            listOf(p("amount", "Amount", 0.25f, 0f, 1f), p("quality", "Quality", 12f, 2f, 32f))
        ),
        EffectDefinition(
            "vyro.echo", "Frame Echo", EffectFamily.MOTION,
            "Temporal trails with adjustable delay, count and decay.",
            listOf(p("delay", "Frame Delay", 2f, 1f, 24f), p("count", "Echo Count", 4f, 1f, 12f), p("decay", "Decay", 0.65f, 0f, 1f))
        ),
        EffectDefinition(
            "vyro.displacement", "Flow Warp", EffectFamily.DISTORTION,
            "Displacement driven by a procedural or media texture.",
            listOf(p("amount", "Amount", 0.15f, 0f, 1f), p("scale", "Scale", 1f, 0.1f, 8f))
        ),
        EffectDefinition(
            "vyro.color_grade", "Cinematic Grade", EffectFamily.COLOR,
            "Editable contrast, saturation, temperature and tint controls.",
            listOf(p("contrast", "Contrast", 1f, 0f, 2f), p("saturation", "Saturation", 1f, 0f, 2f), p("temperature", "Temperature", 0f, -1f, 1f), p("tint", "Tint", 0f, -1f, 1f))
        ),
        EffectDefinition(
            "vyro.chroma_key", "Color Key", EffectFamily.KEYING,
            "Key a selected color with tolerance, edge softness and spill control.",
            listOf(p("tolerance", "Tolerance", 0.18f, 0f, 1f), p("softness", "Edge Softness", 0.12f, 0f, 1f), p("spill", "Spill Suppression", 0.5f, 0f, 1f))
        ),
        EffectDefinition(
            "vyro.particle_emitter", "Nova Particles", EffectFamily.PARTICLE,
            "Procedural emitter controls for rate, velocity, gravity and lifetime.",
            listOf(p("rate", "Emission Rate", 40f, 0f, 500f), p("velocity", "Velocity", 1f, 0f, 10f), p("gravity", "Gravity", 0f, -10f, 10f), p("lifetime", "Lifetime", 2f, 0.1f, 10f))
        )
    )
}
