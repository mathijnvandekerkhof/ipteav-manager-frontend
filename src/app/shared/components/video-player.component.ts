import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import Plyr from 'plyr';
import Hls from 'hls.js';

@Component({
  selector: 'app-video-player',
  standalone: true,
  template: `
    <div class="player-container">
      <video #videoElement playsinline controls></video>
    </div>
  `,
  styles: [`
    .player-container {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    video {
      width: 100%;
      height: auto;
    }
  `]
})
export class VideoPlayerComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() streamUrl!: string;
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  
  private player?: Plyr;
  private hls?: Hls;
  
  ngOnInit() {}
  
  ngAfterViewInit() {
    this.initPlayer();
  }
  
  initPlayer() {
    const video = this.videoElement.nativeElement;
    
    if (this.streamUrl.includes('.m3u8')) {
      if (Hls.isSupported()) {
        this.hls = new Hls();
        this.hls.loadSource(this.streamUrl);
        this.hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = this.streamUrl;
      }
    } else {
      video.src = this.streamUrl;
    }
    
    this.player = new Plyr(video, {
      controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'settings', 'fullscreen'],
      settings: ['quality', 'speed'],
      quality: { default: 720, options: [4320, 2880, 2160, 1440, 1080, 720, 576, 480, 360, 240] }
    });
  }
  
  ngOnDestroy() {
    if (this.player) {
      this.player.destroy();
    }
    if (this.hls) {
      this.hls.destroy();
    }
  }
}
