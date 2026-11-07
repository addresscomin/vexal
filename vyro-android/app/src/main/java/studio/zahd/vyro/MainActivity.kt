package studio.zahd.vyro

import android.content.Context
import android.net.Uri
import android.os.Bundle
import android.provider.OpenableColumns
import android.media.MediaMetadataRetriever
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.media3.common.MediaItem
import androidx.media3.common.PlaybackParameters
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView
import androidx.compose.ui.viewinterop.AndroidView
import androidx.media3.common.util.UnstableApi
import studio.zahd.vyro.editor.MediaExportEngine
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

private val Ink = Color(0xFF080A12)
private val Panel = Color(0xFF141827)
private val Panel2 = Color(0xFF20283A)
private val Violet = Color(0xFF9B7BFF)
private val Cyan = Color(0xFF63E6E2)
private val Muted = Color(0xFF929AAF)

private enum class MediaKind { VIDEO, IMAGE, AUDIO }
private data class EditClip(
    val id: String,
    val uri: Uri,
    val name: String,
    val kind: MediaKind,
    val durationMs: Long,
    val trimStartMs: Long = 0L,
    val trimEndMs: Long = durationMs,
    val speed: Float = 1f,
    val volume: Float = 1f
) {
    val lengthMs: Long get() = ((trimEndMs - trimStartMs) / speed).toLong().coerceAtLeast(0L)
}

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { SkyCutApp() }
    }
}

@Composable
private fun SkyCutApp() {
    var clips by remember { mutableStateOf(listOf<EditClip>()) }
    var selectedId by remember { mutableStateOf<String?>(null) }
    var page by remember { mutableStateOf("home") }
    val context = LocalContext.current
    val picker = rememberLauncherForActivityResult(ActivityResultContracts.OpenMultipleDocuments()) { uris ->
        if (uris.isNotEmpty()) {
            val added = uris.mapNotNull { uri -> readClip(context, uri) }
            clips = clips + added
            if (selectedId == null && added.isNotEmpty()) selectedId = added.first().id
            page = "editor"
            Toast.makeText(context, "${added.size} media item(s) added to timeline", Toast.LENGTH_SHORT).show()
        }
    }
    val selected = clips.firstOrNull { it.id == selectedId }
    MaterialTheme(colorScheme = darkColorScheme(background = Ink, surface = Panel, primary = Violet, secondary = Cyan)) {
        Scaffold(
            containerColor = Ink,
            bottomBar = {
                NavigationBar(containerColor = Color(0xFF0D111D)) {
                    NavigationBarItem(selected = page == "home", onClick = { page = "home" }, icon = { Icon(Icons.Rounded.Home, null) }, label = { Text("Home") })
                    NavigationBarItem(selected = page == "editor", onClick = { page = "editor" }, icon = { Icon(Icons.Rounded.Movie, null) }, label = { Text("Editor") })
                    NavigationBarItem(selected = page == "effects", onClick = { page = "effects" }, icon = { Icon(Icons.Rounded.AutoAwesome, null) }, label = { Text("Effects") })
                }
            }
        ) { padding ->
            when (page) {
                "home" -> HomePage(Modifier.padding(padding), clips.size, onNew = { picker.launch(arrayOf("video/*", "image/*", "audio/*")) }, onOpen = { page = "editor" })
                "editor" -> EditorPage(
                    Modifier.padding(padding), clips, selected, onImport = { picker.launch(arrayOf("video/*", "image/*", "audio/*")) },
                    onSelect = { selectedId = it },
                    onDelete = { id -> clips = clips.filterNot { it.id == id }; if (selectedId == id) selectedId = clips.firstOrNull()?.id },
                    onSplit = { clip ->
                        val cut = clip.trimStartMs + (clip.trimEndMs - clip.trimStartMs) / 2
                        if (cut > clip.trimStartMs && cut < clip.trimEndMs) {
                            val left = clip.copy(trimEndMs = cut)
                            val right = clip.copy(id = java.util.UUID.randomUUID().toString(), trimStartMs = cut)
                            val index = clips.indexOfFirst { it.id == clip.id }
                            clips = clips.toMutableList().also { it.removeAt(index); it.add(index, right); it.add(index, left) }
                            selectedId = right.id
                            Toast.makeText(context, "Clip split into two timeline clips", Toast.LENGTH_SHORT).show()
                        }
                    },
                    onSpeed = { clip -> clips = clips.map { if (it.id == clip.id) it.copy(speed = when (it.speed) { 0.5f -> 1f; 1f -> 2f; else -> 0.5f }) else it } },
                    onVolume = { clip -> clips = clips.map { if (it.id == clip.id) it.copy(volume = if (it.volume == 0f) 1f else 0f) else it } },
                    onTrim = { clip, start, end -> clips = clips.map { if (it.id == clip.id) it.copy(trimStartMs = start, trimEndMs = end) else it } },
                    onExport = { clip -> exportClip(context, clip) }
                )
                else -> EffectsPage(Modifier.padding(padding))
            }
        }
    }
}

private fun readClip(context: Context, uri: Uri): EditClip? {
    return try {
        val type = context.contentResolver.getType(uri).orEmpty()
        val kind = when {
            type.startsWith("video/") -> MediaKind.VIDEO
            type.startsWith("image/") -> MediaKind.IMAGE
            type.startsWith("audio/") -> MediaKind.AUDIO
            else -> return null
        }
        var name = "Media"
        context.contentResolver.query(uri, arrayOf(OpenableColumns.DISPLAY_NAME), null, null, null)?.use { cursor ->
            if (cursor.moveToFirst()) name = cursor.getString(0) ?: name
        }
        val duration = if (kind == MediaKind.IMAGE) 5000L else {
            val retriever = MediaMetadataRetriever()
            try {
                retriever.setDataSource(context, uri)
                retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION)?.toLongOrNull() ?: 5000L
            } finally { retriever.release() }
        }
        EditClip(java.util.UUID.randomUUID().toString(), uri, name, kind, duration.coerceAtLeast(1000L))
    } catch (_: Exception) { null }
}

private fun exportClip(context: Context, clip: EditClip) {
    if (clip.kind != MediaKind.VIDEO) {
        Toast.makeText(context, "Video export currently supports selected video clips", Toast.LENGTH_LONG).show()
        return
    }
    val folder = context.getExternalFilesDir(android.os.Environment.DIRECTORY_MOVIES) ?: context.cacheDir
    folder.mkdirs()
    val stamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(Date())
    val output = File(folder, "SkyCut_$stamp.mp4")
    Toast.makeText(context, "Export started…", Toast.LENGTH_SHORT).show()
    MediaExportEngine(context).exportClip(
        source = clip.uri,
        outputPath = output.absolutePath,
        trimStartMs = clip.trimStartMs,
        trimEndMs = clip.trimEndMs,
        onComplete = { Toast.makeText(context, "Export complete: ${output.name}", Toast.LENGTH_LONG).show() },
        onError = { error -> Toast.makeText(context, "Export failed: ${error.message}", Toast.LENGTH_LONG).show() }
    )
}

@Composable
private fun HomePage(modifier: Modifier, count: Int, onNew: () -> Unit, onOpen: () -> Unit) {
    Column(modifier.fillMaxSize().background(Ink).verticalScroll(rememberScrollState()).padding(20.dp)) {
        Spacer(Modifier.height(20.dp))
        Text("SKYCUT", color = Color.White, fontSize = 30.sp, fontWeight = FontWeight.Black, letterSpacing = 3.sp)
        Text("MOBILE VIDEO EDITOR", color = Cyan, fontSize = 10.sp, letterSpacing = 2.sp)
        Spacer(Modifier.height(28.dp))
        Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(24.dp)).background(Panel2).padding(22.dp)) {
            Text("Create a new project", color = Color.White, fontSize = 23.sp, fontWeight = FontWeight.Bold)
            Text("Import videos, photos and audio from your phone.", color = Muted, fontSize = 13.sp)
            Spacer(Modifier.height(18.dp))
            Button(onClick = onNew, modifier = Modifier.fillMaxWidth(), colors = ButtonDefaults.buttonColors(containerColor = Cyan, contentColor = Ink)) {
                Icon(Icons.Rounded.Add, null); Spacer(Modifier.width(8.dp)); Text("NEW PROJECT · IMPORT MEDIA", fontWeight = FontWeight.Bold)
            }
        }
        Spacer(Modifier.height(18.dp))
        Surface(color = Panel, shape = RoundedCornerShape(18.dp), modifier = Modifier.fillMaxWidth().clickable(onClick = onOpen)) {
            Row(Modifier.padding(18.dp), verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Rounded.VideoLibrary, null, tint = Violet, modifier = Modifier.size(30.dp))
                Spacer(Modifier.width(12.dp))
                Column(Modifier.weight(1f)) {
                    Text("Current project", color = Color.White, fontWeight = FontWeight.Bold)
                    Text("$count media clip(s) imported", color = Muted, fontSize = 12.sp)
                }
                Icon(Icons.Rounded.ChevronRight, null, tint = Muted)
            }
        }
        Spacer(Modifier.height(18.dp))
        Text("Select multiple videos, photos or audio files. Imported clips appear in the editable timeline.", color = Muted, fontSize = 12.sp)
    }
}

@OptIn(UnstableApi::class)
@Composable
private fun EditorPage(
    modifier: Modifier, clips: List<EditClip>, selected: EditClip?, onImport: () -> Unit,
    onSelect: (String) -> Unit, onDelete: (String) -> Unit, onSplit: (EditClip) -> Unit,
    onSpeed: (EditClip) -> Unit, onVolume: (EditClip) -> Unit,
    onTrim: (EditClip, Long, Long) -> Unit, onExport: (EditClip) -> Unit
) {
    Column(modifier.fillMaxSize().background(Ink).padding(horizontal = 14.dp, vertical = 10.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                Text("SKYCUT STUDIO", color = Cyan, fontSize = 10.sp, letterSpacing = 2.sp, fontWeight = FontWeight.Bold)
                Text("Editing workspace", color = Color.White, fontSize = 23.sp, fontWeight = FontWeight.Black)
            }
            TextButton(onClick = onImport) { Icon(Icons.Rounded.Add, null); Text("Import") }
        }
        Spacer(Modifier.height(10.dp))
        Box(Modifier.fillMaxWidth().weight(1f).clip(RoundedCornerShape(18.dp)).background(Color.Black), contentAlignment = Alignment.Center) {
            when {
                selected == null -> Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(Icons.Rounded.AddToPhotos, null, tint = Violet, modifier = Modifier.size(48.dp))
                    Text("Import media to start editing", color = Color.White)
                    Text("Video · Photo · Audio", color = Muted, fontSize = 12.sp)
                }
                selected.kind == MediaKind.VIDEO -> VideoCanvas(selected)
                selected.kind == MediaKind.IMAGE -> Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(Icons.Rounded.Image, null, tint = Cyan, modifier = Modifier.size(42.dp))
                    Text(selected.name, color = Color.White)
                    Text("Photo clip · 5 seconds", color = Muted, fontSize = 11.sp)
                }
                else -> Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(Icons.Rounded.MusicNote, null, tint = Cyan, modifier = Modifier.size(42.dp))
                    Text(selected.name, color = Color.White)
                    Text("Audio clip", color = Muted, fontSize = 11.sp)
                }
            }
        }
        Spacer(Modifier.height(12.dp))
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text("TIMELINE", color = Cyan, fontSize = 10.sp, fontWeight = FontWeight.Bold, letterSpacing = 2.sp)
            Spacer(Modifier.weight(1f))
            Text("${clips.size} clips", color = Muted, fontSize = 11.sp)
            IconButton(onClick = onImport) { Icon(Icons.Rounded.AddCircle, "Import media", tint = Cyan) }
        }
        if (clips.isEmpty()) {
            Surface(color = Panel, shape = RoundedCornerShape(12.dp), modifier = Modifier.fillMaxWidth().clickable(onClick = onImport)) {
                Text("＋  Tap here to import media into your timeline", color = Muted, modifier = Modifier.padding(18.dp), fontSize = 12.sp)
            }
        } else {
            Row(Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                clips.forEachIndexed { index, clip ->
                    val active = selected?.id == clip.id
                    Column(Modifier.width(142.dp).clip(RoundedCornerShape(12.dp)).background(if (active) Color(0xFF30254F) else Panel)
                        .clickable { onSelect(clip.id) }.padding(10.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(when (clip.kind) { MediaKind.VIDEO -> Icons.Rounded.Videocam; MediaKind.IMAGE -> Icons.Rounded.Image; MediaKind.AUDIO -> Icons.Rounded.MusicNote }, null, tint = if (active) Cyan else Violet)
                            Spacer(Modifier.width(6.dp))
                            Text("CLIP ${index + 1}", color = if (active) Cyan else Muted, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                        }
                        Spacer(Modifier.height(8.dp))
                        Text(clip.name, color = Color.White, fontSize = 11.sp, maxLines = 2, minLines = 2)
                        Spacer(Modifier.height(6.dp))
                        Box(Modifier.fillMaxWidth().height(7.dp).clip(RoundedCornerShape(8.dp)).background(if (clip.kind == MediaKind.AUDIO) Color(0xFF245B63) else Color(0xFF55418C)))
                        Text("${(clip.lengthMs / 1000f).let { String.format(Locale.US, "%.1f", it) }}s · ${clip.speed}x", color = Muted, fontSize = 9.sp)
                    }
                }
            }
        }
        Spacer(Modifier.height(10.dp))
        if (selected != null) {
            Row(Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(7.dp)) {
                ToolButton("Split", Icons.Rounded.ContentCut) { onSplit(selected) }
                ToolButton("Trim", Icons.Rounded.Tune) { onTrim(selected, (selected.trimStartMs + 500L).coerceAtMost(selected.trimEndMs - 500L), selected.trimEndMs) }
                ToolButton("Speed", Icons.Rounded.Speed) { onSpeed(selected) }
                ToolButton(if (selected.volume == 0f) "Unmute" else "Mute", Icons.Rounded.VolumeUp) { onVolume(selected) }
                ToolButton("Delete", Icons.Rounded.Delete) { onDelete(selected.id) }
                ToolButton("Export", Icons.Rounded.FileUpload) { onExport(selected) }
            }
            Text("Selected: ${selected.name}  •  ${selected.kind.name}  •  Trim ${selected.trimStartMs}–${selected.trimEndMs} ms", color = Muted, fontSize = 9.sp, modifier = Modifier.padding(top = 8.dp, bottom = 4.dp))
        }
    }
}

@Composable
private fun ToolButton(label: String, icon: androidx.compose.ui.graphics.vector.ImageVector, onClick: () -> Unit) {
    Surface(color = Panel2, shape = RoundedCornerShape(12.dp), modifier = Modifier.clickable(onClick = onClick)) {
        Column(Modifier.padding(horizontal = 13.dp, vertical = 10.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(icon, null, tint = Cyan, modifier = Modifier.size(19.dp))
            Text(label, color = Color.White, fontSize = 10.sp)
        }
    }
}

@OptIn(UnstableApi::class)
@Composable
private fun VideoCanvas(clip: EditClip) {
    val context = LocalContext.current
    val player = remember(clip.uri) {
        ExoPlayer.Builder(context).build().apply {
            setMediaItem(MediaItem.fromUri(clip.uri))
            prepare()
            playWhenReady = false
        }
    }
    LaunchedEffect(clip.speed, clip.volume) {
        player.playbackParameters = PlaybackParameters(clip.speed)
        player.volume = clip.volume
    }
    DisposableEffect(player) { onDispose { player.release() } }
    AndroidView(Modifier.fillMaxSize(), factory = { ctx ->
        PlayerView(ctx).apply { this.player = player; useController = true }
    }, update = { it.player = player })
}

@Composable
private fun EffectsPage(modifier: Modifier) {
    Column(modifier.fillMaxSize().background(Ink).padding(20.dp)) {
        Text("EFFECTS", color = Cyan, fontSize = 11.sp, letterSpacing = 2.sp)
        Text("Creative tools", color = Color.White, fontSize = 26.sp, fontWeight = FontWeight.Black)
        Spacer(Modifier.height(12.dp))
        Text("The editing workspace is being built around real media import and timeline operations. GPU effect rendering will be added as a separate engine layer.", color = Muted, fontSize = 13.sp)
    }
}
