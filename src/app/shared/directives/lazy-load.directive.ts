import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[appLazyLoad]',
  standalone: true
})
export class LazyLoadDirective implements OnInit {
  @Input() appLazyLoad!: string;
  
  constructor(private el: ElementRef<HTMLImageElement>) {}
  
  ngOnInit() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.el.nativeElement.src = this.appLazyLoad;
          observer.unobserve(this.el.nativeElement);
        }
      });
    });
    
    observer.observe(this.el.nativeElement);
  }
}
