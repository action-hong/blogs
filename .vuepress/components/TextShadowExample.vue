<template>
  <div class="container">
    <template v-if="type === 0">
      <p :style="customStyle">{{ text }}</p>
      <label for="offsetPx">偏移像素: {{ offset }}px</label><input id="offsetPx" v-model="offset" type="range" min="1" max="10"/>
      <br />
      <label for="blueRaidus">模糊半径: {{ blur }}px</label><input id="blueRaidus" v-model="blur" type="range" min="1" max="10" />
    </template>
    <template v-else-if="type === 1">
      <p class="text-stroke">
        <span>{{ text }}</span>
        <span>{{ text }}</span>
      </p>
    </template>
    <template v-else-if="type === 2">
      <label for="lineJoin">stroke-linejoin: </label>
      <select id="lineJoin" v-model="lineJoin">
        <option
          v-for="item in lineJoins"
          :key="item">
          {{ item }}
        </option>
      </select>
      <svg viewBox="0 0 100 50">
        <rect width="100" height="100" fill="black" />
        <text x="50" y="30" class="bg" :stroke-linejoin="lineJoin">{{ text }}</text>
        <text x="50" y="30" class="text" fill="#ff0000">{{ text }}</text>
      </svg>
    </template>
  </div>
</template>

<script>
export default {
  name: 'TextShadowExample',
  props: {
    type: {
      default: 0,
      type: Number
    }
  },
  data () {
    return {
      offset: 8,
      blur: 9,
      text: '你好呀，嘻嘻',
      lineJoin: 'round',
      lineJoins: [
        'arcs', 'bevel', 'miter', 'miter-clip', 'round'
      ]
    }
  },
  computed: {
    customStyle () {
      const {
        offset,
        blur
      } = this
      return {
        'text-shadow': `${offset}px 0 ${blur}px #ffffff,-${offset}px 0 ${blur}px #ffffff,0 ${offset}px ${blur}px #ffffff,0 -${offset}px ${blur}px #ffffff`,
        color: 'skyblue'
      }
    }
  }
}
</script>

<style scoped lang="less">
.container {
  background: #000000;
  text-align: center;
  color: #fff;
  padding: 20px;
  margin: 20px 0;

}
.container p {
  color: #ff0000;
  font-size: 2em;
}

.text-stroke {
  position: relative;
  margin-bottom: 0;
  display: inline-block;

  span {
    position: relative;

    &:first-child {
      -webkit-text-stroke: 10px #fff;
      position: absolute;
      left: 0;
      top: 0;
    }
  }
}

svg {

  margin-top: 20px;
  width: 100%;
  height: 50px;

  text {
    text-anchor: start;
    font-size: 2em;
    text-anchor: middle;
  }

  text.bg {
    stroke: #ffffff; 
    stroke-width: 10px;
  }

  text.text {
    fill: #ff0000;
    font-weight: bold;
  }
}

</style>