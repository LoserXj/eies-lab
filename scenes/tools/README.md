# Recording the homepage scene

The homepage hero plays a recording of the live scene (GitHub Pages cannot serve the 1.6 GB of 3D tiles),
with one button per act. Re-record after changing the scene, its acts or the camera.

Needs: the scene dev server with the data (`pnpm scenes:dev`, data in `../data/` beside the site repo),
Google Chrome, Python 3 with `websocket-client`, ffmpeg with libx264 and libsvtav1.

```bash
python3 scenes/tools/record-hero.py /tmp/hero-frames 30          # 65 s × 30 fps, about 2.5 min
```

Encode (keyframes at the act starts, so the act buttons jump instantly; standard-range bt709 colour):

```bash
K="0,9,24,33,44,55"   # act starts in seconds, from /tmp/hero-frames/acts.json
ffmpeg -framerate 30 -i /tmp/hero-frames/f%05d.jpg \
  -vf "scale=1920:1080:out_range=tv:out_color_matrix=bt709,format=yuv420p10le" \
  -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -c:v libsvtav1 -preset 5 -crf 50 -g 60 -force_key_frames "$K" -an -movflags +faststart \
  assets/media/scenes/pv-polyu-av1.mp4
ffmpeg -framerate 30 -i /tmp/hero-frames/f%05d.jpg \
  -vf "scale=1600:-2:flags=lanczos:out_range=tv:out_color_matrix=bt709,format=yuv420p" \
  -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -c:v libx264 -preset veryslow -crf 33 -profile:v high -level 4.1 -g 60 -keyint_min 30 \
  -force_key_frames "$K" -movflags +faststart -an assets/media/scenes/pv-polyu.mp4
```

Then update `assets/media/scenes/pv-polyu.json` (act starts, durations and titles) if the acts changed.
The AV1 file (about 7 MB) is used where the browser supports it; the H.264 file (about 6 MB) everywhere else.
