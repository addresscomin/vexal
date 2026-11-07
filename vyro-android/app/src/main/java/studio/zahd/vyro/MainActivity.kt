package studio.zahd.vyro

import android.content.Intent
import android.net.Uri
import android.content.Context
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.animateColorAsState
import androidx.compose.ui.viewinterop.AndroidView
import androidx.compose.ui.platform.LocalContext
import androidx.media3.common.MediaItem
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

private val Ink = Color(0xFF080A12)
private val Panel = Color(0xFF141827)
private val Panel2 = Color(0xFF1B2234)
private val Violet = Color(0xFF9B7BFF)
private val Cyan = Color(0xFF63E6E2)
private val Muted = Color(0xFF929AAF)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { VyroApp() }
    }
}

private enum class Tab(val label: String) { HOME("Home"), EDIT("Studio"), FX("Effects"), PRO("Pro") }

@Composable
private fun VyroApp() {
    var tab by remember { mutableStateOf(Tab.HOME) }
    var selectedVideo by remember { mutableStateOf<Uri?>(null) }
    val picker = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()) { uri ->
        selectedVideo = uri
        if (uri != null) tab = Tab.EDIT
    }

    MaterialTheme(
        colorScheme = darkColorScheme(
            background = Ink, surface = Panel, primary = Violet,
            secondary = Cyan, onBackground = Color.White, onSurface = Color.White
        )
    ) {
        Scaffold(
            containerColor = Ink,
            bottomBar = { PremiumNav(tab) { tab = it } }
        ) { padding ->
            Box(Modifier.fillMaxSize().padding(padding)) {
                when (tab) {
                    Tab.HOME -> HomeScreen(
                        hasVideo = selectedVideo != null,
                        onImport = { picker.launch(arrayOf("video/*")) },
                        onStudio = { tab = Tab.EDIT }
                    )
                    Tab.EDIT -> EditorScreen(selectedVideo, onImport = { picker.launch(arrayOf("video/*")) })
                    Tab.FX -> EffectsScreen()
                    Tab.PRO -> ProScreen()
                }
            }
        }
    }
}

@Composable
private fun PremiumNav(current: Tab, onSelect: (Tab) -> Unit) {
    Row(
        Modifier.fillMaxWidth().background(Color(0xFF0D111D))
            .border(1.dp, Color.White.copy(alpha = .07f))
            .navigationBarsPadding().padding(start = 10.dp, end = 10.dp, top = 10.dp, bottom = 8.dp),
        horizontalArrangement = Arrangement.SpaceAround,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Tab.entries.forEach { item ->
            val active = current == item
            val tint by animateColorAsState(if (active) Cyan else Muted, label = "navTint")
            val icon = when (item) {
                Tab.HOME -> Icons.Rounded.GridView
                Tab.EDIT -> Icons.Rounded.Movie
                Tab.FX -> Icons.Rounded.AutoAwesome
                Tab.PRO -> Icons.Rounded.Diamond
            }
            Column(
                Modifier.weight(1f).clip(RoundedCornerShape(16.dp))
                    .clickable { onSelect(item) }
                    .background(if (active) Violet.copy(alpha = .15f) else Color.Transparent)
                    .padding(vertical = 8.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Icon(icon, contentDescription = item.label, tint = tint, modifier = Modifier.size(23.dp))
                Spacer(Modifier.height(4.dp))
                Text(item.label.uppercase(), color = tint, fontSize = 9.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
                if (active) Box(Modifier.padding(top = 4.dp).size(width = 16.dp, height = 2.dp).clip(CircleShape).background(Cyan))
            }
        }
    }
}

@Composable
private fun Page(modifier: Modifier = Modifier, content: @Composable ColumnScope.() -> Unit) {
    Column(modifier.fillMaxSize().background(Ink).statusBarsPadding().padding(horizontal = 20.dp)) { content() }
}

@Composable
private fun BrandHeader(kicker: String, title: String, trailing: String? = null) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
        Column {
            Text(kicker.uppercase(), color = Cyan, fontSize = 10.sp, fontWeight = FontWeight.Bold, letterSpacing = 2.sp)
            Text(title, color = Color.White, fontSize = 29.sp, fontWeight = FontWeight.Black, letterSpacing = (-1).sp)
        }
        if (trailing != null) Surface(color = Panel2, shape = CircleShape) {
            Text(trailing, color = Violet, fontSize = 11.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 13.dp, vertical = 9.dp))
        }
    }
}

@Composable
private fun HomeScreen(hasVideo: Boolean, onImport: () -> Unit, onStudio: () -> Unit) {
    Page(Modifier.verticalScroll(rememberScrollState())) {
        Spacer(Modifier.height(22.dp))
        BrandHeader("Create without limits", "VYRO", "0.1 BETA")
        Spacer(Modifier.height(24.dp))
        Box(
            Modifier.fillMaxWidth().height(205.dp).clip(RoundedCornerShape(28.dp))
                .background(Brush.linearGradient(listOf(Color(0xFF30205C), Color(0xFF172D45), Color(0xFF101521))))
                .border(1.dp, Violet.copy(alpha = .35f), RoundedCornerShape(28.dp)).padding(20.dp)
        ) {
            Column(Modifier.align(Alignment.CenterStart)) {
                Text("YOUR NEXT CUT.", color = Color.White, fontSize = 23.sp, fontWeight = FontWeight.Black)
                Text("Make every frame count.", color = Color.White.copy(.72f), fontSize = 13.sp)
                Spacer(Modifier.height(18.dp))
                Button(onClick = onImport, colors = ButtonDefaults.buttonColors(containerColor = Cyan, contentColor = Ink), shape = RoundedCornerShape(14.dp)) {
                    Icon(Icons.Rounded.Add, null); Spacer(Modifier.width(7.dp)); Text("New project", fontWeight = FontWeight.Bold)
                }
            }
            Icon(Icons.Rounded.AutoAwesome, null, tint = Violet.copy(alpha = .7f), modifier = Modifier.align(Alignment.TopEnd).size(48.dp))
        }
        Spacer(Modifier.height(25.dp))
        SectionTitle("QUICK TOOLS", "Built for creators")
        Spacer(Modifier.height(12.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            QuickTool("Trim", Icons.Rounded.ContentCut, Modifier.weight(1f), onStudio)
            QuickTool("Green screen", Icons.Rounded.Layers, Modifier.weight(1f), onStudio)
            QuickTool("Motion", Icons.Rounded.GpsFixed, Modifier.weight(1f), onStudio)
        }
        Spacer(Modifier.height(25.dp))
        SectionTitle("YOUR WORKSPACE", if (hasVideo) "1 item ready" else "Start creating")
        Spacer(Modifier.height(10.dp))
        Surface(color = Panel, shape = RoundedCornerShape(20.dp), modifier = Modifier.fillMaxWidth().clickable(onClick = onStudio)) {
            Row(Modifier.padding(17.dp), verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Rounded.VideoLibrary, null, tint = Cyan, modifier = Modifier.size(30.dp))
                Spacer(Modifier.width(13.dp))
                Column(Modifier.weight(1f)) {
                    Text(if (hasVideo) "Imported video" else "No projects yet", color = Color.White, fontWeight = FontWeight.Bold)
                    Text(if (hasVideo) "Open Studio to edit your clip" else "Import a clip to begin your first edit", color = Muted, fontSize = 12.sp)
                }
                Icon(Icons.Rounded.ChevronRight, null, tint = Muted)
            }
        }
        Spacer(Modifier.height(25.dp))
        Text("VYRO is an original editing workspace. Advanced render and AI tools are being built in stages.", color = Muted, fontSize = 11.sp, lineHeight = 17.sp)
        Spacer(Modifier.height(20.dp))
    }
}

@Composable
private fun QuickTool(name: String, icon: androidx.compose.ui.graphics.vector.ImageVector, modifier: Modifier, onClick: () -> Unit) {
    Surface(modifier.clickable(onClick = onClick), color = Panel, shape = RoundedCornerShape(18.dp)) {
        Column(Modifier.padding(vertical = 16.dp).fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(icon, null, tint = Violet, modifier = Modifier.size(25.dp))
            Spacer(Modifier.height(8.dp))
            Text(name, color = Color.White, fontSize = 10.sp, fontWeight = FontWeight.SemiBold)
        }
    }
}

@Composable
private fun SectionTitle(label: String, subtitle: String) {
    Column {
        Text(label, color = Cyan, fontSize = 9.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.8.sp)
        Text(subtitle, color = Color.White, fontSize = 17.sp, fontWeight = FontWeight.Bold)
    }
}

@Composable
private fun VideoPreview(uri: Uri, modifier: Modifier = Modifier) {
    val context = LocalContext.current
    val player = remember(uri) {
        ExoPlayer.Builder(context).build().apply {
            setMediaItem(MediaItem.fromUri(uri))
            prepare()
            playWhenReady = false
        }
    }
    DisposableEffect(player) {
        onDispose { player.release() }
    }
    AndroidView(
        modifier = modifier,
        factory = { ctx: Context ->
            PlayerView(ctx).apply {
                this.player = player
                useController = true
                setShowBuffering(PlayerView.SHOW_BUFFERING_WHEN_PLAYING)
            }
        },
        update = { it.player = player }
    )
}

@Composable
private fun EditorScreen(video: Uri?, onImport: () -> Unit) {
    Page {
        Spacer(Modifier.height(20.dp))
        BrandHeader("Creator workspace", "Studio", "DRAFT")
        Spacer(Modifier.height(18.dp))
        Box(Modifier.fillMaxWidth().weight(1f).clip(RoundedCornerShape(22.dp)).background(Color(0xFF05070D)), contentAlignment = Alignment.Center) {
            if (video != null) {
                VideoPreview(video, Modifier.fillMaxSize())
            } else {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(Icons.Rounded.Movie, null, tint = Violet, modifier = Modifier.size(45.dp))
                    Spacer(Modifier.height(10.dp))
                    Text("Import media to begin", color = Color.White, fontWeight = FontWeight.Bold)
                    Text("Select a video to preview and edit", color = Muted, fontSize = 11.sp)
                    Spacer(Modifier.height(12.dp))
                    OutlinedButton(onClick = onImport) { Icon(Icons.Rounded.Add, null); Text(" Add video") }
                }
            }
        }
        Spacer(Modifier.height(14.dp))
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Text("TIMELINE", color = Cyan, fontSize = 10.sp, fontWeight = FontWeight.Bold, letterSpacing = 2.sp)
            Text("00:00 / --:--", color = Muted, fontSize = 11.sp)
        }
        Spacer(Modifier.height(9.dp))
        Surface(color = Panel, shape = RoundedCornerShape(16.dp), modifier = Modifier.fillMaxWidth()) {
            Column(Modifier.padding(12.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Rounded.VideoFile, null, tint = Violet)
                    Spacer(Modifier.width(8.dp))
                    Text("VIDEO 1", color = Color.White, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                    Spacer(Modifier.weight(1f))
                    Text("＋", color = Cyan, fontSize = 20.sp)
                }
                Spacer(Modifier.height(9.dp))
                Box(Modifier.fillMaxWidth().height(38.dp).clip(RoundedCornerShape(8.dp)).background(Brush.horizontalGradient(listOf(Color(0xFF44306E), Color(0xFF22505B), Color(0xFF44306E)))), contentAlignment = Alignment.Center) {
                    Text(if (video == null) "IMPORT A CLIP TO BUILD YOUR TIMELINE" else "MEDIA TRACK READY FOR ENGINE", color = Color.White.copy(.85f), fontSize = 9.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
                }
                Spacer(Modifier.height(12.dp))
                Row(Modifier.horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(9.dp)) {
                    listOf("Split", "Trim", "Speed", "Audio", "Text", "Keyframe", "Chroma").forEach {
                        Surface(color = Panel2, shape = RoundedCornerShape(10.dp)) { Text(it, color = Color.White, fontSize = 10.sp, modifier = Modifier.padding(horizontal = 12.dp, vertical = 9.dp)) }
                    }
                }
            }
        }
        Spacer(Modifier.height(12.dp))
        Text("Editing controls are staged in the UI; media rendering is a separate engine milestone.", color = Muted, fontSize = 10.sp)
        Spacer(Modifier.height(12.dp))
    }
}

@Composable
private fun EffectsScreen() {
    val groups = listOf("Cinematic", "Color Lab", "Transitions", "Glitch", "Blur & Glow", "Text Motion", "Green Screen", "AI Motion")
    Page {
        Spacer(Modifier.height(20.dp))
        BrandHeader("Creative library", "Effects", "LIBRARY")
        Spacer(Modifier.height(9.dp))
        Text("Original effect packs will be added with licensed assets and native render support.", color = Muted, fontSize = 12.sp)
        Spacer(Modifier.height(20.dp))
        groups.forEachIndexed { index, name ->
            Surface(color = Panel, shape = RoundedCornerShape(17.dp), modifier = Modifier.fillMaxWidth().padding(bottom = 10.dp)) {
                Row(Modifier.padding(15.dp), verticalAlignment = Alignment.CenterVertically) {
                    Box(Modifier.size(42.dp).clip(RoundedCornerShape(13.dp)).background(Brush.linearGradient(listOf(Violet.copy(.45f), Cyan.copy(.2f)))), contentAlignment = Alignment.Center) {
                        Icon(listOf(Icons.Rounded.MovieFilter, Icons.Rounded.Tune, Icons.Rounded.SwapHoriz, Icons.Rounded.Bolt, Icons.Rounded.BlurOn, Icons.Rounded.Title, Icons.Rounded.Layers, Icons.Rounded.AutoFixHigh)[index], null, tint = Color.White)
                    }
                    Spacer(Modifier.width(13.dp))
                    Column(Modifier.weight(1f)) {
                        Text(name, color = Color.White, fontWeight = FontWeight.Bold)
                        Text(if (index == 6) "Chroma key / background tools" else "Effect collection • coming in engine build", color = Muted, fontSize = 10.sp)
                    }
                    Icon(Icons.Rounded.ChevronRight, null, tint = Muted)
                }
            }
        }
    }
}

@Composable
private fun ProScreen() {
    Page {
        Spacer(Modifier.height(22.dp))
        BrandHeader("Unlock your workflow", "VYRO PRO", "PREMIUM")
        Spacer(Modifier.height(25.dp))
        Box(Modifier.fillMaxWidth().clip(RoundedCornerShape(26.dp)).background(Brush.linearGradient(listOf(Color(0xFF4A2F83), Color(0xFF153E52)))).padding(22.dp)) {
            Column {
                Icon(Icons.Rounded.Diamond, null, tint = Cyan, modifier = Modifier.size(36.dp))
                Spacer(Modifier.height(13.dp))
                Text("CREATE BEYOND LIMITS", color = Color.White, fontSize = 21.sp, fontWeight = FontWeight.Black)
                Text("A premium toolkit for your next-level edits.", color = Color.White.copy(.75f), fontSize = 12.sp)
            }
        }
        Spacer(Modifier.height(22.dp))
        listOf("Advanced effect & transition packs", "High-quality export presets", "Premium titles and motion graphics", "Cloud project sync (when enabled)", "AI-assisted tools as they become available").forEach {
            Row(Modifier.padding(vertical = 9.dp), verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Rounded.CheckCircle, null, tint = Cyan, modifier = Modifier.size(19.dp))
                Spacer(Modifier.width(11.dp))
                Text(it, color = Color.White, fontSize = 13.sp)
            }
        }
        Spacer(Modifier.height(18.dp))
        Text("Subscriptions and payments are not active in this foundation build. Billing will be added with verified store purchases and an eligible account holder.", color = Muted, fontSize = 11.sp, lineHeight = 17.sp)
    }
}
