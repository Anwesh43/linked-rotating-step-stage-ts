const w : number = window.innerWidth, h : number = window.innerHeight, LRL_NODES = 5

class LinkedRotatingStepStage {

    canvas : HTMLCanvasElement = document.createElement('canvas')

    context : CanvasRenderingContext2D

    animator : Animator = new Animator()

    lrlStep : LinkedRotatingStep = new LinkedRotatingStep()

    constructor() {
        this.initCanvas()
    }

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = '#212121'
        this.context.fillRect(0, 0, w, h)
        this.lrlStep.draw(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.lrlStep.startUpdating(() => {
                this.animator.start(() => {
                    this.render()
                    this.lrlStep.update(() => {
                        this.animator.stop()
                    })
                })
            })
        }
    }

    static init() {
        const stage : LinkedRotatingStepStage = new LinkedRotatingStepStage()
        stage.render()
        stage.handleTap()
    }
}

class State {

    scales : Array<number> = [0, 0]

    dir : number = 0

    prevScale : number = 0

    j : number = 0

    update(stopcb : Function) {
        this.scales[this.j] += this.dir * 0.1
        if (Math.abs(this.scales[this.j] - this.prevScale) > 1) {
            this.prevScale = this.scales[this.j] + this.dir
            this.j += this.dir
            if (this.j == this.scales.length || this.j == -1) {
                this.j -= this.dir
                this.dir = 0
                this.scales[this.j] = this.prevScale + this.dir
                stopcb()
            }
        }
    }

    startUpdating(startcb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            startcb()
        }
    }
}

class Animator {

    animated : boolean = false

    interval : number

    start(updatecb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(() => {
                updatecb()
            }, 50)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class LRLNode {

    next : LRLNode

    prev : LRLNode

    state : State = new State()

    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < LRL_NODES - 1) {
            this.next = new LRLNode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context : CanvasRenderingContext2D) {
        const size : number = Math.min(w, h) / LRL_NODES
        context.strokeStyle = '#2ecc71'
        context.lineWidth = size/15
        context.lineCap = 'round'
        context.save()
        context.translate(size, this.state.j * size)
        context.rotate(-(Math.PI/2) * (1 - this.state.j) * this.state.scales[0] + (Math.PI/2) * this.state.scales[1] * this.state.j)
        context.beginPath()
        context.moveTo(size * this.state.j, 0)
        context.lineTo(size, size * (1 - this.state.j))
        context.stroke()
        context.restore()
    }

    update(stopcb : Function) {
        this.state.update(stopcb)
    }

    startUpdating(startcb : Function) {
        this.state.startUpdating(startcb)
    }

    getNext(dir : number, cb : Function) {
        var curr : LRLNode = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr) {
            return curr
        }
        cb()
        return this
    }
}

class LinkedRotatingStep  {

    curr : LRLNode = new LRLNode(0)

    dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        this.curr.draw(context)
    }

    update(stopcb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            stopcb()
        })
    }

    startUpdating(startcb : Function) {
        this.curr.startUpdating(startcb)
    }
}
