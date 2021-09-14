<template>
  <div class=''>
    <img
      ref="avatar"
      :src="$withBase('/img/action-hong.png')"
      @load="loadAvatar"
      alt=""
    >
    <p>例如你可以将上面的图片进行上传后，就会得到如下效果</p>
    <p>
      <input
        type="file"
        accept="image/*"
      >
      <button @click="download">下载</button>
    </p>
    <canvas
      width="420"
      height="420"
    ></canvas>
    <p>
      <label for="roughness">roughness: {{ option.roughness }}</label>
    </p>
    <p>
      <input
        id="roughness"
        type="range"
        :min="0"
        :max="10"
        :step="0.1"
        v-model.number="option.roughness"
      >
    </p>
    <p>
      <label for="bowing">bowing: {{ option.bowing }}</label>
    </p>
    <p>
      <input
        id="bowing"
        type="range"
        :min="0"
        :max="10"
        :step="0.5"
        v-model.number="option.bowing"
      >
    </p>
    <p>
      <label for="seed">seed: </label>
      <input
        id="seed"
        type="number"
        :min="0"
        v-model.number="option.seed"
      >
    </p>
    <p>
      <label for="stroke">stroke: </label>
      <input
        id="stroke"
        type="color"
        v-model.number="option.stroke"
      >
    </p>
    <p>
      <label for="strokeWidth">strokeWidth: </label>
      <input
        id="strokeWidth"
        type="number"
        :min="0"
        v-model.number="option.strokeWidth"
      >
    </p>
    <p>
      <label for="fill">fill: </label>
      <input
        id="fill"
        type="color"
        v-model.number="option.fill"
      >
      <label for="useFill">使用该颜色填充</label>
      <input
        type="checkbox"
        id="useFill"
        v-model="option.useFill"
      >
    </p>
    <p>
      <label for="fillStyle">fillStyle: </label>
      <select
        id="fillStyle"
        v-model="option.fillStyle"
      >
        <option
          v-for="item in fillStyleOptions"
          :key="item"
          :value="item"
        >
          {{ item }}
        </option>
      </select>
    </p>
    <p>
      <label for="fillWeight">fillWeight: </label>
      <input
        id="fillWeight"
        type="number"
        :min="0"
        v-model.number="option.fillWeight"
      >
    </p>
    <p>
      <label for="hachureAngle">hachureAngle: </label>
      <input
        id="hachureAngle"
        type="number"
        :min="-180"
        :max="180"
        v-model.number="option.hachureAngle"
      >
    </p>
    <p>
      <label for="hachureGap">hachureGap: </label>
      <input
        id="hachureGap"
        type="number"
        :min="1"
        v-model.number="option.hachureGap"
      >
    </p>
  </div>
</template>

<script>
// https://github.com/rough-stuff/rough/issues/99#issuecomment-652814597
import rough from 'roughjs/bundled/rough.esm'
let fileInput;
let canvas;
let ctx;

function toHex(colors) {
  return (
    "#" + colors.map((value) => `0${value.toString(16)}`.slice(-2)).join("")
  );
}

function readAvatar(option) {
  // 总共读取12 * 12个点的像素的颜色
  const data = imageData.data;
  colors = [];

  // 总共这么多个点
  const col = canvas.width;
  const row = canvas.height;

  for (let i = 0; i < data.length; i += 4) {
    colors.push(toHex([...data.slice(i, i + 3)]));
  }

  console.time("find");
  // O(N)
  points = findColorArea(colors, row, col);
  console.timeEnd("find");
  console.time("get points");
  // 时间O(N) 空间O(N)
  getAvatarPoints(points);
  console.timeEnd("get points");
  drawRoughAvatar(points, option);
  console.log(points);
}

// 获取有颜色的区域
/**
 *
 * @param {string[]} colors
 */
function findColorArea(colors, row, col) {
  const flag = new Array(colors.length).fill(false);
  const points = [];

  function toPoint(index) {
    return [index % col, Math.floor(index / row)];
  }

  // O(1)
  function checkValid(index) {
    return (
      colors[index] !== bg &&
      !flag[index] &&
      index >= 0 &&
      index < colors.length
    );
  }

  function bfs(i, ps) {
    // 改成bfs
    const q = [i];
    while (q.length > 0) {
      const index = q.shift();
      if (!flag[index]) {
        ps.push(toPoint(index));
        flag[index] = true;

        if (index % col < col - 1 && checkValid(index + 1)) q.push(index + 1);
        if (checkValid(index + col)) q.push(index + col);
        if (checkValid(index - col)) q.push(index - col);
        if (index % col > 0 && checkValid(index - 1)) q.push(index - 1);
      }
    }
  }

  for (let i = 0; i < colors.length; i++) {
    if (checkValid(i)) {
      const ps = [];
      bfs(i, ps);
      points.push({
        ps,
        fill: colors[i],
      });
    }
  }

  return points;
}

/**
 *
 * @param {Array<{ ps: [number, number][], fill: string }>} points
 */
function getAvatarPoints(points) {
  for (let i = 0; i < points.length; i++) {
    // 将这一块所有小正方形的四个点全部加进去，注意避免重复
    // 其实重复也不要紧
    const arr = points[i].ps;
    const pointFlag = {};
    const len = arr.length;
    for (let i = 0; i < len; i++) {
      const [x, y] = arr[i];
      const need = [
        [x, y],
        [x + 1, y],
        [x + 1, y + 1],
        [x, y + 1],
      ];

      // 每个小正方形的点就加上, 同时注意重复
      need.forEach((p) => {
        // if (!arr.find((item) => isPointEqual(p, item))) {
        //   arr.push(p);
        // }
        const key = `${p[0]}-${p[1]}`;
        if (!pointFlag[key]) {
          pointFlag[key] = true;
        }
      });
    }

    // 从首个点开始向右（首个点必然是最靠上或靠左的点）
    // 寻找最外圈
    const ps = [];
    let p = arr[0];
    let dir = "right";
    ps.push(p);

    // 下面是搜索策略，向右方向搜索的话，必然是先找上，再找右，再找下
    // 不同方向，优先查找的点各不相同
    const map = {
      left: {
        func: ([x, y]) => [x - 1, y],
        sort: ["bottom", "left", "top"],
      },
      right: {
        func: ([x, y]) => [x + 1, y],
        sort: ["top", "right", "bottom"],
      },
      top: {
        func: ([x, y]) => [x, y - 1],
        sort: ["left", "top", "right"],
      },
      bottom: {
        func: ([x, y]) => [x, y + 1],
        sort: ["right", "bottom", "left"],
      },
    };

    do {
      const sort = map[dir].sort;
      inner: for (let i = 0; i < sort.length; i++) {
        const tempDir = sort[i];
        const next = map[tempDir].func(p);
        if (pointFlag[`${next[0]}-${next[1]}`]) {
          if (tempDir === dir) {
            // 方向相同，继续
            p = next;
          } else {
            // 方向变了, 刚刚的p就是最后一个点
            ps.push(p);
            p = next;
            // 新的点也要加进来
            ps.push(p);
          }
          dir = tempDir;
          break inner;
        }
      }
    } while (!isPointEqual(p, arr[0]));

    points[i].ps = ps;
  }
}

function isPointEqual(arr, arr2) {
  return arr[0] === arr2[0] && arr[1] === arr2[1];
}

function drawRoughAvatar(points, option) {
  if (points.length === 0) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const rc = rough.canvas(canvas);
  for (let i = 0; i < points.length; i++) {
    const { ps, fill } = points[i];
    rc.polygon(ps, {
      ...option,
      fill: option.useFill ? option.fill : fill,
    });
  }
}

const bg = "#f0f0f0";
let imageData = null;
let colors = [];
let points = [];
let color = "";
export default {
  data() {
    return {
      filename: "",
      option: {
        roughness: 1,
        bowing: 1,
        seed: 0,
        stroke: "#000000",
        strokeWidth: 1,
        fill: "#00ff00",
        useFill: false,
        fillStyle: "hachure",
        fillWeight: 0.5,
        hachureAngle: -41,
        hachureGap: 4,
      },
      fillStyleOptions: [
        "hachure",
        "solid",
        "zigzag",
        "cross-hatch",
        "dots",
        "dashed",
        "zigzag-line",
      ],
    };
  },
  mounted() {
    fileInput = document.querySelector('input[type="file"]');
    canvas = document.querySelector("canvas");
    ctx = canvas.getContext("2d");
    fileInput.addEventListener("input", (e) => {
      const file = e.target.files[0];
      this.filename = file.name;
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          readAvatar(this.option);
        };
      };
    });
  },
  methods: {
    loadAvatar() {
      const img = this.$refs.avatar;
      ctx.drawImage(img, 0, 0);
      imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      readAvatar(this.option);
    },
    download() {
      if (points.length === 0) return;
      const url = canvas.toDataURL("image/png");
      const oA = document.createElement("a");
      oA.download = "rough-" + this.filename;
      oA.href = url;
      document.body.appendChild(oA);
      oA.click();
      oA.remove();
    },
  },
  watch: {
    option: {
      deep: true,
      handler: function (val) {
        drawRoughAvatar(points, val);
      },
    },
  },
};
</script>
<style lang='scss' scoped>
//@import url(); 引入公共css类
canvas {
  border: 1px solid #888;
}
</style>