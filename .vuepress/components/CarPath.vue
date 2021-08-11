<template>
  <div class="container">
    <canvas
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @touchstart="handleMouseDown"
      @touchmove="handleMouseMove"
      @touchend="handleMouseUp"
      ref="canvas">
    </canvas>
    <div class="btn-container">
      <p>
        <strong>原始点数：{{ points.length }} </strong>
        <strong>节流点数：{{ throttlePoints.length }}</strong>
        <strong>算法处理后点数：{{ pdpPoints.length }}</strong>
      </p>
      <button @click.stop="reset">重置（要先重置才能绘制新的轨迹）</button>
      <label for="showPoint">是否绘制点?
        <input id="showPoint" type="checkbox" v-model="showPoint" @change="update">
      </label>
      <label for="showOrigin">原始轨迹显示?
        <input id="showOrigin" type="checkbox" v-model="showOrigin" @change="update">
      </label>
      <p>
        <label for="showThrottle" :style="{ color: throttleColor }">显示节流的轨迹
          <input id="showThrottle" type="checkbox" v-model="showThrottle" @change="update">
        </label>
        <label for="throttleTime">
          节流时间(单位ms)
          <input type="number" 
            :min="10" 
            id="throttleTime" 
            v-model.number="throttleTime" 
            @change="updateThrottle"
            :step="10"
          >
        </label>
      </p>
      <p class="pdp">
        <label for="showPdp" :style="{ color: pdpColor }">Douglas-Peuker算法轨迹
          <input id="showPdp" type="checkbox" v-model="showPdp" @change="update">
        </label>
        <label for="epsilon">
          epsilon{{ epsilon }}
        </label>
        <input type="range" 
          :min="0"
          :max="30" 
          id="epsilon" 
          v-model.number="epsilon" 
          @input="update"
          :step="0.1"
        >
      </p>
    </div>
  </div>
</template>

<script>

/*
*** Ramer Douglas Peucker

The Ramer-Douglas–Peucker algorithm is an algorithm for reducing the number of points in a curve that is approximated by a series of points. 
It does so by "thinking" of a line between the first and last point in a set of points that form the curve. 
It checks which point in between is farthest away from this line. 
If the point (and as follows, all other in-between points) is closer than a given distance 'epsilon', it removes all these in-between points. 
If on the other hand this 'outlier point' is farther away from our imaginary line than epsilon, the curve is split in two parts. 
The function is recursively called on both resulting curves, and the two reduced forms of the curve are put back together.

1) From the first point up to and including the outlier
2) The outlier and the remaining points.

I hope that by looking at this source code for my Ramer Douglas Peucker implementation you will be able to get a correct reduction of your dataset.

@licence Feel free to use it as you please, a mention of my name is always nice.

Marius Karthaus
http://www.LowVoice.nl

 * 
 */

// this is the implementation with shortest Distance (as of 2013-09 suggested by the wikipedia page. Thanks Edward Lee for pointing this out)
function RDPsd(points, epsilon) {
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  if (points.length < 3) {
    return points;
  }
  let index = -1;
  let dist = 0;
  for (let i = 1; i < points.length - 1; i++) {
    let cDist = distanceFromPointToLine(points[i], firstPoint, lastPoint);

    if (cDist > dist) {
      dist = cDist;
      index = i;
    }
  }
  if (dist > epsilon) {
    // iterate
    let l1 = points.slice(0, index + 1);
    let l2 = points.slice(index);
    let r1 = RDPsd(l1, epsilon);
    let r2 = RDPsd(l2, epsilon);
    // concat r2 to r1 minus the end/startpoint that will be the same
    let rs = r1.slice(0, r1.length - 1).concat(r2);
    return rs;
  } else {
    return [firstPoint, lastPoint];
  }
}

// this is the implementation with perpendicular Distance
function RDPppd(points, epsilon) {
  let firstPoint = points[0];
  let lastPoint = points[points.length - 1];
  if (points.length < 3) {
    return points;
  }
  let index = -1;
  let dist = 0;
  for (let i = 1; i < points.length - 1; i++) {
    let cDist = findPerpendicularDistance(points[i], firstPoint, lastPoint);
    if (cDist > dist) {
      dist = cDist;
      index = i;
    }
  }
  if (dist > epsilon) {
    // iterate
    let l1 = points.slice(0, index + 1);
    let l2 = points.slice(index);
    let r1 = RDPppd(l1, epsilon);
    let r2 = RDPppd(l2, epsilon);
    // concat r2 to r1 minus the end/startpoint that will be the same
    let rs = r1.slice(0, r1.length - 1).concat(r2);
    return rs;
  } else {
    return [firstPoint, lastPoint];
  }
}

function findPerpendicularDistance(p, p1, p2) {
  // if start and end point are on the same x the distance is the difference in X.
  let result;
  let slope;
  let intercept;
  if (p1[0] == p2[0]) {
    result = Math.abs(p[0] - p1[0]);
  } else {
    slope = (p2[1] - p1[1]) / (p2[0] - p1[0]);
    intercept = p1[1] - slope * p1[0];
    result =
      Math.abs(slope * p[0] - p[1] + intercept) /
      Math.sqrt(Math.pow(slope, 2) + 1);
  }

  return result;
}

// code as suggested by Edward Lee

let distanceFromPointToLine = function (p, a, b) {
  // convert array to object to please Edwards code;
  p = { x: p[0], y: p[1] };
  a = { x: a[0], y: a[1] };
  b = { x: b[0], y: b[1] };
  return Math.sqrt(distanceFromPointToLineSquared(p, a, b));
};

//This is the difficult part. Commenting as we go.
let distanceFromPointToLineSquared = function (p, i, j) {
  let lineLength = pointDistance(i, j); //First, we need the length of the line segment.
  if (lineLength == 0) {
    //if it's 0, the line is actually just a point.
    return pointDistance(p, a);
  }
  let t = ((p.x - i.x) * (j.x - i.x) + (p.y - i.y) * (j.y - i.y)) / lineLength;

  //t is very important. t is a number that essentially compares the individual coordinates
  //distances between the point and each point on the line.

  if (t < 0) {
    //if t is less than 0, the point is behind i, and closest to i.
    return pointDistance(p, i);
  } //if greater than 1, it's closest to j.
  if (t > 1) {
    return pointDistance(p, j);
  }
  return pointDistance(p, {
    x: i.x + t * (j.x - i.x),
    y: i.y + t * (j.y - i.y),
  });
  //this figure represents the point on the line that p is closest to.
};

//just to make the code a bit cleaner.
let sqr = function (x) {
  return x * x;
};

//returns distance between two points. Easy geometry.
let pointDistance = function (i, j) {
  return sqr(i.x - j.x) + sqr(i.y - j.y);
};



// ----------------------------------------------------

const clamp = (min, max, value) => {
  if (value < min) return min
  if (value > max) return max
  return value
}

/**
 * 筛选出的点，前后的时间必须大于time
 * @param {number[][]} points
 * @param {number} time
 */
const resolveThrottle = (points, time) => {
  if (points.length === 0) return []
  const result = [points[0]]
  let lastTime = points[0][2]
  for (let i = 1; i < points.length; i++) {
    const curTime = points[i][2]
    if ((curTime - lastTime) > time || i === points.length - 1) {
      result.push(points[i])
      lastTime = curTime
    }
  }
  return result
}

import throttle from 'lodash.throttle'
export default {
  name: 'CarPath',
  data () {
    return {
      points: [],
      throttlePoints: [],
      pdpPoints: [],
      showOrigin: true,
      showPdp: false,
      showPoint: false,
      showThrottle: false,
      originColor: '#000000',
      pdpColor: '#0000ff',
      throttleColor: '#009900',
      lastX: 0,
      lastY: 0,
      isDraw: false,
      left: 0,
      top: 0,
      throttleTime: 100,
      showPoint: true,
      epsilon: 10
    }
  },
  computed: {
    /**
     * @returns { HTMLCanvasElement }
     */
    canvas () {
      return this.$refs.canvas
    },
    /**
     * @returns { CanvasRenderingContext2D }
     */
    ctx () {
      return this.canvas.getContext('2d')
    }
  },
  methods: {
    resize () {
      const rect = this.canvas.getBoundingClientRect()
      this.left = rect.left
      this.top = rect.top
      if (this.canvas.height !== rect.height) {
        this.canvas.height = rect.height
      }

      if (this.canvas.width !== rect.width) {
        this.canvas.width = rect.width
      }

      if (this.points.length > 0) {
        this.update()
      }
    },
    clearRect () {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    },
    reset () {
      this.clearRect()
      this.points = []
      this.throttlePoints = []
      this.pdpPoints = []
    },
    /**
     * @param { MouseEvent | TouchEvent } event
     */
    handleMouseDown (event) {
      if (this.points.length > 0) return
      this.isDraw = true
      this.handleEvent('down', event)
    },
    handleMouseMove (event) {
      this.handleEvent('move', event)
    },
    handleMouseUp (event) {
      this.handleEvent('up', event)
      this.isDraw = false
    },
    /**
     * @param { 'down' | 'move' | 'up' } type
     * @param { MouseEvent | TouchEvent } event
     */
    handleEvent (type, event) {
      if (this.isDraw) {
        // 越界处理
        const {
          x, y
        } = this.resolveOutRangePoints(event.clientX, event.clientY)
        this.points.push([x, y, Date.now()])

        // 添加到节流的
        this._addThrottlePoints([x, y])

        this.pdpPoints = RDPppd(this.points, this.epsilon)

        this.lastX = x
        this.lastY = y

        if (type === 'move') {
          this.clearRect()
          this.drawLine(this.points, this.originColor)
        } else if (type === 'up') {
          this.update()
        }
      }
    },
    resolveOutRangePoints (x, y) {
      const {
        width,
        height
      } = this.canvas
      x = clamp(0, width, x - this.left)
      y = clamp(0, height, y - this.top)
      return {
        x,
        y
      }
    },
    /**
     * @param { number[][] } points
     * @param { string } color
     */
    drawLine (points, color) {
      const ctx = this.ctx
      ctx.save()
      ctx.strokeStyle = color
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(points[0][0], points[0][1])
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i][0], points[i][1])
      }
      ctx.stroke()
      ctx.restore()
    },

    drawPoints (points, color) {
      if (!this.showPoint) return
      const ctx = this.ctx
      ctx.save()
      ctx.strokeStyle = color
      ctx.lineWidth = 1
      points.forEach(point => {
        ctx.beginPath()
        ctx.arc(point[0], point[1], 2, 0, Math.PI * 2)
        ctx.stroke()
      })
      ctx.restore()
    },

    drawPath (points, color) {
      if (points.length === 0) return
      this.drawLine(points, color)
      this.drawPoints(points, color)
    },

    update () {
      this.clearRect()

      if (this.showOrigin) {
        this.drawPath(this.points, this.originColor)
      }

      if (this.showThrottle) {
        this.drawPath(this.throttlePoints, this.throttleColor)
      }

      if (this.showPdp) {
        this.pdpPoints = RDPppd(this.points, this.epsilon)
        this.drawPath(this.pdpPoints, this.pdpColor)
      }
    },
    updateThrottle () {
      this._addThrottlePoints = throttle((arr) => {
        this.throttlePoints.push(arr)
      }, this.throttleTime)

      // 更新节流点
      this.throttlePoints = resolveThrottle(this.points, this.throttleTime)

      // 重新绘制
      this.update()
    }
  },
  mounted () {
    this._init = throttle(this.resize, 500)
    this.updateThrottle()
    window.addEventListener('resize', this._init)
    window.addEventListener('scroll', this._init)
    this.resize()
  },
  destroyed () {
    window.removeEventListener('resize', this._init)
    window.removeEventListener('scroll', this._init)
  }
}
</script>

<style lang="scss" scoped>
.container {
  canvas {
    border: 1px solid;
    width: 100%;
    height: 400px;
    margin: 10px auto;
    box-sizing: border-box;
  }
}

label {
  cursor: pointer;
}

.pdp {
  display: flex;

  #epsilon {
    flex: 1;
  }
}
</style>