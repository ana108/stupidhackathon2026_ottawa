import { ChangeDetectorRef, Component, HostListener, OnInit, signal } from '@angular/core'
import { RouterOutlet } from '@angular/router'


@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements OnInit {
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
  ngOnInit(): void {
    this.updateWindowSize()
    this.buttonXStart = this.windowWidth - 300
    this.buttonXEnd = this.buttonXStart + 120
    this.buttonYEnd = this.buttonYStart + 20

    this.buttonYStart = 600
    document.addEventListener('mousemove', this.onMouseMove, { capture: true })
  }

  setButtonMath(newX: number, newY: number) {
    this.buttonXStart = newX % this.windowWidth
    this.buttonYStart = newY % this.windowHeight

    this.buttonXEnd = this.buttonXStart + 120
    this.buttonYEnd = this.buttonYStart + 20
  }

  @HostListener('window:resize')
  updateWindowSize(): void {
    this.windowWidth = window.innerWidth
    this.windowHeight = window.innerHeight
  }
  historyX: number[] = [0]
  historyY: number[] = [0]
  // @HostListener('mousemove', ['$event'])
  onMouseMove = (event: MouseEvent): void => {
    this.x = event.offsetX
    this.y = event.offsetY
    this.cdr.detectChanges()
    this.addMovement()
    this.isInRadius()
  }

  addMovement = () => {
    this.historyX.push(this.x)
    this.historyY.push(this.y)
    if (this.historyX.length > 10) {
      this.historyX.pop()
    }
    if (this.historyY.length > 10) {
      this.historyY.pop()
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
      newY = this.buttonYStart + this.CHANGE_PACE
    } else if (recentY - previousY < 0) {
      newY = this.buttonYStart - this.CHANGE_PACE

    }
    this.setButtonMath(newX, newY)
  }

  isInRadius() {
    const isXIn = Math.abs(Number(this.x) - Number(this.buttonXStart)) < 100 || Math.abs(Number(this.x) - Number(this.buttonXEnd)) < 100
    const isYIn = Math.abs(this.y - this.buttonYStart) < 100 || Math.abs(this.y - this.buttonYEnd) < 100

    if (isXIn && isYIn) {
      //console.log('cursor is in radius, time to move')
      // move the mouse until 
      this.calculateNewBtnAddress()
    }
  }



}
