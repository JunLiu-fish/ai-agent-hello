# Three.js 演示项目

这是一个使用Three.js创建的简单3D演示项目，展示了一个具有交互功能的旋转立方体。

## 功能特性

- 🎲 **3D旋转立方体** - 平滑的动画效果
- 🎨 **颜色切换** - 多种预设颜色可供选择
- ⚡ **速度调节** - 可调整动画播放速度
- 🔄 **重置功能** - 一键恢复初始状态
- 🖱️ **鼠标交互** - 鼠标移动控制相机视角
- 💡 **光照效果** - 环境光、方向光和点光源
- 📱 **响应式设计** - 支持移动设备

## 技术栈

- **Three.js** - 3D图形渲染库
- **HTML5** - 页面结构
- **CSS3** - 现代样式设计
- **JavaScript ES6+** - 交互逻辑

## 快速开始

### 方法1: 直接打开 (推荐)
```bash
# 使用Python内置服务器
python3 -m http.server 8000

# 或使用Node.js serve工具
npx serve .

# 或使用live-server (支持热重载)
npx live-server .
```

### 方法2: 浏览器直接打开
由于使用了CDN引入Three.js，可以直接在浏览器中打开 `index.html` 文件。

## 项目结构

```
threejs-demo/
├── index.html      # 主HTML文件
├── style.css       # 样式文件
├── main.js         # Three.js逻辑
├── package.json    # 项目配置
└── README.md       # 项目说明
```

## 核心代码说明

### 1. 场景初始化
```javascript
// 创建场景、相机和渲染器
scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
```

### 2. 立方体创建
```javascript
// 几何体、材质和网格
const geometry = new THREE.BoxGeometry(2, 2, 2);
const material = new THREE.MeshPhongMaterial({ color: colors[colorIndex] });
cube = new THREE.Mesh(geometry, material);
```

### 3. 光照系统
- **环境光**: 提供基础照明
- **方向光**: 主要光源，支持阴影
- **点光源**: 增加动态效果

### 4. 交互功能
- 颜色切换按钮
- 速度调节按钮
- 重置功能
- 鼠标视角控制

## 浏览器兼容性

- Chrome 51+
- Firefox 54+
- Safari 10+
- Edge 79+

需要支持WebGL的现代浏览器。

## 扩展建议

1. **添加更多几何体** - 球体、圆锥体等
2. **材质变化** - 纹理贴图、法线贴图
3. **动画效果** - 更复杂的运动轨迹
4. **后处理效果** - 辉光、景深等
5. **物理引擎** - 集成Cannon.js或Ammo.js

## 许可证

MIT License - 可自由使用和修改。