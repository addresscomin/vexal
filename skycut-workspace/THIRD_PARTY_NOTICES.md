# Third-party source notices

SkyCut's rebuild workspace uses pinned upstream repositories and selected copied source modules. Keep these notices with source distributions and shipped binaries as required by each upstream license.

## MIT-licensed projects

- **LibreCuts** — https://github.com/tharunbirla/LibreCuts — MIT License — Copyright (c) 2024 Tharun Birla. License copy: `vendor/librecuts/LICENSE`. Selected Android editor, model, ViewModel, command, timeline, mask, transition and FFmpeg export files are copied under `vendor/librecuts/`.
- **OpenScene** — https://github.com/Theorvane/OpenScene — MIT License — Copyright (c) 2026 Theorvane. License copy: `vendor/openscene/LICENSE`. Selected mobile project/timeline, media library and native export modules are copied under `vendor/openscene/`.
- **FreeCut** — https://github.com/walterlow/freecut — MIT License. License copy: `vendor/freecut/LICENSE`. Selected render/export, keyframe and timeline utility files are copied under `vendor/freecut/`.
- **OpenCut** — https://github.com/OpenCut-app/OpenCut — MIT License. License copy: `vendor/opencut/LICENSE`. Selected Rust desktop timeline, web editor route, desktop manifest and FFmpeg setup modules are copied under `vendor/opencut/`; the upstream is also pinned under `sources/opencut`.

## Compliance notes

The MIT license requires retaining applicable copyright and permission notices in copies or substantial portions of the software. Source projects remain pinned under `sources/` for review of their full dependency and asset notices. Audit all transitive dependencies, fonts, media assets and platform SDK terms before release.

GPL-licensed projects such as Shotcut and Kdenlive are not copied into this MIT source baseline. Their code must not be combined into a distributed product without first choosing and meeting the applicable copyleft obligations. Features may be independently implemented without copying their protected code.

This file is a working attribution index, not legal advice or a substitute for a release-by-release license audit.
