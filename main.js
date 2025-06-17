// Three.js 主要变量
let scene, camera, renderer, cube;
let animationSpeed = 0.01;
let colorIndex = 0;

// 预定义的颜色数组
const colors = [
    0xff6b6b, // 红色
    0x4ecdc4, // 青绿色
    0x45b7d1, // 蓝色
    0x96ceb4, // 薄荷绿
    0xfeca57, // 黄色
    0xff9ff3, // 粉色
    0x54a0ff, // 亮蓝色
];

/**
 * 初始化Three.js场景
 */
function init() {
    // 创建场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);

    // 创建相机
    camera = new THREE.PerspectiveCamera(
        75, // 视角
        window.innerWidth / window.innerHeight, // 宽高比
        0.1, // 近裁剪面
        1000 // 远裁剪面
    );

    // 创建渲染器
    renderer = new THREE.WebGLRenderer({ 
        antialias: true, // 抗锯齿
        alpha: true // 透明背景
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true; // 启用阴影
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 将渲染器添加到DOM
    document.getElementById('container').appendChild(renderer.domElement);

    // 创建立方体几何体
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    
    // 创建材质
    const material = new THREE.MeshPhongMaterial({ 
        color: colors[colorIndex],
        shininess: 100,
        specular: 0x222222
    });

    // 创建网格对象
    cube = new THREE.Mesh(geometry, material);
    cube.castShadow = true; // 投射阴影
    cube.receiveShadow = true; // 接收阴影
    scene.add(cube);

    // 添加光源
    addLights();

    // 设置相机位置
    camera.position.z = 6;
    camera.position.y = 2;
    camera.lookAt(0, 0, 0);

    // 绑定事件监听器
    bindEvents();

    console.log('Three.js 场景初始化完成');
}

/**
 * 添加光照效果
 */
function addLights() {
    // 环境光 - 提供基础照明
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    // 方向光 - 主要光源
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    
    // 配置阴影
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 50;
    
    scene.add(directionalLight);

    // 点光源 - 增加动态效果
    const pointLight = new THREE.PointLight(0xffffff, 0.5, 10);
    pointLight.position.set(-3, 3, 3);
    scene.add(pointLight);
}

/**
 * 绑定用户交互事件
 */
function bindEvents() {
    // 窗口大小调整
    window.addEventListener('resize', onWindowResize, false);

    // 按钮事件
    document.getElementById('colorBtn').addEventListener('click', changeColor);
    document.getElementById('speedBtn').addEventListener('click', changeSpeed);
    document.getElementById('resetBtn').addEventListener('click', resetCube);

    // 鼠标交互
    document.addEventListener('mousemove', onMouseMove, false);
}

/**
 * 窗口大小调整处理
 */
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * 鼠标移动交互
 */
function onMouseMove(event) {
    // 将鼠标位置转换为归一化设备坐标
    const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // 根据鼠标位置调整相机角度
    camera.position.x = mouseX * 2;
    camera.position.y = mouseY * 2 + 2;
    camera.lookAt(0, 0, 0);
}

/**
 * 切换立方体颜色
 */
function changeColor() {
    colorIndex = (colorIndex + 1) % colors.length;
    cube.material.color.setHex(colors[colorIndex]);
    console.log(`颜色切换到: ${colors[colorIndex].toString(16)}`);
}

/**
 * 调整动画速度
 */
function changeSpeed() {
    if (animationSpeed === 0.01) {
        animationSpeed = 0.03;
    } else if (animationSpeed === 0.03) {
        animationSpeed = 0.05;
    } else {
        animationSpeed = 0.01;
    }
    console.log(`动画速度调整为: ${animationSpeed}`);
}

/**
 * 重置立方体状态
 */
function resetCube() {
    cube.rotation.x = 0;
    cube.rotation.y = 0;
    cube.rotation.z = 0;
    cube.position.set(0, 0, 0);
    cube.scale.set(1, 1, 1);
    
    colorIndex = 0;
    cube.material.color.setHex(colors[colorIndex]);
    animationSpeed = 0.01;
    
    camera.position.set(0, 2, 6);
    camera.lookAt(0, 0, 0);
    
    console.log('立方体状态已重置');
}

/**
 * 动画循环
 */
function animate() {
    requestAnimationFrame(animate);

    // 旋转立方体
    cube.rotation.x += animationSpeed;
    cube.rotation.y += animationSpeed * 1.2;

    // 添加轻微的上下浮动效果
    cube.position.y = Math.sin(Date.now() * 0.001) * 0.5;

    // 渲染场景
    renderer.render(scene, camera);
}

/**
 * 程序入口点
 */
function main() {
    console.log('Three.js Demo 启动中...');
    
    // 检查WebGL支持
    if (!window.WebGLRenderingContext) {
        alert('您的浏览器不支持WebGL，无法运行此Demo');
        return;
    }

    try {
        init();
        animate();
        console.log('Three.js Demo 运行成功！');
    } catch (error) {
        console.error('Three.js Demo 启动失败:', error);
        alert('Demo启动失败，请检查浏览器控制台了解详情');
    }
}

// 等待页面加载完成后启动
document.addEventListener('DOMContentLoaded', main);