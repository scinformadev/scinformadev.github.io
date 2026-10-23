# Course video player

Reusable thumbnail and playback component adapted from the video block in the Time Management course’s Burnout at a Glance lesson. Requires the course theme; component styling uses functional theme tokens.

```html
<link rel="stylesheet" href="styles/theme.css">
<link rel="stylesheet" href="components/video-player.css">
<script src="components/video-player.js" defer></script>

<course-video-player
  src="https://youtu.be/USo7V6kwfEk"
  poster="images/module2-lesson3-socratic-method.jpg"
  title="Socratic method"
  description="Socratic method"
></course-video-player>
```

- `src`: YouTube watch, short, shorts, or embed URL; a relative/local MP4, WebM, or Ogg video; or another HTTP(S) video page. YouTube timestamp parameters such as `t=26s`, `t=1m30s`, and `start=90` are preserved.
- `poster`: optional thumbnail path relative to the lesson HTML. No third-party thumbnail is fetched automatically.
- `title`: accessible video title, also the default subtitle.
- `heading`: optional heading, default “Watch the video”.
- `description`: optional subtitle, defaulting to `title`.
- YouTube opens externally by default, matching the reference lesson. Use `playback="inline"` to enable embedded YouTube playback. Native video files play inline by default. Use `playback="external"` to open any video in a new tab. Other providers always use an external link.
- `--course-video-player-height`: frame height, default 238px.
- `--course-video-player-mobile-height`: optional small-screen height. Allow about 30px beneath inline players for the external fallback link when planning fixed-height lesson layouts.

In inline mode, YouTube is loaded only after Play is activated, using its privacy-enhanced embed domain. The external link remains available if an embed cannot play. Native files use browser controls and do not preload until activated. Playback is never started automatically on initial render.

Native videos can include caption tracks:

```html
<course-video-player src="media/lesson-video.mp4" title="Lesson video">
  <track kind="captions" src="media/lesson-video.en.vtt" srclang="en" label="English" default>
</course-video-player>
```

Use a captioned source and/or supply a transcript alongside the component. Changing configuration attributes resets playback. Native video pauses when the component is disconnected; hiding a lesson panel should also pause any playing video or remove the player if playback must stop.

The source lesson and active Problem Solving lessons are unchanged. To use the component in another course, copy its JS and CSS and provide that course’s functional theme tokens.
