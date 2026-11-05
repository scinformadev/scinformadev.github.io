(() => {
  class CourseVideoPlayer extends HTMLElement {
    static get observedAttributes() { return ['src', 'poster', 'title', 'heading', 'description', 'playback']; }

    connectedCallback() { this.render(); }
    attributeChangedCallback() { if (this.isConnected) this.render(); }
    disconnectedCallback() { this.querySelector('video')?.pause(); }

    source() {
      try {
        const url = new URL(this.getAttribute('src') || '', document.baseURI);
        if (!this.getAttribute('src') || !['http:', 'https:', 'file:'].includes(url.protocol)) return null;
        const host = url.hostname.toLowerCase();
        let id;
        if (host === 'youtu.be') id = url.pathname.split('/')[1];
        else if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com'].includes(host)) {
          id = url.pathname === '/watch' ? url.searchParams.get('v') : url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1];
        }
        if (id && /^[A-Za-z0-9_-]{11}$/.test(id)) {
          const stamp = url.searchParams.get('start') || url.searchParams.get('t') || url.hash.match(/(?:^#|[&])t=([^&]+)/)?.[1] || '';
          const match = stamp.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/);
          const start = match ? Math.min(2147483647, Number(match[1] || 0) * 3600 + Number(match[2] || 0) * 60 + Number(match[3] || 0)) : 0;
          return { type: 'youtube', url, id, start };
        }
        if (/\.(mp4|webm|ogg|ogv)$/i.test(url.pathname)) return { type: 'file', url };
        // Unknown providers retain the reference's external-link behavior.
        return ['http:', 'https:'].includes(url.protocol) ? { type: 'external', url } : null;
      } catch { return null; }
    }

    render() {
      this.querySelector('video')?.pause();
      // Preserve author-supplied caption tracks across renders.
      if (!this.tracks) this.tracks = [...this.querySelectorAll(':scope > track')].map(track => track.cloneNode(true));
      this.replaceChildren();
      const title = this.getAttribute('title') || 'Course video';
      this.setAttribute('role', 'group');
      this.setAttribute('aria-label', title);
      const frame = document.createElement('div');
      frame.className = 'course-video-player__frame';
      this.append(frame);
      const source = this.source();
      if (!source) {
        const message = document.createElement('p');
        message.className = 'course-video-player__message';
        message.setAttribute('role', 'status');
        message.textContent = 'Video unavailable. Add a valid video source.';
        frame.append(message);
        return;
      }
      const poster = this.getAttribute('poster');
      if (poster) {
        const image = document.createElement('img');
        image.className = 'course-video-player__poster';
        image.src = poster;
        image.alt = ''; // The adjacent text names the video; the thumbnail is decorative.
        image.addEventListener('error', () => image.remove(), { once: true });
        frame.append(image);
      }
      const overlay = document.createElement('div');
      overlay.className = 'course-video-player__overlay';
      const heading = document.createElement('h3');
      heading.textContent = this.getAttribute('heading') || 'Watch the video';
      const description = document.createElement('p');
      description.textContent = this.getAttribute('description') || title;
      const external = source.type === 'external' || this.getAttribute('playback') === 'external' || (source.type === 'youtube' && this.getAttribute('playback') !== 'inline');
      const control = document.createElement(external ? 'a' : 'button');
      control.className = 'course-video-player__play';
      if (external) {
        control.href = source.url.href;
        control.target = '_blank';
        control.rel = 'noopener noreferrer';
        control.textContent = source.type === 'youtube' ? '▶ Watch on YouTube' : '▶ Watch video';
        control.setAttribute('aria-label', `Watch ${title} (opens in a new tab)`);
      } else {
        control.type = 'button';
        control.textContent = '▶ Play video';
        control.setAttribute('aria-label', `Play ${title}`);
        control.addEventListener('click', () => this.play(frame, source, title));
      }
      overlay.append(heading, description, control);
      frame.append(overlay);
      if (!external) {
        const fallback = document.createElement('a');
        fallback.className = 'course-video-player__fallback';
        fallback.href = source.url.href;
        fallback.target = '_blank';
        fallback.rel = 'noopener noreferrer';
        fallback.textContent = source.type === 'youtube' ? 'Open on YouTube (new tab)' : 'Open video (new tab)';
        this.append(fallback);
      }
    }

    play(frame, source, title) {
      frame.replaceChildren();
      if (source.type === 'youtube') {
        const iframe = document.createElement('iframe');
        const embed = new URL(`https://www.youtube-nocookie.com/embed/${source.id}`);
        embed.searchParams.set('autoplay', '1');
        if (source.start) embed.searchParams.set('start', String(source.start));
        iframe.src = embed.href;
        iframe.title = title;
        iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
        iframe.allowFullscreen = true;
        iframe.referrerPolicy = 'strict-origin-when-cross-origin';
        frame.append(iframe);
        iframe.focus();
      } else {
        const video = document.createElement('video');
        video.controls = true;
        video.playsInline = true;
        video.preload = 'metadata';
        video.setAttribute('aria-label', title);
        if (this.getAttribute('poster')) video.poster = this.getAttribute('poster');
        video.src = source.url.href;
        this.tracks.forEach(track => video.append(track.cloneNode(true)));
        frame.append(video);
        video.focus();
        // Playback can be blocked by browser settings; native controls remain available.
        video.play().catch(() => {});
      }
    }
  }
  if (!customElements.get('course-video-player')) customElements.define('course-video-player', CourseVideoPlayer);
})();
