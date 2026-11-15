import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, inject, NgZone, OnInit, signal, viewChild } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { Subscription, fromEvent } from 'rxjs'


@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements AfterViewInit {
  private ngZone = inject(NgZone);
  private cursor = viewChild.required<ElementRef<HTMLDivElement>>('cursor');
  private sub?: Subscription
  private btn = viewChild.required<ElementRef<HTMLButtonElement>>('evilBtn');

  constructor(private cdr: ChangeDetectorRef) { }


  protected readonly title = signal('frontend');
  CHANGE_PACE: number = 8

  windowWidth = 0;
  windowHeight = 0;
  x = 0;
  y = 0;

  buttonXStart = 0
  buttonXEnd = this.buttonXStart + 120
  buttonYStart = 0
  buttonYEnd = this.buttonYStart + 20

  ngAfterViewInit(): void {
    this.updateWindowSize()
    this.setButtonMath(this.windowWidth * 0.7, 600)
    this.ngZone.runOutsideAngular(() => {
      // Register your mouse listener and update the button here.
      document.addEventListener('mousemove', this.onMouseMove, { capture: true })

    })
  }

  setButtonMath = (newX: number, newY: number) => {
    // this.buttonXStart = Math.abs(newX % (this.windowWidth - 200))
    // this.buttonYStart = newY % (this.windowHeight - 40)

    // this.buttonXEnd = this.buttonXStart
    // this.buttonYEnd = this.buttonYStart
    // this.btn().nativeElement.style.left = `${this.buttonXStart}px`
    // this.btn().nativeElement.style.top = `${this.buttonYStart}px`
    const maxX = this.windowWidth - 200
    const maxY = this.windowHeight - 40

    this.buttonXStart = ((newX % maxX) + maxX) % maxX
    this.buttonYStart = ((newY % maxY) + maxY) % maxY

    this.buttonXEnd = this.buttonXStart + 200
    this.buttonYEnd = this.buttonYStart + 20

    this.btn().nativeElement.style.left = `${this.buttonXStart}px`
    this.btn().nativeElement.style.top = `${this.buttonYStart}px`
  }

  setButtonRandom = () => {
    const randomX = this.randomInt(0, this.windowWidth - 200, this.x)
    const randomY = this.randomInt(0, this.windowHeight - 30, this.y)

    this.buttonXStart = randomX //newX % (this.windowWidth - 200)
    this.buttonYStart = randomY //newY % (this.windowHeight - 50)

    this.buttonXEnd = this.buttonXStart + 200
    this.buttonYEnd = this.buttonYStart + 20

    this.btn().nativeElement.style.left = `${this.buttonXStart}px`
    this.btn().nativeElement.style.top = `${this.buttonYStart}px`
  }

  randomInt(min: number, max: number, cursorLoc: number) {
    let isValid = false
    let randomVal = Math.floor(Math.random() * (max - min + 1)) + min
    while (!isValid) {
      if (Math.abs(cursorLoc - randomVal) < 200) {
        randomVal = Math.floor(Math.random() * (max - min + 1)) + min
      } else {
        isValid = true
      }
    }
    return randomVal
  }

  @HostListener('window:resize')
  updateWindowSize(): void {
    this.windowWidth = window.innerWidth
    this.windowHeight = window.innerHeight
  }
  historyX: number[] = [0]
  historyY: number[] = [0]
  onMouseMove = (event: MouseEvent): void => {
    this.x = event.offsetX
    this.y = event.offsetY
    this.addMovement()
    this.isInRadius()
  }

  addMovement = () => {
    this.historyX.push(this.x)
    this.historyY.push(this.y)
    if (this.historyX.length > 10) {
      this.historyX.shift()
    }
    if (this.historyY.length > 10) {
      this.historyY.shift()
    }
  }
  calculateNewBtnAddress() {
    let recentX = this.historyX[this.historyX.length - 1]
    let previousX = this.historyX[this.historyX.length - 2]
    let recentY = this.historyY[this.historyY.length - 1]
    let previousY = this.historyY[this.historyY.length - 2]

    let newX = this.buttonXStart
    let newY = this.buttonYStart
    if (recentX - previousX > 0) {
      // mouse coming from left, so move right
      newX = this.buttonXStart + this.CHANGE_PACE
    } else if (recentX - previousX < 0) {
      // mouse coming from right; so move left
      newX = this.buttonXStart - this.CHANGE_PACE
    }
    if (recentY - previousY > 0) {
      newY = this.buttonYStart - this.CHANGE_PACE
    } else if (recentY - previousY < 0) {
      newY = this.buttonYStart + this.CHANGE_PACE
    }
    console.log('Moving button')
    // this.setButtonMath(newX, newY)
    this.setButtonRandom()
  }

  isInRadius() {
    const radius = 300
    const isXIn = Math.abs(Number(this.x) - Number(this.buttonXStart)) < radius || Math.abs(Number(this.buttonXEnd) - Number(this.x)) < radius
    const isYIn = Math.abs(this.y - this.buttonYStart) < radius || Math.abs(this.buttonYEnd - this.y) < radius

    if (isXIn && isYIn) {
      //console.log('cursor is in radius, time to move')
      // move the mouse until 
      this.calculateNewBtnAddress()
    }
  }



}
